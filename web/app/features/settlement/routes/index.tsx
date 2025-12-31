import { useCallback, useMemo, useState } from "react";
import { data, useFetcher, useLoaderData } from "react-router";
import { Shell } from "~/shared/components/layout/Shell";
import { requireUserId } from "../../auth/utils/session.server";
import { CountdownBanner } from "../components/CountdownBanner";
import {
	FilterBar,
	type FilterCategory,
	type FilterStatus,
	type FilterUrgency,
} from "../components/FilterBar";
import { ProgressBar } from "../components/ProgressBar";
import { TaskSection } from "../components/TaskSection";
import {
	settlementService,
	type TaskWithCompletion,
	type TimePhase,
} from "../services/settlement.server";

export function meta() {
	return [{ title: "Settlement Checklist - Japan IT Job" }];
}

export async function loader({ request }: { request: Request }) {
	const userId = await requireUserId(request);

	const [tasks, settlement, progress] = await Promise.all([
		settlementService.getTasksWithCompletion(userId),
		settlementService.getUserSettlement(userId),
		settlementService.getProgress(userId),
	]);

	return data({
		tasks,
		arrivalDate: settlement?.arrivalDate?.toISOString() ?? null,
		progress,
	});
}

export async function action({ request }: { request: Request }) {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const intent = String(formData.get("intent"));

	if (intent === "set-arrival-date") {
		const dateStr = String(formData.get("arrivalDate"));
		const arrivalDate = new Date(dateStr);
		await settlementService.setArrivalDate(userId, arrivalDate);
		return data({ success: true });
	}

	if (intent === "toggle-task") {
		const taskId = String(formData.get("taskId"));
		await settlementService.toggleTask(userId, taskId);
		return data({ success: true });
	}

	return data({ error: "Unknown intent" }, { status: 400 });
}

