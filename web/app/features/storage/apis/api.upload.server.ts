import crypto from "node:crypto";
import { db } from "@itcom/db/client";
import { documents } from "@itcom/db/schema";
import { eq, sum } from "drizzle-orm";
import type { ActionFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/features/auth/services/require-verified-email.server";
import { logFileOperation } from "~/features/storage/services/file-logger.server";
import { generateUploadPresignedUrl } from "~/features/storage/services/presigned-urls.server";
import { S3_CONFIG } from "~/shared/services/s3-client.server";
import {
	actionHandler,
	UnauthorizedError,
	BadRequestError,
	PayloadTooLargeError,
	AppError,
	ErrorCode,
} from "~/shared/lib";

const MAX_STORAGE_QUOTA = 100 * 1024 * 1024; // 100MB

/**
 * Get user's current storage usage
 */
async function getUserStorageUsage(userId: string): Promise<number> {
	const result = await db
		.select({ total: sum(documents.size) })
		.from(documents)
		.where(eq(documents.userId, userId));

	const totalStr = result[0]?.total || "0";
	return Number.parseInt(totalStr, 10);
}

/**
 * SPEC 006: S3 Document Upload API
 */
export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	// 1. Authenticate user
	const user = await getUserFromRequest(request);
	if (!user) {
		throw new UnauthorizedError();
	}

	// 2. Parse request body
	const body = await request.json();
	const { filename, contentType, fileSize, documentType } = body;

	// 3. Validate required fields
	if (!filename || !contentType || !fileSize) {
		throw new BadRequestError("Missing required fields: filename, contentType, fileSize");
	}

	// 4. Validate file type
	const allowedTypes = S3_CONFIG.allowedContentTypes as readonly string[];
	if (!allowedTypes.includes(contentType)) {
		throw new BadRequestError(
			`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
			{ code: "INVALID_FILE_TYPE" },
		);
	}

	// 5. Validate file size
	if (fileSize > S3_CONFIG.maxFileSize) {
		throw new PayloadTooLargeError(
			`File too large. Maximum size: ${S3_CONFIG.maxFileSize / 1024 / 1024}MB`,
			{
				code: "FILE_TOO_LARGE",
				maxSize: S3_CONFIG.maxFileSize,
			},
		);
	}

	// 6. Check storage quota
	const currentUsage = await getUserStorageUsage(user.id);
	if (currentUsage + fileSize > MAX_STORAGE_QUOTA) {
		const remainingQuota = MAX_STORAGE_QUOTA - currentUsage;
		throw new AppError(
			ErrorCode.QUOTA_EXCEEDED,
			"Storage quota exceeded",
			413,
			{
				code: "QUOTA_EXCEEDED",
				currentUsage,
				maxQuota: MAX_STORAGE_QUOTA,
				remainingQuota,
			},
		);
	}

	// 7. Generate presigned upload URL
	try {
		const { uploadUrl, key, expiresIn } = await generateUploadPresignedUrl({
			userId: user.id,
			filename,
			contentType,
		});

		// 8. Create pending document record
		const documentId = crypto.randomUUID();
		await db.insert(documents).values({
			id: documentId,
			userId: user.id,
			title: filename,
			type: documentType || "Resume",
			status: "pending",
			s3Key: key,
			originalName: filename,
			mimeType: contentType,
			size: fileSize.toString(),
			createdAt: new Date(),
		});

		// 9. Log upload operation
		await logFileOperation({
			userId: user.id,
			documentId,
			operation: "upload",
			storageKey: key,
			request,
			metadata: {
				filename,
				contentType,
				fileSize,
				documentType: documentType || "Resume",
			},
		});

		// 10. Return presigned URL to client
		return {
			success: true,
			uploadUrl,
			documentId,
			key,
			expiresIn,
			message: "Upload URL generated. Upload directly to this URL.",
		};
	} catch (error) {
		console.error("[UPLOAD ERROR]", error);

		// Log failed upload attempt
		try {
			await logFileOperation({
				userId: user.id,
				operation: "upload_failed",
				request,
				metadata: {
					error: error instanceof Error ? error.message : "Unknown error",
				},
			});
		} catch (logError) {
			// Ignore logging errors
			console.error("[UPLOAD ERROR] Failed to log error:", logError);
		}

		throw error;
	}
});
