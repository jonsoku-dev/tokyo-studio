import type { WidgetLayout } from "@itcom/db/schema";
import { Grid3x3, Plus } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/shared/components/ui/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/shared/components/ui/Dialog";
import {
	getWidgetMetadata,
	WIDGET_CATEGORIES,
} from "../config/widget-metadata";

interface WidgetGalleryProps {
	currentWidgets: WidgetLayout[];
}

/**
 * Widget Gallery
 * 숨겨진 위젯을 다시 추가할 수 있는 모달
 */
export function WidgetGallery({ currentWidgets }: WidgetGalleryProps) {
	const [open, setOpen] = useState(false);
	const fetcher = useFetcher();

	// 숨겨진 위젯 찾기
	const hiddenWidgets = currentWidgets.filter((w) => !w.visible);

	/**
	 * 위젯 추가 (표시)
	 */
	const handleAddWidget = (widgetId: string) => {
		fetcher.submit(
			{
				action: "show",
				widgetId,
			},
			{
				method: "post",
				action: "/api/dashboard/widgets",
			},
		);

		// 성공 후 모달 닫기
		if (fetcher.state === "idle") {
			setOpen(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Button variant="outline" size="sm" onClick={() => setOpen(true)}>
				<Plus className="mr-2 h-4 w-4" />
				위젯 추가
			</Button>

			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>위젯 추가</DialogTitle>
					<DialogDescription>
						숨겨진 위젯을 선택하여 대시보드에 추가하세요
					</DialogDescription>
				</DialogHeader>

				{hiddenWidgets.length === 0 ? (
					<div className="py-12 text-center text-gray-500">
						<Grid3x3 className="mx-auto mb-3 h-12 w-12 text-gray-300" />
						<p>숨겨진 위젯이 없습니다</p>
						<p className="mt-1 text-sm">모든 위젯이 표시되고 있습니다</p>
					</div>
				) : (
					<div className="space-y-6">
						{Object.entries(WIDGET_CATEGORIES).map(([key, category]) => {
							// 해당 카테고리에서 숨겨진 위젯만 필터링
							const categoryHiddenWidgets = hiddenWidgets.filter((w) =>
								category.widgets.includes(w.id),
							);

							if (categoryHiddenWidgets.length === 0) {
								return null;
							}

							return (
								<div key={key}>
									<h3 className="mb-3 font-semibold text-gray-700 text-sm">
										{category.name}
									</h3>
									<div className="grid grid-cols-2 gap-3">
										{categoryHiddenWidgets.map((widget) => {
											const metadata = getWidgetMetadata(widget.id);
											return (
												<button
													key={widget.id}
													type="button"
													onClick={() => handleAddWidget(widget.id)}
													className="group rounded-lg border border-gray-200 p-4 text-left transition-all hover:border-primary-300 hover:bg-primary-50/50"
												>
													<div className="flex items-start gap-3">
														<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 transition-colors group-hover:bg-primary-200">
															<span className="text-xl">
																{/* Icon placeholder */}📊
															</span>
														</div>
														<div className="min-w-0 flex-1">
															<h4 className="mb-0.5 font-semibold text-gray-900 text-sm">
																{metadata.name}
															</h4>
															<p className="line-clamp-2 text-gray-500 text-xs">
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
				)}

				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						닫기
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
