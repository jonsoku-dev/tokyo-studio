import {
	type CollisionDetection,
	closestCenter,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	KeyboardSensor,
	MeasuringStrategy,
	PointerSensor,
	pointerWithin,
	rectIntersection,
	TouchSensor,
	type UniqueIdentifier,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useRef, useState } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { PendingChangesBanner } from "./PendingChangesBanner";
import type { DndColumn, DndItem, DndKanbanProps } from "./types";

// Items structure: Record<columnId, itemIds[]>
type Items<TColumnId extends string = string> = Record<TColumnId, string[]>;

// Pending change structure
interface PendingChange<TColumnId extends string = string> {
	itemId: string;
	fromColumn: TColumnId;
	toColumn: TColumnId;
	orderIndex?: number; // Order within the column
}

// Helper: Build initial items from items
function buildItemsFromItems<TItem extends DndItem, TColumnId extends string>(
	items: TItem[],
	columns: DndColumn<TColumnId>[],
	getItemColumn: (item: TItem) => TColumnId,
): Items<TColumnId> {
	const result: Record<string, string[]> = {};
	for (const col of columns) {
		result[col.id as string] = [];
	}
	for (const item of items) {
		const column = getItemColumn(item);
		if (result[column as string]) {
			result[column as string].push(item.id);
		}
	}
	return result as Items<TColumnId>;
}

// Helper: Build item map
function buildItemMap<TItem extends DndItem>(
	items: TItem[],
): Record<string, TItem> {
	return Object.fromEntries(items.map((item) => [item.id, item]));
}

/**
 * Generic KanbanBoard component
 *
 * Features:
 * - Drag items between columns
 * - Reorder items within same column
 * - Batch save with explicit user action
 * - No side effects (useEffect/setTimeout)
 * - Fully generic and customizable
 */
export function KanbanBoard<
	TItem extends DndItem = DndItem,
	TColumnId extends string = string,
