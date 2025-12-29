/**
 * SPEC 006: Storage Cleanup Scheduler
 *
 * Sets up cron jobs for automatic storage maintenance
 * - Runs daily at 2 AM to cleanup orphaned and deleted files
 *
 * Usage:
 * Import this file in your server entry point to start the scheduler
 * Example: import '~/features/storage/jobs/scheduler.server';
 */

import { runStorageCleanup } from "./cleanup-orphaned-files.server";

// Simple interval-based scheduler (runs every 24 hours)
// In production, consider using a proper cron library like node-cron
// or external job scheduler like AWS EventBridge

const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Start the storage cleanup scheduler
 * Runs cleanup daily
 */
export function startCleanupScheduler() {
	console.log("[SCHEDULER] Starting storage cleanup scheduler");
	console.log(`[SCHEDULER] Cleanup will run every 24 hours`);

	// Run cleanup immediately on startup (optional)
	// runStorageCleanup().catch(console.error);

	// Schedule periodic cleanup
	const intervalId = setInterval(async () => {
		console.log("[SCHEDULER] Scheduled cleanup triggered");
		try {
			await runStorageCleanup();
		} catch (error) {
			console.error("[SCHEDULER] Scheduled cleanup failed:", error);
		}
	}, CLEANUP_INTERVAL);

	// Cleanup on process termination
	process.on("SIGTERM", () => {
		console.log("[SCHEDULER] Stopping storage cleanup scheduler");
		clearInterval(intervalId);
	});

	return intervalId;
}

/**
 * Alternative: Use node-cron for more precise scheduling
 *
 * Example with node-cron (install: pnpm add node-cron @types/node-cron):
 *
 * import cron from 'node-cron';
 *
 * export function startCleanupScheduler() {
 *   // Run daily at 2:00 AM
 *   cron.schedule('0 2 * * *', async () => {
 *     console.log('[SCHEDULER] Running daily cleanup at 2 AM');
 *     try {
 *       await runStorageCleanup();
 *     } catch (error) {
 *       console.error('[SCHEDULER] Cleanup failed:', error);
 *     }
 *   });
 * }
 */
