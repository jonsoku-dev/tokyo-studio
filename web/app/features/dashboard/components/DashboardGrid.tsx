import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { WidgetLayout } from "@itcom/db/schema";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/shared/components/ui/Button";
import { SortableWidget } from "./SortableWidget";
import { WidgetGallery } from "./WidgetGallery";

interface DashboardGridProps {
	initialWidgets: WidgetLayout[];
}

/**
 * 대시보드 그리드 컴포넌트
 * dnd-kit을 사용한 드래그앤드롭 위젯 시스템
 */
export function DashboardGrid({ initialWidgets }: DashboardGridProps) {
	const [widgets, setWidgets] = useState(initialWidgets);
	const fetcher = useFetcher();

	// dnd-kit 센서 설정 (마우스, 터치, 키보드 지원)
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // 8px 이동 후 드래그 시작 (클릭과 구분)
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	/**
	 * 드래그 종료 이벤트 핸들러
	 * 위젯 순서 변경 및 optimistic UI 업데이트
	 */
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return; // 같은 위치면 변경 없음
		}

		setWidgets((items) => {
			const oldIndex = items.findIndex((w) => w.id === active.id);
			const newIndex = items.findIndex((w) => w.id === over.id);

			// arrayMove로 순서 변경
			const reordered = arrayMove(items, oldIndex, newIndex);

			// order 속성 재계산
			const updated = reordered.map((widget, idx) => ({
				...widget,
				order: idx,
			}));

			// 서버에 optimistic update (백그라운드 저장)
			fetcher.submit(
				{
					action: "reorder",
					widgets: JSON.stringify(updated),
				},
				{
					method: "post",
					action: "/api/dashboard/widgets",
				},
			);

			return updated;
		});
	};

	/**
	 * 기본 레이아웃으로 초기화
	 */
	const handleReset = () => {
		fetcher.submit(
			{ action: "reset" },
			{
				method: "post",
				action: "/api/dashboard/widgets",
			},
		);
	};

	// Fetcher에서 새 위젯 데이터가 오면 반영
	if (fetcher.data && "widgets" in fetcher.data) {
		if (JSON.stringify(fetcher.data.widgets) !== JSON.stringify(widgets)) {
			setWidgets(fetcher.data.widgets);
		}
	}

	// 보이는 위젯만 필터링
	const visibleWidgets = widgets.filter((w) => w.visible);

	return (
		<div className="space-y-6">
			{/* 컨트롤 헤더 */}
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-2xl">대시보드</h1>
				<div className="flex gap-2">
					<WidgetGallery currentWidgets={widgets} />
					<Button variant="outline" size="sm" onClick={handleReset}>
						<RotateCcw className="mr-2 h-4 w-4" />
						초기화
					</Button>
				</div>
			</div>

			{/* 드래그앤드롭 그리드 */}
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={visibleWidgets.map((w) => w.id)}
					strategy={verticalListSortingStrategy}
				>
					<div className="grid gap-6 lg:grid-cols-2">
						{visibleWidgets.map((widget) => (
							<SortableWidget key={widget.id} widget={widget} />
						))}
					</div>
				</SortableContext>
			</DndContext>

			{/* 빈 상태 */}
			{visibleWidgets.length === 0 && (
				<div className="py-16 text-center text-gray-500">
					<p className="mb-4">표시할 위젯이 없습니다</p>
					<WidgetGallery currentWidgets={widgets} />
				</div>
			)}
		</div>
	);
}
