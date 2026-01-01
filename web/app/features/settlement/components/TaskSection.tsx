import type { SettlementCategory } from "@itcom/db/schema";
import {
	Check,
	ChevronDown,
	ChevronRight,
	Clock,
	Download,
	ExternalLink,
	FileText,
} from "lucide-react";
import { useState } from "react";
import type { TaskWithCompletion } from "../services/settlement.server";

interface TaskSectionProps {
	titleKo: string;
	titleEn: string;
	tasks: TaskWithCompletion[];
	phaseProgress: { total: number; completed: number };
	arrivalDate: string | null;
	categories: SettlementCategory[];
	onToggleTask: (taskId: string) => void;
}

const getPhaseIcon = (title: string) => {
	if (title.includes("출국") || title.includes("Pre")) return "✈️";
	if (title.includes("1주") || title.includes("Week")) return "📅";
	if (title.includes("1개월") || title.includes("Month")) return "🏠";
	if (title.includes("3개월") || title.includes("Long")) return "🎌";
	return "📌";
};

export function TaskSection({
	titleKo,
	titleEn,
	tasks,
	phaseProgress,
	arrivalDate,
	categories,
	onToggleTask,
}: TaskSectionProps) {
	const [isExpanded, setIsExpanded] = useState(true);

	const isPhaseComplete =
		phaseProgress.completed === phaseProgress.total && phaseProgress.total > 0;

	const icon = getPhaseIcon(titleKo);

	return (
		<div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
			{/* Section Header */}
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex w-full items-center justify-between p-5 transition-colors hover:bg-gray-50"
			>
				<div className="flex items-center gap-3">
					<span className="text-2xl">{icon}</span>
					<div className="text-left">
						<h2 className="heading-5">{titleKo}</h2>
						<p className="caption">{titleEn}</p>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<span
						className={`rounded-full px-3 py-1 font-medium text-sm ${
							isPhaseComplete
								? "bg-accent-100 text-accent-700"
								: "bg-gray-100 text-gray-600"
						}`}
					>
						{phaseProgress.completed}/{phaseProgress.total}
					</span>
					{isExpanded ? (
						<ChevronDown className="h-5 w-5 text-gray-400" />
					) : (
						<ChevronRight className="h-5 w-5 text-gray-400" />
					)}
				</div>
			</button>

			{/* Tasks List */}
			{isExpanded && (
				<div className="border-gray-100 border-t">
					{tasks.map((task) => (
						<TaskCard
							key={task.id}
							task={task}
							arrivalDate={arrivalDate}
							categories={categories}
							onToggle={() => onToggleTask(task.id)}
						/>
					))}
				</div>
			)}
		</div>
	);
}

interface TaskCardProps {
	task: TaskWithCompletion;
	arrivalDate: string | null;
	categories: SettlementCategory[];
	onToggle: () => void;
}

