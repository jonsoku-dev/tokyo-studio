import { Bell, X } from "lucide-react";
import { useState } from "react";
import { useLoaderData } from "react-router";
import { usePushNotifications } from "~/features/notifications/hooks/usePushNotifications";
import { Button } from "~/shared/components/ui/Button";

// This component should be rendered globally or on specific pages.
// It checks if permission is default (not asked) and shows a prompt.
// For MVP, we'll show it if not subscribed and permission is default.

export function NotificationPermissionPrompt() {
	const { permissionStatus, subscribeToPush, isSubscribed, isLoading } =
		usePushNotifications();
	const [isVisible, setIsVisible] = useState(true);

	interface LoaderData {
		ENV: {
			VAPID_PUBLIC_KEY: string;
		};
	}
	const loaderData = useLoaderData() as LoaderData;

	// Need VAPID key from environment/loader.
	// For now let's assume it's passed via root loader or we fetch it?
	// The service knows it. The client needs it.
	// We can expose it via a loader property "ENV".
	const win =
		typeof window !== "undefined"
			? (window as unknown as { ENV: { VAPID_PUBLIC_KEY: string } })
			: undefined;
	const vapidKey =
		loaderData?.ENV?.VAPID_PUBLIC_KEY || win?.ENV?.VAPID_PUBLIC_KEY || "";

	if (
		!isVisible ||
		permissionStatus === "denied" ||
		permissionStatus === "granted" ||
		isSubscribed
	) {
		return null;
	}

	if (!vapidKey) return null; // Can't subscribe without key

	return (
		<div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-white border border-gray-200 shadow-lg rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4">
			<div className="flex items-start gap-3">
				<div className="bg-primary-100 p-2 rounded-lg text-primary-600">
					<Bell className="h-5 w-5" />
				</div>
				<div className="flex-1 stack-xs">
					<h3 className="heading-5">Enable Notifications?</h3>
					<p className="caption">
						Get timely updates on replies, mentor sessions, and application
						deadlines.
					</p>
				</div>
				<button
					type="button"
					onClick={() => setIsVisible(false)}
					className="text-gray-400 hover:text-gray-600"
				>
					<X className="h-4 w-4" />
				</button>
			</div>
			<div className="mt-4 flex gap-2 justify-end">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setIsVisible(false)}
					className="text-gray-600"
				>
					Not Now
				</Button>
				<Button
					size="sm"
					onClick={() => subscribeToPush(vapidKey)}
					disabled={isLoading}
				>
					{isLoading ? "Enabling..." : "Enable Updates"}
				</Button>
			</div>
		</div>
	);
}
