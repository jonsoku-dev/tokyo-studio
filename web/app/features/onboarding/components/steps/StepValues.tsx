import { clsx } from "clsx";
import { Check } from "lucide-react";
import { WORK_VALUES } from "../../constants";
import { useAssessmentStore } from "../../stores/useAssessmentStore";

export function StepValues() {
	const { formData, toggleWorkValue } = useAssessmentStore();

	return (
		<div className="space-y-8">
			<div className="space-y-1">
				<h2 className="heading-4 text-gray-900">
					직장을 선택할 때 가장 중요한 기준은?
				</h2>
				<p className="text-gray-500 text-sm">최대 3개까지 선택해 주세요.</p>
			</div>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
				{WORK_VALUES.map((val) => {
					const isSelected = formData.workValues.includes(val.value);
					return (
						<button
							key={val.value}
							type="button"
							onClick={() => toggleWorkValue(val.value)}
							className={clsx(
								"relative flex flex-col items-start rounded-xl border p-4 text-left transition-all",
								isSelected
									? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
									: "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
							)}
						>
							<div className="flex w-full items-center justify-between">
								<span
									className={clsx(
										"font-semibold text-sm",
										isSelected ? "text-primary-700" : "text-gray-900",
									)}
								>
									{val.label}
								</span>
								{isSelected && <Check className="h-4 w-4 text-primary-600" />}
							</div>
							<span className="mt-1 text-gray-500 text-xs">{val.desc}</span>
						</button>
					);
				})}
			</div>

			<div className="text-right text-gray-500 text-xs">
				{formData.workValues.length} / 3 선택됨
			</div>
		</div>
	);
}
