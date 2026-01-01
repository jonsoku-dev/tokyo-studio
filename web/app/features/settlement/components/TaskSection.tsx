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
import type {
	TaskWithCompletion,
	TimePhase,
} from "../services/settlement.server";

interface TaskSectionProps {
	phase: TimePhase;
	titleKo: string;
	titleEn: string;
	tasks: TaskWithCompletion[];
	phaseProgress: { total: number; completed: number };
	arrivalDate: string | null;
	onToggleTask: (taskId: string) => void;
}

const phaseIcons: Record<TimePhase, string> = {
	before_arrival: "✈️",
	first_week: "📅",
	first_month: "🏠",
	first_3_months: "🎌",
};

export function TaskSection({
	phase,
	titleKo,
	titleEn,
	tasks,
	phaseProgress,
	arrivalDate,
	onToggleTask,
}: TaskSectionProps) {
	const [isExpanded, setIsExpanded] = useState(true);

	const isPhaseComplete =
		phaseProgress.completed === phaseProgress.total && phaseProgress.total > 0;

	return (
		<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
			{/* Section Header */}
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
			>
				<div className="flex items-center gap-3">
					<span className="text-2xl">{phaseIcons[phase]}</span>
					<div className="text-left">
						<h2 className="heading-5">{titleKo}</h2>
						<p className="caption">{titleEn}</p>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<span
						className={`px-3 py-1 rounded-full text-sm font-medium ${
							isPhaseComplete
								? "bg-accent-100 text-accent-700"
								: "bg-gray-100 text-gray-600"
						}`}
					>
						{phaseProgress.completed}/{phaseProgress.total}
					</span>
					{isExpanded ? (
						<ChevronDown className="w-5 h-5 text-gray-400" />
					) : (
						<ChevronRight className="w-5 h-5 text-gray-400" />
					)}
				</div>
			</button>

			{/* Tasks List */}
			{isExpanded && (
				<div className="border-t border-gray-100">
					{tasks.map((task) => (
						<TaskCard
							key={task.id}
							task={task}
							arrivalDate={arrivalDate}
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
	onToggle: () => void;
}

function TaskCard({ task, arrivalDate, onToggle }: TaskCardProps) {
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

	const categoryColors: Record<string, string> = {
		government: "bg-primary-100 text-primary-700",
		housing: "bg-purple-100 text-purple-700",
		finance: "bg-accent-100 text-accent-700",
		utilities: "bg-yellow-100 text-yellow-700",
		other: "bg-gray-100 text-gray-700",
	};

	return (
		<div
			className={`border-b border-gray-50 last:border-0 ${
				task.isCompleted ? "bg-gray-50" : isUrgent ? "bg-red-50" : ""
			}`}
		>
			<div className="flex items-start gap-4 p-4">
				{/* Checkbox */}
				<button
					type="button"
					onClick={onToggle}
					className={`mt-1 w-6 h-6 rounded-full border-2 center flex-shrink-0 transition-all ${
						task.isCompleted
							? "bg-accent-500 border-accent-500 text-white"
							: "border-gray-300 hover:border-primary-500"
					}`}
				>
					{task.isCompleted && <Check className="w-4 h-4" />}
				</button>

				{/* Content */}
				<div className="flex-1 min-w-0">
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
							className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[task.category]}`}
						>
							{task.category}
						</span>
					</div>

					{/* Meta Info */}
					<div className="flex flex-wrap items-center gap-3 mt-2 caption">
						<span className="flex items-center gap-1">
							<Clock className="w-3 h-3" />
							{task.estimatedMinutes >= 60
								? `${Math.floor(task.estimatedMinutes / 60)}시간`
								: `${task.estimatedMinutes}분`}
						</span>
						{deadlineDate && (
							<span
								className={`flex items-center gap-1 ${isUrgent ? "text-red-600 font-medium" : ""}`}
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
						className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
					>
						{isDetailOpen ? "접기 ▲" : "상세보기 ▼"}
					</button>

					{/* Details Panel */}
					{isDetailOpen && (
						<div className="mt-3 p-4 bg-gray-50 rounded-lg stack text-sm">
							{/* Instructions */}
							<div>
								<h4 className="font-semibold text-gray-700 mb-1">
									📝 안내 / ガイド
								</h4>
								<p className="text-gray-600">{task.instructionsKo}</p>
								<p className="text-gray-500 mt-1">{task.instructionsJa}</p>
							</div>

							{/* Required Documents */}
							{task.requiredDocuments.length > 0 && (
								<div>
									<h4 className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
										<FileText className="w-4 h-4" /> 필요 서류
									</h4>
									<ul className="list-disc list-inside text-gray-600">
										{task.requiredDocuments.map((doc) => (
											<li key={doc}>{doc}</li>
										))}
									</ul>
								</div>
							)}

							{/* Tips */}
							{task.tips && (
								<div className="bg-yellow-50 p-3 rounded-lg">
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
										className="inline-flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg text-sm font-medium hover:bg-accent-700 transition-colors"
									>
										<Download className="w-4 h-4" />
										양식 다운로드
									</a>
								)}

								{/* Official URL */}
								{task.officialUrl && (
									<a
										href={task.officialUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
									>
										<ExternalLink className="w-4 h-4" />
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
