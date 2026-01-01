import { requireUserId } from "~/features/auth/utils/session.server";
import { notificationsService } from "~/features/community/services/notifications.server";
import { actionHandler, BadRequestError, loaderHandler } from "~/shared/lib";
import type { Route } from "./+types/api.notifications.server";

export const loader = loaderHandler(async ({ request }: Route.LoaderArgs) => {
	const userId = await requireUserId(request);
	const notifications = await notificationsService.getUserNotifications(userId);
	return { notifications };
});

export const action = actionHandler(async ({ request }: Route.ActionArgs) => {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "markRead") {
		const id = formData.get("id") as string;
		if (id) {
			await notificationsService.markAsRead(id, userId);
		}
		return { success: true };
	}

	if (intent === "markAllRead") {
		await notificationsService.markAllAsRead(userId);
		return { success: true };
	}

	throw new BadRequestError("Invalid intent");
});
