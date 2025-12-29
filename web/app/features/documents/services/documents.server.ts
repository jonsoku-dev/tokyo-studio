import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "@itcom/db/client";
import { documents, documentVersions } from "@itcom/db/schema";
import type { InsertDocumentVersion } from "./types";

class DocumentsService {
	// Search and Filter Documents
	async searchDocuments(
		userId: string,
		params: {
			query?: string;
			type?: string; // Resume | CV | Portfolio | Cover Letter
			status?: string; // draft | final
		},
	) {
		const filters = [eq(documents.userId, userId)];

		if (params.query) {
			filters.push(ilike(documents.title, `%${params.query}%`));
		}

		if (params.type && params.type !== "All") {
			filters.push(eq(documents.type, params.type));
		}

		if (params.status && params.status !== "All") {
			filters.push(eq(documents.status, params.status));
		}

		return db.query.documents.findMany({
			where: and(...filters),
			// Order by upload date (newest first), fallback to creation date for pending uploads
			orderBy: [desc(documents.uploadedAt), desc(documents.createdAt)],
		});
	}

	// Update Document (Rename, Change Status)
	async updateDocument(
		userId: string,
		documentId: string,
		data: { title?: string; status?: string },
	) {
		// Verify ownership
		const existing = await db.query.documents.findFirst({
			where: and(eq(documents.id, documentId), eq(documents.userId, userId)),
		});

		if (!existing) {
			throw new Error("Document not found or unauthorized");
		}

		const updates: Partial<typeof documents.$inferInsert> = {
			updatedAt: new Date(),
		};
		const versionLog: Partial<typeof documentVersions.$inferInsert> = {
			documentId,
		};

		if (data.title && data.title !== existing.title) {
			updates.title = data.title;
			versionLog.changeType = "rename";
			versionLog.oldValue = existing.title;
			versionLog.newValue = data.title;
			await this.logVersion(versionLog as InsertDocumentVersion);
		}

		if (data.status && data.status !== existing.status) {
			updates.status = data.status;
			versionLog.changeType = "status_change";
			versionLog.oldValue = existing.status;
			versionLog.newValue = data.status;
			await this.logVersion(versionLog as InsertDocumentVersion);
		}

		if (Object.keys(updates).length > 1) {
			await db
				.update(documents)
				.set(updates)
				.where(eq(documents.id, documentId));
		}

		return { success: true };
	}

	// Log Version History
	async logVersion(data: InsertDocumentVersion) {
		await db.insert(documentVersions).values(data);
	}

	// Get Version History
	async getVersions(documentId: string) {
		return db.query.documentVersions.findMany({
			where: eq(documentVersions.documentId, documentId),
			orderBy: [desc(documentVersions.createdAt)],
		});
	}
}

export const documentsService = new DocumentsService();
