/**
 * Admin Roadmap Service
 *
 * Template CRUD, Targeting Preview, Analytics, User Management
 */

import { db } from "@itcom/db/client";
import {
	adminAuditLogs,
	profiles,
	roadmapTasks,
	roadmapTemplates,
	userRoadmaps,
	users,
} from "@itcom/db/schema";
import { and, count, eq, inArray, isNull, or } from "drizzle-orm";

// ============================================
// Types
// ============================================
export interface TargetingConditions {
	jobFamilies?: string[] | null;
	levels?: string[] | null;
	jpLevels?: string[] | null;
	cities?: string[] | null;
}

export interface TemplateFilter {
	category?: string;
	isActive?: boolean;
}

export interface FunnelData {
	generated: number;
	firstTask: number;
	fiftyPercent: number;
	complete: number;
}

export interface CategoryBreakdown {
	Learning: { total: number; completed: number };
	Application: { total: number; completed: number };
	Preparation: { total: number; completed: number };
	Settlement: { total: number; completed: number };
}

// ============================================
// Helpers
// ============================================
async function logAdminAction(
	adminId: string,
	action: string,
	targetType: string,
	targetId: string,
	details?: Record<string, any>,
) {
	await db.insert(adminAuditLogs).values({
		adminId,
		action,
		targetType,
		targetId,
		details,
	});
}

// ============================================
// Template CRUD
// ============================================
export async function listTemplates(filters?: TemplateFilter) {
	const conditions = [];

	if (filters?.category) {
		conditions.push(eq(roadmapTemplates.category, filters.category));
	}
	if (filters?.isActive !== undefined) {
		conditions.push(eq(roadmapTemplates.isActive, filters.isActive));
	}

	return db.query.roadmapTemplates.findMany({
		where: conditions.length > 0 ? and(...conditions) : undefined,
		orderBy: (t, { asc }) => [asc(t.orderIndex)],
	});
}

export async function getTemplate(id: string) {
	return db.query.roadmapTemplates.findFirst({
		where: eq(roadmapTemplates.id, id),
	});
}

export async function createTemplate(
	data: {
		title: string;
		description: string;
		category: string;
		estimatedMinutes?: number;
		priority?: string;
		targetJobFamilies?: string[] | null;
		targetLevels?: string[] | null;
		targetJpLevels?: string[] | null;
		targetCities?: string[] | null;
		isActive?: boolean;
	},
	adminId: string,
) {
	// Get max orderIndex
	const existing = await db.query.roadmapTemplates.findMany({
		orderBy: (t, { desc }) => [desc(t.orderIndex)],
		limit: 1,
	});
	const maxOrder = existing[0]?.orderIndex ?? 0;

	const [created] = await db
		.insert(roadmapTemplates)
		.values({
			...data,
			orderIndex: maxOrder + 1,
			estimatedMinutes: data.estimatedMinutes ?? 60,
			priority: data.priority ?? "normal",
			isActive: data.isActive ?? true,
		})
		.returning();

	await logAdminAction(
		adminId,
		"create_template",
		"template",
		created.id,
		data,
	);
	return created;
}

export async function updateTemplate(
	id: string,
	data: Partial<{
		title: string;
		description: string;
		category: string;
		estimatedMinutes: number;
		priority: string;
		targetJobFamilies: string[] | null;
		targetLevels: string[] | null;
		targetJpLevels: string[] | null;
		targetCities: string[] | null;
		isActive: boolean;
		orderIndex: number;
	}>,
	adminId: string,
) {
	const [updated] = await db
		.update(roadmapTemplates)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(roadmapTemplates.id, id))
		.returning();

	if (updated) {
		await logAdminAction(
			adminId,
			"update_template",
			"template",
			updated.id,
			data,
		);
	}
	return updated;
}

export async function deleteTemplate(id: string, adminId: string) {
	// Soft delete by setting isActive to false
	await db
		.update(roadmapTemplates)
		.set({ isActive: false, updatedAt: new Date() })
		.where(eq(roadmapTemplates.id, id));

	await logAdminAction(adminId, "delete_template", "template", id);
}

export async function reorderTemplates(orderedIds: string[]) {
	for (let i = 0; i < orderedIds.length; i++) {
		await db
			.update(roadmapTemplates)
			.set({ orderIndex: i + 1, updatedAt: new Date() })
			.where(eq(roadmapTemplates.id, orderedIds[i]));
	}
}

