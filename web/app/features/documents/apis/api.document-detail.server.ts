import { requireUserId } from "~/features/auth/utils/session.server";
import { documentsService } from "~/features/documents/services/documents.server";
import { actionHandler, loaderHandler, BadRequestError, InternalError } from "~/shared/lib";
import type { Route } from "./+types/api.document-detail.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

export const loader = loaderHandler(async ({ request, params }: LoaderFunctionArgs) => {
	const _userId = await requireUserId(request);
	const { documentId } = params;

	if (!documentId) {
		throw new BadRequestError("Document ID required");
	}

	const versions = await documentsService.getVersions(documentId);
	return { versions };
});

export const action = actionHandler(async ({ request, params }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);
	const { documentId } = params;

	if (!documentId) {
		throw new BadRequestError("Document ID required");
	}

	if (request.method !== "PATCH" && request.method !== "POST") {
		throw new BadRequestError("Method not allowed");
	}

	const formData = await request.formData();
	const title = formData.get("title")?.toString();
	const status = formData.get("status")?.toString();

	if (!title && !status) {
		throw new BadRequestError("No updates provided");
	}

	try {
		await documentsService.updateDocument(userId, documentId, {
			title,
			status,
		});
		return { success: true };
	} catch (error) {
		if (error instanceof Error) {
			throw new InternalError(error.message);
		}
		throw new InternalError("Failed to update document");
	}
});
