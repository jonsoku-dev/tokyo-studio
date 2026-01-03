import { Bell } from "lucide-react";
import { useEffect } from "react";
import { useFetcher } from "react-router";
import { NotificationList } from "~/features/community/components/NotificationList";
import type { NotificationWithData } from "~/features/community/services/types";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/shared/components/ui/Popover";

export function NotificationsPopover() {
	const fetcher = useFetcher<{ notifications: NotificationWithData[] }>();

	const notifications = fetcher.data?.notifications || [];
	const unreadCount = notifications.filter((n) => !n.read).length;

	const handleOpen = () => {
		// Refresh data on interaction (Unidirectional request)
		fetcher.load("/api/notifications");

		// Optimistically clear the badge (User experience requirement: "Disappear once opened")
		// And sync with server
		fetcher.submit(
			{ intent: "markAllRead" },
			{ method: "post", action: "/api/notifications" },
		);
	};

	// Initial load only - Unidirectional from server
	// biome-ignore lint/correctness/useExhaustiveDependencies: fetcher.load should only run once on mount
	useEffect(() => {
		if (fetcher.state === "idle" && !fetcher.data) {
			fetcher.load("/api/notifications");
		}
	}, []);

	return (
		<Popover className="relative">
			<PopoverTrigger
				onClick={handleOpen}
				className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900"
			>
				<Bell className="h-5 w-5" />
				{/* Optimistically hide badge if we just clicked, but unreadCount relies on data */}
				{/* Since we submit markAllRead immediately, next fetch should return 0 unread */}
				{/* For instant feedback, we can use fetcher.submission state check or just trust the fast action */}
				{unreadCount > 0 &&
					fetcher.formData?.get("intent") !== "markAllRead" && (
						<span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
					)}
			</PopoverTrigger>

			{/* Width 24rem = 384px, typical for notification panels */}
			<PopoverContent className="w-96 p-0">
				<div className="flex items-center justify-between border-gray-100 border-b px-responsive py-3">
					<h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
					{unreadCount > 0 && (
						<span className="rounded-full bg-primary-50 px-2 py-0.5 font-medium text-primary-600 text-xs">
							{unreadCount} new
						</span>
					)}
				</div>
				<div className="max-h-[80vh] overflow-y-auto">
					{fetcher.state === "loading" && !fetcher.data ? (
						<div className="flex h-32 items-center justify-center text-gray-400 text-sm">
							Loading...
						</div>
					) : (
						<NotificationList notifications={notifications} />
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
