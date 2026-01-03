import { requireUserId } from "~/features/auth/utils/session.server";
import { storageService } from "~/features/storage/services/storage.server";
import { BadRequestError, loaderHandler } from "~/shared/lib";
import type { Route } from "./+types/api.presigned";

export const loader = loaderHandler(async ({ request }: Route.LoaderArgs) => {
	const userId = await requireUserId(request);
	const url = new URL(request.url);
	const filename = url.searchParams.get("filename");
	const mimeType = url.searchParams.get("type");
	const size = Number(url.searchParams.get("size"));

	if (!filename || !mimeType || !size) {
		throw new BadRequestError("Missing parameters");
	}

	const presigned = await storageService.generatePresignedUrl(
		userId,
		filename,
		mimeType,
		size,
	);
	return presigned;
});
