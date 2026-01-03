import type { WidgetLayout } from "@itcom/db/schema";
import {
	Award,
	CheckCircle2,
	Circle,
	GraduationCap,
	Users,
} from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface MentorApplicationWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

/**
 * Mentor Application Widget (P2)
 * 멘토 지원 현황 (contributor stage)
 */
export default function MentorApplicationWidget({
	size: _size,
	widgetData,
}: MentorApplicationWidgetProps) {
	const { isApplied, isApproved, totalMentors, totalSessions } =
		widgetData.mentorApplication;

	if (!isApplied) {
		// 미지원 상태
		return (
			<div className="space-y-4">
				<div className="rounded-lg border border-primary-300 border-dashed bg-primary-50/50 p-responsive text-center">
					<GraduationCap className="mx-auto mb-2 h-10 w-10 text-primary-600" />
					<h4 className="mb-1 font-semibold text-gray-900">
						멘토가 되어보세요!
					</h4>
					<p className="mb-3 text-gray-600 text-sm">
						일본 취업 경험을 나누고 후배들을 도와주세요
					</p>
					<Link
						to="/mentoring/apply"
						className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-primary-700"
					>
						<Users className="h-4 w-4" />
						멘토 지원하기
					</Link>
				</div>

				{/* 멘토 통계 */}
				{_size !== "compact" && (
					<div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
						<div className="text-center">
							<p className="font-bold text-gray-900">{totalMentors}</p>
							<p className="text-gray-500 text-xs">활동 멘토</p>
						</div>
						<div className="text-center">
							<p className="font-bold text-gray-900">{totalSessions}</p>
							<p className="text-gray-500 text-xs">진행 세션</p>
						</div>
					</div>
				)}
			</div>
		);
	}

	// 지원 완료 상태
	const status = isApproved ? "approved" : "reviewing";
	const statusStyles = {
		pending: { bg: "bg-gray-100", text: "text-gray-700", label: "대기중" },
		reviewing: { bg: "bg-blue-100", text: "text-blue-700", label: "검토중" },
		approved: { bg: "bg-green-100", text: "text-green-700", label: "승인됨" },
		rejected: { bg: "bg-red-100", text: "text-red-700", label: "반려됨" },
	};

	const style = statusStyles[status];
	const progressPercent = isApproved ? 100 : 50;

	const steps = [
		{ id: "1", title: "지원서 제출", completed: true },
		{ id: "2", title: "서류 검토", completed: isApproved },
		{ id: "3", title: "최종 승인", completed: isApproved },
	];

	const currentStep = steps.findIndex((s) => !s.completed);

	return (
		<div className="space-y-4">
			{/* 상태 헤더 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Award className="h-5 w-5 text-primary-600" />
					<span className="font-medium text-gray-700 text-sm">멘토 지원</span>
				</div>
				<span
					className={`inline-flex items-center rounded-full px-2.5 py-1 font-medium text-xs ${style.bg} ${style.text}`}
				>
					{style.label}
				</span>
			</div>

			{/* 진행률 */}
			<div>
				<div className="mb-2 flex items-center justify-between">
					<span className="text-gray-600 text-xs">진행 상황</span>
					<span className="font-medium text-primary-600 text-xs">
						{progressPercent}%
					</span>
				</div>
				<div className="h-2 overflow-hidden rounded-full bg-gray-100">
					<div
						className="h-full rounded-full bg-primary-500 transition-all duration-500"
						style={{ width: `${progressPercent}%` }}
					/>
				</div>
			</div>

			{/* 단계 목록 */}
			{_size !== "compact" && (
				<div className="space-y-2">
					{steps.map((step, index) => (
						<div key={step.id} className="flex items-center gap-3">
							{step.completed ? (
								<CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary-500" />
							) : index === currentStep ? (
								<div className="flex h-5 w-5 items-center justify-center">
									<div className="h-3 w-3 animate-pulse rounded-full bg-primary-400" />
								</div>
							) : (
								<Circle className="h-5 w-5 flex-shrink-0 text-gray-300" />
							)}
							<span
								className={`text-sm ${
									step.completed
										? "text-gray-500"
										: index === currentStep
											? "font-medium text-gray-900"
											: "text-gray-400"
								}`}
							>
								{step.title}
							</span>
						</div>
					))}
				</div>
			)}

			{/* 상세 보기 링크 */}
			<Link
				to="/mentoring/application"
				className="block text-center font-medium text-primary-600 text-sm hover:text-primary-700"
			>
				지원 상세 보기 →
			</Link>
		</div>
	);
}
