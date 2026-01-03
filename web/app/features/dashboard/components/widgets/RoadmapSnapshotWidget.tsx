import type { WidgetLayout } from "@itcom/db/schema";
import { CheckCircle2, Circle, Map as MapIcon } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface RoadmapSnapshotWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

/**
 * Roadmap Snapshot Widget (P1)
 * 현재 진행 중인 로드맵 단계와 오늘의 할 일
 */
export default function RoadmapSnapshotWidget({
	size: _size,
	widgetData,
}: RoadmapSnapshotWidgetProps) {
	const { todayTasks, currentPhase, phaseProgress } = widgetData.roadmap;

	const maxTasks = _size === "compact" ? 2 : _size === "standard" ? 3 : 5;
	const displayTasks = todayTasks.slice(0, maxTasks);
	const completedCount = todayTasks.filter((t) => t.completed).length;

	return (
		<div className="space-y-4">
			{/* 현재 단계 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100">
						<MapIcon className="h-5 w-5 text-secondary-600" />
					</div>
					<div>
						<p className="text-gray-500 text-sm">현재 단계</p>
						<p className="font-semibold text-gray-900">{currentPhase}</p>
					</div>
				</div>
				<div className="text-right">
					<p className="font-bold text-secondary-600 text-xl">
						{phaseProgress}%
					</p>
				</div>
			</div>

			{/* 단계 진행률 바 */}
			<div className="h-2 overflow-hidden rounded-full bg-gray-100">
				<div
					className="h-full rounded-full bg-secondary-500 transition-all duration-500"
					style={{ width: `${phaseProgress}%` }}
				/>
			</div>

			{/* 오늘의 할 일 목록 */}
			<div className="space-y-2">
				<p className="font-medium text-gray-700 text-sm">오늘의 작업</p>
				{displayTasks.length > 0 ? (
					displayTasks.map((task) => (
						<div
							key={task.id}
							className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
						>
							{task.completed ? (
								<CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
							) : (
								<Circle className="h-5 w-5 flex-shrink-0 text-gray-300" />
							)}
							<span
								className={`text-sm ${
									task.completed
										? "text-gray-400 line-through"
										: "text-gray-700"
								}`}
							>
								{task.title}
							</span>
						</div>
					))
				) : (
					<p className="py-4 text-center text-gray-400 text-sm">
						등록된 작업이 없습니다
					</p>
				)}

				{/* 더 보기 */}
				{todayTasks.length > maxTasks && (
					<Link
						to="/roadmap"
						className="block text-center font-medium text-primary-600 text-sm hover:text-primary-700"
					>
						+ {todayTasks.length - maxTasks}개 더 보기
					</Link>
				)}
			</div>

			{/* Expanded 크기에서 통계 */}
			{_size === "expanded" && (
				<div className="grid grid-cols-3 gap-3 border-gray-100 border-t pt-3">
					<div className="text-center">
						<p className="font-bold text-gray-900 text-xl">{completedCount}</p>
						<p className="text-gray-500 text-xs">완료</p>
					</div>
					<div className="text-center">
						<p className="font-bold text-gray-900 text-xl">
							{todayTasks.length - completedCount}
						</p>
						<p className="text-gray-500 text-xs">남은 작업</p>
					</div>
					<div className="text-center">
						<Link
							to="/roadmap"
							className="font-medium text-primary-600 text-sm hover:text-primary-700"
						>
							전체 보기 →
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}
