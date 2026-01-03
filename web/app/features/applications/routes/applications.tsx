import { HelpCircle, Plus } from "lucide-react";
import { useState } from "react";
import { useLoaderData } from "react-router";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { Button } from "~/shared/components/ui/Button";
import { requireUserId } from "../../auth/utils/session.server";
import { RESUME_DOCUMENT_TYPES } from "../../documents/constants";
import { documentsService } from "../../documents/services/documents.server";
import { ApplicationsHelpModal } from "../components/ApplicationsHelpModal";
import { DeletePipelineItemModal } from "../components/DeletePipelineItemModal";
import { KanbanBoard } from "../components/KanbanBoardWrapper";
import { PipelineItemModal } from "../components/PipelineItemModal";
import { StatisticsSection } from "../components/StatisticsSection";
import { PARSING_PLUGINS } from "../constants/parsing-plugins";
import type { ParsingPluginConfig } from "../domain/parsing.types";
import { pipelineService } from "../domain/pipeline.service.server";
import type {
	PipelineItem,
	PipelineStage,
	PipelineStatus,
} from "../domain/pipeline.types";

export function meta() {
	return [{ title: "지원 관리 - Japan IT Job" }];
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
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

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
		<div className="stack-lg">
			<PageHeader
				title="지원 관리"
				description="입사 지원 현황을 한눈에 파악하고 효율적으로 관리하세요."
				actions={
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsHelpModalOpen(true)}
						>
							<HelpCircle className="mr-2 h-4 w-4" />
							가이드
						</Button>
						<Button onClick={handleAddItem} size="sm">
							<Plus className="mr-2 h-4 w-4" />
							지원 내역 추가
						</Button>
					</div>
				}
			/>

			<StatisticsSection items={items} />

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

			<ApplicationsHelpModal
				isOpen={isHelpModalOpen}
				onClose={() => setIsHelpModalOpen(false)}
			/>
		</div>
	);
}
