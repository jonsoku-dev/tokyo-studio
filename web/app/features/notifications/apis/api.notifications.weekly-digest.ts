import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
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
export const action: ActionFunction = async ({ request }) => {
	// Only allow POST requests
	if (request.method !== "POST") {
		return json(
			{ error: "Method not allowed" },
			{ status: 405 },
		);
	}

	// Security check: Verify cron secret (if running on Vercel or similar)
	const cronSecret = request.headers.get("authorization");
	if (process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
		return json(
			{ error: "Unauthorized" },
			{ status: 401 },
		);
	}

	try {
		console.log("[API] Weekly digest cron triggered");
		await weeklyDigestCronHandler();

		return json(
			{
				success: true,
				message: "Weekly digest cron completed successfully",
				timestamp: new Date().toISOString(),
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("[API] Weekly digest cron failed:", error);

		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toISOString(),
			},
			{ status: 500 },
		);
	}
};
