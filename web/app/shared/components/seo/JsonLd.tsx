/**
 * SPEC 021: JSON-LD Structured Data Components
 *
 * Provides schema.org structured data for SEO:
 * - Person schema for mentor profiles (FR-027)
 * - JobPosting schema for job listings (FR-029)
 * - Review schema for reviews (FR-030)
 */

export interface PersonSchemaProps {
	name: string;
	jobTitle?: string;
	description?: string;
	image?: string;
	url: string;
	aggregateRating?: {
		ratingValue: number;
		reviewCount: number;
	};
}

export interface JobPostingSchemaProps {
	title: string;
	description: string;
	company: string;
	location: string;
	datePosted: string;
	employmentType?: string;
	url: string;
}

/**
 * Generates Person JSON-LD for mentor profiles (FR-027, FR-028)
 */
export function PersonSchema({
	name,
	jobTitle,
	description,
	image,
	url,
	aggregateRating,
}: PersonSchemaProps) {
	const schema: Record<string, unknown> = {
		"@context": "https://schema.org",
		"@type": "Person",
		name,
		url,
	};

	if (jobTitle) schema.jobTitle = jobTitle;
	if (description) schema.description = description;
	if (image) schema.image = image;

	// FR-028: Include aggregateRating if reviews exist
	if (aggregateRating && aggregateRating.reviewCount > 0) {
		schema.aggregateRating = {
			"@type": "AggregateRating",
			ratingValue: aggregateRating.ratingValue.toFixed(1),
			bestRating: "5",
			worstRating: "1",
			reviewCount: aggregateRating.reviewCount,
		};
	}

	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires innerHTML
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
		/>
	);
}

/**
 * Generates JobPosting JSON-LD for job listings (FR-029)
 */
export function JobPostingSchema({
	title,
	description,
	company,
	location,
	datePosted,
	employmentType = "FULL_TIME",
	url,
}: JobPostingSchemaProps) {
	const schema = {
		"@context": "https://schema.org",
		"@type": "JobPosting",
		title,
		description,
		datePosted,
		employmentType,
		hiringOrganization: {
			"@type": "Organization",
			name: company,
		},
		jobLocation: {
			"@type": "Place",
			address: {
				"@type": "PostalAddress",
				addressLocality: location,
				addressCountry: "JP",
			},
		},
		url,
	};

	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires innerHTML
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
		/>
	);
}

/**
 * Generates Review JSON-LD for individual reviews (FR-030)
 */
export function ReviewSchema({
	authorName,
	ratingValue,
	reviewBody,
	datePublished,
	itemName,
}: {
	authorName: string;
	ratingValue: number;
	reviewBody?: string;
	datePublished: string;
	itemName: string;
}) {
	const schema = {
		"@context": "https://schema.org",
		"@type": "Review",
		author: {
			"@type": "Person",
			name: authorName,
		},
		reviewRating: {
			"@type": "Rating",
			ratingValue,
			bestRating: 5,
			worstRating: 1,
		},
		reviewBody: reviewBody || undefined,
		datePublished,
		itemReviewed: {
			"@type": "Person",
			name: itemName,
		},
	};

	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires innerHTML
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
		/>
	);
}