>({
	items: initialItems,
	columns,
	getItemColumn,
	renderCard,
	renderItemWrapper,
	onSaveChanges,
	layout = "grid",
}: DndKanbanProps<TItem, TColumnId>) {
	// State
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
	const [items, setItems] = useState<Items<TColumnId>>(() =>
		buildItemsFromItems(initialItems, columns, getItemColumn),
	);
	const [itemMap] = useState(() => buildItemMap(initialItems));
	const [pendingChanges, setPendingChanges] = useState<
		Map<string, PendingChange<TColumnId>>
	>(new Map());
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	// Refs for collision detection
	const lastOverId = useRef<UniqueIdentifier | null>(null);

	// Sensors
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 250,
				tolerance: 5,
			},
		}),
		useSensor(KeyboardSensor),
	);

	// Find container for item ID
	const findContainer = (id: UniqueIdentifier): TColumnId | undefined => {
		return Object.keys(items).find((key) =>
			items[key as TColumnId].includes(id as string),
		) as TColumnId | undefined;
	};

	// Simplified collision detection strategy
	const collisionDetectionStrategy: CollisionDetection = useCallback(
		(args) => {
			const pointerCollisions = pointerWithin(args);

			if (pointerCollisions.length > 0) {
				let overId = pointerCollisions[0]?.id;

				// If overId is a container, find the closest item within it
				if (overId && overId in items) {
					const containerItems = items[overId as TColumnId];

					if (containerItems.length > 0) {
						// Find closest item in the container
						const closestItem = closestCenter({
							...args,
							droppableContainers: args.droppableContainers.filter(
								(container) =>
									container.id !== overId &&
									containerItems.includes(container.id as string),
							),
						})[0]?.id;

						if (closestItem) {
							overId = closestItem;
						}
					}
				}

				lastOverId.current = overId;
				return [{ id: overId }];
			}

			// Fallback: rect intersection
			const rectCollisions = rectIntersection(args);

			if (rectCollisions.length > 0) {
				const overId = rectCollisions[0]?.id;
				lastOverId.current = overId;
				return [{ id: overId }];
			}

			// Last resort: use previous over id
			return lastOverId.current ? [{ id: lastOverId.current }] : [];
		},
		[items],
	);

	const handleDragStart = ({
		active,
	}: {
		active: { id: UniqueIdentifier };
	}) => {
		setActiveId(active.id);
	};

	const handleDragOver = ({ active, over }: DragOverEvent) => {
		const overId = over?.id;

		if (overId == null || active.id in items) {
			return;
		}

		// Check if overId is a container directly
		const isOverIdContainer = overId in items;

		// Determine the over container
		const overContainer = isOverIdContainer
			? (overId as TColumnId)
			: findContainer(overId);
		const activeContainer = findContainer(active.id);

		if (!overContainer || !activeContainer) {
			return;
		}

		if (activeContainer !== overContainer) {
			setItems((prevItems) => {
				const newItems = { ...prevItems };
				const activeItems = [...newItems[activeContainer]];
				const overItems = [...newItems[overContainer]];
				const overIndex = isOverIdContainer
					? -1
					: overItems.indexOf(overId as string);
				const activeIndex = activeItems.indexOf(active.id as string);

				let newIndex: number;

				if (isOverIdContainer) {
					// Dropping into a container directly
					newIndex = overItems.length;
				} else {
					const isBelowOverItem =
						over &&
						active.rect.current.translated &&
						active.rect.current.translated.top >
							over.rect.top + over.rect.height;

					const modifier = isBelowOverItem ? 1 : 0;
					newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
				}

				// Remove from active container
				activeItems.splice(activeIndex, 1);
				// Add to over container
				overItems.splice(newIndex, 0, active.id as string);

				newItems[activeContainer] = activeItems;
				newItems[overContainer] = overItems;

				return newItems;
			});
		}
	};

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		setActiveId(null);

		const itemId = active.id as string;
		const item = itemMap[itemId] as TItem;

		if (!item) return;

		// Current container (after handleDragOver moved it)
		const currentContainer = findContainer(active.id);
		if (!currentContainer) return;

		const overId = over?.id;
		if (overId == null) {
			return;
		}

		const isOverContainer = Object.keys(items).includes(overId as string);
		const overContainer = isOverContainer
			? (overId as TColumnId)
			: findContainer(overId);

		if (!overContainer) {
			return;
		}

		// Same column reordering (within current container)
		let orderChanged = false;
		if (currentContainer === overContainer) {
			const activeIndex = items[currentContainer].indexOf(itemId);
			const overIndex = isOverContainer
				? items[overContainer].length - 1
				: items[overContainer].indexOf(overId as string);

			if (activeIndex !== overIndex && overIndex >= 0) {
				setItems((prevItems) => ({
					...prevItems,
					[overContainer]: arrayMove(
						prevItems[overContainer],
						activeIndex,
						overIndex,
					),
				}));
				orderChanged = true;
			}
		}

		// Track pending change - compare original column with current position
		const originalColumn = getItemColumn(item);
		const newColumn = currentContainer;

		// Only track if column actually changed from original
		if (originalColumn !== newColumn) {
			// 1. Add to pending changes
			setPendingChanges((prevChanges) => {
				const newChanges = new Map(prevChanges);
				const existing = newChanges.get(itemId);

				if (existing) {
					// Task was moved before - update target
					existing.toColumn = newColumn;
				} else {
					// New move
					newChanges.set(itemId, {
						itemId,
						fromColumn: originalColumn,
						toColumn: newColumn,
					});
				}

				return newChanges;
			});
		} else if (orderChanged) {
			// Same column but order changed - track the new order
			setPendingChanges((prevChanges) => {
				const newChanges = new Map(prevChanges);
				const newOrderIndex = items[currentContainer].indexOf(itemId);

				newChanges.set(itemId, {
					itemId,
					fromColumn: originalColumn,
					toColumn: originalColumn,
					orderIndex: newOrderIndex,
				});

				return newChanges;
			});
		} else {
			// Moved back to original column and no order change - remove from pending if exists
			setPendingChanges((prevChanges) => {
				const newChanges = new Map(prevChanges);
				if (newChanges.has(itemId)) {
					newChanges.delete(itemId);
				}
				return newChanges;
			});
		}
	};

	// Save all pending changes
	const handleSaveChanges = async () => {
		if (pendingChanges.size === 0) {
			return;
		}

		setIsSaving(true);
		setSaveError(null);

		try {
			const changes = Array.from(pendingChanges.values());

			await onSaveChanges(
				changes.map((change) => ({
					itemId: change.itemId,
					toColumn: change.toColumn,
					orderIndex: change.orderIndex,
				})),
			);

			// After successful save, clear pending changes
			setPendingChanges(new Map());
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to save changes";
			setSaveError(errorMessage);
		} finally {
			setIsSaving(false);
		}
	};

	// Discard all pending changes
	const handleDiscardChanges = () => {
		setItems(buildItemsFromItems(initialItems, columns, getItemColumn));
		setPendingChanges(new Map());
		setSaveError(null);
	};

	const activeItem = activeId ? (itemMap[activeId as string] as TItem) : null;
	const hasChanges = pendingChanges.size > 0;

	// Determine layout class based on layout prop
	const layoutClass =
		layout === "scroll"
			? "overflow-x-auto flex gap-responsive"
			: "grid grid-cols-1 gap-responsive md:grid-cols-3";

	return (
		<>
			<div className="relative">
				<DndContext
					sensors={sensors}
					collisionDetection={collisionDetectionStrategy}
					measuring={{
						droppable: {
							strategy: MeasuringStrategy.Always,
						},
					}}
					onDragStart={handleDragStart}
					onDragOver={handleDragOver}
					onDragEnd={handleDragEnd}
				>
					<div className={layoutClass}>
						{columns.map((column) => {
							const columnItemIds = items[column.id] || [];

							return (
								<KanbanColumn
									key={column.id}
									id={column.id as string}
									title={column.title}
									count={columnItemIds.length}
									layout={layout}
								>
									<SortableContext
										items={columnItemIds}
										strategy={verticalListSortingStrategy}
									>
										<div className="space-y-3">
											{columnItemIds.map((itemId) => {
												const item = itemMap[itemId] as TItem;
												return item
													? renderItemWrapper(item, renderCard(item))
													: null;
											})}
										</div>
									</SortableContext>
								</KanbanColumn>
							);
						})}
					</div>

					{/* Drag Overlay */}
					<DragOverlay>
						{activeItem ? renderCard(activeItem) : null}
					</DragOverlay>
				</DndContext>
			</div>

			{/* Pending Changes Banner */}
			{hasChanges && (
				<PendingChangesBanner
					count={pendingChanges.size}
					isSaving={isSaving}
					error={saveError}
					onSave={handleSaveChanges}
					onDiscard={handleDiscardChanges}
				/>
			)}
		</>
	);
}
