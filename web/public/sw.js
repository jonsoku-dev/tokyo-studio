/// <reference lib="webworker" />
// Service Worker for Push Notifications - SPEC 009

/* eslint-disable no-restricted-globals */
const sw = self;

// Install event
sw.addEventListener("install", (_event) => {
	console.log("[Service Worker] Installing...");
	sw.skipWaiting();
});

// Activate event
sw.addEventListener("activate", (event) => {
	console.log("[Service Worker] Activating...");
	event.waitUntil(sw.clients.claim());
});

// Push event - Handle incoming push notifications
self.addEventListener("push", (event) => {
	console.log("[Service Worker] Push event received");

	// Parse data from push notification
	const data = event.data ? event.data.json() : {};
	console.log("[Service Worker] Push data:", data);

	// Notification content
	const title = data.title || "ITCOM Notification";
	const isGrouped = data.grouped === true;

	const options = {
		body: data.body || "You have a new update.",
		icon: data.icon || "/icon-192x192.png",
		badge: "/badge-72x72.png",
		data: {
			url: data.url || "/",
			timestamp: Date.now(),
			grouped: isGrouped,
		},
		// For grouped notifications, require interaction
		requireInteraction: isGrouped || data.requireInteraction || false,
		vibrate: [200, 100, 200],
		actions: data.actions || [],
		// Grouped notifications use a special tag for management
		tag: isGrouped ? `grouped-${data.type || "notification"}` : data.tag,
	};

	// Show notification
	const showPromise = self.registration.showNotification(title, options);

	event.waitUntil(showPromise);
});

// Notification click event
sw.addEventListener("notificationclick", (event) => {
	console.log("[Service Worker] Notification clicked");
	event.notification.close();

	const urlToOpen = event.notification.data?.url || "/";

	event.waitUntil(
		sw.clients
			.matchAll({
				type: "window",
				includeUncontrolled: true,
			})
			.then((windowClients) => {
				// Check if there is already a window open with the target URL
				for (const client of windowClients) {
					if (client.url.includes(urlToOpen) && "focus" in client) {
						return client.focus();
					}
				}
				// If not, open a new window
				if (sw.clients.openWindow) {
					return sw.clients.openWindow(urlToOpen);
				}
			}),
	);
});

// Notification close event
sw.addEventListener("notificationclose", (event) => {
	console.log("[Service Worker] Notification closed", event.notification.tag);
});
