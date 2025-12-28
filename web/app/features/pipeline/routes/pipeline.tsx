import { useLoaderData } from "react-router";
import { Shell } from "~/shared/components/layout/Shell";
import { requireUserId } from "../../auth/utils/session.server";
import { KanbanBoard } from "../components/KanbanBoard";
import { pipelineService } from "../domain/pipeline.service.server";
import type { PipelineItem } from "../domain/pipeline.types";

export function meta() {
	return [{ title: "Pipeline - Japan IT Job" }];
}

export async function loader({ request }: { request: Request }) {
	await requireUserId(request);
	const items = await pipelineService.getItems();
	return { items };
}

export async function action({ request }: { request: Request }) {
	await requireUserId(request);
	const formData = await request.formData();
	const id = String(formData.get("id"));
	const stage = String(formData.get("stage"));

	// Validation could go here
	await pipelineService.updateItemStatus(id, stage as any);
	return null;
}

export default function Pipeline() {
	const { items } = useLoaderData<{ items: PipelineItem[] }>();

	return (
		<Shell>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
					<button
						type="button"
						className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700"
					>
						Add Application
					</button>
				</div>

				<KanbanBoard items={items} />
			</div>
		</Shell>
	);
}
