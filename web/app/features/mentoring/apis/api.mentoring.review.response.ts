import { db } from "@itcom/db/client";
import { mentorReviewResponses, mentorReviews } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { type ActionFunctionArgs, data } from "react-router";
import { z } from "zod";
import { requireUserId } from "~/features/auth/utils/session.server";

/**
 * POST /api/mentoring/review/:reviewId/response
 *
 * Mentor responds to a review
 */
const responseSchema = z.object({
	text: z.string().min(10).max(1000),
});

export async function action({ request, params }: ActionFunctionArgs) {
	if (request.method !== "POST") {
		return data({ error: "Method not allowed" }, { status: 405 });
	}

	const mentorId = await requireUserId(request);

	if (!params.reviewId) {
		return data({ error: "Review ID is required" }, { status: 400 });
	}

	try {
		const body = await request.json();
		const validationResult = responseSchema.safeParse(body);

		if (!validationResult.success) {
			return data(
				{
					error: "Invalid request data",
					details: validationResult.error.flatten(),
				},
				{ status: 400 },
			);
		}

		const { text } = validationResult.data;

		// Verify review exists and user is the mentor
		const review = await db.query.mentorReviews.findFirst({
			where: eq(mentorReviews.id, params.reviewId),
		});

		if (!review) {
			return data({ error: "Review not found" }, { status: 404 });
		}

		if (review.mentorId !== mentorId) {
			return data(
				{ error: "You are not authorized to respond to this review" },
				{ status: 403 },
			);
		}

		// Check if response already exists
		const existingResponse = await db.query.mentorReviewResponses.findFirst({
			where: eq(mentorReviewResponses.reviewId, params.reviewId),
		});

		if (existingResponse) {
			return data(
				{ error: "You have already responded to this review" },
				{ status: 400 },
			);
		}

		// Insert response
		const [response] = await db
			.insert(mentorReviewResponses)
			.values({
				reviewId: params.reviewId,
				mentorId,
				text,
			})
			.returning();

		// TODO: Send notification to mentee

		return data(
			{
				success: true,
				responseId: response.id,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Review response error:", error);
		return data(
			{
				error:
					error instanceof Error ? error.message : "Failed to submit response",
			},
			{ status: 500 },
		);
	}
}
