import { HelpCircle, Plus } from "lucide-react";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { Button } from "~/shared/components/ui/Button";
import { actionHandler, loaderHandler } from "~/shared/lib";
import { requireUserId } from "../../auth/utils/session.server";
import { RESUME_DOCUMENT_TYPES } from "../../documents/constants";
import { documentsService } from "../../documents/services/documents.server";
import { ApplicationDetailModal } from "../components/ApplicationDetailModal";
import { ApplicationsHelpModal } from "../components/ApplicationsHelpModal";
import { DeletePipelineItemModal } from "../components/DeletePipelineItemModal";
import { KanbanBoard } from "../components/KanbanBoardWrapper";
import { PipelineItemModal } from "../components/PipelineItemModal";
import { StatisticsSection } from "../components/StatisticsSection";
import { PARSING_PLUGINS } from "../constants/parsing-plugins";
import type { ParsingPluginConfig } from "../domain/parsing.types";
import { pipelineService } from "../domain/pipeline.service.server";
import type {
	ConfidenceLevel,
	InterestLevel,
	PipelineItem,
	PipelineStage,
	PipelineStatus,
} from "../domain/pipeline.types";

export function meta() {
	return [{ title: "지원 관리 - Japan IT Job" }];
}

export const loader = loaderHandler(async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request);
	const [items, stages, userResumes] = await Promise.all([
		pipelineService.getItems(userId),
		pipelineService.getStages(),
		// SPEC 022: Fetch user's resume documents for attachment
		documentsService.getUserDocumentsByType(userId, [...RESUME_DOCUMENT_TYPES]),
	]);
	const parsers = PARSING_PLUGINS.getAllPlugins();
	return { items, stages, parsers, userResumes };
});

export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
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

		// SPEC-027 Phase 1: Intent & Context
		const motivation = formData.get("motivation")
			? String(formData.get("motivation"))
			: null;
		const interestLevel = formData.get("interestLevel")
			? (String(formData.get("interestLevel")) as InterestLevel)
			: null;
		const confidenceLevel = formData.get("confidenceLevel")
			? (String(formData.get("confidenceLevel")) as ConfidenceLevel)
			: null;

		// SPEC-027 Phase 1: Strategy Snapshot
		const resumeVersionNote = formData.get("resumeVersionNote")
			? String(formData.get("resumeVersionNote"))
			: null;
		const positioningStrategy = formData.get("positioningStrategy")
			? String(formData.get("positioningStrategy"))
			: null;
		const emphasizedStrengthsRaw = formData.get("emphasizedStrengths");
		const emphasizedStrengths = emphasizedStrengthsRaw
			? JSON.parse(String(emphasizedStrengthsRaw))
			: null;

		// SPEC-027 Phase 1: Outcome Reflection
		const outcomeReason = formData.get("outcomeReason")
			? String(formData.get("outcomeReason"))
			: null;
		const lessonsLearned = formData.get("lessonsLearned")
			? String(formData.get("lessonsLearned"))
			: null;
		const nextTimeChange = formData.get("nextTimeChange")
			? String(formData.get("nextTimeChange"))
			: null;

		await pipelineService.addItem(userId, {
			company,
			position,
			stage,
			date,
			nextAction,
			resumeId,
			// SPEC-027 Phase 1 fields
			motivation,
			interestLevel,
			confidenceLevel,
			resumeVersionNote,
			positioningStrategy,
			emphasizedStrengths,
			outcomeReason,
			lessonsLearned,
			nextTimeChange,
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

		// SPEC-027 Phase 1: Intent & Context
		const motivation = formData.get("motivation")
			? String(formData.get("motivation"))
			: null;
		const interestLevel = formData.get("interestLevel")
			? (String(formData.get("interestLevel")) as InterestLevel)
			: null;
		const confidenceLevel = formData.get("confidenceLevel")
			? (String(formData.get("confidenceLevel")) as ConfidenceLevel)
			: null;

		// SPEC-027 Phase 1: Strategy Snapshot
		const resumeVersionNote = formData.get("resumeVersionNote")
			? String(formData.get("resumeVersionNote"))
			: null;
		const positioningStrategy = formData.get("positioningStrategy")
			? String(formData.get("positioningStrategy"))
			: null;
		const emphasizedStrengthsRaw = formData.get("emphasizedStrengths");
		const emphasizedStrengths = emphasizedStrengthsRaw
			? JSON.parse(String(emphasizedStrengthsRaw))
			: null;

		// SPEC-027 Phase 1: Outcome Reflection
		const outcomeReason = formData.get("outcomeReason")
			? String(formData.get("outcomeReason"))
			: null;
		const lessonsLearned = formData.get("lessonsLearned")
			? String(formData.get("lessonsLearned"))
			: null;
		const nextTimeChange = formData.get("nextTimeChange")
			? String(formData.get("nextTimeChange"))
			: null;

		await pipelineService.updateItem(userId, itemId, {
			company,
			position,
			stage,
			date,
			nextAction,
			resumeId,
			// SPEC-027 Phase 1 fields
			motivation,
			interestLevel,
			confidenceLevel,
			resumeVersionNote,
			positioningStrategy,
			emphasizedStrengths,
			outcomeReason,
			lessonsLearned,
			nextTimeChange,
		});
		return { success: true };
	}

	return null;
});

export default function Pipeline() {
	const loaderData = useLoaderData<typeof loader>();

	// Handle error response from loaderHandler
	if (!loaderData.success) {
		return (
			<div className="stack-lg">
				<PageHeader
					title="지원 관리"
					description="입사 지원 현황을 한눈에 파악하고 효율적으로 관리하세요."
				/>
				<div className="card p-6 text-center">
					<p className="text-red-600">
						데이터를 불러오는 중 오류가 발생했습니다.
					</p>
					<p className="text-gray-500 text-sm mt-2">
						{loaderData.error?.message || "알 수 없는 오류"}
					</p>
				</div>
			</div>
		);
	}

	const { items, stages, parsers, userResumes } = loaderData.data;

	// Modal State
	const [selectedItem, setSelectedItem] = useState<PipelineItem | null>(null);
	const [isItemModalOpen, setIsItemModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
	// SPEC-027: Detail modal for extended application info
	const [detailItem, setDetailItem] = useState<PipelineItem | null>(null);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

	// SPEC-027: Open detail modal on card click
	const handleViewDetails = (item: PipelineItem) => {
		setDetailItem(item);
		setIsDetailModalOpen(true);
	};

	const handleCloseDetailModal = () => {
		setIsDetailModalOpen(false);
		setDetailItem(null);
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
				onViewDetails={handleViewDetails}
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

			{detailItem && (
				<ApplicationDetailModal
					isOpen={isDetailModalOpen}
					onClose={handleCloseDetailModal}
					item={detailItem}
					stages={stages}
					userResumes={userResumes}
				/>
			)}
		</div>
	);
}
