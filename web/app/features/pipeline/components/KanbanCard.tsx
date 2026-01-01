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
		<div className="group cursor-move rounded border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
			<div className="mb-2 flex items-start justify-between">
				<h4 className="heading-5 truncate" title={item.position}>
					{item.position}
				</h4>
			</div>
			<div className="body-sm mb-2 truncate" title={item.company}>
				{item.company}
			</div>

			{item.nextAction && (
				<div className="mb-2 rounded bg-primary-50 px-2 py-1 text-primary-700 text-xs">
					Next: {item.nextAction}
				</div>
			)}

			<div className="mt-2 flex items-center justify-between border-gray-100 border-t pt-2 opacity-0 transition-opacity group-hover:opacity-100">
				<div className="caption">
					{new Date(item.date).toLocaleDateString()}
				</div>

				<fetcher.Form method="post">
					<input type="hidden" name="id" value={item.id} />
					<select
						name="stage"
						defaultValue={stage}
						className="max-w-[100px] rounded border border-gray-200 bg-white px-1 py-0.5 text-xs"
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
