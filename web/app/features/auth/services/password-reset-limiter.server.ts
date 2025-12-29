import crypto from "node:crypto";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@itcom/db/client";
import { passwordResetAttempts } from "@itcom/db/schema";

/**
 * SPEC 003: Password Reset Rate Limiting
 *
 * Security Critical - prevents DoS attacks via unlimited password reset requests
 *
 * Rate Limit: 3 attempts per hour per email address
 * Tracks by: Email (case-insensitive) + IP address
 */

const MAX_ATTEMPTS = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export interface RateLimitResult {
	allowed: boolean;
	remainingAttempts: number;
	resetAt?: Date;
}

/**
 * Check if a password reset request is allowed under rate limit
 * @param email - User's email address
 * @returns Rate limit status and remaining attempts
 */
export async function checkPasswordResetRateLimit(
	email: string,
): Promise<RateLimitResult> {
	const normalizedEmail = email.toLowerCase().trim();
	const windowStart = new Date(Date.now() - WINDOW_MS);

	// Count attempts in the last hour
	const attempts = await db
		.select()
		.from(passwordResetAttempts)
		.where(
			and(
				eq(passwordResetAttempts.email, normalizedEmail),
				gte(passwordResetAttempts.attemptedAt, windowStart),
			),
		);

	const allowed = attempts.length < MAX_ATTEMPTS;
	const remainingAttempts = Math.max(0, MAX_ATTEMPTS - attempts.length);

	// Calculate when the rate limit resets (1 hour from oldest attempt)
	const resetAt =
		attempts.length > 0 && attempts.length >= MAX_ATTEMPTS
			? new Date(attempts[0].attemptedAt.getTime() + WINDOW_MS)
			: undefined;

	return {
		allowed,
		remainingAttempts,
		resetAt,
	};
}

/**
 * Record a password reset attempt
 * @param email - User's email address
 * @param ipAddress - Request IP address
 */
export async function recordPasswordResetAttempt(
	email: string,
	ipAddress: string,
): Promise<void> {
	const normalizedEmail = email.toLowerCase().trim();

	await db.insert(passwordResetAttempts).values({
		id: crypto.randomUUID(),
		email: normalizedEmail,
		ipAddress,
		attemptedAt: new Date(),
	});
}

/**
 * Clean up old password reset attempts (older than 1 hour)
 * Should be called by a cron job
 */
export async function cleanupOldPasswordResetAttempts(): Promise<number> {
	const cutoff = new Date(Date.now() - WINDOW_MS);

	const deleted = await db
		.delete(passwordResetAttempts)
		.where(gte(passwordResetAttempts.attemptedAt, cutoff))
		.returning();

	return deleted.length;
}

/**
 * Get rate limit error message with helpful information
 */
export function getRateLimitErrorMessage(result: RateLimitResult): string {
	if (result.allowed) {
		return "";
	}

	const resetTime = result.resetAt
		? new Date(result.resetAt).toLocaleTimeString()
		: "in 1 hour";

	return `Too many password reset attempts. Please try again at ${resetTime}.`;
}
