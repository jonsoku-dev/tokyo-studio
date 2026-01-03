import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	rectSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { WidgetLayout } from "@itcom/db/schema";
import { useCallback, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "../stores/dashboard.store";
import type { WidgetData } from "../types/widget-data.types";
import { SaveChangesBar } from "./SaveChangesBar";
import { SortableWidget } from "./SortableWidget";
import { WidgetCard } from "./WidgetCard";
import { WidgetGallery } from "./WidgetGallery";

interface DashboardGridProps {
	initialWidgets: WidgetLayout[];
	widgetData: WidgetData;
}

/**
 * 대시보드 그리드 컴포넌트
 *
 * 단방향 데이터 흐름 + 일괄 저장:
 * 1. Server → initializeWidgets
 * 2. User Action → Store 업데이트만 (API 호출 안함)
 * 3. SaveChangesBar → 일괄 저장
 */
export function DashboardGrid({
	initialWidgets,
	widgetData,
}: DashboardGridProps) {
	const isInitialized = useRef(false);

	// Zustand store
	const initializeWidgets = useDashboardStore((s) => s.initializeWidgets);
	const resizeWidget = useDashboardStore((s) => s.resizeWidget);
	const hideWidget = useDashboardStore((s) => s.hideWidget);
	const reorderWidgets = useDashboardStore((s) => s.reorderWidgets);
	const storeWidgets = useDashboardStore((s) => s.widgets);

	// 초기화 (한 번만)
	if (!isInitialized.current && initialWidgets.length > 0) {
		initializeWidgets(initialWidgets);
		isInitialized.current = true;
	}

	// 위젯 목록
	const widgets = storeWidgets.length > 0 ? storeWidgets : initialWidgets;
	const visibleWidgets = useMemo(
		() => widgets.filter((w) => w.visible),
		[widgets],
	);

	// dnd-kit 센서
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const [activeId, setActiveId] = useState<string | null>(null);

	const handleDragStart = useCallback((event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	}, []);

	/**
	 * 드래그 종료 - Store만 업데이트 (저장은 SaveChangesBar에서)
	 */
	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			if (!over || active.id === over.id) return;

			const oldIndex = widgets.findIndex((w) => w.id === active.id);
			const newIndex = widgets.findIndex((w) => w.id === over.id);
			const reordered = arrayMove(widgets, oldIndex, newIndex);
			const updated = reordered.map((w, idx) => ({ ...w, order: idx }));

			// Store만 업데이트
			reorderWidgets(updated);
			setActiveId(null);
		},
		[widgets, reorderWidgets],
	);

	/**
	 * 크기 변경 - Store만 업데이트
	 */
	const handleResize = useCallback(
		(widgetId: string, newSize: WidgetLayout["size"]) => {
			resizeWidget(widgetId, newSize);
		},
		[resizeWidget],
	);

	/**
	 * 숨기기 - Store만 업데이트
	 */
	const handleHide = useCallback(
		(widgetId: string) => {
			hideWidget(widgetId);
		},
		[hideWidget],
	);

	return (
		<>
			<div className="space-y-6 pb-20">
				{/* 그리드 */}
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={visibleWidgets.map((w) => w.id)}
						strategy={rectSortingStrategy}
					>
						<div className="grid gap-responsive md:grid-cols-2">
							{visibleWidgets.map((widget) => (
								<SortableWidget
									key={widget.id}
									widget={widget}
									widgetData={widgetData}
									onResize={handleResize}
									onHide={handleHide}
								/>
							))}
						</div>
					</SortableContext>

					{/* 드래그 오버레이 (Cursor Follower) */}
					<DragOverlay dropAnimation={null}>
						{activeId && widgets.find((w) => w.id === activeId) ? (
							<WidgetCard
								widget={widgets.find((w) => w.id === activeId) as WidgetLayout}
								widgetData={widgetData}
								isDragging
								className="pointer-events-none rotate-2 opacity-90"
							/>
						) : null}
					</DragOverlay>
				</DndContext>

				{/* 빈 상태 */}
				{visibleWidgets.length === 0 && (
					<div className="py-16 text-center text-gray-500">
						<p className="mb-4">표시할 위젯이 없습니다</p>
						<WidgetGallery />
					</div>
				)}
			</div>

			{/* 하단 저장 바 */}
			<SaveChangesBar />
		</>
	);
}
