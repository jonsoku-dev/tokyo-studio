import { db } from "@itcom/db/client";
import { pipelineItems, pipelineStages } from "@itcom/db/schema";
import { asc, eq } from "drizzle-orm";
import type { PipelineItem, PipelineStatus } from "./pipeline.types";

export const pipelineService = {
	getItems: async (userId: string): Promise<PipelineItem[]> => {
		const items = await db
			.select()
			.from(pipelineItems)
			.where(eq(pipelineItems.userId, userId));
		return items.map((item) => ({
			id: item.id,
			company: item.company,
			position: item.position,
			stage: item.stage as PipelineStatus,
			date: item.date,
			nextAction: item.nextAction || null,
			userId: item.userId, // Add userId to return type if needed, or just specific internal method
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
