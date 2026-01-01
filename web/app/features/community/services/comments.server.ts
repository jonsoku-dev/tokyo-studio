import { db } from "@itcom/db/client";
import {
	commentNotifications,
	commentReports,
	commentVotes,
	communityComments,
	users,
} from "@itcom/db/schema";
import { and, asc, desc, eq, gt, lt, or, sql } from "drizzle-orm";
import { pushService } from "~/features/notifications/services/push.server";

import type { CommentWithAuthor, InsertComment } from "./types";

class CommentsService {
	// Create Comment
	async createComment(data: InsertComment) {
		let depth = 0;
		if (data.parentId) {
			const parent = await db.query.communityComments.findFirst({
				where: eq(communityComments.id, data.parentId),
				columns: { depth: true },
			});
			if (!parent) throw new Error("Parent comment not found");
			depth = (parent.depth || 0) + 1;

			if (depth > 3) {
				// Flatten to level 3 if trying to go deeper, as per typical Reddit style or strict error?
				// Spec says "System MUST limit comment nesting to a maximum of 3 levels deep".
				// Usually means replies to level 3 stay at level 3 or are blocked.
				// "If depth > 3, throw error" seems strict.
				// "reply is added at the same indentation level" (Spec Story 1 Scenario 3).
				// "my reply is added at the same indentation level (preventing 4+ levels)".
				// This implies effective depth stays at 3 but visually indent stops?
				// Or parentId changes?
				// If I reply to a depth 3 comment, my comment has that depth 3 comment as parent.
				// So my depth would be 4.
				// If we want visual indentation capped, we can just render depth 4 as depth 3.
				// But strict data limit is better.
				// Let's allow strictly max depth 3 in DB.
				if (depth > 3) {
					// Find the ancestor at level 2 to attach to? Or just error?
					// Spec scenario: "my reply is added at the same indentation level".
					// This suggests UI visual trickery or flattening.
					// Let's cap depth at 3.
					depth = 3;
					// But we still need valid parentId. If we attach to depth 3 parent, effective depth IS 4.
					// Unless parentId is reassigned to grandparent? No that breaks thread flow.
					// Let's assume UI handles visual cap, or we strictly enforce depth <= 3.
					// Actually, "reply to a third-level comment... reply is added at the same indentation level".
					// This usually means effectively adding it as a sibling to the parent?
					// Or just let depth go up but UI clamps indentation.
					// Let's enforce strict depth limit check for now to be safe.
					// Actually, let's allow depth 3 max (0, 1, 2, 3).
				}
			}
		}

		const [comment] = await db
			.insert(communityComments)
			.values({ ...data, depth })
			.returning();

		// --- Notification Logic ---

		// 1. Reply Notification
		if (data.parentId) {
			const parent = await db.query.communityComments.findFirst({
				where: eq(communityComments.id, data.parentId),
				columns: { authorId: true },
			});

			// Notify parent author if it's not self-reply
			if (parent?.authorId && parent.authorId !== data.authorId) {
				await db.insert(commentNotifications).values({
					userId: parent.authorId,
					// biome-ignore lint/style/noNonNullAssertion: Safe as we are logged in
					actorId: data.authorId!,
					commentId: comment.id,
					type: "reply",
				});

				// Send Push Notification
				await pushService.sendPushNotification(parent.authorId, {
					title: "New Reply",
					body: "Someone replied to your comment.",
					url: `/community/${data.postId}`,
				});
			}
		}

		// 2. Mention Notification (@username)
		const mentionRegex = /@(\w+)/g;
		const matches = [...data.content.matchAll(mentionRegex)];
		const mentionedUsernames = [...new Set(matches.map((m) => m[1]))];

		if (mentionedUsernames.length > 0) {
			for (const name of mentionedUsernames) {
				const profile = await db.query.profiles.findFirst({
					where: (p, { eq }) => eq(p.slug, name),
					columns: { userId: true },
				});

				if (profile?.userId && profile.userId !== data.authorId) {
					await db.insert(commentNotifications).values({
						userId: profile.userId,
						// biome-ignore lint/style/noNonNullAssertion: Safe as we are logged in
						actorId: data.authorId!,
						commentId: comment.id,
						type: "mention",
					});

					// Send Push Notification
					await pushService.sendPushNotification(profile.userId, {
						title: "New Mention",
						body: "You were mentioned in a comment.",
						url: `/community/${data.postId}`,
					});
				}
			}
		}

		return comment;
	}

