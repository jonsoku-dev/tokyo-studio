/**
 * SPEC 009: Notification Preferences Settings
 *
 * Allows users to manage notification preferences:
 * - Enable/disable notification types
 * - Set quiet hours
 * - Configure timezone
 */

import { db } from "@itcom/db/client";
import { notificationPreferences } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { Clock, Moon } from "lucide-react";
import { Form, useLoaderData } from "react-router";
import { requireVerifiedEmail } from "~/features/auth/services/require-verified-email.server";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { Button } from "~/shared/components/ui/Button";
import type { Route } from "./+types/settings";

export async function loader({ request }: Route.LoaderArgs) {
	const user = await requireVerifiedEmail(request);

	// Get existing preferences or return defaults
	const prefs = await db.query.notificationPreferences.findFirst({
		where: eq(notificationPreferences.userId, user.id),
	});

	// Default values
	const defaults = {
		sessionReminders: true,
		deadlineAlerts: true,
		replyNotifications: true,
		bookingUpdates: true,
		paymentNotifications: true,
		weeklyDigest: false,
	};

	if (!prefs) {
		return {
			preferences: {
				...defaults,
				quietHoursStart: "22:00",
				quietHoursEnd: "08:00",
				timezone: "UTC",
			},
		};
	}

	const enabledTypes = prefs.enabledTypes || [];
	return {
		preferences: {
			sessionReminders: enabledTypes.includes("sessionReminders"),
			deadlineAlerts: enabledTypes.includes("deadlineAlerts"),
			replyNotifications: enabledTypes.includes("replyNotifications"),
			bookingUpdates: enabledTypes.includes("bookingUpdates"),
			paymentNotifications: enabledTypes.includes("paymentNotifications"),
			weeklyDigest: enabledTypes.includes("weeklyDigest"),
			quietHoursStart: prefs.quietHoursStart,
			quietHoursEnd: prefs.quietHoursEnd,
			timezone: prefs.timezone,
		},
	};
}

export async function action({ request }: Route.ActionArgs) {
	const user = await requireVerifiedEmail(request);
	const formData = await request.formData();

	// Parse form data to build enabledTypes array
	const enabledTypes: string[] = [];
	if (formData.get("sessionReminders") === "on")
		enabledTypes.push("sessionReminders");
	if (formData.get("deadlineAlerts") === "on")
		enabledTypes.push("deadlineAlerts");
	if (formData.get("replyNotifications") === "on")
		enabledTypes.push("replyNotifications");
	if (formData.get("bookingUpdates") === "on")
		enabledTypes.push("bookingUpdates");
	if (formData.get("paymentNotifications") === "on")
		enabledTypes.push("paymentNotifications");
	if (formData.get("weeklyDigest") === "on") enabledTypes.push("weeklyDigest");

	const preferencesData = {
		userId: user.id,
		enabledTypes,
		quietHoursStart: formData.get("quietHoursStart") as string,
		quietHoursEnd: formData.get("quietHoursEnd") as string,
		timezone: formData.get("timezone") as string,
	};

	// Upsert preferences
	await db
		.insert(notificationPreferences)
		.values(preferencesData)
		.onConflictDoUpdate({
			target: notificationPreferences.userId,
			set: preferencesData,
		});

	return { success: true };
}

