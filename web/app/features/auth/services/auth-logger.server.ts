/**
 * SPEC 001: Authentication Event Logging Service
 *
 * Logs all authentication events for security auditing:
 * - Login success/failure
 * - Logout events
 * - Account linking/unlinking (handled by account-linking.server.ts)
 * - Session events
 *
 * Captures metadata: userId, eventType, provider, IP address, user agent
 */

import crypto from "node:crypto";
import { db } from "@itcom/db/client";
import { authenticationLogs } from "@itcom/db/schema";

export type AuthEventType =
	| "login_success"
	| "login_failed"
	| "logout"
	| "account_linked" // Handled by account-linking.server.ts
	| "account_unlinked" // Handled by account-linking.server.ts
	| "session_expired"
	| "password_changed";

export interface LogAuthEventParams {
	/** User ID (optional for failed login attempts) */
	userId?: string;
	/** Email address (for failed login attempts) */
	email?: string;
	/** Event type */
	eventType: AuthEventType;
	/** Authentication provider used (if applicable) */
	provider?: "google" | "github" | "kakao" | "line" | "email";
	/** IP address of the request */
	ipAddress?: string;
	/** User agent string */
	userAgent?: string;
	/** Additional metadata */
	metadata?: Record<string, unknown>;
}

/**
 * Log an authentication event to the database
 *
 * @example
 * await logAuthEvent({
 *   userId: user.id,
 *   eventType: 'login_success',
 *   provider: 'google',
 *   ipAddress: getIpAddress(request),
 *   userAgent: getUserAgent(request),
 * });
 */
export async function logAuthEvent(params: LogAuthEventParams): Promise<void> {
	const { userId, email, eventType, provider, ipAddress, userAgent, metadata } =
		params;

	try {
		await db.insert(authenticationLogs).values({
			id: crypto.randomUUID(),
			userId: userId ?? null,
			eventType,
			provider: provider ?? null,
			ipAddress: ipAddress ?? null,
			userAgent: userAgent ?? null,
			metadata: metadata
				? { ...metadata, email: email || undefined }
				: email
					? { email }
					: null,
			timestamp: new Date(),
		});

		console.log(
			`[AUTH LOG] ${eventType.toUpperCase()} ${provider ? `via ${provider}` : ""} ${userId ? `by user ${userId}` : email ? `for ${email}` : ""} from ${ipAddress || "unknown"}`,
		);
	} catch (error) {
		// Log errors but don't fail the main operation
		console.error("[AUTH LOG] Failed to log authentication event:", error);
	}
}

/**
 * Get authentication logs for a specific user
 * Useful for displaying user activity history
 */
export async function getUserAuthLogs(
	userId: string,
	limit = 50,
): Promise<(typeof authenticationLogs.$inferSelect)[]> {
	return db.query.authenticationLogs.findMany({
		where: (logs, { eq }) => eq(logs.userId, userId),
		orderBy: (logs, { desc }) => [desc(logs.timestamp)],
		limit,
	});
}

/**
 * Get failed login attempts for an email
 * Useful for detecting brute force attacks
 */
export async function getFailedLoginAttempts(
	email: string,
	since: Date,
): Promise<(typeof authenticationLogs.$inferSelect)[]> {
	return db.query.authenticationLogs.findMany({
		where: (logs, { eq, and, gte, sql }) =>
			and(
				eq(logs.eventType, "login_failed"),
				gte(logs.timestamp, since),
				sql`json_extract(${logs.metadata}, '$.email') = ${email}`,
			),
		orderBy: (logs, { desc }) => [desc(logs.timestamp)],
	});
}

/**
 * Get recent authentication events across all users
 * Admin-only functionality for monitoring
 */
export async function getRecentAuthLogs(
	limit = 100,
): Promise<(typeof authenticationLogs.$inferSelect)[]> {
	return db.query.authenticationLogs.findMany({
		orderBy: (logs, { desc }) => [desc(logs.timestamp)],
		limit,
	});
}

/**
 * Get authentication statistics
 * Useful for analytics dashboards
 */
export async function getAuthStats(userId?: string): Promise<{
	totalLogins: number;
	totalLogouts: number;
	failedLogins: number;
	providersUsed: string[];
}> {
	const logs = userId
		? await db.query.authenticationLogs.findMany({
				where: (logs, { eq }) => eq(logs.userId, userId),
			})
		: await db.query.authenticationLogs.findMany();

	const providers = new Set(
		logs.filter((log) => log.provider).map((log) => log.provider),
	);

	return {
		totalLogins: logs.filter((log) => log.eventType === "login_success").length,
		totalLogouts: logs.filter((log) => log.eventType === "logout").length,
		failedLogins: logs.filter((log) => log.eventType === "login_failed").length,
		providersUsed: Array.from(providers) as string[],
	};
}

/**
 * Helper: Extract IP address from request
 * Handles X-Forwarded-For header for proxies
 */
export function getIpAddress(request: Request): string {
	const forwardedFor = request.headers.get("x-forwarded-for");
	const realIp = request.headers.get("x-real-ip");
	return forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
}

/**
 * Helper: Extract user agent from request
 */
export function getUserAgent(request: Request): string {
	return request.headers.get("user-agent") || "unknown";
}
