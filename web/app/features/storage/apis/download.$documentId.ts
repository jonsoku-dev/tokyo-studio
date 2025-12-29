import { and, eq } from "drizzle-orm";
import type { LoaderFunctionArgs } from "react-router";
import { data, redirect } from "react-router";
import { getUserFromRequest } from "~/features/auth/services/require-verified-email.server";
import { generateDownloadPresignedUrl } from "~/features/storage/services/presigned-urls.server";
import { db } from "@itcom/db/client";
import { documents } from "@itcom/db/schema";

/**
 * SPEC 006: S3 Document Download API
 *
 * Generates presigned download URL for a document
 * Increments download counter
 *
 * Security:
 * - Verifies user owns the document
 * - Prevents downloading other users' documents
 * - Returns temporary presigned URL (expires in 1 hour)
 */

export async function loader({ request, params }: LoaderFunctionArgs) {
	try {
		const { documentId } = params;

		if (!documentId) {
			return data({ error: "Document ID required" }, { status: 400 });
		}

		// 1. Authenticate user
		const user = await getUserFromRequest(request);
		if (!user) {
			return data({ error: "Unauthorized" }, { status: 401 });
		}

		// 2. Find and verify document ownership
		const [document] = await db
			.select()
			.from(documents)
			.where(and(eq(documents.id, documentId), eq(documents.userId, user.id)))
			.limit(1);

		if (!document) {
			return data(
				{ error: "Document not found or access denied" },
				{ status: 404 },
			);
		}

		// 3. Verify document has S3 key
		if (!document.s3Key) {
			return data(
				{ error: "Document has no S3 key (legacy local file?)" },
				{ status: 400 },
			);
		}

		// 4. Generate presigned download URL
		const { downloadUrl, expiresIn } = await generateDownloadPresignedUrl(
			document.s3Key,
			document.originalName || document.title,
		);

		// 5. Increment download count
		const currentCount = Number.parseInt(document.downloadCount || "0", 10);
		await db
			.update(documents)
			.set({
				downloadCount: (currentCount + 1).toString(),
				updatedAt: new Date(),
			})
			.where(eq(documents.id, documentId));

		// 6. Return presigned URL (or redirect directly)
		const url = new URL(request.url);
		const shouldRedirect = url.searchParams.get("redirect") === "true";

		if (shouldRedirect) {
			// Direct redirect to S3
			throw redirect(downloadUrl);
		}

		// Return JSON with URL
		return data({
			success: true,
			downloadUrl,
			expiresIn,
			filename: document.originalName || document.title,
			size: document.size,
			mimeType: document.mimeType,
		});
	} catch (error) {
		// Check if error is a redirect (don't catch redirects)
		if (error instanceof Response) {
			throw error;
		}

		console.error("[DOWNLOAD ERROR]", error);
		return data(
			{
				success: false,
				error: "Failed to generate download URL. Please try again.",
			},
			{ status: 500 },
		);
	}
}
