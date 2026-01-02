import { create } from "zustand";
import { ASSESSMENT_STEPS } from "../constants";

export interface AssessmentData {
	jobFamily: string;
	level: string;
	years: number;
	jpLevel: string;
	enLevel: string;
	targetCity: string;
	// v2.0 Fields
	techStack: string[];
	hardConstraints: {
		degree?: "bachelor" | "associate" | "none";
		visaStatus?: "none" | "student" | "working" | "spouse" | "hsp";
	};
	workValues: string[];
	careerTimeline?: string; // "ASAP" | "3M" | "6M" | "1Y"
	residence?: string; // "KR" | "JP" | "Other"
	concerns: string[];
}

interface AssessmentState {
	step: number;
	formData: AssessmentData;
	setStep: (step: number) => void;
	nextStep: () => void;
	prevStep: () => void;
	// biome-ignore lint/suspicious/noExplicitAny: generic value
	updateField: (field: keyof AssessmentData, value: any) => void;
	// biome-ignore lint/suspicious/noExplicitAny: generic value
	setFormData: (data: any) => void;
	toggleTechStack: (tech: string) => void;
	toggleWorkValue: (value: string) => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
	step: 1,
	formData: {
		jobFamily: "frontend",
		level: "junior",
		years: 0,
		jpLevel: "None",
		enLevel: "Basic",
		targetCity: "Tokyo",
		techStack: [],
		hardConstraints: { degree: "bachelor", visaStatus: "none" },
		softConstraints: { residence: "KR", timeline: "3M" },
		workValues: [],
		concerns: [],
	},
	setStep: (step) => set({ step }),
	nextStep: () =>
		set((state) => ({
			step: state.step < ASSESSMENT_STEPS.length ? state.step + 1 : state.step,
		})),
	prevStep: () =>
		set((state) => ({ step: state.step > 1 ? state.step - 1 : state.step })),
	updateField: (field, value) =>
		set((state) => ({
			formData: { ...state.formData, [field]: value },
		})),
	setFormData: (data) =>
		set((state) => ({
			formData: { ...state.formData, ...data },
		})),
	toggleTechStack: (tech) =>
		set((state) => {
			const current = state.formData.techStack;
			const updated = current.includes(tech)
				? current.filter((t) => t !== tech)
				: [...current, tech];
			return { formData: { ...state.formData, techStack: updated } };
		}),
	toggleWorkValue: (value) =>
		set((state) => {
			const current = state.formData.workValues;
			const updated = current.includes(value)
				? current.filter((v) => v !== value)
				: current.length < 3
					? [...current, value]
					: current;
			return { formData: { ...state.formData, workValues: updated } };
		}),
}));
