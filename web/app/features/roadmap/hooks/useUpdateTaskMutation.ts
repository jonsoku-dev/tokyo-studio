import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { KanbanColumn, KanbanTask } from "../components/kanban.types";
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
 * Features:
 * - Optimistic UI updates (immediate feedback)
 * - Automatic rollback on error
 * - Automatic refetch after success
 * - Toast notifications
 */
export function useUpdateTaskMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateTaskAPI,

		// 1. Optimistic update - update UI immediately before server response
		onMutate: async (variables) => {
			// Cancel ongoing refetches to prevent race conditions
			await queryClient.cancelQueries({ queryKey: roadmapQueryKeys.all });

			// Snapshot previous data for rollback
			const previousData = queryClient.getQueryData(roadmapQueryKeys.all) as any;

			// Optimistically update the cache
			queryClient.setQueryData(roadmapQueryKeys.all, (oldData: any) => {
				if (!oldData) return oldData;

				return {
					...oldData,
					tasks: oldData.tasks.map((task: KanbanTask) => {
						if (task.id === variables.taskId) {
							return {
								...task,
								kanbanColumn: variables.kanbanColumn,
								orderIndex: variables.orderIndex ?? task.orderIndex,
							};
						}
						return task;
					}),
				};
			});

			return { previousData };
		},

		// 2. Error handler - rollback on failure
		onError: (error, variables, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(roadmapQueryKeys.all, context.previousData);
			}
			toast.error(error.message || "Failed to update task");
		},

		// 3. Success handler - invalidate and refetch
		onSuccess: () => {
			// Refetch data from server to ensure consistency
			queryClient.invalidateQueries({ queryKey: roadmapQueryKeys.all });
		},
	});
}
