import {
	type CollisionDetection,
	closestCenter,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	getFirstCollision,
	KeyboardSensor,
	MeasuringStrategy,
	PointerSensor,
	pointerWithin,
	rectIntersection,
	TouchSensor,
	type UniqueIdentifier,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { enableMapSet, produce } from "immer";
import { useCallback, useRef, useState } from "react";
import { useUpdateTaskMutation } from "../hooks/useUpdateTaskMutation";
import type {
	KanbanColumn,
	KanbanColumnConfig,
	KanbanTask,
} from "./kanban.types";
import { TaskCard } from "./TaskCard";
import { TaskItemWrapper } from "./TaskItemWrapper";

// Enable Map/Set support for immer
enableMapSet();

interface KanbanBoardProps {
	tasks: KanbanTask[];
	columns: KanbanColumnConfig[];
}

// DroppableColumn - Makes column a drop target for empty columns
function DroppableColumn({
	id,
	children,
}: {
	id: string;
	children: React.ReactNode;
}) {
	const { setNodeRef, isOver } = useDroppable({
		id,
		data: {
			type: "container",
		},
	});

	return (
		<div
			ref={setNodeRef}
			className={`flex min-h-[500px] flex-col rounded-2xl bg-gray-50/50 p-4 transition-colors ${
				isOver ? "bg-indigo-50/50 ring-2 ring-indigo-200" : ""
			}`}
		>
			{children}
		</div>
	);
}

// Items structure: Record<columnId, taskIds[]>
type Items = Record<string, string[]>;

// Pending change structure - tracks only moved tasks
interface PendingChange {
	taskId: string;
	fromColumn: KanbanColumn;
	toColumn: KanbanColumn;
}

// Helper: Build initial items from tasks
function buildItemsFromTasks(
	tasks: KanbanTask[],
	columns: KanbanColumnConfig[],
): Items {
	const result: Items = {};
	for (const col of columns) {
		result[col.id] = [];
	}
	for (const task of tasks) {
		if (result[task.kanbanColumn]) {
			result[task.kanbanColumn].push(task.id);
		}
	}
	return result;
}

// Helper: Build task map from tasks
function buildTaskMap(tasks: KanbanTask[]): Record<string, KanbanTask> {
	return Object.fromEntries(tasks.map((task) => [task.id, task]));
}

/**
 * KanbanBoard - Multi-container drag-and-drop kanban board
 *
 * Features:
 * - Drag tasks between columns
 * - Reorder tasks within same column
 * - Batch save with explicit user action
 * - No side effects (useEffect/setTimeout)
 */
export function KanbanBoard({
	tasks: initialTasks,
	columns,
}: KanbanBoardProps) {
	// State
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
	const [items, setItems] = useState<Items>(() =>
		buildItemsFromTasks(initialTasks, columns),
	);
	const [taskMap] = useState(() => buildTaskMap(initialTasks));
	const [pendingChanges, setPendingChanges] = useState<
		Map<string, PendingChange>
	>(new Map());
	const [isSaving, setIsSaving] = useState(false);

	// Refs for collision detection
	const lastOverId = useRef<UniqueIdentifier | null>(null);
	const recentlyMovedToNewContainer = useRef(false);

	const updateTaskMutation = useUpdateTaskMutation();

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

	// Find container for task ID
	const findContainer = (id: UniqueIdentifier): string | undefined => {
		return Object.keys(items).find((key) => items[key].includes(id as string));
	};

	// Custom collision detection strategy
	const collisionDetectionStrategy: CollisionDetection = useCallback(
		(args) => {
			if (activeId && activeId in items) {
				return closestCenter({
					...args,
					droppableContainers: args.droppableContainers.filter(
						(container) => container.id in items,
					),
				});
			}

			const pointerIntersections = pointerWithin(args);
			const intersections =
				pointerIntersections.length > 0
					? pointerIntersections
					: rectIntersection(args);

			let overId = getFirstCollision(intersections, "id");

			if (overId != null) {
				if (overId in items) {
					const containerItems = items[overId as string];

					if (containerItems.length > 0) {
						overId = closestCenter({
							...args,
							droppableContainers: args.droppableContainers.filter(
								(container) =>
									container.id !== overId &&
									containerItems.includes(container.id as string),
							),
						})[0]?.id;
					}
				}

				lastOverId.current = overId;
				return [{ id: overId }];
			}

			if (recentlyMovedToNewContainer.current) {
				lastOverId.current = activeId;
			}

			return lastOverId.current ? [{ id: lastOverId.current }] : [];
		},
		[activeId, items],
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

		if (overId == null || active.id in items) return;

		const overContainer = findContainer(overId);
		const activeContainer = findContainer(active.id);

		if (!overContainer || !activeContainer) return;

		if (activeContainer !== overContainer) {
			setItems(
				produce((draft) => {
					const activeItems = draft[activeContainer];
					const overItems = draft[overContainer];
					const overIndex = overItems.indexOf(overId as string);
					const activeIndex = activeItems.indexOf(active.id as string);

					let newIndex: number;

					if (overId in draft) {
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

					recentlyMovedToNewContainer.current = true;

					// Remove from active container
					draft[activeContainer].splice(activeIndex, 1);
					// Add to over container
					draft[overContainer].splice(newIndex, 0, active.id as string);
				}),
			);
		}
	};

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		setActiveId(null);
		recentlyMovedToNewContainer.current = false;

		const taskId = active.id as string;
		const task = taskMap[taskId];
		if (!task) return;

		// Current container (after handleDragOver moved it)
		const currentContainer = findContainer(active.id);
		if (!currentContainer) return;

		const overId = over?.id;
		if (overId == null) return;

		const isOverContainer = Object.keys(items).includes(overId as string);
		const overContainer = isOverContainer
			? (overId as string)
			: findContainer(overId);
		if (!overContainer) return;

		// Same column reordering (within current container)
		if (currentContainer === overContainer) {
			const activeIndex = items[currentContainer].indexOf(taskId);
			const overIndex = isOverContainer
				? items[overContainer].length - 1
				: items[overContainer].indexOf(overId as string);

			if (activeIndex !== overIndex && overIndex >= 0) {
				setItems(
					produce((draft) => {
						draft[overContainer] = arrayMove(
							draft[overContainer],
							activeIndex,
							overIndex,
						);
					}),
				);
			}
		}

		// Track pending change - compare original column with current position
		const originalColumn = task.kanbanColumn;
		const newColumn = currentContainer as KanbanColumn;

		// Only track if column actually changed from original
		if (originalColumn !== newColumn) {
			setPendingChanges(
				produce((draft) => {
					const existing = draft.get(taskId);

					if (existing) {
						// Task was moved before - update target
						existing.toColumn = newColumn;
					} else {
						// New move
						draft.set(taskId, {
							taskId,
							fromColumn: originalColumn,
							toColumn: newColumn,
						});
					}
				}),
			);
		} else {
			// Moved back to original column - remove from pending if exists
			setPendingChanges(
				produce((draft) => {
					if (draft.has(taskId)) {
						draft.delete(taskId);
					}
				}),
			);
		}
	};

	// Save all pending changes
	const handleSaveChanges = async () => {
		if (pendingChanges.size === 0) return;

		setIsSaving(true);

		try {
			const changes = Array.from(pendingChanges.values());

			await Promise.all(
				changes.map((change) => {
					// Find the current order index in the new column
					const orderIndex = items[change.toColumn].indexOf(change.taskId);

					return updateTaskMutation.mutateAsync({
						taskId: change.taskId,
						kanbanColumn: change.toColumn,
						orderIndex: orderIndex >= 0 ? orderIndex : 0,
					});
				}),
			);

			setPendingChanges(new Map());
		} catch (error) {
			console.error("Failed to save changes:", error);
		} finally {
			setIsSaving(false);
		}
	};

	// Discard all pending changes
	const handleDiscardChanges = () => {
		setItems(buildItemsFromTasks(initialTasks, columns));
		setPendingChanges(new Map());
	};

	const activeTask = activeId ? taskMap[activeId as string] : null;
	const hasChanges = pendingChanges.size > 0;

	return (
		<div className="relative">
			{/* Pending Changes Banner */}
			{hasChanges && (
				<div className="sticky top-0 z-20 mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3">
					<div className="flex items-center gap-2">
						<span className="font-medium text-amber-600">
							{pendingChanges.size}개의 변경사항
						</span>
						<span className="text-amber-500 text-sm">
							저장하지 않으면 변경사항이 사라집니다
						</span>
					</div>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={handleDiscardChanges}
							disabled={isSaving}
							className="body-sm px-3 py-1.5 hover:text-gray-800 disabled:opacity-50"
						>
							취소
						</button>
						<button
							type="button"
							onClick={handleSaveChanges}
							disabled={isSaving}
							className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
						>
							{isSaving ? (
								<>
									<span className="animate-spin">↻</span>
									저장 중...
								</>
							) : (
								"저장"
							)}
						</button>
					</div>
				</div>
			)}

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
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					{columns.map((column) => {
						const columnTaskIds = items[column.id] || [];

						return (
							<SortableContext
								key={column.id}
								items={columnTaskIds}
								strategy={verticalListSortingStrategy}
							>
								<DroppableColumn id={column.id}>
									{/* Column Header */}
									<div className="mb-4 flex items-center justify-between">
										<h3 className="heading-5">{column.title}</h3>
										<span className="caption rounded bg-white px-2 py-1">
											{columnTaskIds.length}
										</span>
									</div>

									{/* Tasks Container */}
									<div className="flex-1 space-y-3 overflow-y-auto">
										{columnTaskIds.length === 0 ? (
											<div className="flex h-32 items-center justify-center rounded-lg border-2 border-gray-200 border-dashed text-gray-400">
												태스크를 여기에 드롭하세요
											</div>
										) : (
											columnTaskIds.map((taskId) => {
												const task = taskMap[taskId];
												return task ? (
													<TaskItemWrapper key={taskId} task={task} />
												) : null;
											})
										)}
									</div>
								</DroppableColumn>
							</SortableContext>
						);
					})}
				</div>

				{/* Drag Overlay */}
				<DragOverlay>
					{activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
}
