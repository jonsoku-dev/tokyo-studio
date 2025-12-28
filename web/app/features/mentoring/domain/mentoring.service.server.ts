import { db } from "~/shared/db/client.server";
import { mentoringSessions } from "~/shared/db/schema";
import type {
	CreateMentoringSessionDTO,
	MentoringSession,
} from "./mentoring.types";

export const mentoringService = {
	getSessions: async (): Promise<MentoringSession[]> => {
		const sessions = await db.select().from(mentoringSessions);
		return sessions.map((session) => ({
			id: session.id,
			mentorName: session.mentorName,
			topic: session.topic,
			date: session.date,
			status: session.status as "scheduled" | "completed" | "canceled",
		}));
	},

	createSession: async (data: CreateMentoringSessionDTO) => {
		const [session] = await db
			.insert(mentoringSessions)
			.values(data)
			.returning();
		return session;
	},
};
