import { db } from "@itcom/db/client";
import {
	commentNotifications,
	communityComments,
	communityPosts,
	notificationPreferences,
	users,
} from "@itcom/db/schema";
import { and, desc, eq, gte } from "drizzle-orm";
import { pushService } from "./push.server";

export interface WeeklyDigestStats {
	userId: string;
	newReplies: number;
	newMentions: number;
	newPosts: number;
	topPosts: Array<{
		id: string;
		title: string;
		score: number;
	}>;
}

/**
 * Generates weekly activity digest for a user
 */
export async function generateWeeklyDigest(
	userId: string,
): Promise<WeeklyDigestStats | null> {
	const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

	try {
		// Get user preferences
		const prefs = await db.query.notificationPreferences.findFirst({
			where: eq(notificationPreferences.userId, userId),
		});

		// Check if weekly digest is enabled
		const enabledTypes = prefs?.enabledTypes || [];
		if (!enabledTypes.includes("weeklyDigest")) {
			return null;
		}

		// Get user info for email
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		if (!user) {
			return null;
		}

		// Count new replies
		const replies = await db
			.select({ count: communityComments.id })
			.from(communityComments)
			.where(
				and(
					eq(communityComments.authorId, userId),
					gte(communityComments.createdAt, oneWeekAgo),
				),
			);

		const newReplies = replies.length;

		// Count new mentions
		const mentions = await db.query.commentNotifications.findMany({
			where: and(
				eq(commentNotifications.userId, userId),
				gte(commentNotifications.createdAt, oneWeekAgo),
				eq(commentNotifications.type, "mention"),
			),
		});

		const newMentions = mentions.length;

		// Count new posts created by user
		const posts = await db
			.select({ count: communityPosts.id })
			.from(communityPosts)
			.where(
				and(
					eq(communityPosts.authorId, userId),
					gte(communityPosts.createdAt, oneWeekAgo),
				),
			);

		const newPosts = posts.length;

		// Get top posts from the week (by score)
		const topPosts = await db
			.select({
				id: communityPosts.id,
				title: communityPosts.title,
				score: communityPosts.score,
			})
			.from(communityPosts)
			.where(gte(communityPosts.createdAt, oneWeekAgo))
			.orderBy(desc(communityPosts.score))
			.limit(3);

		const stats: WeeklyDigestStats = {
			userId,
			newReplies,
			newMentions,
			newPosts,
			topPosts: topPosts as Array<{
				id: string;
				title: string;
				score: number;
			}>,
		};

		return stats;
	} catch (error) {
		console.error(
			`[Weekly Digest] Error generating digest for ${userId}:`,
			error,
		);
		return null;
	}
}

/**
 * Sends weekly digest to all eligible users
 */
export async function sendWeeklyDigests(): Promise<{
	sent: number;
	failed: number;
	errors: Array<{ userId: string; error: string }>;
}> {
	const results = {
		sent: 0,
		failed: 0,
		errors: [] as Array<{ userId: string; error: string }>,
	};

	try {
		// Get all users with weekly digest enabled
		const allUsers = await db.query.users.findMany();

		for (const user of allUsers) {
			try {
				const stats = await generateWeeklyDigest(user.id);

				if (!stats) {
					continue; // User doesn't have digest enabled
				}

				// Only send if there's activity
				if (
					stats.newReplies === 0 &&
					stats.newMentions === 0 &&
					stats.newPosts === 0
				) {
					continue;
				}

				// Generate summary message
				const summaryParts = [];
				if (stats.newReplies > 0) {
					summaryParts.push(`${stats.newReplies} new replies`);
				}
				if (stats.newMentions > 0) {
					summaryParts.push(`${stats.newMentions} mentions`);
				}
				if (stats.newPosts > 0) {
					summaryParts.push(`${stats.newPosts} new posts`);
				}

				const summary = summaryParts.join(", ");

				// Send push notification
				await pushService.sendPushNotification(
					user.id,
					{
						title: "Weekly Activity Digest",
						body: `This week: ${summary}`,
						url: "/community",
					},
					{ skipQuietHours: false }, // Respect quiet hours
				);

				results.sent++;

				console.log(
					`[Weekly Digest] Sent digest to user ${user.id}: ${summary}`,
				);
			} catch (error) {
				results.failed++;
				results.errors.push({
					userId: user.id,
					error: error instanceof Error ? error.message : "Unknown error",
				});
				console.error(
					`[Weekly Digest] Error sending digest to ${user.id}:`,
					error,
				);
			}
		}

		return results;
	} catch (error) {
		console.error("[Weekly Digest] Fatal error in sendWeeklyDigests:", error);
		throw error;
	}
}

/**
 * Creates a cron job handler for weekly digest (to be used with cron service)
 * This function should be called once per week (e.g., Sunday at 8:00 AM)
 */
export async function weeklyDigestCronHandler(): Promise<void> {
	console.log("[Weekly Digest] Starting scheduled weekly digest run...");

	const result = await sendWeeklyDigests();

	console.log(
		`[Weekly Digest] Completed: ${result.sent} sent, ${result.failed} failed`,
	);

	if (result.errors.length > 0) {
		console.error("[Weekly Digest] Errors:", result.errors);
	}
}
