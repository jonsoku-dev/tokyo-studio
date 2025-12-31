/**
 * SPEC 021: Sitemap Generator Script (FR-011-016)
 *
 * Run with: npx tsx scripts/generate-sitemap.ts
 *
 * Generates sitemap.xml with:
 * - Static pages (homepage, about, etc.)
 * - Mentor profiles
 * - Community posts
 * - Job listings
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

// Configuration
const SITE_URL = process.env.SITE_URL || "https://japanit.job";
const OUTPUT_PATH = join(process.cwd(), "public", "sitemap.xml");

interface SitemapUrl {
	loc: string;
	lastmod?: string;
	changefreq?:
		| "always"
		| "hourly"
		| "daily"
		| "weekly"
		| "monthly"
		| "yearly"
		| "never";
	priority?: number;
}

// Static pages
const staticPages: SitemapUrl[] = [
	{ loc: "/", priority: 1.0, changefreq: "daily" },
	{ loc: "/mentors", priority: 0.9, changefreq: "daily" },
	{ loc: "/community", priority: 0.8, changefreq: "daily" },
	{ loc: "/roadmap", priority: 0.7, changefreq: "weekly" },
	{ loc: "/settlement", priority: 0.7, changefreq: "weekly" },
];

function generateSitemapXml(urls: SitemapUrl[]): string {
	const urlEntries = urls
		.map((url) => {
			const loc = `<loc>${SITE_URL}${url.loc}</loc>`;
			const lastmod = url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : "";
			const changefreq = url.changefreq
				? `<changefreq>${url.changefreq}</changefreq>`
				: "";
			const priority =
				url.priority !== undefined
					? `<priority>${url.priority.toFixed(1)}</priority>`
					: "";

			return `  <url>
    ${loc}
    ${lastmod}
    ${changefreq}
    ${priority}
  </url>`;
		})
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

async function main() {
	console.log("📍 Generating sitemap.xml...");

	// For now, use static pages only
	// TODO: Fetch dynamic pages from database when connected
	const allUrls: SitemapUrl[] = [
		...staticPages,
		// Dynamic pages would be added here:
		// ...mentorProfiles.map(m => ({ loc: `/mentors/${m.id}`, priority: 0.8 })),
		// ...communityPosts.map(p => ({ loc: `/community/${p.id}`, priority: 0.6 })),
	];

	const xml = generateSitemapXml(allUrls);
	writeFileSync(OUTPUT_PATH, xml, "utf-8");

	console.log(`✅ Sitemap generated: ${OUTPUT_PATH}`);
	console.log(`   Total URLs: ${allUrls.length}`);
}

main().catch(console.error);
