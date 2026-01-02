import type { WidgetId, WidgetMetadata } from "@itcom/db/schema";

/**
 * Widget Registry System
 * 위젯 등록 및 관리를 위한 확장 가능한 시스템
 *
 * 새로운 위젯 추가 방법:
 * 1. schema.ts의 WidgetId에 새 위젯 ID 추가
 * 2. 이 파일의 WIDGET_REGISTRY에 새 위젯 추가
 * 3. widgets/ 폴더에 새 위젯 컴포넌트 생성
 * 4. WidgetRenderer에 lazy import 추가
 */

/**
 * Widget Registry - Single Source of Truth
 * 모든 위젯 메타데이터를 여기서 관리
 */
export const WIDGET_REGISTRY: Record<WidgetId, WidgetMetadata> = {
	"journey-progress": {
		id: "journey-progress",
		name: "여정 진행률",
		description: "일본 취업 여정의 전체 진행 상황을 시각화합니다",
		icon: "TrendingUp",
		defaultSize: "standard",
		minSize: "compact",
		maxSize: "expanded",
	},

	"priority-actions": {
		id: "priority-actions",
		name: "우선순위 작업",
		description: "오늘 완료해야 할 가장 중요한 3가지 작업",
		icon: "CheckSquare",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
	},

	"roadmap-snapshot": {
		id: "roadmap-snapshot",
		name: "로드맵 스냅샷",
		description: "현재 진행 중인 로드맵 단계와 오늘의 할 일",
		icon: "Map",
		defaultSize: "standard",
		minSize: "compact",
		maxSize: "expanded",
	},

	"pipeline-overview": {
		id: "pipeline-overview",
		name: "지원 현황",
		description: "채용 지원 현황을 단계별로 확인합니다",
		icon: "Briefcase",
		defaultSize: "standard",
		minSize: "compact",
		maxSize: "expanded",
		visibilityCondition: (context) => context.hasApplications,
	},

	"mentor-sessions": {
		id: "mentor-sessions",
		name: "멘토링 세션",
		description: "예정된 멘토링과 최근 세션 내역",
		icon: "Users",
		defaultSize: "standard",
		minSize: "compact",
		maxSize: "expanded",
		visibilityCondition: (context) => context.hasSessions,
	},

	"settlement-checklist": {
		id: "settlement-checklist",
		name: "정착 체크리스트",
		description: "일본 정착을 위한 필수 준비 사항",
		icon: "ListChecks",
		defaultSize: "standard",
		minSize: "compact",
		maxSize: "expanded",
		visibilityCondition: (context) => context.hasArrivalDate,
	},

	"community-highlights": {
		id: "community-highlights",
		name: "커뮤니티 하이라이트",
		description: "인기 게시글과 최신 커뮤니티 소식",
		icon: "MessageSquare",
		defaultSize: "standard",
		minSize: "compact",
		maxSize: "expanded",
	},

	"document-hub": {
		id: "document-hub",
		name: "문서 허브",
		description: "최근 업로드한 문서와 저장공간 사용량",
		icon: "FileText",
		defaultSize: "compact",
		minSize: "compact",
		maxSize: "standard",
	},

	"notifications-center": {
		id: "notifications-center",
		name: "알림 센터",
		description: "읽지 않은 알림과 중요 소식",
		icon: "Bell",
		defaultSize: "compact",
		minSize: "compact",
		maxSize: "standard",
	},

	"mentor-application": {
		id: "mentor-application",
		name: "멘토 신청 현황",
		description: "멘토 지원 심사 진행 상황",
		icon: "UserCheck",
		defaultSize: "compact",
		minSize: "compact",
		maxSize: "standard",
		visibilityCondition: (context) => context.hasMentorApplication,
	},
};

/**
 * Widget 카테고리 (선택사항 - 위젯 갤러리에서 그룹화할 때 사용)
 */
export const WIDGET_CATEGORIES = {
	core: {
		name: "핵심",
		description: "모든 사용자에게 필수적인 위젯",
		widgets: [
			"journey-progress",
			"priority-actions",
			"roadmap-snapshot",
		] as WidgetId[],
	},
	progress: {
		name: "진행 상황",
		description: "취업 준비 및 정착 진행도",
		widgets: ["pipeline-overview", "settlement-checklist"] as WidgetId[],
	},
	community: {
		name: "커뮤니티",
		description: "멘토링 및 커뮤니티 활동",
		widgets: [
			"mentor-sessions",
			"community-highlights",
			"mentor-application",
		] as WidgetId[],
	},
	tools: {
		name: "도구",
		description: "문서 관리 및 알림",
		widgets: ["document-hub", "notifications-center"] as WidgetId[],
	},
} as const;

/**
 * 위젯 메타데이터 조회
 */
export function getWidgetMetadata(id: WidgetId): WidgetMetadata {
	const widget = WIDGET_REGISTRY[id];
	if (!widget) {
		throw new Error(`Unknown widget ID: ${id}`);
	}
	return widget;
}

/**
 * 모든 위젯 메타데이터 조회
 */
export function getAllWidgetMetadata(): WidgetMetadata[] {
	return Object.values(WIDGET_REGISTRY);
}

/**
 * 사용 가능한 위젯 필터링 (visibility condition 고려)
 */
export function getAvailableWidgets(context: {
	hasProfile: boolean;
	hasApplications: boolean;
	hasSessions: boolean;
	hasArrivalDate: boolean;
	hasMentorApplication: boolean;
}): WidgetMetadata[] {
	return getAllWidgetMetadata().filter((widget) => {
		if (!widget.visibilityCondition) {
			return true; // Always available
		}
		return widget.visibilityCondition(context);
	});
}

/**
 * 위젯 ID 유효성 검사
 */
export function isValidWidgetId(id: string): id is WidgetId {
	return id in WIDGET_REGISTRY;
}

/**
 * 카테고리별 위젯 조회
 */
export function getWidgetsByCategory(
	category: keyof typeof WIDGET_CATEGORIES,
): WidgetMetadata[] {
	const categoryDef = WIDGET_CATEGORIES[category];
	return categoryDef.widgets.map((id) => getWidgetMetadata(id));
}
