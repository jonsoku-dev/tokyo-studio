import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { passwordResetService } from "~/features/auth/services/password-reset.server";
import {
	checkPasswordResetRateLimit,
	getRateLimitErrorMessage,
	recordPasswordResetAttempt,
} from "~/features/auth/services/password-reset-limiter.server";
import {
	getIpAddress,
	getUserAgent,
	logPasswordResetEvent,
} from "~/features/auth/services/password-reset-logger.server";

/**
 * SPEC 003: Forgot Password API with Rate Limiting
 *
 * Security Critical - prevents DoS attacks via unlimited password reset requests
 * Rate Limit: 3 attempts per hour per email address
 */

export async function action({ request }: ActionFunctionArgs) {
	if (request.method !== "POST") {
		return data({ error: "Method not allowed" }, { status: 405 });
	}

	try {
		const formData = await request.formData();
		const email = formData.get("email");

		// Validate email
		if (!email || typeof email !== "string") {
			return data({ error: "Email is required" }, { status: 400 });
		}

		// Email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return data({ error: "Invalid email format" }, { status: 400 });
		}

		// Check rate limit BEFORE processing
		const rateLimit = await checkPasswordResetRateLimit(email);

		if (!rateLimit.allowed) {
			// Log rate limit exceeded
			await logPasswordResetEvent({
				email,
				eventType: "failed_rate_limit",
				ipAddress: getIpAddress(request),
				userAgent: getUserAgent(request),
			});

			return data(
				{
					error: getRateLimitErrorMessage(rateLimit),
					rateLimitExceeded: true,
					resetAt: rateLimit.resetAt,
				},
				{ status: 429 },
			);
		}

		// Get IP address for logging
		const ipAddress = getIpAddress(request);
		const userAgent = getUserAgent(request);

		// Record this attempt
		await recordPasswordResetAttempt(email, ipAddress);

		// Create reset token and send email
		// Note: This returns true even if user doesn't exist (prevents email enumeration)
		await passwordResetService.createResetToken(email, ipAddress);

		// Log successful password reset request
		await logPasswordResetEvent({
			email,
			eventType: "requested",
			ipAddress,
			userAgent,
		});

		return data({
			success: true,
			message:
				"If an account exists with this email, you will receive a password reset link.",
		});
	} catch (error) {
		console.error("[FORGOT PASSWORD ERROR]", error);
		return data(
			{
				success: false,
				error: "Failed to process password reset request. Please try again.",
			},
			{ status: 500 },
		);
	}
}
