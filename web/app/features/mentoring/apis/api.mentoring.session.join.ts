import { db } from "@itcom/db/client";
import { mentoringSessions } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { type LoaderFunctionArgs, redirect } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import {
	BadRequestError,
	ExpiredError,
	ForbiddenError,
	loaderHandler,
	NotFoundError,
	ServiceUnavailableError,
} from "~/shared/lib";

/**
 * SPEC 013: Secure Join Proxy Endpoint
 *
 * GET /api/mentoring/session/:sessionId/join
 */
export const loader = loaderHandler(
	async ({ params, request }: LoaderFunctionArgs) => {
		// 1. Authenticate user
		const userId = await requireUserId(request);

		if (!params.sessionId) {
			throw new BadRequestError("Session ID is required");
		}

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
			throw new NotFoundError("Session");
		}

		const sessionRecord = session[0];

		// 3. Check user is participant (mentor or mentee)
		const isParticipant =
			sessionRecord.mentorId === userId || sessionRecord.userId === userId;

		if (!isParticipant) {
			throw new ForbiddenError("You are not a participant in this session");
		}

		// 4. Check session status
		if (sessionRecord.status === "cancelled") {
			throw new ExpiredError("This session has been cancelled");
		}

		if (sessionRecord.status !== "confirmed") {
			throw new BadRequestError(
				`Session is not confirmed (status: ${sessionRecord.status})`,
			);
		}

		// 5. Check session time hasn't passed
		const sessionTime = new Date(sessionRecord.date);
		const now = new Date();

		if (now > sessionTime) {
			throw new ExpiredError("This session has already ended");
		}

		// 6. Get meeting URL
		if (!sessionRecord.meetingUrl) {
			console.error(`[Join] No meeting URL for session ${params.sessionId}`);
			throw new ServiceUnavailableError(
				"Meeting URL is not yet available. Please contact support.",
			);
		}

		// 7. Log join attempt (for analytics)
		console.log(
			`[Join] User ${userId} joining session ${params.sessionId} via ${extractProvider(sessionRecord.meetingUrl)}`,
		);

		// 8. Redirect to meeting
		// apiHandler will pass Response objects (like redirects) through directly
		return redirect(sessionRecord.meetingUrl);
	},
);

/**
 * Extract provider name from meeting URL for logging
 */
function extractProvider(url: string): string {
	if (url.includes("meet.jit.si")) return "jitsi";
	if (url.includes("meet.google.com")) return "google";
	if (url.includes("zoom.us")) return "zoom";
	return "unknown";
}
