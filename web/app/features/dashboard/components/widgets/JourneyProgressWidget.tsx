import type { WidgetLayout } from "@itcom/db/schema";
import { Target, TrendingUp } from "lucide-react";
import { Link } from "react-router";

interface JourneyProgressWidgetProps {
	size: WidgetLayout["size"];
}

/**
 * Journey Progress Widget (P1)
 * 사용자의 일본 취업 여정 전체 진행률 표시
 */
export default function JourneyProgressWidget({
	size: _size,
}: JourneyProgressWidgetProps) {
	// TODO: 실제 데이터 fetch
	const progress = 67; // 67%
	const stage = "적극 지원자";
	const nextMilestone = "면접 3회 통과";

	return (
		<div className="space-y-4">
			{/* 여정 단계 배지 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
						<TrendingUp className="h-5 w-5 text-primary-600" />
					</div>
					<div>
						<p className="text-gray-500 text-sm">현재 단계</p>
						<p className="font-semibold text-gray-900">{stage}</p>
					</div>
				</div>

				<Link
					to="/roadmap"
					className="font-medium text-primary-600 text-sm hover:text-primary-700"
				>
					자세히 →
				</Link>
			</div>

			{/* 진행률 바 */}
			<div>
				<div className="mb-2 flex items-center justify-between">
					<span className="font-medium text-gray-700 text-sm">전체 진행률</span>
					<span className="font-bold text-primary-600 text-sm">
						{progress}%
					</span>
				</div>

				{/* Gradient Progress Bar */}
				<div className="h-3 overflow-hidden rounded-full bg-gray-100">
					<div
						className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>

			{/* 다음 마일스톤 (Standard/Expanded 크기에서만) */}
			{_size !== "compact" && (
				<div className="rounded-lg border border-accent-100 bg-accent-50 p-3">
					<div className="flex items-start gap-2">
						<Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-600" />
						<div>
							<p className="mb-0.5 font-medium text-accent-700 text-xs">
								다음 목표
							</p>
							<p className="text-gray-900 text-sm">{nextMilestone}</p>
						</div>
					</div>
				</div>
			)}

			{/* Expanded 크기에서 추가 정보 */}
			{_size === "expanded" && (
				<div className="grid grid-cols-3 gap-3 border-gray-100 border-t pt-2">
					<div className="text-center">
						<p className="font-bold text-2xl text-gray-900">12</p>
						<p className="mt-1 text-gray-500 text-xs">완료한 작업</p>
					</div>
					<div className="text-center">
						<p className="font-bold text-2xl text-gray-900">5</p>
						<p className="mt-1 text-gray-500 text-xs">지원 기업</p>
					</div>
					<div className="text-center">
						<p className="font-bold text-2xl text-gray-900">3</p>
						<p className="mt-1 text-gray-500 text-xs">멘토링 세션</p>
					</div>
				</div>
			)}
		</div>
	);
}