export default function NotificationSettings() {
	const { preferences } = useLoaderData<typeof loader>();

	return (
		<div>
			<PageHeader
				title="Notification Settings"
				description="Manage how and when you receive notifications"
				className="mb-8"
			/>

			<Form method="POST" className="stack-lg">
				{/* Notification Types */}
				<div className="stack rounded-lg border border-gray-200 bg-white p-6">
					<h2 className="heading-5">Notification Types</h2>

					<Toggle
						name="sessionReminders"
						label="Session Reminders"
						description="Get notified 1 hour before mentor sessions"
						defaultChecked={preferences.sessionReminders}
					/>

					<Toggle
						name="deadlineAlerts"
						label="Deadline Alerts"
						description="Alerts for application deadlines and important dates"
						defaultChecked={preferences.deadlineAlerts}
					/>

					<Toggle
						name="replyNotifications"
						label="Reply Notifications"
						description="When someone replies to your comment"
						defaultChecked={preferences.replyNotifications}
					/>

					<Toggle
						name="bookingUpdates"
						label="Booking Updates"
						description="Session bookings, cancellations, and reschedules"
						defaultChecked={preferences.bookingUpdates}
					/>

					<Toggle
						name="paymentNotifications"
						label="Payment Notifications"
						description="Payment confirmations and receipts"
						defaultChecked={preferences.paymentNotifications}
					/>

					<Toggle
						name="weeklyDigest"
						label="Weekly Digest"
						description="Summary of your activity and updates (every Sunday)"
						defaultChecked={preferences.weeklyDigest}
					/>
				</div>

				{/* Quiet Hours */}
				<div className="stack rounded-lg border border-gray-200 bg-white p-6">
					<div className="flex items-center gap-2">
						<Moon className="h-5 w-5 text-gray-700" />
						<h2 className="heading-5">Quiet Hours</h2>
					</div>
					<p className="body-sm">
						Don't send notifications during these hours. Notifications will be
						queued and sent after quiet hours end.
					</p>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="quietHoursStart"
								className="mb-1 block font-medium text-gray-700 text-sm"
							>
								Start Time
							</label>
							<div className="relative">
								<Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<input
									type="time"
									id="quietHoursStart"
									name="quietHoursStart"
									defaultValue={preferences.quietHoursStart || ""}
									className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 focus:border-transparent focus:ring-2 focus:ring-primary-500"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="quietHoursEnd"
								className="mb-1 block font-medium text-gray-700 text-sm"
							>
								End Time
							</label>
							<div className="relative">
								<Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<input
									type="time"
									id="quietHoursEnd"
									name="quietHoursEnd"
									defaultValue={preferences.quietHoursEnd || ""}
									className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 focus:border-transparent focus:ring-2 focus:ring-primary-500"
								/>
							</div>
						</div>
					</div>

					{/* Timezone */}
					<div>
						<label
							htmlFor="timezone"
							className="mb-1 block font-medium text-gray-700 text-sm"
						>
							Timezone
						</label>
						<select
							id="timezone"
							name="timezone"
							defaultValue={preferences.timezone || "UTC"}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
						>
							<option value="UTC">UTC (Coordinated Universal Time)</option>
							<option value="America/New_York">Eastern Time (New York)</option>
							<option value="America/Chicago">Central Time (Chicago)</option>
							<option value="America/Denver">Mountain Time (Denver)</option>
							<option value="America/Los_Angeles">
								Pacific Time (Los Angeles)
							</option>
							<option value="Europe/London">London (GMT)</option>
							<option value="Europe/Paris">Paris (CET)</option>
							<option value="Asia/Tokyo">Tokyo (JST)</option>
							<option value="Asia/Seoul">Seoul (KST)</option>
							<option value="Asia/Shanghai">Shanghai (CST)</option>
							<option value="Asia/Kolkata">India (IST)</option>
							<option value="Australia/Sydney">Sydney (AEDT)</option>
						</select>
					</div>
				</div>

				{/* Submit */}
				<div className="flex justify-end">
					<Button type="submit">Save Preferences</Button>
				</div>
			</Form>
		</div>
	);
}

// Toggle component
function Toggle({
	name,
	label,
	description,
	defaultChecked,
}: {
	name: string;
	label: string;
	description: string;
	defaultChecked: boolean;
}) {
	return (
		<div className="flex items-start justify-between border-gray-100 border-b py-3 last:border-0">
			<div className="flex-1">
				<label htmlFor={name} className="heading-5 block">
					{label}
				</label>
				<p className="caption mt-0.5">{description}</p>
			</div>
			<div className="ml-4">
				<input
					type="checkbox"
					id={name}
					name={name}
					defaultChecked={defaultChecked}
					className="h-5 w-5 cursor-pointer rounded border-gray-300 text-primary-600 focus:ring-primary-500"
				/>
			</div>
		</div>
	);
}
