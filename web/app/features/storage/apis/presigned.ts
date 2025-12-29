import { data } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { storageService } from "~/features/storage/services/storage.server";
import type { Route } from "./+types/presigned";

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request);
	const url = new URL(request.url);
	const filename = url.searchParams.get("filename");
	const mimeType = url.searchParams.get("type");
	const size = Number(url.searchParams.get("size"));

	if (!filename || !mimeType || !size) {
		throw data({ error: "Missing parameters" }, { status: 400 });
	}

	try {
		const presigned = await storageService.generatePresignedUrl(
			userId,
			filename,
			mimeType,
			size,
		);
		return presigned;
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Unknown error";
		throw data({ error: message }, { status: 400 });
	}
}
