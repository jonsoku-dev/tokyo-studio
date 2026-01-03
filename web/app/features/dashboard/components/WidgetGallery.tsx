import type { WidgetId } from "@itcom/db/schema";
import { CheckCircle2, Grid3x3, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/shared/components/ui/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/shared/components/ui/Dialog";
import {
	getWidgetMetadata,
	WIDGET_CATEGORIES,
	WIDGET_REGISTRY,
} from "../config/widget-metadata";
import { useDashboardStore } from "../stores/dashboard.store";

/**
 * Widget Gallery - 단방향 데이터 흐름
 * Store → UI (읽기), User Action → Store → Server (쓰기)
 */
export function WidgetGallery() {
	const [open, setOpen] = useState(false);
	// No direct fetcher needed; actions are handled via Zustand store and SaveChangesBar

	// Zustand store (읽기 + 액션)
	const widgets = useDashboardStore((s) => s.widgets);
	const showWidget = useDashboardStore((s) => s.showWidget);

	// 계산된 값들 (memoized)
	const visibleWidgetIds = useMemo(
		() => new Set(widgets.filter((w) => w.visible).map((w) => w.id)),
		[widgets],
	);

	const allWidgetIds = useMemo(
		() => Object.keys(WIDGET_REGISTRY) as WidgetId[],
		[],
	);

	const hiddenCount = useMemo(
		() => allWidgetIds.filter((id) => !visibleWidgetIds.has(id)).length,
		[allWidgetIds, visibleWidgetIds],
	);

	/**
	 * 아이콘 이모지 맵
	 */
	const getIconEmoji = useCallback((iconName: string) => {
		const iconMap: Record<string, string> = {
			TrendingUp: "📈",
			CheckCircle2: "✅",
			Map: "🗺️",
			Briefcase: "💼",
			Users: "👥",
			ClipboardCheck: "📋",
			MessageCircle: "💬",
			FileText: "📄",
			Bell: "🔔",
			Heart: "❤️",
			UserCircle: "👤",
			Target: "🎯",
			Calendar: "📅",
			MapPin: "📍",
			Bookmark: "🔖",
			Trophy: "🏆",
			Radar: "📡",
			BookOpen: "📚",
			Star: "⭐",
			Search: "🔍",
			CreditCard: "💳",
		};
		return iconMap[iconName] || "📊";
	}, []);

	/**
	 * 위젯 추가 핸들러 - Store만 업데이트 (저장은 SaveChangesBar에서)
	 */
	const handleAddWidget = useCallback(
		(widgetId: string) => {
			showWidget(widgetId);
			setOpen(false);
		},
		[showWidget],
	);

	return (
		<>
			<Button
				variant="primary"
				size="sm"
				onClick={() => setOpen(true)}
				className="gap-2"
			>
				<Plus className="h-4 w-4" />
				위젯 추가
				{hiddenCount > 0 && (
					<span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
						{hiddenCount}
					</span>
				)}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Grid3x3 className="h-5 w-5 text-primary-600" />
							위젯 갤러리
						</DialogTitle>
						<DialogDescription>
							대시보드에 추가할 위젯을 선택하세요.
						</DialogDescription>
					</DialogHeader>

					<div className="mt-4 space-y-6">
						{Object.entries(WIDGET_CATEGORIES).map(([key, category]) => {
							const categoryWidgets = category.widgets.filter((id) =>
								allWidgetIds.includes(id as WidgetId),
							);
							if (categoryWidgets.length === 0) return null;

							return (
								<div key={key}>
									<h3 className="mb-3 font-semibold text-gray-800">
										{category.name}
									</h3>
									<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
										{categoryWidgets.map((widgetId) => {
											const metadata = getWidgetMetadata(widgetId);
											const isAdded = visibleWidgetIds.has(widgetId);

											return (
												<button
													key={widgetId}
													type="button"
													onClick={() => !isAdded && handleAddWidget(widgetId)}
													disabled={isAdded}
													className={`group relative rounded-xl border p-responsive text-left transition-all ${
														isAdded
															? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
															: "border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 hover:shadow-md"
													}`}
												>
													{isAdded && (
														<div className="absolute top-2 right-2 rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700 text-xs">
															추가됨
														</div>
													)}
													<div className="flex items-start gap-3">
														<div
															className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
																isAdded
																	? "bg-gray-200"
																	: "bg-primary-100 group-hover:bg-primary-200"
															}`}
														>
															<span className="text-xl">
																{getIconEmoji(metadata.icon)}
															</span>
														</div>
														<div className="min-w-0 flex-1">
															<h4
																className={`mb-1 font-semibold text-sm ${isAdded ? "text-gray-500" : "text-gray-900"}`}
															>
																{metadata.name}
															</h4>
															<p
																className={`line-clamp-2 text-xs ${isAdded ? "text-gray-400" : "text-gray-500"}`}
															>
																{metadata.description}
															</p>
														</div>
													</div>
												</button>
											);
										})}
									</div>
								</div>
							);
						})}
					</div>

					{hiddenCount === 0 && (
						<div className="mt-4 rounded-lg bg-green-50 p-responsive text-center">
							<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
								<CheckCircle2 className="h-6 w-6 text-green-600" />
							</div>
							<p className="font-medium text-green-800">
								모든 위젯이 추가되어 있습니다!
							</p>
						</div>
					)}

					<div className="mt-6 flex justify-end">
						<Button variant="outline" onClick={() => setOpen(false)}>
							닫기
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
