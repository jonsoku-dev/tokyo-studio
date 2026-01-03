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
import { RotateCcw } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useFetcher, useRevalidator } from "react-router";
import { Button } from "~/shared/components/ui/Button";
import { useDashboardStore } from "../stores/dashboard.store";
import type { WidgetData } from "../types/widget-data.types";
import { SaveChangesBar } from "./SaveChangesBar";
import { Simple3DIcon } from "./Simple3DIcon";
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
	const fetcher = useFetcher();
	const revalidator = useRevalidator();
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

	/**
	 * 초기화 (서버 기본값으로)
	 */
	const handleReset = useCallback(() => {
		fetcher.submit(
			{ action: "reset" },
			{ method: "post", action: "/api/dashboard/widgets" },
		);
		isInitialized.current = false;
		revalidator.revalidate();
	}, [fetcher, revalidator]);

	return (
		<>
			<div className="space-y-6 pb-20">
				{/* 헤더 */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Simple3DIcon />
						<h1 className="font-bold text-2xl tracking-tight text-gray-900">
							대시보드
						</h1>
					</div>
					<div className="flex gap-2">
						<WidgetGallery />
						<Button variant="outline" size="sm" onClick={handleReset}>
							<RotateCcw className="mr-2 h-4 w-4" />
							초기화
						</Button>
					</div>
				</div>

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
						{activeId ? (
							<WidgetCard
								widget={widgets.find((w) => w.id === activeId)!}
								widgetData={widgetData}
								isDragging
								className="opacity-90 rotate-2 pointer-events-none"
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
