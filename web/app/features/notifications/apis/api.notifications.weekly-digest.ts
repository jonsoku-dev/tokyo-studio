import type { ActionFunctionArgs } from "react-router";
import {
	actionHandler,
	BadRequestError,
	InternalError,
	UnauthorizedError,
} from "~/shared/lib";

import { weeklyDigestCronHandler } from "../services/weekly-digest.server";

/**
 * Cron endpoint for sending weekly digests
 * Call this via cron job (e.g., Sunday 8:00 AM UTC)
 *
 * Example cron configurations:
 *
 * 1. Using Vercel Cron (vercel.json):
 *    {
 *      "crons": [{
 *        "path": "/api/cron/weekly-digest",
 *        "schedule": "0 8 * * 0"  // Sunday 8:00 AM UTC
 *      }]
 *    }
 *
 * 2. Using node-cron in separate service
 * 3. Using external cron service (e.g., cron-job.org)
 *
 * Security: Add authorization header check if exposing publicly
 */
export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	// Only allow POST requests
	if (request.method !== "POST") {
		throw new BadRequestError("Method not allowed");
	}

	// Security check: Verify cron secret (if running on Vercel or similar)
	const cronSecret = request.headers.get("authorization");
	if (
		process.env.CRON_SECRET &&
		cronSecret !== `Bearer ${process.env.CRON_SECRET}`
	) {
		throw new UnauthorizedError("Unauthorized");
	}

	try {
		console.log("[API] Weekly digest cron triggered");
		await weeklyDigestCronHandler();

		return {
			success: true,
			message: "Weekly digest cron completed successfully",
			timestamp: new Date().toISOString(),
		};
	} catch (error) {
		console.error("[API] Weekly digest cron failed:", error);

		throw new InternalError(
			error instanceof Error ? error.message : "Unknown error",
		);
	}
});
