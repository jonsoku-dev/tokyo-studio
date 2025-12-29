import { z } from "zod";
import { selectPipelineItemSchema } from "@itcom/db/schema";

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
	})
	.extend({
		stage: PipelineStatusEnum,
	});

export type PipelineItem = z.infer<typeof PipelineItemSchema>;
export type PipelineStatus = z.infer<typeof PipelineStatusEnum>;
