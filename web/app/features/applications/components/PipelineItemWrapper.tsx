import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, ReactNode } from "react";

interface RenderPropArgs {
	isDragging: boolean;
	listeners: ReturnType<typeof useSortable>["listeners"];
	attributes: ReturnType<typeof useSortable>["attributes"];
}

interface PipelineItemWrapperProps {
	itemId: string;
	children?: (args: RenderPropArgs) => ReactNode;
}

/**
 * PipelineItemWrapper - Wraps an item with dnd-kit's useSortable hook
 * Enables drag-and-drop functionality for individual items, passing listeners down
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
		<div ref={setNodeRef} style={style} className="touch-none">
			{children ? children({ isDragging, listeners, attributes }) : null}
		</div>
	);
}
