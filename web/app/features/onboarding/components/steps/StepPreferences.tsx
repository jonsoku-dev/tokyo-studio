import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
	CITIES,
	EN_LEVELS,
	JOB_FAMILIES,
	JP_LEVELS,
	LEVELS,
} from "../../constants";
import { useAssessmentStore } from "../../stores/useAssessmentStore";

export function StepPreferences() {
	const { formData, updateField } = useAssessmentStore();

	return (
		<motion.div
			key="step3"
			initial={{ x: 20, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			exit={{ x: -20, opacity: 0 }}
			className="space-y-8"
		>
			<div className="space-y-1">
				<h2 className="heading-4 text-gray-900">희망 근무지 설정</h2>
				<p className="body-sm text-gray-500">
					라이프스타일에 맞는 최적의 근무지를 선택해주세요.
				</p>
			</div>

			<div className="space-y-4">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{CITIES.map((city) => (
						<button
							key={city.value}
							type="button"
							onClick={() => updateField("targetCity", city.value)}
							className={clsx(
								"relative flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-200",
								formData.targetCity === city.value
									? "border-primary-500 bg-primary-50 shadow-sm ring-1 ring-primary-500"
									: "border-gray-200 bg-white hover:border-primary-200 hover:shadow-md",
							)}
						>
							<div className="flex w-full items-center justify-between">
								<span
									className={clsx(
										"font-semibold text-sm",
										formData.targetCity === city.value
											? "text-primary-700"
											: "text-gray-900",
									)}
								>
									{city.label}
								</span>
								{formData.targetCity === city.value && (
									<div className="rounded-full bg-primary-100 p-0.5">
										<Check className="h-3 w-3 text-primary-600" />
									</div>
								)}
							</div>
							<span className="mt-1.5 text-gray-500 text-xs leading-relaxed">
								{city.desc}
							</span>
						</button>
					))}
				</div>
			</div>

			<div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 backdrop-blur-sm">
				<h3 className="mb-4 font-semibold text-gray-900 text-sm">진단 요약</h3>
				<dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
					<div>
						<dt className="text-gray-500 text-xs">희망 직무</dt>
						<dd className="mt-1 font-medium text-gray-900 text-sm">
							{JOB_FAMILIES.find((j) => j.value === formData.jobFamily)
								?.label || formData.jobFamily}
						</dd>
					</div>
					<div>
						<dt className="text-gray-500 text-xs">현재 레벨</dt>
						<dd className="mt-1 font-medium text-gray-900 text-sm">
							{LEVELS.find((l) => l.value === formData.level)?.label ||
								formData.level}
						</dd>
					</div>
					<div>
						<dt className="text-gray-500 text-xs">일본어 능력</dt>
						<dd className="mt-1 font-medium text-gray-900 text-sm">
							{JP_LEVELS.find((l) => l.value === formData.jpLevel)?.label ||
								formData.jpLevel}
						</dd>
					</div>
					<div>
						<dt className="text-gray-500 text-xs">영어 능력</dt>
						<dd className="mt-1 font-medium text-gray-900 text-sm">
							{EN_LEVELS.find((l) => l.value === formData.enLevel)?.label ||
								formData.enLevel}
						</dd>
					</div>
				</dl>
			</div>
		</motion.div>
	);
}
