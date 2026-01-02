import { clsx } from "clsx";
import { ASSESSMENT_STEPS } from "../constants";
import { useAssessmentStore } from "../stores/useAssessmentStore";

export function AssessmentProgress() {
	const { step } = useAssessmentStore();
	const totalSteps = ASSESSMENT_STEPS.length;

	return (
		<div className="mb-8">
			<div className="mb-2 flex justify-between font-medium text-gray-500 text-sm">
				{ASSESSMENT_STEPS.map((s) => (
					<span
						key={s.id}
						className={clsx(step >= s.id && "font-bold text-primary-600")}
					>
						{s.label}
					</span>
				))}
			</div>
			<div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
				<div
					className="h-full bg-primary-600 transition-all duration-300 ease-in-out"
					style={{
						width: `${((step - 1) / (totalSteps - 1)) * 100}%`,
					}}
				/>
			</div>
		</div>
	);
}
