import type { WidgetLayout } from "@itcom/db/schema";
import { CheckCircle2, Circle, Map as MapIcon } from "lucide-react";
import { Link } from "react-router";

interface RoadmapSnapshotWidgetProps {
	size: WidgetLayout["size"];
}

/**
 * Roadmap Snapshot Widget (P1)
 * 현재 진행 중인 로드맵 단계와 오늘의 할 일
 */
export default function RoadmapSnapshotWidget({
	size: _size,
}: RoadmapSnapshotWidgetProps) {
	// TODO: 실제 데이터 fetch
	const currentPhase = "이력서 & 포트폴리오";
	const phaseProgress = 60; // 60%
	const todayTasks = [
		{ id: "1", title: "일본어 이력서 작성", completed: true },
		{ id: "2", title: "포트폴리오 프로젝트 추가", completed: false },
		{ id: "3", title: "자기소개서 초안 작성", completed: false },
	];

	const maxTasks = _size === "compact" ? 2 : _size === "standard" ? 3 : 5;
	const displayTasks = todayTasks.slice(0, maxTasks);

	return (
		<div className="space-y-4">
			{/* 현재 단계 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100">
						<MapIcon className="h-5 w-5 text-accent-600" />
					</div>
					<div>
						<p className="mb-0.5 text-gray-500 text-xs">현재 단계</p>
						<p className="font-semibold text-gray-900">{currentPhase}</p>
					</div>
				</div>

				<Link
					to="/roadmap"
					className="font-medium text-primary-600 text-sm hover:text-primary-700"
				>
					전체 →
				</Link>
			</div>

			{/* 단계 진행률 */}
			<div>
				<div className="mb-1.5 flex items-center justify-between">
					<span className="text-gray-600 text-xs">단계 완료율</span>
					<span className="font-bold text-accent-600 text-xs">
						{phaseProgress}%
					</span>
				</div>
				<div className="h-2 overflow-hidden rounded-full bg-gray-100">
					<div
						className="h-full rounded-full bg-accent-500 transition-all duration-500"
						style={{ width: `${phaseProgress}%` }}
					/>
				</div>
			</div>

			{/* 오늘의 할 일 */}
			<div>
				<h4 className="mb-2 font-semibold text-gray-700 text-sm">
					오늘의 할 일
				</h4>
				<div className="space-y-2">
					{displayTasks.map((task) => (
						<button
							key={task.id}
							type="button"
							className="group flex w-full items-center gap-2 rounded-md p-2 text-left transition-colors hover:bg-gray-50"
							onClick={() => {
								// TODO: 작업 완료/미완료 토글
							}}
						>
							{task.completed ? (
								<CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary-500" />
							) : (
								<Circle className="h-5 w-5 flex-shrink-0 text-gray-300 group-hover:text-primary-400" />
							)}
							<span
								className={`text-sm ${
									task.completed
										? "text-gray-400 line-through"
										: "text-gray-700 group-hover:text-gray-900"
								}`}
							>
								{task.title}
							</span>
						</button>
					))}
				</div>

				{/* 더 보기 */}
				{todayTasks.length > maxTasks && (
					<Link
						to="/roadmap"
						className="mt-2 block py-1 text-center text-gray-500 text-xs hover:text-gray-700"
					>
						+ {todayTasks.length - maxTasks}개 더 보기
					</Link>
				)}
			</div>

			{/* Expanded 크기에서 통계 */}
			{_size === "expanded" && (
				<div className="grid grid-cols-3 gap-3 border-gray-100 border-t pt-3">
					<div className="text-center">
						<p className="font-bold text-gray-900 text-xl">
							{todayTasks.filter((t) => t.completed).length}
						</p>
						<p className="mt-0.5 text-gray-500 text-xs">완료</p>
					</div>
					<div className="text-center">
						<p className="font-bold text-gray-900 text-xl">
							{todayTasks.filter((t) => !t.completed).length}
						</p>
						<p className="mt-0.5 text-gray-500 text-xs">남은 작업</p>
					</div>
					<div className="text-center">
						<p className="font-bold text-gray-900 text-xl">7</p>
						<p className="mt-0.5 text-gray-500 text-xs">연속 일수</p>
					</div>
				</div>
			)}
		</div>
	);
}
