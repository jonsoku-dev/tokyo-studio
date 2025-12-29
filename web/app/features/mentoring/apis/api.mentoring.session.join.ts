import { db } from "@itcom/db/client";
import { mentoringSessions } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { data, type LoaderFunctionArgs, redirect } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";

/**
 * SPEC 013: Secure Join Proxy Endpoint
 *
 * GET /api/mentoring/session/:sessionId/join
 *
 * Security checks:
 * 1. User is authenticated
 * 2. User is mentor or mentee in the session
 * 3. Session is confirmed
 * 4. Session time has not passed
 * 5. Session is not cancelled
 *
 * Then: Redirect to actual meeting URL
 */
export async function loader({ params, request }: LoaderFunctionArgs) {
	// 1. Authenticate user
	const userId = await requireUserId(request);

	if (!params.sessionId) {
		return data({ error: "Session ID is required" }, { status: 400 });
	}

	try {
		// 2. Fetch session with mentor and mentee info
		const session = await db
			.select({
				id: mentoringSessions.id,
				mentorId: mentoringSessions.mentorId,
				userId: mentoringSessions.userId,
				status: mentoringSessions.status,
				date: mentoringSessions.date,
				meetingUrl: mentoringSessions.meetingUrl,
			})
			.from(mentoringSessions)
			.where(eq(mentoringSessions.id, params.sessionId))
			.limit(1);

		if (!session || session.length === 0) {
			return data({ error: "Session not found" }, { status: 404 });
		}

		const sessionRecord = session[0];

		// 3. Check user is participant (mentor or mentee)
		const isParticipant =
			sessionRecord.mentorId === userId || sessionRecord.userId === userId;

		if (!isParticipant) {
			return data(
				{ error: "You are not a participant in this session" },
				{ status: 403 },
			);
		}

		// 4. Check session status
		if (sessionRecord.status === "cancelled") {
			return data(
				{
					error: "This session has been cancelled",
					code: "SESSION_CANCELLED",
				},
				{ status: 410 }, // Gone
			);
		}

		if (sessionRecord.status !== "confirmed") {
			return data(
				{
					error: `Session is not confirmed (status: ${sessionRecord.status})`,
					code: "SESSION_NOT_CONFIRMED",
				},
				{ status: 400 },
			);
		}

		// 5. Check session time hasn't passed
		const sessionTime = new Date(sessionRecord.date);
		const now = new Date();

		if (now > sessionTime) {
			return data(
				{
					error: "This session has already ended",
					code: "SESSION_ENDED",
				},
				{ status: 410 }, // Gone
			);
		}

		// 6. Get meeting URL
		if (!sessionRecord.meetingUrl) {
			console.error(`[Join] No meeting URL for session ${params.sessionId}`);
			return data(
				{
					error: "Meeting URL is not yet available. Please contact support.",
					code: "NO_MEETING_URL",
				},
				{ status: 503 },
			);
		}

		// 7. Log join attempt (for analytics)
		console.log(
			`[Join] User ${userId} joining session ${params.sessionId} via ${extractProvider(sessionRecord.meetingUrl)}`,
		);

		// 8. Redirect to meeting
		return redirect(sessionRecord.meetingUrl);
	} catch (error) {
		console.error("[Join] Error:", error);

		return data(
			{
				error: "An error occurred while processing your request",
				code: "INTERNAL_ERROR",
			},
			{ status: 500 },
		);
	}
}

/**
 * Extract provider name from meeting URL for logging
 */
function extractProvider(url: string): string {
	if (url.includes("meet.jit.si")) return "jitsi";
	if (url.includes("meet.google.com")) return "google";
	if (url.includes("zoom.us")) return "zoom";
	return "unknown";
}
