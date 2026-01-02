import { db } from "@itcom/db/client";
import { notificationQueue } from "@itcom/db/schema";
import { and, eq, lt } from "drizzle-orm";
import type { NotificationPayload } from "../types";
import { pushService } from "./push.server";

interface ProcessQueueOptions {
	maxBatch?: number;
	dryRun?: boolean;
}

interface ProcessQueueMetrics {
	processed: number;
	failed: number;
	skipped: number;
	deleted: number;
	duration: number;
}

/**
 * Queue processor service
 * Processes pending notifications with retry logic and exponential backoff
 */
class QueueProcessor {
	// Retry delays in milliseconds: 1min, 5min, 15min
	private readonly RETRY_DELAYS = [60000, 300000, 900000];

	// Maximum retry attempts before marking as failed
	private readonly MAX_RETRIES = 3;

	// Stale notification threshold (24 hours)
	private readonly STALE_THRESHOLD = 86400000;

	/**
	 * Process pending notifications from the queue
	 */
	async processQueue(
		options: ProcessQueueOptions = {},
	): Promise<ProcessQueueMetrics> {
		const startTime = Date.now();
		const { maxBatch = 100, dryRun = false } = options;

		const metrics: ProcessQueueMetrics = {
			processed: 0,
			failed: 0,
			skipped: 0,
			deleted: 0,
			duration: 0,
		};

		try {
			// 1. Fetch pending notifications
			const pending = await this.fetchPendingNotifications(maxBatch);

			console.log(
				`[QueueProcessor] Found ${pending.length} pending notifications`,
			);

			if (dryRun) {
				console.log("[QueueProcessor] DRY RUN - No actual processing");
				return {
					...metrics,
					skipped: pending.length,
					duration: Date.now() - startTime,
				};
			}

			// 2. Process each notification
			for (const item of pending) {
				try {
					await this.processNotification(item);
					metrics.processed++;
				} catch (error) {
					console.error(
						`[QueueProcessor] Error processing notification ${item.id}:`,
						error,
					);
					await this.handleFailure(item, error);
					metrics.failed++;
				}
			}

			// 3. Clean up stale notifications
			const deletedCount = await this.cleanupStaleNotifications();
			metrics.deleted = deletedCount;

			console.log(
				`[QueueProcessor] Completed - Processed: ${metrics.processed}, Failed: ${metrics.failed}, Deleted: ${metrics.deleted}`,
			);
		} catch (error) {
			console.error("[QueueProcessor] Fatal error:", error);
			throw error;
		} finally {
			metrics.duration = Date.now() - startTime;
		}

		return metrics;
	}

	/**
	 * Fetch pending notifications from queue
	 */
	private async fetchPendingNotifications(limit: number) {
		return db.query.notificationQueue.findMany({
			where: and(
				eq(notificationQueue.status, "pending"),
				lt(notificationQueue.scheduledAt, new Date()),
			),
			limit,
			orderBy: (queue, { asc }) => [asc(queue.scheduledAt)],
		});
	}

	/**
	 * Process a single notification
	 */
	private async processNotification(
		item: Awaited<ReturnType<typeof this.fetchPendingNotifications>>[0],
	) {
		// Send notification
		await pushService.sendPushNotification(
			item.userId,
			item.payload as unknown as NotificationPayload,
		);

		// Delete from queue on success
		await db.delete(notificationQueue).where(eq(notificationQueue.id, item.id));

		console.log(`[QueueProcessor] Successfully sent notification ${item.id}`);
	}

	/**
	 * Handle notification send failure with retry logic
	 */
	private async handleFailure(
		item: Awaited<ReturnType<typeof this.fetchPendingNotifications>>[0],
		_error: unknown,
	) {
		const newRetryCount = item.retryCount + 1;

		if (newRetryCount >= this.MAX_RETRIES) {
			// Max retries reached - mark as failed
			await db
				.update(notificationQueue)
				.set({
					status: "failed",
				})
				.where(eq(notificationQueue.id, item.id));

			console.log(
				`[QueueProcessor] Notification ${item.id} marked as failed after ${newRetryCount} retries`,
			);
		} else {
			// Schedule retry with exponential backoff
			const delay =
				this.RETRY_DELAYS[newRetryCount - 1] ||
				this.RETRY_DELAYS[this.RETRY_DELAYS.length - 1];
			const nextScheduledAt = new Date(Date.now() + delay);

			await db
				.update(notificationQueue)
				.set({
					retryCount: newRetryCount,
					scheduledAt: nextScheduledAt,
				})
				.where(eq(notificationQueue.id, item.id));

			console.log(
				`[QueueProcessor] Scheduled retry ${newRetryCount}/${this.MAX_RETRIES} for notification ${item.id} at ${nextScheduledAt.toISOString()}`,
			);
		}
	}

	/**
	 * Clean up stale notifications (older than 24 hours)
	 */
	private async cleanupStaleNotifications(): Promise<number> {
		const staleThreshold = new Date(Date.now() - this.STALE_THRESHOLD);

		const result = await db
			.delete(notificationQueue)
			.where(lt(notificationQueue.createdAt, staleThreshold))
			.returning({ id: notificationQueue.id });

		if (result.length > 0) {
			console.log(
				`[QueueProcessor] Deleted ${result.length} stale notifications`,
			);
		}

		return result.length;
	}
}

// Export singleton
export const queueProcessor = new QueueProcessor();
