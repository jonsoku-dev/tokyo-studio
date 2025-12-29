/**
 * SPEC 005: User Activity Statistics Service
 *
 * Retrieves real activity counts from database
 */

import { db } from "@itcom/db/client";
import {
	communityComments,
	communityPosts,
	mentoringSessions,
} from "@itcom/db/schema";
import { and, count, eq, isNull } from "drizzle-orm";
export interface UserActivityStats {
	mentoringSessions: number;
	communityPosts: number;
	comments: number;
	totalContributions: number;
}

/**
 * Get user's activity statistics from database
 */
export async function getUserActivityStats(
	userId: string,
): Promise<UserActivityStats> {
	const [sessionsResult, postsResult, commentsResult] = await Promise.all([
		// Count completed mentoring sessions (as mentor)
		db
			.select({ count: count() })
			.from(mentoringSessions)
			.where(
				and(
					eq(mentoringSessions.mentorId, userId),
					eq(mentoringSessions.status, "completed"),
				),
			),

		// Count community posts
		db
			.select({ count: count() })
			.from(communityPosts)
			.where(eq(communityPosts.authorId, userId)),
		// Count community comments (exclude deleted)
		db
			.select({ count: count() })
			.from(communityComments)
			.where(
				and(
					eq(communityComments.authorId, userId),
					// Only count non-deleted comments
					isNull(communityComments.deletedAt),
				),
			),
	]);

	const sessions = sessionsResult[0]?.count || 0;
	const posts = postsResult[0]?.count || 0;
	const comments = commentsResult[0]?.count || 0;

	return {
		mentoringSessions: sessions,
		communityPosts: posts,
		comments: comments,
		totalContributions: posts + comments,
	};
}

/**
 * Get mentor-specific statistics
 */
export async function getMentorStats(userId: string) {
	const [completedSessions, totalSessions] = await Promise.all([
		// Completed sessions
		db
			.select({ count: count() })
			.from(mentoringSessions)
			.where(
				and(
					eq(mentoringSessions.mentorId, userId),
					eq(mentoringSessions.status, "completed"),
				),
			),

		// All sessions (excluding cancelled)
		db
			.select({ count: count() })
			.from(mentoringSessions)
			.where(eq(mentoringSessions.mentorId, userId)),
	]);

	return {
		completedSessions: completedSessions[0]?.count || 0,
		totalSessions: totalSessions[0]?.count || 0,
	};
}
