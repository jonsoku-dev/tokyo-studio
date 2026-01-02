import { clsx } from "clsx";
import { motion } from "framer-motion";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/shared/components/ui/Select";
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
				<h2 className="heading-4 text-gray-900">어학 능력을 알려주세요</h2>
				<p className="text-gray-500 text-sm">
					일본 취업에서 가장 중요한 요소 중 하나입니다.
				</p>
			</div>

			<div className="space-y-4">
				<span className="block font-medium text-gray-900 text-sm">
					일본어 실력 (JLPT 기준)
				</span>
				<div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
					{JP_LEVELS.map((lvl) => (
						<button
							key={lvl.value}
							type="button"
							onClick={() => updateField("jpLevel", lvl.value)}
							className={clsx(
								"rounded-lg border px-3 py-2.5 font-medium text-sm transition-all",
								formData.jpLevel === lvl.value
									? "border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500"
									: "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50",
							)}
						>
							{lvl.label}
						</button>
					))}
				</div>
			</div>

			<div className="space-y-4">
				<label
					htmlFor="en-level-select"
					className="block font-medium text-gray-900 text-sm"
				>
					영어 실력
				</label>
				<Select
					value={formData.enLevel}
					onValueChange={(val) => updateField("enLevel", val)}
				>
					<SelectTrigger id="en-level-select">
						<SelectValue placeholder="영어 실력을 선택해주세요" />
					</SelectTrigger>
					<SelectContent>
						{EN_LEVELS.map((lvl) => (
							<SelectItem key={lvl.value} value={lvl.value}>
								{lvl.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</motion.div>
	);
}
