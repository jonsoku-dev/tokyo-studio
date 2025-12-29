import { data } from "react-router";
import type { Route } from "./+types/task.$id";
import { requireUserId } from "~/features/auth/utils/session.server";
import { updateTaskColumn } from "../services/roadmap.server";
import type { KanbanColumn } from "../services/roadmap.server";

export async function action({ request, params }: Route.ActionArgs) {
	const userId = await requireUserId(request);
	const taskId = params.id;

	if (!taskId) {
		return data({ error: "Task ID required" }, { status: 400 });
	}

	if (request.method === "PATCH") {
		const body = await request.json();
		const { kanbanColumn } = body as { kanbanColumn: KanbanColumn };

		if (!kanbanColumn || !["todo", "in_progress", "completed"].includes(kanbanColumn)) {
			return data({ error: "Invalid kanban column" }, { status: 400 });
		}

		const task = await updateTaskColumn(taskId, userId, kanbanColumn);
		return data({ success: true, task });
	}

	return data({ error: "Method not allowed" }, { status: 405 });
}
