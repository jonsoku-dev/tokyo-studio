import { db } from "@itcom/db/client";
import { documents } from "@itcom/db/schema";
import { and, eq } from "drizzle-orm";
import type { ActionFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/features/auth/services/require-verified-email.server";
import { logFileOperation } from "~/features/storage/services/file-logger.server";
import {
	actionHandler,
	BadRequestError,
	NotFoundError,
	UnauthorizedError,
} from "~/shared/lib";

/**
 * SPEC 006: S3 Upload Confirmation API
 *
 * Called by client after successful direct upload to S3
 * Updates document status from 'pending' to 'uploaded'
 */
export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	// 1. Authenticate user
	const user = await getUserFromRequest(request);
	if (!user) {
		throw new UnauthorizedError();
	}

	// 2. Parse request body
	const body = await request.json();
	const { documentId } = body;

	if (!documentId) {
		throw new BadRequestError("Missing required field: documentId");
	}

	// 3. Find and verify document ownership
	const [document] = await db
		.select()
		.from(documents)
		.where(and(eq(documents.id, documentId), eq(documents.userId, user.id)))
		.limit(1);

	if (!document) {
		throw new NotFoundError("Document not found or access denied");
	}

	// 4. Verify document is in pending status
	if (document.status !== "pending") {
		throw new BadRequestError(
			`Document is not in pending status (current: ${document.status})`,
		);
	}

	// 5. Update document status to uploaded
	await db
		.update(documents)
		.set({
			status: "uploaded",
			uploadedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(documents.id, documentId));

	// 6. Log upload confirmation
	await logFileOperation({
		userId: user.id,
		documentId,
		operation: "upload_confirmed",
		storageKey: document.s3Key ?? undefined,
		request,
	});

	return {
		success: true,
		message: "Upload confirmed successfully",
		documentId,
	};
});
