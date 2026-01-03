import type { LoaderFunctionArgs } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { actionHandler, loaderHandler } from "~/shared/lib";
import * as dashboardService from "../domain/dashboard.service.server";
import * as widgetConfigService from "../domain/widget-config.service.server";

/**
 * GET /api/dashboard/widgets
 * 사용자의 위젯 설정 조회
 */
export const loader = loaderHandler(async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request);

	// 기존 설정 조회
	const config = await widgetConfigService.getConfiguration(userId);

	if (config) {
		return { widgets: config.widgets };
	}

	// 설정이 없으면 Journey Stage 기반으로 기본 레이아웃 생성
	const stage = await dashboardService.getUserJourneyStage(userId);
	const defaultLayout = widgetConfigService.getDefaultLayout(stage);

	// 기본 설정 저장
	await widgetConfigService.saveConfiguration(userId, defaultLayout);

	return { widgets: defaultLayout };
});

/**
 * POST /api/dashboard/widgets
 * 위젯 레이아웃 저장 (드래그앤드롭, 크기 조절 등)
 */
export const action = actionHandler(async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const action = formData.get("action");

	// Batch save handling
	if (action === "batch") {
		const widgetsJson = formData.get("widgets") as string;
		if (!widgetsJson) {
			return { error: "위젯 데이터가 필요합니다" };
		}
		let widgets: unknown;
		try {
			widgets = JSON.parse(widgetsJson);
		} catch {
			return { error: "잘못된 JSON 형식입니다" };
		}
		if (!widgetConfigService.validateLayout(widgets)) {
			return { error: "잘못된 위젯 설정입니다" };
		}
		await widgetConfigService.saveConfiguration(userId, widgets);
		return { success: true, widgets };
	}

	// Reset action
	if (action === "reset") {
		const stage = await dashboardService.getUserJourneyStage(userId);
		const defaultLayout = widgetConfigService.getDefaultLayout(stage);
		await widgetConfigService.saveConfiguration(userId, defaultLayout);
		return { success: true, widgets: defaultLayout };
	}

	// Unknown action
	return { error: "알 수 없는 액션입니다" };
});
