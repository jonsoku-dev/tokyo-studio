import type { ReactNode } from "react";

interface KanbanCardProps {
	children: ReactNode;
	isDragging?: boolean;
	isOverlay?: boolean;
}

export function KanbanCard({
	children,
	isDragging,
	isOverlay,
}: KanbanCardProps) {
	return (
		<div
			className={`rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
				isDragging ? "opacity-50" : ""
			} ${isOverlay ? "shadow-lg" : ""}`}
		>
			{children}
		</div>
	);
}
