import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { WidgetLayout } from "@itcom/db/schema";
import { GripVertical } from "lucide-react";
import { getWidgetMetadata } from "../config/widget-metadata";
import { WidgetActions } from "./WidgetActions";
import { WidgetRenderer } from "./WidgetRenderer";

interface SortableWidgetProps {
	widget: WidgetLayout;
}

/**
 * Sortable Widget Wrapper
 * dnd-kit의 useSortable 훅을 사용하여 드래그 가능한 위젯 래퍼
 */
export function SortableWidget({ widget }: SortableWidgetProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: widget.id });

	const metadata = getWidgetMetadata(widget.id);

	// Transform 스타일 적용
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	// 크기별 Grid Span 클래스
	const sizeClasses = {
		compact: "", // 1칸
		standard: "", // 1칸
		expanded: "lg:col-span-2", // 2칸 (데스크톱에서만)
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`card relative ${sizeClasses[widget.size]}
        ${isDragging ? "z-50 shadow-2xl" : ""}
      `}
		>
			{/* 드래그 핸들 헤더 */}
			<div className="mb-4 flex items-center gap-2 border-gray-100 border-b pb-4">
				{/* 드래그 아이콘 */}
				<button
					type="button"
					className="cursor-grab touch-none rounded p-1 hover:bg-gray-100 active:cursor-grabbing"
					{...attributes}
					{...listeners}
				>
					<GripVertical className="h-4 w-4 text-gray-400" />
				</button>

				{/* 위젯 제목 */}
				<h3 className="flex-1 font-semibold text-gray-900">{metadata.name}</h3>

				{/* 액션 메뉴 */}
				<WidgetActions widgetId={widget.id} currentSize={widget.size} />
			</div>

			{/* 위젯 컨텐츠 */}
			<WidgetRenderer id={widget.id} size={widget.size} />
		</div>
	);
}
