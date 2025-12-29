import { db } from "@itcom/db/client";
import { and, eq, gte } from "drizzle-orm";

/**
 * SPEC 004: Avatar Upload Rate Limiting
 * Prevents abuse by limiting avatar uploads per user
 */

// Configuration
const MAX_UPLOADS_PER_HOUR = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Create an in-memory rate limiter using simple tracking
 * For production, consider using Redis
 */
class AvatarUploadRateLimiter {
	private attempts = new Map<string, { count: number; resetAt: number }>();

	check(userId: string): {
		allowed: boolean;
		remaining: number;
		retryAfter?: number;
	} {
		const now = Date.now();
		const record = this.attempts.get(userId);

		// Create or reset if window expired
		if (!record || record.resetAt < now) {
			this.attempts.set(userId, {
				count: 0,
				resetAt: now + RATE_LIMIT_WINDOW_MS,
			});
			return {
				allowed: true,
				remaining: MAX_UPLOADS_PER_HOUR,
			};
		}

		// Check if limit exceeded
		if (record.count >= MAX_UPLOADS_PER_HOUR) {
			return {
				allowed: false,
				remaining: 0,
				retryAfter: Math.ceil((record.resetAt - now) / 1000), // seconds
			};
		}

		// Increment counter
		record.count++;
		return {
			allowed: true,
			remaining: MAX_UPLOADS_PER_HOUR - record.count,
		};
	}

	reset(userId: string): void {
		this.attempts.delete(userId);
	}
}

// Singleton instance
const rateLimiter = new AvatarUploadRateLimiter();

/**
 * Check if user can upload avatar
 */
export function checkAvatarUploadRateLimit(userId: string): {
	allowed: boolean;
	remaining: number;
	retryAfter?: number;
} {
	return rateLimiter.check(userId);
}

/**
 * Reset rate limit for a user (admin use)
 */
export function resetAvatarUploadRateLimit(userId: string): void {
	rateLimiter.reset(userId);
}

/**
 * Get rate limit status for monitoring/debugging
 */
export function getAvatarUploadStats(): {
	totalTracked: number;
	maxPerHour: number;
	windowMs: number;
} {
	return {
		totalTracked: rateLimiter["attempts"].size,
		maxPerHour: MAX_UPLOADS_PER_HOUR,
		windowMs: RATE_LIMIT_WINDOW_MS,
	};
}
