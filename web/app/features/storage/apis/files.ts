import { db } from "@itcom/db/client";
import { documents } from "@itcom/db/schema";
import { desc, eq } from "drizzle-orm";
import { data } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { storageService } from "~/features/storage/services/storage.server";
import type { Route } from "./+types/files";

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request);

	const files = await db.query.documents.findMany({
		where: eq(documents.userId, userId),
		orderBy: [desc(documents.createdAt)],
	});

	const usedQuota = await storageService.getUsedQuota(userId);

	return { files, usedQuota };
}

export async function action({ request }: Route.ActionArgs) {
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
			return data({ error: "Missing fields" }, { status: 400 });
		}

		try {
			const doc = await storageService.finalizeUpload(userId, {
				key,
				originalName,
				mimeType,
				size,
				type,
			});
			return { success: true, document: doc };
		} catch (e) {
			console.error(e);
			return data({ error: "Failed to save metadata" }, { status: 500 });
		}
	}

	if (intent === "delete") {
		const documentId = formData.get("documentId") as string;
		if (!documentId) return data({ error: "Missing ID" }, { status: 400 });

		try {
			await storageService.deleteFile(userId, documentId);
			return { success: true };
		} catch (_e) {
			return data({ error: "Failed to delete" }, { status: 500 });
		}
	}

	return data({ error: "Invalid intent" }, { status: 400 });
}
