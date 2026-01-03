import { db } from "@itcom/db/client";
import { documents } from "@itcom/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireUserId } from "~/features/auth/utils/session.server";
import { storageService } from "~/features/storage/services/storage.server";
import { actionHandler, BadRequestError, loaderHandler } from "~/shared/lib";
import type { Route } from "./+types/api.files.server";

export const loader = loaderHandler(async ({ request }: Route.LoaderArgs) => {
	const userId = await requireUserId(request);

	const files = await db.query.documents.findMany({
		where: eq(documents.userId, userId),
		orderBy: [desc(documents.createdAt)],
	});

	const usedQuota = await storageService.getUsedQuota(userId);

	return { files, usedQuota };
});

export const action = actionHandler(async ({ request }: Route.ActionArgs) => {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "finalize") {
		const key = formData.get("key") as string;
		const originalName = formData.get("originalName") as string;
		const mimeType = formData.get("mimeType") as string;
		const size = Number(formData.get("size"));
		const type = formData.get("type") as
			| "Resume"
			| "CV"
			| "Portfolio"
			| "Cover Letter";

		if (!key || !originalName || !mimeType || !size || !type) {
			throw new BadRequestError("Missing fields");
		}

		const doc = await storageService.finalizeUpload(userId, {
			key,
			originalName,
			mimeType,
			size,
			type,
		});
		return { success: true, document: doc };
	}

	if (intent === "delete") {
		const documentId = formData.get("documentId") as string;
		if (!documentId) throw new BadRequestError("Missing ID");

		await storageService.deleteFile(userId, documentId);
		return { success: true };
	}

	throw new BadRequestError("Invalid intent");
});
