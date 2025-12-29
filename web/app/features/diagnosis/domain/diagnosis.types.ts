import { profiles } from "@itcom/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const InsertProfileSchema = createInsertSchema(profiles);
export const SelectProfileSchema = createSelectSchema(profiles);

export type InsertProfile = z.infer<typeof InsertProfileSchema>;
export type Profile = z.infer<typeof SelectProfileSchema>;

export const DiagnosisStepSchema = z.object({
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
});
