import { clsx } from "clsx";
import { Check } from "lucide-react";
import { TECH_STACKS } from "../../constants";
import { useAssessmentStore } from "../../stores/useAssessmentStore";

export function StepTechStack() {
	const { formData, toggleTechStack } = useAssessmentStore();

	return (
		<div className="space-y-8">
			<div className="space-y-1">
				<h2 className="heading-4 text-gray-900">보유 기술 스택</h2>
				<p className="body-sm text-gray-500">
					실무에서 주력으로 사용하는 기술을 모두 선택해주세요. (복수 선택 가능)
				</p>
			</div>

			<div className="flex flex-wrap gap-2.5">
				{TECH_STACKS.map((tech) => {
					const isSelected = formData.techStack.includes(tech.value);
					return (
						<button
							key={tech.value}
							type="button"
							onClick={() => toggleTechStack(tech.value)}
							className={clsx(
								"flex items-center gap-2 rounded-full border px-5 py-2.5 font-medium text-sm transition-all duration-200",
								isSelected
									? "border-primary-600 bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-600"
									: "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm",
							)}
						>
							{isSelected && <Check className="h-4 w-4" />}
							{tech.label}
						</button>
					);
				})}
			</div>

			<div className="flex items-center gap-2 rounded-xl bg-gray-50 p-4 text-gray-600 text-xs sm:text-sm">
				<span className="text-lg">💡</span>
				<span>
					목록에 없는 기술은 추후 프로필 상세 설정에서 자유롭게 추가하실 수
					있습니다.
				</span>
			</div>
		</div>
	);
}
