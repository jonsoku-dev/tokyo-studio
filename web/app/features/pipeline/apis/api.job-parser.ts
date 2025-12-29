import { data } from "react-router";
import { z } from "zod";
import { requireUserId } from "../../auth/utils/session.server";
import { parserService } from "../parser/parser.server";

const parseRequestSchema = z.object({
	url: z.string().url(),
	forceRefresh: z.boolean().optional().default(false),
});

/**
 * API: POST /api/jobs/parse
 * Body: { url: string, forceRefresh?: boolean }
 */
export async function action({ request }: { request: Request }) {
	// 1. Auth check
	await requireUserId(request);

	if (request.method !== "POST") {
		return data({ error: "Method not allowed" }, { status: 405 });
	}

	try {
		// 2. Parse request
		const body = await request.json();
		const { url, forceRefresh } = parseRequestSchema.parse(body);

		// 3. Process with parser service (pass forceRefresh)
		const result = await parserService.parse(url, forceRefresh);

		return data(result);
	} catch (error) {
		console.error("[JobParserAPI] Error:", error);
		if (error instanceof z.ZodError) {
			return data({ error: "Invalid URL format" }, { status: 400 });
		}
		// FR-008: Graceful error message for timeout/403
		const errorMessage =
			error instanceof Error ? error.message : "Failed to parse job posting";
		const isNetworkError =
			errorMessage.includes("Failed to fetch") ||
			errorMessage.includes("timeout");

		return data(
			{
				error: isNetworkError
					? "Unable to reach job site. Please enter details manually."
					: errorMessage,
			},
			{ status: 500 },
		);
	}
}
