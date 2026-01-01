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
import { useRoadmapStore } from "../stores/roadmap.store";
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
	const roadmapStore = useRoadmapStore();

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

	// Simplified collision detection strategy - prioritize pointer detection
	const collisionDetectionStrategy: CollisionDetection = useCallback(
		(args) => {
			console.log("[Collision Detection] activeId:", activeId);

			// First, try pointer-based detection (most reliable for drag over)
			const pointerCollisions = pointerWithin(args);
			console.log("[Collision Detection] Pointer collisions:", pointerCollisions.length);

			if (pointerCollisions.length > 0) {
				let overId = pointerCollisions[0]?.id;
				console.log("[Collision Detection] Using pointer collision - overId:", overId);

				// If overId is a container, find the closest item within it
				if (overId && overId in items) {
					const containerItems = items[overId as string];
					console.log("[Collision Detection] Over container:", overId, "items count:", containerItems.length);

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
							console.log("[Collision Detection] Found closest item:", closestItem);
						} else {
							console.log("[Collision Detection] No closest item, keeping container:", overId);
						}
					} else {
						console.log("[Collision Detection] Container is empty, will drop into it");
					}
				}

				lastOverId.current = overId;
				console.log("[Collision Detection] Final overId from pointer:", overId);
				return [{ id: overId }];
			}

			// Fallback: rect intersection
			console.log("[Collision Detection] No pointer collision, trying rect intersection");
			const rectCollisions = rectIntersection(args);

			if (rectCollisions.length > 0) {
				const overId = rectCollisions[0]?.id;
				console.log("[Collision Detection] Using rect collision - overId:", overId);

				lastOverId.current = overId;
				return [{ id: overId }];
			}

			// Last resort: use previous over id
			console.log("[Collision Detection] No collisions, using lastOverId:", lastOverId.current);
			return lastOverId.current ? [{ id: lastOverId.current }] : [];
		},
		[activeId, items],
	);

	const handleDragStart = ({
		active,
	}: {
		active: { id: UniqueIdentifier };
	}) => {
		console.log("[DragStart] taskId:", active.id);
		setActiveId(active.id);
	};

	const handleDragOver = ({ active, over }: DragOverEvent) => {
		const overId = over?.id;

		console.log("[DragOver] active:", active.id, "over:", overId);

		if (overId == null || active.id in items) {
			console.log("[DragOver] Early return - overId is null:", overId == null, "or active.id in items:", active.id in items);
			return;
		}

		// Check if overId is a container directly (not a task inside a container)
		const isOverIdContainer = overId in items;
		console.log("[DragOver] isOverIdContainer:", isOverIdContainer);

		// Determine the over container
		const overContainer = isOverIdContainer ? (overId as string) : findContainer(overId);
		const activeContainer = findContainer(active.id);

		console.log("[DragOver] activeContainer:", activeContainer, "overContainer:", overContainer);

		if (!overContainer || !activeContainer) {
			console.log("[DragOver] Missing container - activeContainer:", activeContainer, "overContainer:", overContainer);
			return;
		}

		if (activeContainer !== overContainer) {
			console.log("[DragOver] Moving to different container:", activeContainer, "->", overContainer);
			setItems(
				produce((draft) => {
					const activeItems = draft[activeContainer];
					const overItems = draft[overContainer];
					const overIndex = isOverIdContainer ? -1 : overItems.indexOf(overId as string);
					const activeIndex = activeItems.indexOf(active.id as string);

					console.log("[DragOver] Indices - activeIndex:", activeIndex, "overIndex:", overIndex, "isOverIdContainer:", isOverIdContainer);

					let newIndex: number;

					if (isOverIdContainer) {
						// Dropping into a container directly
						newIndex = overItems.length;
						console.log("[DragOver] Dropping into empty/container, newIndex:", newIndex);
					} else {
						const isBelowOverItem =
							over &&
							active.rect.current.translated &&
							active.rect.current.translated.top >
								over.rect.top + over.rect.height;

						const modifier = isBelowOverItem ? 1 : 0;
						newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
						console.log("[DragOver] isBelowOverItem:", isBelowOverItem, "newIndex:", newIndex);
					}

					recentlyMovedToNewContainer.current = true;

					// Remove from active container
					draft[activeContainer].splice(activeIndex, 1);
					// Add to over container
					draft[overContainer].splice(newIndex, 0, active.id as string);

					console.log("[DragOver] Updated items - moved to position", newIndex);
				}),
			);
		} else {
			console.log("[DragOver] Same container, no update needed");
		}
	};

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		console.log("[DragEnd] active:", active.id, "over:", over?.id);

		setActiveId(null);
		recentlyMovedToNewContainer.current = false;

		const taskId = active.id as string;
		const task = taskMap[taskId];

		console.log("[DragEnd] task found:", !!task);
		if (!task) return;

		// Current container (after handleDragOver moved it)
		const currentContainer = findContainer(active.id);
		console.log("[DragEnd] currentContainer:", currentContainer);
		if (!currentContainer) return;

		const overId = over?.id;
		console.log("[DragEnd] overId:", overId);
		if (overId == null) {
			console.log("[DragEnd] No over target, aborting");
			return;
		}

		const isOverContainer = Object.keys(items).includes(overId as string);
		const overContainer = isOverContainer
			? (overId as string)
			: findContainer(overId);

		console.log("[DragEnd] isOverContainer:", isOverContainer, "overContainer:", overContainer);
		if (!overContainer) {
			console.log("[DragEnd] No overContainer found");
			return;
		}

		// Same column reordering (within current container)
		if (currentContainer === overContainer) {
			console.log("[DragEnd] Same container, reordering items");
			const activeIndex = items[currentContainer].indexOf(taskId);
			const overIndex = isOverContainer
				? items[overContainer].length - 1
				: items[overContainer].indexOf(overId as string);

			console.log("[DragEnd] activeIndex:", activeIndex, "overIndex:", overIndex);

			if (activeIndex !== overIndex && overIndex >= 0) {
				setItems(
					produce((draft) => {
						draft[overContainer] = arrayMove(
							draft[overContainer],
							activeIndex,
							overIndex,
						);
						console.log("[DragEnd] Reordered items in container");
					}),
				);
			}
		}

		// Track pending change - compare original column with current position
		const originalColumn = task.kanbanColumn;
		const newColumn = currentContainer as KanbanColumn;

		console.log("[DragEnd] originalColumn:", originalColumn, "newColumn:", newColumn);

		// Only track if column actually changed from original
		if (originalColumn !== newColumn) {
			console.log("[DragEnd] Column changed, adding to pending and updating store");

			// 1. Add to pending changes
			setPendingChanges(
				produce((draft) => {
					const existing = draft.get(taskId);

					if (existing) {
						// Task was moved before - update target
						existing.toColumn = newColumn;
						console.log("[DragEnd] Updated existing pending change");
					} else {
						// New move
						draft.set(taskId, {
							taskId,
							fromColumn: originalColumn,
							toColumn: newColumn,
						});
						console.log("[DragEnd] Added new pending change");
					}
				}),
			);

			// 2. Update store immediately for real-time UI updates (진행률 실시간 반영)
			const orderIndex = items[newColumn].indexOf(taskId);
			console.log("[DragEnd] Updating store with new column:", newColumn, "at index:", orderIndex);
			roadmapStore.updateTaskColumn(taskId, newColumn, orderIndex);
		} else {
			// Moved back to original column - remove from pending if exists
			console.log("[DragEnd] Column unchanged, checking if we need to remove from pending");
			setPendingChanges(
				produce((draft) => {
					if (draft.has(taskId)) {
						draft.delete(taskId);
						console.log("[DragEnd] Removed task from pending changes");
					}
				}),
			);
		}
	};

	// Save all pending changes
	const handleSaveChanges = async () => {
		console.log("[SaveChanges] Starting save with", pendingChanges.size, "changes");

		if (pendingChanges.size === 0) {
			console.log("[SaveChanges] No pending changes to save");
			return;
		}

		setIsSaving(true);

		try {
			const changes = Array.from(pendingChanges.values());

			console.log("[SaveChanges] Saving changes:", changes);

			await Promise.all(
				changes.map((change) => {
					// Find the current order index in the new column
					const orderIndex = items[change.toColumn].indexOf(change.taskId);

					console.log(
						"[SaveChanges] Updating task:",
						change.taskId,
						"to column:",
						change.toColumn,
						"at index:",
						orderIndex,
					);

					return updateTaskMutation.mutateAsync({
						taskId: change.taskId,
						kanbanColumn: change.toColumn,
						orderIndex: orderIndex >= 0 ? orderIndex : 0,
					});
				}),
			);

			console.log("[SaveChanges] All changes saved successfully");

			// After successful save, sync store with current UI state
			// This uses initialTasks as source, with updated kanbanColumn
			const currentDisplayTasks = Object.entries(items).flatMap(
				([columnId, taskIds]) =>
					taskIds.map((taskId) => {
						const task = initialTasks.find((t) => t.id === taskId);
						return task
							? {
									...task,
									kanbanColumn: columnId as "todo" | "in_progress" | "completed",
								}
							: null;
					}),
			).filter(Boolean) as any[];

			console.log("[SaveChanges] Syncing store with persisted state");
			roadmapStore.setTasks(currentDisplayTasks);

			// Clear pending changes
			setPendingChanges(new Map());
		} catch (error) {
			console.error("[SaveChanges] Failed to save changes:", error);
		} finally {
			setIsSaving(false);
		}
	};

	// Discard all pending changes
	const handleDiscardChanges = () => {
		console.log("[DiscardChanges] Discarding", pendingChanges.size, "pending changes");
		setItems(buildItemsFromTasks(initialTasks, columns));
		setPendingChanges(new Map());
		console.log("[DiscardChanges] Changes discarded, reset to initial state");
	};

	const activeTask = activeId ? taskMap[activeId as string] : null;
	const hasChanges = pendingChanges.size > 0;

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

			{/* Pending Changes Banner - Fixed at Bottom */}
			{hasChanges && (
				<div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-amber-200 bg-amber-50 p-4 shadow-lg">
					<div className="container-wide mx-auto flex w-full items-center justify-between px-4">
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200">
								<span className="text-sm font-bold text-amber-700">
									{pendingChanges.size}
								</span>
							</div>
							<div>
								<p className="font-medium text-amber-900">
									{pendingChanges.size}개의 변경사항 대기 중
								</p>
								<p className="text-xs text-amber-600">
									저장하지 않으면 변경사항이 사라집니다
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={handleDiscardChanges}
								disabled={isSaving}
								className="body-sm px-4 py-2 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
							>
								취소
							</button>
							<button
								type="button"
								onClick={handleSaveChanges}
								disabled={isSaving}
								className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
							>
								{isSaving ? (
									<>
										<span className="animate-spin">↻</span>
										저장 중...
									</>
								) : (
									"저장하기"
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
