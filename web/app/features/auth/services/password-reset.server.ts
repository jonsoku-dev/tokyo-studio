import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "~/shared/db/client.server";
import { passwordResetTokens, users } from "~/shared/db/schema";
import { emailService } from "./email.server";

export const passwordResetService = {
	async createResetToken(email: string, ipAddress: string) {
		// 1. Verify user exists
		const user = await db.query.users.findFirst({
			where: eq(users.email, email),
		});

		if (!user) {
			// Return true to prevent email enumeration (generic success)
			// But don't send email
			return true;
		}

		// 2. Generate Token
		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

		// 3. Store in DB (Delete old tokens for this user first? Or just add new one?)
		// FR-004: Invalidate all previous reset tokens
		await db
			.delete(passwordResetTokens)
			.where(eq(passwordResetTokens.userId, user.id));

		await db.insert(passwordResetTokens).values({
			token,
			userId: user.id,
			expiresAt,
			ipAddress,
		});

		// 4. Send Email
		await emailService.sendPasswordResetEmail(user.email, token);

		return true;
	},

	async validateResetToken(token: string) {
		const storedToken = await db.query.passwordResetTokens.findFirst({
			where: eq(passwordResetTokens.token, token),
		});

		if (!storedToken) {
			return { valid: false, error: "Invalid or expired token" };
		}

		if (new Date() > storedToken.expiresAt) {
			return { valid: false, error: "Token has expired" };
		}

		return { valid: true, userId: storedToken.userId };
	},

	async completePasswordReset(token: string, newPasswordHash: string) {
		const validation = await this.validateResetToken(token);
		if (!validation.valid || !validation.userId) {
			throw new Error(validation.error || "Invalid token");
		}

		// 1. Update Password
		await db
			.update(users)
			.set({ password: newPasswordHash, updatedAt: new Date() })
			.where(eq(users.id, validation.userId));

		// 2. Delete Token (FR-007)
		await db
			.delete(passwordResetTokens)
			.where(eq(passwordResetTokens.token, token));

		// 3. Send Notification (FR-009)
		const user = await db.query.users.findFirst({
			where: eq(users.id, validation.userId),
		});
		if (user) {
			await emailService.sendPasswordChangedEmail(user.email);
		}

		return true;
	},
};
