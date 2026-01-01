import type { useSortable } from "@dnd-kit/sortable";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { KanbanCard } from "~/shared/components/dnd-kanban";
import type { PipelineItem } from "../domain/pipeline.types";

interface PipelineCardProps {
	item: PipelineItem;
	isDragging?: boolean;
	isOverlay?: boolean;
	listeners?: ReturnType<typeof useSortable>["listeners"];
	attributes?: ReturnType<typeof useSortable>["attributes"];
	onEdit?: (item: PipelineItem) => void;
	onDelete?: (item: PipelineItem) => void;
}

export function PipelineCard({
	item,
	isDragging,
	isOverlay,
	listeners,
	attributes,
	onEdit,
	onDelete,
}: PipelineCardProps) {
	return (
		<KanbanCard isDragging={isDragging} isOverlay={isOverlay}>
			<div className="group relative flex gap-3">
				{/* Drag Handle */}
				<button
					type="button"
					className="mt-1 cursor-grab text-gray-400 opacity-0 transition-opacity hover:text-gray-600 active:cursor-grabbing group-hover:opacity-100"
					aria-label="Drag to move"
					{...listeners}
					{...attributes}
				>
					<GripVertical className="h-5 w-5" />
				</button>

				{/* Content */}
				<div className="flex-1 space-y-2">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0 flex-1">
							<h4 className="heading-5 truncate text-sm">{item.company}</h4>
							<p className="truncate text-gray-600 text-xs">{item.position}</p>
						</div>
					</div>

					{item.date && (
						<p className="caption text-gray-600">
							지원일: {new Date(item.date).toLocaleDateString("ko-KR")}
						</p>
					)}

					{item.nextAction && (
						<div className="inline-flex rounded bg-blue-50 px-2 py-1">
							<p className="caption font-medium text-blue-700">
								다음: {item.nextAction}
							</p>
						</div>
					)}

					{item.resume && (
						<div
							className="flex items-center gap-1 text-gray-500 text-xs"
							title={item.resume.title || "Attached Resume"}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="h-3 w-3"
								aria-label="Resume Document"
							>
								<title>Resume Document</title>
								<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
								<polyline points="14 2 14 8 20 8" />
							</svg>
							<span className="max-w-[120px] truncate">
								{item.resume.title}
							</span>
						</div>
					)}
				</div>

				{/* Action Buttons (Visible on Hover) */}
				<div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onEdit?.(item);
						}}
						className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
						aria-label="Edit"
					>
						<Pencil className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onDelete?.(item);
						}}
						className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
						aria-label="Delete"
					>
						<Trash2 className="h-4 w-4" />
					</button>
				</div>
			</div>
		</KanbanCard>
	);
}
