import crypto from "node:crypto";
import { db } from "@itcom/db/client";
import { passwordResetTokens, users } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { emailService } from "./email.server";
import { logPasswordResetEvent } from "./password-reset-logger.server";

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

	async validateResetToken(
		token: string,
		metadata?: { ipAddress?: string; userAgent?: string },
	) {
		const storedToken = await db.query.passwordResetTokens.findFirst({
			where: eq(passwordResetTokens.token, token),
		});

		if (!storedToken) {
			// Log invalid token attempt if metadata provided
			if (metadata) {
				// If token is not found, we can't get the user ID from it easily unless we passed strict email.
				// But here we rely on token. If token invalid, we just log 'unknown' or skip user lookup if we rely on token for userId.
				// Actually if storedToken is null, we CANNOT get userId from it.
				// We'll log as "unknown" user.
				await logPasswordResetEvent({
					userId: undefined, // Unknown user
					email: "unknown",
					eventType: "failed_invalid_token",
					ipAddress: metadata.ipAddress,
					userAgent: metadata.userAgent,
				});
			}
			return { valid: false, error: "Invalid or expired token" };
		}

		if (new Date() > storedToken.expiresAt) {
			// Log expired token attempt
			if (metadata) {
				const user = await db.query.users.findFirst({
					where: eq(users.id, storedToken.userId),
				});
				await logPasswordResetEvent({
					userId: storedToken?.userId || "", // Ensure string
					email: user?.email || "unknown",
					eventType: "failed_expired_token",
					ipAddress: metadata.ipAddress,
					userAgent: metadata.userAgent,
				});
			}
			return { valid: false, error: "Token has expired" };
		}

		return { valid: true, userId: storedToken.userId };
	},

	async completePasswordReset(
		token: string,
		newPasswordHash: string,
		metadata?: {
			ipAddress?: string;
			userAgent?: string;
		},
	) {
		const validation = await this.validateResetToken(token, metadata);
		if (!validation.valid || !validation.userId) {
			throw new Error(validation.error || "Invalid token");
		}

		const timestamp = new Date();

		// 1. Update Password
		await db
			.update(users)
			.set({ password: newPasswordHash, updatedAt: timestamp })
			.where(eq(users.id, validation.userId));

		// 2. Delete Token (FR-007)
		await db
			.delete(passwordResetTokens)
			.where(eq(passwordResetTokens.token, token));

		// 3. Send Notification (FR-009, FR-010)
		const user = await db.query.users.findFirst({
			where: eq(users.id, validation.userId),
		});
		if (user) {
			await emailService.sendPasswordChangedEmail(user.email, {
				ipAddress: metadata?.ipAddress,
				userAgent: metadata?.userAgent,
				timestamp,
			});

			// 4. Log successful password reset (SPEC 003 FR-013)
			await logPasswordResetEvent({
				userId: user.id,
				email: user.email,
				eventType: "completed",
				ipAddress: metadata?.ipAddress,
				userAgent: metadata?.userAgent,
			});
		}

		return true;
	},
};
