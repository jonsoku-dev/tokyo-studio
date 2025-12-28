import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "~/shared/components/ui/Button";
import { Input } from "~/shared/components/ui/Input";
import { Form, useSubmit, useNavigation } from "react-router";
import { clsx } from "clsx";

interface DiagnosisWizardProps {
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

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
        <div className="w-full max-w-2xl mx-auto">
             {/* Progress Bar */}
             <div className="mb-8">
                <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                    <span className={clsx(step >= 1 && "text-orange-600")}>Career</span>
                    <span className={clsx(step >= 2 && "text-orange-600")}>Language</span>
                    <span className={clsx(step >= 3 && "text-orange-600")}>Preferences</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-orange-600 transition-all duration-300 ease-in-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[400px] relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-bold text-gray-900">Tell us about your career</h2>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Family</label>
                                <select 
                                    value={formData.jobFamily}
                                    onChange={(e) => updateField("jobFamily", e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md bg-white"
                                >
                                    <option value="frontend">Frontend Developer</option>
                                    <option value="backend">Backend Developer</option>
                                    <option value="mobile">Mobile Developer</option>
                                    <option value="data">Data Scientist/Engineer</option>
                                    <option value="infra">Infrastructure/DevOps</option>
                                </select>
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Level</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {["junior", "mid", "senior", "lead"].map((lvl) => (
                                        <button
                                            key={lvl}
                                            type="button"
                                            onClick={() => updateField("level", lvl)}
                                            className={clsx(
                                                "p-3 rounded-lg border text-sm font-medium capitalize transition-colors",
                                                formData.level === lvl 
                                                    ? "border-orange-500 bg-orange-50 text-orange-700"
                                                    : "border-gray-200 hover:border-gray-300 text-gray-700"
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
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-bold text-gray-900">Language Skills</h2>
                            
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Japanese Level (JLPT Equivalent)</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {["None", "N5", "N4", "N3", "N2", "N1", "Native"].map((lvl) => (
                                        <button
                                            key={lvl}
                                            type="button"
                                            onClick={() => updateField("jpLevel", lvl)}
                                            className={clsx(
                                                "p-3 rounded-lg border text-sm font-medium transition-colors",
                                                formData.jpLevel === lvl 
                                                    ? "border-orange-500 bg-orange-50 text-orange-700"
                                                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                                            )}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">English Level</label>
                                <select 
                                    value={formData.enLevel}
                                    onChange={(e) => updateField("enLevel", e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md bg-white"
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
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
                            
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target City</label>
                                <select 
                                    value={formData.targetCity}
                                    onChange={(e) => updateField("targetCity", e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md bg-white"
                                >
                                    <option value="Tokyo">Tokyo</option>
                                    <option value="Osaka">Osaka</option>
                                    <option value="Fukuoka">Fukuoka</option>
                                    <option value="Kyoto">Kyoto</option>
                                    <option value="Remote">Remote</option>
                                </select>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Summary</h3>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>Role: <span className="font-semibold">{formData.jobFamily} ({formData.level})</span></li>
                                    <li>Japanese: <span className="font-semibold">{formData.jpLevel}</span></li>
                                    <li>English: <span className="font-semibold">{formData.enLevel}</span></li>
                                    <li>City: <span className="font-semibold">{formData.targetCity}</span></li>
                                </ul>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute bottom-8 right-8 left-8 flex justify-between pt-4 border-t border-gray-100">
                     <Button 
                        variant="ghost" 
                        onClick={handleBack}
                        disabled={step === 1 || isSubmitting}
                        className={clsx(step === 1 && "invisible")}
                    >
                        Back
                    </Button>
                    <Button 
                        onClick={handleNext}
                        disabled={isSubmitting}
                    >
                        {step === 3 ? (isSubmitting ? "Generating Plan..." : "Complete Diagnosis") : "Next Step"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
