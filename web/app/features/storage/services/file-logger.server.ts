/**
 * SPEC 006: File Operation Logging Service
 *
 * Logs all file operations for audit trail and security monitoring
 * - Upload events
 * - Download events
 * - Delete events
 * - Upload failures
 *
 * Captures metadata: user, timestamp, IP address, user agent, operation type
 */

import crypto from "node:crypto";
import { db } from "@itcom/db/client";
import { fileOperationLogs } from "@itcom/db/schema";

export type FileOperation =
	| "upload"
	| "download"
	| "delete"
	| "upload_failed"
	| "upload_confirmed";

export interface LogFileOperationParams {
	/** User ID performing the operation */
	userId: string;
	/** Document ID (optional, may not exist yet during upload request) */
	documentId?: string;
	/** Type of operation */
	operation: FileOperation;
	/** Storage key (S3 key or local path) */
	storageKey?: string;
	/** HTTP request object for extracting IP and user agent */
	request: Request;
	/** Additional metadata */
	metadata?: Record<string, unknown>;
}

/**
 * Log a file operation to the database
 *
 * @example
 * await logFileOperation({
 *   userId: user.id,
 *   documentId: doc.id,
 *   operation: 'upload',
 *   storageKey: 's3-key-123',
 *   request,
 * });
 */
export async function logFileOperation({
	userId,
	documentId,
	operation,
	storageKey,
	request,
	metadata,
}: LogFileOperationParams): Promise<void> {
	try {
		// Extract IP address (handle proxies)
		const forwardedFor = request.headers.get("x-forwarded-for");
		const realIp = request.headers.get("x-real-ip");
		const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

		// Extract user agent
		const userAgent = request.headers.get("user-agent") || "unknown";

		// Insert log record
		await db.insert(fileOperationLogs).values({
			id: crypto.randomUUID(),
			userId,
			documentId: documentId ?? null,
			operation,
			storageKey: storageKey ?? null,
			ipAddress,
			userAgent,
			metadata: metadata ? JSON.stringify(metadata) : null,
			timestamp: new Date(),
		});

		console.log(
			`[FILE LOG] ${operation.toUpperCase()} by user ${userId} from ${ipAddress}`,
		);
	} catch (error) {
		// Log errors but don't fail the main operation
		console.error("[FILE LOG] Failed to log file operation:", error);
	}
}

/**
 * Get file operation logs for a specific user
 * Useful for displaying user activity history
 */
export async function getUserFileOperationLogs(
	userId: string,
	limit = 50,
): Promise<typeof fileOperationLogs.$inferSelect[]> {
	return db.query.fileOperationLogs.findMany({
		where: (logs, { eq }) => eq(logs.userId, userId),
		orderBy: (logs, { desc }) => [desc(logs.timestamp)],
		limit,
	});
}

/**
 * Get file operation logs for a specific document
 * Useful for audit trails and debugging
 */
export async function getDocumentFileOperationLogs(
	documentId: string,
): Promise<typeof fileOperationLogs.$inferSelect[]> {
	return db.query.fileOperationLogs.findMany({
		where: (logs, { eq }) => eq(logs.documentId, documentId),
		orderBy: (logs, { desc }) => [desc(logs.timestamp)],
	});
}

/**
 * Get recent file operations across all users
 * Admin-only functionality for monitoring
 */
export async function getRecentFileOperationLogs(
	limit = 100,
): Promise<typeof fileOperationLogs.$inferSelect[]> {
	return db.query.fileOperationLogs.findMany({
		orderBy: (logs, { desc }) => [desc(logs.timestamp)],
		limit,
	});
}

/**
 * Get file operation statistics
 * Useful for analytics dashboards
 */
export async function getFileOperationStats(userId?: string): Promise<{
	totalOperations: number;
	uploadCount: number;
	downloadCount: number;
	deleteCount: number;
	failedUploadCount: number;
}> {
	const logs = userId
		? await db.query.fileOperationLogs.findMany({
				where: (logs, { eq }) => eq(logs.userId, userId),
			})
		: await db.query.fileOperationLogs.findMany();

	return {
		totalOperations: logs.length,
		uploadCount: logs.filter((log) => log.operation === "upload").length,
		downloadCount: logs.filter((log) => log.operation === "download").length,
		deleteCount: logs.filter((log) => log.operation === "delete").length,
		failedUploadCount: logs.filter((log) => log.operation === "upload_failed")
			.length,
	};
}
