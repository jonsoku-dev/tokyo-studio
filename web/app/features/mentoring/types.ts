export interface Mentor {
	id: string;
	userId: string;
	slug: string | null;
	name: string;
	avatar: string | null;
	company: string | null;
	jobTitle: string | null;
	yearsOfExperience: number | null;
	hourlyRate: number | null;
	averageRating: number | null;
	totalReviews: number | null;
	specialties: string[] | null;
}

export interface MentorProfileData extends Mentor {
	bio: string | null;
}

export interface Slot {
	startTime: string; // ISO string
	status: "available" | "booked" | "locked";
}

export interface MentoringSession {
	id: string;
	mentorId: string;
	userId: string;
	topic: string;
	date: string; // ISO
	duration: number;
	status: string;
	meetingUrl: string | null;
	mentorName: string;
	mentorAvatar: string | null;
}
