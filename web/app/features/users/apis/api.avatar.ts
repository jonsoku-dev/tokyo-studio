import { requireUserId } from "~/features/auth/utils/session.server";
import {
	AppError,
	actionHandler,
	BadRequestError,
	InternalError,
	RateLimitError,
} from "~/shared/lib";
import { avatarService } from "../services/avatar.server";
import { logAvatarChange } from "../services/avatar-logger.server";
import { checkAvatarUploadRateLimit } from "../services/avatar-rate-limiter.server";
import type { Route } from "./+types/api.avatar.server";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const action = actionHandler(async ({ request }: Route.ActionArgs) => {
	const userId = await requireUserId(request);

	if (request.method === "DELETE") {
		try {
			const currentUser = await avatarService.deleteAvatar(userId);
			logAvatarChange(
				{
					userId,
					action: "deleted",
					previousUrl: currentUser?.avatarUrl || undefined,
				},
				request,
			);
			return { success: true };
		} catch (error: unknown) {
			console.error("Avatar deletion error:", error);
			const message =
				error instanceof Error ? error.message : "Failed to delete avatar";
			throw new InternalError(message);
		}
	}

	if (request.method === "POST") {
		try {
			// Check rate limit
			const rateLimitCheck = checkAvatarUploadRateLimit(userId);
			if (!rateLimitCheck.allowed) {
				throw new RateLimitError(
					`Rate limit exceeded. Please try again in ${rateLimitCheck.retryAfter} seconds.`,
				);
			}

			const formData = await request.formData();
			const file = formData.get("file") as File;

			if (!file || file.size === 0) {
				throw new BadRequestError("No file uploaded");
			}

			if (file.size > MAX_FILE_SIZE) {
				throw new BadRequestError("File size exceeds 5MB limit");
			}

			const buffer = Buffer.from(await file.arrayBuffer());
			const { avatarUrl, avatarThumbnailUrl } =
				await avatarService.uploadAvatar(userId, buffer);

			// Log the successful upload
			logAvatarChange(
				{
					userId,
					action: "uploaded",
					newUrl: avatarUrl,
					fileSize: file.size,
				},
				request,
			);

			return {
				success: true,
				avatarUrl,
				avatarThumbnailUrl,
				remaining: rateLimitCheck.remaining,
			};
		} catch (error: unknown) {
			if (error instanceof AppError) throw error;
			console.error("Avatar upload error:", error);
			const message =
				error instanceof Error ? error.message : "Failed to upload avatar";
			throw new InternalError(message);
		}
	}

	throw new BadRequestError("Method not allowed");
});
