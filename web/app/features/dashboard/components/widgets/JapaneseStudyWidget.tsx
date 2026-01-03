import type { WidgetLayout } from "@itcom/db/schema";
import { BookOpen, Calendar, Flame, Target } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface JapaneseStudyWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

// JLPT 레벨별 색상
const levelColors: Record<string, string> = {
	None: "bg-gray-200 text-gray-600",
	N5: "bg-green-100 text-green-700",
	N4: "bg-blue-100 text-blue-700",
	N3: "bg-purple-100 text-purple-700",
	N2: "bg-orange-100 text-orange-700",
	N1: "bg-red-100 text-red-700",
	Native: "bg-gradient-to-r from-yellow-400 to-orange-400 text-white",
};

/**
 * Japanese Study Widget (Phase 3C)
 * JLPT 레벨과 학습 현황
 */
export default function JapaneseStudyWidget({
	size: _size,
	widgetData,
}: JapaneseStudyWidgetProps) {
	const { currentLevel, targetLevel, studyStreak, nextExamDate } =
		widgetData.japaneseStudy;

	const levelStyle = levelColors[currentLevel] || levelColors.None;

	return (
		<div className="space-y-4">
			{/* 현재 레벨 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
						<span className="font-bold text-lg text-red-600">あ</span>
					</div>
					<div>
						<p className="font-semibold text-gray-900">일본어</p>
						<p className="text-gray-500 text-sm">
							{currentLevel === "None" ? "시작 전" : `${currentLevel} 수준`}
						</p>
					</div>
				</div>
				<span
					className={`rounded-full px-4 py-1.5 font-bold text-sm ${levelStyle}`}
				>
					{currentLevel}
				</span>
			</div>

			{/* 학습 통계 (Standard/Expanded) */}
			{_size !== "compact" && (
				<div className="grid grid-cols-2 gap-3">
					{/* 연속 학습일 */}
					<div className="rounded-lg bg-orange-50 p-3 text-center">
						<div className="mb-1 flex items-center justify-center gap-1">
							<Flame className="h-4 w-4 text-orange-500" />
							<span className="font-bold text-lg text-orange-600">
								{studyStreak}
							</span>
						</div>
						<p className="text-orange-600 text-xs">연속 학습일</p>
					</div>

					{/* 목표 레벨 */}
					<div className="rounded-lg bg-primary-50 p-3 text-center">
						<div className="mb-1 flex items-center justify-center gap-1">
							<Target className="h-4 w-4 text-primary-500" />
							<span className="font-bold text-lg text-primary-600">
								{targetLevel || "-"}
							</span>
						</div>
						<p className="text-primary-600 text-xs">목표 레벨</p>
					</div>
				</div>
			)}

			{/* 다음 시험 일정 */}
			{nextExamDate && (
				<div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
					<Calendar className="h-4 w-4 text-gray-500" />
					<span className="text-gray-600 text-sm">
						다음 JLPT: {nextExamDate}
					</span>
				</div>
			)}

			{/* 학습 자료 링크 */}
			<Link
				to="/resources/japanese"
				className="flex items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 font-medium text-sm text-white transition-colors hover:bg-red-700"
			>
				<BookOpen className="h-4 w-4" />
				학습 자료 보기
			</Link>
		</div>
	);
}
