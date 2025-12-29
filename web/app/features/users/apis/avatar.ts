import { data } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { avatarService } from "../services/avatar.server";
import {
	getIpAddressFromRequest,
	getUserAgentFromRequest,
	logAvatarChange,
} from "../services/avatar-logger.server";
import { checkAvatarUploadRateLimit } from "../services/avatar-rate-limiter.server";
import type { Route } from "./+types/avatar";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function action({ request }: Route.ActionArgs) {
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
			return data({ error: message }, { status: 500 });
		}
	}

	if (request.method === "POST") {
		try {
			// Check rate limit
			const rateLimitCheck = checkAvatarUploadRateLimit(userId);
			if (!rateLimitCheck.allowed) {
				return data(
					{
						error: `Rate limit exceeded. Please try again in ${rateLimitCheck.retryAfter} seconds.`,
					},
					{ status: 429 },
				);
			}

			const formData = await request.formData();
			const file = formData.get("file") as File;

			if (!file || file.size === 0) {
				return data({ error: "No file uploaded" }, { status: 400 });
			}

			if (file.size > MAX_FILE_SIZE) {
				return data({ error: "File size exceeds 5MB limit" }, { status: 400 });
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
			console.error("Avatar upload error:", error);
			const message =
				error instanceof Error ? error.message : "Failed to upload avatar";
			return data({ error: message }, { status: 500 });
		}
	}

	return data({ error: "Method not allowed" }, { status: 405 });
}
