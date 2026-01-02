import type { SelectMentorApplication } from "@itcom/db/schema";
import { AnimatePresence } from "framer-motion";
import { useLoaderData } from "react-router";
import { requireUserId } from "../../auth/utils/session.server";
import { applicationService } from "../../mentoring/services/application.server";
import { profileService } from "../../onboarding/domain/profile.service.server";
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

	// Check if user has completed onboarding assessment
	const profile = await profileService.getProfile(userId);
	const hasProfile = profile !== undefined;

	return { tasks, jobs, mentorApplication, hasProfile };
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
	const { tasks, jobs, mentorApplication, hasProfile } = useLoaderData<{
		tasks: DashboardTask[];
		jobs: JobRecommendation[];
		mentorApplication?: SelectMentorApplication | null;
		hasProfile: boolean;
	}>();

	return (
		<div className="stack-md">
			{/* 3D Welcome Hero */}
			<WelcomeHero />

			{/* Onboarding CTA - Show only if user hasn't completed assessment */}
			{!hasProfile && (
				<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-amber-500 p-8 text-white shadow-lg">
					<div className="relative z-10">
						<h2 className="heading-3 mb-2">Get Your Personalized Roadmap</h2>
						<p className="mb-4 text-primary-50">
							Complete a 3-minute career assessment to unlock your customized
							action plan for landing a job in Japan.
						</p>
						<a
							href="/onboarding/assessment"
							className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-bold text-primary-600 transition-all hover:bg-gray-50 hover:shadow-md"
						>
							Start Assessment →
						</a>
					</div>
					{/* Decorative elements */}
					<div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
					<div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
				</div>
			)}

			{/* Mentor Application Status Widget */}
			<MentorApplicationStatus application={mentorApplication} />

			{/* Create Post / Action Bar */}
			<div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
				<div className="center h-10 w-10 flex-shrink-0 rounded-full border-2 border-white bg-primary-100 font-bold text-primary-600 shadow-sm">
					J
				</div>
				<input
					type="text"
					placeholder="What's your next step today?"
					className="flex-1 rounded-lg border border-transparent bg-gray-50 px-4 py-2.5 text-sm transition-all hover:border-gray-200 hover:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
				/>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Feed - Today's Tasks */}
				<div className="stack">
					<div className="flex items-center justify-between px-1">
						<h2 className="body-sm text-gray-500 uppercase tracking-wide">
							Today's Tasks
						</h2>
						<span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 text-xs">
							{tasks.filter((t) => t.status !== "completed").length} Pending
						</span>
					</div>

					{tasks.length === 0 && (
						<div className="caption rounded-xl border border-gray-200 border-dashed bg-gray-50 p-8 text-center">
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
					<h2 className="body-sm px-1 text-gray-500 uppercase tracking-wide">
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
	);
}
