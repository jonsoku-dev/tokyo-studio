/**
 * SPEC 022: Document Integration Constants
 * Shared constants for document integration across features
 */

/** Document types allowed for resume attachment in Pipeline */
export const RESUME_DOCUMENT_TYPES = ["Resume", "CV"] as const;

/** Document types allowed for portfolio in Profile */
export const PORTFOLIO_DOCUMENT_TYPES = ["Portfolio"] as const;

/** Document types allowed for mentoring session sharing */
export const SHAREABLE_DOCUMENT_TYPES = [
	"Resume",
	"CV",
	"Portfolio",
	"Cover Letter",
] as const;

/** Maximum documents that can be shared in a mentoring session */
export const MAX_SHARED_DOCUMENTS = 5;

/** Presigned URL expiration time in seconds */
export const SHARED_DOCUMENT_URL_EXPIRY = 3600; // 1 hour

/** Document status that indicates upload is complete */
export const UPLOADABLE_STATUSES = ["draft", "final", "uploaded"] as const;

/** Document statuses to exclude from selection (still uploading) */
export const EXCLUDED_STATUSES = ["pending"] as const;

export type ResumeDocumentType = (typeof RESUME_DOCUMENT_TYPES)[number];
export type PortfolioDocumentType = (typeof PORTFOLIO_DOCUMENT_TYPES)[number];
export type ShareableDocumentType = (typeof SHAREABLE_DOCUMENT_TYPES)[number];
