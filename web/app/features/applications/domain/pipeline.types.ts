import {
	selectApplicationStepSchema,
	selectPipelineItemSchema,
} from "@itcom/db/schema";
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

// SPEC-027 Phase 1: Enums
export const InterestLevelEnum = z.enum(["high", "medium", "low"]);
export const ConfidenceLevelEnum = z.enum([
	"confident",
	"neutral",
	"uncertain",
]);
export const StepTypeEnum = z.enum([
	"interview",
	"assignment",
	"offer",
	"other",
]);

export const PipelineItemSchema = selectPipelineItemSchema
	.pick({
		id: true,
		company: true,
		position: true,
		date: true,
		nextAction: true,
		resumeId: true, // SPEC 022: Document Integration
		// SPEC-027 Phase 1: Intent & Context
		motivation: true,
		interestLevel: true,
		confidenceLevel: true,
		// SPEC-027 Phase 1: Strategy Snapshot
		resumeVersionNote: true,
		positioningStrategy: true,
		emphasizedStrengths: true,
		// SPEC-027 Phase 1: Outcome Reflection
		outcomeReason: true,
		lessonsLearned: true,
		nextTimeChange: true,
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
		// SPEC-027: Steps relation (optional, loaded separately)
		steps: z.array(z.any()).optional(),
	});

// SPEC-027 Phase 1: Application Step Schema
export const ApplicationStepSchema = selectApplicationStepSchema.pick({
	id: true,
	applicationId: true,
	stepType: true,
	date: true,
	summary: true,
	selfEvaluation: true,
	createdAt: true,
	updatedAt: true,
});

export type PipelineItem = z.infer<typeof PipelineItemSchema>;
export type PipelineStatus = z.infer<typeof PipelineStatusEnum>;
export type ApplicationStep = z.infer<typeof ApplicationStepSchema>;
export type InterestLevel = z.infer<typeof InterestLevelEnum>;
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelEnum>;
export type StepType = z.infer<typeof StepTypeEnum>;

export interface PipelineStage {
	id: string;
	name: string;
	displayName: string;
	orderIndex: number;
}
