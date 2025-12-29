import { requireUserId } from "~/features/auth/utils/session.server";
import { notificationsService } from "~/features/community/services/notifications.server";
import type { Route } from "./+types/notifications";

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request);
	const notifications = await notificationsService.getUserNotifications(userId);
	return { notifications };
}

export async function action({ request }: Route.ActionArgs) {
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

	return { error: "Invalid intent" };
}
