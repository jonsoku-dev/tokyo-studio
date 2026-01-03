import { db } from "@itcom/db/client";
import { mentoringSessions } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const userId = await requireUserId(request);
	const sessionId = params.sessionId;

	if (!sessionId) {
		throw new Response("Session ID missing", { status: 400 });
	}

	const session = await db.query.mentoringSessions.findFirst({
		where: eq(mentoringSessions.id, sessionId),
	});

	if (!session) {
		throw new Response("Session not found", { status: 404 });
	}

	// 1. Authorization
	if (session.userId !== userId && session.mentorId !== userId) {
		throw new Response("Unauthorized access to this session", { status: 403 });
	}

	// 2. Time Logic
	// Allow join 10 minutes before and until duration + 30 minutes after start.
	const now = new Date();
	const startTime = new Date(session.date);
	const endTime = new Date(startTime.getTime() + session.duration * 60000);

	const joinWindowStart = new Date(startTime.getTime() - 10 * 60000); // 10 min before
	const joinWindowEnd = new Date(endTime.getTime() + 30 * 60000); // 30 min after end

	if (now < joinWindowStart) {
		throw new Response(
			`Session hasn't started yet. You can join from ${joinWindowStart.toLocaleTimeString()}`,
			{ status: 403 },
		);
	}

	if (now > joinWindowEnd) {
		throw new Response("Session has expired.", { status: 410 });
	}

	// 3. Redirect
	if (!session.meetingUrl) {
		throw new Response("Meeting URL not available. Please contact support.", {
			status: 500,
		});
	}

	return redirect(session.meetingUrl);
}

export default function JoinRoute() {
	// This component strictly handles redirects or errors via ErrorBoundary
	return null;
}

export function ErrorBoundary({ error }: { error: unknown }) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-responsive">
			<div className="w-full max-w-md rounded-lg bg-white p-responsive text-center shadow-md">
				<h1 className="heading-3 mb-4 text-red-600">Cannot Join Session</h1>
				<p className="mb-6 text-gray-700">
					{error instanceof Response
						? error.statusText ||
							(error as { data?: string }).data ||
							"An error occurred"
						: "An unexpected error occurred."}
				</p>
				<a
					href="/mentoring/bookings"
					className="text-primary-600 hover:underline"
				>
					Back to My Sessions
				</a>
			</div>
		</div>
	);
}
