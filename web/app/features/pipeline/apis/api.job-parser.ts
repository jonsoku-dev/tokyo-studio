import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";
import {
	actionHandler,
	ServiceUnavailableError,
	ValidationError,
} from "~/shared/lib";
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
export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	// 1. Auth check
	await requireUserId(request);

	// 2. Parse request
	const body = await request.json();
	const validation = parseRequestSchema.safeParse(body);

	if (!validation.success) {
		throw new ValidationError(validation.error.flatten().fieldErrors);
	}

	const { url, forceRefresh } = validation.data;

	try {
		// 3. Process with parser service (pass forceRefresh)
		const result = await parserService.parse(url, forceRefresh);
		return result;
	} catch (error: unknown) {
		// FR-008: Graceful error message for timeout/403
		const errorMessage =
			error instanceof Error ? error.message : "Failed to parse job posting";
		const isNetworkError =
			errorMessage.includes("Failed to fetch") ||
			errorMessage.includes("timeout");

		if (isNetworkError) {
			throw new ServiceUnavailableError(
				"Unable to reach job site. Please enter details manually.",
			);
		}

		throw error; // Let apiHandler handle other errors (as 500 or app errors)
	}
});
