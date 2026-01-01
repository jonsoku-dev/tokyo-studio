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
}

/**
 * KanbanBoard - Pipeline-specific kanban board
 * Uses the generic KanbanBoard with Pipeline customization
 */
export function KanbanBoard({ items: initialItems, stages }: KanbanBoardProps) {
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

	// Update column counts based on database stages
	const columnsWithCounts = stages.map((stage) => ({
		id: stage.name,
		title: stage.displayName,
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
			renderCard={(item) => <PipelineCard item={item} />}
			renderItemWrapper={(item, card) => (
				<PipelineItemWrapper itemId={item.id}>{() => card}</PipelineItemWrapper>
			)}
			onSaveChanges={handleSaveChanges}
			layout="scroll"
		/>
	);
}
