import type { ActionFunctionArgs } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { actionHandler, BadRequestError, InternalError } from "~/shared/lib";
import { pipelineService } from "../domain/pipeline.service.server";
import type { PipelineStatus } from "../domain/pipeline.types";

/**
 * PATCH /api/pipeline/items/update
 *
 * Updates a pipeline item's stage
 */
export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	await requireUserId(request);

	if (request.method !== "PATCH") {
		throw new BadRequestError("Method not allowed");
	}

	try {
		const body = await request.json();
		const { itemId, stage: toColumn, orderIndex } = body;

		if (!itemId || !toColumn) {
			throw new BadRequestError("Missing required fields: itemId, toColumn");
		}

		const updated = await pipelineService.updateItemStatus(
			itemId,
			toColumn as PipelineStatus,
			orderIndex,
		);

		return { success: true, item: updated };
	} catch (error) {
		console.error("[Pipeline API] Failed to update item:", error);
		const message =
			error instanceof Error ? error.message : "Failed to update item";
		throw new InternalError(message);
	}
});
