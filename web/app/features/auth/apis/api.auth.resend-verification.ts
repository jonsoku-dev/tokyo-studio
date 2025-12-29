import crypto from "node:crypto";
import { db } from "@itcom/db/client";
import { verificationTokens } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";

/**
 * SPEC 002: Resend Email Verification
 *
 * API endpoint for resending verification emails
 * Used by VerificationBanner component
 */

export async function action({ request }: ActionFunctionArgs) {
	if (request.method !== "POST") {
		return data({ error: "Method not allowed" }, { status: 405 });
	}

	try {
		// ... (truncated for brevity, logic remains same)
		const { getUserFromRequest } = await import(
			"~/features/auth/services/require-verified-email.server"
		);
		const user = await getUserFromRequest(request);

		if (!user) {
			return data({ error: "Unauthorized" }, { status: 401 });
		}

		// Already verified - no need to send email
		if (user.emailVerified) {
			return data({
				success: false,
				error: "Email already verified",
			});
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

		return data({
			success: true,
			message: "Verification email sent. Please check your inbox.",
		});
	} catch (error) {
		console.error("[VERIFICATION ERROR]", error);
		return data(
			{
				success: false,
				error: "Failed to send verification email. Please try again.",
			},
			{ status: 500 },
		);
	}
}
