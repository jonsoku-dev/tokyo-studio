import { CSS } from "@dnd-kit/utilities";
import type { WidgetLayout } from "@itcom/db/schema";
import { useSortable } from "@dnd-kit/sortable";
import { getWidgetMetadata } from "../config/widget-metadata";
import type { WidgetData } from "../types/widget-data.types";
import { WidgetCard } from "./WidgetCard";

interface SortableWidgetProps {
	widget: WidgetLayout;
	widgetData: WidgetData;
	onResize?: (widgetId: string, newSize: WidgetLayout["size"]) => void;
	onHide?: (widgetId: string) => void;
}

/**
 * Sortable Widget Wrapper
 * dnd-kit의 useSortable 훅을 사용하여 드래그 가능한 위젯 래퍼
 */
export function SortableWidget({
	widget,
	widgetData,
	onResize,
	onHide,
}: SortableWidgetProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: widget.id });

	const _metadata = getWidgetMetadata(widget.id);

	// Transform 스타일 적용
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0 : 1, // 드래깅 중에는 원본을 숨김 (Placeholder 역할)
	};

	return (
		<WidgetCard
			ref={setNodeRef}
			style={style}
			widget={widget}
			widgetData={widgetData}
			onResize={onResize}
			onHide={onHide}
			dragHandleProps={{ ...attributes, ...listeners }}
			isDragging={isDragging}
		/>
	);
}
