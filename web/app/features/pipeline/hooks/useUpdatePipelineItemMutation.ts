import { toast } from "sonner";
import type { PipelineStatus } from "../domain/pipeline.types";

interface UpdateItemParams {
	itemId: string;
	toColumn: PipelineStatus;
	orderIndex?: number;
}

/**
 * API call to update pipeline item status
 */
async function updateItemAPI(params: UpdateItemParams) {
	const response = await fetch("/api/pipeline/items/update", {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			itemId: params.itemId,
			stage: params.toColumn,
			orderIndex: params.orderIndex,
		}),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to update item");
	}

	return response.json();
}

/**
 * Hook for updating pipeline item status
 *
 * Unidirectional data flow:
 * - Server update via PATCH /api/pipeline/items/update
 * - Batch updates with Promise.all() for parallel processing
 * - No polling or sequential waiting
 * - Error handling with toast notifications
 */
export function useUpdatePipelineItemMutation() {
	return {
		mutateAsync: async (params: UpdateItemParams) => {
			try {
				const result = await updateItemAPI(params);
				return result;
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Failed to update item";
				toast.error(message);
				throw error;
			}
		},
	};
}
