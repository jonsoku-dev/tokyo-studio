import type { PipelineItem } from "../domain/pipeline.types";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
	stage: string;
	items: PipelineItem[];
}

export function KanbanColumn({ stage, items }: KanbanColumnProps) {
	return (
		<div className="flex min-w-[280px] flex-col gap-3 rounded-lg bg-gray-50 p-3">
			<h3 className="body-sm flex items-center justify-between text-gray-600 uppercase tracking-wider">
				{stage}
				<span className="rounded-full bg-gray-200 px-2 py-0.5 text-gray-600 text-xs">
					{items.length}
				</span>
			</h3>

			<div className="stack-sm flex-1 overflow-y-auto">
				{items.map((item) => (
					<KanbanCard key={item.id} item={item} />
				))}
			</div>
		</div>
	);
}
