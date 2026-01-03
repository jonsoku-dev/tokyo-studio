import type { WidgetLayout } from "@itcom/db/schema";
import { Bell, Calendar, MessageSquare, Settings, User } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface NotificationsWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

// 알림 타입별 아이콘
const notificationIcons = {
	mentoring: User,
	community: MessageSquare,
	deadline: Calendar,
	system: Bell,
} as const;

/**
 * Notifications Widget (P2)
 * 알림 센터
 * TODO: 실제 notifications 스키마 구현 후 연동
 */
export default function NotificationsWidget({
	size: _size,
	widgetData: _widgetData,
}: NotificationsWidgetProps) {
	// TODO: 실제 notifications 데이터 연동
	const notifications = [
		{
			id: "1",
			type: "mentoring" as const,
			title: "멘토링 세션 예약 확정",
			message: "멘토님과의 세션이 예약되었습니다.",
			time: "10분 전",
			isRead: false,
		},
		{
			id: "2",
			type: "community" as const,
			title: "게시글에 새 댓글",
			message: "새 댓글이 달렸습니다.",
			time: "1시간 전",
			isRead: false,
		},
		{
			id: "3",
			type: "deadline" as const,
			title: "지원 마감 D-3",
			message: "지원 마감이 3일 남았습니다.",
			time: "3시간 전",
			isRead: true,
		},
	];

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const maxItems = _size === "compact" ? 2 : _size === "standard" ? 3 : 5;
	const displayNotifications = notifications.slice(0, maxItems);

	return (
		<div className="space-y-3">
			{/* 헤더 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Bell className="h-4 w-4 text-primary-600" />
					<span className="font-medium text-gray-700 text-sm">알림</span>
					{unreadCount > 0 && (
						<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 font-medium text-white text-xs">
							{unreadCount}
						</span>
					)}
				</div>
				<Link
					to="/settings/notifications"
					className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
				>
					<Settings className="h-4 w-4" />
				</Link>
			</div>

			{/* 알림 목록 */}
			{displayNotifications.length > 0 ? (
				<div className="space-y-2">
					{displayNotifications.map((notification) => {
						const Icon = notificationIcons[notification.type];
						return (
							<Link
								key={notification.id}
								to="/notifications"
								className={`group block rounded-lg p-3 transition-all ${
									notification.isRead
										? "bg-white hover:bg-gray-50"
										: "bg-primary-50/50 hover:bg-primary-50"
								}`}
							>
								<div className="flex items-start gap-3">
									<div
										className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
											notification.isRead ? "bg-gray-100" : "bg-primary-100"
										}`}
									>
										<Icon
											className={`h-4 w-4 ${
												notification.isRead
													? "text-gray-500"
													: "text-primary-600"
											}`}
										/>
									</div>
									<div className="min-w-0 flex-1">
										<div className="mb-0.5 flex items-center gap-2">
											<p
												className={`truncate text-sm ${
													notification.isRead
														? "text-gray-600"
														: "font-medium text-gray-900"
												}`}
											>
												{notification.title}
											</p>
											{!notification.isRead && (
												<span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
											)}
										</div>
										{_size !== "compact" && (
											<p className="truncate text-gray-500 text-xs">
												{notification.message}
											</p>
										)}
										<p className="mt-1 text-gray-400 text-xs">
											{notification.time}
										</p>
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			) : (
				<div className="py-responsive text-center text-gray-400">
					<Bell className="mx-auto mb-2 h-8 w-8" />
					<p className="text-sm">새 알림이 없습니다</p>
				</div>
			)}

			{/* 전체 보기 */}
			{notifications.length > maxItems && (
				<Link
					to="/notifications"
					className="block py-2 text-center font-medium text-primary-600 text-sm hover:text-primary-700"
				>
					전체 알림 보기 →
				</Link>
			)}
		</div>
	);
}
