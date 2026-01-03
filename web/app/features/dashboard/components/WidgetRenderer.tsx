import type { WidgetId, WidgetLayout } from "@itcom/db/schema";
import { lazy, Suspense } from "react";
import type { WidgetData } from "../types/widget-data.types";
import { WidgetSkeleton } from "./shared/WidgetSkeleton";

/**
 * 위젯 컴포넌트 레지스트리
 * lazy loading으로 코드 분할 최적화
 *
 * 새 위젯 추가 시:
 * 1. widgets/ 폴더에 위젯 컴포넌트 생성
 * 2. widgetComponents 객체에 lazy import 추가
 */
const widgetComponents: Record<
	string,
	React.LazyExoticComponent<
		React.ComponentType<{ size: WidgetLayout["size"]; widgetData: WidgetData }>
	>
> = {
	// Phase 1
	"journey-progress": lazy(() => import("./widgets/JourneyProgressWidget")),
	"priority-actions": lazy(() => import("./widgets/PriorityActionsWidget")),
	"roadmap-snapshot": lazy(() => import("./widgets/RoadmapSnapshotWidget")),
	// Phase 2
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
	// Phase 3A
	"profile-completion": lazy(() => import("./widgets/ProfileCompletionWidget")),
	"career-diagnosis-summary": lazy(
		() => import("./widgets/CareerDiagnosisSummaryWidget"),
	),
	"interview-prep": lazy(() => import("./widgets/InterviewPrepWidget")),
	"weekly-calendar": lazy(() => import("./widgets/WeeklyCalendarWidget")),
	// Phase 3B
	"nearby-locations": lazy(() => import("./widgets/NearbyLocationsWidget")),
	"job-posting-tracker": lazy(
		() => import("./widgets/JobPostingTrackerWidget"),
	),
	achievements: lazy(() => import("./widgets/AchievementsWidget")),
	"skill-radar": lazy(() => import("./widgets/SkillRadarWidget")),
	// Phase 3C
	"japanese-study": lazy(() => import("./widgets/JapaneseStudyWidget")),
	"reputation-stats": lazy(() => import("./widgets/ReputationStatsWidget")),
	"quick-search": lazy(() => import("./widgets/QuickSearchWidget")),
	"subscription-status": lazy(
		() => import("./widgets/SubscriptionStatusWidget"),
	),
};

interface WidgetRendererProps {
	id: WidgetId;
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

/**
 * Widget Renderer
 * ID와 크기에 따라 적절한 위젯 컴포넌트를 렌더링
 */
export function WidgetRenderer({ id, size, widgetData }: WidgetRendererProps) {
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
			<Component size={size} widgetData={widgetData} />
		</Suspense>
	);
}
