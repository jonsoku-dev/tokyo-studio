import type { z } from "zod";
import {
	insertCommunityPostSchema,
	selectCommunityCommentSchema,
	selectCommunityPostSchema,
	selectUserSchema,
} from "~/shared/db/schema";

export const CommunityPostSchema = selectCommunityPostSchema.pick({
	id: true,
	title: true,
	content: true,
	category: true,
	createdAt: true,
	authorId: true,
});

export const CreateCommunityPostSchema = insertCommunityPostSchema.pick({
	title: true,
	content: true,
	category: true,
	authorId: true,
});

export const CommunityCommentSchema = selectCommunityCommentSchema.pick({
	id: true,
	content: true,
	createdAt: true,
	authorId: true,
});

export const AuthorSchema = selectUserSchema.pick({
	id: true,
	name: true,
	avatarUrl: true,
});

export type Author = z.infer<typeof AuthorSchema>;

export type CommunityPost = z.infer<typeof CommunityPostSchema> & {
	author?: Author | null;
	_count?: {
		comments: number;
	};
};

export type CreateCommunityPostDTO = z.infer<typeof CreateCommunityPostSchema>;

export type CommunityComment = z.infer<typeof CommunityCommentSchema> & {
	author?: Author | null;
};
