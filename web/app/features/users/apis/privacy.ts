import { data } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { profileService } from "../services/profile.server";
import type { Route } from "./+types/privacy";

export async function action({ request }: Route.ActionArgs) {
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
		return data(
			{ error: "Failed to update privacy settings" },
			{ status: 500 },
		);
	}
}
