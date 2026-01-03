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
		<div className="stack-md">
			<h1 className="heading-3">My Sessions</h1>

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
								className="card-md flex flex-col items-center justify-between gap-4 p-responsive md:flex-row"
							>
								<div className="flex items-center gap-4">
									<div className="center h-12 w-12 rounded-full bg-primary-50 text-primary-600">
										<Calendar className="h-6 w-6" />
									</div>
									<div>
										<h3 className="heading-5">{session.topic}</h3>
										<p className="body-sm text-gray-500">
											with{" "}
											<span className="font-medium text-gray-900">
												{mentor?.name}
											</span>
										</p>
										<p className="caption mt-1">
											{format(
												new Date(session.date),
												"MMMM d, yyyy 'at' h:mm a",
											)}{" "}
											• {session.duration} min
										</p>

										{/* SPEC 022: Shared Documents */}
										{session.sharedDocuments &&
											session.sharedDocuments.length > 0 && (
												<div className="mt-3 flex flex-wrap gap-2">
													{session.sharedDocuments.map(
														(doc: {
															id: string;
															storageKey: string;
															title: string;
														}) => (
															<a
																key={doc.id}
																// Phase 3: Secure link
																href={`/api/storage/download/${doc.id}`}
																target="_blank"
																rel="noreferrer"
																className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 font-medium text-gray-700 text-xs hover:bg-gray-200 hover:text-gray-900"
															>
																<svg
																	className="h-3 w-3"
																	xmlns="http://www.w3.org/2000/svg"
																	viewBox="0 0 24 24"
																	fill="none"
																	stroke="currentColor"
																	strokeWidth="2"
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	aria-label="Document"
																>
																	<title>Document</title>
																	<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
																	<polyline points="14 2 14 8 20 8" />
																</svg>
																{doc.title}
															</a>
														),
													)}
												</div>
											)}
									</div>
								</div>

								<div className="flex items-center gap-3">
									<div
										className={`rounded-full px-3 py-1 font-bold text-xs ${
											(session.status || "scheduled") === "confirmed"
												? "bg-accent-50 text-accent-700"
												: "bg-gray-100 text-gray-600"
										}`}
									>
										{(session.status || "scheduled").toUpperCase()}
									</div>

									{isUpcoming && session.meetingUrl && (
										<a
											href={`/mentoring/session/${session.id}/join`}
											target="_blank"
											rel="noreferrer"
											className="btn-primary-sm flex items-center gap-2"
										>
											<Video className="h-4 w-4" />
											Join Call
										</a>
									)}

									{canReview && (
										<Link
											to={`/mentoring/session/${session.id}/review`}
											className="btn-secondary-sm flex items-center gap-2 text-amber-600 hover:bg-amber-50"
										>
											<Star className="h-4 w-4" />
											Write Review
										</Link>
									)}

									{isReviewed && (
										<span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-600 text-xs">
											<Star className="h-3 w-3 fill-current" />
											Reviewed
										</span>
									)}
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 border-dashed bg-gray-50 py-24 text-center">
					<p className="mb-4 text-gray-500">No sessions booked yet.</p>
					<Link
						to="/mentoring"
						className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
					>
						Browse Mentors →
					</Link>
				</div>
			)}
		</div>
	);
}
