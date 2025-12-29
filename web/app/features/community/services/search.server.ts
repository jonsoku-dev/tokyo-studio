import { db } from "@itcom/db/client";
import { communityPosts, users } from "@itcom/db/schema";
import { sql } from "drizzle-orm";
import { logSearch } from "./search-analytics.server";

// Execute full-text search
export async function searchPosts({
	query,
	category,
	time,
	sort = "relevance",
	limit = 20,
	offset = 0,
}: {
	query: string;
	category?: string;
	time?: string;
	sort?: string;
	limit?: number;
	offset?: number;
}) {
	// Construct the base query with relevance ranking
	// Note: We use raw sql to leverage ts_rank and filtering efficiently
	const searchVector = sql`search_vector`;
	const tsQuery = sql`websearch_to_tsquery('english', ${query})`;
	const rank = sql`ts_rank(${searchVector}, ${tsQuery})`;

	// Build WHERE clauses
	const whereClauses = [sql`${searchVector} @@ ${tsQuery}`];

	if (category && category !== "all") {
		whereClauses.push(sql`category = ${category}`);
	}

	if (time && time !== "all") {
		let interval = "1 year";
		if (time === "week") interval = "1 week";
		if (time === "month") interval = "1 month";
		if (time === "year") interval = "1 year";
		whereClauses.push(
			sql`created_at > now() - interval ${sql.raw(`'${interval}'`)}`,
		);
	}

	// Combine WHERE
	const finalWhere = sql.join(whereClauses, sql` AND `);

	// Order
	let orderBy = sql`${rank} DESC`;
	if (sort === "newest") {
		orderBy = sql`created_at DESC`;
	}

	// Execute
	const results = await db
		.select({
			id: communityPosts.id,
			title: communityPosts.title,
			content: communityPosts.content,
			category: communityPosts.category,
			createdAt: communityPosts.createdAt,
			authorId: communityPosts.authorId,
			authorName: users.name,
			authorAvatar: users.avatarUrl,
			rank: rank,
			// Generate headline with highlights
			excerpt: sql<string>`ts_headline('english', ${communityPosts.content}, ${tsQuery}, 'StartSel=<b>, StopSel=</b>, MaxWords=35, MinWords=15')`,
		})
		.from(communityPosts)
		.leftJoin(users, sql`${communityPosts.authorId} = ${users.id}`)
		.where(finalWhere)
		.orderBy(orderBy)
		.limit(limit)
		.offset(offset);

	// Log search for analytics (non-blocking)
	await logSearch({
		query,
		resultCount: results.length,
		category,
		resultIds: results.map((r) => r.id),
	});

	return results;
}

// Autocomplete suggestions
export async function getSuggestions(query: string) {
	if (!query || query.length < 2) return [];

	// Simple implementation: Search titles matching prefix or containing word
	const results = await db
		.select({
			title: communityPosts.title,
		})
		.from(communityPosts)
		.where(sql`title ILIKE ${`%${query}%`}`)
		.limit(5);

	return results.map((r) => r.title);
}
