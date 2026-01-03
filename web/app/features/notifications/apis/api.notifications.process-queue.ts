import { actionHandler } from "~/shared/lib";
import { groupProcessor } from "../services/group-processor.server";
import { queueProcessor } from "../services/queue-processor.server";
import type { Route } from "./+types/api.notifications.process-queue.server";

export const action = actionHandler(async ({ request }: Route.ActionArgs) => {
	// Check authorization header for CRON_SECRET
	const authHeader = request.headers.get("Authorization");
	const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

	if (!process.env.CRON_SECRET) {
		console.error("[ProcessQueue] CRON_SECRET not configured");
		return { error: "Service unavailable" };
	}

	if (authHeader !== expectedAuth) {
		console.error("[ProcessQueue] Unauthorized request");
		return { error: "Unauthorized" };
	}

	// Parse request body
	const formData = await request.formData();
	const maxBatchStr = formData.get("maxBatch");
	const dryRunStr = formData.get("dryRun");

	const maxBatch = maxBatchStr ? Number(maxBatchStr) : undefined;
	const dryRun = dryRunStr === "true";

	// Process queue
	const queueMetrics = await queueProcessor.processQueue({ maxBatch, dryRun });

	// Process expired groups
	const groupMetrics = await groupProcessor.processExpiredGroups();

	return {
		success: true,
		queue: queueMetrics,
		groups: groupMetrics,
	};
});
