import { db } from "@itcom/db/client";
import { mentorReviews, users } from "@itcom/db/schema";
import { count, desc, eq, sql } from "drizzle-orm";
import { type LoaderFunctionArgs } from "react-router";
import { loaderHandler, BadRequestError, ServiceUnavailableError } from "~/shared/lib";

/**
 * GET /api/mentoring/mentor/:mentorId/reviews
 *
 * Fetch reviews for a mentor with optional filtering
 * Query params: ?limit=10&offset=0&sortBy=recent
 */
export const loader = loaderHandler(async ({ request, params }: LoaderFunctionArgs) => {
	if (!params.mentorId) {
		throw new BadRequestError("Mentor ID is required");
	}

	const url = new URL(request.url);
	const limit = Math.min(
		Number.parseInt(url.searchParams.get("limit") || "10", 10),
		50,
	);
	const offset = Number.parseInt(url.searchParams.get("offset") || "0", 10);
	const sortBy = url.searchParams.get("sortBy") || "recent"; // recent, highest, lowest

	try {
		// Get total count
		const countResult = await db
			.select({ value: count() })
			.from(mentorReviews)
			.where(eq(mentorReviews.mentorId, params.mentorId));

		const total = countResult[0]?.value || 0;

		// Build order by based on sortBy
		const getOrderBy = () => {
			switch (sortBy) {
				case "highest":
					return [desc(mentorReviews.rating), desc(mentorReviews.createdAt)];
				case "lowest":
					return [mentorReviews.rating, desc(mentorReviews.createdAt)];
				default:
					return [desc(mentorReviews.createdAt)];
			}
		};

		// Get reviews with user info
		const reviews = await db
			.select({
				id: mentorReviews.id,
				rating: mentorReviews.rating,
				text: mentorReviews.text,
				isAnonymous: mentorReviews.isAnonymous,
				status: mentorReviews.status,
				createdAt: mentorReviews.createdAt,
				mentee: {
					id: users.id,
					name: users.name,
					avatarUrl: users.avatarUrl,
				},
			})
			.from(mentorReviews)
			.leftJoin(users, eq(mentorReviews.menteeId, users.id))
			.where(eq(mentorReviews.mentorId, params.mentorId))
			.orderBy(...getOrderBy())
			.limit(limit)
			.offset(offset);

		// Filter out mentee info if anonymous
		const filteredReviews = reviews.map((review) => ({
			...review,
			mentee: review.isAnonymous ? null : review.mentee,
		}));

		// Calculate stats
		const statsResult = await db
			.select({
				totalCount: count(),
				avgRating: sql<number>`AVG(${mentorReviews.rating})`.as("avg_rating"),
			})
			.from(mentorReviews)
			.where(eq(mentorReviews.mentorId, params.mentorId));

		const stats = {
			totalReviews: statsResult[0]?.totalCount || 0,
			averageRating: (statsResult[0]?.avgRating || 0).toFixed(2),
		};

		return {
			reviews: filteredReviews,
			pagination: {
				total,
				limit,
				offset,
				hasMore: offset + limit < total,
			},
			stats,
		};
	} catch (error) {
		console.error("Error fetching reviews:", error);
		throw new ServiceUnavailableError("Failed to fetch reviews");
	}
});
