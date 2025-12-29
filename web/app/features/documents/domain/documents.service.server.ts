import { db } from "@itcom/db/client";
import { documents } from "@itcom/db/schema";
import type { CreateDocumentDTO, Document } from "./documents.types";

export const documentService = {
	getDocuments: async (): Promise<Document[]> => {
		const docs = await db.select().from(documents);
		return docs.map((doc) => ({
			id: doc.id,
			title: doc.title,
			type: doc.type as "Resume" | "CV" | "Portfolio",
			status: doc.status as "draft" | "final",
			url: doc.url || null,
			createdAt: doc.createdAt,
		}));
	},

	createDocument: async (data: CreateDocumentDTO) => {
		const [doc] = await db.insert(documents).values(data).returning();
		return doc;
	},
};
