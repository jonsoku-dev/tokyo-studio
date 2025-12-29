/**
 * SPEC 006: Orphaned File Cleanup Job
 *
 * Cleans up files that were uploaded but metadata save failed (two-phase commit rollback)
 * Runs periodically to maintain storage consistency
 *
 * Orphaned files are identified as:
 * - Document status = 'pending' for > 24 hours
 * - Indicates upload succeeded but confirmation failed
 *
 * Schedule: Runs daily at 2 AM
 */

import { and, eq, lte } from "drizzle-orm";
import { db } from "@itcom/db/client";
import { documents } from "@itcom/db/schema";
import { isS3Configured } from "~/shared/services/s3-client.server";
import { deleteFromS3 } from "../services/presigned-urls.server";
import fs from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/documents");

/**
 * Cleanup orphaned files from storage
 * Files in 'pending' status for > 24 hours are considered orphaned
 *
 * @returns Number of files cleaned up
 */
export async function cleanupOrphanedFiles(): Promise<number> {
	const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

	console.log(`[CLEANUP] Starting orphaned file cleanup (cutoff: ${cutoff.toISOString()})`);

	// Find pending documents older than cutoff
	const orphanedDocs = await db.query.documents.findMany({
		where: and(eq(documents.status, "pending"), lte(documents.createdAt, cutoff)),
	});

	console.log(`[CLEANUP] Found ${orphanedDocs.length} orphaned documents`);

	let cleanedCount = 0;

	for (const doc of orphanedDocs) {
		try {
			// Delete from storage
			if (doc.s3Key || doc.storageKey) {
				const key = doc.s3Key || doc.storageKey;
				if (!key) continue;

				if (isS3Configured()) {
					// Delete from S3
					await deleteFromS3(key);
					console.log(`[CLEANUP] Deleted S3 file: ${key}`);
				} else {
					// Delete from local filesystem
					const filePath = path.join(UPLOAD_DIR, key);
					try {
						await fs.unlink(filePath);
						console.log(`[CLEANUP] Deleted local file: ${key}`);
					} catch (error) {
						// File might not exist, that's okay
						console.warn(`[CLEANUP] Local file not found: ${key}`);
					}
				}
			}

			// Delete database record
			await db.delete(documents).where(eq(documents.id, doc.id));

			cleanedCount++;
			console.log(`[CLEANUP] Cleaned up orphaned document: ${doc.id} (${doc.title})`);
		} catch (error) {
			console.error(`[CLEANUP] Failed to cleanup document ${doc.id}:`, error);
			// Continue with next document
		}
	}

	console.log(`[CLEANUP] Completed. Cleaned ${cleanedCount} orphaned files`);

	return cleanedCount;
}

/**
 * Cleanup soft-deleted documents (status='deleted' for > 30 days)
 * Permanently removes files and database records
 *
 * @returns Number of files permanently deleted
 */
export async function cleanupDeletedDocuments(): Promise<number> {
	const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

	console.log(`[CLEANUP] Starting deleted documents cleanup (cutoff: ${cutoff.toISOString()})`);

	// Find deleted documents older than cutoff
	const deletedDocs = await db.query.documents.findMany({
		where: and(
			eq(documents.status, "deleted"),
			lte(documents.deletedAt ?? documents.updatedAt, cutoff),
		),
	});

	console.log(`[CLEANUP] Found ${deletedDocs.length} soft-deleted documents`);

	let cleanedCount = 0;

	for (const doc of deletedDocs) {
		try {
			// Delete main file from storage
			if (doc.s3Key || doc.storageKey) {
				const key = doc.s3Key || doc.storageKey;
				if (!key) continue;

				if (isS3Configured()) {
					await deleteFromS3(key);
					console.log(`[CLEANUP] Deleted S3 file: ${key}`);
				} else {
					const filePath = path.join(UPLOAD_DIR, key);
					try {
						await fs.unlink(filePath);
						console.log(`[CLEANUP] Deleted local file: ${key}`);
					} catch (error) {
						console.warn(`[CLEANUP] Local file not found: ${key}`);
					}
				}
			}

			// Delete thumbnail if exists
			if (doc.thumbnailUrl) {
				// Extract key from thumbnail URL or use thumbnailS3Key if available
				const thumbnailKey = doc.thumbnailUrl.startsWith("/")
					? doc.thumbnailUrl.replace("/uploads/documents/", "")
					: doc.thumbnailUrl;

				if (isS3Configured()) {
					try {
						await deleteFromS3(thumbnailKey);
						console.log(`[CLEANUP] Deleted thumbnail: ${thumbnailKey}`);
					} catch (error) {
						console.warn(`[CLEANUP] Thumbnail not found: ${thumbnailKey}`);
					}
				} else {
					const thumbnailPath = path.join(UPLOAD_DIR, thumbnailKey);
					try {
						await fs.unlink(thumbnailPath);
						console.log(`[CLEANUP] Deleted local thumbnail: ${thumbnailKey}`);
					} catch (error) {
						console.warn(`[CLEANUP] Local thumbnail not found: ${thumbnailKey}`);
					}
				}
			}

			// Permanently delete database record
			await db.delete(documents).where(eq(documents.id, doc.id));

			cleanedCount++;
			console.log(`[CLEANUP] Permanently deleted document: ${doc.id} (${doc.title})`);
		} catch (error) {
			console.error(`[CLEANUP] Failed to delete document ${doc.id}:`, error);
			// Continue with next document
		}
	}

	console.log(`[CLEANUP] Completed. Permanently deleted ${cleanedCount} documents`);

	return cleanedCount;
}

/**
 * Run all cleanup tasks
 * Called by cron job or manual trigger
 */
export async function runStorageCleanup(): Promise<{
	orphanedCleaned: number;
	deletedCleaned: number;
}> {
	console.log("[CLEANUP] ========== Storage Cleanup Started ==========");

	const orphanedCleaned = await cleanupOrphanedFiles();
	const deletedCleaned = await cleanupDeletedDocuments();

	console.log("[CLEANUP] ========== Storage Cleanup Completed ==========");
	console.log(`[CLEANUP] Orphaned files: ${orphanedCleaned}`);
	console.log(`[CLEANUP] Deleted files: ${deletedCleaned}`);

	return { orphanedCleaned, deletedCleaned };
}
