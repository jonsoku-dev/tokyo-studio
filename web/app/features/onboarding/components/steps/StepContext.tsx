import { clsx } from "clsx";
import {
	DEGREE_OPTIONS,
	RESIDENCE_OPTIONS,
	TIMELINE_OPTIONS,
} from "../../constants";
import { useAssessmentStore } from "../../stores/useAssessmentStore";

export function StepContext() {
	const { formData, updateField } = useAssessmentStore();

	const updateHard = (key: string, val: string) => {
		updateField("hardConstraints", { ...formData.hardConstraints, [key]: val });
	};

	return (
		<div className="space-y-8">
			<div className="space-y-1">
				<h2 className="heading-4 text-gray-900">현재 상황 및 목표 설정</h2>
				<p className="body-sm text-gray-500">
					비자 발급 가능성을 진단하고 최적의 구직 전략을 수립하기 위한
					정보입니다.
				</p>
			</div>

			<div className="space-y-8">
				{/* Timeline */}
				<div className="space-y-3">
					<label htmlFor="timeline-select" className="label">
						취업 희망 시기
					</label>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{TIMELINE_OPTIONS.map((opt) => (
							<button
								key={opt.value}
								type="button"
								onClick={() => updateField("careerTimeline", opt.value)}
								className={clsx(
									"relative flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-200",
									formData.careerTimeline === opt.value
										? "border-primary-500 bg-primary-50 shadow-sm ring-1 ring-primary-500"
										: "border-gray-200 bg-white hover:border-primary-200 hover:shadow-md",
								)}
							>
								<div className="flex w-full items-center justify-between">
									<span
										className={clsx(
											"font-semibold text-sm",
											formData.careerTimeline === opt.value
												? "text-primary-700"
												: "text-gray-900",
										)}
									>
										{opt.label}
									</span>
								</div>
								<span className="mt-1.5 text-gray-500 text-xs leading-relaxed">
									{opt.desc}
								</span>
							</button>
						))}
					</div>
				</div>

				<div className="grid gap-6 sm:grid-cols-2">
					{/* Residence */}
					<div className="space-y-3">
						<label htmlFor="residence-select" className="label">
							현재 거주지
						</label>
						<div className="flex flex-col gap-2">
							{RESIDENCE_OPTIONS.map((opt) => (
								<button
									key={opt.value}
									type="button"
									onClick={() => updateField("residence", opt.value)}
									className={clsx(
										"rounded-xl border px-4 py-3 text-left font-medium text-sm transition-all duration-200",
										formData.residence === opt.value
											? "border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500"
											: "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
									)}
								>
									{opt.label}
								</button>
							))}
						</div>
					</div>

					{/* Degree */}
					<div className="space-y-3">
						<label htmlFor="degree-select" className="label">
							최종 학력 (비자 심사 필수)
						</label>
						<div className="flex flex-col gap-2">
							{DEGREE_OPTIONS.map((opt) => (
								<button
									key={opt.value}
									type="button"
									onClick={() => updateHard("degree", opt.value)}
									className={clsx(
										"rounded-xl border px-4 py-3 text-left font-medium text-sm transition-all duration-200",
										formData.hardConstraints.degree === opt.value
											? "border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500"
											: "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
									)}
								>
									{opt.label}
								</button>
							))}
						</div>
						{formData.hardConstraints.degree === "none" && (
							<p className="mt-2 text-orange-600 text-xs">
								⚠️ 학위가 없으실 경우 취업 비자 발급이 매우 까다로울 수 있습니다.
								(IT 관련 경력 10년 이상 증명 필요)
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
