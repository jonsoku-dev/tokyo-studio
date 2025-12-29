// biome-ignore lint/style/useImportType: Need values for typeof
import { documents, documentVersions } from "@itcom/db/schema";

export type InsertDocumentVersion = typeof documentVersions.$inferInsert;
export type SelectDocumentVersion = typeof documentVersions.$inferSelect;
export type SelectDocument = typeof documents.$inferSelect;
