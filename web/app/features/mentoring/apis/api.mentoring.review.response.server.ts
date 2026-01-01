import { db } from "@itcom/db/client";
import { mentorReviewResponses, mentorReviews } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { requireUserId } from "~/features/auth/utils/session.server";
import {
	actionHandler,
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
	ValidationError,
} from "~/shared/lib";

/**
 * POST /api/mentoring/review/:reviewId/response
 *
 * Mentor responds to a review
 */
const responseSchema = z.object({
	text: z.string().min(10).max(1000),
});

export const action = actionHandler(
	async ({ request, params }: ActionFunctionArgs) => {
		const mentorId = await requireUserId(request);

		if (!params.reviewId) {
			throw new BadRequestError("Review ID is required");
		}

		const body = await request.json();
		const validationResult = responseSchema.safeParse(body);

		if (!validationResult.success) {
			throw new ValidationError(validationResult.error.flatten().fieldErrors);
		}

		const { text } = validationResult.data;

		// Verify review exists and user is the mentor
		const review = await db.query.mentorReviews.findFirst({
			where: eq(mentorReviews.id, params.reviewId),
		});

		if (!review) {
			throw new NotFoundError("Review");
		}

		if (review.mentorId !== mentorId) {
			throw new ForbiddenError(
				"You are not authorized to respond to this review",
			);
		}

		// Check if response already exists
		const existingResponse = await db.query.mentorReviewResponses.findFirst({
			where: eq(mentorReviewResponses.reviewId, params.reviewId),
		});

		if (existingResponse) {
			throw new ConflictError("You have already responded to this review");
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

		return {
			responseId: response.id,
		};
	},
);
