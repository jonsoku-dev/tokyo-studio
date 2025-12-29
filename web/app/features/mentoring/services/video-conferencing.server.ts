import { db } from "@itcom/db/client";
import { userIntegrations } from "@itcom/db/schema";
import { and, eq } from "drizzle-orm";

export interface VideoProvider {
	generateLink(session: {
		id: string;
		topic: string;
		mentorId: string;
	}): Promise<string>;
}

export class JitsiProvider implements VideoProvider {
	async generateLink(session: { id: string }): Promise<string> {
		// Secure random room name or based on Session ID
		// Using Session ID ensures 1:1 mapping and uniqueness
		return `https://meet.jit.si/itcom-session-${session.id}`;
	}
}

export class GoogleMeetProvider implements VideoProvider {
	async generateLink(session: {
		id: string;
		mentorId: string;
	}): Promise<string> {
		// 1. Check if user has Google Token in userIntegrations
		const integration = await db.query.userIntegrations.findFirst({
			where: and(
				eq(userIntegrations.userId, session.mentorId),
				eq(userIntegrations.provider, "google"),
			),
		});

		if (!integration) {
			// Fallback if not connected
			return `https://meet.google.com/error-no-integration`;
		}

		// 2. Ideally: Refresh token, Call Google Calendar API to create event & get hangoutsLink.
		// For MVP/Dev: Mock
		return `https://meet.google.com/mock-session-${session.id}`;
	}
}

export class ZoomProvider implements VideoProvider {
	async generateLink(session: {
		id: string;
		mentorId: string;
	}): Promise<string> {
		// Mock implementation
		return `https://zoom.us/j/mock-session-${session.id}`;
	}
}

export class ManualProvider implements VideoProvider {
	constructor(private manualUrl: string) {}

	async generateLink(): Promise<string> {
		return this.manualUrl || "#";
	}
}

export const videoConferencingService = {
	getProvider: (
		type: string,
		options?: { manualUrl?: string },
	): VideoProvider => {
		switch (type) {
			case "google":
				return new GoogleMeetProvider();
			case "zoom":
				return new ZoomProvider();
			case "manual":
				return new ManualProvider(options?.manualUrl || "");

			default:
				return new JitsiProvider();
		}
	},

	generateLink: async (
		providerType: string | null,
		session: { id: string; topic: string; mentorId: string },
		options?: { manualUrl?: string },
	): Promise<string> => {
		const provider = videoConferencingService.getProvider(
			providerType || "jitsi",
			options,
		);
		return await provider.generateLink(session);
	},
};
