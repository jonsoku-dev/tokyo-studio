import type { WidgetLayout } from "@itcom/db/schema";
import { Briefcase, Building2, Clock, MoreHorizontal } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface PipelineOverviewWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

// 파이프라인 상태별 색상
const stageStyles = {
	interested: { bg: "bg-gray-100", text: "text-gray-700", label: "관심" },
	applied: { bg: "bg-blue-100", text: "text-blue-700", label: "지원 완료" },
	interviewing: {
		bg: "bg-purple-100",
		text: "text-purple-700",
		label: "면접 진행",
	},
	offered: { bg: "bg-green-100", text: "text-green-700", label: "오퍼 수령" },
	rejected: { bg: "bg-red-100", text: "text-red-700", label: "불합격" },
} as const;

/**
 * Pipeline Overview Widget (P2)
 * 현재 지원 현황 요약
 */
export default function PipelineOverviewWidget({
	size: _size,
	widgetData,
}: PipelineOverviewWidgetProps) {
	const { applications, stageCounts } = widgetData.pipeline;

	const maxItems = _size === "compact" ? 2 : _size === "standard" ? 3 : 5;
	const displayApps = applications.slice(0, maxItems);

	return (
		<div className="space-y-4">
			{/* 상태별 카운트 */}
			<div className="grid grid-cols-4 gap-2">
				{Object.entries(stageCounts).map(([stage, count]) => {
					const style =
						stageStyles[stage as keyof typeof stageCounts] ||
						stageStyles.interested;
					return (
						<div key={stage} className="text-center">
							<p className="font-bold text-gray-900 text-lg">{count}</p>
							<p className={`text-xs ${style.text}`}>{style.label}</p>
						</div>
					);
				})}
			</div>

			{/* 지원 목록 */}
			<div className="space-y-2">
				{displayApps.map((app) => {
					const style =
						stageStyles[app.stage as keyof typeof stageStyles] ||
						stageStyles.interested;
					return (
						<Link
							key={app.id}
							to={`/pipeline/${app.id}`}
							className="group block rounded-lg border border-gray-200 p-3 transition-all hover:border-primary-300 hover:bg-primary-50/30"
						>
							<div className="flex items-start gap-3">
								<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
									<Building2 className="h-4 w-4 text-gray-600" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="mb-1 flex items-center gap-2">
										<p className="truncate font-medium text-gray-900 text-sm">
											{app.company}
										</p>
										<span
											className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${style.bg} ${style.text}`}
										>
											{style.label}
										</span>
									</div>
									<p className="truncate text-gray-500 text-xs">
										{app.position}
									</p>
									{_size !== "compact" && app.nextAction && (
										<p className="mt-1 flex items-center gap-1 text-gray-400 text-xs">
											<Clock className="h-3 w-3" />
											{app.nextAction}
										</p>
									)}
								</div>
							</div>
						</Link>
					);
				})}
			</div>

			{/* 더보기 */}
			{applications.length > maxItems && (
				<Link
					to="/pipeline"
					className="flex items-center justify-center gap-1 py-2 font-medium text-primary-600 text-sm hover:text-primary-700"
				>
					<MoreHorizontal className="h-4 w-4" />+{" "}
					{applications.length - maxItems}개 더 보기
				</Link>
			)}

			{/* 빈 상태 */}
			{applications.length === 0 && (
				<div className="py-responsive text-center text-gray-400">
					<Briefcase className="mx-auto mb-2 h-8 w-8" />
					<p className="text-sm">아직 지원한 회사가 없습니다</p>
					<Link
						to="/pipeline/new"
						className="mt-2 inline-block font-medium text-primary-600 text-sm hover:text-primary-700"
					>
						첫 지원 추가하기 →
					</Link>
				</div>
			)}
		</div>
	);
}
