import { data } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { avatarService } from "../services/avatar.server";
import type { Route } from "./+types/avatar";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireUserId(request);

	if (request.method === "DELETE") {
		await avatarService.deleteAvatar(userId);
		return { success: true };
	}

	if (request.method === "POST") {
		try {
			const formData = await request.formData();
			const file = formData.get("file") as File;

			if (!file || file.size === 0) {
				return data({ error: "No file uploaded" }, { status: 400 });
			}

			if (file.size > MAX_FILE_SIZE) {
				return data({ error: "File size exceeds 5MB limit" }, { status: 400 });
			}

			const buffer = Buffer.from(await file.arrayBuffer());
			const avatarUrl = await avatarService.uploadAvatar(userId, buffer);

			return { success: true, avatarUrl };
		} catch (error: unknown) {
			console.error("Avatar upload error:", error);
			const message =
				error instanceof Error ? error.message : "Failed to upload avatar";
			return data({ error: message }, { status: 500 });
		}
	}

	return data({ error: "Method not allowed" }, { status: 405 });
}
