/**
 * SPEC 013: Video Provider Service
 * Handles automatic video meeting link generation for different providers
 */

import { v4 as uuidv4 } from "uuid";

export type VideoProvider = "jitsi" | "google" | "zoom" | "manual";

export interface GeneratedLink {
	provider: VideoProvider;
	url: string;
	expiresAt?: Date;
}

/**
 * Generate meeting link based on mentor's preferred provider
 */
export async function generateMeetingLink(params: {
	sessionId: string;
	mentorId: string;
	preferredProvider: VideoProvider;
	manualMeetingUrl?: string;
}): Promise<GeneratedLink> {
	const { sessionId, mentorId, preferredProvider, manualMeetingUrl } = params;

	switch (preferredProvider) {
		case "jitsi":
			return generateJitsiLink(sessionId);

		case "manual":
			if (!manualMeetingUrl) {
				// Fallback to Jitsi if manual URL not provided
				return generateJitsiLink(sessionId);
			}
			return {
				provider: "manual",
				url: manualMeetingUrl,
			};

		case "google":
			// MVP: Mock Google Meet link generation
			return generateGoogleMeetLink(sessionId);

		case "zoom":
			// MVP: Mock Zoom link generation
			return generateZoomLink(sessionId);

		default:
			// Default to Jitsi
			return generateJitsiLink(sessionId);
	}
}

/**
 * Generate Jitsi Meet link
 * Format: https://meet.jit.si/itcom-session-{sessionId}
 */
export function generateJitsiLink(sessionId: string): GeneratedLink {
	// Validate session ID format (UUID)
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)) {
		throw new Error("Invalid session ID format");
	}

	// Create room name: lowercase, alphanumeric + hyphen
	// Remove hyphens from UUID and use first 16 chars
	const roomNameSuffix = sessionId.replace(/-/g, "").substring(0, 16).toLowerCase();
	const roomName = `itcom-session-${roomNameSuffix}`;

	// Build URL with recommended parameters
	const baseUrl = "https://meet.jit.si";
	const url = new URL(roomName, baseUrl).toString();

	return {
		provider: "jitsi",
		url,
	};
}

/**
 * Generate Google Meet link (Mocked for MVP)
 * In production: Would integrate with Google Calendar API
 */
export function generateGoogleMeetLink(sessionId: string): GeneratedLink {
	// MVP: Generate mock URL
	// In production, integrate with OAuth + Google Calendar API
	const mockToken = generateMockToken(sessionId, "google");

	return {
		provider: "google",
		url: `https://meet.google.com/mock-${mockToken}`,
	};
}

/**
 * Generate Zoom link (Mocked for MVP)
 * In production: Would integrate with Zoom API
 */
export function generateZoomLink(sessionId: string): GeneratedLink {
	// MVP: Generate mock URL
	// In production, integrate with Zoom OAuth + Meeting API
	const mockToken = generateMockToken(sessionId, "zoom");

	return {
		provider: "zoom",
		url: `https://zoom.us/meeting/mock-${mockToken}`,
	};
}

/**
 * Generate mock token for MVP external providers
 * Not production-grade; replaced with real OAuth tokens
 */
function generateMockToken(sessionId: string, provider: string): string {
	const seed = `${sessionId}-${provider}-${Date.now()}`;
	return Buffer.from(seed).toString("base64").substring(0, 12).toLowerCase();
}

/**
 * Validate that a manual meeting URL is properly formatted
 */
export function validateManualMeetingUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		// Must be HTTPS (for security)
		return parsed.protocol === "https:";
	} catch {
		return false;
	}
}

/**
 * Generate secure join token for proxy endpoint
 * Used to validate access before redirecting to actual meeting
 */
export function generateJoinToken(params: {
	sessionId: string;
	userId: string;
	expiresIn: number; // seconds
}): string {
	const { sessionId, userId, expiresIn } = params;

	// Simple JWT-like token for MVP (use real JWT library in production)
	const payload = {
		sessionId,
		userId,
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + expiresIn,
	};

	// Base64 encode (not production-grade)
	return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/**
 * Verify and decode join token
 */
export function verifyJoinToken(
	token: string,
): {
	sessionId: string;
	userId: string;
} | null {
	try {
		const decoded = JSON.parse(
			Buffer.from(token, "base64").toString("utf-8"),
		);

		// Check expiration
		if (decoded.exp < Math.floor(Date.now() / 1000)) {
			return null;
		}

		return {
			sessionId: decoded.sessionId,
			userId: decoded.userId,
		};
	} catch {
		return null;
	}
}
