import { db } from "@itcom/db/client";
import { notificationQueue, pushSubscriptions } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import webpush from "web-push";

// Initialize web-push
// In a real app, these should be securely loaded from process.env
// We assume they are available.
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
	webpush.setVapidDetails(
		process.env.VAPID_SUBJECT || "mailto:admin@example.com",
		process.env.VAPID_PUBLIC_KEY,
		process.env.VAPID_PRIVATE_KEY,
	);
}

export const pushService = {
	async sendPushNotification(
		userId: string,
		payload: { title: string; body: string; icon?: string; url?: string },
		options?: { skipQuietHours?: boolean },
	) {
		// 1. Check notification preferences and quiet hours
		if (!options?.skipQuietHours) {
			const prefs = await db.query.notificationPreferences.findFirst({
				where: (np, { eq }) => eq(np.userId, userId),
			});

			if (prefs?.quietHoursStart && prefs?.quietHoursEnd) {
				const timezone = prefs.timezone || "UTC";
				const now = new Date();

				// Get current time in user's timezone
				const userTime = now.toLocaleTimeString("en-US", {
					timeZone: timezone,
					hour12: false,
					hour: "2-digit",
					minute: "2-digit",
				});
				const [currentHour, currentMinute] = userTime.split(":").map(Number);
				const currentMinutes = currentHour * 60 + currentMinute;

				// Parse quiet hours
				const [startHour, startMinute] = prefs.quietHoursStart
					.split(":")
					.map(Number);
				const [endHour, endMinute] = prefs.quietHoursEnd.split(":").map(Number);
				const startMinutes = startHour * 60 + startMinute;
				const endMinutes = endHour * 60 + endMinute;

				let isQuietHours = false;

				if (startMinutes < endMinutes) {
					// Normal case: e.g., 08:00 - 22:00 same day
					isQuietHours =
						currentMinutes >= startMinutes && currentMinutes < endMinutes;
				} else {
					// Overnight case: e.g., 22:00 - 08:00 crosses midnight
					isQuietHours =
						currentMinutes >= startMinutes || currentMinutes < endMinutes;
				}

				if (isQuietHours) {
					// Queue notification for after quiet hours
					console.log(
						`[Push] Quiet hours active for user ${userId}, queueing notification`,
					);

					// Calculate when quiet hours end
					const endTime = new Date(now);
					if (currentMinutes < endMinutes) {
						// Same day
						endTime.setHours(endHour, endMinute, 0, 0);
					} else {
						// Next day
						endTime.setDate(endTime.getDate() + 1);
						endTime.setHours(endHour, endMinute, 0, 0);
					}

					await db.insert(notificationQueue).values({
						userId,
						payload:
							payload as unknown as typeof notificationQueue.$inferInsert.payload,
						scheduledAt: endTime,
						status: "pending",
						retryCount: 0,
					});

					return; // Don't send now
				}
			}
		}

		// 2. Fetch all subscriptions for user
		const subscriptions = await db.query.pushSubscriptions.findMany({
			where: eq(pushSubscriptions.userId, userId),
		});

		if (subscriptions.length === 0) {
			console.log(`No subscriptions found for user ${userId}`);
			return;
		}

		// 3. Send to all subscriptions
		const promiseChain = subscriptions.map(async (sub) => {
			const pushSubscription = {
				endpoint: sub.endpoint,
				keys: {
					auth: sub.auth,
					p256dh: sub.p256dh,
				},
			};

			try {
				await webpush.sendNotification(
					pushSubscription,
					JSON.stringify(payload),
				);
				console.log(`Push sent to ${sub.endpoint}`);
			} catch (error: unknown) {
				console.error(`Error sending push to ${sub.endpoint}:`, error);

				const statusCode = (error as { statusCode?: number })?.statusCode;

				// If subscription is invalid (Gone or Not Found), delete it
				if (statusCode === 410 || statusCode === 404) {
					console.log(`Deleting invalid subscription: ${sub.endpoint}`);
					await db
						.delete(pushSubscriptions)
						.where(eq(pushSubscriptions.id, sub.id));
				}
			}
		});

		await Promise.all(promiseChain);
	},
};
