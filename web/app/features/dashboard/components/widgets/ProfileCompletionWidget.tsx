import type { WidgetLayout } from "@itcom/db/schema";
import { AlertCircle, CheckCircle2, UserCircle } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface ProfileCompletionWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

/**
 * Profile Completion Widget (Phase 3A)
 * 프로필 완성도와 누락된 정보 표시
 */
export default function ProfileCompletionWidget({
	size: _size,
	widgetData,
}: ProfileCompletionWidgetProps) {
	const { completionPercent, missingFields, profile } =
		widgetData.profileCompletion;

	// 완료 여부에 따른 색상
	const getProgressColor = () => {
		if (completionPercent >= 80) return "bg-green-500";
		if (completionPercent >= 50) return "bg-yellow-500";
		return "bg-red-500";
	};

	return (
		<div className="space-y-4">
			{/* 완성도 헤더 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
						<UserCircle className="h-6 w-6 text-primary-600" />
					</div>
					<div>
						<p className="font-semibold text-gray-900">프로필 완성도</p>
						<p className="text-gray-500 text-sm">
							{completionPercent === 100
								? "완벽해요! 🎉"
								: "조금만 더 채워주세요"}
						</p>
					</div>
				</div>
				<div className="text-right">
					<p
						className={`font-bold text-2xl ${
							completionPercent >= 80
								? "text-green-600"
								: completionPercent >= 50
									? "text-yellow-600"
									: "text-red-600"
						}`}
					>
						{completionPercent}%
					</p>
				</div>
			</div>

			{/* 진행률 바 */}
			<div className="h-3 overflow-hidden rounded-full bg-gray-100">
				<div
					className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
					style={{ width: `${completionPercent}%` }}
				/>
			</div>

			{/* 체크리스트 (Standard/Expanded) */}
			{_size !== "compact" && profile && (
				<div className="space-y-2">
					{Object.entries({
						hasBasicInfo: "기본 정보",
						hasCareerInfo: "경력 정보",
						hasLanguageInfo: "어학 능력",
						hasTechStack: "기술 스택",
						hasPreferences: "선호도",
					}).map(([key, label]) => {
						const isCompleted = profile[key as keyof typeof profile];
						return (
							<div key={key} className="flex items-center gap-2">
								{isCompleted ? (
									<CheckCircle2 className="h-4 w-4 text-green-500" />
								) : (
									<AlertCircle className="h-4 w-4 text-gray-300" />
								)}
								<span
									className={`text-sm ${
										isCompleted ? "text-gray-500" : "text-gray-700"
									}`}
								>
									{label}
								</span>
							</div>
						);
					})}
				</div>
			)}

			{/* 누락 필드 알림 */}
			{missingFields.length > 0 && (
				<div className="rounded-lg bg-amber-50 p-3">
					<p className="mb-1 font-medium text-amber-800 text-xs">
						누락된 정보 ({missingFields.length}개)
					</p>
					<p className="text-amber-600 text-xs">{missingFields.join(", ")}</p>
				</div>
			)}

			{/* CTA 버튼 */}
			<Link
				to="/onboarding"
				className="block rounded-lg bg-primary-600 py-2.5 text-center font-medium text-sm text-white transition-colors hover:bg-primary-700"
			>
				{completionPercent === 100 ? "프로필 수정하기" : "프로필 완성하기 →"}
			</Link>
		</div>
	);
}
