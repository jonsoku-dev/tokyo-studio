import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export function usePushNotifications() {
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [permissionStatus, setPermissionStatus] =
		useState<NotificationPermission>("default");
	const [isLoading, setIsLoading] = useState(false);
	const fetcher = useFetcher();

	useEffect(() => {
		const checkSubscription = async () => {
			if ("serviceWorker" in navigator) {
				const registration = await navigator.serviceWorker.ready;
				const subscription = await registration.pushManager.getSubscription();
				setIsSubscribed(!!subscription);
			}
		};

		if (typeof window !== "undefined" && "Notification" in window) {
			setPermissionStatus(Notification.permission);
			checkSubscription();
		}
	}, []);

	const subscribeToPush = async (vapidPublicKey: string) => {
		setIsLoading(true);
		try {
			// 1. Request Permission
			const permission = await Notification.requestPermission();
			setPermissionStatus(permission);

			if (permission !== "granted") {
				throw new Error("Permission denied");
			}

			// 2. Register Service Worker
			// We assume sw.js is at root public/sw.js
			const registration = await navigator.serviceWorker.register("/sw.js");
			await navigator.serviceWorker.ready; // Wait for it to be active

			// 3. Subscribe to Push Manager
			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
			});

			// 4. Send subscription to server
			fetcher.submit(
				{ subscription: JSON.stringify(subscription) },
				{ method: "POST", action: "/api/notifications/subscribe" },
			);

			setIsSubscribed(true);
			// Revert state if failed
			if ("serviceWorker" in navigator) {
				const registration = await navigator.serviceWorker.ready;
				const subscription = await registration.pushManager.getSubscription();
				setIsSubscribed(!!subscription);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const unsubscribeFromPush = async () => {
		setIsLoading(true);
		try {
			if ("serviceWorker" in navigator) {
				const registration = await navigator.serviceWorker.ready;
				const subscription = await registration.pushManager.getSubscription();
				if (subscription) {
					await subscription.unsubscribe();
					// Notify server
					fetcher.submit(
						{ endpoint: subscription.endpoint },
						{ method: "DELETE", action: "/api/notifications/subscribe" },
					);
					setIsSubscribed(false);
				}
			}
		} catch (error) {
			console.error("Error unsubscribing", error);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isSubscribed,
		permissionStatus,
		subscribeToPush,
		unsubscribeFromPush,
		isLoading,
	};
}
