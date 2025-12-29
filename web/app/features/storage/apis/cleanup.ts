/**
 * SPEC 006: Manual Storage Cleanup API
 *
 * Allows administrators to manually trigger storage cleanup
 * - Cleans orphaned files (pending > 24h)
 * - Cleans deleted documents (deleted > 30 days)
 *
 * Security: Admin-only access
 */

import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { getUserFromRequest } from "~/features/auth/services/require-verified-email.server";
import { runStorageCleanup } from "../jobs/cleanup-orphaned-files.server";

export async function action({ request }: ActionFunctionArgs) {
	if (request.method !== "POST") {
		return data({ error: "Method not allowed" }, { status: 405 });
	}

	try {
		// Authenticate user
		const user = await getUserFromRequest(request);
		if (!user) {
			return data({ error: "Unauthorized" }, { status: 401 });
		}

		// Check if user is admin (you can add admin role check here)
		// For now, allow any authenticated user to trigger cleanup
		// TODO: Add admin role check when role system is implemented
		// if (user.role !== 'admin') {
		//   return data({ error: 'Forbidden' }, { status: 403 });
		// }

		console.log(`[CLEANUP API] Manual cleanup triggered by user ${user.id}`);

		// Run cleanup
		const result = await runStorageCleanup();

		return data({
			success: true,
			message: "Storage cleanup completed successfully",
			orphanedCleaned: result.orphanedCleaned,
			deletedCleaned: result.deletedCleaned,
			totalCleaned: result.orphanedCleaned + result.deletedCleaned,
		});
	} catch (error) {
		console.error("[CLEANUP API] Error:", error);
		return data(
			{
				success: false,
				error: "Failed to run storage cleanup",
			},
			{ status: 500 },
		);
	}
}
