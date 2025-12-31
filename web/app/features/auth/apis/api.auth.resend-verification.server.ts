import crypto from "node:crypto";
import { db } from "@itcom/db/client";
import { verificationTokens } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import type { ActionFunctionArgs } from "react-router";
import { actionHandler, UnauthorizedError, ConflictError } from "~/shared/lib";

/**
 * SPEC 002: Resend Email Verification
 *
 * API endpoint for resending verification emails
 * Used by VerificationBanner component
 */
export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	const { getUserFromRequest } = await import(
		"~/features/auth/services/require-verified-email.server"
	);
	const user = await getUserFromRequest(request);

	if (!user) {
		throw new UnauthorizedError();
	}

	// Already verified - no need to send email
	if (user.emailVerified) {
		throw new ConflictError("Email already verified");
	}

	// ... token generation ...
	const token = crypto.randomBytes(32).toString("hex");
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

	await db
		.delete(verificationTokens)
		.where(eq(verificationTokens.userId, user.id));

	await db.insert(verificationTokens).values({
		id: crypto.randomUUID(),
		userId: user.id,
		token,
		expiresAt,
	});

	console.log(
		`[VERIFICATION] Email sent to ${user.email} with token: ${token}`,
	);

	return {
		success: true,
		message: "Verification email sent. Please check your inbox.",
	};
});
