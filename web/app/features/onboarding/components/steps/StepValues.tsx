import { clsx } from "clsx";
import { Check } from "lucide-react";
import { WORK_VALUES } from "../../constants";
import { useAssessmentStore } from "../../stores/useAssessmentStore";

export function StepValues() {
	const { formData, toggleWorkValue } = useAssessmentStore();

	return (
		<div className="space-y-8">
			<div className="space-y-1">
				<h2 className="heading-4 text-gray-900">직장 선택의 핵심 가치</h2>
				<p className="body-sm text-gray-500">
					본인에게 가장 중요한 3가지 가치를 선택해주세요.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{WORK_VALUES.map((val) => {
					const isSelected = formData.workValues.includes(val.value);
					return (
						<button
							key={val.value}
							type="button"
							onClick={() => toggleWorkValue(val.value)}
							className={clsx(
								"relative flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-200",
								isSelected
									? "border-primary-500 bg-primary-50 shadow-sm ring-1 ring-primary-500"
									: "border-gray-200 bg-white hover:border-primary-200 hover:shadow-md",
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
								{isSelected && (
									<div className="rounded-full bg-primary-100 p-0.5">
										<Check className="h-3 w-3 text-primary-600" />
									</div>
								)}
							</div>
							<span className="mt-1.5 text-gray-500 text-xs leading-relaxed">
								{val.desc}
							</span>
						</button>
					);
				})}
			</div>

			<div className="flex justify-end">
				<span
					className={clsx(
						"font-medium text-xs",
						formData.workValues.length === 3
							? "text-primary-600"
							: "text-gray-400",
					)}
				>
					{formData.workValues.length} / 3 선택됨
				</span>
			</div>
		</div>
	);
}
