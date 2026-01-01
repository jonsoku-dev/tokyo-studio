import { useState } from "react";
import { useLoaderData } from "react-router";

import { requireUserId } from "../../auth/utils/session.server";
import { AddApplicationModal } from "../components/AddApplicationModal";
import { KanbanBoard } from "../components/KanbanBoardWrapper";
import { pipelineService } from "../domain/pipeline.service.server";
import type {
	PipelineItem,
	PipelineStage,
	PipelineStatus,
} from "../domain/pipeline.types";

export function meta() {
	return [{ title: "Pipeline - Japan IT Job" }];
}

export async function loader({ request }: { request: Request }) {
	const userId = await requireUserId(request);
	const [items, stages] = await Promise.all([
		pipelineService.getItems(userId),
		pipelineService.getStages(),
	]);
	return { items, stages };
}

export async function action({ request }: { request: Request }) {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const intent = String(formData.get("intent") || "update");

	if (intent === "add") {
		const company = String(formData.get("company"));
		const position = String(formData.get("position"));
		const stage = String(formData.get("stage")) as PipelineStatus;
		const date = String(formData.get("date"));
		const nextAction = formData.get("nextAction")
			? String(formData.get("nextAction"))
			: null;

		await pipelineService.addItem(userId, {
			company,
			position,
			stage,
			date,
			nextAction,
		});
		return { success: true };
	}

	const id = String(formData.get("id"));
	const stage = String(formData.get("stage"));

	// biome-ignore lint/suspicious/noExplicitAny: Temporary cast until types are aligned
	await pipelineService.updateItemStatus(id, stage as any);
	return { success: true };
}

export default function Pipeline() {
	const { items, stages } = useLoaderData<{
		items: PipelineItem[];
		stages: PipelineStage[];
	}>();
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);

	return (
		<div className="stack">
			<div className="flex items-center justify-between">
				<h1 className="heading-3">Pipeline</h1>
				<button
					type="button"
					onClick={() => setIsAddModalOpen(true)}
					className="rounded-md bg-primary-600 px-4 py-2 font-medium text-sm text-white shadow-sm transition-colors hover:bg-primary-700"
				>
					Add Application
				</button>
			</div>

			<KanbanBoard items={items} stages={stages} />

			<AddApplicationModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
			stages={stages}
			/>
		</div>
	);
}
