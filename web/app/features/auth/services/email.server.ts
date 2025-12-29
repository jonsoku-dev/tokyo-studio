import { Resend } from "resend";
import { UAParser } from "ua-parser-js";

// Initialize Resend with API key (fallback to mock if missing)
// In a real app, strict check or throw. For MVP/Dev, warning is okay but we prefer stability.
const resend = process.env.RESEND_API_KEY
	? new Resend(process.env.RESEND_API_KEY)
	: null;

const ORIGIN = process.env.ORIGIN || "http://localhost:3000";
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev"; // Default Resend testing email

/**
 * Parse user agent string to extract browser and device information
 */
function parseUserAgent(userAgent: string) {
	const parser = new UAParser(userAgent);
	const result = parser.getResult();

	const browser = result.browser.name
		? `${result.browser.name} ${result.browser.version || ""}`.trim()
		: "Unknown Browser";
	const os = result.os.name
		? `${result.os.name} ${result.os.version || ""}`.trim()
		: "Unknown OS";
	const device = result.device.type
		? `${result.device.vendor || ""} ${result.device.model || ""} (${result.device.type})`.trim()
		: "Desktop/Laptop";

	return { browser, os, device };
}

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

	async sendPasswordChangedEmail(
		email: string,
		metadata?: {
			ipAddress?: string;
			userAgent?: string;
			timestamp?: Date;
		},
	) {
		const timestamp = metadata?.timestamp || new Date();
		const ipAddress = metadata?.ipAddress || "Unknown";
		const userAgent = metadata?.userAgent || "";
		const { browser, os, device } = parseUserAgent(userAgent);

		const formattedTime = timestamp.toLocaleString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			timeZoneName: "short",
		});

		if (!resend) {
			console.log("==================================================");
			console.log(`[MOCK EMAIL] To: ${email}`);
			console.log(`Subject: Security Alert - Password Changed`);
			console.log(`Time: ${formattedTime}`);
			console.log(`IP: ${ipAddress}`);
			console.log(`Browser: ${browser}`);
			console.log(`OS: ${os}`);
			console.log(`Device: ${device}`);
			console.log("==================================================");
			return;
		}

		try {
			await resend.emails.send({
				from: EMAIL_FROM,
				to: email,
				subject: "Security Alert: Password Changed - Japan IT Job",
				html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background-color: white; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .info-item { margin: 8px 0; }
            .info-label { font-weight: bold; color: #4b5563; }
            .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .action-btn { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Security Alert: Password Changed</h1>
            </div>
            <div class="content">
              <p>This is a security notification to confirm that the password for your Japan IT Job account was successfully changed.</p>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #1f2937;">Security Details</h3>
                <div class="info-item">
                  <span class="info-label">Time:</span> ${formattedTime}
                </div>
                <div class="info-item">
                  <span class="info-label">IP Address:</span> ${ipAddress}
                </div>
                <div class="info-item">
                  <span class="info-label">Browser:</span> ${browser}
                </div>
                <div class="info-item">
                  <span class="info-label">Operating System:</span> ${os}
                </div>
                <div class="info-item">
                  <span class="info-label">Device:</span> ${device}
                </div>
              </div>

              <div class="warning">
                <strong>⚠️ Didn't make this change?</strong>
                <p style="margin-bottom: 0;">If you did not authorize this password change, your account may be compromised. Take immediate action to secure your account:</p>
              </div>

              <div style="margin: 25px 0;">
                <p><strong>Immediate Steps to Secure Your Account:</strong></p>
                <ol>
                  <li>Reset your password immediately using a different device</li>
                  <li>Enable email verification if you haven't already</li>
                  <li>Review your account's recent activity</li>
                  <li>Check for any unauthorized changes to your profile</li>
                  <li>Consider updating passwords on other services where you used the same password</li>
                </ol>
              </div>

              <a href="${ORIGIN}/reset-password" class="action-btn">Reset Password Now</a>

              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                If you made this change, you can safely ignore this email. Your account is secure.
              </p>

              <div class="footer">
                <p>This is an automated security notification from Japan IT Job.</p>
                <p>For security reasons, we cannot respond to replies to this email.</p>
                <p>If you need assistance, please visit our support center at ${ORIGIN}/support</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
			});
		} catch (error) {
			console.error("Failed to send password changed email:", error);
		}
	},

	async sendMentoringConfirmation(
		email: string,
		params: {
			mentorName: string;
			date: Date;
			duration: number; // minutes
			meetingUrl: string;
			topic: string;
		},
	) {
		const { mentorName, date, duration, meetingUrl, topic } = params;
		const endTime = new Date(date.getTime() + duration * 60000);
		const formatDate = (d: Date) =>
			`${d.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;

		const icsContent = [
			"BEGIN:VCALENDAR",
			"VERSION:2.0",
			"PRODID:-//Japan IT Job//Mentoring//EN",
			"BEGIN:VEVENT",
			`UID:${Date.now()}@japanitjob.com`,
			`DTSTAMP:${formatDate(new Date())}`,
			`DTSTART:${formatDate(date)}`,
			`DTEND:${formatDate(endTime)}`,
			`SUMMARY:Mentoring with ${mentorName}`,
			`DESCRIPTION:Topic: ${topic}\\nMeeting Link: ${meetingUrl}`,
			`LOCATION:${meetingUrl}`,
			"END:VEVENT",
			"END:VCALENDAR",
		].join("\r\n");

		if (!resend) {
			console.log("==================================================");
			console.log(`[MOCK EMAIL] To: ${email}`);
			console.log(`Subject: Booking Confirmed: ${mentorName}`);
			console.log(`Time: ${date.toLocaleString()}`);
			console.log(`Link: ${meetingUrl}`);
			console.log(`[ICS ATTACHMENT GENERATED]`);
			console.log("==================================================");
			return;
		}

		try {
			await resend.emails.send({
				from: EMAIL_FROM,
				to: email,
				subject: `Booking Confirmed: Mentoring with ${mentorName}`,
				html: `
                    <h1>Booking Confirmed</h1>
                    <p>You are scheduled to meet with <strong>${mentorName}</strong>.</p>
                    <p><strong>Time:</strong> ${date.toLocaleString()}</p>
                    <p><strong>Topic:</strong> ${topic}</p>
                    <p><a href="${meetingUrl}">Join Video Call</a></p>
                `,
				attachments: [
					{
						filename: "invite.ics",
						content: Buffer.from(icsContent).toString("base64"), // Resend expects buffer or string? Checking docs/types: string content is safe if marked generic.
						// Actually Resend node SDK `content` is Buffer | string.
						// I'll provide buffer.
					},
				] as unknown as { filename: string; content: string }[],
			});
		} catch (error) {
			console.error("Failed to send booking email:", error);
		}
	},

	async sendSessionReminder(
		email: string,
		params: {
			mentorName: string;
			timeString: string;
			meetingUrl: string;
		},
	) {
		if (!resend) {
			console.log("==================================================");
			console.log(`[MOCK EMAIL] REMINDER To: ${email}`);
			console.log(`Subject: Reminder: Session starts in 10 minutes`);
			console.log(`Link: ${params.meetingUrl}`);
			console.log("==================================================");
			return;
		}

		try {
			await resend.emails.send({
				from: EMAIL_FROM,
				to: email,
				subject: `Reminder: Session with ${params.mentorName} starts soon`,
				html: `
                    <h1>Session Reminder</h1>
                    <p>Your session with <strong>${params.mentorName}</strong> starts in about 10 minutes (${params.timeString}).</p>
                    <p><a href="${params.meetingUrl}">Join Video Call</a></p>
                `,
			});
		} catch (error) {
			console.error("Failed to send reminder email:", error);
		}
	},
};
