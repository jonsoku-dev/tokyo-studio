import type { WidgetLayout } from "@itcom/db/schema";
import { Medal, MessageSquare, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface ReputationStatsWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

/**
 * Reputation Stats Widget (Phase 3C)
 * 커뮤니티 평판 통계
 */
export default function ReputationStatsWidget({
	size: _size,
	widgetData,
}: ReputationStatsWidgetProps) {
	const { reputation, rank, totalUsers, recentActivities } =
		widgetData.reputationStats;

	// 평판 등급
	const getReputationTier = () => {
		if (reputation >= 1000) return { name: "Diamond", color: "text-cyan-500" };
		if (reputation >= 500)
			return { name: "Platinum", color: "text-purple-500" };
		if (reputation >= 200) return { name: "Gold", color: "text-yellow-500" };
		if (reputation >= 50) return { name: "Silver", color: "text-gray-400" };
		return { name: "Bronze", color: "text-orange-600" };
	};

	const tier = getReputationTier();

	return (
		<div className="space-y-4">
			{/* 평판 점수 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-orange-100">
						<Star className="h-6 w-6 text-yellow-500" />
					</div>
					<div>
						<p className="font-semibold text-gray-900">커뮤니티 평판</p>
						<p className={`font-medium text-sm ${tier.color}`}>{tier.name}</p>
					</div>
				</div>
				<div className="text-right">
					<p className="font-bold text-2xl text-primary-600">{reputation}</p>
					{rank && (
						<p className="text-gray-400 text-xs">
							상위 {Math.round((rank / totalUsers) * 100)}%
						</p>
					)}
				</div>
			</div>

			{/* 순위 표시 (Standard/Expanded) */}
			{_size !== "compact" && rank && (
				<div className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 p-3">
					<Medal className="h-5 w-5 text-yellow-600" />
					<span className="font-medium text-gray-700">
						{totalUsers.toLocaleString()}명 중{" "}
						<span className="font-bold text-primary-600">#{rank}</span>위
					</span>
				</div>
			)}

			{/* 최근 활동 (Expanded) */}
			{_size === "expanded" && recentActivities.length > 0 && (
				<div className="space-y-2">
					<p className="text-gray-500 text-xs">최근 활동</p>
					{recentActivities.slice(0, 3).map((activity, idx) => (
						<div
							key={`${activity.type}-${activity.points}-${idx}`}
							className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
						>
							<div className="flex items-center gap-2">
								<MessageSquare className="h-4 w-4 text-gray-400" />
								<span className="text-gray-600 text-sm">{activity.type}</span>
							</div>
							<span className="font-medium text-green-600 text-sm">
								+{activity.points}
							</span>
						</div>
					))}
				</div>
			)}

			{/* 링크 */}
			<Link
				to="/profile"
				className="flex items-center justify-center gap-2 font-medium text-primary-600 text-sm hover:text-primary-700"
			>
				<TrendingUp className="h-4 w-4" />
				활동 내역 보기
			</Link>
		</div>
	);
}
