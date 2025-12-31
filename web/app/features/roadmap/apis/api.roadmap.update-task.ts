import type { ActionFunctionArgs } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { actionHandler, BadRequestError, InternalError } from "~/shared/lib";
import type { KanbanColumn } from "../components/kanban.types";
import { updateTaskPosition } from "../services/roadmap.server";

/**
 * PATCH /api/roadmap/tasks/update
 *
 * Updates a task's position (kanban column and/or order index)
 */
export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);

	if (request.method !== "PATCH") {
		throw new BadRequestError("Method not allowed");
	}

	try {
		const body = await request.json();
		const { taskId, kanbanColumn, orderIndex } = body;

		if (!taskId || !kanbanColumn) {
			throw new BadRequestError("Missing required fields: taskId, kanbanColumn");
		}

		const updatedTask = await updateTaskPosition(taskId, userId, {
			kanbanColumn: kanbanColumn as KanbanColumn,
			orderIndex: orderIndex !== undefined ? parseFloat(orderIndex) : undefined,
		});

		return { success: true, task: updatedTask };
	} catch (error) {
		console.error("[API] Update task error:", error);
		const message =
			error instanceof Error ? error.message : "Failed to update task";
		throw new InternalError(message);
	}
});
