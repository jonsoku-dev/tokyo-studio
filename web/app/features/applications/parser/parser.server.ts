import { createHash } from "node:crypto";
import { db } from "@itcom/db/client";
import { jobPostingCache } from "@itcom/db/schema";
import * as cheerio from "cheerio";
import { eq } from "drizzle-orm";

export interface ParsedJob {
	company: string;
	position: string;
	location: string;
	description: string;
	logoUrl: string | null;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch HTML content from a URL with timeout
 */
async function fetchHtml(url: string): Promise<string> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

	try {
		const response = await fetch(url, {
			signal: controller.signal,
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
				Accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
				"Accept-Language": "en-US,en;q=0.9,ja;q=0.8,ko;q=0.7",
			},
		});

		if (!response.ok) {
			throw new Error(
				`Failed to fetch: ${response.status} ${response.statusText}`,
			);
		}

		return await response.text();
	} finally {
		clearTimeout(timeoutId);
	}
}

/**
 * Extract job metadata from HTML using OG tags and JSON-LD
 * Includes site-specific extractors for Japanese job sites
 */
function extractMetadata(html: string, url: string): ParsedJob {
	const $ = cheerio.load(html);
	const results: Partial<ParsedJob> = {
		company: "",
		position: "",
		location: "",
		description: "",
		logoUrl: null,
	};

	// --- Site-Specific Extractors for Japanese Sites ---
	const hostname = new URL(url).hostname;

	// Mynavi Tenshoku (tenshoku.mynavi.jp)
	if (hostname.includes("mynavi.jp")) {
		results.position =
			$(".jobTitle, h1.jobOfferTitle, .occName").first().text().trim() || "";
		results.company =
			$(".companyName, .corpName, .corp-name").first().text().trim() || "";
		results.location =
			$(".jobPlace, .workPlace, .location").first().text().trim() || "";
		results.description = $('meta[name="description"]').attr("content") || "";
	}

	// Rikunabi (job.rikunabi.com)
	if (hostname.includes("rikunabi.com")) {
		results.position =
			$(".jobTitle, h1.job-title, .rnn-heading-1").first().text().trim() || "";
		results.company =
			$(".companyName, .corp-name, .rnn-corpname").first().text().trim() || "";
		results.location =
			$(".workLocation, .location, .rnn-location").first().text().trim() || "";
		results.description = $('meta[name="description"]').attr("content") || "";
	}

	// --- 1. JSON-LD (Strict structured data) ---
	const jsonLdScripts = $('script[type="application/ld+json"]');
	jsonLdScripts.each((_, script) => {
		try {
			const data = JSON.parse($(script).text());
			const jobData = Array.isArray(data)
				? data.find((item) => item["@type"] === "JobPosting")
				: data["@type"] === "JobPosting"
					? data
					: null;

			if (jobData) {
				results.position = results.position || jobData.title;
				results.company =
					results.company ||
					(typeof jobData.hiringOrganization === "string"
						? jobData.hiringOrganization
						: jobData.hiringOrganization?.name);
				results.description = results.description || jobData.description;
				results.location =
					results.location ||
					(typeof jobData.jobLocation === "string"
						? jobData.jobLocation
						: jobData.jobLocation?.address?.addressLocality);
			}
		} catch (_e) {
			// Ignore JSON parse errors
		}
	});

	// --- 2. Open Graph Tags (Standard fallback) ---
	results.position =
		results.position ||
		$('meta[property="og:title"]').attr("content") ||
		$("title").text();
	results.description =
		results.description || $('meta[property="og:description"]').attr("content");
	results.logoUrl =
		results.logoUrl ||
		$('meta[property="og:image"]').attr("content") ||
		$('link[rel="apple-touch-icon"]').attr("href") ||
		$('link[rel="icon"]').attr("href");

	// --- 3. Clean up and Fallbacks ---
	// Site name fallback for company if position contains it
	const siteName = $('meta[property="og:site_name"]').attr("content");

	if (!results.company && siteName) {
		results.company = siteName;
	}

	// Clean up position (many sites include site name in title)
	if (results.position && siteName && results.position.includes(siteName)) {
		results.position = results.position
			.replace(siteName, "")
			.replace(/^[|\s-]+|[|\s-]+$/g, "");
	}

	// Final Fallbacks
	return {
		company: results.company?.trim() || "Unknown Company",
		position: results.position?.trim() || "Job Opportunity",
		description: results.description?.trim() || "",
		location: results.location?.trim() || "Remote / TBD",
		logoUrl: results.logoUrl || null,
	};
}

/**
 * Main Parser Service
 */
export const parserService = {
	async parse(url: string, forceRefresh = false): Promise<ParsedJob> {
		const urlHash = createHash("sha256").update(url).digest("hex");

		// 1. Check Cache
		if (!forceRefresh) {
			const cached = await db.query.jobPostingCache.findFirst({
				where: eq(jobPostingCache.url, url),
			});

			if (cached) {
				const isExpired =
					Date.now() - new Date(cached.updatedAt).getTime() > CACHE_TTL_MS;
				if (!isExpired) {
					return cached.data;
				}
			}
		}

		// 2. Fetch and Parse
		const html = await fetchHtml(url);
		const data = extractMetadata(html, url);

		// 3. Update Cache (Upsert)
		await db
			.insert(jobPostingCache)
			.values({
				url,
				urlHash,
				data,
				updatedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: jobPostingCache.url,
				set: {
					data,
					updatedAt: new Date(),
				},
			});

		return data;
	},
};
