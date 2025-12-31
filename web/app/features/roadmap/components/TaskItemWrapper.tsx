import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties } from "react";
import type { KanbanTask } from "./kanban.types";
import { TaskCard } from "./TaskCard";

interface TaskItemWrapperProps {
	task: KanbanTask;
	isDragging?: boolean;
}

/**
 * TaskItemWrapper - Wraps a task with dnd-kit's useSortable hook
 * Enables drag-and-drop functionality for individual tasks
 */
export function TaskItemWrapper({ task, isDragging }: TaskItemWrapperProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging: isSortableDragging,
	} = useSortable({
		id: task.id,
	});

	const style: CSSProperties = {
		transform: transform ? CSS.Transform.toString(transform) : undefined,
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="touch-none cursor-grab active:cursor-grabbing"
		>
			<TaskCard task={task} isDragging={isSortableDragging || isDragging} />
		</div>
	);
}
