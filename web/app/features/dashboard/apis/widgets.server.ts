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

	// Resize 액션
	if (action === "resize") {
		const widgetId = formData.get("widgetId") as string;
		const size = formData.get("size") as string;

		if (!widgetId || !size) {
			return { error: "위젯 ID와 크기가 필요합니다" };
		}

		const config = await widgetConfigService.getConfiguration(userId);
		if (!config) {
			return { error: "위젯 설정을 찾을 수 없습니다" };
		}

		const updatedWidgets = config.widgets.map((w) =>
			w.id === widgetId ? { ...w, size } : w,
		) as typeof config.widgets;

		await widgetConfigService.saveConfiguration(userId, updatedWidgets);
		return { success: true };
	}

	// Hide 액션
	if (action === "hide") {
		const widgetId = formData.get("widgetId") as string;

		if (!widgetId) {
			return { error: "위젯 ID가 필요합니다" };
		}

		const config = await widgetConfigService.getConfiguration(userId);
		if (!config) {
			return { error: "위젯 설정을 찾을 수 없습니다" };
		}

		const updatedWidgets = config.widgets.map((w) =>
			w.id === widgetId ? { ...w, visible: false } : w,
		) as typeof config.widgets;

		await widgetConfigService.saveConfiguration(userId, updatedWidgets);
		return { success: true };
	}

	// Show (위젯 갤러리에서 추가)
	if (action === "show") {
		const widgetId = formData.get("widgetId") as string;

		if (!widgetId) {
			return { error: "위젯 ID가 필요합니다" };
		}

		const config = await widgetConfigService.getConfiguration(userId);
		if (!config) {
			return { error: "위젯 설정을 찾을 수 없습니다" };
		}

		const updatedWidgets = config.widgets.map((w) =>
			w.id === widgetId ? { ...w, visible: true } : w,
		) as typeof config.widgets;

		await widgetConfigService.saveConfiguration(userId, updatedWidgets);
		return { success: true };
	}

	// Reorder (드래그앤드롭)
	if (action === "reorder") {
		const widgetsJson = formData.get("widgets");

		if (typeof widgetsJson !== "string") {
			return { error: "잘못된 요청입니다" };
		}

		let widgets: unknown;
		try {
			widgets = JSON.parse(widgetsJson);
		} catch {
			return { error: "잘못된 JSON 형식입니다" };
		}

		// 유효성 검증
		if (!widgetConfigService.validateLayout(widgets)) {
			return { error: "잘못된 위젯 설정입니다" };
		}

		// 저장
		await widgetConfigService.saveConfiguration(userId, widgets);
		return { success: true };
	}

	// Reset (기본 레이아웃으로 초기화)
	if (action === "reset") {
		const stage = await dashboardService.getUserJourneyStage(userId);
		const defaultLayout = widgetConfigService.getDefaultLayout(stage);

		await widgetConfigService.saveConfiguration(userId, defaultLayout);
		return { success: true, widgets: defaultLayout };
	}

	return { error: "알 수 없는 액션입니다" };
});
