import { KanbanBoard as GenericKanbanBoard } from "~/shared/components/dnd-kanban";
import { useUpdateTaskMutation } from "../hooks/useUpdateTaskMutation";
import { type RoadmapTask, useRoadmapStore } from "../stores/roadmap.store";
import type { KanbanColumnConfig } from "./kanban.types";
import { TaskCard } from "./TaskCard";
import { TaskItemWrapper } from "./TaskItemWrapper";

interface KanbanBoardClientProps {
	tasks: RoadmapTask[];
	columns: KanbanColumnConfig[];
}

/**
 * KanbanBoardClient - Roadmap-specific kanban board
 * Uses the generic KanbanBoard with Roadmap customization
 */
export function KanbanBoardClient({ tasks, columns }: KanbanBoardClientProps) {
	const updateTaskMutation = useUpdateTaskMutation();
	const roadmapStore = useRoadmapStore();

	const handleSaveChanges = async (
		changes: Array<{ itemId: string; toColumn: string }>,
	) => {
		console.log("[SaveChanges] Saving changes:", changes);

		try {
			await Promise.all(
				changes.map((change) =>
					updateTaskMutation.mutateAsync({
						taskId: change.itemId,
						kanbanColumn: change.toColumn as
							| "todo"
							| "in_progress"
							| "completed",
						orderIndex: 0,
					}),
				),
			);

			console.log("[SaveChanges] All changes saved successfully");

			// After successful save, sync store with current state
			const currentDisplayTasks = tasks.map((task) => {
				const change = changes.find((c) => c.itemId === task.id);
				return change
					? {
							...task,
							kanbanColumn: change.toColumn as
								| "todo"
								| "in_progress"
								| "completed",
						}
					: task;
			});

			roadmapStore.setTasks(currentDisplayTasks);
		} catch (error) {
			console.error("[SaveChanges] Failed:", error);
			throw error;
		}
	};

	return (
		<GenericKanbanBoard<RoadmapTask, "todo" | "in_progress" | "completed">
			items={tasks}
			columns={columns}
			getItemColumn={(task) =>
				task.kanbanColumn as "todo" | "in_progress" | "completed"
			}
			setItemColumn={(task, column) => ({
				...task,
				kanbanColumn: column,
			})}
			renderCard={(task) => <TaskCard task={task} />}
			renderItemWrapper={(task, card) => (
				<TaskItemWrapper task={task}>{() => card}</TaskItemWrapper>
			)}
			onSaveChanges={handleSaveChanges}
		/>
	);
}
