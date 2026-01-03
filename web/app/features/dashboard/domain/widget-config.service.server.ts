import { db } from "@itcom/db/client";
import {
	type JourneyStage,
	type WidgetLayout,
	widgetConfigurations,
} from "@itcom/db/schema";
import { eq } from "drizzle-orm";

/**
 * Widget Configuration Service
 * Manages user's customizable dashboard widget layouts
 */

// ============================================================================
// Default Layouts by Journey Stage
// ============================================================================

export const DEFAULT_LAYOUTS: Record<JourneyStage, WidgetLayout[]> = {
	newcomer: [
		{
			id: "journey-progress",
			order: 0,
			visible: true,
			size: "standard",
			column: 1,
		},
		{
			id: "priority-actions",
			order: 1,
			visible: true,
			size: "standard",
			column: 1,
		},
		{
			id: "roadmap-snapshot",
			order: 2,
			visible: true,
			size: "standard",
			column: 1,
		},
		{
			id: "community-highlights",
			order: 3,
			visible: true,
			size: "compact",
			column: 2,
		},
		{ id: "document-hub", order: 4, visible: true, size: "compact", column: 2 },
		// Hidden by default for newcomers
		{
			id: "pipeline-overview",
			order: 5,
			visible: false,
			size: "standard",
			column: 1,
		},
		{
			id: "mentor-sessions",
			order: 6,
			visible: false,
			size: "standard",
			column: 2,
		},
		{
			id: "settlement-checklist",
			order: 7,
			visible: false,
			size: "standard",
			column: 2,
		},
		{
			id: "notifications-center",
			order: 8,
			visible: false,
			size: "compact",
			column: 2,
		},
		{
			id: "mentor-application",
			order: 9,
			visible: false,
			size: "compact",
			column: 2,
		},
	],

	learner: [
		{
			id: "roadmap-snapshot",
			order: 0,
			visible: true,
			size: "expanded",
			column: 1,
		},
		{
			id: "priority-actions",
			order: 1,
			visible: true,
			size: "standard",
			column: 1,
		},
		{
			id: "mentor-sessions",
			order: 2,
			visible: true,
			size: "standard",
			column: 2,
		},
		{
			id: "journey-progress",
			order: 3,
			visible: true,
			size: "compact",
			column: 2,
		},
		{
			id: "community-highlights",
			order: 4,
			visible: true,
			size: "compact",
			column: 2,
		},
		{ id: "document-hub", order: 5, visible: true, size: "compact", column: 2 },
		// Hidden
		{
			id: "pipeline-overview",
			order: 6,
			visible: false,
			size: "standard",
			column: 1,
		},
		{
			id: "settlement-checklist",
			order: 7,
			visible: false,
			size: "standard",
			column: 1,
		},
		{
			id: "notifications-center",
			order: 8,
			visible: false,
			size: "compact",
			column: 2,
		},
		{
			id: "mentor-application",
			order: 9,
			visible: false,
			size: "compact",
			column: 2,
		},
	],

	applicant: [
		{
			id: "pipeline-overview",
			order: 0,
			visible: true,
			size: "expanded",
			column: 1,
		},
		{
			id: "priority-actions",
			order: 1,
			visible: true,
			size: "standard",
			column: 1,
		},
		{
			id: "mentor-sessions",
			order: 2,
			visible: true,
			size: "standard",
			column: 2,
		},
		{
			id: "roadmap-snapshot",
			order: 3,
			visible: true,
			size: "compact",
			column: 2,
		},
		{
			id: "journey-progress",
			order: 4,
			visible: true,
			size: "compact",
			column: 2,
		},
		{ id: "document-hub", order: 5, visible: true, size: "compact", column: 2 },
		{
			id: "community-highlights",
			order: 6,
			visible: true,
			size: "compact",
			column: 2,
		},
		// Hidden
		{
			id: "settlement-checklist",
			order: 7,
			visible: false,
			size: "standard",
			column: 1,
		},
		{
			id: "notifications-center",
			order: 8,
			visible: false,
			size: "compact",
			column: 2,
		},
		{
			id: "mentor-application",
			order: 9,
			visible: false,
			size: "compact",
			column: 2,
		},
	],

	settlement: [
		{
			id: "settlement-checklist",
			order: 0,
			visible: true,
			size: "expanded",
			column: 1,
		},
		{
			id: "priority-actions",
			order: 1,
			visible: true,
			size: "standard",
			column: 1,
		},
		{
			id: "pipeline-overview",
			order: 2,
			visible: true,
			size: "compact",
			column: 2,
		},
		{
			id: "community-highlights",
			order: 3,
			visible: true,
			size: "standard",
			column: 2,
		},
		{
			id: "journey-progress",
			order: 4,
			visible: true,
			size: "compact",
			column: 2,
		},
		{ id: "document-hub", order: 5, visible: true, size: "compact", column: 2 },
		// Hidden
		{
			id: "roadmap-snapshot",
			order: 6,
			visible: false,
			size: "standard",
			column: 1,
		},
		{
			id: "mentor-sessions",
			order: 7,
			visible: false,
			size: "standard",
			column: 2,
		},
		{
			id: "notifications-center",
			order: 8,
			visible: false,
			size: "compact",
			column: 2,
		},
		{
			id: "mentor-application",
			order: 9,
			visible: false,
			size: "compact",
			column: 2,
		},
	],

	contributor: [
		{
			id: "community-highlights",
			order: 0,
			visible: true,
			size: "expanded",
			column: 1,
		},
		{
			id: "mentor-application",
			order: 1,
			visible: true,
			size: "standard",
			column: 1,
		},
		{
			id: "mentor-sessions",
			order: 2,
			visible: true,
			size: "standard",
			column: 2,
		},
		{
			id: "journey-progress",
			order: 3,
			visible: true,
			size: "compact",
			column: 2,
		},
		{
			id: "priority-actions",
			order: 4,
			visible: true,
			size: "compact",
			column: 2,
		},
		{
			id: "notifications-center",
			order: 5,
			visible: true,
			size: "compact",
			column: 2,
		},
		// Hidden
		{
			id: "roadmap-snapshot",
			order: 6,
			visible: false,
			size: "standard",
			column: 1,
		},
		{
			id: "pipeline-overview",
			order: 7,
			visible: false,
			size: "standard",
			column: 1,
		},
		{
			id: "settlement-checklist",
			order: 8,
			visible: false,
			size: "standard",
			column: 1,
		},
		{
			id: "document-hub",
			order: 9,
			visible: false,
			size: "compact",
			column: 2,
		},
	],
};

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get widget configuration for a user
 * Returns null if no configuration exists
 */