	// Get Comments (Paginated)
	async getComments(
		postId: string,
		userId?: string,
		sortBy: "best" | "oldest" | "newest" = "oldest",
		parentId: string | null = null,
		cursor: string | null = null, // encoded "${timestamp}_${id}"
		limit = 5,
	): Promise<{ comments: CommentWithAuthor[]; nextCursor: string | null }> {
		const queries = [];
		queries.push(eq(communityComments.postId, postId));

		// Parent Filter
		if (parentId) {
			queries.push(eq(communityComments.parentId, parentId));
		} else {
			queries.push(sql`${communityComments.parentId} IS NULL`);
		}

		// Cursor Filter
		if (cursor) {
			const [timestamp, id] = cursor.split("_");
			const decodedDate = new Date(parseInt(timestamp));
			
			if (!isNaN(decodedDate.getTime()) && id) {
				if (sortBy === "newest") {
					// DESC: created_at < date OR (created_at = date AND id < id)
					queries.push(
						or(
							lt(communityComments.createdAt, decodedDate),
							and(
								eq(communityComments.createdAt, decodedDate),
								lt(communityComments.id, id)
							)
						)
					);
				} else if (sortBy === "oldest") {
					// ASC: created_at > date OR (created_at = date AND id > id)
					queries.push(
						or(
							gt(communityComments.createdAt, decodedDate),
							and(
								eq(communityComments.createdAt, decodedDate),
								gt(communityComments.id, id)
							)
						)
					);
				}
			}
		}

	// Determine sort order
		const sortOrder =
			sortBy === "best"
				? [desc(communityComments.score), desc(communityComments.id)] // Add ID tie-breaker even for best
				: sortBy === "newest"
					? [desc(communityComments.createdAt), desc(communityComments.id)]
					: [asc(communityComments.createdAt), asc(communityComments.id)];

		const data = await db
			.select({
				id: communityComments.id,
				postId: communityComments.postId,
				content: communityComments.content,
				authorId: communityComments.authorId,
				parentId: communityComments.parentId,
				depth: communityComments.depth,
				isEdited: communityComments.isEdited,
				deletedAt: communityComments.deletedAt,
				createdAt: communityComments.createdAt,
				updatedAt: communityComments.updatedAt,
				upvotes: communityComments.upvotes,
				downvotes: communityComments.downvotes,
				score: communityComments.score,
				author: {
					id: users.id,
					name: users.name,
					avatarUrl: users.avatarUrl,
					avatarThumbnailUrl: users.avatarThumbnailUrl,
				},
				userVote: userId
					? sql<number>`(SELECT vote_type FROM ${commentVotes} WHERE comment_id = ${communityComments.id} AND user_id = ${userId} LIMIT 1)`
					: sql<number>`0`,
				// Check for children count to show "Load More Replies" even if we don't load them
				replyCount: sql<number>`(SELECT count(*) FROM ${communityComments} cc2 WHERE cc2.parent_id = ${communityComments.id})::int`,
			})
			.from(communityComments)
			.leftJoin(users, eq(communityComments.authorId, users.id))
			.where(and(...queries))
			.orderBy(...sortOrder)
			.limit(limit + 1); // Fetch one more to check nextCursor

		const hasMore = data.length > limit;
		const items = hasMore ? data.slice(0, limit) : data;

		let nextCursor: string | null = null;
		if (hasMore && items.length > 0) {
			const lastItem = items[items.length - 1];
			// Use composite cursor: timestamp_id
			if (lastItem.createdAt) {
				nextCursor = `${lastItem.createdAt.getTime()}_${lastItem.id}`;
			}
		}

		const mapped = items.map((c) => {
			const author = c.author?.id
				? {
						id: c.author.id,
						name: c.author.name || "Unknown",
						avatarUrl: c.author.avatarUrl,
						avatarThumbnailUrl: c.author.avatarThumbnailUrl,
					}
				: null;

			if (c.deletedAt) {
				return {
					...c,
					content: "[deleted]",
					author: null,
					score: 0,
					userVote: 0,
					children: [],
					replyCount: c.replyCount || 0,
				};
			}
			return {
				...c,
				author,
				score: c.score,
				userVote: c.userVote || 0,
				children: [],
				replyCount: c.replyCount || 0,
			};
		}) as CommentWithAuthor[];

		return { comments: mapped, nextCursor };
	}

