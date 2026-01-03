import { clsx } from "clsx";
import { ASSESSMENT_STEPS } from "../constants";
import { useAssessmentStore } from "../stores/useAssessmentStore";

export function AssessmentProgress() {
	const { step } = useAssessmentStore();
	const totalSteps = ASSESSMENT_STEPS.length;

	return (
		<div className="mb-10">
			{/* Steps Label */}
			<div className="mb-3 flex justify-between px-1">
				{ASSESSMENT_STEPS.map((s) => (
					<div
						key={s.id}
						className={clsx(
							"flex flex-col items-center gap-1 transition-colors duration-300",
							step >= s.id ? "text-primary-600" : "text-gray-400",
						)}
					>
						<span
							className={clsx(
								"font-bold text-xs uppercase tracking-wider",
								step === s.id ? "text-primary-600" : "text-transparent",
								step > s.id && "text-primary-600/50",
							)}
						>
							Step {s.id}
						</span>
						<span
							className={clsx(
								"font-medium text-sm sm:text-base",
								step === s.id && "text-gray-900",
							)}
						>
							{s.label}
						</span>
					</div>
				))}
			</div>

			{/* Bar */}
			<div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
				<div
					className="absolute top-0 left-0 h-full bg-primary-600 transition-all duration-500 ease-out"
					style={{
						width: `${((step - 1) / (totalSteps - 1)) * 100}%`,
					}}
				/>
				{/* Step Indicators on Bar */}
				<div className="absolute inset-0 flex justify-between px-[16%] sm:px-[8%]">
					{ASSESSMENT_STEPS.slice(1, -1).map((s) => (
						<div
							key={s.id}
							className={clsx(
								"h-full w-px",
								step > s.id ? "bg-primary-600" : "bg-white",
							)}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
