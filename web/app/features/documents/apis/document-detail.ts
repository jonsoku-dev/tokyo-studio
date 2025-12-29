import { data } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { documentsService } from "~/features/documents/services/documents.server";
import type { Route } from "./+types/document-detail";

export async function loader({ request, params }: Route.LoaderArgs) {
	const _userId = await requireUserId(request);
	const { documentId } = params;

	if (!documentId) {
		throw data("Document ID required", { status: 400 });
	}

	const versions = await documentsService.getVersions(documentId);
	return { versions };
}

export async function action({ request, params }: Route.ActionArgs) {
	const userId = await requireUserId(request);
	const { documentId } = params;

	if (!documentId) {
		throw data("Document ID required", { status: 400 });
	}

	if (request.method !== "PATCH" && request.method !== "POST") {
		throw data("Method not allowed", { status: 405 });
	}

	const formData = await request.formData();
	const title = formData.get("title")?.toString();
	const status = formData.get("status")?.toString();

	if (!title && !status) {
		throw data("No updates provided", { status: 400 });
	}

	try {
		await documentsService.updateDocument(userId, documentId, {
			title,
			status,
		});
		return { success: true };
	} catch (error) {
		throw data(
			error instanceof Error ? error.message : "Failed to update document",
			{ status: 500 },
		);
	}
}
