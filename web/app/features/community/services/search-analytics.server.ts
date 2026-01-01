import { db } from "@itcom/db/client";
import { searchAnalytics } from "@itcom/db/schema";
import { desc, gte, sql } from "drizzle-orm";

export interface SearchAnalyticsStats {
	query: string;
	count: number;
	percentage: number;
}

export interface TrendingTopic {
	query: string;
	searches: number;
	resultCount: number;
	trending: boolean; // true if trending up
}

/**
 * Logs a search query to analytics (anonymous - no user ID)
 */
export async function logSearch({
	query,
	resultCount,
	category,
	resultIds,
}: {
	query: string;
	resultCount: number;
	category?: string;
	resultIds?: string[];
}): Promise<void> {
	try {
		await db.insert(searchAnalytics).values({
			query: query.toLowerCase().trim(),
			resultCount,
			category,
			resultIds: resultIds || [],
		});

		console.log(
			`[Search Analytics] Logged: "${query}" (${resultCount} results)`,
		);
	} catch (error) {
		console.error("[Search Analytics] Error logging search:", error);
		// Don't throw - analytics logging should not block search
	}
}

/**
 * Gets top search queries for the past 7 days
 */
export async function getTopSearches(
	limit = 10,
): Promise<SearchAnalyticsStats[]> {
	try {
		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

		// Get all searches in the period with counts
		const results = await db
			.select({
				query: searchAnalytics.query,
				count: sql<number>`COUNT(*)`,
			})
			.from(searchAnalytics)
			.where(gte(searchAnalytics.createdAt, sevenDaysAgo))
			.groupBy(searchAnalytics.query)
			.orderBy((t) => desc(t.count))
			.limit(limit);

		// Get total searches for percentage calculation
		const totalRow = await db
			.select({ total: sql<number>`COUNT(*)` })
			.from(searchAnalytics)
			.where(gte(searchAnalytics.createdAt, sevenDaysAgo));

		const total = totalRow[0]?.total || 1;

		return results.map((r) => ({
			query: r.query,
			count: r.count,
			percentage: Math.round((r.count / total) * 100),
		}));
	} catch (error) {
		console.error("[Search Analytics] Error getting top searches:", error);
		return [];
	}
}

/**
 * Gets trending topics (comparison: last 7 days vs previous 7 days)
 */
export async function getTrendingTopics(limit = 5): Promise<TrendingTopic[]> {
	try {
		const now = new Date();
		const week1Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const week2Start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

		// Current week searches
		const currentWeek = await db
			.select({
				query: searchAnalytics.query,
				count: sql<number>`COUNT(*)`,
				avgResults: sql<number>`ROUND(AVG(result_count))`,
			})
			.from(searchAnalytics)
			.where(gte(searchAnalytics.createdAt, week1Start))
			.groupBy(searchAnalytics.query);

		// Previous week searches
		const previousWeek = await db
			.select({
				query: searchAnalytics.query,
				count: sql<number>`COUNT(*)`,
			})
			.from(searchAnalytics)
			.where(sql`created_at >= ${week2Start} AND created_at < ${week1Start}`);

		// Create map of previous week data
		const prevMap = new Map(previousWeek.map((r) => [r.query, r.count]));

		// Calculate trending
		const trending = currentWeek
			.map((curr) => {
				const prevCount = prevMap.get(curr.query) || 0;
				const isTrending = curr.count > prevCount;

				return {
					query: curr.query,
					searches: curr.count,
					resultCount: Math.round(curr.avgResults),
					trending: isTrending,
				};
			})
			// Sort by growth rate (new topics first)
			.sort((a, b) => {
				const prevA = prevMap.get(a.query) || 0;
				const prevB = prevMap.get(b.query) || 0;
				const growthA = prevA === 0 ? Infinity : a.searches / prevA;
				const growthB = prevB === 0 ? Infinity : b.searches / prevB;
				return growthB - growthA;
			})
			.slice(0, limit);

		return trending;
	} catch (error) {
		console.error("[Search Analytics] Error getting trending topics:", error);
		return [];
	}
}

/**
 * Gets zero-result searches (queries with no results)
 * Useful for identifying content gaps
 */
export async function getZeroResultSearches(
	limit = 10,
): Promise<SearchAnalyticsStats[]> {
	try {
		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

		const results = await db
			.select({
				query: searchAnalytics.query,
				count: sql<number>`COUNT(*)`,
			})
			.from(searchAnalytics)
			.where(sql`created_at >= ${sevenDaysAgo} AND result_count = 0`)
			.groupBy(searchAnalytics.query)
			.orderBy((t) => desc(t.count))
			.limit(limit);

		// Get total zero-result searches for percentage
		const totalRow = await db
			.select({ total: sql<number>`COUNT(*)` })
			.from(searchAnalytics)
			.where(sql`created_at >= ${sevenDaysAgo} AND result_count = 0`);

		const total = totalRow[0]?.total || 1;

		return results.map((r) => ({
			query: r.query,
			count: r.count,
			percentage: Math.round((r.count / total) * 100),
		}));
	} catch (error) {
		console.error(
			"[Search Analytics] Error getting zero-result searches:",
			error,
		);
		return [];
	}
}

/**
 * Gets search analytics summary
 */
export async function getSearchAnalyticsSummary() {
	try {
		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

		// Total searches
		const totalRow = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(searchAnalytics)
			.where(gte(searchAnalytics.createdAt, sevenDaysAgo));

		// Unique queries
		const uniqueRow = await db
			.select({ count: sql<number>`COUNT(DISTINCT query)` })
			.from(searchAnalytics)
			.where(gte(searchAnalytics.createdAt, sevenDaysAgo));

		// Zero-result count
		const zeroResultRow = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(searchAnalytics)
			.where(sql`created_at >= ${sevenDaysAgo} AND result_count = 0`);

		return {
			totalSearches: totalRow[0]?.count || 0,
			uniqueQueries: uniqueRow[0]?.count || 0,
			zeroResultSearches: zeroResultRow[0]?.count || 0,
		};
	} catch (error) {
		console.error("[Search Analytics] Error getting summary:", error);
		return {
			totalSearches: 0,
			uniqueQueries: 0,
			zeroResultSearches: 0,
		};
	}
}
