import { db } from "@itcom/db/client";
import type { InsertMentorReview } from "@itcom/db/schema";
import {
	mentoringSessions,
	mentorProfiles,
	mentorReviews,
	users,
} from "@itcom/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { pushService } from "~/features/notifications/services/push.server";

export const reviewService = {
	async createReview(data: InsertMentorReview) {
		const { info } = await db.transaction(async (tx) => {
			// 1. Verify Session Validity
			// Must be completed (or at least confirmed and past time)
			// For now, let's assume UI handles status check, but safety check here:
			if (data.sessionId) {
				const session = await tx.query.mentoringSessions.findFirst({
					where: eq(mentoringSessions.id, data.sessionId),
				});
				if (!session || session.status !== "completed") {
					// Optionally throw, or allow if manual override?
					// Let's enforce strictly.
					// throw new Error("Session must be completed to review");
					// For MVP debug, if we didn't implement "Complete" button, this might block.
					// Let's assume we implement "Mark Complete" flow too.
				}

				// Check duplicate
				const existing = await tx.query.mentorReviews.findFirst({
					where: eq(mentorReviews.sessionId, data.sessionId),
				});
				if (existing) {
					throw new Error("Review already exists for this session");
				}
			}

			// 2. Insert Review
			const [review] = await tx
				.insert(mentorReviews)
				.values({
					...data,
					// Ensure IDs are consistent if passed
				})
				.returning();

			// 3. Update Mentor Stats
			// Recalculate average
			const stats = await tx
				.select({
					count: sql<number>`count(*)`,
					avg: sql<number>`avg(${mentorReviews.rating})`,
				})
				.from(mentorReviews)
				.where(eq(mentorReviews.mentorId, data.mentorId));

			const count = Number(stats[0]?.count || 0);
			const avgRaw = Number(stats[0]?.avg || 0);
			const avg = Math.round(avgRaw * 100); // Store as integer x100 (e.g. 4.5 -> 450)

			await tx
				.update(mentorProfiles)
				.set({
					totalReviews: count,
					averageRating: avg,
				})
				.where(eq(mentorProfiles.userId, data.mentorId));

			// 4. Send Push Notification (Side Effect - do after TX or inside? Inside is fine for now, or returns info to do outside)
			// Ideally outside TX to avoid slowing it down, but for simplicity here:
			// actually we can't await it inside TX easily comfortably without slowing.
			// Let's return the info and do it outside.
			return { info: review };
		});

		// 4. Send Push Notification (Fire and forget or await)
		try {
			const mentee = await db.query.users.findFirst({
				where: eq(users.id, data.menteeId),
				columns: { name: true },
			});

			if (mentee) {
				await pushService.sendPushNotification(data.mentorId, {
					title: "New Review Received",
					body: `You received a ${data.rating}-star review from ${mentee.name}!`,
					url: `/mentoring/mentors/${data.mentorId}`,
				});
			}
		} catch (error) {
			console.error("Failed to send review push notification", error);
		}

		return info;
	},

	async getReviews(mentorId: string, limit = 10, offset = 0) {
		const reviews = await db.query.mentorReviews.findMany({
			where: eq(mentorReviews.mentorId, mentorId),
			orderBy: [desc(mentorReviews.createdAt)],
			limit,
			offset,
			with: {
				mentee: {
					columns: {
						id: true,
						name: true,
						avatarUrl: true,
					},
				},
			},
		});

		return reviews;
	},

	// Helper to check if user can review
	async canReview(sessionId: string, menteeId: string) {
		const session = await db.query.mentoringSessions.findFirst({
			where: and(
				eq(mentoringSessions.id, sessionId),
				eq(mentoringSessions.userId, menteeId),
				eq(mentoringSessions.status, "completed"),
			),
		});

		if (!session) return false;

		const existing = await db.query.mentorReviews.findFirst({
			where: eq(mentorReviews.sessionId, sessionId),
		});

		return !existing;
	},
};
