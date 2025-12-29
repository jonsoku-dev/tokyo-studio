import { data, type LoaderFunctionArgs } from "react-router";

import {
	getSearchAnalyticsSummary,
	getTrendingTopics,
	getZeroResultSearches,
} from "../services/search-analytics.server";

/**
 * GET /api/community/trending-topics
 * Returns trending topics from search analytics
 *
 * Query parameters:
 * - limit: Number of topics to return (default: 5)
 * - include_summary: Include analytics summary (true/false)
 * - include_gaps: Include zero-result searches (true/false)
 */
export async function loader({ request }: LoaderFunctionArgs) {
	if (request.method !== "GET") {
		return data({ error: "Method not allowed" }, { status: 405 });
	}

	try {
		const url = new URL(request.url);
		const limit = Math.min(
			Number.parseInt(url.searchParams.get("limit") || "5", 10),
			20,
		); // Cap at 20
		const includeSummary = url.searchParams.get("include_summary") === "true";
		const includeGaps = url.searchParams.get("include_gaps") === "true";

		// Get trending topics
		const topics = await getTrendingTopics(limit);

		const response: Record<string, unknown> = { topics };

		// Optionally include summary stats
		if (includeSummary) {
			response.summary = await getSearchAnalyticsSummary();
		}

		// Optionally include zero-result searches (content gaps)
		if (includeGaps) {
			response.gaps = await getZeroResultSearches(5);
		}

		return data(response, {
			headers: {
				"Cache-Control": "public, max-age=300", // Cache for 5 minutes
			},
		});
	} catch (error) {
		console.error("[API] Trending topics error:", error);

		return data(
			{
				error: "Failed to fetch trending topics",
				topics: [],
			},
			{ status: 500 },
		);
	}
}
