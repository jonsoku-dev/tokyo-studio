import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import {
	DocumentInvalidInputError,
	DocumentNotFoundError,
} from "~/features/documents/errors";
import { documentsService } from "~/features/documents/services/documents.server";
import { validateDocumentUpdate } from "~/features/documents/validation";
import { actionHandler, BadRequestError, loaderHandler } from "~/shared/lib";

export const loader = loaderHandler(
	async ({ request, params }: LoaderFunctionArgs) => {
		const _userId = await requireUserId(request);
		const { documentId } = params;

		if (!documentId) {
			throw new BadRequestError("Document ID is required");
		}

		try {
			const versions = await documentsService.getVersions(documentId);
			return { versions };
		} catch (error) {
			console.error("[API] Failed to load document versions:", {
				documentId,
				error: error instanceof Error ? error.message : String(error),
			});
			// Re-throw to let error handler deal with it
			throw error;
		}
	},
);

export const action = actionHandler(
	async ({ request, params }: ActionFunctionArgs) => {
		const userId = await requireUserId(request);
		const { documentId } = params;

		if (!documentId) {
			throw new BadRequestError("Document ID is required");
		}

		if (request.method !== "PATCH" && request.method !== "POST") {
			throw new BadRequestError("Method not allowed. Use PATCH or POST");
		}

		try {
			const formData = await request.formData();
			const title = formData.get("title")?.toString();
			const status = formData.get("status")?.toString();

			// Validate at least one field is provided
			if (!title && !status) {
				throw new DocumentInvalidInputError(
					"update data",
					"At least one field (title or status) must be provided",
				);
			}

			// Comprehensive validation using validation layer
			const validationErrors = validateDocumentUpdate({
				title,
				status,
			});

			if (validationErrors.length > 0) {
				// Throw first validation error
				const firstError = validationErrors[0];
				throw new DocumentInvalidInputError(firstError.field, firstError.error);
			}

			await documentsService.updateDocument(userId, documentId, {
				title,
				status,
			});

			console.log("[API] Document updated successfully:", {
				documentId,
				userId,
				hasTitle: !!title,
				hasStatus: !!status,
			});

			return { success: true };
		} catch (error) {
			// Log error with context
			console.error("[API] Failed to update document:", {
				documentId,
				userId,
				error: error instanceof Error ? error.message : String(error),
			});

			// Re-throw typed errors (DocumentNotFoundError, DocumentInvalidInputError)
			// These extend AppError and will be handled by the error handler
			if (
				error instanceof DocumentNotFoundError ||
				error instanceof DocumentInvalidInputError
			) {
				throw error;
			}

			// Re-throw any other errors
			throw error;
		}
	},
);
