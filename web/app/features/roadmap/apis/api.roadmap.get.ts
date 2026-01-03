import type { LoaderFunctionArgs } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { loaderHandler } from "~/shared/lib";
import { getRoadmap } from "../services/roadmap.server";

/**
 * GET /api/roadmap
 *
 * Fetches the complete roadmap with all tasks and progress
 * This is the single source of truth for roadmap data
 */
export const loader = loaderHandler(async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request);
	return getRoadmap(userId);
});
