import { db } from "@itcom/db/client";
import { mentoringSessions } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";

import { requireUserId } from "~/features/auth/utils/session.server";
import {
	actionHandler,
	ForbiddenError,
	NotFoundError,
	ValidationError,
} from "~/shared/lib";
import { reviewService } from "../services/review.server";

// Zod schema for review submission
const submitReviewSchema = z.object({
	sessionId: z.string().uuid(),
	rating: z.number().int().min(1).max(5),
	text: z.string().max(2000).optional(),
	isAnonymous: z.boolean().default(false),
});

export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);
	const body = await request.json();
	const validationResult = submitReviewSchema.safeParse(body);

	if (!validationResult.success) {
		throw new ValidationError(validationResult.error.flatten().fieldErrors);
	}

	const { sessionId, rating, text, isAnonymous } = validationResult.data;

	// Verify user can review this session
	const canReview = await reviewService.canReview(sessionId, userId);
	if (!canReview) {
		throw new ForbiddenError(
			"You cannot review this session. Either the session is not completed or you already reviewed it.",
		);
	}

	const session = await db.query.mentoringSessions.findFirst({
		where: eq(mentoringSessions.id, sessionId),
	});

	if (!session) {
		throw new NotFoundError("Session");
	}

	// Create review
	const review = await reviewService.createReview({
		sessionId,
		menteeId: userId,
		mentorId: session.mentorId,
		rating,
		text: text || null,
		isAnonymous,
		status: "published",
	});

	return { reviewId: review.id };
});
