import type { WidgetId, WidgetLayout } from "@itcom/db/schema";
import { lazy, Suspense } from "react";
import { WidgetSkeleton } from "./shared/WidgetSkeleton";

/**
 * 위젯 컴포넌트 레지스트리
 * lazy loading으로 코드 분할 최적화
 *
 * 새 위젯 추가 시:
 * 1. widgets/ 폴더에 위젯 컴포넌트 생성
 * 2. widgetComponents 객체에 lazy import 추가
 */
const widgetComponents = {
	"journey-progress": lazy(() => import("./widgets/JourneyProgressWidget")),
	"priority-actions": lazy(() => import("./widgets/PriorityActionsWidget")),
	"roadmap-snapshot": lazy(() => import("./widgets/RoadmapSnapshotWidget")),
	"pipeline-overview": lazy(() => import("./widgets/PipelineOverviewWidget")),
	"mentor-sessions": lazy(() => import("./widgets/MentorSessionsWidget")),
	"settlement-checklist": lazy(
		() => import("./widgets/SettlementChecklistWidget"),
	),
	"community-highlights": lazy(
		() => import("./widgets/CommunityHighlightsWidget"),
	),
	"document-hub": lazy(() => import("./widgets/DocumentHubWidget")),
	"notifications-center": lazy(() => import("./widgets/NotificationsWidget")),
	"mentor-application": lazy(() => import("./widgets/MentorApplicationWidget")),
};

interface WidgetRendererProps {
	id: WidgetId;
	size: WidgetLayout["size"];
}

/**
 * Widget Renderer
 * ID와 크기에 따라 적절한 위젯 컴포넌트를 렌더링
 */
export function WidgetRenderer({ id, size }: WidgetRendererProps) {
	const Component = widgetComponents[id];

	if (!Component) {
		return (
			<div className="py-8 text-center text-gray-400">
				<p>알 수 없는 위젯: {id}</p>
			</div>
		);
	}

	return (
		<Suspense fallback={<WidgetSkeleton size={size} />}>
			<Component size={size} />
		</Suspense>
	);
}
