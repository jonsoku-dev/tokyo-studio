import { useState } from "react";
import { useLoaderData } from "react-router";
import { Shell } from "~/shared/components/layout/Shell";
import { requireUserId } from "../../auth/utils/session.server";
import { AddApplicationModal } from "../components/AddApplicationModal";
import { KanbanBoard } from "../components/KanbanBoard";
import { pipelineService } from "../domain/pipeline.service.server";
import type { PipelineItem, PipelineStatus } from "../domain/pipeline.types";

export function meta() {
	return [{ title: "Pipeline - Japan IT Job" }];
}

export async function loader({ request }: { request: Request }) {
	const userId = await requireUserId(request);
	const items = await pipelineService.getItems(userId);
	return { items };
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
	const { items } = useLoaderData<{ items: PipelineItem[] }>();
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);

	return (
		<Shell>
			<div className="stack">
				<div className="flex items-center justify-between">
					<h1 className="heading-3">Pipeline</h1>
					<button
						type="button"
						onClick={() => setIsAddModalOpen(true)}
						className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
					>
						Add Application
					</button>
				</div>

				<KanbanBoard items={items} />

				<AddApplicationModal
					isOpen={isAddModalOpen}
					onClose={() => setIsAddModalOpen(false)}
				/>
			</div>
		</Shell>
	);
}
