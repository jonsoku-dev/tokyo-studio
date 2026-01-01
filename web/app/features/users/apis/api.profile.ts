import { requireUserId } from "~/features/auth/utils/session.server";
import { actionHandler, ConflictError } from "~/shared/lib";
import { profileService } from "../services/profile.server";
import type { Route } from "./+types/api.profile";

export const action = actionHandler(async ({ request }: Route.ActionArgs) => {
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
			throw new ConflictError("This URL is already taken");
		}
	}

	await profileService.updateProfile(userId, {
		bio,
		website,
		linkedinUrl,
		githubUrl,
		slug: slug || undefined, // Only update if provided
	});

	return { success: true, error: null };
});
