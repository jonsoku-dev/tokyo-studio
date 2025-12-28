import { eq } from "drizzle-orm";
import { db } from "~/shared/db/client.server";
import { pipelineItems } from "~/shared/db/schema";
import type { PipelineItem, PipelineStatus } from "./pipeline.types";

export const pipelineService = {
	getItems: async (): Promise<PipelineItem[]> => {
		const items = await db.select().from(pipelineItems);
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
};
