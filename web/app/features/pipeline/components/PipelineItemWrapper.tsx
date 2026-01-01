import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, ReactNode } from "react";

interface PipelineItemWrapperProps {
	itemId: string;
	children?: (isDragging: boolean) => ReactNode;
}

/**
 * PipelineItemWrapper - Wraps an item with dnd-kit's useSortable hook
 * Enables drag-and-drop functionality for individual items
 */
export function PipelineItemWrapper({
	itemId,
	children,
}: PipelineItemWrapperProps) {
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
			{children ? children(isDragging) : null}
		</div>
	);
}
