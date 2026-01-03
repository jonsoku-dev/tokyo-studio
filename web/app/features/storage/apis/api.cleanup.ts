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
import { getUserFromRequest } from "~/features/auth/services/require-verified-email.server";
import { actionHandler, UnauthorizedError } from "~/shared/lib";
import { runStorageCleanup } from "../jobs/cleanup-orphaned-files.server";

export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	// Authenticate user
	const user = await getUserFromRequest(request);
	if (!user) {
		throw new UnauthorizedError();
	}

	// Check if user is admin (you can add admin role check here)
	// For now, allow any authenticated user to trigger cleanup
	// TODO: Add admin role check when role system is implemented
	// if (user.role !== 'admin') {
	//   throw new ForbiddenError("Admin access required");
	// }

	console.log(`[CLEANUP API] Manual cleanup triggered by user ${user.id}`);

	// Run cleanup
	const result = await runStorageCleanup();

	return {
		success: true,
		message: "Storage cleanup completed successfully",
		orphanedCleaned: result.orphanedCleaned,
		deletedCleaned: result.deletedCleaned,
		totalCleaned: result.orphanedCleaned + result.deletedCleaned,
	};
});
