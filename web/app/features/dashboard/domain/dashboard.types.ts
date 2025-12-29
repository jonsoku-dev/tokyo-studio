import { z } from "zod";
import { selectTaskSchema } from "@itcom/db/schema";

// Extend or pick fields from generated schema
export const DashboardTaskSchema = selectTaskSchema
	.pick({
		id: true,
		title: true,
		description: true,
		status: true,
		priority: true,
		category: true,
	})
	.extend({
		// Enforce specific enums if Drizzle schema uses text (which we did for simplicity in Drizzle,
		// but can enable stricter checking here)
		category: z.enum(["Roadmap", "Settle Tokyo", "Job Hunt"]),
		status: z.enum(["pending", "completed"]),
		priority: z.enum(["urgent", "normal"]),
		dueDate: z.string().optional(),
	});

export type DashboardTask = z.infer<typeof DashboardTaskSchema>;

export const JobRecommendationSchema = z.object({
	id: z.string(),
	company: z.string(),
	title: z.string(),
	location: z.string(),
	isVisaSponsored: z.boolean(),
	tags: z.array(z.string()),
});

export type JobRecommendation = z.infer<typeof JobRecommendationSchema>;
