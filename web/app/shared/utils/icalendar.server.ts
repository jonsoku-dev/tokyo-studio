import { v4 as uuidv4 } from "uuid";

/**
 * iCalendar (RFC 5545) generator for mentoring sessions
 * Creates .ics files that work with Google Calendar, Outlook, Apple Calendar
 */

interface ICalendarEvent {
	title: string;
	description: string;
	startDate: Date;
	endDate: Date;
	location: string; // Usually the video meeting URL
	organizerName: string;
	organizerEmail: string;
	attendeeName: string;
	attendeeEmail: string;
	timezone?: string; // IANA timezone identifier
}

/**
 * Format date for iCalendar (RFC 5545 format)
 * UTC format: 20251229T150000Z
 * Local format: 20251229T150000
 */
function formatICalDate(date: Date, useUTC = true): string {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	const hours = String(date.getUTCHours()).padStart(2, "0");
	const minutes = String(date.getUTCMinutes()).padStart(2, "0");
	const seconds = String(date.getUTCSeconds()).padStart(2, "0");

	if (useUTC) {
		return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
	}

	return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Escape special characters in iCalendar values
 */
function escapeICalValue(value: string): string {
	return value
		.replace(/\\/g, "\\\\")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,")
		.replace(/\n/g, "\\n");
}

/**
 * Generate VTIMEZONE component for timezone data
 */
function generateVTimezone(timezone: string): string {
	// Simplified VTIMEZONE for common timezones
	// For production, use a library like tz-converter

	if (timezone === "UTC") {
		return "";
	}

	return `BEGIN:VTIMEZONE
TZID:${timezone}
BEGIN:STANDARD
DTSTART:19700101T000000
TZOFFSETFROM:+0000
TZOFFSETTO:+0000
END:STANDARD
END:VTIMEZONE
`;
}

/**
 * Generate complete iCalendar file content
 */
export function generateICalendar(event: ICalendarEvent): string {
	const eventUUID = uuidv4();
	const now = new Date();
	const startDate = formatICalDate(event.startDate);
	const endDate = formatICalDate(event.endDate);
	const createdDate = formatICalDate(now);

	const vTimezone = event.timezone ? generateVTimezone(event.timezone) : "";

	const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//IT-Community//Mentoring System//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
X-LIC-LOCATION:${event.timezone || "UTC"}
${vTimezone}
BEGIN:VEVENT
UID:${eventUUID}@itcom.com
DTSTAMP:${createdDate}
DTSTART${event.timezone ? `;TZID=${event.timezone}` : ""}:${startDate}
DTEND${event.timezone ? `;TZID=${event.timezone}` : ""}:${endDate}
SUMMARY:Mentoring Session - ${escapeICalValue(event.title)}
DESCRIPTION:${escapeICalValue(event.description)}
LOCATION:${escapeICalValue(event.location)}
ORGANIZER;CN=${escapeICalValue(event.organizerName)}:mailto:${event.organizerEmail}
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${escapeICalValue(
		event.attendeeName,
	)}:mailto:${event.attendeeEmail}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

	return ics;
}

/**
 * Generate iCalendar filename
 */
export function generateICalendarFilename(sessionId: string): string {
	return `mentoring-session-${sessionId}.ics`;
}

/**
 * Create response headers for iCalendar download
 */
export function getICalendarHeaders(filename: string): HeadersInit {
	return {
		"Content-Type": "text/calendar;charset=utf-8",
		"Content-Disposition": `attachment;filename="${filename}"`,
		"Cache-Control": "no-cache",
	};
}

/**
 * Add iCalendar attachment to email
 */
export interface ICalendarAttachment {
	filename: string;
	content: string;
	contentType: string;
}

export function createICalendarAttachment(
	event: ICalendarEvent,
	sessionId: string,
): ICalendarAttachment {
	return {
		filename: generateICalendarFilename(sessionId),
		content: generateICalendar(event),
		contentType: "text/calendar",
	};
}
