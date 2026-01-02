import { clsx } from "clsx";
import { Check } from "lucide-react";
import { TECH_STACKS } from "../../constants";
import { useAssessmentStore } from "../../stores/useAssessmentStore";

export function StepTechStack() {
	const { formData, toggleTechStack } = useAssessmentStore();

	return (
		<div className="space-y-8">
			<div className="space-y-1">
				<h2 className="heading-4 text-gray-900">주로 사용하는 기술 스택은?</h2>
				<p className="text-gray-500 text-sm">
					해당 기술을 사용하는 기업을 우선적으로 추천해 드립니다. (복수 선택
					가능)
				</p>
			</div>

			<div className="flex flex-wrap gap-2">
				{TECH_STACKS.map((tech) => {
					const isSelected = formData.techStack.includes(tech.value);
					return (
						<button
							key={tech.value}
							type="button"
							onClick={() => toggleTechStack(tech.value)}
							className={clsx(
								"flex items-center gap-1.5 rounded-full border px-4 py-2 font-medium text-sm transition-all",
								isSelected
									? "border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600"
									: "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
							)}
						>
							{isSelected && <Check className="h-4 w-4" />}
							{tech.label}
						</button>
					);
				})}
			</div>

			<div className="rounded-lg bg-gray-50 p-4 text-gray-600 text-xs">
				💡 목록에 없는 기술은 추후 프로필 상세 설정에서 추가할 수 있습니다.
			</div>
		</div>
	);
}
