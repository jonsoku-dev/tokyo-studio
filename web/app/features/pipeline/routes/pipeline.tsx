import { useState } from "react";
import { useLoaderData } from "react-router";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { requireUserId } from "../../auth/utils/session.server";
import { RESUME_DOCUMENT_TYPES } from "../../documents/constants";
import { documentsService } from "../../documents/services/documents.server";
import { DeletePipelineItemModal } from "../components/DeletePipelineItemModal";
import { KanbanBoard } from "../components/KanbanBoardWrapper";
import { PipelineItemModal } from "../components/PipelineItemModal";
import { PARSING_PLUGINS } from "../constants/parsing-plugins";
import type { ParsingPluginConfig } from "../domain/parsing.types";
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
	const [items, stages, userResumes] = await Promise.all([
		pipelineService.getItems(userId),
		pipelineService.getStages(),
		// SPEC 022: Fetch user's resume documents for attachment
		documentsService.getUserDocumentsByType(userId, [...RESUME_DOCUMENT_TYPES]),
	]);
	const parsers = PARSING_PLUGINS.getAllPlugins();
	return { items, stages, parsers, userResumes };
}

export async function action({ request }: { request: Request }) {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const intent = String(formData.get("intent") || "add");

	if (intent === "add") {
		const company = String(formData.get("company"));
		const position = String(formData.get("position"));
		const stage = String(formData.get("stage")) as PipelineStatus;
		const date = String(formData.get("date"));
		const nextAction = formData.get("nextAction")
			? String(formData.get("nextAction"))
			: null;
		// SPEC 022: Resume attachment
		const resumeIdValue = formData.get("resumeId");
		const resumeId = resumeIdValue ? String(resumeIdValue) : null;

		await pipelineService.addItem(userId, {
			company,
			position,
			stage,
			date,
			nextAction,
			resumeId,
		});
		return { success: true };
	}

	if (intent === "edit") {
		const itemId = String(formData.get("itemId"));
		const company = String(formData.get("company"));
		const position = String(formData.get("position"));
		const stage = String(formData.get("stage")) as PipelineStatus;
		const date = String(formData.get("date"));
		const nextActionValue = formData.get("nextAction");
		const nextAction = nextActionValue ? String(nextActionValue) : undefined;
		// SPEC 022: Resume attachment
		const resumeIdValue = formData.get("resumeId");
		const resumeId = resumeIdValue ? String(resumeIdValue) : null;

		await pipelineService.updateItem(userId, itemId, {
			company,
			position,
			stage,
			date,
			nextAction,
			resumeId,
		});
		return { success: true };
	}

	return null;
}

export default function Pipeline() {
	const { items, stages, parsers, userResumes } = useLoaderData<{
		items: PipelineItem[];
		stages: PipelineStage[];
		parsers: ParsingPluginConfig[];
		userResumes: Array<{
			id: string;
			title: string;
			type: string;
			status: string;
		}>;
	}>();

	// Modal State
	const [selectedItem, setSelectedItem] = useState<PipelineItem | null>(null);
	const [isItemModalOpen, setIsItemModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	// Handlers
	const handleAddItem = () => {
		setSelectedItem(null);
		setIsItemModalOpen(true);
	};

	const handleEditItem = (item: PipelineItem) => {
		setSelectedItem(item);
		setIsItemModalOpen(true);
	};

	const handleDeleteItem = (item: PipelineItem) => {
		setSelectedItem(item);
		setIsDeleteModalOpen(true);
	};

	const handleCloseItemModal = () => {
		setIsItemModalOpen(false);
		setSelectedItem(null);
	};

	const handleCloseDeleteModal = () => {
		setIsDeleteModalOpen(false);
		setSelectedItem(null);
	};

	return (
		<div className="stack">
			<PageHeader
				title="Pipeline"
				actions={
					<button
						type="button"
						onClick={handleAddItem}
						className="rounded-md bg-primary-600 px-4 py-2 font-medium text-sm text-white shadow-sm transition-colors hover:bg-primary-700"
					>
						Add Application
					</button>
				}
			/>

			<KanbanBoard
				items={items}
				stages={stages}
				onEditItem={handleEditItem}
				onDeleteItem={handleDeleteItem}
			/>

			{/* Add / Edit Modal */}
			<PipelineItemModal
				isOpen={isItemModalOpen}
				onClose={handleCloseItemModal}
				stages={stages}
				parsers={parsers}
				initialData={selectedItem}
				userResumes={userResumes}
			/>

			{/* Delete Confirmation Modal */}
			{selectedItem && (
				<DeletePipelineItemModal
					isOpen={isDeleteModalOpen}
					onClose={handleCloseDeleteModal}
					item={selectedItem}
				/>
			)}
		</div>
	);
}
