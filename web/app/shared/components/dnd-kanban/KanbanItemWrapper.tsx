import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, ReactNode } from "react";

interface KanbanItemWrapperProps {
	itemId: string;
	children: ReactNode | ((isDragging: boolean) => ReactNode);
}

/**
 * KanbanItemWrapper - Wraps an item with dnd-kit's useSortable hook
 * Enables drag-and-drop functionality for individual items
 */
export function KanbanItemWrapper({
	itemId,
	children,
}: KanbanItemWrapperProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: itemId,
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
			className="cursor-grab touch-none active:cursor-grabbing"
		>
			{typeof children === "function" ? children(isDragging) : children}
		</div>
	);
}
