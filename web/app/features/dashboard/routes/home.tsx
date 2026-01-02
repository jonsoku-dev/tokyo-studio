import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { loaderHandler } from "~/shared/lib";
import { DashboardGrid } from "../components/DashboardGrid";
import * as dashboardService from "../domain/dashboard.service.server";
import * as widgetConfigService from "../domain/widget-config.service.server";

export function meta() {
	return [
		{ title: "대시보드 - Japan IT Job" },
		{ name: "description", content: "일본 취업의 모든 것이 한눈에" },
	];
}

/**
 * Dashboard Home Page Loader
 * 사용자의 위젯 설정을 불러옵니다
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

	return {
		widgets: config?.widgets || [],
	};
});

/**
 * Dashboard Home Page
 * 커스터마이즈 가능한 위젯 기반 대시보드
 */
export default function Home() {
	const data = useLoaderData<typeof loader>();

	// loaderHandler returns ApiResponse, so we need to check success
	if (!data.success) {
		return (
			<div className="">
				<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
					대시보드를 불러오는 중 오류가 발생했습니다.
				</div>
			</div>
		);
	}

	return (
		<div className="">
			<DashboardGrid initialWidgets={data.data.widgets} />
		</div>
	);
}
