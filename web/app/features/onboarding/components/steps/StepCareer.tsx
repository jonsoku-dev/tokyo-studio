import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/shared/components/ui/Select";
import { JOB_FAMILIES, LEVELS } from "../../constants";
import { useAssessmentStore } from "../../stores/useAssessmentStore";

export function StepCareer() {
	const { formData, updateField } = useAssessmentStore();

	return (
		<motion.div
			key="step1"
			initial={{ x: 20, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			exit={{ x: -20, opacity: 0 }}
			className="space-y-8"
		>
			<div className="space-y-1">
				<h2 className="heading-4 text-gray-900">기본 경력 프로필</h2>
				<p className="body-sm text-gray-500">
					현재 커리어 단계를 정확히 진단하여 맞춤형 플랜을 제공합니다.
				</p>
			</div>

			<div className="space-y-4">
				<label htmlFor="job-family-select" className="label">
					희망 직군
				</label>
				<Select
					value={formData.jobFamily}
					onValueChange={(val) => updateField("jobFamily", val)}
				>
					<SelectTrigger id="job-family-select" className="h-12 text-base">
						<SelectValue placeholder="직군을 선택해주세요" />
					</SelectTrigger>
					<SelectContent>
						{JOB_FAMILIES.map((job) => (
							<SelectItem key={job.value} value={job.value} className="py-3">
								{job.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-4">
				<span className="label">현재 연차 및 레벨</span>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{LEVELS.map((lvl) => (
						<button
							key={lvl.value}
							type="button"
							onClick={() => updateField("level", lvl.value)}
							className={clsx(
								"relative flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-200",
								formData.level === lvl.value
									? "border-primary-500 bg-primary-50 shadow-sm ring-1 ring-primary-500"
									: "border-gray-200 bg-white hover:border-primary-200 hover:shadow-md",
							)}
						>
							<div className="flex w-full items-center justify-between">
								<span
									className={clsx(
										"font-semibold text-sm",
										formData.level === lvl.value
											? "text-primary-700"
											: "text-gray-900",
									)}
								>
									{lvl.label}
								</span>
								{formData.level === lvl.value && (
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
		</motion.div>
	);
}
