import type { WidgetLayout } from "@itcom/db/schema";
import { Building2, CheckCircle2, Circle, Clock, Video } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface InterviewPrepWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

/**
 * Interview Prep Widget (Phase 3A)
 * 다가오는 면접과 준비 현황
 */
export default function InterviewPrepWidget({
	size: _size,
	widgetData,
}: InterviewPrepWidgetProps) {
	const { upcomingInterviews, prepItems } = widgetData.interviewPrep;

	const nextInterview = upcomingInterviews[0];

	// D-Day 표시
	const getDDayText = (daysUntil: number) => {
		if (daysUntil <= 0) return "D-Day";
		if (daysUntil === 1) return "D-1";
		if (daysUntil <= 7) return `D-${daysUntil}`;
		return `${daysUntil}일 후`;
	};

	const getDDayColor = (daysUntil: number) => {
		if (daysUntil <= 1) return "bg-red-500 text-white";
		if (daysUntil <= 3) return "bg-orange-500 text-white";
		if (daysUntil <= 7) return "bg-yellow-500 text-white";
		return "bg-gray-100 text-gray-700";
	};

	if (upcomingInterviews.length === 0) {
		return (
			<div className="space-y-4 text-center">
				<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
					<Video className="h-8 w-8 text-gray-400" />
				</div>
				<div>
					<p className="text-gray-500 text-sm">예정된 면접이 없습니다</p>
					<Link
						to="/applications"
						className="mt-2 inline-block font-medium text-primary-600 text-sm hover:text-primary-700"
					>
						지원 현황 보기 →
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* 다음 면접 카드 */}
			{nextInterview && (
				<div className="rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 p-responsive">
					<div className="mb-3 flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
								<Building2 className="h-5 w-5 text-primary-600" />
							</div>
							<div>
								<p className="font-semibold text-gray-900">
									{nextInterview.company}
								</p>
								<p className="text-gray-600 text-sm">
									{nextInterview.position}
								</p>
							</div>
						</div>
						<span
							className={`rounded-full px-3 py-1 font-bold text-sm ${getDDayColor(nextInterview.daysUntil)}`}
						>
							{getDDayText(nextInterview.daysUntil)}
						</span>
					</div>

					{nextInterview.date && (
						<div className="flex items-center gap-2 text-gray-500 text-sm">
							<Clock className="h-4 w-4" />
							<span>{nextInterview.date}</span>
						</div>
					)}
				</div>
			)}

			{/* 준비 체크리스트 (Standard/Expanded) */}
			{_size !== "compact" && prepItems.length > 0 && (
				<div className="space-y-2">
					<p className="font-medium text-gray-700 text-sm">
						면접 준비 체크리스트
					</p>
					{prepItems.map((item) => (
						<button
							key={item.id}
							type="button"
							className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
						>
							{item.completed ? (
								<CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
							) : (
								<Circle className="h-5 w-5 flex-shrink-0 text-gray-300" />
							)}
							<span
								className={`text-sm ${
									item.completed
										? "text-gray-400 line-through"
										: "text-gray-700"
								}`}
							>
								{item.title}
							</span>
						</button>
					))}
				</div>
			)}

			{/* 다른 면접 일정 (Expanded) */}
			{_size === "expanded" && upcomingInterviews.length > 1 && (
				<div className="border-gray-100 border-t pt-3">
					<p className="mb-2 text-gray-500 text-xs">다가오는 면접</p>
					{upcomingInterviews.slice(1, 3).map((interview) => (
						<Link
							key={interview.id}
							to={`/pipeline/${interview.id}`}
							className="mb-2 flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50"
						>
							<span className="text-gray-700 text-sm">{interview.company}</span>
							<span className="text-gray-400 text-xs">
								{getDDayText(interview.daysUntil)}
							</span>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
