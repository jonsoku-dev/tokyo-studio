import { desc, eq, sql } from "drizzle-orm";
import { db } from "~/shared/db/client.server";
import { communityComments, communityPosts, users } from "~/shared/db/schema";
import type { CommunityPost, CreateCommunityPostDTO } from "./community.types";

export const communityService = {
	getPosts: async (): Promise<CommunityPost[]> => {
		const posts = await db
			.select({
				id: communityPosts.id,
				title: communityPosts.title,
				content: communityPosts.content,
				category: communityPosts.category,
				createdAt: communityPosts.createdAt,
				authorId: communityPosts.authorId,
				author: {
					id: users.id,
					name: users.name,
					avatarUrl: users.avatarUrl,
				},
				commentCount: sql<number>`cast(count(${communityComments.id}) as int)`,
			})
			.from(communityPosts)
			.leftJoin(users, eq(communityPosts.authorId, users.id))
			.leftJoin(
				communityComments,
				eq(communityComments.postId, communityPosts.id),
			)
			.groupBy(communityPosts.id, users.id)
			.orderBy(desc(communityPosts.createdAt));

		return posts.map((post) => ({
			id: post.id,
			title: post.title,
			content: post.content,
			category: post.category,
			createdAt: post.createdAt,
			authorId: post.authorId,
			author: post.author || null,
			_count: {
				comments: post.commentCount,
			},
		}));
	},

	createPost: async (data: CreateCommunityPostDTO) => {
		const [post] = await db.insert(communityPosts).values(data).returning();
		return post;
	},
};
