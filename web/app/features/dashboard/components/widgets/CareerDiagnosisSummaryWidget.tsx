import type { WidgetLayout } from "@itcom/db/schema";
import { AlertTriangle, CheckCircle2, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface CareerDiagnosisSummaryWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

/**
 * Career Diagnosis Summary Widget (Phase 3A)
 * 커리어 진단 결과 요약
 */
export default function CareerDiagnosisSummaryWidget({
	size: _size,
	widgetData,
}: CareerDiagnosisSummaryWidgetProps) {
	const { hasResult, readinessScore, recommendation, strengths, weaknesses } =
		widgetData.careerDiagnosis;

	if (!hasResult) {
		return (
			<div className="space-y-4 text-center">
				<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
					<Target className="h-8 w-8 text-primary-600" />
				</div>
				<div>
					<h4 className="font-semibold text-gray-900">진단을 시작해보세요</h4>
					<p className="mt-1 text-gray-500 text-sm">
						6단계 진단으로 맞춤형 취업 전략을 받아보세요
					</p>
				</div>
				<Link
					to="/onboarding"
					className="inline-block rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-sm text-white transition-colors hover:bg-primary-700"
				>
					진단 시작하기 →
				</Link>
			</div>
		);
	}

	// 점수에 따른 색상
	const getScoreColor = () => {
		if (!readinessScore) return "text-gray-600";
		if (readinessScore >= 80) return "text-green-600";
		if (readinessScore >= 60) return "text-blue-600";
		if (readinessScore >= 40) return "text-yellow-600";
		return "text-red-600";
	};

	const getScoreLabel = () => {
		if (!readinessScore) return "미측정";
		if (readinessScore >= 80) return "준비 완료";
		if (readinessScore >= 60) return "거의 준비됨";
		if (readinessScore >= 40) return "준비 중";
		return "시작 단계";
	};

	return (
		<div className="space-y-4">
			{/* 점수 헤더 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-accent-100">
						<TrendingUp className="h-6 w-6 text-primary-600" />
					</div>
					<div>
						<p className="font-semibold text-gray-900">취업 준비도</p>
						<p className={`font-medium text-sm ${getScoreColor()}`}>
							{getScoreLabel()}
						</p>
					</div>
				</div>
				<div className="text-right">
					<p className={`font-bold text-3xl ${getScoreColor()}`}>
						{readinessScore ?? "-"}
						<span className="font-normal text-gray-400 text-lg">/100</span>
					</p>
				</div>
			</div>

			{/* 추천 사항 */}
			{recommendation && _size !== "compact" && (
				<div className="rounded-lg bg-primary-50 p-3">
					<p className="font-medium text-primary-800 text-sm">
						💡 {recommendation}
					</p>
				</div>
			)}

			{/* 강점/약점 (Expanded) */}
			{_size === "expanded" && (
				<div className="grid grid-cols-2 gap-3">
					{/* 강점 */}
					<div className="rounded-lg bg-green-50 p-3">
						<p className="mb-2 flex items-center gap-1 font-medium text-green-700 text-xs">
							<CheckCircle2 className="h-3 w-3" />
							강점
						</p>
						{strengths.length > 0 ? (
							<ul className="space-y-1">
								{strengths.slice(0, 3).map((item) => (
									<li key={item} className="text-green-600 text-xs">
										• {item}
									</li>
								))}
							</ul>
						) : (
							<p className="text-gray-400 text-xs">분석 중...</p>
						)}
					</div>

					{/* 약점 */}
					<div className="rounded-lg bg-amber-50 p-3">
						<p className="mb-2 flex items-center gap-1 font-medium text-amber-700 text-xs">
							<AlertTriangle className="h-3 w-3" />
							보완점
						</p>
						{weaknesses.length > 0 ? (
							<ul className="space-y-1">
								{weaknesses.slice(0, 3).map((item) => (
									<li key={item} className="text-amber-600 text-xs">
										• {item}
									</li>
								))}
							</ul>
						) : (
							<p className="text-gray-400 text-xs">분석 중...</p>
						)}
					</div>
				</div>
			)}

			{/* 상세 보기 링크 */}
			<Link
				to="/onboarding/result"
				className="block text-center font-medium text-primary-600 text-sm hover:text-primary-700"
			>
				진단 결과 자세히 보기 →
			</Link>
		</div>
	);
}
