import type { WidgetLayout } from "@itcom/db/schema";
import { Award, Lock, Star, Trophy } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface AchievementsWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

/**
 * Achievements Widget (Phase 3B)
 * 획득한 배지와 다음 목표
 */
export default function AchievementsWidget({
	size: _size,
	widgetData,
}: AchievementsWidgetProps) {
	const { badges, nextBadge } = widgetData.achievements;

	if (badges.length === 0) {
		return (
			<div className="space-y-4 text-center">
				<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-orange-100">
					<Trophy className="h-7 w-7 text-yellow-600" />
				</div>
				<div>
					<p className="font-medium text-gray-900">첫 배지를 획득하세요!</p>
					<p className="mt-1 text-gray-500 text-sm">
						활동을 통해 배지를 모아보세요
					</p>
				</div>

				{/* 다음 배지 미리보기 */}
				{nextBadge && (
					<div className="rounded-lg bg-gray-50 p-3">
						<div className="mb-2 flex items-center justify-center gap-2">
							<Lock className="h-4 w-4 text-gray-400" />
							<span className="text-gray-600 text-sm">{nextBadge.name}</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-gray-200">
							<div
								className="h-full rounded-full bg-primary-400"
								style={{ width: `${nextBadge.progress}%` }}
							/>
						</div>
						<p className="mt-1 text-gray-400 text-xs">{nextBadge.progress}%</p>
					</div>
				)}
			</div>
		);
	}

	const maxBadges = _size === "compact" ? 4 : 6;
	const displayBadges = badges.slice(0, maxBadges);

	return (
		<div className="space-y-4">
			{/* 배지 그리드 */}
			<div
				className={`grid gap-3 ${_size === "compact" ? "grid-cols-4" : "grid-cols-3"}`}
			>
				{displayBadges.map((badge) => (
					<div
						key={badge.id}
						className="group flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-50"
						title={badge.name}
					>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 text-2xl shadow-sm">
							{badge.icon || "🏆"}
						</div>
						{_size !== "compact" && (
							<p className="line-clamp-1 text-center text-gray-600 text-xs">
								{badge.name}
							</p>
						)}
					</div>
				))}
			</div>

			{/* 다음 배지 진행 */}
			{nextBadge && _size !== "compact" && (
				<div className="rounded-lg bg-gray-50 p-3">
					<div className="mb-2 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Star className="h-4 w-4 text-yellow-500" />
							<span className="font-medium text-gray-700 text-sm">
								다음 배지
							</span>
						</div>
						<span className="text-gray-500 text-xs">{nextBadge.name}</span>
					</div>
					<div className="h-2 overflow-hidden rounded-full bg-gray-200">
						<div
							className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-300"
							style={{ width: `${nextBadge.progress}%` }}
						/>
					</div>
					<p className="mt-1 text-right text-gray-400 text-xs">
						{nextBadge.progress}% 달성
					</p>
				</div>
			)}

			{/* 전체 보기 */}
			{badges.length > maxBadges && (
				<Link
					to="/profile/badges"
					className="flex items-center justify-center gap-1 font-medium text-primary-600 text-sm hover:text-primary-700"
				>
					<Award className="h-4 w-4" />+ {badges.length - maxBadges}개 더 보기
				</Link>
			)}
		</div>
	);
}