export default function SettlementPage() {
	const { tasks, arrivalDate } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	// Filter states
	const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("all");
	const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
	const [urgencyFilter, setUrgencyFilter] = useState<FilterUrgency>("all");

	const [localArrivalDate, setLocalArrivalDate] = useState(
		arrivalDate ? new Date(arrivalDate).toISOString().split("T")[0] : "",
	);

	// Calculate urgency for tasks
	const getIsUrgent = useCallback(
		(task: TaskWithCompletion): boolean => {
			if (!arrivalDate || task.deadlineDays === null) return false;
			const deadline = new Date(arrivalDate);
			deadline.setDate(deadline.getDate() + task.deadlineDays);
			const today = new Date();
			const daysUntil = Math.ceil(
				(deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
			);
			return daysUntil <= 14 && daysUntil > 0;
		},
		[arrivalDate],
	);

	// Optimistic update for task toggle (unidirectional data flow)
	const optimisticTasks = useMemo(() => {
		const formData = fetcher.formData;
		if (formData?.get("intent") === "toggle-task") {
			const taskId = formData.get("taskId") as string;
			return tasks.map((t: TaskWithCompletion) =>
				t.id === taskId
					? {
							...t,
							isCompleted: !t.isCompleted,
							completedAt: t.isCompleted ? null : new Date(),
						}
					: t,
			);
		}
		return tasks;
	}, [tasks, fetcher.formData]);

	// Compute progress client-side for instant updates
	const computedProgress = useMemo(() => {
		const total = optimisticTasks.length;
		const completed = optimisticTasks.filter(
			(t: TaskWithCompletion) => t.isCompleted,
		).length;
		const phases: TimePhase[] = [
			"before_arrival",
			"first_week",
			"first_month",
			"first_3_months",
		];
		const byPhase = phases.reduce(
			(acc, phase) => {
				const phaseTasks = optimisticTasks.filter(
					(t: TaskWithCompletion) => t.timePhase === phase,
				);
				acc[phase] = {
					total: phaseTasks.length,
					completed: phaseTasks.filter((t: TaskWithCompletion) => t.isCompleted)
						.length,
				};
				return acc;
			},
			{} as Record<TimePhase, { total: number; completed: number }>,
		);
		return {
			total,
			completed,
			percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
			byPhase,
		};
	}, [optimisticTasks]);

	// Apply filters (use optimistic tasks)
	const filteredTasks = useMemo(() => {
		return optimisticTasks.filter((task: TaskWithCompletion) => {
			// Category filter
			if (categoryFilter !== "all" && task.category !== categoryFilter) {
				return false;
			}
			// Status filter
			if (statusFilter === "pending" && task.isCompleted) return false;
			if (statusFilter === "completed" && !task.isCompleted) return false;
			// Urgency filter
			if (urgencyFilter === "urgent" && !getIsUrgent(task)) return false;
			return true;
		});
	}, [
		optimisticTasks,
		categoryFilter,
		statusFilter,
		urgencyFilter,
		getIsUrgent,
	]);

	const phases: { key: TimePhase; titleKo: string; titleEn: string }[] = [
		{ key: "before_arrival", titleKo: "출국 전", titleEn: "Before Arrival" },
		{ key: "first_week", titleKo: "첫째 주", titleEn: "First Week" },
		{ key: "first_month", titleKo: "첫 달", titleEn: "First Month" },
		{ key: "first_3_months", titleKo: "3개월 내", titleEn: "First 3 Months" },
	];

	const groupedTasks = phases.reduce(
		(acc, phase) => {
			acc[phase.key] = filteredTasks.filter(
				(t: TaskWithCompletion) => t.timePhase === phase.key,
			);
			return acc;
		},
		{} as Record<TimePhase, TaskWithCompletion[]>,
	);

	const handleSetArrivalDate = () => {
		if (!localArrivalDate) return;
		fetcher.submit(
			{ intent: "set-arrival-date", arrivalDate: localArrivalDate },
			{ method: "POST" },
		);
	};

	const handleToggleTask = (taskId: string) => {
		fetcher.submit({ intent: "toggle-task", taskId }, { method: "POST" });
	};

	const handleResetFilters = () => {
		setCategoryFilter("all");
		setStatusFilter("all");
		setUrgencyFilter("all");
	};

	const hasFiltersApplied =
		categoryFilter !== "all" ||
		statusFilter !== "all" ||
		urgencyFilter !== "all";

	return (
		<Shell>
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Header */}
				<div className="space-y-2">
					<h1 className="text-3xl font-bold text-gray-900">
						🗼 도쿄 정착 체크리스트
					</h1>
					<p className="text-gray-500">
						東京定住チェックリスト - Tokyo Settlement Checklist
					</p>
				</div>

				{/* Arrival Date Input */}
				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
					<label
						htmlFor="arrivalDate"
						className="block text-sm font-bold text-gray-700 mb-2"
					>
						📅 도착 예정일 / 到着予定日
					</label>
					<div className="flex gap-3">
						<input
							id="arrivalDate"
							type="date"
							value={localArrivalDate}
							onChange={(e) => setLocalArrivalDate(e.target.value)}
							className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-lg"
						/>
						<button
							type="button"
							onClick={handleSetArrivalDate}
							disabled={!localArrivalDate || fetcher.state !== "idle"}
							className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 transition-all"
						>
							{arrivalDate ? "변경" : "설정"}
						</button>
					</div>
				</div>

				{/* Countdown Banner */}
				{arrivalDate && <CountdownBanner arrivalDate={arrivalDate} />}

				{/* Progress Bar */}
				<ProgressBar
					completed={computedProgress.completed}
					total={computedProgress.total}
					percentage={computedProgress.percentage}
				/>

				{/* Filter Bar */}
				<FilterBar
					category={categoryFilter}
					status={statusFilter}
					urgency={urgencyFilter}
					onCategoryChange={setCategoryFilter}
					onStatusChange={setStatusFilter}
					onUrgencyChange={setUrgencyFilter}
					onReset={handleResetFilters}
				/>

				{/* Filter Results Info */}
				{hasFiltersApplied && (
					<p className="text-sm text-gray-500">
						{filteredTasks.length}개의 태스크가 필터에 맞습니다
					</p>
				)}

				{/* Task Sections */}
				<div className="space-y-6">
					{phases.map((phase) => {
						const phaseTasks = groupedTasks[phase.key];
						if (hasFiltersApplied && phaseTasks.length === 0) return null;
						return (
							<TaskSection
								key={phase.key}
								phase={phase.key}
								titleKo={phase.titleKo}
								titleEn={phase.titleEn}
								tasks={phaseTasks}
								phaseProgress={computedProgress.byPhase[phase.key]}
								arrivalDate={arrivalDate}
								onToggleTask={handleToggleTask}
							/>
						);
					})}
				</div>
			</div>
		</Shell>
	);
}
