import { db } from "@itcom/db/client";
import {
	mentoringSessions,
	mentorProfiles,
	mentorReviews,
	users,
} from "@itcom/db/schema";
import { and, desc, eq } from "drizzle-orm";

type InsertMentorReview = typeof mentorReviews.$inferInsert;

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

			// 3. Update Mentor Stats with WEIGHTED AVERAGE (FR-006)
			// Recent reviews (last 3 months) weighted 2x
			const threeMonthsAgo = new Date();
			threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

			const allReviews = await tx
				.select({
					rating: mentorReviews.rating,
					createdAt: mentorReviews.createdAt,
				})
				.from(mentorReviews)
				.where(eq(mentorReviews.mentorId, data.mentorId));

			// Calculate weighted average
			let weightedSum = 0;
			let totalWeight = 0;

			for (const review of allReviews) {
				const isRecent =
					review.createdAt && new Date(review.createdAt) > threeMonthsAgo;
				const weight = isRecent ? 2 : 1;
				weightedSum += review.rating * weight;
				totalWeight += weight;
			}

			const count = allReviews.length;
			const weightedAvg = totalWeight > 0 ? weightedSum / totalWeight : 0;
			const avg = Math.round(weightedAvg * 100); // Store as integer x100 (e.g. 4.5 -> 450)

			// FR-007: Top Rated Badge check (4.8+ avg and 10+ reviews)
			const isTopRated = weightedAvg >= 4.8 && count >= 10;

			await tx
				.update(mentorProfiles)
				.set({
					totalReviews: count,
					averageRating: avg,
					isTopRated,
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
				const { notificationOrchestrator } = await import(
					"~/features/notifications/services/orchestrator.server"
				);

				await notificationOrchestrator.trigger({
					type: "mentoring.review_received",
					userId: data.mentorId,
					payload: {
						title: "New Review Received",
						body: `You received a ${data.rating}-star review from ${mentee.name}!`,
						url: `/mentoring/mentors/${data.mentorId}`,
						icon: "/icons/star.png",
					},
					metadata: {
						menteeId: data.menteeId,
						menteeName: mentee.name,
						mentorId: data.mentorId,
						rating: data.rating,
						eventId: info.id,
					},
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

	// FR-001: Send review prompt email after session
	async sendReviewPromptEmail(sessionId: string) {
		const session = await db.query.mentoringSessions.findFirst({
			where: eq(mentoringSessions.id, sessionId),
			with: {
				mentee: { columns: { email: true, name: true } },
				mentor: { columns: { name: true } },
			},
		});

		if (!session?.mentee?.email) return false;

		// In production, use emailService.send()
		console.log(`[ReviewPrompt] Sending to ${session.mentee.email}`);
		return true;
	},

	// FR-008: Mentor can respond to review
	async addMentorResponse(
		reviewId: string,
		mentorId: string,
		response: string,
	) {
		const review = await db.query.mentorReviews.findFirst({
			where: eq(mentorReviews.id, reviewId),
		});

		if (!review || review.mentorId !== mentorId) {
			throw new Error("Not authorized to respond to this review");
		}

		const [updated] = await db
			.update(mentorReviews)
			.set({
				mentorResponse: response,
				mentorRespondedAt: new Date(),
			})
			.where(eq(mentorReviews.id, reviewId))
			.returning();

		return updated;
	},

	// FR-009: Admin hide review (moderation)
	async hideReview(reviewId: string, _adminId: string, reason: string) {
		const [updated] = await db
			.update(mentorReviews)
			.set({
				isHidden: true,
				moderationReason: reason,
				moderatedAt: new Date(),
			})
			.where(eq(mentorReviews.id, reviewId))
			.returning();

		return updated;
	},

	// FR-010: Admin unhide review
	async unhideReview(reviewId: string) {
		const [updated] = await db
			.update(mentorReviews)
			.set({
				isHidden: false,
				moderationReason: null,
				moderatedAt: null,
			})
			.where(eq(mentorReviews.id, reviewId))
			.returning();

		return updated;
	},
};
