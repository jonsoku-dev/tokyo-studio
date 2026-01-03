import type {
	NotificationMetadata,
	NotificationPayload,
	TriggerConfig,
} from "../types";

export const notificationTriggers: Record<string, TriggerConfig> = {
	"community.reply": {
		enabled: true,
		priority: "normal",
		template: (data: NotificationMetadata): NotificationPayload => ({
			title: "New Reply",
			body: `${data.authorName || "Someone"} replied to your comment`,
			url: `/communities/${data.communitySlug}?highlight=${data.commentId}`,
			icon: "/icons/comment.png",
		}),
		grouping: {
			enabled: true,
			groupingKey: (data) => `comment:${data.parentId}`,
			groupingWindow: 600000, // 10 minutes
			batchLimit: 3,
		},
	},

	"community.mention": {
		enabled: true,
		priority: "normal",
		template: (data: NotificationMetadata): NotificationPayload => ({
			title: "New Mention",
			body: `${data.authorName || "Someone"} mentioned you in a comment`,
			url: `/communities/${data.communitySlug}?highlight=${data.commentId}`,
			icon: "/icons/at-sign.png",
		}),
		grouping: {
			enabled: true,
			groupingKey: (data) => `mention:${data.userId}`,
			groupingWindow: 600000,
			batchLimit: 3,
		},
	},

	"mentoring.session_reminder": {
		enabled: true,
		priority: "high",
		template: (data: NotificationMetadata): NotificationPayload => ({
			title: "Session Starting Soon",
			body: `Your session with ${data.mentorName || "your mentor"} starts in 1 hour`,
			url: `/mentoring/sessions/${data.sessionId}`,
			requireInteraction: true,
		}),
		skipQuietHours: true, // Time-sensitive
		grouping: {
			enabled: false, // Never group session reminders
			groupingKey: () => "",
			groupingWindow: 0,
			batchLimit: 0,
		},
		schedule: "1_hour_before",
	},

	"mentoring.booking_accepted": {
		enabled: true,
		priority: "normal",
		template: (data: NotificationMetadata): NotificationPayload => ({
			title: "Booking Accepted",
			body: `${data.mentorName || "Your mentor"} accepted your booking request`,
			url: `/mentoring/sessions/${data.sessionId}`,
		}),
	},

	"mentoring.new_booking": {
		enabled: true,
		priority: "high",
		template: (data: NotificationMetadata): NotificationPayload => ({
			title: "New Session Booking",
			body: `${data.menteeName || "Someone"} has booked a session with you`,
			url: "/mentoring/bookings",
			icon: "/icons/calendar.png",
		}),
		skipQuietHours: true,
	},

	"mentoring.review_received": {
		enabled: true,
		priority: "normal",
		template: (data: NotificationMetadata): NotificationPayload => ({
			title: "New Review Received",
			body: `You received a ${data.rating}-star review from ${data.menteeName || "a mentee"}!`,
			url: `/mentoring/mentors/${data.mentorId}`,
			icon: "/icons/star.png",
		}),
	},

	"pipeline.deadline_approaching": {
		enabled: true,
		priority: "high",
		template: (data: NotificationMetadata): NotificationPayload => ({
			title: "Application Deadline Tomorrow",
			body: `${data.company} - ${data.position}`,
			url: `/applications?highlight=${data.itemId}`,
			icon: "/icons/briefcase.png",
		}),
		skipQuietHours: true,
		schedule: "24_hours_before",
	},

	"roadmap.task_due": {
		enabled: true,
		priority: "normal",
		template: (data: NotificationMetadata): NotificationPayload => ({
			title: "Task Due Today",
			body: String(data.taskTitle || "You have a task due today"),
			url: `/roadmap?highlight=${data.taskId}`,
			icon: "/icons/checkbox.png",
		}),
		schedule: "9am_on_due_date",
	},

	"payment.completed": {
		enabled: true,
		priority: "normal",
		template: (data: NotificationMetadata): NotificationPayload => ({
			title: "Payment Completed",
			body: `${data.amount} ${data.currency} - ${data.description || "Payment successful"}`,
			url: `/payments/${data.transactionId}`,
			icon: "/icons/credit-card.png",
		}),
	},

	"weekly.digest": {
		enabled: true,
		priority: "low",
		template: (data: NotificationMetadata): NotificationPayload => ({
			title: "Weekly Summary",
			body: `${data.replyCount || 0} replies, ${data.mentionCount || 0} mentions, ${data.newPostsCount || 0} new posts`,
			url: "/dashboard",
		}),
		schedule: "monday_9am",
	},
};