function TaskCard({ task, arrivalDate, categories, onToggle }: TaskCardProps) {
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	// Calculate deadline date
	let deadlineDate: Date | null = null;
	let isUrgent = false;
	if (arrivalDate && task.deadlineDays !== null) {
		deadlineDate = new Date(arrivalDate);
		deadlineDate.setDate(deadlineDate.getDate() + task.deadlineDays);
		const today = new Date();
		const daysUntilDeadline = Math.ceil(
			(deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
		);
		isUrgent = daysUntilDeadline <= 14 && daysUntilDeadline > 0;
	}

	// Dynamic Category Lookup
	const categoryObj = categories.find((c) => c.slug === task.category);

	// Fallback color logic (can be improved later with DB color field)
	const getCategoryColor = (slug: string) => {
		switch (slug) {
			case "government":
				return "bg-primary-100 text-primary-700";
			case "housing":
				return "bg-purple-100 text-purple-700";
			case "finance":
				return "bg-accent-100 text-accent-700";
			case "telecom":
				return "bg-yellow-100 text-yellow-700";
			case "health":
				return "bg-red-100 text-red-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	return (
		<div
			className={`border-gray-50 border-b last:border-0 ${
				task.isCompleted ? "bg-gray-50" : isUrgent ? "bg-red-50" : ""
			}`}
		>
			<div className="flex items-start gap-4 p-4">
				{/* Checkbox */}
				<button
					type="button"
					onClick={onToggle}
					className={`center mt-1 h-6 w-6 flex-shrink-0 rounded-full border-2 transition-all ${
						task.isCompleted
							? "border-accent-500 bg-accent-500 text-white"
							: "border-gray-300 hover:border-primary-500"
					}`}
				>
					{task.isCompleted && <Check className="h-4 w-4" />}
				</button>

				{/* Content */}
				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-2">
						<div>
							<h3
								className={`font-semibold ${
									task.isCompleted
										? "text-gray-400 line-through"
										: "text-gray-900"
								}`}
							>
								{task.titleKo}
							</h3>
							<p className="caption">{task.titleJa}</p>
						</div>

						<span
							className={`flex items-center gap-1 rounded px-2 py-0.5 font-medium text-xs ${getCategoryColor(task.category)}`}
						>
							{categoryObj ? (
								<>
									<span>{categoryObj.icon}</span>
									<span>{categoryObj.titleKo}</span>
								</>
							) : (
								task.category
							)}
						</span>
					</div>

					{/* Source Indicator */}
					{task.templateTitle && (
						<div className="mt-1 flex items-center gap-1 text-gray-400 text-xs">
							<span>📦 {task.templateTitle}</span>
						</div>
					)}

					{/* Meta Info */}
					<div className="caption mt-2 flex flex-wrap items-center gap-3">
						<span className="flex items-center gap-1">
							<Clock className="h-3 w-3" />
							{task.estimatedMinutes >= 60
								? `${Math.floor(task.estimatedMinutes / 60)}시간`
								: `${task.estimatedMinutes}분`}
						</span>
						{deadlineDate && (
							<span
								className={`flex items-center gap-1 ${isUrgent ? "font-medium text-red-600" : ""}`}
							>
								📅{" "}
								{deadlineDate.toLocaleDateString("ko-KR", {
									month: "short",
									day: "numeric",
								})}
								까지
							</span>
						)}
					</div>

					{/* Toggle Details */}
					<button
						type="button"
						onClick={() => setIsDetailOpen(!isDetailOpen)}
						className="mt-2 font-medium text-primary-600 text-xs hover:text-primary-700"
					>
						{isDetailOpen ? "접기 ▲" : "상세보기 ▼"}
					</button>

					{/* Details Panel */}
					{isDetailOpen && (
						<div className="stack mt-3 rounded-lg bg-gray-50 p-4 text-sm">
							{/* Instructions */}
							<div>
								<h4 className="mb-1 font-semibold text-gray-700">
									📝 안내 / ガイド
								</h4>
								<p className="text-gray-600">{task.instructionsKo}</p>
								<p className="mt-1 text-gray-500">{task.instructionsJa}</p>
							</div>

							{/* Required Documents */}
							{task.requiredDocuments.length > 0 && (
								<div>
									<h4 className="mb-1 flex items-center gap-1 font-semibold text-gray-700">
										<FileText className="h-4 w-4" /> 필요 서류
									</h4>
									<ul className="list-inside list-disc text-gray-600">
										{task.requiredDocuments.map((doc) => (
											<li key={doc}>{doc}</li>
										))}
									</ul>
								</div>
							)}

							{/* Tips */}
							{task.tips && (
								<div className="rounded-lg bg-yellow-50 p-3">
									<p className="text-yellow-800">💡 {task.tips}</p>
								</div>
							)}

							{/* Action Buttons */}
							<div className="flex flex-wrap gap-3 pt-2">
								{/* Form Template Download (P2) */}
								{task.formTemplateUrl && (
									<a
										href={task.formTemplateUrl}
										target="_blank"
										rel="noopener noreferrer"
										download
										className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-accent-700"
									>
										<Download className="h-4 w-4" />
										양식 다운로드
									</a>
								)}

								{/* Official URL */}
								{task.officialUrl && (
									<a
										href={task.officialUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
									>
										<ExternalLink className="h-4 w-4" />
										공식 사이트
									</a>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
