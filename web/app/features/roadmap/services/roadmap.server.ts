import { eq, and, inArray, isNull, or } from "drizzle-orm";
import { db } from "@itcom/db/client";
import {
	roadmapTemplates,
	roadmapTasks,
	userRoadmaps,
	profiles,
	type RoadmapTask,
	type RoadmapTemplate,
	type InsertRoadmapTask,
} from "@itcom/db/schema";

export type KanbanColumn = "todo" | "in_progress" | "completed";
export type RoadmapCategory =
	| "Learning"
	| "Application"
	| "Preparation"
	| "Settlement";

export interface RoadmapProgress {
	total: number;
	completed: number;
	percent: number;
	byCategory: Record<
		RoadmapCategory,
		{ total: number; completed: number; percent: number }
	>;
}

export interface RoadmapWithTasks {
	roadmap: typeof userRoadmaps.$inferSelect | null;
	tasks: RoadmapTask[];
	progress: RoadmapProgress;
}

/**
 * Check if user already has a roadmap
 */
export async function hasRoadmap(userId: string): Promise<boolean> {
	const existing = await db.query.userRoadmaps.findFirst({
		where: eq(userRoadmaps.userId, userId),
	});
	return existing !== undefined;
}

/**
 * Get user's profile for template matching
 */
export async function getUserProfile(userId: string) {
	return db.query.profiles.findFirst({
		where: eq(profiles.userId, userId),
	});
}

/**
 * Get templates matching user's profile
 */
export async function getMatchingTemplates(
	profile: typeof profiles.$inferSelect,
): Promise<RoadmapTemplate[]> {
	const allTemplates = await db.query.roadmapTemplates.findMany({
		where: eq(roadmapTemplates.isActive, true),
		orderBy: (t, { asc }) => [asc(t.orderIndex)],
	});

	return allTemplates.filter((template) => {
		// Check job family
		if (
			template.targetJobFamilies &&
			!template.targetJobFamilies.includes(profile.jobFamily)
		) {
			return false;
		}

		// Check level
		if (template.targetLevels && !template.targetLevels.includes(profile.level)) {
			return false;
		}

		// Check JP level
		if (
			template.targetJpLevels &&
			!template.targetJpLevels.includes(profile.jpLevel)
		) {
			return false;
		}

		// Check city
		if (
			template.targetCities &&
			profile.targetCity &&
			!template.targetCities.includes(profile.targetCity)
		) {
			return false;
		}

		return true;
	});
}

/**
 * Generate roadmap for user
 */
export async function generateRoadmap(
	userId: string,
): Promise<RoadmapWithTasks> {
	// Check if already has roadmap
	const existing = await hasRoadmap(userId);
	if (existing) {
		return getRoadmap(userId);
	}

	// Get user profile
	const profile = await getUserProfile(userId);
	if (!profile) {
		throw new Error("User profile not found. Complete diagnosis first.");
	}

	// Get matching templates
	const templates = await getMatchingTemplates(profile);

	// Create tasks from templates
	const taskInserts: InsertRoadmapTask[] = templates.map((template, index) => ({
		userId,
		templateId: template.id,
		title: template.title,
		description: template.description,
		category: template.category,
		estimatedMinutes: template.estimatedMinutes,
		priority: template.priority,
		orderIndex: index + 1,
		kanbanColumn: "todo" as KanbanColumn,
		isCustom: false,
	}));

	// Insert tasks
	await db.insert(roadmapTasks).values(taskInserts);

	// Create user roadmap entry
	await db.insert(userRoadmaps).values({
		userId,
		totalTasks: taskInserts.length,
		completedTasks: 0,
		currentMilestone: "started",
	});

	return getRoadmap(userId);
}

/**
 * Get user's roadmap with tasks and progress
 */
export async function getRoadmap(userId: string): Promise<RoadmapWithTasks> {
	const roadmap = await db.query.userRoadmaps.findFirst({
		where: eq(userRoadmaps.userId, userId),
	});

	const tasks = await db.query.roadmapTasks.findMany({
		where: eq(roadmapTasks.userId, userId),
		orderBy: (t, { asc }) => [asc(t.orderIndex)],
	});

	const progress = calculateProgress(tasks);

	return { roadmap: roadmap ?? null, tasks, progress };
}

/**
 * Calculate progress statistics
 */
