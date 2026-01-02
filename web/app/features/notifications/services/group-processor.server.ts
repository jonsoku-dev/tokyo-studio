import { db } from "@itcom/db/client";
import { notificationGroupings } from "@itcom/db/schema";
import { and, eq, lt } from "drizzle-orm";
import { notificationTriggers } from "../config/triggers";
import type { NotificationPayload } from "../types";
import { pushService } from "./push.server";

interface GroupProcessorMetrics {
	processed: number;
	failed: number;
	duration: number;
}

/**
 * Group processor service
 * Processes expired notification grouping windows and sends batched notifications
 */
class GroupProcessor {
	/**
	 * Process all expired notification groups
	 */
	async processExpiredGroups(): Promise<GroupProcessorMetrics> {
		const startTime = Date.now();
		const metrics: GroupProcessorMetrics = {
			processed: 0,
			failed: 0,
			duration: 0,
		};

		try {
			// Find expired groups (windowEnd < now AND status="pending")
			const expiredGroups = await db.query.notificationGroupings.findMany({
				where: and(
					eq(notificationGroupings.status, "pending"),
					lt(notificationGroupings.windowEnd, new Date()),
				),
			});

			console.log(
				`[GroupProcessor] Found ${expiredGroups.length} expired groups`,
			);

			// Process each group
			for (const group of expiredGroups) {
				try {
					await this.processGroup(group);
					metrics.processed++;
				} catch (error) {
					console.error(
						`[GroupProcessor] Error processing group ${group.id}:`,
						error,
					);
					metrics.failed++;
				}
			}

			console.log(
				`[GroupProcessor] Completed - Processed: ${metrics.processed}, Failed: ${metrics.failed}`,
			);
		} catch (error) {
			console.error("[GroupProcessor] Fatal error:", error);
			throw error;
		} finally {
			metrics.duration = Date.now() - startTime;
		}

		return metrics;
	}

	/**
	 * Process a single notification group
	 */
	private async processGroup(
		group: Awaited<
			ReturnType<typeof db.query.notificationGroupings.findMany>
		>[0],
	) {
		// Get trigger config
		const config = notificationTriggers[group.type];
		if (!config) {
			console.error(
				`[GroupProcessor] Unknown notification type: ${group.type}`,
			);
			return;
		}

		// Generate grouped notification payload
		const payload: NotificationPayload = {
			title: `${group.count} new ${this.getReadableType(group.type)} updates`,
			body: this.generateGroupedBody(group),
			url: this.getGroupUrl(group),
			grouped: true,
		};

		// Send grouped notification
		await pushService.sendPushNotification(group.userId, payload);

		// Mark group as sent
		await db
			.update(notificationGroupings)
			.set({
				status: "sent",
				sentAt: new Date(),
			})
			.where(eq(notificationGroupings.id, group.id));

		console.log(
			`[GroupProcessor] Sent grouped notification for ${group.count} ${group.type} events to user ${group.userId}`,
		);
	}

	/**
	 * Get readable notification type name
	 */
	private getReadableType(type: string): string {
		const typeMap: Record<string, string> = {
			"community.reply": "reply",
			"community.mention": "mention",
			"mentoring.session_reminder": "session reminder",
			"mentoring.booking_accepted": "booking",
			"pipeline.deadline_approaching": "deadline",
			"roadmap.task_due": "task",
			"payment.completed": "payment",
			"weekly.digest": "digest",
		};

		return typeMap[type] || type;
	}

	/**
	 * Generate grouped notification body
	 */
	private generateGroupedBody(
		group: Awaited<
			ReturnType<typeof db.query.notificationGroupings.findMany>
		>[0],
	): string {
		const type = this.getReadableType(group.type);

		if (group.count === 1) {
			return `You have a new ${type}`;
		}

		return `You have ${group.count} new ${type}s`;
	}

	/**
	 * Get URL for grouped notification
	 */
	private getGroupUrl(
		group: Awaited<
			ReturnType<typeof db.query.notificationGroupings.findMany>
		>[0],
	): string {
		// Extract entity from groupKey (e.g., "comment:parent-id" -> parent-id)
		const [entityType, entityId] = group.groupKey.split(":");

		// Map to appropriate URL
		const urlMap: Record<string, (id: string) => string> = {
			comment: (id) => `/communities?highlight=${id}`,
			mention: (id) => `/communities?highlight=${id}`,
			session: (id) => `/mentoring/sessions/${id}`,
			pipeline: (id) => `/pipeline?highlight=${id}`,
			task: (id) => `/roadmap?highlight=${id}`,
		};

		const urlGenerator = urlMap[entityType];
		return urlGenerator ? urlGenerator(entityId) : "/dashboard";
	}
}

// Export singleton
export const groupProcessor = new GroupProcessor();
