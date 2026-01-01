import { db } from "@itcom/db/client";
import { mentoringSessions, users } from "@itcom/db/schema";
import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { Link, useLoaderData } from "react-router";
import { requireVerifiedUser } from "~/features/auth/utils/session.server";

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
		<div className="stack-md">
			<div className="flex items-center justify-between">
				<h1 className="heading-3">My Sessions</h1>
				<Link
					to="/mentoring"
					className="rounded-md bg-primary-600 px-4 py-2 font-medium text-sm text-white hover:bg-primary-700"
				>
					Browse Mentors
				</Link>
			</div>

			<div className="card-sm overflow-hidden border border-gray-200">
				{sessions.length === 0 ? (
					<div className="p-12 text-center text-gray-500">
						<p className="mb-4">No sessions found.</p>
						<Link to="/mentoring" className="text-primary-600 hover:underline">
							Find a mentor to book a session.
						</Link>
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{sessions.map((session) => (
							<div
								key={session.id}
								className="flex flex-col justify-between gap-4 p-6 hover:bg-gray-50 md:flex-row md:items-center"
							>
								<div className="flex items-center gap-4">
									<div className="center h-10 w-10 overflow-hidden rounded-full bg-gray-200">
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
										<h3 className="heading-5">{session.topic}</h3>
										<p className="caption">
											with {session.mentorName} • {session.duration} min
										</p>
									</div>
								</div>
								<div className="flex flex-col items-end gap-1 text-right">
									<p className="heading-5 text-sm">
										{format(new Date(session.date), "MMM d, yyyy h:mm a")}
									</p>
									<span
										className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs capitalize ${
											session.status === "completed"
												? "bg-accent-100 text-accent-800"
												: session.status === "confirmed"
													? "bg-primary-100 text-primary-800"
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
											className="mt-1 text-primary-600 text-xs hover:underline"
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
	);
}
