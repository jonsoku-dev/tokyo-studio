import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { KanbanColumn } from "../components/kanban.types";
import { roadmapQueryKeys } from "./useRoadmapQuery";

interface UpdateTaskParams {
	taskId: string;
	kanbanColumn: KanbanColumn;
	orderIndex?: number;
}

/**
 * API call to update task position
 */
async function updateTaskAPI(params: UpdateTaskParams) {
	const response = await fetch("/api/roadmap/tasks/update", {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to update task");
	}

	return response.json();
}

/**
 * Hook for mutating (updating) task position
 *
 * Unidirectional data flow:
 * - Server update via PATCH /api/roadmap/tasks/update
 * - No optimistic update (keeps client in sync with server)
 * - After success, refetch from server to get latest state
 * - Server is the single source of truth
 */
export function useUpdateTaskMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateTaskAPI,

		// Error handler - show error toast
		onError: (error) => {
			toast.error(error.message || "작업 업데이트에 실패했습니다");
		},

		// Success handler - fetch fresh data from server
		onSuccess: async () => {
			// Directly refetch from server to ensure data consistency
			// This forces a fresh query execution, not using cache
			await queryClient.refetchQueries({
				queryKey: roadmapQueryKeys.all,
				type: "all",
			});
		},
	});
}
