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
				<h2 className="heading-4 text-gray-900">경력 정보를 알려주세요</h2>
				<p className="text-gray-500 text-sm">
					가장 적합한 로드맵을 제안해 드리기 위해 필요합니다.
				</p>
			</div>

			<div className="space-y-4">
				<label
					htmlFor="job-family-select"
					className="block font-medium text-gray-900 text-sm"
				>
					직군
				</label>
				<Select
					value={formData.jobFamily}
					onValueChange={(val) => updateField("jobFamily", val)}
				>
					<SelectTrigger id="job-family-select">
						<SelectValue placeholder="직군을 선택해주세요" />
					</SelectTrigger>
					<SelectContent>
						{JOB_FAMILIES.map((job) => (
							<SelectItem key={job.value} value={job.value}>
								{job.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-4">
				<span className="block font-medium text-gray-900 text-sm">
					현재 연차/레벨
				</span>
				<div className="grid grid-cols-2 gap-3">
					{LEVELS.map((lvl) => (
						<button
							key={lvl.value}
							type="button"
							onClick={() => updateField("level", lvl.value)}
							className={clsx(
								"relative flex flex-col items-start rounded-xl border p-4 text-left transition-all",
								formData.level === lvl.value
									? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
									: "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
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
									<Check className="h-4 w-4 text-primary-600" />
								)}
							</div>
							<span className="mt-1 text-gray-500 text-xs">{lvl.desc}</span>
						</button>
					))}
				</div>
			</div>
		</motion.div>
	);
}
