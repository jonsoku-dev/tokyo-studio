import { profiles } from "@itcom/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const InsertProfileSchema = createInsertSchema(profiles);
export const SelectProfileSchema = createSelectSchema(profiles);

export type InsertProfile = z.infer<typeof InsertProfileSchema>;
export type Profile = z.infer<typeof SelectProfileSchema>;

export const ProfileStepSchema = z.object({
	jobFamily: z.enum([
		"frontend",
		"backend",
		"fullstack",
		"mobile",
		"data",
		"infra",
		"manager",
		"other",
	]),
	level: z.enum(["junior", "mid", "senior", "lead"]),
	years: z.number().min(0).max(50),
	jpLevel: z.enum(["N1", "N2", "N3", "N4", "N5", "None", "Native"]),
	enLevel: z.enum(["Business", "Conversational", "Basic", "Native"]),
	targetCity: z.string().default("Tokyo"),
	// v2.0 Extensions
	techStack: z.array(z.string()).default([]),
	hardConstraints: z
		.object({
			degree: z.enum(["bachelor", "associate", "none"]).optional(),
			visaStatus: z
				.enum(["none", "student", "working", "spouse", "hsp"])
				.optional(),
		})
		.default({}),
	workValues: z.array(z.string()).default([]),
	careerTimeline: z.enum(["ASAP", "3M", "6M", "1Y"]).optional(),
	residence: z.enum(["KR", "JP", "Other"]).default("KR"),
	concerns: z.array(z.string()).default([]),
});

export type ProfileStep = z.infer<typeof ProfileStepSchema>;

// Enums for UI
export const RESIDENCE_OPTIONS = [
	{ value: "KR", label: "한국 거주" },
	{ value: "JP", label: "일본 거주" },
	{ value: "Other", label: "그 외 해외" },
] as const;

export const TIMELINE_OPTIONS = [
	{ value: "ASAP", label: "급함 (3개월 내)" },
	{ value: "3M", label: "3~6개월" },
	{ value: "6M", label: "6개월~1년" },
	{ value: "1Y", label: "1년 이상 (장기)" },
] as const;

export const DEGREE_OPTIONS = [
	{ value: "bachelor", label: "4년제 학사 이상" },
	{ value: "associate", label: "2/3년제 전문학사" },
	{ value: "none", label: "학위 없음 (고졸 등)" },
] as const;
