import { KanbanBoard as GenericKanbanBoard } from "~/shared/components/dnd-kanban";
import type {
	PipelineItem,
	PipelineStage,
	PipelineStatus,
} from "../domain/pipeline.types";
import { useUpdatePipelineItemMutation } from "../hooks/useUpdatePipelineItemMutation";
import { usePipelineStore } from "../stores/pipeline.store";
import { PipelineCard } from "./PipelineCard";
import { PipelineItemWrapper } from "./PipelineItemWrapper";

interface KanbanBoardProps {
	items: PipelineItem[];
	stages: PipelineStage[];
	onEditItem: (item: PipelineItem) => void;
	onDeleteItem: (item: PipelineItem) => void;
}

/**
 * KanbanBoard - Pipeline-specific kanban board
 * Uses the generic KanbanBoard with Pipeline customization
 */
export function KanbanBoard({
	items: initialItems,
	stages,
	onEditItem,
	onDeleteItem,
}: KanbanBoardProps) {
	const updateItemMutation = useUpdatePipelineItemMutation();
	const pipelineStore = usePipelineStore();

	const handleSaveChanges = async (
		changes: Array<{ itemId: string; toColumn: string; orderIndex?: number }>,
	) => {
		console.log("[SaveChanges] Saving changes:", changes);

		try {
			await Promise.all(
				changes.map((change) =>
					updateItemMutation.mutateAsync({
						itemId: change.itemId,
						toColumn: change.toColumn as PipelineStatus,
						orderIndex: change.orderIndex,
					}),
				),
			);

			console.log("[SaveChanges] All changes saved successfully");

			// After successful save, sync store with current state
			const currentDisplayItems = initialItems.map((item) => {
				const change = changes.find((c) => c.itemId === item.id);
				return change
					? { ...item, stage: change.toColumn as PipelineStatus }
					: item;
			});

			pipelineStore.setItems(currentDisplayItems);
		} catch (error) {
			console.error("[SaveChanges] Failed:", error);
			throw error;
		}
	};

	// Stage localization map
	const STAGE_NAME_MAP: Record<string, string> = {
		interested: "관심",
		applied: "서류 제출",
		assignment: "과제 전형",
		interview_1: "1차 면접",
		interview_2: "2차 면접",
		interview_3: "최종 면접",
		offer: "합격/오퍼",
		visa_coe: "비자 신청",
		joined: "입사 완료",
		rejected: "불합격",
		withdrawn: "지원 취소",
	};

	// Update column counts based on database stages
	const columnsWithCounts = stages.map((stage) => ({
		id: stage.name,
		title: STAGE_NAME_MAP[stage.name] || stage.displayName,
		count: initialItems.filter((item) => item.stage === stage.name).length,
	}));

	return (
		<GenericKanbanBoard<PipelineItem, string>
			items={initialItems}
			columns={columnsWithCounts}
			getItemColumn={(item) => item.stage}
			setItemColumn={(item, column) => ({
				...item,
				stage: column as PipelineStatus,
			})}
			renderCard={(item) => (
				<PipelineCard
					item={item}
					onEdit={() => onEditItem(item)}
					onDelete={() => onDeleteItem(item)}
				/>
			)}
			renderItemWrapper={(item) => (
				<PipelineItemWrapper itemId={item.id}>
					{({ isDragging, listeners, attributes }) => (
						<PipelineCard
							item={item}
							isDragging={isDragging}
							listeners={listeners}
							attributes={attributes}
							onEdit={() => onEditItem(item)}
							onDelete={() => onDeleteItem(item)}
						/>
					)}
				</PipelineItemWrapper>
			)}
			onSaveChanges={handleSaveChanges}
			layout="scroll"
		/>
	);
}
