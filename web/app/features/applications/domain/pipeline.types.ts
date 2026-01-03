import { selectPipelineItemSchema } from "@itcom/db/schema";
import { z } from "zod";

// MVP Statuses
export const PipelineStatusEnum = z.enum([
	"interested",
	"applied",
	"assignment",
	"interview_1",
	"interview_2",
	"interview_3",
	"offer",
	"visa_coe",
	"joined",
	"rejected",
	"withdrawn",
]);

export const PipelineItemSchema = selectPipelineItemSchema
	.pick({
		id: true,
		company: true,
		position: true,
		date: true,
		nextAction: true,
		resumeId: true, // SPEC 022: Document Integration
	})
	.extend({
		stage: PipelineStatusEnum,
		resume: z
			.object({
				id: z.string(),
				title: z.string(),
				type: z.string(),
			})
			.nullable()
			.optional(),
	});

export type PipelineItem = z.infer<typeof PipelineItemSchema>;
export type PipelineStatus = z.infer<typeof PipelineStatusEnum>;

export interface PipelineStage {
	id: string;
	name: string;
	displayName: string;
	orderIndex: number;
}
