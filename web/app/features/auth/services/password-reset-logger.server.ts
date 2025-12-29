/**
 * SPEC 003: Password Reset Event Logging Service
 *
 * Logs all password reset events for audit trail and security monitoring
 * - Request events (forgot password)
 * - Completion events (successful reset)
 * - Failure events (invalid/expired tokens)
 *
 * Captures metadata: user, email, timestamp, IP address, user agent
 */

import crypto from "node:crypto";
import { db } from "@itcom/db/client";
import { passwordResetLogs } from "@itcom/db/schema";

export type PasswordResetEventType =
	| "requested"
	| "completed"
	| "failed_invalid_token"
	| "failed_expired_token"
	| "failed_rate_limit";

export interface LogPasswordResetEventParams {
	/** User ID (if available) */
	userId?: string;
	/** Email address */
	email: string;
	/** Type of event */
	eventType: PasswordResetEventType;
	/** IP address */
	ipAddress?: string;
	/** User agent string */
	userAgent?: string;
	/** Additional metadata */
	metadata?: Record<string, unknown>;
}

/**
 * Log a password reset event to the database
 *
 * @example
 * await logPasswordResetEvent({
 *   email: user.email,
 *   userId: user.id,
 *   eventType: 'completed',
 *   ipAddress,
 *   userAgent,
 * });
 */
export async function logPasswordResetEvent({
	userId,
	email,
	eventType,
	ipAddress,
	userAgent,
	metadata,
}: LogPasswordResetEventParams): Promise<void> {
	try {
		await db.insert(passwordResetLogs).values({
			id: crypto.randomUUID(),
			userId: userId ?? null,
			email,
			eventType,
			ipAddress: ipAddress ?? null,
			userAgent: userAgent ?? null,
			metadata: metadata ? JSON.stringify(metadata) : null,
			timestamp: new Date(),
		});

		console.log(
			`[PASSWORD RESET LOG] ${eventType.toUpperCase()} for ${email} from ${ipAddress || "unknown"}`,
		);
	} catch (error) {
		// Log errors but don't fail the main operation
		console.error("[PASSWORD RESET LOG] Failed to log event:", error);
	}
}

/**
 * Get password reset logs for a specific user
 * Useful for displaying user activity history
 */
export async function getUserPasswordResetLogs(
	userId: string,
	limit = 50,
): Promise<(typeof passwordResetLogs.$inferSelect)[]> {
	return db.query.passwordResetLogs.findMany({
		where: (logs, { eq }) => eq(logs.userId, userId),
		orderBy: (logs, { desc }) => [desc(logs.timestamp)],
		limit,
	});
}

/**
 * Get password reset logs for a specific email
 * Useful for security investigations
 */
export async function getEmailPasswordResetLogs(
	email: string,
	limit = 50,
): Promise<(typeof passwordResetLogs.$inferSelect)[]> {
	return db.query.passwordResetLogs.findMany({
		where: (logs, { eq }) => eq(logs.email, email),
		orderBy: (logs, { desc }) => [desc(logs.timestamp)],
		limit,
	});
}

/**
 * Get recent password reset logs across all users
 * Admin-only functionality for monitoring
 */
export async function getRecentPasswordResetLogs(
	limit = 100,
): Promise<(typeof passwordResetLogs.$inferSelect)[]> {
	return db.query.passwordResetLogs.findMany({
		orderBy: (logs, { desc }) => [desc(logs.timestamp)],
		limit,
	});
}

/**
 * Get password reset statistics
 * Useful for analytics dashboards
 */
export async function getPasswordResetStats(email?: string): Promise<{
	totalEvents: number;
	requestedCount: number;
	completedCount: number;
	failedInvalidCount: number;
	failedExpiredCount: number;
	failedRateLimitCount: number;
}> {
	const logs = email
		? await db.query.passwordResetLogs.findMany({
				where: (logs, { eq }) => eq(logs.email, email),
			})
		: await db.query.passwordResetLogs.findMany();

	return {
		totalEvents: logs.length,
		requestedCount: logs.filter((log) => log.eventType === "requested").length,
		completedCount: logs.filter((log) => log.eventType === "completed").length,
		failedInvalidCount: logs.filter(
			(log) => log.eventType === "failed_invalid_token",
		).length,
		failedExpiredCount: logs.filter(
			(log) => log.eventType === "failed_expired_token",
		).length,
		failedRateLimitCount: logs.filter(
			(log) => log.eventType === "failed_rate_limit",
		).length,
	};
}

/**
 * Helper function to extract IP address from request headers
 */
export function getIpAddress(request: Request): string {
	const forwardedFor = request.headers.get("x-forwarded-for");
	const realIp = request.headers.get("x-real-ip");
	return forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
}

/**
 * Helper function to get user agent from request headers
 */
export function getUserAgent(request: Request): string {
	return request.headers.get("user-agent") || "unknown";
}
