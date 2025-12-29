import { useState } from "react";
import { data, useFetcher, useLoaderData } from "react-router";
import { Shell } from "~/shared/components/layout/Shell";
import { requireUserId } from "../../auth/utils/session.server";
import { CountdownBanner } from "../components/CountdownBanner";
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
	const { tasks, arrivalDate, progress } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	const [localArrivalDate, setLocalArrivalDate] = useState(
		arrivalDate ? new Date(arrivalDate).toISOString().split("T")[0] : "",
	);

	const phases: { key: TimePhase; titleKo: string; titleEn: string }[] = [
		{ key: "before_arrival", titleKo: "출국 전", titleEn: "Before Arrival" },
		{ key: "first_week", titleKo: "첫째 주", titleEn: "First Week" },
		{ key: "first_month", titleKo: "첫 달", titleEn: "First Month" },
		{ key: "first_3_months", titleKo: "3개월 내", titleEn: "First 3 Months" },
	];

	const groupedTasks = phases.reduce(
		(acc, phase) => {
			acc[phase.key] = tasks.filter(
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

	return (
		<Shell>
			<div className="max-w-4xl mx-auto space-y-8">
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
					completed={progress.completed}
					total={progress.total}
					percentage={progress.percentage}
				/>

				{/* Task Sections */}
				<div className="space-y-6">
					{phases.map((phase) => (
						<TaskSection
							key={phase.key}
							phase={phase.key}
							titleKo={phase.titleKo}
							titleEn={phase.titleEn}
							tasks={groupedTasks[phase.key]}
							phaseProgress={progress.byPhase[phase.key]}
							arrivalDate={arrivalDate}
							onToggleTask={handleToggleTask}
						/>
					))}
				</div>
			</div>
		</Shell>
	);
}
