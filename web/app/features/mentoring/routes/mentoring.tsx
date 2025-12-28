import { Link, useLoaderData } from "react-router";
import { Shell } from "~/shared/components/layout/Shell";
import { requireUserId } from "../../auth/utils/session.server";
import { mentoringService } from "../domain/mentoring.service.server";
import type { MentoringSession } from "../domain/mentoring.types";

export function meta() {
	return [{ title: "Mentoring - Japan IT Job" }];
}

export async function loader({ request }: { request: Request }) {
	await requireUserId(request);
	const sessions = await mentoringService.getSessions();
	return { sessions };
}

export default function Mentoring() {
	const { sessions } = useLoaderData<{ sessions: MentoringSession[] }>();

	return (
		<Shell>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-gray-900">Mentoring</h1>
					<Link
						to="/mentoring/book"
						className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700"
					>
						Book Session
					</Link>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
					{sessions.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							No upcoming sessions. Book a mentor to get started.
						</div>
					) : (
						<div className="divide-y divide-gray-200">
							{sessions.map((session) => (
								<div
									key={session.id}
									className="p-4 flex items-center justify-between hover:bg-gray-50"
								>
									<div>
										<h3 className="text-sm font-medium text-gray-900">
											{session.topic}
										</h3>
										<p className="text-sm text-gray-500">
											with {session.mentorName}
										</p>
									</div>
									<div className="text-right">
										<p className="text-sm text-gray-900">{session.date}</p>
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												session.status === "completed"
													? "bg-green-100 text-green-800"
													: session.status === "canceled"
														? "bg-red-100 text-red-800"
														: "bg-blue-100 text-blue-800"
											}`}
										>
											{session.status}
										</span>
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
