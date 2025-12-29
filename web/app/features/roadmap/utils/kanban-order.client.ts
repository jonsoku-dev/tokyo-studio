import type { KanbanColumn, KanbanTask } from "../components/kanban.types";

/**
 * Calculate new orderIndex using fractional indexing algorithm
 *
 * This allows inserting tasks between others without re-indexing the entire column.
 * Uses a simple average approach: new index = (prev + next) / 2
 *
 * @param taskId - ID of the task being moved
 * @param allTasks - All tasks in the kanban board
 * @param targetColumn - Target column for the task
 * @returns New orderIndex value
 */
export function calculateNewOrderIndex(
	taskId: string,
	allTasks: KanbanTask[],
	targetColumn: KanbanColumn,
): number {
	// Filter tasks in target column and sort by orderIndex
	const columnTasks = allTasks
		.filter((t) => t.kanbanColumn === targetColumn)
		.sort((a, b) => a.orderIndex - b.orderIndex);

	// Find task's position in sorted column
	const taskIndex = columnTasks.findIndex((t) => t.id === taskId);

	if (taskIndex === -1) {
		// Task not in column yet, append to end
		const lastTask = columnTasks[columnTasks.length - 1];
		return lastTask ? lastTask.orderIndex + 1000 : 1000;
	}

	// At the beginning
	if (taskIndex === 0) {
		const nextTask = columnTasks[1];
		if (!nextTask) return 1000;
		return nextTask.orderIndex / 2;
	}

	// At the end
	if (taskIndex === columnTasks.length - 1) {
		const prevTask = columnTasks[taskIndex - 1];
		return prevTask.orderIndex + 1000;
	}

	// In the middle: average between adjacent tasks
	const prevTask = columnTasks[taskIndex - 1];
	const nextTask = columnTasks[taskIndex + 1];
	return (prevTask.orderIndex + nextTask.orderIndex) / 2;
}

/**
 * Check if orderIndex has meaningfully changed
 *
 * Ignores small floating point differences
 *
 * @param oldIndex - Previous orderIndex
 * @param newIndex - New orderIndex
 * @returns true if change is significant
 */
export function hasOrderIndexChanged(oldIndex: number, newIndex: number): boolean {
	return Math.abs(newIndex - oldIndex) > 0.1;
}
