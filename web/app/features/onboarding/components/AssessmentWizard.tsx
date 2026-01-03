import { clsx } from "clsx";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useNavigation, useSubmit } from "react-router";
import { Button } from "~/shared/components/ui/Button";
import { useAssessmentStore } from "../stores/useAssessmentStore";
import { AssessmentProgress } from "./AssessmentProgress";
import { StepCareer } from "./steps/StepCareer";
import { StepContext } from "./steps/StepContext";
import { StepLanguage } from "./steps/StepLanguage";
import { StepPreferences } from "./steps/StepPreferences";
import { StepTechStack } from "./steps/StepTechStack";
import { StepValues } from "./steps/StepValues";

interface AssessmentWizardProps {
	// biome-ignore lint/suspicious/noExplicitAny: Data structure is dynamic
	defaultValues?: any;
}

import { ASSESSMENT_STEPS } from "../constants";

export function AssessmentWizard({ defaultValues }: AssessmentWizardProps) {
	const { step, formData, nextStep, prevStep, setFormData } =
		useAssessmentStore();
	const submit = useSubmit();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	// Sync store with defaultValues on mount/change
	useEffect(() => {
		if (defaultValues) {
			setFormData(defaultValues);
		}
	}, [defaultValues, setFormData]);

	const totalSteps = ASSESSMENT_STEPS.length;

	const handleNext = () => {
		if (step < totalSteps) {
			nextStep();
		} else {
			// Convert complex state to FormData for submission
			const submissionData = new FormData();
			// Basic fields
			if (formData.jobFamily)
				submissionData.append("jobFamily", formData.jobFamily);
			if (formData.level) submissionData.append("level", formData.level);
			if (formData.jpLevel) submissionData.append("jpLevel", formData.jpLevel);
			if (formData.enLevel) submissionData.append("enLevel", formData.enLevel);
			if (formData.targetCity)
				submissionData.append("targetCity", formData.targetCity);
			if (formData.careerTimeline)
				submissionData.append("careerTimeline", formData.careerTimeline);
			if (formData.residence)
				submissionData.append("residence", formData.residence);

			// Arrays
			formData.techStack.forEach((t) => {
				submissionData.append("techStack", t);
			});
			formData.workValues.forEach((v) => {
				submissionData.append("workValues", v);
			});
			formData.concerns.forEach((c) => {
				submissionData.append("concerns", c);
			});

			// Nested objects (JSON serialized)
			submissionData.append(
				"hardConstraints",
				JSON.stringify(formData.hardConstraints),
			);

			submit(submissionData, { method: "post" });
		}
	};

	return (
		<div className="mx-auto w-full max-w-3xl">
			{/* Progress Bar */}
			<AssessmentProgress />

			<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-responsive shadow-lg">
				<AnimatePresence mode="wait">
					{step === 1 && <StepCareer />}
					{step === 2 && <StepLanguage />}
					{step === 3 && <StepTechStack />}
					{step === 4 && <StepContext />}
					{step === 5 && <StepValues />}
					{step === 6 && <StepPreferences />}
				</AnimatePresence>

				<div className="mt-8 flex justify-between border-gray-100 border-t pt-8">
					<Button
						variant="ghost"
						onClick={prevStep}
						disabled={step === 1 || isSubmitting}
						className={clsx(step === 1 && "invisible")}
					>
						이전 단계
					</Button>
					<Button
						onClick={handleNext}
						disabled={isSubmitting}
						className="min-w-[120px]"
					>
						{step === totalSteps
							? isSubmitting
								? "분석 중..."
								: "결과 확인하기"
							: "다음으로"}
					</Button>
				</div>
			</div>
		</div>
	);
}
