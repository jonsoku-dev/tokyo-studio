import { db } from "@itcom/db/client";
import { mentoringSessions, users } from "@itcom/db/schema";
import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { Link, useLoaderData } from "react-router";
import { requireVerifiedUser } from "~/features/auth/utils/session.server";
import { Shell } from "~/shared/components/layout/Shell";

export function meta() {
	return [{ title: "My Sessions - Japan IT Job" }];
}

export async function loader({ request }: { request: Request }) {
	const userId = await requireVerifiedUser(request);

	// Fetch sessions
	const sessions = await db
		.select({
			id: mentoringSessions.id,
			topic: mentoringSessions.topic,
			date: mentoringSessions.date,
			duration: mentoringSessions.duration,
			status: mentoringSessions.status,
			meetingUrl: mentoringSessions.meetingUrl,
			mentorName: users.name,
			mentorAvatar: users.avatarUrl,
		})
		.from(mentoringSessions)
		.innerJoin(users, eq(mentoringSessions.mentorId, users.id))
		.where(eq(mentoringSessions.userId, userId))
		.orderBy(desc(mentoringSessions.date));

	return { sessions };
}

export default function MySessions() {
	const { sessions } = useLoaderData<typeof loader>();

	return (
		<Shell>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
					<Link
						to="/mentoring"
						className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
					>
						Browse Mentors
					</Link>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
					{sessions.length === 0 ? (
						<div className="p-12 text-center text-gray-500">
							<p className="mb-4">No sessions found.</p>
							<Link to="/mentoring" className="text-blue-600 hover:underline">
								Find a mentor to book a session.
							</Link>
						</div>
					) : (
						<div className="divide-y divide-gray-200">
							{sessions.map((session) => (
								<div
									key={session.id}
									className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 gap-4"
								>
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
											{session.mentorAvatar ? (
												<img
													src={session.mentorAvatar}
													alt={session.mentorName}
												/>
											) : (
												<span>{session.mentorName?.[0]}</span>
											)}
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">
												{session.topic}
											</h3>
											<p className="text-sm text-gray-500">
												with {session.mentorName} • {session.duration} min
											</p>
										</div>
									</div>
									<div className="text-right flex flex-col items-end gap-1">
										<p className="text-sm font-medium text-gray-900">
											{format(new Date(session.date), "MMM d, yyyy h:mm a")}
										</p>
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
												session.status === "completed"
													? "bg-green-100 text-green-800"
													: session.status === "confirmed"
														? "bg-blue-100 text-blue-800"
														: session.status === "pending"
															? "bg-yellow-100 text-yellow-800"
															: "bg-gray-100 text-gray-800"
											}`}
										>
											{session.status}
										</span>
										{session.status === "confirmed" && session.meetingUrl && (
											<a
												href={session.meetingUrl}
												target="_blank"
												rel="noreferrer"
												className="text-xs text-blue-600 hover:underline mt-1"
											>
												Join Meeting
											</a>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</Shell>
	);
}
