import { KanbanCard } from "~/shared/components/dnd-kanban";
import type { PipelineItem } from "../domain/pipeline.types";

interface PipelineCardProps {
	item: PipelineItem;
	isDragging?: boolean;
	isOverlay?: boolean;
}

export function PipelineCard({
	item,
	isDragging,
	isOverlay,
}: PipelineCardProps) {
	return (
		<KanbanCard isDragging={isDragging} isOverlay={isOverlay}>
			<div className="space-y-2">
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1">
						<h4 className="heading-5 line-clamp-1 text-sm">{item.company}</h4>
						<p className="text-gray-600 text-xs">{item.position}</p>
					</div>
				</div>

				{item.date && (
					<p className="caption text-gray-600">
						지원일: {new Date(item.date).toLocaleDateString("ko-KR")}
					</p>
				)}

				{item.nextAction && (
					<div className="rounded bg-blue-50 px-2 py-1.5">
						<p className="caption text-blue-700">다음: {item.nextAction}</p>
					</div>
				)}
			</div>
		</KanbanCard>
	);
}
