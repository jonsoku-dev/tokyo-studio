import { useCallback } from "react";
import { data, redirect } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import {
	KanbanBoard,
	type KanbanColumnConfig,
} from "../components";
import {
	generateRoadmap,
	getRoadmap,
	getUserProfile,
	hasRoadmap,
} from "../services/roadmap.server";
import { useRoadmapQuery } from "../hooks/useRoadmapQuery";
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

	// Initialize React Query with SSR data
	const { data: roadmapData } = useRoadmapQuery({
		tasks,
		progress,
		roadmap: null,
	});

	// Use the data from React Query (or SSR data if not yet hydrated)
	const displayTasks = roadmapData?.tasks ?? tasks;

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
			<div className="bg-white border-b border-gray-200 sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
								나의 로드맵
							</h1>
							<p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
								{profile.jobFamily} · {profile.level} · 일본어{" "}
								{profile.jpLevel}
							</p>
						</div>
						<div className="flex items-center gap-4">
							{/* Progress */}
							<div className="text-right hidden sm:block">
								<p className="text-xs text-gray-500 font-medium">
									전체 진행률
								</p>
								<p className="text-xl font-bold text-indigo-600">
									{progress.percent}%
								</p>
							</div>
							<div className="w-24 sm:w-32 bg-gray-100 rounded-full h-2.5 overflow-hidden">
								<div
									className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
									style={{ width: `${progress.percent}%` }}
								/>
							</div>
						</div>
					</div>

					{/* Category Progress */}
					<div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
						{(
							[
								"Learning",
								"Application",
								"Preparation",
								"Settlement",
							] as const
						).map((cat) => (
							<div
								key={cat}
								className="bg-gray-50/50 rounded-lg p-2.5 border border-gray-100/50"
							>
								<div className="flex items-center justify-between mb-1.5">
									<span className="text-xs font-semibold text-gray-600">
										{cat}
									</span>
									<span className="text-[10px] text-gray-400 font-medium">
										{progress.byCategory[cat].completed}/
										{progress.byCategory[cat].total}
									</span>
								</div>
								<div className="w-full bg-gray-200/50 rounded-full h-1">
									<div
										className="bg-indigo-500 h-1 rounded-full text-[0px]"
										style={{
											width: `${progress.byCategory[cat].percent}%`,
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
			<div className="max-w-7xl mx-auto px-4 py-8">
				<KanbanBoard tasks={displayTasks} columns={columns} />
			</div>
		</div>
	);
}
