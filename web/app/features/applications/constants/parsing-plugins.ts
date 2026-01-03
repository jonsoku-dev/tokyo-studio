/**
 * Parsing Plugins Configuration
 * Centralized constants for all supported job listing sites
 */

// Plugin IDs - used as unique identifiers across the system
const PARSER_IDS = {
	LINKEDIN: "linkedin",
	INDEED: "indeed",
	MYNAVI: "mynavi",
	RIKUNABI: "rikunabi",
	GREEN: "green",
	WANTEDLY: "wantedly",
} as const;

// Display names for UI
const PARSER_DISPLAY_NAMES = {
	[PARSER_IDS.LINKEDIN]: "LinkedIn",
	[PARSER_IDS.INDEED]: "Indeed",
	[PARSER_IDS.MYNAVI]: "マイナビ転職 (Mynavi)",
	[PARSER_IDS.RIKUNABI]: "リクナビ (Rikunabi)",
	[PARSER_IDS.GREEN]: "Green",
	[PARSER_IDS.WANTEDLY]: "Wantedly",
} as const;

// Example URLs for each platform
const PARSER_EXAMPLE_URLS = {
	[PARSER_IDS.LINKEDIN]: "https://www.linkedin.com/jobs/view/1234567890/",
	[PARSER_IDS.INDEED]: "https://jp.indeed.com/viewjob?jk=1234567890abcdef",
	[PARSER_IDS.MYNAVI]: "https://tenshoku.mynavi.jp/job/123456789/",
	[PARSER_IDS.RIKUNABI]: "https://job.rikunabi.com/2025/job1234567/",
	[PARSER_IDS.GREEN]: "https://www.green.jp/resume/offers/1234567",
	[PARSER_IDS.WANTEDLY]: "https://www.wantedly.com/projects/1234567",
} as const;

// URL patterns for validation
const PARSER_URL_PATTERNS = {
	[PARSER_IDS.LINKEDIN]: /linkedin\.com/,
	[PARSER_IDS.INDEED]: /indeed\.com/,
	[PARSER_IDS.MYNAVI]: /mynavi\.jp/,
	[PARSER_IDS.RIKUNABI]: /rikunabi\.com/,
	[PARSER_IDS.GREEN]: /green\.jp/,
	[PARSER_IDS.WANTEDLY]: /wantedly\.com/,
} as const;

// Descriptions for each parser
const PARSER_DESCRIPTIONS = {
	[PARSER_IDS.LINKEDIN]: "LinkedIn jobs portal",
	[PARSER_IDS.INDEED]: "Indeed job search",
	[PARSER_IDS.MYNAVI]: "Mynavi Japanese job site",
	[PARSER_IDS.RIKUNABI]: "Rikunabi Japanese job site",
	[PARSER_IDS.GREEN]: "Green Japanese IT job site",
	[PARSER_IDS.WANTEDLY]: "Wantedly Japanese job platform",
} as const;

// Ordered list of all supported parsers
const PARSER_LIST = [
	PARSER_IDS.LINKEDIN,
	PARSER_IDS.INDEED,
	PARSER_IDS.MYNAVI,
	PARSER_IDS.RIKUNABI,
	PARSER_IDS.GREEN,
	PARSER_IDS.WANTEDLY,
] as const;

// Type for parser ID
export type ParsingPluginId = (typeof PARSER_LIST)[number];

// Export configured plugins
export const PARSING_PLUGINS = {
	LIST: PARSER_LIST,
	IDS: PARSER_IDS,
	DISPLAY_NAMES: PARSER_DISPLAY_NAMES,
	EXAMPLE_URLS: PARSER_EXAMPLE_URLS,
	URL_PATTERNS: PARSER_URL_PATTERNS,
	DESCRIPTIONS: PARSER_DESCRIPTIONS,

	/**
	 * Get plugin configuration by ID
	 */
	getPlugin(id: ParsingPluginId) {
		return {
			id,
			displayName: PARSER_DISPLAY_NAMES[id],
			exampleUrl: PARSER_EXAMPLE_URLS[id],
			pattern: PARSER_URL_PATTERNS[id],
			description: PARSER_DESCRIPTIONS[id],
		};
	},

	/**
	 * Get all plugins as array of configurations
	 */
	getAllPlugins() {
		return PARSER_LIST.map((id) => this.getPlugin(id));
	},

	/**
	 * Validate URL against parser pattern
	 */
	validateUrl(url: string, parserId: ParsingPluginId): boolean {
		try {
			const pattern = PARSER_URL_PATTERNS[parserId];
			return pattern.test(url);
		} catch {
			return false;
		}
	},

	/**
	 * Find parser by URL
	 */
	findParserByUrl(url: string): ParsingPluginId | null {
		for (const id of PARSER_LIST) {
			if (this.validateUrl(url, id)) {
				return id;
			}
		}
		return null;
	},
} as const;
