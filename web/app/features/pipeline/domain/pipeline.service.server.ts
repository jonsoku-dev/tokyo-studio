import { db } from "@itcom/db/client";
import { pipelineItems } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
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
		}));
	},

	updateItemStatus: async (id: string, stage: PipelineStatus) => {
		const [updated] = await db
			.update(pipelineItems)
			.set({ stage })
			.where(eq(pipelineItems.id, id))
			.returning();
		return updated;
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
};
