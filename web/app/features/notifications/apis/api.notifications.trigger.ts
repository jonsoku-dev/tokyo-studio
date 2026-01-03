import { requireUserId } from "~/features/auth/utils/session.server";
import { actionHandler } from "~/shared/lib";
import { notificationOrchestrator } from "../services/orchestrator.server";
import type { NotificationEvent } from "../types";
import type { Route } from "./+types/api.notifications.trigger";

export const action = actionHandler(async ({ request }: Route.ActionArgs) => {
	const _userId = await requireUserId(request); // Authentication check

	const formData = await request.formData();
	const eventJson = formData.get("event");

	if (!eventJson || typeof eventJson !== "string") {
		return { success: false, error: "Invalid request" };
	}

	const event: NotificationEvent = JSON.parse(eventJson);

	// Validate required fields
	if (!event.type || !event.userId || !event.payload) {
		return { success: false, error: "Missing required fields" };
	}

	// Trigger notification via orchestrator
	await notificationOrchestrator.trigger(event);

	return { success: true };
});
