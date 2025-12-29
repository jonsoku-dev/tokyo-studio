import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@itcom/db/client";
import {
	commentVotes,
	communityComments,
	communityPosts,
	postVotes,
	reputationLogs,
	voteAuditLogs,
} from "@itcom/db/schema";

export async function handleVote(
	userId: string,
	type: "post" | "comment",
	id: string,
	value: number,
	ipAddress?: string,
	userAgent?: string,
) {
	// Value: 1 (up), -1 (down), 0 (remove)
	if (![-1, 0, 1].includes(value)) {
		throw new Error("Invalid vote value");
	}

	const isPost = type === "post";
	const table = isPost ? postVotes : commentVotes;
	const idCol = isPost ? postVotes.postId : commentVotes.commentId;
	const targetTable = isPost ? communityPosts : communityComments;

	// --- 1. Suspicious Pattern Detection (FR-022) ---
	// Check recent votes (last 1 minute)
	const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
	const recentVotes = await db
		.select({ count: sql<number>`count(*)` })
		.from(voteAuditLogs)
		.where(
			and(
				eq(voteAuditLogs.userId, userId),
				gte(voteAuditLogs.createdAt, oneMinuteAgo),
			),
		)
		.then((rows) => rows[0]?.count || 0);

	if (recentVotes >= 20) {
		throw new Error(
			"Suspicious activity detected. Please wait before voting again.",
		);
	}

	// Check existing vote
	const existingVote = await db
		.select()
		.from(table)
		.where(and(eq(table.userId, userId), eq(idCol, id)))
		.limit(1)
		.then((rows) => rows[0]);

	// ... [Existing Reputation Logic omitted for brevity, keeping it same] ...
	// Calculate reputation change
	// Rules: Post Up(+10), Comment Up(+5), Down(-2)
	const content = await db
		.select({ authorId: targetTable.authorId })
		.from(targetTable)
		.where(eq(targetTable.id, id))
		.limit(1)
		.then((rows) => rows[0]);

	if (!content || !content.authorId) {
		throw new Error("Content not found");
	}

	const authorId = content.authorId;

	// check daily limit
	const startOfDay = new Date();
	startOfDay.setHours(0, 0, 0, 0);

	const postVoteCount = await db
		.select({ count: sql<number>`count(*)` })
		.from(postVotes)
		.where(
			and(eq(postVotes.userId, userId), gte(postVotes.createdAt, startOfDay)),
		)
		.then((res) => Number(res[0]?.count || 0));

	const commentVoteCount = await db
		.select({ count: sql<number>`count(*)` })
		.from(commentVotes)
		.where(
			and(
				eq(commentVotes.userId, userId),
				gte(commentVotes.createdAt, startOfDay),
			),
		)
		.then((res) => Number(res[0]?.count || 0));

	const totalDailyVotes = postVoteCount + commentVoteCount;
	if (totalDailyVotes >= 100 && value !== 0 && !existingVote) {
		throw new Error("Daily vote limit reached (100 votes/day)");
	}

	await db.transaction(async (tx) => {
		// --- 2. Audit Log (FR-022) ---
		// Log every attempt that passes rate limit
		await tx.insert(voteAuditLogs).values({
			userId,
			targetId: id,
			targetType: type,
			voteType: value,
			ipAddress: ipAddress || null,
			userAgent: userAgent || null,
		});

		if (existingVote) {
			if (value === 0 || value === existingVote.voteType) {
				// Remove vote
				if (value === existingVote.voteType) {
					// Toggle off = remove
					if (isPost) {
						await tx
							.delete(postVotes)
							.where(
								and(eq(postVotes.userId, userId), eq(postVotes.postId, id)),
							);
					} else {
						await tx
							.delete(commentVotes)
							.where(
								and(
									eq(commentVotes.userId, userId),
									eq(commentVotes.commentId, id),
								),
							);
					}

					// Revert reputation
					if (authorId !== userId) {
						let amount = 0;
						if (existingVote.voteType === 1) {
							amount = -(isPost ? 10 : 5);
						} else if (existingVote.voteType === -1) {
							amount = 2; // Revert -2 is +2
						}

						if (amount !== 0) {
							await tx.insert(reputationLogs).values({
								userId: authorId,
								amount,
								reason: `revert_${type}_${existingVote.voteType === 1 ? "upvote" : "downvote"}`,
								targetId: id,
								targetType: type,
							});
						}
					}
				} else {
					// Explicit remove (value 0)
					if (isPost) {
						await tx
							.delete(postVotes)
							.where(
								and(eq(postVotes.userId, userId), eq(postVotes.postId, id)),
							);
					} else {
						await tx
							.delete(commentVotes)
							.where(
								and(
									eq(commentVotes.userId, userId),
									eq(commentVotes.commentId, id),
								),
							);
					}

					if (authorId !== userId) {
						// Revert reputation
						let amount = 0;
						if (existingVote.voteType === 1) {
							amount = -(isPost ? 10 : 5);
						} else if (existingVote.voteType === -1) {
							amount = 2;
						}

						if (amount !== 0) {
							await tx.insert(reputationLogs).values({
								userId: authorId,
								amount,
								reason: `revert_${type}_${existingVote.voteType === 1 ? "upvote" : "downvote"}`,
								targetId: id,
								targetType: type,
							});
						}
					}
				}
			} else {
				// Change vote (e.g. 1 -> -1)
				if (isPost) {
					await tx
						.update(postVotes)
						.set({ voteType: value })
						.where(and(eq(postVotes.userId, userId), eq(postVotes.postId, id)));
				} else {
					await tx
						.update(commentVotes)
						.set({ voteType: value })
						.where(
							and(
								eq(commentVotes.userId, userId),
								eq(commentVotes.commentId, id),
							),
						);
				}

				if (authorId !== userId) {
					// Revert old
					let revertAmount = 0;
					if (existingVote.voteType === 1) {
						revertAmount = -(isPost ? 10 : 5);
					} else if (existingVote.voteType === -1) {
						revertAmount = 2;
					}
					if (revertAmount !== 0) {
						await tx.insert(reputationLogs).values({
							userId: authorId,
							amount: revertAmount,
							reason: `revert_${type}_${existingVote.voteType === 1 ? "upvote" : "downvote"}`,
							targetId: id,
							targetType: type,
						});
					}

					// Apply new
					let applyAmount = 0;
					if (value === 1) {
						applyAmount = isPost ? 10 : 5;
					} else if (value === -1) {
						applyAmount = -2;
					}
					if (applyAmount !== 0) {
						await tx.insert(reputationLogs).values({
							userId: authorId,
							amount: applyAmount,
							reason: `${type}_${value === 1 ? "upvote" : "downvote"}`,
							targetId: id,
							targetType: type,
						});
					}
				}
			}
		} else {
			if (value !== 0) {
				// Insert new vote
				if (isPost) {
					await tx.insert(postVotes).values({
						userId,
						postId: id,
						voteType: value,
					});
				} else {
					await tx.insert(commentVotes).values({
						userId,
						commentId: id,
						voteType: value,
					});
				}

				if (authorId !== userId) {
					let amount = 0;
					if (value === 1) {
						amount = isPost ? 10 : 5;
					} else if (value === -1) {
						amount = -2;
					}

					if (amount !== 0) {
						await tx.insert(reputationLogs).values({
							userId: authorId,
							amount,
							reason: `${type}_${value === 1 ? "upvote" : "downvote"}`,
							targetId: id,
							targetType: type,
						});
					}
				}
			}
		}
	});

	// Return new score
	let updated: { score: number } | undefined;
	if (isPost) {
		updated = await db
			.select({ score: communityPosts.score })
			.from(communityPosts)
			.where(eq(communityPosts.id, id))
			.limit(1)
			.then((rows) => rows[0]);
	} else {
		updated = await db
			.select({ score: communityComments.score })
			.from(communityComments)
			.where(eq(communityComments.id, id))
			.limit(1)
			.then((rows) => rows[0]);
	}

	return { score: updated?.score || 0 };
}
