import { data, redirect } from "react-router";
import type { Route } from "./+types/index";
import { requireUserId } from "~/features/auth/utils/session.server";
import {
	getRoadmap,
	generateRoadmap,
	hasRoadmap,
	getUserProfile,
} from "../services/roadmap.server";

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

export default function RoadmapPage({ loaderData }: Route.ComponentProps) {
	const { tasks, progress, profile } = loaderData;

	const todoTasks = tasks.filter((t) => t.kanbanColumn === "todo");
	const inProgressTasks = tasks.filter((t) => t.kanbanColumn === "in_progress");
	const completedTasks = tasks.filter((t) => t.kanbanColumn === "completed");

	const categoryColors: Record<string, string> = {
		Learning: "bg-blue-100 text-blue-800",
		Application: "bg-green-100 text-green-800",
		Preparation: "bg-yellow-100 text-yellow-800",
		Settlement: "bg-purple-100 text-purple-800",
	};

	const priorityColors: Record<string, string> = {
		urgent: "border-l-red-500",
		normal: "border-l-gray-300",
		low: "border-l-gray-200",
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								나의 로드맵
							</h1>
							<p className="text-sm text-gray-500 mt-1">
								{profile.jobFamily} · {profile.level} · 일본어 {profile.jpLevel}
							</p>
						</div>
						<div className="flex items-center gap-4">
							{/* Progress */}
							<div className="text-right">
								<p className="text-sm text-gray-500">전체 진행률</p>
								<p className="text-2xl font-bold text-indigo-600">
									{progress.percent}%
								</p>
							</div>
							<div className="w-32 bg-gray-200 rounded-full h-3">
								<div
									className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
									style={{ width: `${progress.percent}%` }}
								/>
							</div>
						</div>
					</div>

					{/* Category Progress */}
					<div className="mt-4 grid grid-cols-4 gap-4">
						{(["Learning", "Application", "Preparation", "Settlement"] as const).map(
							(cat) => (
								<div key={cat} className="bg-gray-50 rounded-lg p-3">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium text-gray-700">
											{cat}
										</span>
										<span className="text-sm text-gray-500">
											{progress.byCategory[cat].completed}/
											{progress.byCategory[cat].total}
										</span>
									</div>
									<div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
										<div
											className="bg-indigo-500 h-1.5 rounded-full"
											style={{
												width: `${progress.byCategory[cat].percent}%`,
											}}
										/>
									</div>
								</div>
							),
						)}
					</div>
				</div>
			</div>

			{/* Kanban Board */}
			<div className="max-w-7xl mx-auto px-4 py-6">
				<div className="grid grid-cols-3 gap-6">
					{/* To Do Column */}
					<Column
						title="To Do"
						count={todoTasks.length}
						tasks={todoTasks}
						categoryColors={categoryColors}
						priorityColors={priorityColors}
					/>

					{/* In Progress Column */}
					<Column
						title="In Progress"
						count={inProgressTasks.length}
						tasks={inProgressTasks}
						categoryColors={categoryColors}
						priorityColors={priorityColors}
					/>

					{/* Completed Column */}
					<Column
						title="Completed"
						count={completedTasks.length}
						tasks={completedTasks}
						categoryColors={categoryColors}
						priorityColors={priorityColors}
						isCompleted
					/>
				</div>
			</div>
		</div>
	);
}

interface ColumnProps {
	title: string;
	count: number;
	tasks: Array<{
		id: string;
		title: string;
		description: string;
		category: string;
		estimatedMinutes: number;
		priority: string;
		isCustom: boolean;
	}>;
	categoryColors: Record<string, string>;
	priorityColors: Record<string, string>;
	isCompleted?: boolean;
}

function Column({
	title,
	count,
	tasks,
	categoryColors,
	priorityColors,
	isCompleted,
}: ColumnProps) {
	return (
		<div className="bg-gray-100 rounded-lg p-4">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold text-gray-800">{title}</h2>
				<span className="bg-gray-200 text-gray-600 text-sm px-2 py-0.5 rounded-full">
					{count}
				</span>
			</div>

			<div className="space-y-3">
				{tasks.map((task) => (
					<TaskCard
						key={task.id}
						task={task}
						categoryColors={categoryColors}
						priorityColors={priorityColors}
						isCompleted={isCompleted}
					/>
				))}

				{tasks.length === 0 && (
					<div className="text-center py-8 text-gray-400 text-sm">
						{isCompleted ? "완료된 작업이 없습니다" : "작업을 여기로 드래그하세요"}
					</div>
				)}
			</div>
		</div>
	);
}

interface TaskCardProps {
	task: {
		id: string;
		title: string;
		description: string;
		category: string;
		estimatedMinutes: number;
		priority: string;
		isCustom: boolean;
	};
	categoryColors: Record<string, string>;
	priorityColors: Record<string, string>;
	isCompleted?: boolean;
}

function TaskCard({
	task,
	categoryColors,
	priorityColors,
	isCompleted,
}: TaskCardProps) {
	const handleMoveToInProgress = async () => {
		await fetch(`/api/roadmap/tasks/${task.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ kanbanColumn: "in_progress" }),
		});
		window.location.reload();
	};

	const handleMoveToCompleted = async () => {
		await fetch(`/api/roadmap/tasks/${task.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ kanbanColumn: "completed" }),
		});
		window.location.reload();
	};

	const handleMoveToTodo = async () => {
		await fetch(`/api/roadmap/tasks/${task.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ kanbanColumn: "todo" }),
		});
		window.location.reload();
	};

	return (
		<div
			className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${priorityColors[task.priority] ?? priorityColors.normal} ${isCompleted ? "opacity-60" : ""}`}
		>
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-2">
						<span
							className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[task.category] ?? "bg-gray-100 text-gray-800"}`}
						>
							{task.category}
						</span>
						{task.isCustom && (
							<span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
								Custom
							</span>
						)}
					</div>
					<h3
						className={`font-medium text-gray-800 ${isCompleted ? "line-through" : ""}`}
					>
						{task.title}
					</h3>
					<p className="text-sm text-gray-500 mt-1 line-clamp-2">
						{task.description}
					</p>
					<p className="text-xs text-gray-400 mt-2">
						⏱ {task.estimatedMinutes}분
					</p>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="mt-3 flex gap-2">
				{!isCompleted && (
					<>
						<button
							type="button"
							onClick={handleMoveToInProgress}
							className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200 transition"
						>
							진행중으로
						</button>
						<button
							type="button"
							onClick={handleMoveToCompleted}
							className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition"
						>
							✓ 완료
						</button>
					</>
				)}
				{isCompleted && (
					<button
						type="button"
						onClick={handleMoveToTodo}
						className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition"
					>
						다시 시작
					</button>
				)}
			</div>
		</div>
	);
}
