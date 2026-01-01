import { KanbanCard } from "~/shared/components/dnd-kanban";
import type { RoadmapTask } from "../stores/roadmap.store";

interface TaskCardProps {
	task: RoadmapTask;
	isDragging?: boolean;
	isOverlay?: boolean;
}

export function TaskCard({ task, isDragging, isOverlay }: TaskCardProps) {
	return (
		<KanbanCard isDragging={isDragging} isOverlay={isOverlay}>
			<div className="space-y-2">
				<div className="flex items-start justify-between gap-2">
					<h4 className="heading-5 line-clamp-2 flex-1 text-sm">
						{task.title}
					</h4>
					<span className="inline-flex flex-shrink-0 rounded bg-primary-50 px-1.5 py-0.5 font-medium text-primary-700 text-xs">
						{task.priority}
					</span>
				</div>

				{task.description && (
					<p className="caption line-clamp-2">{task.description}</p>
				)}

				<div className="flex items-center justify-between gap-2 border-gray-100 border-t pt-2">
					<span className="caption">{task.category}</span>
					{task.estimatedMinutes > 0 && (
						<span className="caption">{task.estimatedMinutes}min</span>
					)}
				</div>
			</div>
		</KanbanCard>
	);
}
