import type { ActionFunctionArgs } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { actionHandler, BadRequestError } from "~/shared/lib";
import type { KanbanColumn } from "../services/roadmap.server";
import { updateTaskColumn } from "../services/roadmap.server";
import type { Route } from "./+types/api.task.$id.server";

export const action = actionHandler(
	async ({ request, params }: ActionFunctionArgs) => {
		const userId = await requireUserId(request);
		const taskId = params.id;

		if (!taskId) {
			throw new BadRequestError("Task ID required");
		}

		if (request.method === "PATCH") {
			const body = await request.json();
			const { kanbanColumn } = body as { kanbanColumn: KanbanColumn };

			if (
				!kanbanColumn ||
				!["todo", "in_progress", "completed"].includes(kanbanColumn)
			) {
				throw new BadRequestError("Invalid kanban column");
			}

			const task = await updateTaskColumn(taskId, userId, kanbanColumn);
			return { success: true, task };
		}

		throw new BadRequestError("Method not allowed");
	},
);
