import { db } from "@itcom/db/client";
import {
	settlementTasks,
	userSettlements,
	userTaskCompletions,
} from "@itcom/db/schema";
import { and, eq } from "drizzle-orm";
import { settlementTaskSeeds } from "../data/tasks";

export type TimePhase =
	| "before_arrival"
	| "first_week"
	| "first_month"
	| "first_3_months";

export interface TaskWithCompletion {
	id: string;
	slug: string;
	titleKo: string;
	titleJa: string;
	instructionsKo: string;
	instructionsJa: string;
	requiredDocuments: string[];
	estimatedMinutes: number;
	category: string;
	timePhase: TimePhase;
	deadlineType: string;
	deadlineDays: number | null;
	tips: string | null;
	officialUrl: string | null;
	formTemplateUrl: string | null;
	orderIndex: number;
	isCompleted: boolean;
	completedAt: Date | null;
}

export const settlementService = {
	/**
	 * Initialize seed data if not exists
	 */
	async seedTasks(): Promise<void> {
		const existing = await db.select().from(settlementTasks).limit(1);
		if (existing.length > 0) return;

		await db.insert(settlementTasks).values(
			settlementTaskSeeds.map((task) => ({
				slug: task.slug,
				titleKo: task.titleKo,
				titleJa: task.titleJa,
				instructionsKo: task.instructionsKo,
				instructionsJa: task.instructionsJa,
				requiredDocuments: task.requiredDocuments,
				estimatedMinutes: task.estimatedMinutes,
				category: task.category,
				timePhase: task.timePhase,
				deadlineType: task.deadlineType,
				deadlineDays: task.deadlineDays,
				tips: task.tips,
				officialUrl: task.officialUrl,
				orderIndex: task.orderIndex,
			})),
		);
	},

	/**
	 * Get all tasks with user completion status
	 */
	async getTasksWithCompletion(userId: string): Promise<TaskWithCompletion[]> {
		// Ensure tasks are seeded
		await this.seedTasks();

		const allTasks = await db
			.select()
			.from(settlementTasks)
			.orderBy(settlementTasks.orderIndex);

		const completions = await db
			.select()
			.from(userTaskCompletions)
			.where(eq(userTaskCompletions.userId, userId));

		const completedTaskIds = new Set(completions.map((c) => c.taskId));

		return allTasks.map((task) => {
			const completion = completions.find((c) => c.taskId === task.id);
			return {
				id: task.id,
				slug: task.slug,
				titleKo: task.titleKo,
				titleJa: task.titleJa,
				instructionsKo: task.instructionsKo,
				instructionsJa: task.instructionsJa,
				requiredDocuments: (task.requiredDocuments as string[]) || [],
				estimatedMinutes: task.estimatedMinutes ?? 60,
				category: task.category,
				timePhase: task.timePhase as TimePhase,
				deadlineType: task.deadlineType,
				deadlineDays: task.deadlineDays,
				tips: task.tips,
				officialUrl: task.officialUrl,
				formTemplateUrl: task.formTemplateUrl,
				orderIndex: task.orderIndex,
				isCompleted: completedTaskIds.has(task.id),
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
	async getProgress(userId: string): Promise<{
		total: number;
		completed: number;
		percentage: number;
		byPhase: Record<TimePhase, { total: number; completed: number }>;
	}> {
		const tasks = await this.getTasksWithCompletion(userId);

		const total = tasks.length;
		const completed = tasks.filter((t) => t.isCompleted).length;

		const phases: TimePhase[] = [
			"before_arrival",
			"first_week",
			"first_month",
			"first_3_months",
		];
		const byPhase = phases.reduce(
			(acc, phase) => {
				const phaseTasks = tasks.filter((t) => t.timePhase === phase);
				acc[phase] = {
					total: phaseTasks.length,
					completed: phaseTasks.filter((t) => t.isCompleted).length,
				};
				return acc;
			},
			{} as Record<TimePhase, { total: number; completed: number }>,
		);

		return {
			total,
			completed,
			percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
			byPhase,
		};
	},
};
