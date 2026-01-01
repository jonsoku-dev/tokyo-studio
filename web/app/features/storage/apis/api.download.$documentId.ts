import { db } from "@itcom/db/client";
import { documents, mentoringSessions, profiles } from "@itcom/db/schema";
import { and, eq, or, sql } from "drizzle-orm";
import { type LoaderFunctionArgs, redirect } from "react-router";
import { getUserFromRequest } from "~/features/auth/services/require-verified-email.server";
import { generateDownloadPresignedUrl } from "~/features/storage/services/presigned-urls.server";
import {
	BadRequestError,
	loaderHandler,
	NotFoundError,
	UnauthorizedError,
} from "~/shared/lib";

/**
 * SPEC 006: S3 Document Download API
 *
 * Generates presigned download URL for a document
 * Increments download counter
 */
export const loader = loaderHandler(
	async ({ request, params }: LoaderFunctionArgs) => {
		const { documentId } = params;

		if (!documentId) {
			throw new BadRequestError("Document ID required");
		}

		// 1. Authenticate user
		const user = await getUserFromRequest(request);
		if (!user) {
			throw new UnauthorizedError();
		}

		// 3. Verify document ownership OR access rights
		// Original check: owner only
		// const [document] = await db.select()... where(owner verify)

		// Updated check:
		// 1. Owner
		// 2. Public Portfolio
		// 3. Shared in Mentoring Session (for involved mentor/mentee)

		const [document] = await db
			.select()
			.from(documents)
			.where(eq(documents.id, documentId))
			.limit(1);

		if (!document) {
			throw new NotFoundError("Document not found");
		}

		let hasAccess = false;

		// Check 1: Owner
		if (document.userId === user.id) {
			hasAccess = true;
		}

		// Check 2: Public Portfolio (if not owner)
		if (!hasAccess) {
			const [portfolio] = await db
				.select()
				.from(profiles)
				.where(eq(profiles.portfolioDocumentId, documentId))
				.limit(1);

			if (portfolio) {
				hasAccess = true;
			}
		}

		// Check 3: Shared in Mentoring Session (if not owner/portfolio)
		// This is expensive check.
		// Check if this doc is in any session where current user is mentor OR mentee.
		if (!hasAccess) {
			// Find sessions where (mentor=user OR mentee=user) AND sharedDocumentIds contains documentId
			// Drizzle array contains check
			// We need sql check for jsonb array contains

			const [session] = await db
				.select({ id: mentoringSessions.id })
				.from(mentoringSessions)
				.where(
					and(
						sql`${mentoringSessions.sharedDocumentIds}::jsonb @> ${JSON.stringify([documentId])}::jsonb`,
						or(
							eq(mentoringSessions.mentorId, user.id),
							eq(mentoringSessions.userId, user.id),
						),
					),
				)
				.limit(1);

			if (session) {
				hasAccess = true;
			}
		}

		if (!hasAccess) {
			throw new UnauthorizedError("Access denied");
		}

		// 3. Verify document has S3 key
		if (!document.s3Key) {
			throw new BadRequestError("Document has no S3 key");
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
			// apiHandler will pass this redirect response through
			return redirect(downloadUrl);
		}

		// Return JSON with URL
		return {
			success: true,
			downloadUrl,
			expiresIn,
			filename: document.originalName || document.title,
			size: document.size,
			mimeType: document.mimeType,
		};
	},
);
