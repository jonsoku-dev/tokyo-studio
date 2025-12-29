import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { db } from "@itcom/db/client";
import { mentorReviews, users } from "@itcom/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/mentoring/mentor/:mentorId/reviews
 *
 * Fetch reviews for a mentor with optional filtering
 * Query params: ?limit=10&offset=0&sortBy=recent
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
	if (!params.mentorId) {
		return json({ error: "Mentor ID is required" }, { status: 400 });
	}

	const url = new URL(request.url);
	const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 50);
	const offset = parseInt(url.searchParams.get("offset") || "0");
	const sortBy = url.searchParams.get("sortBy") || "recent"; // recent, highest, lowest

	try {
		// Get total count
		const countResult = await db
			.select({ count: db.$count })
			.from(mentorReviews)
			.where(eq(mentorReviews.mentorId, params.mentorId));

		const total = countResult[0]?.count || 0;

		// Build order by based on sortBy
		let orderBy;
		switch (sortBy) {
			case "highest":
				orderBy = [desc(mentorReviews.rating), desc(mentorReviews.createdAt)];
				break;
			case "lowest":
				orderBy = [mentorReviews.rating, desc(mentorReviews.createdAt)];
				break;
			case "recent":
			default:
				orderBy = [desc(mentorReviews.createdAt)];
				break;
		}

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
			.leftJoin(
				users,
				eq(
					mentorReviews.menteeId,
					users.id,
				),
			)
			.where(eq(mentorReviews.mentorId, params.mentorId))
			.orderBy(...orderBy)
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
				count: db.$count,
				avgRating:
					db.sql`AVG(${mentorReviews.rating})`.as("avg_rating"),
				distribution: db.sql`
					json_object_agg(
						${mentorReviews.rating}::text,
						count(*)
					)
				`.as("distribution"),
			})
			.from(mentorReviews)
			.where(eq(mentorReviews.mentorId, params.mentorId));

		const stats = {
			totalReviews: statsResult[0]?.count || 0,
			averageRating: parseFloat(
				(statsResult[0]?.avgRating || 0).toString(),
			).toFixed(2),
			distribution: statsResult[0]?.distribution || {},
		};

		return json({
			reviews: filteredReviews,
			pagination: {
				total,
				limit,
				offset,
				hasMore: offset + limit < total,
			},
			stats,
		});
	} catch (error) {
		console.error("Error fetching reviews:", error);
		return json(
			{
				error: "Failed to fetch reviews",
			},
			{ status: 500 },
		);
	}
}
