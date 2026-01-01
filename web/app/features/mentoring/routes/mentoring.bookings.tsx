import { format } from "date-fns";
import { Calendar, Star, Video } from "lucide-react";
import { Link, type LoaderFunctionArgs, useLoaderData } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { mentoringService } from "../services/mentoring.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request);
	const sessions = await mentoringService.getUserSessions(userId);
	return { sessions };
}

export default function MySessionsPage() {
	const { sessions } = useLoaderData<typeof loader>();

	return (
		<div className="min-h-screen bg-black text-white pt-24 pb-12">
			<div className="container-page px-4">
				<h1 className="heading-2 mb-8">My Sessions</h1>

				{sessions.length > 0 ? (
					<div className="stack">
						{sessions.map(({ session, mentor, isReviewed }) => {
							const date = new Date(session.date);
							const now = new Date();
							const isUpcoming = date > now;
							const isPast = date < now;
							// Allow review if completed OR (confirmed and past time)
							const canReview =
								!isReviewed &&
								(session.status === "completed" ||
									(session.status === "confirmed" && isPast));

							return (
								<div
									key={session.id}
									className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:bg-white/10"
								>
									<div className="flex items-center gap-4">
										<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
											<Calendar className="h-6 w-6" />
										</div>
										<div>
											<h3 className="font-bold text-lg">{session.topic}</h3>
											<p className="text-sm text-gray-400">
												with <span className="text-white">{mentor?.name}</span>
											</p>
											<p className="caption mt-1">
												{format(
													new Date(session.date),
													"MMMM d, yyyy 'at' h:mm a",
												)}{" "}
												• {session.duration} min
											</p>
										</div>
									</div>

									<div className="flex items-center gap-3">
										<div
											className={`px-3 py-1 rounded-full text-xs font-bold ${
												(session.status || "scheduled") === "confirmed"
													? "bg-accent-500/20 text-accent-400"
													: "bg-gray-500/20 text-gray-400"
											}`}
										>
											{(session.status || "scheduled").toUpperCase()}
										</div>

										{isUpcoming && session.meetingUrl && (
											<a
												href={`/mentoring/session/${session.id}/join`}
												target="_blank"
												rel="noreferrer"
												className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 body-sm text-white hover:bg-primary/80"
											>
												<Video className="h-4 w-4" />
												Join Call
											</a>
										)}

										{canReview && (
											<Link
												to={`/mentoring/session/${session.id}/review`}
												className="flex items-center gap-2 rounded-lg bg-amber-500/20 px-4 py-2 body-sm text-amber-500 hover:bg-amber-500/30"
											>
												<Star className="h-4 w-4" />
												Write Review
											</Link>
										)}

										{isReviewed && (
											<span className="text-xs text-amber-500 font-medium px-3 py-2">
												Reviewed ✓
											</span>
										)}
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 py-24 text-center">
						<p className="text-gray-400 mb-4">No sessions booked yet.</p>
						<Link
							to="/mentoring"
							className="text-primary font-bold hover:underline"
						>
							Browse Mentors →
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
