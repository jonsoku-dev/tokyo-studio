import { db } from "@itcom/db/client";
import { mentorReviews, reviewModerationLogs, users } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { type ActionFunctionArgs, data } from "react-router";
import { z } from "zod";
import { requireUserId } from "~/features/auth/utils/session.server";

/**
 * Admin endpoint: POST /api/admin/review/:reviewId/moderate
 *
 * Actions: flag, hide, unhide, delete
 */
const moderationSchema = z.object({
	action: z.enum(["flag", "hide", "unhide", "delete"]),
	reason: z.string().min(10).max(500),
});

async function requireAdmin(request: Request) {
	const userId = await requireUserId(request);
	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
	});
	if (!user || user.role !== "admin") {
		throw new Response("Unauthorized", { status: 403 });
	}
	return userId;
}

export async function action({ request, params }: ActionFunctionArgs) {
	if (request.method !== "POST") {
		return data({ error: "Method not allowed" }, { status: 405 });
	}

	const adminId = await requireAdmin(request);

	if (!params.reviewId) {
		return data({ error: "Review ID is required" }, { status: 400 });
	}

	try {
		const body = await request.json();
		const validationResult = moderationSchema.safeParse(body);

		if (!validationResult.success) {
			return data(
				{
					error: "Invalid request data",
					details: validationResult.error.flatten(),
				},
				{ status: 400 },
			);
		}

		const { action, reason } = validationResult.data;

		// Verify review exists
		const review = await db.query.mentorReviews.findFirst({
			where: eq(mentorReviews.id, params.reviewId),
		});

		if (!review) {
			return data({ error: "Review not found" }, { status: 404 });
		}

		// Update review status based on action
		let newStatus = review.status;
		if (action === "flag") {
			newStatus = "flagged";
		} else if (action === "hide") {
			newStatus = "hidden";
		} else if (action === "unhide") {
			newStatus = "published";
		} else if (action === "delete") {
			newStatus = "deleted";
		}

		// Update review
		await db
			.update(mentorReviews)
			.set({
				status: newStatus,
				updatedAt: new Date(),
			})
			.where(eq(mentorReviews.id, params.reviewId));

		// Log moderation action
		await db.insert(reviewModerationLogs).values({
			reviewId: params.reviewId,
			adminId,
			action,
			reason,
		});

		return data({
			success: true,
			reviewId: params.reviewId,
			newStatus,
		});
	} catch (error) {
		console.error("Review moderation error:", error);
		return data(
			{
				error:
					error instanceof Error ? error.message : "Failed to moderate review",
			},
			{ status: 500 },
		);
	}
}
