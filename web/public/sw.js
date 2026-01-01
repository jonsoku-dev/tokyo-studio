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
sw.addEventListener("push", (event) => {
	console.log("[Service Worker] Push received");

	let data = {};

	try {
		data = event.data ? event.data.json() : {};
	} catch (error) {
		console.error("[Service Worker] Error parsing push data:", error);
		data = {
			title: "New Notification",
			body: "You have a new notification",
		};
	}

	const title = data.title || "ITCOM Notification";
	const options = {
		body: data.body || "You have a new update.",
		icon: data.icon || "/icon-192x192.png",
		badge: "/badge-72x72.png",
		data: {
			url: data.url || "/",
			timestamp: Date.now(),
		},
		vibrate: [200, 100, 200],
		tag: data.tag || "notification",
		requireInteraction: false,
		actions: data.actions || [],
	};

	event.waitUntil(sw.registration.showNotification(title, options));
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
