import { desc, eq, sql } from "drizzle-orm";
import { db } from "@itcom/db/client";
import {
	communityComments,
	communityPosts,
	postVotes,
	users,
} from "@itcom/db/schema";
import type { CommunityPost, CreateCommunityPostDTO } from "./community.types";

export const communityService = {
	getPosts: async (
		userId?: string,
		sortBy: "best" | "recent" = "recent",
	): Promise<CommunityPost[]> => {
		const posts = await db
			.select({
				id: communityPosts.id,
				title: communityPosts.title,
				content: communityPosts.content,
				category: communityPosts.category,
				createdAt: communityPosts.createdAt,
				authorId: communityPosts.authorId,
				upvotes: communityPosts.upvotes,
				downvotes: communityPosts.downvotes,
				score: communityPosts.score,
				author: {
					id: users.id,
					name: users.name,
					avatarUrl: users.avatarUrl,
					avatarThumbnailUrl: users.avatarThumbnailUrl,
				},
				commentCount: sql<number>`cast(count(DISTINCT ${communityComments.id}) as int)`,
				userVote: userId
					? sql<number>`(SELECT vote_type FROM ${postVotes} WHERE post_id = ${communityPosts.id} AND user_id = ${userId} LIMIT 1)`
					: sql<number>`0`,
			})
			.from(communityPosts)
			.leftJoin(users, eq(communityPosts.authorId, users.id))
			.leftJoin(
				communityComments,
				eq(communityComments.postId, communityPosts.id),
			)
			.groupBy(communityPosts.id, users.id)
			.orderBy(
				sortBy === "best"
					? desc(communityPosts.score)
					: desc(communityPosts.createdAt),
			);

		return posts.map((post) => ({
			id: post.id,
			title: post.title,
			content: post.content,
			category: post.category,
			createdAt: post.createdAt,
			authorId: post.authorId,
			author: post.author || null,
			upvotes: post.upvotes,
			downvotes: post.downvotes,
			score: post.score,
			userVote: post.userVote || 0,
			_count: {
				comments: post.commentCount,
			},
		}));
	},

	createPost: async (data: CreateCommunityPostDTO) => {
		const [post] = await db.insert(communityPosts).values(data).returning();
		return post;
	},

	getPost: async (
		id: string,
		userId?: string,
	): Promise<CommunityPost | null> => {
		const [post] = await db
			.select({
				id: communityPosts.id,
				title: communityPosts.title,
				content: communityPosts.content,
				category: communityPosts.category,
				createdAt: communityPosts.createdAt,
				authorId: communityPosts.authorId,
				upvotes: communityPosts.upvotes,
				downvotes: communityPosts.downvotes,
				score: communityPosts.score,
				author: {
					id: users.id,
					name: users.name,
					avatarUrl: users.avatarUrl,
					avatarThumbnailUrl: users.avatarThumbnailUrl,
				},
				commentCount: sql<number>`cast(count(DISTINCT ${communityComments.id}) as int)`,
				userVote: userId
					? sql<number>`(SELECT vote_type FROM ${postVotes} WHERE post_id = ${communityPosts.id} AND user_id = ${userId} LIMIT 1)`
					: sql<number>`0`,
			})
			.from(communityPosts)
			.leftJoin(users, eq(communityPosts.authorId, users.id))
			.leftJoin(
				communityComments,
				eq(communityComments.postId, communityPosts.id),
			)
			.where(eq(communityPosts.id, id))
			.groupBy(communityPosts.id, users.id);

		if (!post) return null;

		return {
			id: post.id,
			title: post.title,
			content: post.content,
			category: post.category,
			createdAt: post.createdAt,
			authorId: post.authorId,
			author: post.author || null,
			upvotes: post.upvotes,
			downvotes: post.downvotes,
			score: post.score,
			userVote: post.userVote || 0,
			_count: {
				comments: post.commentCount,
			},
		};
	}, // end of getPost

	updatePost: async (
		id: string,
		userId: string,
		data: Partial<CreateCommunityPostDTO>,
	) => {
		const post = await db.query.communityPosts.findFirst({
			where: eq(communityPosts.id, id),
		});

		if (!post) throw new Error("Post not found");

		if (post.authorId !== userId) {
			// Check for reputation privilege (FR-018)
			const user = await db.query.users.findFirst({
				where: eq(users.id, userId),
				columns: { reputation: true },
			});

			// 100 points to edit others' posts
			if (!user || (user.reputation || 0) < 100) {
				throw new Error("Unauthorized");
			}
		}

		const [updated] = await db
			.update(communityPosts)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(communityPosts.id, id))
			.returning();
		return updated;
	},

	deletePost: async (id: string, userId: string) => {
		const post = await db.query.communityPosts.findFirst({
			where: eq(communityPosts.id, id),
		});

		if (!post) throw new Error("Post not found");

		if (post.authorId !== userId) {
			// Check for reputation privilege (FR-019 - Moderation/Delete?)
			// Spec says "Unlock content moderation privileges at 500 reputation points"
			// Assuming moderation includes deletion.
			const user = await db.query.users.findFirst({
				where: eq(users.id, userId),
				columns: { reputation: true },
			});

			if (!user || (user.reputation || 0) < 500) {
				throw new Error("Unauthorized");
			}
		}

		await db.delete(communityPosts).where(eq(communityPosts.id, id));
	},
};
