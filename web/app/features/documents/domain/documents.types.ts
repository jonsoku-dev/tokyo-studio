import { insertDocumentSchema, selectDocumentSchema } from "@itcom/db/schema";
import { z } from "zod";

export const DocumentSchema = selectDocumentSchema
	.pick({
		id: true,
		title: true,
		type: true,
		status: true,
		url: true,
		createdAt: true,
	})
	.extend({
		type: z.enum(["Resume", "CV", "Portfolio"]),
		status: z.enum(["draft", "final"]),
		url: z.string().url().nullable().optional(),
	});

export const CreateDocumentSchema = insertDocumentSchema
	.pick({
		title: true,
		type: true,
		url: true,
		userId: true,
	})
	.extend({
		type: z.enum(["Resume", "CV", "Portfolio"]),
		status: z.enum(["draft", "final"]).default("draft"),
	});

export type Document = z.infer<typeof DocumentSchema>;
export type CreateDocumentDTO = z.infer<typeof CreateDocumentSchema>;