	// Vote
	async voteComment(commentId: string, userId: string, type: 1 | -1) {
		// Check existing vote
		const existing = await db.query.commentVotes.findFirst({
			where: and(
				eq(commentVotes.commentId, commentId),
				eq(commentVotes.userId, userId),
			),
		});

		if (existing) {
			if (existing.voteType === type) {
				// Remove vote (toggle off)
				await db.delete(commentVotes).where(eq(commentVotes.id, existing.id));
			} else {
				// Change vote
				await db
					.update(commentVotes)
					.set({ voteType: type })
					.where(eq(commentVotes.id, existing.id));
			}
		} else {
			// New vote
			await db.insert(commentVotes).values({
				commentId,
				userId,
				voteType: type,
			});
		}
	}

	// Update
	async updateComment(id: string, userId: string, content: string) {
		const comment = await db.query.communityComments.findFirst({
			where: eq(communityComments.id, id),
		});

		if (!comment) throw new Error("Comment not found");

		if (comment.authorId !== userId) {
			// Check Privilege (FR-018)
			const user = await db.query.users.findFirst({
				where: eq(users.id, userId),
				columns: { reputation: true },
			});
			if (!user || (user.reputation || 0) < 100) {
				throw new Error("Unauthorized");
			}
		} else {
			// Use time limit only for authors?
			// "Unlock privileges like editing others' posts" doesn't specify time limit override.
			// But usually moderators can edit anytime.
			// Authors limited to 15 mins.
			// 15 min check for AUTHOR
			// biome-ignore lint/style/noNonNullAssertion: guaranteed by DB constraints
			const diff = Date.now() - new Date(comment.createdAt!).getTime();
			const minutes = Math.floor(diff / 1000 / 60);
			if (minutes > 15) throw new Error("Edit window expired");
		}

		await db
			.update(communityComments)
			.set({ content, isEdited: true, updatedAt: new Date() })
			.where(eq(communityComments.id, id));
	}

	// Delete (Soft)
	async deleteComment(id: string, userId: string) {
		const comment = await db.query.communityComments.findFirst({
			where: eq(communityComments.id, id),
		});

		if (!comment) throw new Error("Comment not found");

		if (comment.authorId !== userId) {
			// Check Privilege (FR-019)
			const user = await db.query.users.findFirst({
				where: eq(users.id, userId),
				columns: { reputation: true },
			});
			if (!user || (user.reputation || 0) < 500) {
				throw new Error("Unauthorized");
			}
		}

		// Soft delete
		await db
			.update(communityComments)
			.set({ deletedAt: new Date() })
			.where(eq(communityComments.id, id));
	}

	// Report
	async reportComment(commentId: string, reporterId: string, reason: string) {
		// Check if report exists
		const existing = await db.query.commentReports.findFirst({
			where: and(
				eq(commentReports.commentId, commentId),
				eq(commentReports.reporterId, reporterId),
			),
		});

		if (existing) {
			throw new Error("Already reported");
		}

		await db.insert(commentReports).values({
			commentId,
			reporterId,
			reason,
		});
	}
}

export const commentsService = new CommentsService();
