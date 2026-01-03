import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { Link, useFetcher } from "react-router";
import { Avatar } from "~/shared/components/ui/Avatar";
import { Button } from "~/shared/components/ui/Button";
import { cn } from "~/shared/utils/cn";
import type { NotificationWithData } from "../services/types";

interface NotificationListProps {
	notifications: NotificationWithData[];
}

export function NotificationList({ notifications }: NotificationListProps) {
	const fetcher = useFetcher();

	if (notifications.length === 0) {
		return (
			<div className="py-responsive text-center text-gray-500">
				<Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
				No notifications
			</div>
		);
	}

	return (
		<div className="stack">
			<div className="mb-2 flex items-center justify-between px-2">
				<h3 className="heading-5">Notifications</h3>
				<fetcher.Form method="POST" action="/api/notifications">
					<input type="hidden" name="intent" value="markAllRead" />
					<Button
						variant="ghost"
						size="sm"
						type="submit"
						className="h-7 text-xs"
					>
						Mark all read
					</Button>
				</fetcher.Form>
			</div>

			<div className="stack-sm max-h-[400px] overflow-y-auto pr-2">
				{notifications.map((notification) => (
					<NotificationItem key={notification.id} notification={notification} />
				))}
			</div>
		</div>
	);
}

function NotificationItem({
	notification,
}: {
	notification: NotificationWithData;
}) {
	const fetcher = useFetcher();
	const isRead = notification.read; // Optimistic update if needed via fetcher.submission but complex for list

	// Construct link
	let href = "#";
	let text = "";

	if (notification.type === "reply") {
		href = `/community/${notification.comment.postId}#comment-${notification.commentId}`; // Need anchor support in CommentItem
		text = `replied to your comment: "${notification.comment.content.slice(0, 30)}..."`;
	} else if (notification.type === "mention") {
		href = `/community/${notification.comment.postId}#comment-${notification.commentId}`;
		text = `mentioned you: "${notification.comment.content.slice(0, 30)}..."`;
	}

	const handleRead = () => {
		if (!isRead) {
			fetcher.submit(
				{ intent: "markRead", id: notification.id },
				{ method: "POST", action: "/api/notifications" },
			);
		}
	};

	return (
		<div
			className={cn(
				"flex gap-3 rounded-lg p-3 text-sm transition-colors",
				isRead ? "bg-white" : "bg-primary-50",
			)}
		>
			<Avatar
				src={
					notification.actor.avatarThumbnailUrl ||
					notification.actor.avatarUrl ||
					undefined
				}
				alt={notification.actor.name}
				className="h-8 w-8 flex-shrink-0"
			/>
			<div className="min-w-0 flex-1">
				<p className="text-gray-900">
					<span className="font-semibold">{notification.actor.name}</span>{" "}
					{text}
				</p>
				<div className="mt-1 flex items-center justify-between">
					<span className="caption">
						{notification.createdAt
							? formatDistanceToNow(new Date(notification.createdAt), {
									addSuffix: true,
								})
							: ""}
					</span>
					<Link
						to={href}
						onClick={handleRead}
						className="link text-xs hover:text-primary-700"
					>
						View
					</Link>
				</div>
			</div>
			{!isRead && (
				<div className="flex flex-col justify-center">
					<button
						type="button"
						onClick={handleRead}
						title="Mark as read"
						className="text-primary-400 hover:text-primary-600"
					>
						<div className="h-2 w-2 rounded-full bg-primary-500" />
					</button>
				</div>
			)}
		</div>
	);
}
