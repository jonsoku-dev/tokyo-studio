import { Resend } from "resend";

// Initialize Resend with API key (fallback to mock if missing)
// In a real app, strict check or throw. For MVP/Dev, warning is okay but we prefer stability.
const resend = process.env.RESEND_API_KEY
	? new Resend(process.env.RESEND_API_KEY)
	: null;

const ORIGIN = process.env.ORIGIN || "http://localhost:3000";
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev"; // Default Resend testing email

export const emailService = {
	async sendVerificationEmail(email: string, token: string) {
		const verificationUrl = `${ORIGIN}/verify-email?token=${token}`;

		if (!resend) {
			console.log("==================================================");
			console.log(`[MOCK EMAIL] To: ${email}`);
			console.log(`Subject: Verify your email`);
			console.log(`Body: Click here to verify: ${verificationUrl}`);
			console.log("==================================================");
			return;
		}

		try {
			await resend.emails.send({
				from: EMAIL_FROM,
				to: email,
				subject: "Verify your email - Japan IT Job",
				html: `
        <h1>Welcome to Japan IT Job!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `,
			});
		} catch (error) {
			console.error("Failed to send verification email:", error);
			// Don't throw to prevent blocking flow, but log error
		}
	},

	async sendPasswordResetEmail(email: string, token: string) {
		const resetUrl = `${ORIGIN}/reset-password?token=${token}`;

		if (!resend) {
			console.log("==================================================");
			console.log(`[MOCK EMAIL] To: ${email}`);
			console.log(`Subject: Reset your password`);
			console.log(`Body: Click here to reset: ${resetUrl}`);
			console.log("==================================================");
			return;
		}

		try {
			await resend.emails.send({
				from: EMAIL_FROM,
				to: email,
				subject: "Reset your password - Japan IT Job",
				html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Click the link below to verify your email and set a new password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
			});
		} catch (error) {
			console.error("Failed to send password reset email:", error);
		}
	},

	async sendPasswordChangedEmail(email: string) {
		if (!resend) {
			console.log("==================================================");
			console.log(`[MOCK EMAIL] To: ${email}`);
			console.log(`Subject: Your password has been changed`);
			console.log(
				`Body: Your password was just changed. If this wasn't you, contact support immediately.`,
			);
			console.log("==================================================");
			return;
		}

		try {
			await resend.emails.send({
				from: EMAIL_FROM,
				to: email,
				subject: "Security Alert: Password Changed",
				html: `
        <h1>Your password was changed</h1>
        <p>This is a confirmation that the password for your Japan IT Job account was just changed.</p>
        <p>If you did not make this change, please contact support immediately.</p>
      `,
			});
		} catch (error) {
			console.error("Failed to send password changed email:", error);
		}
	},
};
