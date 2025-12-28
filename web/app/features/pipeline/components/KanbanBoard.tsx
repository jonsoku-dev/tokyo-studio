import type { PipelineItem } from "../domain/pipeline.types";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
	items: PipelineItem[];
}

const STAGES = [
	"interested",
	"applied",
	"assignment",
	"interview_1",
	"interview_2",
	"interview_3",
	"offer",
	"visa_coe",
	"joined",
	"rejected",
	"withdrawn",
];

export function KanbanBoard({ items }: KanbanBoardProps) {
	return (
		<div className="flex gap-4 h-[calc(100vh-200px)] overflow-x-auto pb-4 w-full items-start">
			{STAGES.map((stage) => (
				<KanbanColumn
					key={stage}
					stage={stage}
					items={items.filter((i) => i.stage === stage)}
				/>
			))}
		</div>
	);
}
