import { RotateCcw } from "lucide-react";
import type { LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { Button } from "~/shared/components/ui/Button";
import { loaderHandler } from "~/shared/lib";
import { DashboardGrid } from "../components/DashboardGrid";
import { WidgetGallery } from "../components/WidgetGallery";
import * as dashboardService from "../domain/dashboard.service.server";
import * as widgetConfigService from "../domain/widget-config.service.server";
import * as widgetDataService from "../domain/widget-data.service.server";

export function meta() {
	return [
		{ title: "대시보드 - Japan IT Job" },
		{ name: "description", content: "일본 취업의 모든 것이 한눈에" },
	];
}

/**
 * Dashboard Home Page Loader
 * 사용자의 위젯 설정과 데이터를 불러옵니다
 */
export const loader = loaderHandler(async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request);

	// 기존 설정 조회
	let config = await widgetConfigService.getConfiguration(userId);

	// 설정이 없으면 Journey Stage 기반으로 기본 레이아웃 생성
	if (!config) {
		const stage = await dashboardService.getUserJourneyStage(userId);
		const defaultLayout = widgetConfigService.getDefaultLayout(stage);
		await widgetConfigService.saveConfiguration(userId, defaultLayout);
		config = await widgetConfigService.getConfiguration(userId);
	}

	// 모든 위젯 데이터 병렬 조회
	const [
		pipelineData,
		mentorSessionsData,
		communityData,
		documentData,
		journeyData,
		priorityData,
		roadmapData,
		mentorApplicationData,
		// Phase 3A
		profileCompletionData,
		careerDiagnosisData,
		interviewPrepData,
		weeklyCalendarData,
		// Phase 3B
		nearbyLocationsData,
		jobPostingTrackerData,
		achievementsData,
		skillRadarData,
		// Phase 3C
		japaneseStudyData,
		reputationStatsData,
		quickSearchData,
		subscriptionStatusData,
	] = await Promise.all([
		widgetDataService.getPipelineOverviewData(userId),
		widgetDataService.getMentorSessionsData(userId),
		widgetDataService.getCommunityHighlightsData(userId),
		widgetDataService.getDocumentHubData(userId),
		widgetDataService.getJourneyProgressData(userId),
		widgetDataService.getPriorityActionsData(userId),
		widgetDataService.getRoadmapSnapshotData(userId),
		widgetDataService.getMentorApplicationData(userId),
		// Phase 3A
		widgetDataService.getProfileCompletionData(userId),
		widgetDataService.getCareerDiagnosisData(userId),
		widgetDataService.getInterviewPrepData(userId),
		widgetDataService.getWeeklyCalendarData(userId),
		// Phase 3B
		widgetDataService.getNearbyLocationsData(userId),
		widgetDataService.getJobPostingTrackerData(userId),
		widgetDataService.getAchievementsData(userId),
		widgetDataService.getSkillRadarData(userId),
		// Phase 3C
		widgetDataService.getJapaneseStudyData(userId),
		widgetDataService.getReputationStatsData(userId),
		widgetDataService.getQuickSearchData(userId),
		widgetDataService.getSubscriptionStatusData(userId),
	]);

	return {
		widgets: config?.widgets || [],
		widgetData: {
			// Phase 1 & 2
			pipeline: pipelineData,
			mentorSessions: mentorSessionsData,
			community: communityData,
			documents: documentData,
			journey: journeyData,
			priority: priorityData,
			roadmap: roadmapData,
			mentorApplication: mentorApplicationData,
			// Phase 3A
			profileCompletion: profileCompletionData,
			careerDiagnosis: careerDiagnosisData,
			interviewPrep: interviewPrepData,
			weeklyCalendar: weeklyCalendarData,
			// Phase 3B
			nearbyLocations: nearbyLocationsData,
			jobPostingTracker: jobPostingTrackerData,
			achievements: achievementsData,
			skillRadar: skillRadarData,
			// Phase 3C
			japaneseStudy: japaneseStudyData,
			reputationStats: reputationStatsData,
			quickSearch: quickSearchData,
			subscriptionStatus: subscriptionStatusData,
		},
	};
});

/**
 * Dashboard Home Page
 * 커스터마이즈 가능한 위젯 기반 대시보드
 */
export default function Home() {
	const data = useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	// loaderHandler returns ApiResponse, so we need to check success
	if (!data.success) {
		return (
			<div className="">
				<div className="rounded-lg border border-red-200 bg-red-50 p-responsive text-red-700">
					대시보드를 불러오는 중 오류가 발생했습니다.
				</div>
			</div>
		);
	}

	const handleReset = () => {
		fetcher.submit(
			{ action: "reset" },
			{ method: "post", action: "/api/dashboard/widgets" },
		);
	};

	// Generate a simple key to force re-mount when widgets structure changes (e.g. reset)
	const widgetsKey = JSON.stringify(data.data.widgets.map((w) => w.id));

	return (
		<div className="relative min-h-screen">
			<div className="relative z-10">
				<PageHeader
					title="대시보드"
					description="일본 취업의 모든 것이 한눈에"
					actions={
						<div className="flex gap-2">
							<WidgetGallery />
							<Button variant="outline" size="sm" onClick={handleReset}>
								<RotateCcw className="mr-2 h-4 w-4" />
								초기화
							</Button>
						</div>
					}
				>
					<DashboardGrid
						key={widgetsKey}
						initialWidgets={data.data.widgets}
						widgetData={data.data.widgetData}
					/>
				</PageHeader>
			</div>
		</div>
	);
}
