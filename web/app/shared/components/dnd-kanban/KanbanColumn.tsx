import { useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import type { ReactNode } from "react";

interface KanbanColumnProps {
	id: string;
	title: string;
	count: number;
	children: ReactNode;
	layout?: "grid" | "scroll";
}

/**
 * KanbanColumn - A droppable column for the kanban board
 */
export function KanbanColumn({
	id,
	title,
	count,
	children,
	layout = "grid",
}: KanbanColumnProps) {
	const { setNodeRef, isOver } = useDroppable({
		id,
		data: {
			type: "container",
		},
	});

	// Determine column width class for scroll layout
	const scrollLayoutClass = layout === "scroll" ? "w-80 flex-shrink-0" : "";

	return (
		<SortableContext items={[]}>
			<div
				ref={setNodeRef}
				className={`flex min-h-[500px] flex-col rounded-2xl bg-gray-50/50 p-4 transition-colors ${scrollLayoutClass} ${
					isOver ? "bg-indigo-50/50 ring-2 ring-indigo-200" : ""
				}`}
			>
				{/* Column Header */}
				<div className="mb-4 flex items-center justify-between">
					<h3 className="heading-5">{title}</h3>
					<span className="caption rounded bg-white px-2 py-1">{count}</span>
				</div>

				{/* Items Container */}
				<div className="flex-1 space-y-3 overflow-y-auto">
					{count === 0 ? (
						<div className="flex h-32 items-center justify-center rounded-lg border-2 border-gray-200 border-dashed text-gray-400">
							아이템을 여기에 드롭하세요
						</div>
					) : (
						children
					)}
				</div>
			</div>
		</SortableContext>
	);
}
