import crypto from "node:crypto";
import { eq, sum } from "drizzle-orm";
import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { getUserFromRequest } from "~/features/auth/services/require-verified-email.server";
import { generateUploadPresignedUrl } from "~/features/storage/services/presigned-urls.server";
import { logFileOperation } from "~/features/storage/services/file-logger.server";
import { db } from "@itcom/db/client";
import { documents } from "@itcom/db/schema";
import { S3_CONFIG } from "~/shared/services/s3-client.server";

/**
 * SPEC 006: S3 Document Upload API
 *
 * Flow:
 * 1. Client requests presigned upload URL
 * 2. Server validates user, quota, file type
 * 3. Server generates presigned URL and creates pending document record
 * 4. Client uploads directly to S3
 * 5. Client confirms upload (separate endpoint)
 *
 * Security:
 * - User authentication required
 * - File type validation
 * - File size validation
 * - Storage quota enforcement (100MB per user)
 */

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
		const { filename, contentType, fileSize, documentType } = body;

		// 3. Validate required fields
		if (!filename || !contentType || !fileSize) {
			return data(
				{
					error: "Missing required fields: filename, contentType, fileSize",
				},
				{ status: 400 },
			);
		}

		// 4. Validate file type
		const allowedTypes = S3_CONFIG.allowedContentTypes as readonly string[];
		if (!allowedTypes.includes(contentType)) {
			return data(
				{
					error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
					code: "INVALID_FILE_TYPE",
				},
				{ status: 400 },
			);
		}

		// 5. Validate file size
		if (fileSize > S3_CONFIG.maxFileSize) {
			return data(
				{
					error: `File too large. Maximum size: ${S3_CONFIG.maxFileSize / 1024 / 1024}MB`,
					code: "FILE_TOO_LARGE",
					maxSize: S3_CONFIG.maxFileSize,
				},
				{ status: 400 },
			);
		}

		// 6. Check storage quota
		const currentUsage = await getUserStorageUsage(user.id);
		if (currentUsage + fileSize > MAX_STORAGE_QUOTA) {
			const remainingQuota = MAX_STORAGE_QUOTA - currentUsage;
			return data(
				{
					error: "Storage quota exceeded",
					code: "QUOTA_EXCEEDED",
					currentUsage,
					maxQuota: MAX_STORAGE_QUOTA,
					remainingQuota,
				},
				{ status: 413 },
			);
		}

		// 7. Generate presigned upload URL
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
		return data({
			success: true,
			uploadUrl,
			documentId,
			key,
			expiresIn,
			message: "Upload URL generated. Upload directly to this URL.",
		});
	} catch (error) {
		console.error("[UPLOAD ERROR]", error);

		// Log failed upload attempt
		try {
			const user = await getUserFromRequest(request);
			if (user) {
				await logFileOperation({
					userId: user.id,
					operation: "upload_failed",
					request,
					metadata: {
						error: error instanceof Error ? error.message : "Unknown error",
					},
				});
			}
		} catch (logError) {
			// Ignore logging errors
			console.error("[UPLOAD ERROR] Failed to log error:", logError);
		}

		return data(
			{
				success: false,
				error: "Failed to generate upload URL. Please try again.",
			},
			{ status: 500 },
		);
	}
}
