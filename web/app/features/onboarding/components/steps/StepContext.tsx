import { clsx } from "clsx";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/shared/components/ui/Select";
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
				<h2 className="heading-4 text-gray-900">현재 상황을 알려주세요</h2>
				<p className="text-gray-500 text-sm">
					비자 발급 가능 여부와 취업 전략을 수립하는 데 결정적입니다.
				</p>
			</div>

			<div className="space-y-6">
				{/* Residence */}
				<div className="space-y-3">
					<label
						htmlFor="residence-select"
						className="block font-medium text-gray-900 text-sm"
					>
						현재 거주지
					</label>
					<div className="grid grid-cols-3 gap-2">
						{RESIDENCE_OPTIONS.map((opt) => (
							<button
								key={opt.value}
								type="button"
								onClick={() => updateField("residence", opt.value)}
								className={clsx(
									"rounded-lg border px-3 py-2.5 font-medium text-sm transition-all",
									formData.residence === opt.value
										? "border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500"
										: "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
								)}
							>
								{opt.label}
							</button>
						))}
					</div>
				</div>

				{/* Degree */}
				<div className="space-y-3">
					<label
						htmlFor="degree-select"
						className="block font-medium text-gray-900 text-sm"
					>
						최종 학력 (학위)
					</label>
					<Select
						value={formData.hardConstraints.degree}
						onValueChange={(val) => updateHard("degree", val)}
					>
						<SelectTrigger id="degree-select">
							<SelectValue placeholder="학력을 선택해주세요" />
						</SelectTrigger>
						<SelectContent>
							{DEGREE_OPTIONS.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{formData.hardConstraints.degree === "none" && (
						<p className="text-orange-600 text-xs">
							⚠️ 학위가 없으실 경우 취업 비자 발급이 까다로울 수 있습니다. (경력
							10년 이상 필요 등)
						</p>
					)}
				</div>

				{/* Timeline */}
				<div className="space-y-3">
					<label
						htmlFor="timeline-select"
						className="block font-medium text-gray-900 text-sm"
					>
						취업 희망 시기
					</label>
					<Select
						value={formData.careerTimeline}
						onValueChange={(val) => updateField("careerTimeline", val)}
					>
						<SelectTrigger id="timeline-select">
							<SelectValue placeholder="언제 취업하고 싶으신가요?" />
						</SelectTrigger>
						<SelectContent>
							{TIMELINE_OPTIONS.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}
