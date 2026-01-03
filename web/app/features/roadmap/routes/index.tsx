import { useEffect } from "react";
import { data, Link, redirect } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { KanbanBoard, type KanbanColumnConfig } from "../components";
import { useRoadmapQuery } from "../hooks/useRoadmapQuery";
import {
	generateRoadmap,
	getRoadmap,
	getUserProfile,
	hasRoadmap,
} from "../services/roadmap.server";
import { useRoadmapStore } from "../stores/roadmap.store";
import type { Route } from "./+types/index";

// ============================================
// Loader
// ============================================
export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request);

	// Check if user has a profile (completed onboarding assessment)
	const profile = await getUserProfile(userId);

	if (!profile) {
		return redirect("/onboarding/assessment");
	}

	// Check if user has a roadmap
	const hasExisting = await hasRoadmap(userId);

	if (!hasExisting) {
		// Generate roadmap on first visit
		const roadmapData = await generateRoadmap(userId);
		return data({ ...roadmapData, profile });
	}

	const roadmapData = await getRoadmap(userId);
	return data({ ...roadmapData, profile });
}

// ============================================
// Component
// ============================================
export default function RoadmapPage({ loaderData }: Route.ComponentProps) {
	const { tasks, progress, profile } = loaderData;

	// Initialize store on mount
	const storeProgress = useRoadmapStore((state) => state.progress);
	const storeSetTasks = useRoadmapStore((state) => state.setTasks);

	// Initialize Zustand store with server data on mount
	useEffect(() => {
		console.log("[Page] Initializing store with server tasks:", tasks.length);
		storeSetTasks(tasks);
	}, [tasks, storeSetTasks]); // Sync with server data on load or revalidation

	// Initialize React Query with SSR data
	const { data: roadmapData } = useRoadmapQuery({
		tasks,
		progress,
		roadmap: null,
	});

	// Display data: Use store progress for real-time updates, fallback to server
	// Cast kanbanColumn to proper type (DB returns string, component expects union type)
	const displayTasks = (roadmapData?.tasks ?? tasks).map((t) => ({
		...t,
		kanbanColumn: t.kanbanColumn as "todo" | "in_progress" | "completed",
	}));

	// Use store progress (real-time updated) instead of server progress
	const displayProgress = storeProgress;

	// Column configuration
	const columns: KanbanColumnConfig[] = [
		{
			id: "todo",
			title: "To Do",
			count: displayTasks.filter((t) => t.kanbanColumn === "todo").length,
		},
		{
			id: "in_progress",
			title: "In Progress",
			count: displayTasks.filter((t) => t.kanbanColumn === "in_progress")
				.length,
		},
		{
			id: "completed",
			title: "Completed",
			count: displayTasks.filter((t) => t.kanbanColumn === "completed").length,
		},
	];

	return (
		<div className="flex flex-col gap-6">
			{/* Sticky Header Wrapper */}
			<div className="sticky top-0 z-10 -mx-4 -mt-4 bg-white/95 px-4 pt-4 backdrop-blur-sm sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pt-8">
				<PageHeader
					title="나의 로드맵"
					description={`${profile.jobFamily} · ${profile.level} · 일본어 ${profile.jpLevel}`}
					actions={
						<div className="flex items-center gap-2">
							<Link
								to="/onboarding/result"
								className="rounded-full bg-primary-50 px-3 py-1 font-medium text-primary-700 text-sm transition-colors hover:bg-primary-100"
							>
								진단 결과
							</Link>
							<Link
								to="/onboarding/assessment"
								className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600 text-sm transition-colors hover:bg-gray-200"
							>
								진단 수정
							</Link>
						</div>
					}
					className="border-none pb-4"
				>
					{/* Dashboard / Stats Area */}
					<div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
						<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
							{/* Overall Progress */}
							<div className="flex shrink-0 items-center gap-4 lg:w-64">
								<div className="flex-1">
									<div className="mb-2 flex items-baseline justify-between">
										<p className="font-semibold text-gray-700 text-sm">
											전체 진행률
										</p>
										<p className="font-bold text-indigo-600 text-lg">
											{displayProgress.percent}%
										</p>
									</div>
									<div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
										<div
											className="h-full rounded-full bg-indigo-600 transition-all duration-500 ease-out"
											style={{ width: `${displayProgress.percent}%` }}
										/>
									</div>
								</div>
								<div className="hidden h-10 w-px bg-gray-200 lg:block" />
							</div>

							{/* Category Progress */}
							<div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
								{(
									[
										"Learning",
										"Application",
										"Preparation",
										"Settlement",
									] as const
								).map((cat) => (
									<div key={cat} className="group">
										<div className="mb-2 flex items-center justify-between">
											<span className="font-medium text-gray-600 text-xs transition-colors group-hover:text-gray-900">
												{cat}
											</span>
											<span className="font-medium text-[10px] text-gray-400">
												{displayProgress.byCategory[cat].completed}/
												{displayProgress.byCategory[cat].total}
											</span>
										</div>
										<div className="h-1.5 w-full rounded-full bg-gray-200/50">
											<div
												className="h-1.5 rounded-full bg-indigo-500 transition-all duration-300 group-hover:bg-indigo-600"
												style={{
													width: `${displayProgress.byCategory[cat].percent}%`,
												}}
											/>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</PageHeader>
			</div>

			{/* Kanban Board */}
			<div className="min-h-[500px]">
				<KanbanBoard tasks={displayTasks} columns={columns} />
			</div>
		</div>
	);
}
