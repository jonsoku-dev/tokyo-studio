import crypto from "crypto";

/**
 * SPEC 004: Avatar Upload Audit Logging
 * Tracks all avatar upload and deletion actions for audit trail
 */

export type AvatarLogAction = "uploaded" | "deleted" | "replaced";

interface AvatarLogEntry {
	id: string;
	userId: string;
	action: AvatarLogAction;
	previousUrl?: string;
	newUrl?: string;
	fileSize?: number;
	fileSizeHumanReadable?: string;
	ipAddress?: string;
	userAgent?: string;
	timestamp: Date;
	metadata?: Record<string, unknown>;
}

// In-memory log storage (for MVP; in production use database)
const avatarLogs: AvatarLogEntry[] = [];

/**
 * Convert bytes to human-readable format
 */
function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return Math.round((bytes / k ** i) * 100) / 100 + " " + sizes[i];
}

/**
 * Extract IP address from request
 */
export function getIpAddressFromRequest(request: Request): string {
	const forwardedFor = request.headers.get("x-forwarded-for");
	return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

/**
 * Extract user agent from request
 */
export function getUserAgentFromRequest(request: Request): string {
	return request.headers.get("user-agent") || "unknown";
}

/**
 * Log an avatar action
 */
export function logAvatarChange(
	data: {
		userId: string;
		action: AvatarLogAction;
		previousUrl?: string;
		newUrl?: string;
		fileSize?: number;
	},
	request?: Request,
): AvatarLogEntry {
	const entry: AvatarLogEntry = {
		id: crypto.randomUUID(),
		userId: data.userId,
		action: data.action,
		previousUrl: data.previousUrl,
		newUrl: data.newUrl,
		fileSize: data.fileSize,
		fileSizeHumanReadable: data.fileSize
			? formatBytes(data.fileSize)
			: undefined,
		ipAddress: request ? getIpAddressFromRequest(request) : undefined,
		userAgent: request ? getUserAgentFromRequest(request) : undefined,
		timestamp: new Date(),
	};

	// Store in memory (TODO: persist to database)
	avatarLogs.push(entry);

	// Keep only last 1000 entries to prevent memory leak
	if (avatarLogs.length > 1000) {
		avatarLogs.shift();
	}

	console.log(
		`[Avatar Log] ${data.action.toUpperCase()} by ${data.userId}: ${data.fileSize ? formatBytes(data.fileSize) : "N/A"}`,
	);

	return entry;
}

/**
 * Get audit logs for a user
 */
export function getUserAvatarLogs(
	userId: string,
	limit = 50,
): AvatarLogEntry[] {
	return avatarLogs
		.filter((log) => log.userId === userId)
		.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
		.slice(0, limit);
}

/**
 * Get all avatar logs (admin only)
 */
export function getAllAvatarLogs(limit = 100): AvatarLogEntry[] {
	return avatarLogs
		.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
		.slice(0, limit);
}

/**
 * Get avatar log statistics
 */
export function getAvatarLogStats(): {
	totalLogs: number;
	uploads: number;
	deletions: number;
	replacements: number;
	uniqueUsers: number;
	latestAction?: AvatarLogEntry;
} {
	const stats = {
		totalLogs: avatarLogs.length,
		uploads: 0,
		deletions: 0,
		replacements: 0,
		uniqueUsers: new Set<string>(),
		latestAction: avatarLogs[avatarLogs.length - 1],
	};

	for (const log of avatarLogs) {
		stats.uniqueUsers.add(log.userId);
		if (log.action === "uploaded") stats.uploads++;
		if (log.action === "deleted") stats.deletions++;
		if (log.action === "replaced") stats.replacements++;
	}

	return {
		totalLogs: stats.totalLogs,
		uploads: stats.uploads,
		deletions: stats.deletions,
		replacements: stats.replacements,
		uniqueUsers: stats.uniqueUsers.size,
		latestAction: stats.latestAction,
	};
}

/**
 * Clear logs (admin use only - dangerous!)
 */
export function clearAvatarLogs(): void {
	console.warn("[Avatar Log] WARNING: All logs cleared!");
	avatarLogs.length = 0;
}
