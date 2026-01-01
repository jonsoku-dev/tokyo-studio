import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useNavigation, useSubmit } from "react-router";
import { Button } from "~/shared/components/ui/Button";

interface DiagnosisWizardProps {
	// biome-ignore lint/suspicious/noExplicitAny: Legacy component
	defaultValues?: any;
}

export function DiagnosisWizard({ defaultValues }: DiagnosisWizardProps) {
	const [step, setStep] = useState(1);
	const submit = useSubmit();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	const [formData, setFormData] = useState({
		jobFamily: defaultValues?.jobFamily || "frontend",
		level: defaultValues?.level || "junior",
		years: defaultValues?.years || 0,
		jpLevel: defaultValues?.jpLevel || "None",
		enLevel: defaultValues?.enLevel || "Basic",
		targetCity: defaultValues?.targetCity || "Tokyo",
	});

	// biome-ignore lint/suspicious/noExplicitAny: Legacy component
	const updateField = (field: string, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleNext = () => {
		if (step < 3) setStep(step + 1);
		else {
			submit(formData, { method: "post" });
		}
	};

	const handleBack = () => {
		if (step > 1) setStep(step - 1);
	};

	return (
		<div className="mx-auto w-full max-w-2xl">
			{/* Progress Bar */}
			<div className="mb-8">
				<div className="mb-2 flex justify-between font-medium text-gray-500 text-sm">
					<span className={clsx(step >= 1 && "text-primary-600")}>Career</span>
					<span className={clsx(step >= 2 && "text-primary-600")}>
						Language
					</span>
					<span className={clsx(step >= 3 && "text-primary-600")}>
						Preferences
					</span>
				</div>
				<div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
					<div
						className="h-full bg-primary-600 transition-all duration-300 ease-in-out"
						style={{ width: `${(step / 3) * 100}%` }}
					/>
				</div>
			</div>

			<div className="card-sm relative min-h-[400px] overflow-hidden border border-gray-200 p-8">
				<AnimatePresence mode="wait">
					{step === 1 && (
						<motion.div
							key="step1"
							initial={{ x: 50, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: -50, opacity: 0 }}
							className="stack-md"
						>
							<h2 className="heading-4">Tell us about your career</h2>

							<div>
								<label
									htmlFor="jobFamily"
									className="mb-1 block font-medium text-gray-700 text-sm"
								>
									Job Family
								</label>
								<select
									id="jobFamily"
									value={formData.jobFamily}
									onChange={(e) => updateField("jobFamily", e.target.value)}
									className="w-full rounded-md border border-gray-300 bg-white p-2"
								>
									<option value="frontend">Frontend Developer</option>
									<option value="backend">Backend Developer</option>
									<option value="mobile">Mobile Developer</option>
									<option value="data">Data Scientist/Engineer</option>
									<option value="infra">Infrastructure/DevOps</option>
								</select>
							</div>

							<div>
								<span className="mb-1 block font-medium text-gray-700 text-sm">
									Current Level
								</span>
								<div className="grid grid-cols-2 gap-3">
									{["junior", "mid", "senior", "lead"].map((lvl) => (
										<button
											key={lvl}
											type="button"
											onClick={() => updateField("level", lvl)}
											className={clsx(
												"rounded-lg border p-3 font-medium text-sm capitalize transition-colors",
												formData.level === lvl
													? "border-primary-500 bg-primary-50 text-primary-700"
													: "border-gray-200 text-gray-700 hover:border-gray-300",
											)}
										>
											{lvl}
										</button>
									))}
								</div>
							</div>
						</motion.div>
					)}

					{step === 2 && (
						<motion.div
							key="step2"
							initial={{ x: 50, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: -50, opacity: 0 }}
							className="stack-md"
						>
							<h2 className="heading-4">Language Skills</h2>

							<div>
								<span className="mb-1 block font-medium text-gray-700 text-sm">
									Japanese Level (JLPT Equivalent)
								</span>
								<div className="grid grid-cols-3 gap-3">
									{["None", "N5", "N4", "N3", "N2", "N1", "Native"].map(
										(lvl) => (
											<button
												key={lvl}
												type="button"
												onClick={() => updateField("jpLevel", lvl)}
												className={clsx(
													"rounded-lg border p-3 font-medium text-sm transition-colors",
													formData.jpLevel === lvl
														? "border-primary-500 bg-primary-50 text-primary-700"
														: "border-gray-200 text-gray-700 hover:border-gray-300",
												)}
											>
												{lvl}
											</button>
										),
									)}
								</div>
							</div>

							<div>
								<label
									htmlFor="enLevel"
									className="mb-1 block font-medium text-gray-700 text-sm"
								>
									English Level
								</label>
								<select
									id="enLevel"
									value={formData.enLevel}
									onChange={(e) => updateField("enLevel", e.target.value)}
									className="w-full rounded-md border border-gray-300 bg-white p-2"
								>
									<option value="Basic">Basic</option>
									<option value="Conversational">Conversational</option>
									<option value="Business">Business</option>
									<option value="Native">Native</option>
								</select>
							</div>
						</motion.div>
					)}

					{step === 3 && (
						<motion.div
							key="step3"
							initial={{ x: 50, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: -50, opacity: 0 }}
							className="stack-md"
						>
							<h2 className="heading-4">Preferences</h2>

							<div>
								<label
									htmlFor="targetCity"
									className="mb-1 block font-medium text-gray-700 text-sm"
								>
									Target City
								</label>
								<select
									id="targetCity"
									value={formData.targetCity}
									onChange={(e) => updateField("targetCity", e.target.value)}
									className="w-full rounded-md border border-gray-300 bg-white p-2"
								>
									<option value="Tokyo">Tokyo</option>
									<option value="Osaka">Osaka</option>
									<option value="Fukuoka">Fukuoka</option>
									<option value="Kyoto">Kyoto</option>
									<option value="Remote">Remote</option>
								</select>
							</div>

							<div className="rounded-lg bg-gray-50 p-4">
								<h3 className="heading-5 mb-2 text-sm">Summary</h3>
								<ul className="body-sm stack-xs">
									<li>
										Role:{" "}
										<span className="font-semibold">
											{formData.jobFamily} ({formData.level})
										</span>
									</li>
									<li>
										Japanese:{" "}
										<span className="font-semibold">{formData.jpLevel}</span>
									</li>
									<li>
										English:{" "}
										<span className="font-semibold">{formData.enLevel}</span>
									</li>
									<li>
										City:{" "}
										<span className="font-semibold">{formData.targetCity}</span>
									</li>
								</ul>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				<div className="absolute right-8 bottom-8 left-8 flex justify-between border-gray-100 border-t pt-4">
					<Button
						variant="ghost"
						onClick={handleBack}
						disabled={step === 1 || isSubmitting}
						className={clsx(step === 1 && "invisible")}
					>
						Back
					</Button>
					<Button onClick={handleNext} disabled={isSubmitting}>
						{step === 3
							? isSubmitting
								? "Generating Plan..."
								: "Complete Diagnosis"
							: "Next Step"}
					</Button>
				</div>
			</div>
		</div>
	);
}
