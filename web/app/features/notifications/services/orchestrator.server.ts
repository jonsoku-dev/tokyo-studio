import { db } from "@itcom/db/client";
import {
	notificationEventLog,
	notificationGroupings,
	notificationPreferences,
} from "@itcom/db/schema";
import { and, eq, gt, sql } from "drizzle-orm";
import { notificationTriggers } from "../config/triggers";
import type {
	NotificationEvent,
	NotificationEventName,
	NotificationMetadata,
} from "../types";
import { pushService } from "./push.server";

class NotificationOrchestrator {
	/**
	 * Main entry point for triggering notifications
	 * Validates, filters, deduplicates, groups, or sends notifications
	 */
	async trigger(event: NotificationEvent): Promise<void> {
		// 1. Validate event against trigger config
		const config = notificationTriggers[event.type];
		if (!config?.enabled) {
			console.log(`[Orchestrator] Trigger type "${event.type}" is disabled`);
			return;
		}

		// 2. Check user preferences
		const prefs = await this.getUserPreferences(event.userId);
		if (!this.isTypeEnabled(prefs, event.type)) {
			console.log(
				`[Orchestrator] User ${event.userId} has disabled "${event.type}"`,
			);
			return;
		}

		// 3. Generate notification ID for deduplication
		const notificationId = `${event.type}:${event.metadata.eventId || event.metadata.commentId || event.metadata.sessionId || Date.now()}`;

		// 4. Check for duplicate
		if (await this.isDuplicate(notificationId)) {
			console.log(`[Orchestrator] Duplicate notification: ${notificationId}`);
			return;
		}

		// 5. Track "sent" event
		await this.trackEvent(
			event.userId,
			notificationId,
			event.type,
			"sent",
			event.metadata,
		);

		// 6. Check grouping rules
		if (config.grouping?.enabled && (await this.shouldGroup(event, config))) {
			await this.addToGroup(event, config, notificationId);
			console.log(`[Orchestrator] Added to group: ${notificationId}`);
			return;
		}

		// 7. Send notification
		try {
			await pushService.sendPushNotification(event.userId, event.payload, {
				skipQuietHours: event.options?.skipQuietHours || config.skipQuietHours,
			});
			await this.trackEvent(
				event.userId,
				notificationId,
				event.type,
				"delivered",
			);
		} catch (error) {
			await this.trackEvent(
				event.userId,
				notificationId,
				event.type,
				"failed",
				{ error: String(error) },
			);
			throw error;
		}
	}

	/**
	 * Get user notification preferences
	 */
	private async getUserPreferences(userId: string) {
		return db.query.notificationPreferences.findFirst({
			where: eq(notificationPreferences.userId, userId),
		});
	}

	/**
	 * Check if notification type is enabled for user
	 */
	private isTypeEnabled(
		prefs: Awaited<ReturnType<typeof this.getUserPreferences>>,
		type: string,
	): boolean {
		// If no preferences, default to enabled
		if (!prefs || !prefs.enabledTypes) return true;

		// Check if type is in enabled list (or list is empty = all enabled)
		return prefs.enabledTypes.length === 0 || prefs.enabledTypes.includes(type);
	}

	/**
	 * Check if notification is duplicate (within last 10 minutes)
	 */
	private async isDuplicate(notificationId: string): Promise<boolean> {
		const tenMinutesAgo = new Date(Date.now() - 600000);

		const existing = await db
			.select()
			.from(notificationEventLog)
			.where(
				and(
					eq(notificationEventLog.notificationId, notificationId),
					gt(notificationEventLog.createdAt, tenMinutesAgo),
				),
			)
			.limit(1);

		return existing.length > 0;
	}

	/**
	 * Check if notification should be grouped
	 */
	private async shouldGroup(
		event: NotificationEvent,
		config: (typeof notificationTriggers)[string],
	): Promise<boolean> {
		if (!config.grouping?.enabled) return false;

		const tenMinutesAgo = new Date(Date.now() - 600000);

		// Count recent notifications of same type to same user
		const recentCount = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(notificationEventLog)
			.where(
				and(
					eq(notificationEventLog.userId, event.userId),
					eq(notificationEventLog.type, event.type),
					gt(notificationEventLog.createdAt, tenMinutesAgo),
				),
			);

		const count = recentCount[0]?.count || 0;
		return count >= (config.grouping?.batchLimit || 3);
	}

	/**
	 * Add notification to grouping window
	 */
	private async addToGroup(
		event: NotificationEvent,
		config: (typeof notificationTriggers)[string],
		notificationId: string,
	): Promise<void> {
		if (!config.grouping) return;

		const groupKey = config.grouping.groupingKey(event.metadata);
		const windowEnd = new Date(
			Date.now() + (config.grouping.groupingWindow || 600000),
		);

		// Find existing group or create new one
		const existingGroup = await db.query.notificationGroupings.findFirst({
			where: and(
				eq(notificationGroupings.userId, event.userId),
				eq(notificationGroupings.type, event.type),
				eq(notificationGroupings.groupKey, groupKey),
				eq(notificationGroupings.status, "pending"),
			),
		});

		if (existingGroup) {
			// Add to existing group
			const updatedIds = [...existingGroup.notificationIds, notificationId];
			await db
				.update(notificationGroupings)
				.set({
					notificationIds: updatedIds,
					count: updatedIds.length,
				})
				.where(eq(notificationGroupings.id, existingGroup.id));
		} else {
			// Create new group
			await db.insert(notificationGroupings).values({
				userId: event.userId,
				type: event.type,
				groupKey,
				notificationIds: [notificationId],
				count: 1,
				windowEnd,
				status: "pending",
			});
		}
	}

	/**
	 * Track notification event for analytics
	 */
	async trackEvent(
		userId: string,
		notificationId: string,
		type: string,
		event: NotificationEventName,
		metadata?: NotificationMetadata,
	): Promise<void> {
		await db.insert(notificationEventLog).values({
			userId,
			notificationId,
			type,
			event,
			errorMessage:
				event === "failed" && metadata?.error
					? String(metadata.error)
					: undefined,
			metadata:
				metadata as unknown as typeof notificationEventLog.$inferInsert.metadata,
		});
	}
}

// Export singleton
export const notificationOrchestrator = new NotificationOrchestrator();
