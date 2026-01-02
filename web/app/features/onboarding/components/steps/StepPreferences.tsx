import { motion } from "framer-motion";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/shared/components/ui/Select";
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
				<h2 className="heading-4 text-gray-900">
					선호하시는 근무 지역은 어디인가요?
				</h2>
				<p className="text-gray-500 text-sm">
					원하시는 지역을 기반으로 회사를 추천해 드립니다.
				</p>
			</div>

			<div className="space-y-4">
				<label
					htmlFor="target-city-select"
					className="block font-medium text-gray-900 text-sm"
				>
					희망 도시
				</label>
				<Select
					value={formData.targetCity}
					onValueChange={(val) => updateField("targetCity", val)}
				>
					<SelectTrigger id="target-city-select">
						<SelectValue placeholder="희망 도시를 선택해주세요" />
					</SelectTrigger>
					<SelectContent>
						{CITIES.map((city) => (
							<SelectItem key={city.value} value={city.value}>
								{city.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
				<h3 className="mb-3 font-semibold text-gray-900 text-sm">
					입력 정보 요약
				</h3>
				<dl className="space-y-2 text-sm">
					<div className="flex justify-between">
						<dt className="text-gray-500">직무/레벨</dt>
						<dd className="font-medium text-gray-900">
							{JOB_FAMILIES.find((j) => j.value === formData.jobFamily)
								?.label || formData.jobFamily}{" "}
							(
							{LEVELS.find((l) => l.value === formData.level)?.label ||
								formData.level}
							)
						</dd>
					</div>
					<div className="flex justify-between">
						<dt className="text-gray-500">일본어</dt>
						<dd className="font-medium text-gray-900">
							{JP_LEVELS.find((l) => l.value === formData.jpLevel)?.label ||
								formData.jpLevel}
						</dd>
					</div>
					<div className="flex justify-between">
						<dt className="text-gray-500">영어</dt>
						<dd className="font-medium text-gray-900">
							{EN_LEVELS.find((l) => l.value === formData.enLevel)?.label ||
								formData.enLevel}
						</dd>
					</div>
					<div className="flex justify-between">
						<dt className="text-gray-500">희망 도시</dt>
						<dd className="font-medium text-gray-900">
							{CITIES.find((c) => c.value === formData.targetCity)?.label ||
								formData.targetCity}
						</dd>
					</div>
				</dl>
			</div>
		</motion.div>
	);
}
