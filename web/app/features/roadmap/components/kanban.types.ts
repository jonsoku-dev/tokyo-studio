export type KanbanColumn = "todo" | "in_progress" | "completed";

export interface KanbanTask {
	id: string;
	title: string;
	description: string;
	category: string;
	estimatedMinutes: number;
	priority: string;
	isCustom: boolean;
	kanbanColumn: KanbanColumn;
	orderIndex: number;
}

export interface KanbanColumnConfig {
	id: KanbanColumn;
	title: string;
	count: number;
}
