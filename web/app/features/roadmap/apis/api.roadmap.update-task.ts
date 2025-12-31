import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import type { KanbanColumn } from "../components/kanban.types";
import { updateTaskPosition } from "../services/roadmap.server";

/**
 * PATCH /api/roadmap/tasks/update
 *
 * Updates a task's position (kanban column and/or order index)
 */
export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request);

	if (request.method !== "PATCH") {
		return data({ error: "Method not allowed" }, { status: 405 });
	}

	try {
		const body = await request.json();
		const { taskId, kanbanColumn, orderIndex } = body;

		if (!taskId || !kanbanColumn) {
			return data(
				{ error: "Missing required fields: taskId, kanbanColumn" },
				{ status: 400 },
			);
		}

		const updatedTask = await updateTaskPosition(taskId, userId, {
			kanbanColumn: kanbanColumn as KanbanColumn,
			orderIndex: orderIndex !== undefined ? parseFloat(orderIndex) : undefined,
		});

		return data({ success: true, task: updatedTask });
	} catch (error) {
		console.error("[API] Update task error:", error);
		const message =
			error instanceof Error ? error.message : "Failed to update task";
		return data({ error: message }, { status: 500 });
	}
}
