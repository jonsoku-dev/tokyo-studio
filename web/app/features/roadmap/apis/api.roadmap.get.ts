import { data } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { getRoadmap } from "../services/roadmap.server";

/**
 * GET /api/roadmap
 *
 * Fetches the complete roadmap with all tasks and progress
 * This is the single source of truth for roadmap data
 */
export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request);

	if (request.method !== "GET") {
		return data({ error: "Method not allowed" }, { status: 405 });
	}

	try {
		const roadmapData = await getRoadmap(userId);
		return data(roadmapData);
	} catch (error) {
		console.error("[API] Get roadmap error:", error);
		const message = error instanceof Error ? error.message : "Failed to fetch roadmap";
		return data({ error: message }, { status: 500 });
	}
}
