import type { ActionFunctionArgs } from "react-router";
import { actionHandler, BadRequestError, RateLimitError } from "~/shared/lib";
import { passwordResetService } from "../services/password-reset.server";
import {
	checkPasswordResetRateLimit,
	getRateLimitErrorMessage,
	recordPasswordResetAttempt,
} from "../services/password-reset-limiter.server";
import {
	getIpAddress,
	getUserAgent,
	logPasswordResetEvent,
} from "../services/password-reset-logger.server";

/**
 * SPEC 003: Forgot Password API with Rate Limiting
 *
 * Security Critical - prevents DoS attacks via unlimited password reset requests
 * Rate Limit: 3 attempts per hour per email address
 */
export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const email = formData.get("email");

	// Validate email
	if (!email || typeof email !== "string") {
		throw new BadRequestError("Email is required");
	}

	// Email format validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		throw new BadRequestError("Invalid email format");
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

		throw new RateLimitError(getRateLimitErrorMessage(rateLimit));
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

	return {
		success: true,
		message:
			"If an account exists with this email, you will receive a password reset link.",
	};
});
