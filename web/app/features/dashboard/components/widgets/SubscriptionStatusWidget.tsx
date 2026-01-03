import type { WidgetLayout } from "@itcom/db/schema";
import { Crown, FileText, Sparkles, Users, Zap } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface SubscriptionStatusWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

// 플랜별 스타일
const planStyles = {
	free: {
		bg: "bg-gray-100",
		text: "text-gray-700",
		icon: Sparkles,
		name: "Free",
	},
	pro: {
		bg: "bg-primary-100",
		text: "text-primary-700",
		icon: Zap,
		name: "Pro",
	},
	premium: {
		bg: "bg-gradient-to-r from-yellow-100 to-orange-100",
		text: "text-orange-700",
		icon: Crown,
		name: "Premium",
	},
};

/**
 * Subscription Status Widget (Phase 3C)
 * 구독 플랜 및 사용량
 */
export default function SubscriptionStatusWidget({
	size: _size,
	widgetData,
}: SubscriptionStatusWidgetProps) {
	const { plan, usage, renewalDate } = widgetData.subscriptionStatus;

	const style = planStyles[plan];
	const Icon = style.icon;

	return (
		<div className="space-y-4">
			{/* 현재 플랜 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div
						className={`flex h-12 w-12 items-center justify-center rounded-full ${style.bg}`}
					>
						<Icon className={`h-6 w-6 ${style.text}`} />
					</div>
					<div>
						<p className="font-semibold text-gray-900">{style.name} 플랜</p>
						{renewalDate && (
							<p className="text-gray-500 text-sm">갱신: {renewalDate}</p>
						)}
					</div>
				</div>
				{plan === "free" && (
					<Link
						to="/pricing"
						className="rounded-lg bg-primary-600 px-3 py-1.5 font-medium text-sm text-white transition-colors hover:bg-primary-700"
					>
						업그레이드
					</Link>
				)}
			</div>

			{/* 사용량 (Standard/Expanded) */}
			{_size !== "compact" && (
				<div className="grid grid-cols-2 gap-3">
					{/* 멘토링 */}
					<div className="rounded-lg border border-gray-100 p-3">
						<div className="mb-1 flex items-center gap-2">
							<Users className="h-4 w-4 text-primary-500" />
							<span className="text-gray-500 text-xs">멘토링</span>
						</div>
						<p className="font-bold text-gray-900 text-lg">
							{usage.mentoring}
							<span className="font-normal text-gray-400 text-sm">
								/{plan === "free" ? "2" : "∞"}
							</span>
						</p>
					</div>

					{/* 문서 */}
					<div className="rounded-lg border border-gray-100 p-3">
						<div className="mb-1 flex items-center gap-2">
							<FileText className="h-4 w-4 text-accent-500" />
							<span className="text-gray-500 text-xs">문서</span>
						</div>
						<p className="font-bold text-gray-900 text-lg">
							{usage.documents}
							<span className="font-normal text-gray-400 text-sm">
								/{plan === "free" ? "5" : "∞"}
							</span>
						</p>
					</div>
				</div>
			)}

			{/* 업그레이드 혜택 (Free만) */}
			{plan === "free" && _size === "expanded" && (
				<div className="rounded-lg bg-gradient-to-r from-primary-50 to-accent-50 p-3">
					<p className="mb-2 font-medium text-primary-700 text-sm">
						Pro로 업그레이드하면
					</p>
					<ul className="space-y-1 text-gray-600 text-xs">
						<li>✓ 무제한 멘토링 예약</li>
						<li>✓ 무제한 문서 저장</li>
						<li>✓ 우선 매칭 지원</li>
					</ul>
				</div>
			)}
		</div>
	);
}
