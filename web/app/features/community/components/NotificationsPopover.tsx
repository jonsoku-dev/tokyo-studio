import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { NotificationList } from "~/features/community/components/NotificationList";
import type { NotificationWithData } from "~/features/community/services/types";
import { Button } from "~/shared/components/ui/Button";

export function NotificationsPopover() {
	const fetcher = useFetcher<{ notifications: NotificationWithData[] }>();
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		// Initial fetch only if user is logged in (handled by parent or we just try)
		if (fetcher.state === "idle" && !fetcher.data) {
			fetcher.load("/api/notifications");
		}

		// Let's re-fetch on open
		if (isOpen) {
			fetcher.load("/api/notifications");
		}
	}, [isOpen, fetcher.load, fetcher.state, fetcher.data]);

	const notifications = fetcher.data?.notifications || [];
	const unreadCount = notifications.filter((n) => !n.read).length;

	return (
		<div className="relative">
			<Button
				variant="ghost"
				size="sm"
				className="relative text-gray-500 hover:text-gray-900 h-9 w-9 px-0"
				onClick={() => setIsOpen(!isOpen)}
			>
				<Bell className="h-5 w-5" />
				{unreadCount > 0 && (
					<span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
				)}
			</Button>

			{isOpen && (
				<>
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: Backdrop */}
					{/* biome-ignore lint/a11y/noStaticElementInteractions: Backdrop */}
					<div
						className="fixed inset-0 z-10"
						onClick={() => setIsOpen(false)}
					/>
					<div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden">
						<div className="p-2">
							<NotificationList notifications={notifications} />
						</div>
					</div>
				</>
			)}
		</div>
	);
}
