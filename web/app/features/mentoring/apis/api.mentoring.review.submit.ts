import { type ActionFunctionArgs, data } from "react-router";
import { z } from "zod";

import { requireUserId } from "~/features/auth/utils/session.server";
import { reviewService } from "../services/review.server";

// Zod schema for review submission
const submitReviewSchema = z.object({
	sessionId: z.string().uuid(),
	rating: z.number().int().min(1).max(5),
	text: z.string().max(2000).optional(),
	isAnonymous: z.boolean().default(false),
});

export async function action({ request }: ActionFunctionArgs) {
	if (request.method !== "POST") {
		return data({ error: "Method not allowed" }, { status: 405 });
	}

	const userId = await requireUserId(request);

	try {
		const body = await request.json();
		const validationResult = submitReviewSchema.safeParse(body);

		if (!validationResult.success) {
			return data(
				{
					error: "Invalid request data",
					details: validationResult.error.flatten(),
				},
				{ status: 400 },
			);
		}

		const { sessionId, rating, text, isAnonymous } = validationResult.data;

		// Verify user can review this session
		const canReview = await reviewService.canReview(sessionId, userId);
		if (!canReview) {
			return data(
				{
					error:
						"You cannot review this session. Either the session is not completed or you already reviewed it.",
				},
				{ status: 403 },
			);
		}

		// Get session to find mentor ID
		const { db } = await import("@itcom/db/client");
		const { mentoringSessions } = await import("@itcom/db/schema");
		const { eq } = await import("drizzle-orm");

		const session = await db.query.mentoringSessions.findFirst({
			where: eq(mentoringSessions.id, sessionId),
		});

		if (!session) {
			return data({ error: "Session not found" }, { status: 404 });
		}

		// Create review
		const review = await reviewService.createReview({
			sessionId,
			menteeId: userId,
			mentorId: session.mentorId,
			rating,
			text: text || null,
			isAnonymous,
			status: "published", // Default status
		});

		return data(
			{
				success: true,
				reviewId: review.id,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Review submission error:", error);
		return data(
			{
				error:
					error instanceof Error ? error.message : "Failed to submit review",
			},
			{ status: 500 },
		);
	}
}
