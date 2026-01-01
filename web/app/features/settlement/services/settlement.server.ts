import { db } from "@itcom/db/client";
import {
	settlementCategories,
	settlementPhases,
	settlementReviews,
	settlementSubscriptions,
	settlementTaskTemplates,
	settlementTemplates,
	userSettlements,
	userTaskCompletions,
} from "@itcom/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import { settlementTaskSeeds } from "../data/tasks";
export interface TaskWithCompletion {
	id: string;
	slug: string;
	templateId: string;
	templateTitle: string;

	titleKo: string;
	titleJa: string;
	instructionsKo: string;
	instructionsJa: string;

	// Fallback/Generic
	title: string;
	description: string;

	requiredDocuments: string[];
	estimatedMinutes: number;
	category: string;
	// timePhase removed - use timingRule and DB phases

	deadlineType: "relative"; // Simplified to just relative
	deadlineDays: number | null;
	phaseId?: string | null;
	dayOffset: number | null; // Added

	tips: string | null;
	officialUrl: string | null;
	formTemplateUrl: string | null;
	orderIndex: number;
	isCompleted: boolean;
	completedAt: Date | null;
}

export const settlementService = {
	/**
	 * Initialize seed data if not exists (Official Template & Tasks)
	 */
	async seedTasks(): Promise<void> {
		const officialTemplate = await db.query.settlementTemplates.findFirst({
			where: eq(settlementTemplates.isOfficial, true),
		});

		if (officialTemplate) return;

		// Create Official Template
		const [newTemplate] = await db
			.insert(settlementTemplates)
			.values({
				title: "Tokyo Settlement Guide (Official)",
				description: "The essential guide for settling in Tokyo.",
				isOfficial: true,
				status: "published",
				tags: ["official", "tokyo", "basic"],
			})
			.returning();

		// Create Tasks
		await db.insert(settlementTaskTemplates).values(
			settlementTaskSeeds.map((task) => ({
				templateId: newTemplate.id,
				slug: task.slug,
				titleKo: task.titleKo,
				titleJa: task.titleJa,
				instructionsKo: task.instructionsKo,
				instructionsJa: task.instructionsJa,

				// Fill generic fields for compatibility
				title: task.titleKo,
				description: task.instructionsKo,

				requiredDocuments: task.requiredDocuments,
				estimatedMinutes: task.estimatedMinutes,
				category: task.category,

				timePhase: task.timePhase,
				dayOffset: task.deadlineDays ?? 0,

				tips: task.tips,
				officialUrl: task.officialUrl,
				orderIndex: task.orderIndex,
			})),
		);
	},

	/**
	 * Subscribe user to a template
	 */
	async subscribe(userId: string, templateId: string): Promise<void> {
		await db
			.insert(settlementSubscriptions)
			.values({
				userId,
				templateId,
				isActive: true,
			})

			.onConflictDoNothing();
	},

	async isEquipped(userId: string, templateId: string): Promise<boolean> {
		const existing = await db.query.settlementSubscriptions.findFirst({
			where: and(
				eq(settlementSubscriptions.userId, userId),
				eq(settlementSubscriptions.templateId, templateId),
				eq(settlementSubscriptions.isActive, true),
			),
		});
		return !!existing;
	},

	async getTemplate(templateId: string) {
		// Fetch template only, avoid complex joins if causing issues
		return await db.query.settlementTemplates.findFirst({
			where: eq(settlementTemplates.id, templateId),
			// Removing 'with' author/tasks to prevent "lateral join" errors on some setups
			// We will fetch tasks separately
		});
	},

	async getTasksByTemplate(templateId: string) {
		return await db.query.settlementTaskTemplates.findMany({
			where: eq(settlementTaskTemplates.templateId, templateId),
			orderBy: (t, { asc }) => [asc(t.orderIndex)],
			// We can try to join phase here, if it fails we fall back to manual ID mapping
			with: {
				phase: true,
			},
		});
	},

	/**
	 * Get all published templates
	 */
	async getPhases() {
		return db.query.settlementPhases.findMany({
			orderBy: [asc(settlementPhases.orderIndex)],
		});
	},

	async getCategories() {
		return db.query.settlementCategories.findMany({
			orderBy: [asc(settlementCategories.orderIndex)],
		});
	},

	async getTemplates(filters?: {
		targetVisa?: string;
		familyStatus?: string;
		region?: string;
		authorId?: string; // Optional author filter
	}) {
		const conditions = [eq(settlementTemplates.status, "published")];

		if (filters?.targetVisa) {
			conditions.push(eq(settlementTemplates.targetVisa, filters.targetVisa));
		}
		if (filters?.familyStatus) {
			conditions.push(
				eq(settlementTemplates.familyStatus, filters.familyStatus),
			);
		}
		if (filters?.region) {
			conditions.push(eq(settlementTemplates.region, filters.region));
		}
		if (filters?.authorId) {
			conditions.push(eq(settlementTemplates.authorId, filters.authorId));
		}

		return await db.query.settlementTemplates.findMany({
			where: and(...conditions),
			with: {
				author: true,
			},
			orderBy: (t, { desc }) => [desc(t.createdAt)],
		});
	},

	async getMyTemplates(userId: string) {
		return await db.query.settlementTemplates.findMany({
			where: eq(settlementTemplates.authorId, userId),
			with: {
				author: true,
			},
			orderBy: (t, { desc }) => [desc(t.createdAt)],
		});
	},

	async updateTemplateStatus(
		templateId: string,
		userId: string,
		status: "draft" | "published" | "archived",
	) {
		const [updated] = await db
			.update(settlementTemplates)
			.set({ status })
			.where(
				and(
					eq(settlementTemplates.id, templateId),
					eq(settlementTemplates.authorId, userId), // Author check
				),
			)
			.returning();
		return updated;
	},

	async deleteTemplate(templateId: string, userId: string) {
		const [deleted] = await db
			.delete(settlementTemplates)
			.where(
				and(
					eq(settlementTemplates.id, templateId),
					eq(settlementTemplates.authorId, userId), // Author check
				),
			)
			.returning();
		return deleted;
	},

	async getSubscriptions(userId: string) {
		return await db.query.settlementSubscriptions.findMany({
			where: and(
				eq(settlementSubscriptions.userId, userId),
				eq(settlementSubscriptions.isActive, true),
			),
			with: {
				template: true,
			},
		});
	},

	/**
	 * Get all tasks from user's active subscriptions
	 */
	async getTasksWithCompletion(userId: string): Promise<TaskWithCompletion[]> {
		await this.seedTasks();

		// 1. Get Active Subscriptions
		const subscriptions = await db.query.settlementSubscriptions.findMany({
			where: and(
				eq(settlementSubscriptions.userId, userId),
				eq(settlementSubscriptions.isActive, true),
			),
			with: {
				template: true,
			},
		});

		// 2. If no subscriptions, auto-subscribe to Official
		let activeTemplateIds: string[] = [];
		if (subscriptions.length === 0) {
			const officialTemplate = await db.query.settlementTemplates.findFirst({
				where: eq(settlementTemplates.isOfficial, true),
			});
			if (officialTemplate) {
				await this.subscribe(userId, officialTemplate.id);
				activeTemplateIds = [officialTemplate.id];
			}
		} else {
			activeTemplateIds = subscriptions.map((s) => s.templateId);
		}

		if (activeTemplateIds.length === 0) return [];

		// 3. Fetch Tasks from Templates
		const tasks = await db.query.settlementTaskTemplates.findMany({
			where: inArray(settlementTaskTemplates.templateId, activeTemplateIds),
			with: {
				template: true,
			},
			orderBy: (t, { asc }) => [asc(t.orderIndex)],
		});

		// 4. Fetch Completions
		const completions = await db
			.select()
			.from(userTaskCompletions)
			.where(eq(userTaskCompletions.userId, userId));

		const completionMap = new Map(completions.map((c) => [c.taskId, c]));

		// 5. Merge
		return tasks.map((task) => {
			const completion = completionMap.get(task.id);
			return {
				id: task.id,
				slug: task.slug ?? task.id,
				templateId: task.templateId,
				templateTitle: task.template.title,

				titleKo: task.titleKo ?? task.title ?? "제목 없음",
				titleJa: task.titleJa ?? task.title ?? "No Title",
				instructionsKo: task.instructionsKo ?? task.description ?? "",
				instructionsJa: task.instructionsJa ?? task.description ?? "",

				title: task.title ?? "Untitled",
				description: task.description ?? "",

				requiredDocuments: (task.requiredDocuments as string[]) || [],
				estimatedMinutes: task.estimatedMinutes ?? 60,
				category: task.category,
				// timePhase removed

				deadlineType: "relative",
				deadlineDays: task.dayOffset,
				phaseId: task.phaseId,
				dayOffset: task.dayOffset,

				tips: task.tips,
				officialUrl: task.officialUrl,
				formTemplateUrl: task.formTemplateUrl,
				orderIndex: task.orderIndex,

				isCompleted: !!completion,
				completedAt: completion?.completedAt ?? null,
			};
		});
	},

	/**
	 * Get user's settlement profile (arrival date)
	 */
	async getUserSettlement(userId: string) {
		const settlement = await db.query.userSettlements.findFirst({
			where: eq(userSettlements.userId, userId),
		});
		return settlement;
	},

	/**
	 * Set or update arrival date
	 */
	async setArrivalDate(userId: string, arrivalDate: Date) {
		const existing = await this.getUserSettlement(userId);

		if (existing) {
			await db
				.update(userSettlements)
				.set({ arrivalDate, updatedAt: new Date() })
				.where(eq(userSettlements.userId, userId));
		} else {
			await db.insert(userSettlements).values({
				userId,
				arrivalDate,
			});
		}
	},

	/**
	 * Toggle task completion
	 */
	async toggleTask(userId: string, taskId: string): Promise<boolean> {
		const existing = await db.query.userTaskCompletions.findFirst({
			where: and(
				eq(userTaskCompletions.userId, userId),
				eq(userTaskCompletions.taskId, taskId),
			),
		});

		if (existing) {
			// Un-complete
			await db
				.delete(userTaskCompletions)
				.where(
					and(
						eq(userTaskCompletions.userId, userId),
						eq(userTaskCompletions.taskId, taskId),
					),
				);
			return false;
		}
		// Complete
		await db.insert(userTaskCompletions).values({
			userId,
			taskId,
		});
		return true;
	},

	/**
	 * Calculate progress stats
	 */
	/**
	 * Calculate progress stats
	 */
	async getProgress(userId: string) {
		const tasks = await this.getTasksWithCompletion(userId);

		const total = tasks.length;
		const completed = tasks.filter((t) => t.isCompleted).length;

		// Fetch dynamic phases
		const phases = await this.getPhases();

		const byPhase: Record<
			string,
			{ total: number; completed: number; title: string }
		> = {};

		// Initialize buckets
		for (const p of phases) {
			byPhase[p.id] = { total: 0, completed: 0, title: p.titleKo || p.title };
		}
		// Fallback bucket
		// byPhase["other"] = { total: 0, completed: 0, title: "기타" };

		for (const task of tasks) {
			const days = task.dayOffset ?? 0;
			for (const p of phases) {
				if (days >= p.minDays && days <= p.maxDays) {
					byPhase[p.id].total++;
					if (task.isCompleted) byPhase[p.id].completed++;
					break;
				}
			}
			// If needed handle unmatched
		}

		return {
			total,
			completed,
			percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
			byPhase,
		};
	},

	async addReview(
		userId: string,
		templateId: string,
		rating: number,
		comment: string,
	) {
		// Use upsert to handle both add and update in one go if collision occurs,
		// but for now let's keep add separate primarily.
		// Actually, let's check strict uniqueness on the schema side manually or just simple insert.
		// Given the unique constraint usually exists (userId, templateId), we can use onConflictDoUpdate.
		await db
			.insert(settlementReviews)
			.values({
				userId,
				templateId,
				rating,
				comment,
			})
			.onConflictDoUpdate({
				target: [settlementReviews.userId, settlementReviews.templateId],
				set: { rating, comment, updatedAt: new Date() },
			});
	},

	async deleteReview(userId: string, templateId: string) {
		await db
			.delete(settlementReviews)
			.where(
				and(
					eq(settlementReviews.userId, userId),
					eq(settlementReviews.templateId, templateId),
				),
			);
	},

	async getReviews(templateId: string) {
		return await db.query.settlementReviews.findMany({
			where: eq(settlementReviews.templateId, templateId),
			with: {
				author: true,
			},
			orderBy: (r, { desc }) => [desc(r.createdAt)],
		});
	},

	groupTasksByPhase(
		tasks: (TaskWithCompletion | typeof settlementTaskTemplates.$inferSelect)[],
		phases: (typeof settlementPhases.$inferSelect)[],
	) {
		// Sort phases by orderIndex
		const sortedPhases = [...phases].sort(
			(a, b) => a.orderIndex - b.orderIndex,
		);

		const grouped = sortedPhases.map((phase) => ({
			...phase,
			tasks: [] as typeof tasks,
		}));

		for (const task of tasks) {
			let placed = false;

			// 1. Explicit Phase ID
			if (task.phaseId) {
				const phase = grouped.find((p) => p.id === task.phaseId);
				if (phase) {
					phase.tasks.push(task);
					continue;
				}
			}

			// 2. Fallback: Timing Rule
			const days = task.dayOffset ?? 0;

			// If dayOffset is null, fallback to phase min days or 0?
			// For now let's assume 0 if null.

			for (const phase of grouped) {
				if (days >= phase.minDays && days <= phase.maxDays) {
					phase.tasks.push(task);
					placed = true;
					break;
				}
			}

			if (!placed) {
				grouped[grouped.length - 1].tasks.push(task);
			}
		}

		return grouped.filter((g) => g.tasks.length > 0);
	},
};
