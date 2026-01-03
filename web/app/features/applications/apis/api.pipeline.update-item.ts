import type { ActionFunctionArgs } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { actionHandler, BadRequestError, InternalError } from "~/shared/lib";
import { pipelineService } from "../domain/pipeline.service.server";
import type { PipelineStatus } from "../domain/pipeline.types";

/**
 * PATCH /api/pipeline/items/update
 *
 * Updates pipeline item status and order (from drag-and-drop)
 * Request body (JSON):
 * - itemId: string (required)
 * - stage: PipelineStatus (required)
 * - orderIndex?: number
 */
export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	const _userId = await requireUserId(request);

	const method = request.method;
	if (method !== "PATCH") {
		throw new BadRequestError("Method not allowed");
	}

	try {
		const body = await request.json();
		const { itemId, stage, orderIndex } = body;

		if (!itemId) {
			throw new BadRequestError("Missing required field: itemId");
		}

		if (!stage) {
			throw new BadRequestError("Missing required field: stage");
		}

		// Update item status (and optionally order)
		const updated = await pipelineService.updateItemStatus(
			itemId,
			stage as PipelineStatus,
			orderIndex,
		);

		return { success: true, item: updated };
	} catch (error) {
		console.error("[Pipeline Update API] Failed:", error);
		const message =
			error instanceof Error ? error.message : "Failed to update item";
		throw new InternalError(message);
	}
});
