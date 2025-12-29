/**
 * SPEC 005: Badge System Service
 *
 * Handles badge awarding, checking criteria, and retrieving user badges
 */

import { and, count, eq, sql } from "drizzle-orm";
import { db } from "@itcom/db/client";
import {
	badges,
	communityComments,
	communityPosts,
	mentoringSessions,
	userBadges,
	users,
} from "@itcom/db/schema";
import {
	BADGE_DEFINITIONS,
	type BadgeCriteria,
	getBadgeDefinition,
} from "./badge-definitions";

/**
 * Check if user meets criteria for a specific badge
 */
async function checkBadgeCriteria(
	userId: string,
	criteria: BadgeCriteria,
): Promise<boolean> {
	switch (criteria.type) {
		case "email_verified": {
			const [user] = await db
				.select({ emailVerified: users.emailVerified })
				.from(users)
				.where(eq(users.id, userId));
			return !!user?.emailVerified;
		}

		case "mentor_sessions": {
			const [result] = await db
				.select({ count: count() })
				.from(mentoringSessions)
				.where(
					and(
						eq(mentoringSessions.mentorId, userId),
						eq(mentoringSessions.status, "completed"),
					),
				);
			const sessionCount = result?.count || 0;
			const meetsThreshold = sessionCount >= (criteria.threshold || 5);
			// If inverse is true, return opposite (for "New Mentor" badge)
			return criteria.inverse ? !meetsThreshold : meetsThreshold;
		}

		case "community_posts": {
			// Check post count and total upvotes
			const [postResult] = await db
				.select({ count: count() })
				.from(communityPosts)
				.where(eq(communityPosts.authorId, userId));

			const postCount = postResult?.count || 0;

			if (postCount < (criteria.threshold || 10)) {
				return false;
			}

			// Calculate total upvotes across all posts and comments
			// This is a simplified version - in production you might want to cache this
			const [upvoteResult] = await db
				.select({
					totalUpvotes: sql<number>`COALESCE(SUM(
            (SELECT COUNT(*) FROM ${sql.identifier("comment_votes")}
             WHERE comment_id IN (
               SELECT id FROM ${sql.identifier("community_comments")}
               WHERE author_id = ${userId} AND vote_type = 1
             )
            )
          ), 0)`,
				})
				.from(communityComments);

			const totalUpvotes = upvoteResult?.totalUpvotes || 0;
			return totalUpvotes >= (criteria.minUpvotes || 50);
		}

		case "profile_complete": {
			// Check if user has avatar and complete profile
			const [user] = await db
				.select({
					avatarUrl: users.avatarUrl,
				})
				.from(users)
				.where(eq(users.id, userId));

			// Check profile table for bio
			const profile = await db.query.profiles.findFirst({
				where: (profiles, { eq }) => eq(profiles.userId, userId),
				columns: {
					bio: true,
					targetCity: true,
				},
			});

			// Profile is complete if user has avatar, bio, and target city
			return !!(user?.avatarUrl && profile?.bio && profile?.targetCity);
		}

		default:
			return false;
	}
}

/**
 * Award a badge to a user
 */
async function awardBadge(userId: string, badgeId: string): Promise<void> {
	// First, ensure badge exists in badges table
	const [existingBadge] = await db
		.select()
		.from(badges)
		.where(eq(badges.id, badgeId));

	if (!existingBadge) {
		const badgeDef = getBadgeDefinition(badgeId);
		if (!badgeDef) {
			throw new Error(`Badge definition not found: ${badgeId}`);
		}

		// Create badge in database
		await db.insert(badges).values({
			id: badgeId,
			name: badgeDef.name,
			description: badgeDef.description,
			icon: badgeDef.icon,
			color: badgeDef.color,
			criteria: badgeDef.criteria as unknown,
			createdAt: new Date(),
		});
	}

	// Award badge to user
	await db.insert(userBadges).values({
		userId,
		badgeId,
		awardedAt: new Date(),
	});
}

/**
 * Check and award all eligible badges for a user
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
	const awardedBadges: string[] = [];

	for (const badgeDef of BADGE_DEFINITIONS) {
		// Check if already awarded
		const [existing] = await db
			.select()
			.from(userBadges)
			.where(
				and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeDef.id)),
			);

		if (!existing) {
			// Check if user qualifies
			const qualifies = await checkBadgeCriteria(userId, badgeDef.criteria);

			if (qualifies) {
				await awardBadge(userId, badgeDef.id);
				awardedBadges.push(badgeDef.id);
			}
		}
	}

	// Handle mutually exclusive badges: "new-mentor" and "mentor"
	// If user now has "mentor" badge, remove "new-mentor"
	if (awardedBadges.includes("mentor")) {
		await revokeBadge(userId, "new-mentor");
	}

	// If user has "mentor" badge already, ensure "new-mentor" is removed
	const hasMentorBadge = await db.query.userBadges.findFirst({
		where: and(eq(userBadges.userId, userId), eq(userBadges.badgeId, "mentor")),
	});

	if (hasMentorBadge) {
		await revokeBadge(userId, "new-mentor");
	}

	return awardedBadges;
}

/**
 * Get all badges for a user
 */
export async function getUserBadges(userId: string) {
	const userBadgeRecords = await db.query.userBadges.findMany({
		where: eq(userBadges.userId, userId),
		with: {
			badge: true,
		},
		orderBy: (userBadges, { desc }) => [desc(userBadges.awardedAt)],
	});

	return userBadgeRecords.map((ub) => {
		const badgeDef = getBadgeDefinition(ub.badgeId);
		return {
			id: ub.badge.id,
			name: ub.badge.name,
			description: ub.badge.description,
			icon: ub.badge.icon,
			color: badgeDef?.color || "#6B7280", // fallback to gray
			awardedAt: ub.awardedAt,
		};
	});
}

/**
 * Remove a badge from a user (admin only)
 */
export async function revokeBadge(
	userId: string,
	badgeId: string,
): Promise<void> {
	await db
		.delete(userBadges)
		.where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
}
