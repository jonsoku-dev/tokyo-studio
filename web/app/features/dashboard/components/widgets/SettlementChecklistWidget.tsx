import type { WidgetLayout } from "@itcom/db/schema";
import { CheckCircle2, Circle, ClipboardList, Home } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface SettlementChecklistWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

/**
 * Settlement Checklist Widget (P2)
 * 정착 체크리스트 진행 상황
 * TODO: 실제 정착 체크리스트 데이터 연동 필요
 */
export default function SettlementChecklistWidget({
	size: _size,
	widgetData: _widgetData,
}: SettlementChecklistWidgetProps) {
	// TODO: 실제 settlemnet 데이터 스키마 구현 후 연동
	const checklistItems = [
		{
			id: "1",
			title: "재류자격 인정증명서 신청",
			completed: true,
			category: "비자",
		},
		{ id: "2", title: "재류카드 수령", completed: true, category: "비자" },
		{
			id: "3",
			title: "주민등록 (구역관청)",
			completed: false,
			category: "행정",
		},
		{ id: "4", title: "은행 계좌 개설", completed: false, category: "금융" },
		{ id: "5", title: "휴대폰 개통", completed: false, category: "생활" },
		{ id: "6", title: "건강보험 가입", completed: false, category: "보험" },
	];

	const completedCount = checklistItems.filter((item) => item.completed).length;
	const totalCount = checklistItems.length;
	const progressPercent = Math.round((completedCount / totalCount) * 100);

	const maxItems = _size === "compact" ? 3 : _size === "standard" ? 4 : 6;
	const displayItems = checklistItems.slice(0, maxItems);

	return (
		<div className="space-y-4">
			{/* 진행률 헤더 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100">
						<Home className="h-5 w-5 text-accent-600" />
					</div>
					<div>
						<p className="font-semibold text-gray-900">정착 체크리스트</p>
						<p className="text-gray-500 text-xs">
							{completedCount}/{totalCount} 완료
						</p>
					</div>
				</div>
				<div className="text-right">
					<p className="font-bold text-accent-600 text-xl">
						{progressPercent}%
					</p>
				</div>
			</div>

			{/* 진행률 바 */}
			<div className="h-2 overflow-hidden rounded-full bg-gray-100">
				<div
					className="h-full rounded-full bg-accent-500 transition-all duration-500"
					style={{ width: `${progressPercent}%` }}
				/>
			</div>

			{/* 체크리스트 아이템 */}
			<div className="space-y-2">
				{displayItems.map((item) => (
					<button
						key={item.id}
						type="button"
						className="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
						onClick={() => {
							// TODO: 체크리스트 토글
						}}
					>
						{item.completed ? (
							<CheckCircle2 className="h-5 w-5 flex-shrink-0 text-accent-500" />
						) : (
							<Circle className="h-5 w-5 flex-shrink-0 text-gray-300 group-hover:text-accent-400" />
						)}
						<div className="min-w-0 flex-1">
							<p
								className={`text-sm ${
									item.completed
										? "text-gray-400 line-through"
										: "text-gray-700 group-hover:text-gray-900"
								}`}
							>
								{item.title}
							</p>
						</div>
						<span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-500 text-xs">
							{item.category}
						</span>
					</button>
				))}
			</div>

			{/* 더보기 */}
			{checklistItems.length > maxItems && (
				<Link
					to="/settlement"
					className="block py-2 text-center font-medium text-primary-600 text-sm hover:text-primary-700"
				>
					+ {checklistItems.length - maxItems}개 더 보기
				</Link>
			)}

			{/* 빈 상태 */}
			{checklistItems.length === 0 && (
				<div className="py-responsive text-center text-gray-400">
					<ClipboardList className="mx-auto mb-2 h-8 w-8" />
					<p className="text-sm">체크리스트가 비어있습니다</p>
				</div>
			)}
		</div>
	);
}
