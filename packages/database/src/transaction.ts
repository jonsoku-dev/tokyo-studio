import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { db } from "./client.js";
import * as schema from "./schema.js";

/**
 * Transaction wrapper for database operations
 * Provides all-or-nothing semantics with automatic rollback on failure
 */
export async function withTransaction<T>(
	callback: (tx: NodePgDatabase<typeof schema>) => Promise<T>,
): Promise<T> {
	try {
		return await db.transaction(
			async (tx: NodePgDatabase<typeof schema>) => {
				return await callback(tx);
			},
		);
	} catch (error) {
		// Log transaction failure
		console.error("[Transaction] Failed:", error);
		throw error;
	}
}

/**
 * Example usage:
 *
 * await withTransaction(async (tx) => {
 *   await tx.insert(documents).values({ ... });
 *   await tx.insert(documentVersions).values({ ... });
 * });
 */
