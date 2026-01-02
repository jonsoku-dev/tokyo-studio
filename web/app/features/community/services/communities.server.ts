import { db } from "@itcom/db/client";
import {
	communities,
	communityMembers,
	communityPosts,
	communityRules,
	users,
} from "@itcom/db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

// ========== Community CRUD ==========

export async function getCommunity(slug: string) {
	const result = await db
		.select({
			id: communities.id,
			slug: communities.slug,
			name: communities.name,
			description: communities.description,
			bannerUrl: communities.bannerUrl,
			iconUrl: communities.iconUrl,
			visibility: communities.visibility,
			memberCount: communities.memberCount,
			createdAt: communities.createdAt,
		})
		.from(communities)
		.where(eq(communities.slug, slug))
		.limit(1);

	return result[0] || null;
}

export async function getCommunityWithRules(slug: string) {
	const community = await getCommunity(slug);
	if (!community) return null;

	const rules = await db
		.select()
		.from(communityRules)
		.where(eq(communityRules.communityId, community.id))
		.orderBy(communityRules.orderIndex);

	return { ...community, rules };
}

export async function getCommunities({
	cursor,
	limit = 20,
}: {
	cursor?: string | null;
	limit?: number;
} = {}) {
	const conditions = [eq(communities.visibility, "public")];

	if (cursor) {
		const [lastMemberCountStr, lastId] = Buffer.from(cursor, "base64")
			.toString()
			.split(":");
		const lastMemberCount = Number(lastMemberCountStr);

		if (!Number.isNaN(lastMemberCount) && lastId) {
			conditions.push(
				sql`(${communities.memberCount} < ${lastMemberCount} OR (${communities.memberCount} = ${lastMemberCount} AND ${communities.id} < ${lastId}))`,
			);
		}
	}

	const results = await db
		.select({
			id: communities.id,
			slug: communities.slug,
			name: communities.name,
			description: communities.description,
			iconUrl: communities.iconUrl,
			memberCount: communities.memberCount,
		})
		.from(communities)
		.where(and(...conditions))
		.orderBy(desc(communities.memberCount), desc(communities.id))
		.limit(limit);

	let nextCursor: string | null = null;
	if (results.length === limit) {
		const lastItem = results[results.length - 1];
		nextCursor = Buffer.from(`${lastItem.memberCount}:${lastItem.id}`).toString(
			"base64",
		);
	}

	return {
		communities: results,
		nextCursor,
	};
}

export async function getUserCommunities(userId: string) {
	return db
		.select({
			id: communities.id,
			slug: communities.slug,
			name: communities.name,
			iconUrl: communities.iconUrl,
			role: communityMembers.role,
		})
		.from(communityMembers)
		.innerJoin(communities, eq(communityMembers.communityId, communities.id))
		.where(eq(communityMembers.userId, userId));
}

// ========== Membership ==========

export async function joinCommunity(userId: string, communityId: string) {
	// Check if already member
	const existing = await db
		.select()
		.from(communityMembers)
		.where(
			and(
				eq(communityMembers.communityId, communityId),
				eq(communityMembers.userId, userId),
			),
		)
		.limit(1);

	if (existing.length > 0) {
		return { success: false, error: "Already a member" };
	}

	// Insert membership
	await db.insert(communityMembers).values({
		communityId,
		userId,
		role: "member",
	});

	// Update member count
	await db
		.update(communities)
		.set({ memberCount: sql`${communities.memberCount} + 1` })
		.where(eq(communities.id, communityId));

	return { success: true };
}

export async function leaveCommunity(userId: string, communityId: string) {
	// Check if member
	const existing = await db
		.select()
		.from(communityMembers)
		.where(
			and(
				eq(communityMembers.communityId, communityId),
				eq(communityMembers.userId, userId),
			),
		)
		.limit(1);

	if (existing.length === 0) {
		return { success: false, error: "Not a member" };
	}

	// Prevent owner from leaving
	if (existing[0].role === "owner") {
		return { success: false, error: "Owner cannot leave the community" };
	}

	// Delete membership
	await db
		.delete(communityMembers)
		.where(
			and(
				eq(communityMembers.communityId, communityId),
				eq(communityMembers.userId, userId),
			),
		);

	// Update member count
	await db
		.update(communities)
		.set({ memberCount: sql`GREATEST(${communities.memberCount} - 1, 0)` })
		.where(eq(communities.id, communityId));

	return { success: true };
}

