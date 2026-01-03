import { db } from "@itcom/db/client";
import {
	applicationSteps,
	documents,
	pipelineItems,
	pipelineStages,
} from "@itcom/db/schema";
import { asc, eq, inArray } from "drizzle-orm";
import type {
	ApplicationStep,
	ConfidenceLevel,
	InterestLevel,
	PipelineItem,
	PipelineStatus,
	StepType,
} from "./pipeline.types";

// SPEC-027 Phase 1: Extended data type for add/update operations
interface PipelineItemData {
	company?: string;
	position?: string;
	stage?: PipelineStatus;
	date?: string;
	nextAction?: string | null;
	resumeId?: string | null; // SPEC 022: Document Integration
	// Phase 1: Intent & Context
	motivation?: string | null;
	interestLevel?: InterestLevel | null;
	confidenceLevel?: ConfidenceLevel | null;
	// Phase 1: Strategy Snapshot
	resumeVersionNote?: string | null;
	positioningStrategy?: string | null;
	emphasizedStrengths?: string[] | null;
	// Phase 1: Outcome Reflection
	outcomeReason?: string | null;
	lessonsLearned?: string | null;
	nextTimeChange?: string | null;
}

export const pipelineService = {
	getItems: async (userId: string): Promise<PipelineItem[]> => {
		console.log("[pipelineService.getItems] Starting with userId:", userId);
		
		try {
			// Use basic select instead of relational query to avoid lateral join issues
			const items = await db
				.select()
				.from(pipelineItems)
				.where(eq(pipelineItems.userId, userId))
				.orderBy(asc(pipelineItems.orderIndex));

			console.log("[pipelineService.getItems] Query successful, items count:", items.length);

			// Fetch resumes separately if needed
			const resumeIds = items
				.map((item) => item.resumeId)
				.filter((id): id is string => id !== null);

			const resumes =
				resumeIds.length > 0
					? await db
							.select({
								id: documents.id,
								title: documents.title,
								type: documents.type,
							})
							.from(documents)
							.where(inArray(documents.id, resumeIds))
					: [];

			// Create a resume lookup map
			const resumeMap = new Map(resumes.map((r) => [r.id, r]));

			return items.map((item) => ({
				id: item.id,
				company: item.company,
				position: item.position,
				stage: item.stage as PipelineStatus,
				date: item.date,
				nextAction: item.nextAction || null,
				resumeId: item.resumeId || null,
				resume: item.resumeId ? resumeMap.get(item.resumeId) || null : null,
				// SPEC-027 Phase 1: Intent & Context
				motivation: item.motivation || null,
				interestLevel: (item.interestLevel as InterestLevel) || null,
				confidenceLevel: (item.confidenceLevel as ConfidenceLevel) || null,
				// SPEC-027 Phase 1: Strategy Snapshot
				resumeVersionNote: item.resumeVersionNote || null,
				positioningStrategy: item.positioningStrategy || null,
				emphasizedStrengths: (item.emphasizedStrengths as string[]) || [],
				// SPEC-027 Phase 1: Outcome Reflection
				outcomeReason: item.outcomeReason || null,
				lessonsLearned: item.lessonsLearned || null,
				nextTimeChange: item.nextTimeChange || null,
			}));
		} catch (error) {
			console.error("[pipelineService.getItems] Error:", error);
			console.error("[pipelineService.getItems] userId was:", userId);
			throw error;
		}
	},

	getItemById: async (id: string) => {
		const item = await db.query.pipelineItems.findFirst({
			where: eq(pipelineItems.id, id),
			with: {
				resume: {
					columns: {
						id: true,
						title: true,
						type: true,
					},
				},
				steps: {
					orderBy: (steps, { asc }) => [asc(steps.date)],
				},
			},
		});
		return item;
	},

	updateItemStatus: async (
		id: string,
		stage: PipelineStatus,
		orderIndex?: number,
	) => {
		const updateData: { stage: PipelineStatus; orderIndex?: number } = {
			stage,
		};
		if (orderIndex !== undefined) {
			updateData.orderIndex = orderIndex;
		}

		const [updated] = await db
			.update(pipelineItems)
			.set(updateData)
			.where(eq(pipelineItems.id, id))
			.returning();
		return updated;
	},

	updateItem: async (
		_userId: string,
		itemId: string,
		data: PipelineItemData,
	) => {
		const [updated] = await db
			.update(pipelineItems)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(pipelineItems.id, itemId)) // userId check already done in action
			.returning();
		return updated;
	},

	deleteItem: async (_userId: string, itemId: string) => {
		const [deleted] = await db
			.delete(pipelineItems)
			.where(eq(pipelineItems.id, itemId)) // userId check already done in action
			.returning();
		return deleted;
	},

	addItem: async (
		userId: string,
		data: {
			company: string;
			position: string;
			stage: PipelineStatus;
			date: string;
			nextAction?: string | null;
			resumeId?: string | null; // SPEC 022: Document Integration
			// Phase 1: Intent & Context
			motivation?: string | null;
			interestLevel?: InterestLevel | null;
			confidenceLevel?: ConfidenceLevel | null;
			// Phase 1: Strategy Snapshot
			resumeVersionNote?: string | null;
			positioningStrategy?: string | null;
			emphasizedStrengths?: string[] | null;
			// Phase 1: Outcome Reflection
			outcomeReason?: string | null;
			lessonsLearned?: string | null;
			nextTimeChange?: string | null;
		},
	) => {
		const [created] = await db
			.insert(pipelineItems)
			.values({
				userId,
				...data,
			})
			.returning();
		return created;
	},

	getStages: async () => {
		const stages = await db
			.select()
			.from(pipelineStages)
			.where(eq(pipelineStages.isActive, true))
			.orderBy(asc(pipelineStages.orderIndex));
		return stages;
	},

	// =============================================
	// SPEC-027 Phase 1: Application Steps CRUD
	// =============================================

	getApplicationSteps: async (
		applicationId: string,
	): Promise<ApplicationStep[]> => {
		const steps = await db.query.applicationSteps.findMany({
			where: eq(applicationSteps.applicationId, applicationId),
			orderBy: (steps, { asc }) => [asc(steps.date)],
		});
		return steps.map((step) => ({
			id: step.id,
			applicationId: step.applicationId,
			stepType: step.stepType as StepType,
			date: step.date,
			summary: step.summary,
			selfEvaluation: step.selfEvaluation || null,
			createdAt: step.createdAt,
			updatedAt: step.updatedAt,
		}));
	},

	addApplicationStep: async (
		applicationId: string,
		data: {
			stepType: StepType;
			date: string;
			summary: string;
			selfEvaluation?: string | null;
		},
	) => {
		const [created] = await db
			.insert(applicationSteps)
			.values({
				applicationId,
				...data,
			})
			.returning();
		return created;
	},

	updateApplicationStep: async (
		stepId: string,
		data: {
			stepType?: StepType;
			date?: string;
			summary?: string;
			selfEvaluation?: string | null;
		},
	) => {
		const [updated] = await db
			.update(applicationSteps)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(applicationSteps.id, stepId))
			.returning();
		return updated;
	},

	deleteApplicationStep: async (stepId: string) => {
		const [deleted] = await db
			.delete(applicationSteps)
			.where(eq(applicationSteps.id, stepId))
			.returning();
		return deleted;
	},
};
