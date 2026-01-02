import { db } from "@itcom/db/client";
import { notificationEventLog, notificationGroupings } from "@itcom/db/schema";
import { desc, eq } from "drizzle-orm";
import { notificationOrchestrator } from "~/features/notifications/services/orchestrator.server";

async function _runIntegrationTest() {
	console.log("🚀 Starting Notification Integration Test...");

	const testUserId = "test-user-id"; // You might need a real user ID from your local DB

	// 1. Test Direct Notification (Community Reply)
	console.log("\n1. Testing Community Reply (Should be immediate)...");
	await notificationOrchestrator.trigger({
		type: "community.reply",
		userId: testUserId,
		payload: {
			title: "Test Reply",
			body: "This is a test reply notification",
			url: "/test",
		},
		metadata: {
			postId: "test-post",
			commentId: "test-comment-1",
			eventId: "test-event-1",
		},
	});
	console.log("✅ Triggered community.reply");

	// 2. Test Grouping (Trigger 3 times)
	console.log("\n2. Testing Grouping (Should be grouped)...");
	for (let i = 1; i <= 3; i++) {
		await notificationOrchestrator.trigger({
			type: "community.reply",
			userId: testUserId,
			payload: {
				title: "Test Reply Group",
				body: `Group test ${i}`,
				url: "/test",
			},
			metadata: {
				postId: "test-post",
				commentId: `test-comment-group-${i}`,
				eventId: `test-event-group-${i}`,
				parentId: "parent-1",
			},
		});
		console.log(`   Triggered ${i}/3`);
	}

	// 3. Test Quiet Hours (Mocking option)
	console.log("\n3. Testing Quiet Hours (Simulated via options)...");
	// We can't easily simulate time, but we can check if config respects skipQuietHours=false
	// Assuming current time IS NOT quiet hours, we can force it?
	// Orchestrator uses User Preferences. If we haven't set prefs, it sends.

	// 4. Verify DB State
	console.log("\n🔍 Verifying Database State...");

	// Check Event Log
	const logs = await db
		.select()
		.from(notificationEventLog)
		.where(eq(notificationEventLog.userId, testUserId))
		.orderBy(desc(notificationEventLog.createdAt))
		.limit(5);

	console.log(`Found ${logs.length} recent event logs.`);
	logs.forEach((log) => {
		console.log(`- [${log.event}] ${log.type} (${log.notificationId})`);
	});

	// Check Groups
	const groups = await db
		.select()
		.from(notificationGroupings)
		.where(eq(notificationGroupings.userId, testUserId));

	console.log(`Found ${groups.length} active groups.`);
	groups.forEach((g) => {
		console.log(`- ${g.type} (Count: ${g.count}) Status: ${g.status}`);
	});

	console.log("\n✅ Test Execution Completed.");
	console.log(
		"Note: This script triggers real DB insertions. Clean up manually if needed.",
	);
}

// To run this: tsx scripts/test-notifications.ts
// But tsx might not handle the imports correctly without configuration.
// Alternative: Put this in a route loader and call it.