export async function hasJoined(
	userId: string | null | undefined,
	communityId: string,
): Promise<boolean> {
	if (!userId) return false;

	const result = await db
		.select({ id: communityMembers.id })
		.from(communityMembers)
		.where(
			and(
				eq(communityMembers.communityId, communityId),
				eq(communityMembers.userId, userId),
			),
		)
		.limit(1);

	return result.length > 0;
}

export async function getUserRole(
	userId: string | null | undefined,
	communityId: string,
): Promise<string | null> {
	if (!userId) return null;

	const result = await db
		.select({ role: communityMembers.role })
		.from(communityMembers)
		.where(
			and(
				eq(communityMembers.communityId, communityId),
				eq(communityMembers.userId, userId),
			),
		)
		.limit(1);

	return result[0]?.role || null;
}

// ========== Posts (Community-scoped) ==========

export type SortBy = "new" | "hot" | "top";

export async function getCommunityPosts(
	communityId: string,
	sortBy: SortBy = "new",
	limit = 25,
) {
	const orderBy =
		sortBy === "hot"
			? desc(communityPosts.hotScore)
			: sortBy === "top"
				? desc(communityPosts.score)
				: desc(communityPosts.createdAt);

	const posts = await db
		.select({
			id: communityPosts.id,
			title: communityPosts.title,
			content: communityPosts.content,
			postType: communityPosts.postType,
			linkUrl: communityPosts.linkUrl,
			ogTitle: communityPosts.ogTitle,
			ogImage: communityPosts.ogImage,
			isPinned: communityPosts.isPinned,
			score: communityPosts.score,
			upvotes: communityPosts.upvotes,
			downvotes: communityPosts.downvotes,
			commentCount: communityPosts.commentCount,
			createdAt: communityPosts.createdAt,
			author: {
				id: users.id,
				name: users.name,
				avatarUrl: users.avatarUrl,
			},
		})
		.from(communityPosts)
		.leftJoin(users, eq(communityPosts.authorId, users.id))
		.where(eq(communityPosts.communityId, communityId))
		.orderBy(desc(communityPosts.isPinned), orderBy)
		.limit(limit);

	return posts;
}

export async function getHomeFeedPosts(userId: string | null, limit = 25) {
	if (!userId) {
		// Return popular posts for guests
		return db
			.select({
				id: communityPosts.id,
				title: communityPosts.title,
				content: communityPosts.content,
				postType: communityPosts.postType,
				score: communityPosts.score,
				commentCount: communityPosts.commentCount,
				createdAt: communityPosts.createdAt,
				community: {
					slug: communities.slug,
					name: communities.name,
				},
				author: {
					id: users.id,
					name: users.name,
					avatarUrl: users.avatarUrl,
				},
			})
			.from(communityPosts)
			.innerJoin(communities, eq(communityPosts.communityId, communities.id))
			.leftJoin(users, eq(communityPosts.authorId, users.id))
			.where(eq(communities.visibility, "public"))
			.orderBy(desc(communityPosts.score))
			.limit(limit);
	}

	// Get user's joined communities
	const userCommunities = await db
		.select({ communityId: communityMembers.communityId })
		.from(communityMembers)
		.where(eq(communityMembers.userId, userId));

	const communityIds = userCommunities.map((c) => c.communityId);

	if (communityIds.length === 0) {
		// No communities joined, show popular
		return getHomeFeedPosts(null, limit);
	}

	return db
		.select({
			id: communityPosts.id,
			title: communityPosts.title,
			content: communityPosts.content,
			postType: communityPosts.postType,
			score: communityPosts.score,
			commentCount: communityPosts.commentCount,
			createdAt: communityPosts.createdAt,
			community: {
				slug: communities.slug,
				name: communities.name,
			},
			author: {
				id: users.id,
				name: users.name,
				avatarUrl: users.avatarUrl,
			},
		})
		.from(communityPosts)
		.innerJoin(communities, eq(communityPosts.communityId, communities.id))
		.leftJoin(users, eq(communityPosts.authorId, users.id))
		.where(inArray(communityPosts.communityId, communityIds))
		.orderBy(desc(communityPosts.createdAt))
		.limit(limit);
}
