import type { WidgetLayout } from "@itcom/db/schema";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "~/shared/utils/cn";
import { getWidgetMetadata } from "../config/widget-metadata";
import type { WidgetData } from "../types/widget-data.types";
import { WidgetActions } from "./WidgetActions";
import { WidgetRenderer } from "./WidgetRenderer";

interface WidgetCardProps {
	widget: WidgetLayout;
	widgetData: WidgetData;
	onResize?: (widgetId: string, newSize: WidgetLayout["size"]) => void;
	onHide?: (widgetId: string) => void;
	dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
	isDragging?: boolean;
	style?: React.CSSProperties;
	className?: string;
}

/**
 * 위젯 카드 UI 컴포넌트
 * - 순수 프레젠테이션 컴포넌트 (dnd 로직 없음)
 * - SortableWidget과 DragOverlay에서 공통 사용
 * - Framer Motion으로 인터랙티브 효과 추가
 */
export const WidgetCard = forwardRef<HTMLDivElement, WidgetCardProps>(
	(
		{
			widget,
			widgetData,
			onResize,
			onHide,
			dragHandleProps,
			isDragging,
			style,
			className = "",
		},
		ref,
	) => {
		const metadata = getWidgetMetadata(widget.id);

		// 크기별 Grid Span 클래스
		const sizeClasses = {
			compact: "", // 1칸
			standard: "", // 1칸
			expanded: "md:col-span-2", // 2칸 (데스크톱에서만)
		};

		return (
			<motion.div
				ref={ref}
				style={style}
				layoutId={isDragging ? undefined : widget.id} // Dragging 중에는 layout 애니메이션 비활성화
				initial={{ opacity: 0, y: 10, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.3 }}
				whileHover={{
					scale: isDragging ? 1.02 : 1.01,
					y: isDragging ? 0 : -2,
					boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)",
				}}
				whileTap={{ scale: 0.98 }}
				className={cn(
					"card relative flex flex-col gap-4 overflow-hidden bg-white",
					sizeClasses[widget.size],
					isDragging
						? "z-50 rotate-1 scale-[1.02] shadow-2xl ring-2 ring-indigo-500/20"
						: "border border-gray-100/80 shadow-sm",
					className,
				)}
			>
				{/* 드래그 핸들 헤더 */}
				<div
					className={cn(
						"flex items-center gap-2 border-gray-100/50 border-b pb-2",
						isDragging ? "bg-indigo-50/50" : "bg-white",
					)}
				>
					{/* 드래그 아이콘 */}
					<button
						type="button"
						className={cn(
							"cursor-grab touch-none rounded p-1 transition-colors active:cursor-grabbing",
							isDragging
								? "cursor-grabbing bg-indigo-50 text-indigo-500"
								: "text-gray-300 hover:bg-gray-100 hover:text-gray-500",
						)}
						{...dragHandleProps}
					>
						<GripVertical className="h-4 w-4" />
					</button>

					{/* 위젯 제목 - Primary Color Emphasis */}
					<h3 className="flex flex-1 items-center gap-2 font-semibold text-gray-800 text-sm tracking-tight">
						{metadata.name}
					</h3>

					{/* 액션 메뉴 */}
					<WidgetActions
						widgetId={widget.id}
						currentSize={widget.size}
						onResize={onResize}
						onHide={onHide}
					/>
				</div>

				{/* 위젯 컨텐츠 - 패딩 제거 (card 클래스가 이미 처리) */}
				<div className="flex-1">
					<WidgetRenderer
						id={widget.id}
						size={widget.size}
						widgetData={widgetData}
					/>
				</div>
			</motion.div>
		);
	},
);

WidgetCard.displayName = "WidgetCard";
