import type {
	mentorAvailabilitySlots,
	mentoringSessions,
	mentorProfiles,
	users,
} from "@itcom/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type MentorProfile = InferSelectModel<typeof mentorProfiles>;
export type User = InferSelectModel<typeof users>;
export type AvailabilitySlot = InferSelectModel<typeof mentorAvailabilitySlots>;
export type MentoringSession = InferSelectModel<typeof mentoringSessions>;

export type MentorReview = {
	id: string;
	rating: number; // 1-5
	comment: string | null;
	createdAt: Date;
	menteeName: string | null;
};

export interface Mentor extends User {
	profile: MentorProfile | null;
	reviews?: MentorReview[];
}

export interface MentorFilters {
	jobFamily?: string;
	experienceLevel?: string;
	minPrice?: number;
	maxPrice?: number;
	availability?: "today" | "week" | "month";
}

export interface CreateBookingDTO {
	mentorId: string;
	slotId: string;
	duration: 30 | 60 | 90;
	topic: string;
	price: number;
	/** SPEC 022: Document Integration - documents to share with mentor */
	sharedDocumentIds?: string[];
}
