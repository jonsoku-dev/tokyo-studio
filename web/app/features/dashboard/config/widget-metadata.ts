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
		minSize: "standard",
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
		minSize: "standard",
		maxSize: "expanded",
	},

	"pipeline-overview": {
		id: "pipeline-overview",
		name: "지원 현황",
		description: "채용 지원 현황을 단계별로 확인합니다",
		icon: "Briefcase",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
		visibilityCondition: (context) => context.hasApplications,
	},

	"mentor-sessions": {
		id: "mentor-sessions",
		name: "멘토링 세션",
		description: "예정된 멘토링과 최근 세션 내역",
		icon: "Users",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
		visibilityCondition: (context) => context.hasSessions,
	},

	"settlement-checklist": {
		id: "settlement-checklist",
		name: "정착 체크리스트",
		description: "일본 정착을 위한 필수 준비 사항",
		icon: "ListChecks",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
		visibilityCondition: (context) => context.hasArrivalDate,
	},

	"community-highlights": {
		id: "community-highlights",
		name: "커뮤니티 하이라이트",
		description: "인기 게시글과 최신 커뮤니티 소식",
		icon: "MessageSquare",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
	},

	"document-hub": {
		id: "document-hub",
		name: "문서 허브",
		description: "최근 업로드한 문서와 저장공간 사용량",
		icon: "FileText",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
	},

	"notifications-center": {
		id: "notifications-center",
		name: "알림 센터",
		description: "읽지 않은 알림과 중요 소식",
		icon: "Bell",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
	},

	"mentor-application": {
		id: "mentor-application",
		name: "멘토 신청 현황",
		description: "멘토 지원 심사 진행 상황",
		icon: "UserCheck",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
		visibilityCondition: (context) => context.hasMentorApplication,
	},

	// Phase 3A - High Priority
	"profile-completion": {
		id: "profile-completion",
		name: "프로필 완성도",
		description: "프로필 완성률과 누락된 정보를 확인합니다",
		icon: "UserCircle",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
	},

	"career-diagnosis-summary": {
		id: "career-diagnosis-summary",
		name: "진단 결과 요약",
		description: "커리어 진단 결과와 맞춤형 추천",
		icon: "Target",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
		visibilityCondition: (context) => context.hasProfile,
	},

	"interview-prep": {
		id: "interview-prep",
		name: "면접 준비",
		description: "다가오는 면접 일정과 준비 현황",
		icon: "Video",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
		visibilityCondition: (context) => context.hasApplications,
	},

	"weekly-calendar": {
		id: "weekly-calendar",
		name: "주간 일정",
		description: "이번 주 멘토링, 면접 일정 통합 보기",
		icon: "Calendar",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
	},

	// Phase 3B - Medium Priority
	"nearby-locations": {
		id: "nearby-locations",
		name: "주변 장소",
		description: "즐겨찾기한 장소 빠른 접근",
		icon: "MapPin",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
	},

	"job-posting-tracker": {
		id: "job-posting-tracker",
		name: "관심 공고",
		description: "저장한 채용 공고와 마감일 추적",
		icon: "Bookmark",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
	},

	achievements: {
		id: "achievements",
		name: "업적/배지",
		description: "획득한 배지와 다음 목표",
		icon: "Award",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
	},

	"skill-radar": {
		id: "skill-radar",
		name: "스킬 레이더",
		description: "기술 스택 시각화와 성장 영역",
		icon: "Radar",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
		visibilityCondition: (context) => context.hasProfile,
	},

	// Phase 3C - Lower Priority
	"japanese-study": {
		id: "japanese-study",
		name: "일본어 학습",
		description: "JLPT 레벨과 학습 진행 현황",
		icon: "BookOpen",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
	},

	"reputation-stats": {
		id: "reputation-stats",
		name: "평판 통계",
		description: "커뮤니티 평판 점수와 활동 통계",
		icon: "TrendingUp",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
	},

	"quick-search": {
		id: "quick-search",
		name: "빠른 검색",
		description: "멘토, 커뮤니티, 공고 빠른 검색",
		icon: "Search",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
	},

	"subscription-status": {
		id: "subscription-status",
		name: "구독 상태",
		description: "현재 플랜과 사용량 확인",
		icon: "Crown",
		defaultSize: "standard",
		minSize: "standard",
		maxSize: "expanded",
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
			"profile-completion",
		] as WidgetId[],
	},
	career: {
		name: "커리어",
		description: "취업 준비 및 진단",
		widgets: [
			"career-diagnosis-summary",
			"skill-radar",
			"interview-prep",
			"job-posting-tracker",
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
			"reputation-stats",
		] as WidgetId[],
	},
	tools: {
		name: "도구",
		description: "문서 관리, 알림, 검색",
		widgets: [
			"document-hub",
			"notifications-center",
			"quick-search",
			"weekly-calendar",
		] as WidgetId[],
	},
	lifestyle: {
		name: "생활",
		description: "정착 및 학습 지원",
		widgets: [
			"nearby-locations",
			"japanese-study",
			"achievements",
			"subscription-status",
		] as WidgetId[],
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
