import type { KanbanTask } from "./kanban.types";

interface TaskCardProps {
	task: KanbanTask;
	isDragging?: boolean;
	isOverlay?: boolean;
}

export function TaskCard({ task, isDragging, isOverlay }: TaskCardProps) {
	return (
		<div
			className={`
				bg-white rounded-lg border border-gray-200 p-3 shadow-sm
				hover:shadow-md transition-shadow
				${isDragging ? "opacity-50" : ""}
				${isOverlay ? "shadow-lg" : ""}
			`}
		>
			<div className="stack-sm">
				<div className="flex items-start justify-between gap-2">
					<h4 className="heading-5 text-sm flex-1 line-clamp-2">
						{task.title}
					</h4>
					<span className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-primary-50 text-primary-700 flex-shrink-0">
						{task.priority}
					</span>
				</div>

				{task.description && (
					<p className="caption line-clamp-2">
						{task.description}
					</p>
				)}

				<div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
					<span className="caption">{task.category}</span>
					{task.estimatedMinutes > 0 && (
						<span className="caption">
							{task.estimatedMinutes}min
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
