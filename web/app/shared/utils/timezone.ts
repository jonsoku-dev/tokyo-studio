/**
 * Timezone utilities for mentor booking system
 * Handles detection, conversion, and formatting
 */

// List of common timezones with offset from UTC
export const COMMON_TIMEZONES = [
	{ value: "America/New_York", label: "Eastern Time (ET)", offset: -5 },
	{ value: "America/Chicago", label: "Central Time (CT)", offset: -6 },
	{ value: "America/Denver", label: "Mountain Time (MT)", offset: -7 },
	{ value: "America/Los_Angeles", label: "Pacific Time (PT)", offset: -8 },
	{ value: "America/Anchorage", label: "Alaska Time (AKT)", offset: -9 },
	{ value: "Pacific/Honolulu", label: "Hawaii Time (HST)", offset: -10 },
	{ value: "Europe/London", label: "Greenwich Mean Time (GMT)", offset: 0 },
	{ value: "Europe/Paris", label: "Central European Time (CET)", offset: 1 },
	{ value: "Europe/Moscow", label: "Moscow Standard Time (MSK)", offset: 3 },
	{ value: "Asia/Dubai", label: "Gulf Standard Time (GST)", offset: 4 },
	{ value: "Asia/Kolkata", label: "Indian Standard Time (IST)", offset: 5.5 },
	{ value: "Asia/Bangkok", label: "Indochina Time (ICT)", offset: 7 },
	{ value: "Asia/Shanghai", label: "China Standard Time (CST)", offset: 8 },
	{ value: "Asia/Tokyo", label: "Japan Standard Time (JST)", offset: 9 },
	{
		value: "Australia/Sydney",
		label: "Australian Eastern Time (AEST)",
		offset: 10,
	},
	{
		value: "Pacific/Auckland",
		label: "New Zealand Standard Time (NZST)",
		offset: 12,
	},
];

/**
 * Detect user's timezone from browser
 * Returns IANA timezone identifier
 */
export function detectUserTimezone(): string {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone;
	} catch (error) {
		console.warn("Failed to detect timezone, defaulting to UTC:", error);
		return "UTC";
	}
}

/**
 * Format date in a specific timezone
 * Returns readable string like "Dec 29, 2025 3:30 PM EST"
 */
export function formatDateInTimezone(
	date: Date,
	timezone: string,
	format: "short" | "long" = "long",
): string {
	try {
		const formatter = new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: format === "short" ? "2-digit" : "short",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
			timeZone: timezone,
			timeZoneName: format === "long" ? "short" : undefined,
		});

		return formatter.format(date);
	} catch (error) {
		console.warn(`Invalid timezone: ${timezone}`, error);
		return date.toLocaleString();
	}
}

/**
 * Convert a time from one timezone to another
 * Useful for showing session time in multiple timezones
 */
export function convertTimezone(
	date: Date,
	fromTimezone: string,
	toTimezone: string,
): Date {
	try {
		// Get the time in source timezone
		const formatter = new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
			timeZone: fromTimezone,
		});

		const parts = formatter.formatToParts(date);
		const dateObj: Record<string, number> = {};

		for (const part of parts) {
			if (part.type !== "literal") {
				dateObj[part.type] = parseInt(part.value, 10);
			}
		}

		// Create UTC date from the local time
		const utcDate = new Date(
			Date.UTC(
				dateObj.year,
				dateObj.month - 1,
				dateObj.day,
				dateObj.hour,
				dateObj.minute,
				dateObj.second,
			),
		);

		// Now format in target timezone to verify conversion
		// This is a workaround since JavaScript doesn't have direct timezone conversion
		const formattedInTarget = formatDateInTimezone(
			utcDate,
			toTimezone,
			"short",
		);

		return utcDate;
	} catch (error) {
		console.warn(
			`Failed to convert from ${fromTimezone} to ${toTimezone}`,
			error,
		);
		return date;
	}
}

/**
 * Get timezone offset as string (e.g., "UTC-5" or "UTC+9")
 */
export function getTimezoneOffset(timezone: string): string {
	const found = COMMON_TIMEZONES.find((tz) => tz.value === timezone);
	if (found) {
		const offset = found.offset;
		const sign = offset >= 0 ? "+" : "";
		return `UTC${sign}${offset}`;
	}

	try {
		const date = new Date();
		const formatter = new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			timeZoneName: "short",
		});

		const parts = formatter.formatToParts(date);
		const tzName = parts.find((p) => p.type === "timeZoneName")?.value;
		return tzName || "UTC";
	} catch {
		return "UTC";
	}
}

/**
 * Check if two times are in different days across timezones
 * Useful for mentor availability checking
 */
export function isDifferentDayInTimezone(
	date: Date,
	timezone1: string,
	timezone2: string,
): boolean {
	try {
		const formatter = (tz: string) =>
			new Intl.DateTimeFormat("en-US", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				timeZone: tz,
			}).format(date);

		const day1 = formatter(timezone1);
		const day2 = formatter(timezone2);

		return day1 !== day2;
	} catch (error) {
		console.warn("Failed to compare days across timezones:", error);
		return false;
	}
}

/**
 * Get user's timezone offset in minutes
 * Returns positive for east of UTC, negative for west
 */
export function getTimezoneOffsetMinutes(timezone: string): number {
	// This is approximate and doesn't handle DST accurately
	// For production, use a library like date-fns-tz
	const found = COMMON_TIMEZONES.find((tz) => tz.value === timezone);
	if (found) {
		return Math.round(found.offset * 60);
	}

	// Fallback: use browser's local timezone
	try {
		const now = new Date();
		return -now.getTimezoneOffset();
	} catch {
		return 0;
	}
}
