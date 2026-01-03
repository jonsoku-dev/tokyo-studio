import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { EN_LEVELS, JP_LEVELS } from "../../constants";
import { useAssessmentStore } from "../../stores/useAssessmentStore";

export function StepLanguage() {
	const { formData, updateField } = useAssessmentStore();

	return (
		<motion.div
			key="step2"
			initial={{ x: 20, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			exit={{ x: -20, opacity: 0 }}
			className="space-y-8"
		>
			<div className="space-y-1">
				<h2 className="heading-4 text-gray-900">어학 능력 정보</h2>
				<p className="body-sm text-gray-500">
					비즈니스 커뮤니케이션 가능 여부를 확인하여 적합한 포지션을 매칭합니다.
				</p>
			</div>

			<div className="space-y-8">
				<div className="space-y-4">
					<span className="label">일본어 구사 능력 (JLPT 기준)</span>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{JP_LEVELS.map((lvl) => (
							<button
								key={lvl.value}
								type="button"
								onClick={() => updateField("jpLevel", lvl.value)}
								className={clsx(
									"relative flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-200",
									formData.jpLevel === lvl.value
										? "border-primary-500 bg-primary-50 shadow-sm ring-1 ring-primary-500"
										: "border-gray-200 bg-white hover:border-primary-200 hover:shadow-md",
								)}
							>
								<div className="flex w-full items-center justify-between">
									<span
										className={clsx(
											"font-semibold text-sm",
											formData.jpLevel === lvl.value
												? "text-primary-700"
												: "text-gray-900",
										)}
									>
										{lvl.label}
									</span>
									{formData.jpLevel === lvl.value && (
										<div className="rounded-full bg-primary-100 p-0.5">
											<Check className="h-3 w-3 text-primary-600" />
										</div>
									)}
								</div>
								<span className="mt-1.5 text-gray-500 text-xs leading-relaxed">
									{lvl.desc}
								</span>
							</button>
						))}
					</div>
				</div>

				<div className="space-y-4">
					<span className="label">영어 구사 능력</span>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{EN_LEVELS.map((lvl) => (
							<button
								key={lvl.value}
								type="button"
								onClick={() => updateField("enLevel", lvl.value)}
								className={clsx(
									"relative flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-200",
									formData.enLevel === lvl.value
										? "border-primary-500 bg-primary-50 shadow-sm ring-1 ring-primary-500"
										: "border-gray-200 bg-white hover:border-primary-200 hover:shadow-md",
								)}
							>
								<div className="flex w-full items-center justify-between">
									<span
										className={clsx(
											"font-semibold text-sm",
											formData.enLevel === lvl.value
												? "text-primary-700"
												: "text-gray-900",
										)}
									>
										{lvl.label}
									</span>
									{formData.enLevel === lvl.value && (
										<div className="rounded-full bg-primary-100 p-0.5">
											<Check className="h-3 w-3 text-primary-600" />
										</div>
									)}
								</div>
								<span className="mt-1.5 text-gray-500 text-xs leading-relaxed">
									{lvl.desc}
								</span>
							</button>
						))}
					</div>
				</div>
			</div>
		</motion.div>
	);
}
