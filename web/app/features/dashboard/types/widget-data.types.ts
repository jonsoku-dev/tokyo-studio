/**
 * Widget Data Types
 * 각 위젯에서 사용하는 데이터 타입 정의
 */

// Pipeline Overview Widget Data
export interface PipelineWidgetData {
	applications: {
		id: string;
		company: string;
		position: string;
		stage: string;
		nextAction: string | null;
		createdAt: Date | null;
	}[];
	stageCounts: {
		interested: number;
		applied: number;
		interviewing: number;
		offered: number;
	};
}

// Mentor Sessions Widget Data
export interface MentorSessionsWidgetData {
	upcomingSessions: {
		id: string;
		topic: string;
		date: string;
		duration: number;
		status: string | null;
		mentorId: string;
		mentorName: string | null;
	}[];
	upcomingCount: number;
	completedCount: number;
}

// Community Highlights Widget Data
export interface CommunityWidgetData {
	posts: {
		id: string;
		title: string;
		score: number;
		commentCount: number;
		createdAt: Date | null;
		authorName: string | null;
	}[];
}

// Document Hub Widget Data
export interface DocumentWidgetData {
	recentDocuments: {
		id: string;
		title: string;
		type: string;
		status: string;
		updatedAt: Date;
	}[];
	typeCounts: {
		resume: number;
		portfolio: number;
		cover_letter: number;
		certificate: number;
		other: number;
	};
}

// Journey Progress Widget Data
export interface JourneyWidgetData {
	progress: number;
	stage: string;
	completedTasks: number;
	applicationCount: number;
	sessionCount: number;
}

// Priority Actions Widget Data
export interface PriorityWidgetData {
	pendingTasks: {
		id: string;
		title: string;
		category: string;
		status: string | null;
	}[];
	upcomingInterviews: {
		id: string;
		company: string;
		position: string;
		nextAction: string | null;
	}[];
}

// Roadmap Snapshot Widget Data
export interface RoadmapWidgetData {
	todayTasks: {
		id: string;
		title: string;
		completed: boolean;
	}[];
	currentPhase: string;
	phaseProgress: number;
}

// Mentor Application Widget Data
export interface MentorApplicationWidgetData {
	isApplied: boolean;
	isApproved: boolean;
	totalMentors: number;
	totalSessions: number;
}

// =============================================================================
// Phase 3A Widget Data
// =============================================================================

// Profile Completion Widget Data
export interface ProfileCompletionWidgetData {
	completionPercent: number;
	missingFields: string[];
	profile: {
		hasBasicInfo: boolean;
		hasCareerInfo: boolean;
		hasLanguageInfo: boolean;
		hasTechStack: boolean;
		hasPreferences: boolean;
	} | null;
}

// Career Diagnosis Summary Widget Data
export interface CareerDiagnosisWidgetData {
	hasResult: boolean;
	readinessScore: number | null;
	recommendation: string | null;
	strengths: string[];
	weaknesses: string[];
}

// Interview Prep Widget Data
export interface InterviewPrepWidgetData {
	upcomingInterviews: {
		id: string;
		company: string;
		position: string;
		date: string | null;
		daysUntil: number;
	}[];
	prepItems: {
		id: string;
		title: string;
		completed: boolean;
	}[];
}

// Weekly Calendar Widget Data
export interface WeeklyCalendarWidgetData {
	events: {
		id: string;
		title: string;
		type: "mentoring" | "interview" | "deadline";
		date: string;
		time: string | null;
	}[];
	weekStart: string;
	weekEnd: string;
}

// =============================================================================
// Phase 3B Widget Data
// =============================================================================

// Nearby Locations Widget Data
export interface NearbyLocationsWidgetData {
	favorites: {
		id: string;
		name: string;
		category: string;
		address: string | null;
	}[];
	recentSearches: string[];
}

// Job Posting Tracker Widget Data
export interface JobPostingTrackerWidgetData {
	savedJobs: {
		id: string;
		company: string;
		position: string;
		deadline: string | null;
		daysUntilDeadline: number | null;
	}[];
	newPostingsCount: number;
}

// Achievements Widget Data
export interface AchievementsWidgetData {
	badges: {
		id: string;
		name: string;
		icon: string;
		earnedAt: Date;
	}[];
	nextBadge: {
		name: string;
		progress: number;
	} | null;
}

// Skill Radar Widget Data
export interface SkillRadarWidgetData {
	skills: {
		name: string;
		level: number; // 0-100
		category: string;
	}[];
	topSkills: string[];
}

// =============================================================================
// Phase 3C Widget Data
// =============================================================================

// Japanese Study Widget Data
export interface JapaneseStudyWidgetData {
	currentLevel: string;
	targetLevel: string | null;
	studyStreak: number;
	nextExamDate: string | null;
}

// Reputation Stats Widget Data
export interface ReputationStatsWidgetData {
	reputation: number;
	rank: number | null;
	totalUsers: number;
	recentActivities: {
		type: string;
		points: number;
		date: Date;
	}[];
}

// Quick Search Widget Data
export interface QuickSearchWidgetData {
	recentSearches: string[];
	popularSearches: string[];
}

// Subscription Status Widget Data
export interface SubscriptionStatusWidgetData {
	plan: "free" | "pro" | "premium";
	usage: {
		mentoring: number;
		documents: number;
	};
	renewalDate: string | null;
}

// All Widget Data combined
export interface WidgetData {
	// Phase 1 & 2
	pipeline: PipelineWidgetData;
	mentorSessions: MentorSessionsWidgetData;
	community: CommunityWidgetData;
	documents: DocumentWidgetData;
	journey: JourneyWidgetData;
	priority: PriorityWidgetData;
	roadmap: RoadmapWidgetData;
	mentorApplication: MentorApplicationWidgetData;
	// Phase 3A
	profileCompletion: ProfileCompletionWidgetData;
	careerDiagnosis: CareerDiagnosisWidgetData;
	interviewPrep: InterviewPrepWidgetData;
	weeklyCalendar: WeeklyCalendarWidgetData;
	// Phase 3B
	nearbyLocations: NearbyLocationsWidgetData;
	jobPostingTracker: JobPostingTrackerWidgetData;
	achievements: AchievementsWidgetData;
	skillRadar: SkillRadarWidgetData;
	// Phase 3C
	japaneseStudy: JapaneseStudyWidgetData;
	reputationStats: ReputationStatsWidgetData;
	quickSearch: QuickSearchWidgetData;
	subscriptionStatus: SubscriptionStatusWidgetData;
}
