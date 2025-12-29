import { and, eq } from "drizzle-orm";
import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { getUserFromRequest } from "~/features/auth/services/require-verified-email.server";
import { logFileOperation } from "~/features/storage/services/file-logger.server";
import { db } from "@itcom/db/client";
import { documents } from "@itcom/db/schema";

/**
 * SPEC 006: S3 Upload Confirmation API
 *
 * Called by client after successful direct upload to S3
 * Updates document status from 'pending' to 'uploaded'
 *
 * Security:
 * - Verifies user owns the document
 * - Prevents confirming other users' uploads
 */

export async function action({ request }: ActionFunctionArgs) {
	if (request.method !== "POST") {
		return data({ error: "Method not allowed" }, { status: 405 });
	}

	try {
		// 1. Authenticate user
		const user = await getUserFromRequest(request);
		if (!user) {
			return data({ error: "Unauthorized" }, { status: 401 });
		}

		// 2. Parse request body
		const body = await request.json();
		const { documentId } = body;

		if (!documentId) {
			return data(
				{ error: "Missing required field: documentId" },
				{ status: 400 },
			);
		}

		// 3. Find and verify document ownership
		const [document] = await db
			.select()
			.from(documents)
			.where(and(eq(documents.id, documentId), eq(documents.userId, user.id)))
			.limit(1);

		if (!document) {
			return data(
				{ error: "Document not found or access denied" },
				{ status: 404 },
			);
		}

		// 4. Verify document is in pending status
		if (document.status !== "pending") {
			return data(
				{
					error: `Document is not in pending status (current: ${document.status})`,
				},
				{ status: 400 },
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

		return data({
			success: true,
			message: "Upload confirmed successfully",
			documentId,
		});
	} catch (error) {
		console.error("[CONFIRM UPLOAD ERROR]", error);
		return data(
			{
				success: false,
				error: "Failed to confirm upload. Please try again.",
			},
			{ status: 500 },
		);
	}
}
