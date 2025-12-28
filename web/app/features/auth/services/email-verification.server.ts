import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "~/shared/db/client.server";
import { users, verificationTokens } from "~/shared/db/schema";

export async function createVerificationToken(userId: string) {
	// Generate a secure random token
	const token = crypto.randomBytes(32).toString("hex");
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

	// Store in DB
	await db.insert(verificationTokens).values({
		token,
		userId,
		expiresAt,
	});

	return token;
}

export async function verifyToken(token: string) {
	// Find token
	const [storedToken] = await db
		.select()
		.from(verificationTokens)
		.where(eq(verificationTokens.token, token));

	if (!storedToken) {
		return { success: false, error: "Invalid token" };
	}

	// Check expiration
	if (new Date() > storedToken.expiresAt) {
		return { success: false, error: "Token expired" };
	}

	// Mark user as verified
	await db
		.update(users)
		.set({ emailVerified: new Date() })
		.where(eq(users.id, storedToken.userId));

	// Delete token (single use)
	await db
		.delete(verificationTokens)
		.where(eq(verificationTokens.id, storedToken.id));

	return { success: true };
}

export async function sendVerificationEmail(email: string, token: string) {
	const verificationUrl = `${process.env.ORIGIN || "http://localhost:3000"}/verify-email?token=${token}`;

	// TODO: Integrate with real email provider (Resend, SendGrid, etc.)
	// For now, log to console for development
	console.log("==================================================");
	console.log(`[MOCK EMAIL] To: ${email}`);
	console.log(`Subject: Verify your email`);
	console.log(`Body: Click here to verify: ${verificationUrl}`);
	console.log("==================================================");
}