export async function getConfiguration(userId: string) {
	const [config] = await db
		.select()
		.from(widgetConfigurations)
		.where(eq(widgetConfigurations.userId, userId))
		.limit(1);

	return config || null;
}

/**
 * Save/update widget configuration for a user
 * Uses upsert pattern (insert or update)
 */
export async function saveConfiguration(
	userId: string,
	widgets: WidgetLayout[],
) {
	// Check if configuration exists
	const existing = await getConfiguration(userId);

	if (existing) {
		// Update existing configuration
		const [updated] = await db
			.update(widgetConfigurations)
			.set({
				widgets,
				lastUpdatedAt: new Date(),
			})
			.where(eq(widgetConfigurations.userId, userId))
			.returning();
		return updated;
	}

	// Insert new configuration
	const [created] = await db
		.insert(widgetConfigurations)
		.values({
			userId,
			widgets,
		})
		.returning();
	return created;
}

/**
 * Get default widget layout for a journey stage
 */
export function getDefaultLayout(stage: JourneyStage): WidgetLayout[] {
	return DEFAULT_LAYOUTS[stage];
}

/**
 * Validate widget layout
 * Ensures all widget IDs are valid and structure is correct
 */
export function validateLayout(widgets: unknown): widgets is WidgetLayout[] {
	if (!Array.isArray(widgets)) {
		return false;
	}

	const validWidgetIds = new Set([
		// Phase 1 & 2
		"journey-progress",
		"priority-actions",
		"roadmap-snapshot",
		"pipeline-overview",
		"mentor-sessions",
		"settlement-checklist",
		"community-highlights",
		"document-hub",
		"notifications-center",
		"mentor-application",
		// Phase 3A
		"profile-completion",
		"career-diagnosis-summary",
		"interview-prep",
		"weekly-calendar",
		// Phase 3B
		"nearby-locations",
		"job-posting-tracker",
		"achievements",
		"skill-radar",
		// Phase 3C
		"japanese-study",
		"reputation-stats",
		"quick-search",
		"subscription-status",
	]);

	const validSizes = new Set(["compact", "standard", "expanded"]);

	for (const widget of widgets) {
		// Check required fields
		if (
			typeof widget !== "object" ||
			widget === null ||
			typeof widget.id !== "string" ||
			typeof widget.order !== "number" ||
			typeof widget.visible !== "boolean" ||
			typeof widget.size !== "string"
		) {
			return false;
		}

		// Check valid widget ID
		if (!validWidgetIds.has(widget.id)) {
			return false;
		}

		// Check valid size
		if (!validSizes.has(widget.size)) {
			return false;
		}

		// Check optional column
		if (
			widget.column !== undefined &&
			widget.column !== 1 &&
			widget.column !== 2
		) {
			return false;
		}
	}

	return true;
}

/**
 * Delete widget configuration for a user
 * Useful for testing or resetting to defaults
 */
export async function deleteConfiguration(userId: string) {
	await db
		.delete(widgetConfigurations)
		.where(eq(widgetConfigurations.userId, userId));
}
