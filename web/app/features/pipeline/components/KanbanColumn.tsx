import type { PipelineItem } from "../domain/pipeline.types";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
	stage: string;
	items: PipelineItem[];
}

export function KanbanColumn({ stage, items }: KanbanColumnProps) {
	return (
		<div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-3 min-w-[280px]">
			<h3 className="body-sm text-gray-600 uppercase tracking-wider flex items-center justify-between">
				{stage}
				<span className="bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 text-xs">
					{items.length}
				</span>
			</h3>

			<div className="flex-1 overflow-y-auto stack-sm">
				{items.map((item) => (
					<KanbanCard key={item.id} item={item} />
				))}
			</div>
		</div>
	);
}
