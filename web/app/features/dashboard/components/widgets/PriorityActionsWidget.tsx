import type { WidgetLayout } from "@itcom/db/schema";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface PriorityActionsWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

// 우선순위 배지 색상
const priorityStyles = {
	critical: {
		bg: "bg-red-100",
		text: "text-red-700",
		border: "border-red-200",
		label: "긴급",
	},
	high: {
		bg: "bg-orange-100",
		text: "text-orange-700",
		border: "border-orange-200",
		label: "높음",
	},
	medium: {
		bg: "bg-yellow-100",
		text: "text-yellow-700",
		border: "border-yellow-200",
		label: "보통",
	},
} as const;

/**
 * Priority Actions Widget (P1)
 * 오늘 완료해야 할 가장 중요한 작업
 */
export default function PriorityActionsWidget({
	size: _size,
	widgetData,
}: PriorityActionsWidgetProps) {
	const { pendingTasks, upcomingInterviews } = widgetData.priority;

	// 통합된 액션 리스트 생성
	const actions = [
		...pendingTasks.map((task) => ({
			id: task.id,
			title: task.title,
			dueDate: "오늘",
			priority: "high" as const,
			type: "task" as const,
		})),
		...upcomingInterviews.map((interview) => ({
			id: interview.id,
			title: `${interview.company} ${interview.position} 면접`,
			dueDate: interview.nextAction || "예정됨",
			priority: "critical" as const,
			type: "interview" as const,
		})),
	];

	const maxItems = _size === "compact" ? 2 : 3;
	const displayActions = actions.slice(0, maxItems);

	return (
		<div className="space-y-3">
			{/* 액션 리스트 */}
			{displayActions.map((action) => {
				const style = priorityStyles[action.priority];

				return (
					<Link
						key={action.id}
						to={getActionLink(action.type, action.id)}
						className="group block rounded-lg border border-gray-200 p-3 transition-all hover:border-primary-300 hover:bg-primary-50/30"
					>
						<div className="flex items-start gap-3">
							{/* 체크박스 */}
							<button
								type="button"
								className="mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 border-gray-300 transition-colors hover:border-primary-500"
								onClick={(e) => {
									e.preventDefault();
									// TODO: 작업 완료 처리
								}}
							>
								<CheckCircle2 className="h-4 w-4 text-primary-500 opacity-0 transition-opacity group-hover:opacity-100" />
							</button>

							{/* 내용 */}
							<div className="min-w-0 flex-1">
								<p className="mb-1 font-medium text-gray-900 transition-colors group-hover:text-primary-700">
									{action.title}
								</p>

								{/* 메타 정보 */}
								<div className="flex flex-wrap items-center gap-2">
									{/* 마감일 */}
									<span className="inline-flex items-center gap-1 text-gray-500 text-xs">
										<Clock className="h-3 w-3" />
										{action.dueDate}
									</span>

									{/* 우선순위 배지 */}
									<span
										className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium text-xs ${style.bg} ${style.text} ${style.border}`}
									>
										<AlertCircle className="h-3 w-3" />
										{style.label}
									</span>
								</div>
							</div>
						</div>
					</Link>
				);
			})}

			{/* 더 보기 (Standard/Expanded에서만) */}
			{_size !== "compact" && actions.length > maxItems && (
				<Link
					to="/roadmap"
					className="block py-2 text-center font-medium text-primary-600 text-sm hover:text-primary-700"
				>
					+ {actions.length - maxItems}개 더 보기
				</Link>
			)}

			{/* 빈 상태 */}
			{actions.length === 0 && (
				<div className="py-responsive text-center text-gray-400">
					<CheckCircle2 className="mx-auto mb-2 h-8 w-8" />
					<p className="text-sm">모든 작업을 완료했습니다! 🎉</p>
				</div>
			)}
		</div>
	);
}

/**
 * 액션 타입에 따른 링크 생성
 */
function getActionLink(type: string, id: string): string {
	switch (type) {
		case "resume":
			return `/documents/${id}`;
		case "interview":
			return `/applications/${id}`;
		case "task":
			return "/roadmap";
		default:
			return "/";
	}
}
