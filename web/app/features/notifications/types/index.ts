// Notification System Types

export type NotificationEventType =
	| "community.reply"
	| "community.mention"
	| "mentoring.session_reminder"
	| "mentoring.booking_accepted"
	| "mentoring.new_booking"
	| "mentoring.review_received"
	| "pipeline.deadline_approaching"
	| "roadmap.task_due"
	| "payment.completed"
	| "weekly.digest";

export type NotificationPriority = "low" | "normal" | "high";

export interface NotificationPayload {
	title: string;
	body: string;
	url: string;
	icon?: string;
	requireInteraction?: boolean;
	tag?: string;
	grouped?: boolean;
	actions?: Array<{ action: string; title: string }>;
}

export interface NotificationMetadata {
	[key: string]: unknown;
	postId?: string;
	commentId?: string;
	actorId?: string;
	sessionId?: string;
	mentorId?: string;
	itemId?: string;
	taskId?: string;
	transactionId?: string;
}

export interface NotificationEvent {
	type: NotificationEventType;
	userId: string;
	payload: NotificationPayload;
	metadata: NotificationMetadata;
	options?: {
		skipQuietHours?: boolean;
		highPriority?: boolean;
	};
}

export interface TriggerConfig {
	enabled: boolean;
	priority: NotificationPriority;
	template: (data: NotificationMetadata) => NotificationPayload;
	grouping?: {
		enabled: boolean;
		groupingKey: (data: NotificationMetadata) => string;
		groupingWindow: number; // milliseconds
		batchLimit: number;
	};
	skipQuietHours?: boolean;
	schedule?: string; // e.g., "1_hour_before", "24_hours_before", "9am_on_due_date"
}

export type NotificationEventName =
	| "sent"
	| "delivered"
	| "clicked"
	| "dismissed"
	| "failed";
