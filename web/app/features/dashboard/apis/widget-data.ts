import type { LoaderFunctionArgs } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { loaderHandler } from "~/shared/lib";
import * as widgetDataService from "../domain/widget-data.service.server";

/**
 * GET /api/dashboard/widget-data
 * 모든 위젯 데이터를 한 번에 조회
 */
export const loader = loaderHandler(async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request);

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
	] = await Promise.all([
		widgetDataService.getPipelineOverviewData(userId),
		widgetDataService.getMentorSessionsData(userId),
		widgetDataService.getCommunityHighlightsData(userId),
		widgetDataService.getDocumentHubData(userId),
		widgetDataService.getJourneyProgressData(userId),
		widgetDataService.getPriorityActionsData(userId),
		widgetDataService.getRoadmapSnapshotData(userId),
		widgetDataService.getMentorApplicationData(userId),
	]);

	return {
		pipeline: pipelineData,
		mentorSessions: mentorSessionsData,
		community: communityData,
		documents: documentData,
		journey: journeyData,
		priority: priorityData,
		roadmap: roadmapData,
		mentorApplication: mentorApplicationData,
	};
});
