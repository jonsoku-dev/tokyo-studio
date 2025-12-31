/**
 * SPEC 012: iCalendar (.ics) Generator (P3)
 *
 * Generates .ics files for calendar invites.
 * 직관적인 API: generateICS(event) => string
 */

interface CalendarEvent {
	title: string;
	start: Date;
	durationMinutes: number;
	location?: string;
	description?: string;
	organizerEmail?: string;
	attendeeEmail?: string;
}

/**
 * Generates iCalendar (.ics) content
 */
export function generateICS(event: CalendarEvent): string {
	const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@itcom.com`;
	const now = formatICalDate(new Date());
	const start = formatICalDate(event.start);
	const end = formatICalDate(
		new Date(event.start.getTime() + event.durationMinutes * 60000),
	);

	const lines = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//ITCOM//Mentoring//EN",
		"CALSCALE:GREGORIAN",
		"METHOD:REQUEST",
		"BEGIN:VEVENT",
		`UID:${uid}`,
		`DTSTAMP:${now}`,
		`DTSTART:${start}`,
		`DTEND:${end}`,
		`SUMMARY:${escapeICalText(event.title)}`,
	];

	if (event.description) {
		lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
	}

	if (event.location) {
		lines.push(`LOCATION:${escapeICalText(event.location)}`);
	}

	if (event.organizerEmail) {
		lines.push(`ORGANIZER;CN=ITCOM:mailto:${event.organizerEmail}`);
	}

	if (event.attendeeEmail) {
		lines.push(`ATTENDEE;CN=Attendee:mailto:${event.attendeeEmail}`);
	}

	lines.push("STATUS:CONFIRMED", "SEQUENCE:0", "END:VEVENT", "END:VCALENDAR");

	return lines.join("\r\n");
}

/**
 * Formats Date to iCalendar format (YYYYMMDDTHHmmssZ)
 */
function formatICalDate(date: Date): string {
	return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

/**
 * Escapes special characters for iCalendar
 */
function escapeICalText(text: string): string {
	return text
		.replace(/\\/g, "\\\\")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,")
		.replace(/\n/g, "\\n");
}

/**
 * Creates a downloadable .ics blob URL
 */
export function createICSDownloadUrl(event: CalendarEvent): string {
	const icsContent = generateICS(event);
	const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
	return URL.createObjectURL(blob);
}
