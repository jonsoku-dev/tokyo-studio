/**
 * Generic DnD Kanban types
 * Can be used with any item type that has id property
 */

export interface DndItem {
	id: string;
}

export interface DndColumn<ColumnId = string> {
	id: ColumnId;
	title: string;
	count: number;
}

export interface DndPendingChange<ColumnId = string> {
	itemId: string;
	fromColumn: ColumnId;
	toColumn: ColumnId;
	orderIndex?: number; // Order within the column
}

export interface DndKanbanProps<
	TItem extends DndItem = DndItem,
	TColumnId extends string = string,
> {
	items: TItem[];
	columns: DndColumn<TColumnId>[];
	getItemColumn: (item: TItem) => TColumnId;
	setItemColumn: (item: TItem, column: TColumnId) => TItem;
	renderCard: (item: TItem) => React.ReactNode;
	renderItemWrapper: (
		item: TItem,
		children: React.ReactNode,
	) => React.ReactNode;
	onSaveChanges: (
		changes: Array<{
			itemId: string;
			toColumn: TColumnId;
			orderIndex?: number;
		}>,
	) => Promise<void>;
	layout?: "grid" | "scroll"; // Default: "grid"
}
