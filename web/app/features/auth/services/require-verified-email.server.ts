import { db } from "@itcom/db/client";
import type { User } from "@itcom/db/schema";
import { users } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "react-router";
import { getUserId } from "~/features/auth/utils/session.server";

/**
 * Email Verification Middleware
 *
 * Ensures user has verified their email before accessing protected features.
 *
 * SPEC 002: Email Verification Access Control
 * Production Blocker - prevents unverified users from:
 * - Posting job opportunities
 * - Booking mentoring sessions
 * - Writing comments
 */

export interface VerificationCheckResult {
	isVerified: boolean;
	user: User;
}

/**
 * Get user object from request
 * Returns null if no user is logged in
 */
export async function getUserFromRequest(
	request: Request,
): Promise<User | null> {
	const userId = await getUserId(request);
	if (!userId) {
		return null;
	}

	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	return user || null;
}

/**
 * Require user to be logged in
 * Throws redirect to login if not authenticated
 */
export async function requireUser(request: Request): Promise<User> {
	const user = await getUserFromRequest(request);

	if (!user) {
		const url = new URL(request.url);
		throw redirect(`/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}

	return user;
}

/**
 * Check if user has verified their email
 * Throws redirect if verification required
 */
export async function requireVerifiedEmail(
	request: Request,
	options?: {
		/** Custom redirect path instead of default /verify-email/required */
		redirectTo?: string;
		/** Additional context for returnTo parameter */
		context?: string;
	},
): Promise<User> {
	const user = await requireUser(request);

	if (!user.emailVerified) {
		const redirectPath = options?.redirectTo || "/verify-email/required";
		const returnTo = options?.context || new URL(request.url).pathname;
		const redirectUrl = `${redirectPath}?returnTo=${encodeURIComponent(returnTo)}`;

		throw redirect(redirectUrl);
	}

	return user;
}

/**
 * Non-throwing version that returns verification status
 * Useful for conditional UI rendering
 */
export async function checkEmailVerification(
	request: Request,
): Promise<VerificationCheckResult | null> {
	const user = await getUserFromRequest(request);

	if (!user) {
		return null;
	}

	return {
		isVerified: !!user.emailVerified,
		user,
	};
}
