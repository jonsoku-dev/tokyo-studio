import { useFetcher } from "react-router";
import type { PipelineItem } from "../domain/pipeline.types";

interface KanbanCardProps {
	item: PipelineItem;
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

export function KanbanCard({ item }: KanbanCardProps) {
	const fetcher = useFetcher();

	// Optimistic UI
	const stage = fetcher.formData
		? String(fetcher.formData.get("stage"))
		: item.stage;

	return (
		<div className="bg-white p-3 rounded shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow group">
			<div className="flex justify-between items-start mb-2">
				<h4
					className="heading-5 truncate"
					title={item.position}
				>
					{item.position}
				</h4>
			</div>
			<div className="body-sm mb-2 truncate" title={item.company}>
				{item.company}
			</div>

			{item.nextAction && (
				<div className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded mb-2">
					Next: {item.nextAction}
				</div>
			)}

			<div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
				<div className="caption">
					{new Date(item.date).toLocaleDateString()}
				</div>

				<fetcher.Form method="post">
					<input type="hidden" name="id" value={item.id} />
					<select
						name="stage"
						defaultValue={stage}
						className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white max-w-[100px]"
						onChange={(e) => fetcher.submit(e.target.form)}
					>
						{STAGES.map((s) => (
							<option key={s} value={s}>
								{s.replace("_", " ")}
							</option>
						))}
					</select>
				</fetcher.Form>
			</div>
		</div>
	);
}
