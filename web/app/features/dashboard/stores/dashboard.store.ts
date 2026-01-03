import type { WidgetLayout } from "@itcom/db/schema";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface DashboardStore {
	// State
	widgets: WidgetLayout[];
	originalWidgets: WidgetLayout[]; // 서버에서 받은 원본
	hasChanges: boolean;
	isSaving: boolean;

	// Actions
	initializeWidgets: (widgets: WidgetLayout[]) => void;
	resizeWidget: (widgetId: string, size: WidgetLayout["size"]) => void;
	hideWidget: (widgetId: string) => void;
	showWidget: (widgetId: string) => void;
	reorderWidgets: (widgets: WidgetLayout[]) => void;
	markSaved: () => void;
	discardChanges: () => void;
	setIsSaving: (isSaving: boolean) => void;
	setWidgets: (widgets: WidgetLayout[]) => void;

	// Selectors
	getVisibleWidgets: () => WidgetLayout[];
	getHiddenWidgets: () => WidgetLayout[];
}

/**
 * 변경사항 비교 함수
 */
function hasWidgetChanges(
	current: WidgetLayout[],
	original: WidgetLayout[],
): boolean {
	if (current.length !== original.length) return true;
	return current.some((w, i) => {
		const orig = original[i];
		return (
			w.id !== orig.id ||
			w.size !== orig.size ||
			w.visible !== orig.visible ||
			w.order !== orig.order
		);
	});
}

/**
 * Dashboard Zustand Store
 *
 * 단방향 데이터 흐름 + Pending Changes 추적:
 * 1. Server → initializeWidgets (originalWidgets 세팅)
 * 2. User Action → widgets 변경 → hasChanges 계산
 * 3. Save → Server 저장 → markSaved (originalWidgets 동기화)
 */
export const useDashboardStore = create<DashboardStore>()(
	subscribeWithSelector((set, get) => ({
		// Initial state
		widgets: [],
		originalWidgets: [],
		hasChanges: false,
		isSaving: false,

		// 초기화 (서버 "->", size);
		initializeWidgets: (widgets: WidgetLayout[]) => {
			console.log("[DashboardStore] initializeWidgets:", widgets);
			set({
				widgets: widgets,
				originalWidgets: JSON.parse(JSON.stringify(widgets)), // Deep copy
				hasChanges: false,
			});
		},

		// Resize widget
		resizeWidget: (widgetId: string, size: WidgetLayout["size"]) => {
			set((state) => {
				const newWidgets = state.widgets.map((w) =>
					w.id === widgetId ? { ...w, size } : w,
				);
				return {
					widgets: newWidgets,
					hasChanges: hasWidgetChanges(newWidgets, state.originalWidgets),
				};
			});
		},

		// 숨기기
		hideWidget: (widgetId: string) => {
			console.log("[DashboardStore] hideWidget:", widgetId);
			set((state) => {
				const newWidgets = state.widgets.map((w) =>
					w.id === widgetId ? { ...w, visible: false } : w,
				);
				return {
					widgets: newWidgets,
					hasChanges: hasWidgetChanges(newWidgets, state.originalWidgets),
				};
			});
		},

		// 보이기
		showWidget: (widgetId: string) => {
			console.log("[DashboardStore] showWidget:", widgetId);
			set((state) => {
				const newWidgets = state.widgets.map((w) =>
					w.id === widgetId ? { ...w, visible: true } : w,
				);
				return {
					widgets: newWidgets,
					hasChanges: hasWidgetChanges(newWidgets, state.originalWidgets),
				};
			});
		},

		// 순서 변경
		reorderWidgets: (widgets: WidgetLayout[]) => {
			console.log("[DashboardStore] reorderWidgets");
			set((state) => ({
				widgets,
				hasChanges: hasWidgetChanges(widgets, state.originalWidgets),
			}));
		},

		// 저장 완료 마킹
		markSaved: () => {
			console.log("[DashboardStore] markSaved");
			set((state) => ({
				originalWidgets: JSON.parse(JSON.stringify(state.widgets)),
				hasChanges: false,
				isSaving: false,
			}));
		},

		// 변경사항 취소
		discardChanges: () => {
			console.log("[DashboardStore] discardChanges");
			set((state) => ({
				widgets: JSON.parse(JSON.stringify(state.originalWidgets)),
				hasChanges: false,
			}));
		},

		// setWidgets action for batch save
		setWidgets: (widgets: WidgetLayout[]) => {
			set({
				widgets,
				hasChanges: hasWidgetChanges(widgets, get().originalWidgets),
			});
		},

		// 저장 중 상태
		setIsSaving: (isSaving: boolean) => {
			set({ isSaving });
		},

		// Selectors
		getVisibleWidgets: () => {
			return get().widgets.filter((w) => w.visible);
		},

		getHiddenWidgets: () => {
			return get().widgets.filter((w) => !w.visible);
		},
	})),
);

/**
 * Selectors for optimized re-renders
 */
export const selectWidgets = (state: DashboardStore) => state.widgets;
export const selectVisibleWidgets = (state: DashboardStore) =>
	state.widgets.filter((w) => w.visible);
export const selectHiddenWidgets = (state: DashboardStore) =>
	state.widgets.filter((w) => !w.visible);
export const selectHiddenCount = (state: DashboardStore) =>
	state.widgets.filter((w) => !w.visible).length;
export const selectHasChanges = (state: DashboardStore) => state.hasChanges;
export const selectIsSaving = (state: DashboardStore) => state.isSaving;