function calculateProgress(tasks: RoadmapTask[]): RoadmapProgress {
	const categories: RoadmapCategory[] = [
		"Learning",
		"Application",
		"Preparation",
		"Settlement",
	];

	const byCategory = {} as Record<
		RoadmapCategory,
		{ total: number; completed: number; percent: number }
	>;

	for (const cat of categories) {
		const catTasks = tasks.filter((t) => t.category === cat);
		const completed = catTasks.filter(
			(t) => t.kanbanColumn === "completed",
		).length;
		byCategory[cat] = {
			total: catTasks.length,
			completed,
			percent: catTasks.length > 0 ? Math.round((completed / catTasks.length) * 100) : 0,
		};
	}

	const total = tasks.length;
	const completed = tasks.filter((t) => t.kanbanColumn === "completed").length;

	return {
		total,
		completed,
		percent: total > 0 ? Math.round((completed / total) * 100) : 0,
		byCategory,
	};
}

/**
 * Update task column (drag-and-drop)
 */
export async function updateTaskColumn(
	taskId: string,
	userId: string,
	column: KanbanColumn,
): Promise<RoadmapTask> {
	const now = new Date();

	const [updated] = await db
		.update(roadmapTasks)
		.set({
			kanbanColumn: column,
			completedAt: column === "completed" ? now : null,
			updatedAt: now,
		})
		.where(and(eq(roadmapTasks.id, taskId), eq(roadmapTasks.userId, userId)))
		.returning();

	if (!updated) {
		throw new Error("Task not found or not authorized");
	}

	// Update user roadmap progress
	await syncRoadmapProgress(userId);

	return updated;
}

/**
 * Sync roadmap progress after task update
 */
async function syncRoadmapProgress(userId: string): Promise<void> {
	const tasks = await db.query.roadmapTasks.findMany({
		where: eq(roadmapTasks.userId, userId),
	});

	const total = tasks.length;
	const completed = tasks.filter((t) => t.kanbanColumn === "completed").length;

	await db
		.update(userRoadmaps)
		.set({
			totalTasks: total,
			completedTasks: completed,
			updatedAt: new Date(),
		})
		.where(eq(userRoadmaps.userId, userId));
}

/**
 * Create custom task
 */
export async function createCustomTask(
	userId: string,
	data: {
		title: string;
		description: string;
		category: RoadmapCategory;
		estimatedMinutes?: number;
		priority?: string;
	},
): Promise<RoadmapTask> {
	// Get max order index
	const existingTasks = await db.query.roadmapTasks.findMany({
		where: eq(roadmapTasks.userId, userId),
		orderBy: (t, { desc }) => [desc(t.orderIndex)],
		limit: 1,
	});

	const maxOrder = existingTasks[0]?.orderIndex ?? 0;

	const [created] = await db
		.insert(roadmapTasks)
		.values({
			userId,
			title: data.title,
			description: data.description,
			category: data.category,
			estimatedMinutes: data.estimatedMinutes ?? 60,
			priority: data.priority ?? "normal",
			orderIndex: maxOrder + 1,
			kanbanColumn: "todo",
			isCustom: true,
		})
		.returning();

	await syncRoadmapProgress(userId);

	return created;
}

/**
 * Delete custom task (only custom tasks can be deleted)
 */
export async function deleteCustomTask(
	taskId: string,
	userId: string,
): Promise<void> {
	const task = await db.query.roadmapTasks.findFirst({
		where: and(eq(roadmapTasks.id, taskId), eq(roadmapTasks.userId, userId)),
	});

	if (!task) {
		throw new Error("Task not found");
	}

	if (!task.isCustom) {
		throw new Error("Only custom tasks can be deleted");
	}

	await db.delete(roadmapTasks).where(eq(roadmapTasks.id, taskId));

	await syncRoadmapProgress(userId);
}

/**
 * Update task details
 */
export async function updateTask(
	taskId: string,
	userId: string,
	data: Partial<{
		title: string;
		description: string;
		estimatedMinutes: number;
		priority: string;
	}>,
): Promise<RoadmapTask> {
	const [updated] = await db
		.update(roadmapTasks)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(and(eq(roadmapTasks.id, taskId), eq(roadmapTasks.userId, userId)))
		.returning();

	if (!updated) {
		throw new Error("Task not found or not authorized");
	}

	return updated;
}
