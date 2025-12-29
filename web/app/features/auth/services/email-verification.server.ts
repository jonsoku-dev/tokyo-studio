import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@itcom/db/client";
import { users, verificationTokens } from "@itcom/db/schema";

export async function createVerificationToken(userId: string) {
	// Generate a secure random token
	const token = crypto.randomBytes(32).toString("hex");
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

	// Delete old tokens for this user (Token Invalidation - SPEC 002 FR-004)
	await db
		.delete(verificationTokens)
		.where(eq(verificationTokens.userId, userId));

	// Store new token in DB
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

	// Delete all tokens for this user (Token Invalidation - SPEC 002 FR-004)
	await db
		.delete(verificationTokens)
		.where(eq(verificationTokens.userId, storedToken.userId));

	return { success: true };
}
