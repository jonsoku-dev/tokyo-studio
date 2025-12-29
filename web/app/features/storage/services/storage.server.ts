/**
 * SPEC 006: Storage Service
 *
 * Unified storage service that supports both S3 and local filesystem
 * - Uses S3 when AWS credentials are configured
 * - Falls back to local filesystem for development
 */

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@itcom/db/client";
import { documents } from "@itcom/db/schema";
import { eq, sql } from "drizzle-orm";
import { isS3Configured } from "~/shared/services/s3-client.server";
import { logFileOperation } from "./file-logger.server";
import {
	deleteFromS3,
	generateDownloadPresignedUrl,
	generateUploadPresignedUrl,
} from "./presigned-urls.server";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/documents");
const MAX_STORAGE_QUOTA = 100 * 1024 * 1024; // 100MB

export const storageService = {
	async getUsedQuota(userId: string): Promise<number> {
		const result = await db
			.select({
				totalSize: sql<string>`sum(cast(${documents.size} as bigint))`,
			})
			.from(documents)
			.where(eq(documents.userId, userId));

		return Number(result[0]?.totalSize || 0);
	},

	async generatePresignedUrl(
		userId: string,
		filename: string,
		mimeType: string,
		size: number,
	) {
		// Check quota
		const usedQuota = await this.getUsedQuota(userId);
		if (usedQuota + size > MAX_STORAGE_QUOTA) {
			throw new Error("Storage quota exceeded (100MB limit)");
		}

		// Check file type
		const allowedTypes = [
			"application/pdf",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"text/plain",
		];
		if (!allowedTypes.includes(mimeType)) {
			throw new Error("Invalid file type");
		}

		// Use S3 if configured, otherwise fallback to local
		if (isS3Configured()) {
			// S3 Mode
			const result = await generateUploadPresignedUrl({
				userId,
				filename,
				contentType: mimeType,
			});

			return {
				uploadUrl: result.uploadUrl,
				method: "PUT",
				key: result.key,
				fileId: crypto.randomUUID(),
				storage: "s3" as const,
			};
		}

		// Local Filesystem Mode (Fallback)
		const fileId = crypto.randomUUID();
		const extension = path.extname(filename);
		const key = `${userId}/${fileId}${extension}`;

		// Ensure directory exists
		await fs.mkdir(path.join(UPLOAD_DIR, userId), { recursive: true });

		// This URL points to our local "presigned" API handler
		const uploadUrl = `/api/storage/upload?key=${key}&type=${encodeURIComponent(mimeType)}`;

		return {
			uploadUrl,
			method: "POST",
			key,
			fileId,
			storage: "local" as const,
		};
	},

	async finalizeUpload(
		userId: string,
		{
			key,
			originalName,
			mimeType,
			size,
			type,
		}: {
			key: string;
			originalName: string;
			mimeType: string;
			size: number;
			type: "Resume" | "CV" | "Portfolio" | "Cover Letter";
		},
	) {
		// Generate URL based on storage type
		let publicUrl: string;

		if (isS3Configured()) {
			// For S3, store the key and generate download URLs on-demand
			// Don't store presigned URL in DB as it expires
			publicUrl = ""; // Will be generated on-demand using presigned URL
		} else {
			// For local filesystem
			publicUrl = `/uploads/documents/${key}`;
		}

		const [doc] = await db
			.insert(documents)
			.values({
				userId,
				title: originalName,
				type,
				status: "final",
				storageKey: key,
				originalName,
				mimeType,
				size: size.toString(),
				url: publicUrl,
			})
			.returning();

		return doc;
	},

	/**
	 * Get download URL for a document
	 * For S3: Generate presigned URL
	 * For local: Return static URL
	 */
	async getDownloadUrl(documentId: string, userId: string): Promise<string> {
		const doc = await db.query.documents.findFirst({
			where: eq(documents.id, documentId),
		});

		if (!doc || doc.userId !== userId) {
			throw new Error("Document not found or unauthorized");
		}

		if (isS3Configured() && doc.storageKey) {
			// Generate presigned download URL for S3
			const result = await generateDownloadPresignedUrl(
				doc.storageKey,
				doc.originalName || doc.title,
			);
			return result.downloadUrl;
		}

		// Return local URL
		return doc.url || `/uploads/documents/${doc.storageKey}`;
	},

	async deleteFile(userId: string, documentId: string, request?: Request) {
		const doc = await db.query.documents.findFirst({
			where: eq(documents.id, documentId),
		});

		if (!doc || doc.userId !== userId) {
			throw new Error("Document not found or unauthorized");
		}

		// Delete from storage
		if (doc.storageKey) {
			if (isS3Configured()) {
				// Delete from S3
				try {
					await deleteFromS3(doc.storageKey);
				} catch (e) {
					console.error("Failed to delete S3 file:", e);
					// Proceed to delete DB record anyway to fix inconsistencies
				}
			} else {
				// Delete from local filesystem
				const filePath = path.join(UPLOAD_DIR, doc.storageKey);
				try {
					await fs.unlink(filePath);
				} catch (e) {
					console.error("Failed to delete local file:", e);
					// Proceed to delete DB record anyway to fix inconsistencies
				}
			}
		}

		await db.delete(documents).where(eq(documents.id, documentId));

		// Log deletion (if request is provided)
		if (request) {
			await logFileOperation({
				userId,
				documentId,
				operation: "delete",
				storageKey: doc.storageKey ?? undefined,
				request,
			});
		}
	},
};
