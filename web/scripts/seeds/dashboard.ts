import type * as schema from "@itcom/db/schema";
import type { WidgetLayout } from "@itcom/db/schema";
import { widgetConfigurations } from "@itcom/db/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

/**
 * All 22 widgets with visible: true for test user
 */
const ALL_WIDGETS: WidgetLayout[] = [
	// Phase 1 (P1) - Core
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
		size: "expanded",
		column: 1,
	},
	// Phase 2 (P2) - Extended
	{
		id: "pipeline-overview",
		order: 3,
		visible: true,
		size: "standard",
		column: 1,
	},
	{
		id: "mentor-sessions",
		order: 4,
		visible: true,
		size: "standard",
		column: 2,
	},
	{
		id: "settlement-checklist",
		order: 5,
		visible: true,
		size: "standard",
		column: 2,
	},
	{
		id: "community-highlights",
		order: 6,
		visible: true,
		size: "standard",
		column: 2,
	},
	{ id: "document-hub", order: 7, visible: true, size: "compact", column: 2 },
	{
		id: "notifications-center",
		order: 8,
		visible: true,
		size: "standard",
		column: 2,
	},
	{
		id: "mentor-application",
		order: 9,
		visible: true,
		size: "standard",
		column: 2,
	},
	// Phase 3A - High Priority
	{
		id: "profile-completion",
		order: 10,
		visible: true,
		size: "standard",
		column: 1,
	},
	{
		id: "career-diagnosis-summary",
		order: 11,
		visible: true,
		size: "standard",
		column: 1,
	},
	{
		id: "interview-prep",
		order: 12,
		visible: true,
		size: "standard",
		column: 2,
	},
	{
		id: "weekly-calendar",
		order: 13,
		visible: true,
		size: "standard",
		column: 2,
	},
	// Phase 3B - Medium Priority
	{
		id: "nearby-locations",
		order: 14,
		visible: true,
		size: "standard",
		column: 1,
	},
	{
		id: "job-posting-tracker",
		order: 15,
		visible: true,
		size: "standard",
		column: 1,
	},
	{ id: "achievements", order: 16, visible: true, size: "standard", column: 2 },
	{ id: "skill-radar", order: 17, visible: true, size: "standard", column: 2 },
	// Phase 3C - Lower Priority
	{
		id: "japanese-study",
		order: 18,
		visible: true,
		size: "standard",
		column: 1,
	},
	{
		id: "reputation-stats",
		order: 19,
		visible: true,
		size: "standard",
		column: 1,
	},
	{ id: "quick-search", order: 20, visible: true, size: "compact", column: 2 },
	{
		id: "subscription-status",
		order: 21,
		visible: true,
		size: "standard",
		column: 2,
	},
];

export async function seedDashboard(
	db: NodePgDatabase<typeof schema>,
	testUserId: string = "00000000-0000-0000-0000-000000000000",
) {
	console.log("🎛️ Seeding dashboard widget configuration...");

	// Upsert widget configuration for test user with all 22 widgets visible
	await db
		.insert(widgetConfigurations)
		.values({
			userId: testUserId,
			widgets: ALL_WIDGETS,
		})
		.onConflictDoUpdate({
			target: widgetConfigurations.userId,
			set: {
				widgets: ALL_WIDGETS,
				lastUpdatedAt: new Date(),
			},
		});

	console.log(
		`✅ Created dashboard config with ${ALL_WIDGETS.length} widgets for test user`,
	);
}
