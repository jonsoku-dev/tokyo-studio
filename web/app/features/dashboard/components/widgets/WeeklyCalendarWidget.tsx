import type { WidgetLayout } from "@itcom/db/schema";
import { Calendar, Clock, User, Video } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface WeeklyCalendarWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

// 이벤트 타입별 스타일
const eventStyles = {
	mentoring: {
		bg: "bg-blue-100",
		text: "text-blue-700",
		border: "border-blue-200",
		icon: User,
	},
	interview: {
		bg: "bg-purple-100",
		text: "text-purple-700",
		border: "border-purple-200",
		icon: Video,
	},
	deadline: {
		bg: "bg-red-100",
		text: "text-red-700",
		border: "border-red-200",
		icon: Clock,
	},
} as const;

/**
 * Weekly Calendar Widget (Phase 3A)
 * 이번 주 일정 통합 보기
 */
export default function WeeklyCalendarWidget({
	size: _size,
	widgetData,
}: WeeklyCalendarWidgetProps) {
	const { events, weekStart, weekEnd } = widgetData.weeklyCalendar;

	const formatDateRange = () => {
		const start = new Date(weekStart);
		const end = new Date(weekEnd);
		const startMonth = start.getMonth() + 1;
		const startDay = start.getDate();
		const endMonth = end.getMonth() + 1;
		const endDay = end.getDate();

		if (startMonth === endMonth) {
			return `${startMonth}월 ${startDay}일 - ${endDay}일`;
		}
		return `${startMonth}/${startDay} - ${endMonth}/${endDay}`;
	};

	const formatEventDate = (dateStr: string) => {
		const date = new Date(dateStr);
		const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
		const day = date.getDate();
		const dayOfWeek = dayNames[date.getDay()];
		return `${day}일 (${dayOfWeek})`;
	};

	const maxEvents = _size === "compact" ? 2 : _size === "standard" ? 4 : 6;
	const displayEvents = events.slice(0, maxEvents);

	return (
		<div className="space-y-4">
			{/* 헤더 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Calendar className="h-5 w-5 text-primary-600" />
					<span className="font-semibold text-gray-900">이번 주</span>
				</div>
				<span className="text-gray-500 text-sm">{formatDateRange()}</span>
			</div>

			{/* 일정 목록 */}
			{displayEvents.length > 0 ? (
				<div className="space-y-2">
					{displayEvents.map((event) => {
						const style = eventStyles[event.type];
						const Icon = style.icon;

						return (
							<div
								key={event.id}
								className={`flex items-center gap-3 rounded-lg border p-3 ${style.border} ${style.bg}`}
							>
								<div
									className={`flex h-8 w-8 items-center justify-center rounded-full bg-white ${style.text}`}
								>
									<Icon className="h-4 w-4" />
								</div>
								<div className="min-w-0 flex-1">
									<p className={`truncate font-medium text-sm ${style.text}`}>
										{event.title}
									</p>
									<div className="flex items-center gap-2 text-xs opacity-75">
										<span>{formatEventDate(event.date)}</span>
										{event.time && (
											<>
												<span>•</span>
												<span>{event.time}</span>
											</>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="rounded-lg border border-gray-200 border-dashed py-8 text-center">
					<Calendar className="mx-auto mb-2 h-8 w-8 text-gray-300" />
					<p className="text-gray-500 text-sm">이번 주 일정이 없습니다</p>
				</div>
			)}

			{/* 더보기 */}
			{events.length > maxEvents && (
				<p className="text-center text-gray-500 text-sm">
					+ {events.length - maxEvents}개 더 있음
				</p>
			)}

			{/* 풀 캘린더 링크 (Expanded) */}
			{_size === "expanded" && (
				<Link
					to="/calendar"
					className="block text-center font-medium text-primary-600 text-sm hover:text-primary-700"
				>
					전체 캘린더 보기 →
				</Link>
			)}
		</div>
	);
}
