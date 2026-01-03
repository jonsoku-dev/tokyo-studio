import { useCallback, useMemo, useState } from "react";
import { data, Link, useFetcher, useLoaderData } from "react-router";
import { PageHeader } from "~/shared/components/layout/PageHeader";
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
} from "../services/settlement.server";

export function meta() {
	return [{ title: "Settlement Checklist - Japan IT Job" }];
}

export async function loader({ request }: { request: Request }) {
	const userId = await requireUserId(request);

	const [tasks, settlement, progress, subscriptions, phases, categories] =
		await Promise.all([
			settlementService.getTasksWithCompletion(userId),
			settlementService.getUserSettlement(userId),
			settlementService.getProgress(userId),
			settlementService.getSubscriptions(userId),
			settlementService.getPhases(),
			settlementService.getCategories(),
		]);

	return data({
		tasks,
		arrivalDate: settlement?.arrivalDate?.toISOString() ?? null,
		progress,
		subscriptions,
		phases,
		categories,
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
	const { tasks, arrivalDate, subscriptions, phases, categories } =
		useLoaderData<typeof loader>();
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

		// Dynamic Phases Grouping for Progress
		const byPhase = phases.reduce(
			(acc, phase) => {
				// Logic to match task to phase (same as groupTasksByPhase or simplified)
				// Filter tasks that fall into this phase's day range
				const phaseTasks = optimisticTasks.filter((t: TaskWithCompletion) => {
					const days = t.dayOffset ?? 0;
					return days >= phase.minDays && days <= phase.maxDays;
				});

				acc[phase.id] = {
					total: phaseTasks.length,
					completed: phaseTasks.filter((t: TaskWithCompletion) => t.isCompleted)
						.length,
				};
				return acc;
			},
			{} as Record<string, { total: number; completed: number }>,
		);
		return {
			total,
			completed,
			percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
			byPhase,
		};
	}, [optimisticTasks, phases]);

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

	const groupedTasks = phases.reduce(
		(acc, phase) => {
			const phaseTasks = filteredTasks.filter((t: TaskWithCompletion) => {
				const days = t.dayOffset ?? 0;
				return days >= phase.minDays && days <= phase.maxDays;
			});
			acc[phase.id] = phaseTasks;
			return acc;
		},
		{} as Record<string, TaskWithCompletion[]>,
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
		<div className="stack-md">
			{/* Header */}
			<PageHeader
				title="🗼 도쿄 정착 체크리스트"
				description="일본 생활에 꼭 필요한 절차들을 단계별로 정리했습니다."
				actions={
					<div className="flex items-center gap-4">
						<div className="flex gap-2 text-gray-500 text-sm">
							<span className="font-medium text-primary-600">
								{computedProgress.completed}/{computedProgress.total}
							</span>
							완료 ({computedProgress.percentage}%)
						</div>
						<Link
							to="/settlement/marketplace"
							className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 font-bold text-sm text-white hover:bg-gray-800"
						>
							+ 마켓플레이스
						</Link>
					</div>
				}
			/>

			{/* Active Modules Badge List */}
			{subscriptions && subscriptions.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{subscriptions.map((sub) => (
						<div
							key={sub.id}
							className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pr-2 pl-3 text-gray-700 text-sm"
						>
							<span className="h-2 w-2 rounded-full bg-green-500" />
							<span>{sub.template.title}</span>
							{sub.template.isOfficial && (
								<span className="rounded bg-primary-50 px-1.5 py-0.5 text-primary-700 text-xs">
									Official
								</span>
							)}
						</div>
					))}
				</div>
			)}

			{/* Arrival Date Input */}
			<div className="rounded-2xl border border-gray-100 bg-white p-responsive shadow-sm">
				<label
					htmlFor="arrivalDate"
					className="body-sm mb-2 block text-gray-700"
				>
					📅 도착 예정일 / 到着予定日
				</label>
				<div className="flex gap-3">
					<input
						id="arrivalDate"
						type="date"
						value={localArrivalDate}
						onChange={(e) => setLocalArrivalDate(e.target.value)}
						className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-primary-500"
					/>
					<button
						type="button"
						onClick={handleSetArrivalDate}
						disabled={!localArrivalDate || fetcher.state !== "idle"}
						className="rounded-xl bg-primary-600 px-6 py-3 font-bold text-white transition-all hover:bg-primary-700 disabled:opacity-50"
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
				categories={categories}
				onCategoryChange={setCategoryFilter}
				onStatusChange={setStatusFilter}
				onUrgencyChange={setUrgencyFilter}
				onReset={handleResetFilters}
			/>

			{/* Filter Results Info */}
			{hasFiltersApplied && (
				<p className="caption">
					{filteredTasks.length}개의 태스크가 필터에 맞습니다
				</p>
			)}

			{/* Task Sections */}
			<div className="stack-md">
				{phases.map((phase) => {
					const phaseTasks = groupedTasks[phase.id];
					if (hasFiltersApplied && (!phaseTasks || phaseTasks.length === 0))
						return null;
					return (
						<TaskSection
							key={phase.id}
							titleKo={phase.titleKo || phase.title} // Use DB title
							titleEn={phase.titleEn || ""} // Use description as sub-title? Or add titleEn?
							// For now use description or empty
							tasks={phaseTasks || []}
							phaseProgress={computedProgress.byPhase[phase.id]}
							arrivalDate={arrivalDate}
							categories={categories}
							onToggleTask={handleToggleTask}
						/>
					);
				})}
			</div>
		</div>
	);
}
