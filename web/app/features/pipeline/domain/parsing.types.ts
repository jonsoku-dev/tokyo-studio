import type { ParsingPluginId } from "../constants/parsing-plugins";

/**
 * Parsing Plugin Configuration
 */
export interface ParsingPluginConfig {
	id: ParsingPluginId;
	displayName: string;
	exampleUrl: string;
	pattern: RegExp;
	description: string;
}

/**
 * Request to parse a job posting from a URL
 */
export interface ParseJobRequest {
	url: string;
	parserId: ParsingPluginId;
	forceRefresh?: boolean;
}

/**
 * Response from job parsing
 */
export interface ParsedJobData {
	company: string;
	position: string;
	location: string;
	description?: string;
	logoUrl?: string | null;
}

/**
 * Available parsers response
 */
export interface AvailableParsersResponse {
	parsers: ParsingPluginConfig[];
}
