import { requireUserId } from "~/features/auth/utils/session.server";
import { actionHandler, InternalError } from "~/shared/lib";
import { profileService } from "../services/profile.server";
import type { Route } from "./+types/api.privacy";

export const action = actionHandler(async ({ request }: Route.ActionArgs) => {
	const userId = await requireUserId(request);
	const formData = await request.formData();

	const hideEmail = formData.get("hideEmail") === "true";
	const hideFullName = formData.get("hideFullName") === "true";
	const hideActivity = formData.get("hideActivity") === "true";

	try {
		await profileService.updatePrivacySettings(userId, {
			hideEmail,
			hideFullName,
			hideActivity,
		});

		return { success: true };
	} catch (_error) {
		throw new InternalError("Failed to update privacy settings");
	}
});