// ============================================
// Targeting Preview
// ============================================
export async function previewTargeting(conditions: TargetingConditions) {
	// Build dynamic WHERE clause
	const whereConditions = [];

	if (conditions.jobFamilies && conditions.jobFamilies.length > 0) {
		whereConditions.push(inArray(profiles.jobFamily, conditions.jobFamilies));
	}
	if (conditions.levels && conditions.levels.length > 0) {
		whereConditions.push(inArray(profiles.level, conditions.levels));
	}
	if (conditions.jpLevels && conditions.jpLevels.length > 0) {
		whereConditions.push(inArray(profiles.jpLevel, conditions.jpLevels));
	}
	if (conditions.cities && conditions.cities.length > 0) {
		whereConditions.push(
			or(
				inArray(profiles.targetCity, conditions.cities),
				isNull(profiles.targetCity),
			),
		);
	}

	const where =
		whereConditions.length > 0 ? and(...whereConditions) : undefined;

	// Count
	const countResult = await db
		.select({ value: count() })
		.from(profiles)
		.where(where);
	const totalCount = countResult[0]?.value ?? 0;

	// Sample profiles (limit 5)
	const sampleProfiles = await db
		.select({
			id: profiles.id,
			userId: profiles.userId,
			jobFamily: profiles.jobFamily,
			level: profiles.level,
			jpLevel: profiles.jpLevel,
			targetCity: profiles.targetCity,
		})
		.from(profiles)
		.where(where)
		.limit(5);

	return {
		count: totalCount,
		sample: sampleProfiles,
	};
}

// ============================================
// Analytics
// ============================================
export async function getRoadmapFunnel(): Promise<FunnelData> {
	// Count users at each stage
	const allRoadmaps = await db.query.userRoadmaps.findMany();

	const generated = allRoadmaps.length;
	const firstTask = allRoadmaps.filter((r) => r.completedTasks > 0).length;
	const fiftyPercent = allRoadmaps.filter(
		(r) => r.totalTasks > 0 && r.completedTasks >= r.totalTasks / 2,
	).length;
	const complete = allRoadmaps.filter(
		(r) => r.totalTasks > 0 && r.completedTasks === r.totalTasks,
	).length;

	return { generated, firstTask, fiftyPercent, complete };
}

export async function getCategoryBreakdown(): Promise<CategoryBreakdown> {
	const categories = [
		"Learning",
		"Application",
		"Preparation",
		"Settlement",
	] as const;
	const result = {} as CategoryBreakdown;

	for (const cat of categories) {
		const tasks = await db.query.roadmapTasks.findMany({
			where: eq(roadmapTasks.category, cat),
		});

		result[cat] = {
			total: tasks.length,
			completed: tasks.filter((t) => t.kanbanColumn === "completed").length,
		};
	}

	return result;
}

export async function getUsersAtStage(
	stage: "generated" | "firstTask" | "fiftyPercent" | "complete",
	limit = 20,
) {
	const allRoadmaps = await db.query.userRoadmaps.findMany();

	let filteredRoadmaps: typeof allRoadmaps;
	switch (stage) {
		case "firstTask":
			filteredRoadmaps = allRoadmaps.filter((r) => r.completedTasks > 0);
			break;
		case "fiftyPercent":
			filteredRoadmaps = allRoadmaps.filter(
				(r) => r.totalTasks > 0 && r.completedTasks >= r.totalTasks / 2,
			);
			break;
		case "complete":
			filteredRoadmaps = allRoadmaps.filter(
				(r) => r.totalTasks > 0 && r.completedTasks === r.totalTasks,
			);
			break;
		default:
			filteredRoadmaps = allRoadmaps;
	}

	const userIds = filteredRoadmaps.slice(0, limit).map((r) => r.userId);

	if (userIds.length === 0) return [];

	return db.query.users.findMany({
		where: inArray(users.id, userIds),
		columns: { id: true, email: true, name: true },
	});
}

// ============================================
// User Management
// ============================================
export async function getUserRoadmapDetail(userId: string) {
	const roadmap = await db.query.userRoadmaps.findFirst({
		where: eq(userRoadmaps.userId, userId),
	});

	const tasks = await db.query.roadmapTasks.findMany({
		where: eq(roadmapTasks.userId, userId),
		orderBy: (t, { asc }) => [asc(t.orderIndex)],
	});

	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: { id: true, email: true, name: true },
	});

	return { user, roadmap, tasks };
}

export async function resetUserRoadmap(
	userId: string,
	adminId: string,
	reason: string,
) {
	// Delete template-generated tasks (not custom)
	await db
		.delete(roadmapTasks)
		.where(
			and(eq(roadmapTasks.userId, userId), eq(roadmapTasks.isCustom, false)),
		);

	// Reset user_roadmaps entry
	await db
		.update(userRoadmaps)
		.set({
			totalTasks: 0,
			completedTasks: 0,
			currentMilestone: "started",
			updatedAt: new Date(),
		})
		.where(eq(userRoadmaps.userId, userId));

	await logAdminAction(adminId, "reset_user_roadmap", "user", userId, {
		reason,
	});
}
