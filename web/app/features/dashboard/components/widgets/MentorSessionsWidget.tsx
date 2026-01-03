import type { WidgetLayout } from "@itcom/db/schema";
import { Calendar, Clock, User, Video } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface MentorSessionsWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

/**
 * Mentor Sessions Widget (P2)
 * 예정된 멘토링 세션 표시
 */
export default function MentorSessionsWidget({
	size: _size,
	widgetData,
}: MentorSessionsWidgetProps) {
	const { upcomingSessions, upcomingCount, completedCount } =
		widgetData.mentorSessions;

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
		return `${month}/${day} (${dayOfWeek})`;
	};

	const formatTime = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleTimeString("ko-KR", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const maxItems = _size === "compact" ? 1 : 2;
	const displaySessions = upcomingSessions.slice(0, maxItems);

	return (
		<div className="space-y-4">
			{/* 예정된 세션 */}
			{displaySessions.length > 0 ? (
				<div className="space-y-3">
					{displaySessions.map((session) => (
						<Link
							key={session.id}
							to={`/mentoring/sessions/${session.id}`}
							className="group block rounded-lg border border-gray-200 p-3 transition-all hover:border-primary-300 hover:bg-primary-50/30"
						>
							<div className="flex items-start gap-3">
								<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
									<User className="h-5 w-5 text-primary-600" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="mb-1 flex items-center justify-between">
										<p className="font-medium text-gray-900 text-sm">
											{session.mentorName || "멘토"}
										</p>
									</div>
									<p className="mb-2 truncate text-gray-600 text-sm">
										{session.topic}
									</p>
									<div className="flex items-center gap-3 text-gray-500 text-xs">
										<span className="flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											{formatDate(session.date)}
										</span>
										<span className="flex items-center gap-1">
											<Clock className="h-3 w-3" />
											{formatTime(session.date)}
										</span>
										<span className="flex items-center gap-1 text-primary-600">
											<Video className="h-3 w-3" />
											화상
										</span>
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>
			) : (
				<div className="rounded-lg border border-gray-300 border-dashed p-responsive text-center">
					<Calendar className="mx-auto mb-2 h-8 w-8 text-gray-300" />
					<p className="text-gray-500 text-sm">예정된 멘토링이 없습니다</p>
					<Link
						to="/mentoring"
						className="mt-2 inline-block font-medium text-primary-600 text-sm hover:text-primary-700"
					>
						멘토 찾아보기 →
					</Link>
				</div>
			)}

			{/* 통계 (Standard/Expanded) */}
			{_size !== "compact" && (
				<div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
					<div className="text-center">
						<p className="font-bold text-gray-900">{upcomingCount}</p>
						<p className="text-gray-500 text-xs">예정된 세션</p>
					</div>
					<div className="h-8 w-px bg-gray-200" />
					<div className="text-center">
						<p className="font-bold text-gray-900">{completedCount}</p>
						<p className="text-gray-500 text-xs">완료된 세션</p>
					</div>
					<div className="h-8 w-px bg-gray-200" />
					<Link
						to="/mentoring"
						className="font-medium text-primary-600 text-sm hover:text-primary-700"
					>
						전체 보기 →
					</Link>
				</div>
			)}
		</div>
	);
}
