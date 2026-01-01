import { data, redirect } from "react-router";
import { useEffect } from "react";
import { requireUserId } from "~/features/auth/utils/session.server";
import { KanbanBoard, type KanbanColumnConfig } from "../components";
import { useRoadmapQuery } from "../hooks/useRoadmapQuery";
import { useRoadmapStore } from "../stores/roadmap.store";
import {
	generateRoadmap,
	getRoadmap,
	getUserProfile,
	hasRoadmap,
} from "../services/roadmap.server";
import type { Route } from "./+types/index";

// ============================================
// Loader
// ============================================
export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request);

	// Check if user has a profile (completed diagnosis)
	const profile = await getUserProfile(userId);

	if (!profile) {
		return redirect("/diagnosis");
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
	}, []); // Only on mount - server data is initial source

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
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="sticky top-0 z-10 border-gray-200 border-b bg-white">
				<div className="container-wide px-4 py-4 sm:py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="sm:heading-3 text-xl tracking-tight">
								나의 로드맵
							</h1>
							<p className="sm:caption mt-1 font-medium text-xs">
								{profile.jobFamily} · {profile.level} · 일본어 {profile.jpLevel}
							</p>
						</div>
						<div className="flex items-center gap-4">
							{/* Progress */}
							<div className="hidden text-right sm:block">
								<p className="caption font-medium">전체 진행률</p>
								<p className="heading-4 text-indigo-600">
									{displayProgress.percent}%
								</p>
							</div>
							<div className="h-2.5 w-24 overflow-hidden rounded-full bg-gray-100 sm:w-32">
								<div
									className="h-full rounded-full bg-indigo-600 transition-all duration-500 ease-out"
									style={{ width: `${displayProgress.percent}%` }}
								/>
							</div>
						</div>
					</div>

					{/* Category Progress */}
					<div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
						{(
							["Learning", "Application", "Preparation", "Settlement"] as const
						).map((cat) => (
							<div
								key={cat}
								className="rounded-lg border border-gray-100/50 bg-gray-50/50 p-2.5"
							>
								<div className="mb-1.5 flex items-center justify-between">
									<span className="font-semibold text-gray-600 text-xs">
										{cat}
									</span>
									<span className="font-medium text-[10px] text-gray-400">
										{displayProgress.byCategory[cat].completed}/
										{displayProgress.byCategory[cat].total}
									</span>
								</div>
								<div className="h-1 w-full rounded-full bg-gray-200/50">
									<div
										className="h-1 rounded-full bg-indigo-500 text-[0px]"
										style={{
											width: `${displayProgress.byCategory[cat].percent}%`,
										}}
									>
										.
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Kanban Board */}
			<div className="container-wide px-4 py-8">
				<KanbanBoard tasks={displayTasks} columns={columns} />
			</div>
		</div>
	);
}
