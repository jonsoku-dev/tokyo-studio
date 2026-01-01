import type { SelectMentorApplication } from "@itcom/db/schema";
import { AnimatePresence } from "framer-motion";
import { useLoaderData } from "react-router";
import { Shell } from "~/shared/components/layout/Shell";
import { requireUserId } from "../../auth/utils/session.server";
import { applicationService } from "../../mentoring/services/application.server";
import { JobCard } from "../components/JobCard";
import { MentorApplicationStatus } from "../components/MentorApplicationStatus";
import { TaskCard } from "../components/TaskCard";
import { WelcomeHero } from "../components/WelcomeHero";
import { dashboardService } from "../domain/dashboard.service.server";
import type {
	DashboardTask,
	JobRecommendation,
} from "../domain/dashboard.types";

export function meta() {
	return [
		{ title: "Japan IT Job - Home" },
		{ name: "description", content: "Your roadmap to Japan IT employment" },
	];
}

export async function loader({ request }: { request: Request }) {
	const userId = await requireUserId(request);
	const tasks = await dashboardService.getTasks();
	const jobs = await dashboardService.getRecommendedJobs();
	const mentorApplication =
		await applicationService.getApplicationStatus(userId);
	return { tasks, jobs, mentorApplication };
}

export async function action({ request }: { request: Request }) {
	await requireUserId(request);
	const formData = await request.formData();
	const id = String(formData.get("id"));
	const status = String(formData.get("status"));

	await dashboardService.updateTaskStatus(id, status);
	return null;
}

export default function Home() {
	const { tasks, jobs, mentorApplication } = useLoaderData<{
		tasks: DashboardTask[];
		jobs: JobRecommendation[];
		mentorApplication?: SelectMentorApplication | null;
	}>();

	return (
		<Shell>
			<div className="stack-md">
				{/* 3D Welcome Hero */}
				<WelcomeHero />

				{/* Mentor Application Status Widget */}
				<MentorApplicationStatus application={mentorApplication} />

				{/* Create Post / Action Bar */}
				<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
					<div className="w-10 h-10 rounded-full bg-primary-100 flex-shrink-0 border-2 border-white shadow-sm center text-primary-600 font-bold">
						J
					</div>
					<input
						type="text"
						placeholder="What's your next step today?"
						className="flex-1 bg-gray-50 hover:bg-white border-transparent hover:border-gray-200 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
					/>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Feed - Today's Tasks */}
					<div className="stack">
						<div className="flex items-center justify-between px-1">
							<h2 className="body-sm text-gray-500 uppercase tracking-wide">
								Today's Tasks
							</h2>
							<span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
								{tasks.filter((t) => t.status !== "completed").length} Pending
							</span>
						</div>

						{tasks.length === 0 && (
							<div className="caption p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
								No tasks for today. Great job!
							</div>
						)}

						<AnimatePresence mode="popLayout">
							{tasks.map((task) => (
								<TaskCard key={task.id} task={task} />
							))}
						</AnimatePresence>
					</div>

					{/* Feed - Job Recommendations */}
					<div className="stack">
						<h2 className="body-sm text-gray-500 uppercase tracking-wide px-1">
							Recommended for you
						</h2>

						<div className="stack">
							{jobs.map((job, idx) => (
								<JobCard key={job.id} job={job} index={idx} />
							))}
						</div>
					</div>
				</div>
			</div>
		</Shell>
	);
}
