/**
 * SPEC 006: File Operation Logging Service
 *
 * Logs all file operations for audit trail and security monitoring
 * - Upload events
 * - Download events
 * - Delete events
 * - Rename events
 *
 * Captures metadata: user, document, timestamp, IP address, operation type
 */

import { db } from "@itcom/db/client";
import { fileOperationLogs } from "@itcom/db/schema";

export type FileOperation =
	| "upload"
	| "download"
	| "rename"
	| "delete"
	| "upload_confirmed"
	| "upload_failed";

export interface LogFileOperationParams {
	/** User ID performing the operation */
	userId: string;
	/** Document ID (optional for failed uploads) */
	documentId?: string;
	/** Type of operation */
	operation: FileOperation;
	/** File size in bytes (optional, for uploads) */
	fileSize?: number;
	/** Old value (for rename operations) */
	oldValue?: string;
	/** New value (for rename operations) */
	newValue?: string;
	/** HTTP request object for extracting IP */
	request: Request;
	/** Operation status */
	status?: "success" | "failed";
	/** Error message if failed */
	error?: string;
	/** Storage key (S3 key or local path) - deprecated, for backwards compatibility */
	storageKey?: string;
	/** Additional metadata - deprecated, for backwards compatibility */
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
 *   request,
 *   status: 'success',
 * });
 */
export async function logFileOperation({
	userId,
	documentId,
	operation,
	fileSize,
	oldValue,
	newValue,
	request,
	status = "success",
	error,
}: LogFileOperationParams): Promise<void> {
	try {
		// Skip logging if documentId is not provided (DB requires it as NOT NULL)
		if (!documentId) {
			console.log(
				`[FILE LOG] Skipping log for ${operation} - no documentId provided`,
			);
			return;
		}

		// Extract IP address (handle proxies)
		const forwardedFor = request.headers.get("x-forwarded-for");
		const realIp = request.headers.get("x-real-ip");
		const ipAddress =
			forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

		// Insert log record
		await db.insert(fileOperationLogs).values({
			userId,
			documentId,
			operation,
			fileSize: fileSize?.toString(),
			oldValue,
			newValue,
			ipAddress,
			status,
			error,
		});

		console.log(
			`[FILE LOG] ${operation.toUpperCase()} by user ${userId} from ${ipAddress}`,
		);
	} catch (err) {
		// Log errors but don't fail the main operation
		console.error("[FILE LOG] Failed to log file operation:", err);
	}
}

/**
 * Get file operation logs for a specific user
 * Useful for displaying user activity history
 */
export async function getUserFileOperationLogs(
	userId: string,
	limit = 50,
): Promise<(typeof fileOperationLogs.$inferSelect)[]> {
	return db.query.fileOperationLogs.findMany({
		where: (logs, { eq }) => eq(logs.userId, userId),
		orderBy: (logs, { desc }) => [desc(logs.createdAt)],
		limit,
	});
}

/**
 * Get file operation logs for a specific document
 * Useful for audit trails and debugging
 */
export async function getDocumentFileOperationLogs(
	documentId: string,
): Promise<(typeof fileOperationLogs.$inferSelect)[]> {
	return db.query.fileOperationLogs.findMany({
		where: (logs, { eq }) => eq(logs.documentId, documentId),
		orderBy: (logs, { desc }) => [desc(logs.createdAt)],
	});
}

/**
 * Get recent file operations across all users
 * Admin-only functionality for monitoring
 */
export async function getRecentFileOperationLogs(
	limit = 100,
): Promise<(typeof fileOperationLogs.$inferSelect)[]> {
	return db.query.fileOperationLogs.findMany({
		orderBy: (logs, { desc }) => [desc(logs.createdAt)],
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
	renameCount: number;
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
		renameCount: logs.filter((log) => log.operation === "rename").length,
	};
}
