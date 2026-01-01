import { db } from "@itcom/db/client";
import { documents, documentVersions } from "@itcom/db/schema";
import { withTransaction } from "@itcom/db/transaction";
import { and, desc, eq, ilike } from "drizzle-orm";
import { DocumentInvalidInputError, DocumentNotFoundError } from "../errors";
import type { InsertDocumentVersion } from "./types";

class DocumentsService {
	// Create Document
	async createDocument(data: typeof documents.$inferInsert) {
		try {
			const [doc] = await db.insert(documents).values(data).returning();
			console.log("[DocumentsService] Document created:", {
				documentId: doc.id,
				userId: doc.userId,
				title: doc.title,
			});
			return doc;
		} catch (error) {
			console.error("[DocumentsService] Create failed:", {
				data,
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	/**
	 * Get user's documents filtered by type
	 * Used for: Pipeline (Resume/CV), Mentoring (all), Profile (Portfolio)
	 */
	async getUserDocumentsByType(
		userId: string,
		types: string[],
		options?: { onlyFinal?: boolean },
	) {
		const results = await db.query.documents.findMany({
			where: eq(documents.userId, userId),
			orderBy: [desc(documents.uploadedAt), desc(documents.createdAt)],
		});

		// Filter in application code for simplicity
		return results.filter(
			(doc) =>
				types.includes(doc.type) &&
				doc.status !== "pending" && // Exclude pending uploads
				(!options?.onlyFinal || doc.status === "final"),
		);
	}

	// Search and Filter Documents
	async searchDocuments(
		userId: string,
		params: {
			query?: string;
			type?: string; // Resume | CV | Portfolio | Cover Letter
			status?: string; // draft | final
			limit?: number;
			offset?: number;
		},
	) {
		try {
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

			const whereClause = and(...filters);

			// Get total count BEFORE applying pagination
			const countResult = await db
				.select({ count: documents.id })
				.from(documents)
				.where(whereClause);
			const totalCount = countResult.length;

			// Get paginated results
			const results = await db.query.documents.findMany({
				where: whereClause,
				// Order by upload date (newest first), fallback to creation date for pending uploads
				orderBy: [desc(documents.uploadedAt), desc(documents.createdAt)],
				limit: params.limit,
				offset: params.offset,
			});

			console.log(
				`[DocumentsService] Found ${results.length} of ${totalCount} documents for user ${userId}`,
			);
			return { documents: results, totalCount };
		} catch (error) {
			console.error("[DocumentsService] Search failed:", {
				userId,
				params,
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	// Update Document (Rename, Change Status)
	async updateDocument(
		userId: string,
		documentId: string,
		data: { title?: string; status?: string },
	) {
		try {
			// Validate input
			if (!data.title && !data.status) {
				throw new DocumentInvalidInputError(
					"update data",
					"At least one field (title or status) must be provided",
					{ userId, documentId, data },
				);
			}

			if (data.title !== undefined && data.title.trim().length === 0) {
				throw new DocumentInvalidInputError("title", "Title cannot be empty", {
					userId,
					documentId,
				});
			}

			// Verify ownership
			const existing = await db.query.documents.findFirst({
				where: and(eq(documents.id, documentId), eq(documents.userId, userId)),
			});

			if (!existing) {
				console.warn(`[DocumentsService] Document not found or unauthorized:`, {
					userId,
					documentId,
				});
				throw new DocumentNotFoundError(
					documentId,
					"Document not found or you don't have permission to access it",
				);
			}

			// Use transaction to ensure atomicity of update + version log
			return await withTransaction(async (tx) => {
				const updates: Partial<typeof documents.$inferInsert> = {
					updatedAt: new Date(),
				};

				const versionsToLog: InsertDocumentVersion[] = [];

				if (data.title && data.title !== existing.title) {
					updates.title = data.title;
					versionsToLog.push({
						documentId,
						changeType: "rename",
						oldValue: existing.title,
						newValue: data.title,
					});
					console.log(`[DocumentsService] Document renamed:`, {
						documentId,
						oldTitle: existing.title,
						newTitle: data.title,
					});
				}

				if (data.status && data.status !== existing.status) {
					updates.status = data.status;
					versionsToLog.push({
						documentId,
						changeType: "status_change",
						oldValue: existing.status,
						newValue: data.status,
					});
					console.log(`[DocumentsService] Document status changed:`, {
						documentId,
						oldStatus: existing.status,
						newStatus: data.status,
					});
				}

				// Update document if there are changes
				if (Object.keys(updates).length > 1) {
					await tx
						.update(documents)
						.set(updates)
						.where(eq(documents.id, documentId));
				}

				// Log all version changes in the same transaction
				if (versionsToLog.length > 0) {
					await tx.insert(documentVersions).values(versionsToLog);
				}

				return { success: true };
			});
		} catch (error) {
			// Re-throw typed errors
			if (
				error instanceof DocumentNotFoundError ||
				error instanceof DocumentInvalidInputError
			) {
				throw error;
			}

			// Log unexpected errors
			console.error("[DocumentsService] Update failed:", {
				userId,
				documentId,
				data,
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	// Log Version History
	async logVersion(data: InsertDocumentVersion) {
		try {
			await db.insert(documentVersions).values(data);
		} catch (error) {
			console.error("[DocumentsService] Failed to log version:", {
				data,
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	// Get Version History
	async getVersions(documentId: string) {
		try {
			const versions = await db.query.documentVersions.findMany({
				where: eq(documentVersions.documentId, documentId),
				orderBy: [desc(documentVersions.createdAt)],
			});

			console.log(
				`[DocumentsService] Retrieved ${versions.length} versions for document ${documentId}`,
			);
			return versions;
		} catch (error) {
			console.error("[DocumentsService] Failed to get versions:", {
				documentId,
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}
}

export const documentsService = new DocumentsService();
