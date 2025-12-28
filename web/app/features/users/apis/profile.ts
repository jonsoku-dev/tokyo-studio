import { data } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { profileService } from "../services/profile.server";
import type { Route } from "./+types/profile";

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireUserId(request);
	const formData = await request.formData();

	const bio = formData.get("bio") as string;
	const website = formData.get("website") as string;
	const linkedinUrl = formData.get("linkedinUrl") as string;
	const githubUrl = formData.get("githubUrl") as string;
	const slug = formData.get("slug") as string;

	// Slug uniqueness check
	if (slug) {
		const isAvailable = await profileService.isSlugAvailable(slug, userId);
		if (!isAvailable) {
			return data(
				{ error: "This URL is already taken", success: false },
				{ status: 400 },
			);
		}
	}

	try {
		await profileService.updateProfile(userId, {
			bio,
			website,
			linkedinUrl,
			githubUrl,
			slug: slug || undefined, // Only update if provided
		});

		return { success: true, error: null };
	} catch (_error) {
		return data(
			{ error: "Failed to update profile", success: false },
			{ status: 500 },
		);
	}
}
