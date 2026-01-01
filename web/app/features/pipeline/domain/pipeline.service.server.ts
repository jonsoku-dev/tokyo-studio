import { db } from "@itcom/db/client";
import { pipelineItems, pipelineStages } from "@itcom/db/schema";
import { asc, eq } from "drizzle-orm";
import type { PipelineItem, PipelineStatus } from "./pipeline.types";

export const pipelineService = {
	getItems: async (userId: string): Promise<PipelineItem[]> => {
		const itemsWithRelations = await db.query.pipelineItems.findMany({
			where: eq(pipelineItems.userId, userId),
			with: {
				resume: {
					columns: {
						id: true,
						title: true,
						type: true,
					},
				},
			},
			orderBy: (items, { asc }) => [asc(items.orderIndex)],
		});

		return itemsWithRelations.map((item) => ({
			id: item.id,
			company: item.company,
			position: item.position,
			stage: item.stage as PipelineStatus,
			date: item.date,
			nextAction: item.nextAction || null,
			resumeId: item.resumeId || null,
			resume: item.resume || null, // SPEC 022
			userId: item.userId,
		}));
	},

	getItemById: async (id: string) => {
		const [item] = await db
			.select()
			.from(pipelineItems)
			.where(eq(pipelineItems.id, id))
			.limit(1);
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
		data: {
			company?: string;
			position?: string;
			stage?: PipelineStatus;
			date?: string;
			nextAction?: string;
			resumeId?: string | null; // SPEC 022: Document Integration
		},
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
};
