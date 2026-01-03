import { db } from "@itcom/db/client";
import {
	communityPosts,
	documents,
	mentoringSessions,
	mentorProfiles,
	pipelineItems,
	profiles,
	tasks,
	users,
} from "@itcom/db/schema";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";

/**
 * Widget Data Service
 * 각 위젯에 필요한 실제 데이터를 조회
 */

// =============================================================================
// Pipeline Overview Widget
// =============================================================================
export async function getPipelineOverviewData(userId: string) {
	// 지원 현황 조회
	const applications = await db
		.select({
			id: pipelineItems.id,
			company: pipelineItems.company,
			position: pipelineItems.position,
			stage: pipelineItems.stage,
			nextAction: pipelineItems.nextAction,
			createdAt: pipelineItems.createdAt,
		})
		.from(pipelineItems)
		.where(eq(pipelineItems.userId, userId))
		.orderBy(desc(pipelineItems.updatedAt))
		.limit(10);

	// 단계별 카운트
	const stageCounts = await db
		.select({
			stage: pipelineItems.stage,
			count: count(),
		})
		.from(pipelineItems)
		.where(eq(pipelineItems.userId, userId))
		.groupBy(pipelineItems.stage);

	const counts = {
		interested: 0,
		applied: 0,
		interviewing: 0,
		offered: 0,
	};

	for (const item of stageCounts) {
		if (item.stage in counts) {
			counts[item.stage as keyof typeof counts] = Number(item.count);
		}
	}

	return { applications, stageCounts: counts };
}

// =============================================================================
// Mentor Sessions Widget
// =============================================================================
export async function getMentorSessionsData(userId: string) {
	const _now = new Date();

	// 예정된 세션 (confirmed 상태, 미래 날짜)
	const upcomingSessions = await db
		.select({
			id: mentoringSessions.id,
			topic: mentoringSessions.topic,
			date: mentoringSessions.date,
			duration: mentoringSessions.duration,
			status: mentoringSessions.status,
			mentorId: mentoringSessions.mentorId,
			mentorName: users.name,
		})
		.from(mentoringSessions)
		.leftJoin(users, eq(mentoringSessions.mentorId, users.id))
		.where(
			and(
				eq(mentoringSessions.userId, userId),
				eq(mentoringSessions.status, "confirmed"),
			),
		)
		.orderBy(mentoringSessions.date)
		.limit(5);

	// 완료된 세션 카운트
	const [completedCount] = await db
		.select({ count: count() })
		.from(mentoringSessions)
		.where(
			and(
				eq(mentoringSessions.userId, userId),
				eq(mentoringSessions.status, "completed"),
			),
		);

	return {
		upcomingSessions,
		upcomingCount: upcomingSessions.length,
		completedCount: completedCount?.count ?? 0,
	};
}

// =============================================================================
// Community Highlights Widget
// =============================================================================
export async function getCommunityHighlightsData(_userId: string) {
	// 인기 게시글 (최근 7일, 투표순)
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	const posts = await db
		.select({
			id: communityPosts.id,
			title: communityPosts.title,
			score: communityPosts.score,
			commentCount: communityPosts.commentCount,
			createdAt: communityPosts.createdAt,
			authorName: users.name,
		})
		.from(communityPosts)
		.leftJoin(users, eq(communityPosts.authorId, users.id))
		.where(
			and(
				sql`${communityPosts.removedAt} IS NULL`,
				gte(communityPosts.createdAt, sevenDaysAgo),
			),
		)
		.orderBy(desc(communityPosts.score))
		.limit(5);

	return { posts };
}

// =============================================================================
// Document Hub Widget
// =============================================================================
export async function getDocumentHubData(userId: string) {
	// 최근 문서
	const recentDocuments = await db
		.select({
			id: documents.id,
			title: documents.title,
			type: documents.type,
			status: documents.status,
			updatedAt: documents.updatedAt,
		})
		.from(documents)
		.where(eq(documents.userId, userId))
		.orderBy(desc(documents.updatedAt))
		.limit(5);

	// 타입별 카운트
	const typeCounts = await db
		.select({
			type: documents.type,
			count: count(),
		})
		.from(documents)
		.where(eq(documents.userId, userId))
		.groupBy(documents.type);

	const counts = {
		resume: 0,
		portfolio: 0,
		cover_letter: 0,
		certificate: 0,
		other: 0,
	};

	for (const item of typeCounts) {
		if (item.type && item.type in counts) {
			counts[item.type as keyof typeof counts] = Number(item.count);
		}
	}

	return { recentDocuments, typeCounts: counts };
}

// =============================================================================
// Journey Progress Widget
// =============================================================================
export async function getJourneyProgressData(userId: string) {
	// 프로필 조회
	const [profile] = await db
		.select()
		.from(profiles)
		.where(eq(profiles.userId, userId))
		.limit(1);

	// 완료된 작업 수
	const [completedTasks] = await db
		.select({ count: count() })
		.from(tasks)
		.where(and(eq(tasks.userId, userId), eq(tasks.status, "done")));

	// 총 작업 수
	const [totalTasks] = await db
		.select({ count: count() })
		.from(tasks)
		.where(eq(tasks.userId, userId));

	// 지원 기업 수
	const [applicationCount] = await db
		.select({ count: count() })
		.from(pipelineItems)
		.where(eq(pipelineItems.userId, userId));

	// 멘토링 세션 수
	const [sessionCount] = await db
		.select({ count: count() })
		.from(mentoringSessions)
		.where(eq(mentoringSessions.userId, userId));

	const completed = completedTasks?.count ?? 0;
	const total = totalTasks?.count ?? 1;
	const progress = Math.round((completed / total) * 100);

	// Journey stage 결정
	let stage = "시작하기";
	if (profile) {
		if ((applicationCount?.count ?? 0) > 0) {
			stage = "적극 지원자";
		} else if ((sessionCount?.count ?? 0) >= 3) {
			stage = "학습 중";
		} else {
			stage = "준비 중";
		}
	}

	return {
		progress,
		stage,
		completedTasks: completed,
		applicationCount: applicationCount?.count ?? 0,
		sessionCount: sessionCount?.count ?? 0,
	};
}

// =============================================================================
// Priority Actions Widget
// =============================================================================
export async function getPriorityActionsData(userId: string) {
	// 진행 중인 작업 (미완료, 우선순위순)
	const pendingTasks = await db
		.select({
			id: tasks.id,
			title: tasks.title,
			category: tasks.category,
			status: tasks.status,
		})
		.from(tasks)
		.where(and(eq(tasks.userId, userId), eq(tasks.status, "in_progress")))
		.limit(5);

	// 다가오는 면접 (지원 중인 것들)
	const upcomingInterviews = await db
		.select({
			id: pipelineItems.id,
			company: pipelineItems.company,
			position: pipelineItems.position,
			nextAction: pipelineItems.nextAction,
		})
		.from(pipelineItems)
		.where(
			and(
				eq(pipelineItems.userId, userId),
				eq(pipelineItems.stage, "interviewing"),
			),
		)
		.limit(3);

	return { pendingTasks, upcomingInterviews };
}

// =============================================================================
// Roadmap Snapshot Widget
// =============================================================================
export async function getRoadmapSnapshotData(userId: string) {
	// 오늘의 작업
	const todayTasks = await db
		.select({
			id: tasks.id,
			title: tasks.title,
			status: tasks.status,
		})
		.from(tasks)
		.where(eq(tasks.userId, userId))
		.limit(5);

	// 현재 진행 중인 카테고리 (가장 많은 작업이 있는 카테고리)
	const categoryProgress = await db
		.select({
			category: tasks.category,
			total: count(),
			completed: sql<number>`SUM(CASE WHEN ${tasks.status} = 'done' THEN 1 ELSE 0 END)`,
		})
		.from(tasks)
		.where(eq(tasks.userId, userId))
		.groupBy(tasks.category);

	// 현재 단계 찾기
	let currentPhase = "시작하기";
	let phaseProgress = 0;

	if (categoryProgress.length > 0) {
		const current = categoryProgress[0];
		currentPhase = current.category;
		phaseProgress = Math.round(
			(Number(current.completed) / Number(current.total)) * 100,
		);
	}

	return {
		todayTasks: todayTasks.map((t) => ({
			id: t.id,
			title: t.title,
			completed: t.status === "done",
		})),
		currentPhase,
		phaseProgress,
	};
}

// =============================================================================
// Mentor Application Widget
// =============================================================================
export async function getMentorApplicationData(userId: string) {
	// 멘토 프로필 확인
	const [mentorProfile] = await db
		.select()
		.from(mentorProfiles)
		.where(eq(mentorProfiles.userId, userId))
		.limit(1);

	// 전체 멘토 통계
	const [mentorStats] = await db
		.select({ count: count() })
		.from(mentorProfiles)
		.where(eq(mentorProfiles.isActive, true));

	const [sessionStats] = await db
		.select({ count: count() })
		.from(mentoringSessions)
		.where(eq(mentoringSessions.status, "completed"));

	return {
		isApplied: !!mentorProfile,
		isApproved: mentorProfile?.isActive ?? false,
		totalMentors: mentorStats?.count ?? 0,
		totalSessions: sessionStats?.count ?? 0,
	};
}

// =============================================================================
// Phase 3A: Profile Completion Widget
// =============================================================================
export async function getProfileCompletionData(userId: string) {
	const [profile] = await db
		.select()
		.from(profiles)
		.where(eq(profiles.userId, userId))
		.limit(1);

	if (!profile) {
		return {
			completionPercent: 0,
			missingFields: [
				"기본 정보",
				"경력 정보",
				"어학 능력",
				"기술 스택",
				"선호도",
			],
			profile: null,
		};
	}

	const checks = {
		hasBasicInfo: !!(profile.jobFamily && profile.level),
		hasCareerInfo: !!profile.careerTimeline,
		hasLanguageInfo: !!(profile.jpLevel && profile.enLevel),
		hasTechStack: !!(
			profile.techStack && (profile.techStack as string[]).length > 0
		),
		hasPreferences: !!(profile.targetCity && profile.workValues),
	};

	const completedCount = Object.values(checks).filter(Boolean).length;
	const completionPercent = Math.round((completedCount / 5) * 100);

	const missingFields: string[] = [];
	if (!checks.hasBasicInfo) missingFields.push("기본 정보");
	if (!checks.hasCareerInfo) missingFields.push("경력 정보");
	if (!checks.hasLanguageInfo) missingFields.push("어학 능력");
	if (!checks.hasTechStack) missingFields.push("기술 스택");
	if (!checks.hasPreferences) missingFields.push("선호도");

	return {
		completionPercent,
		missingFields,
		profile: checks,
	};
}

// =============================================================================
// Phase 3A: Career Diagnosis Summary Widget
// =============================================================================
export async function getCareerDiagnosisData(userId: string) {
	// diagnosticResult 필드가 없으므로 프로필 정보를 기반으로 대체 계산
	const [profile] = await db
		.select()
		.from(profiles)
		.where(eq(profiles.userId, userId))
		.limit(1);

	if (!profile) {
		return {
			hasResult: false,
			readinessScore: null,
			recommendation: null,
			strengths: [],
			weaknesses: [],
		};
	}

	// 프로필 완성도 기반 점수 계산
	let score = 0;
	const strengths: string[] = [];
	const weaknesses: string[] = [];

	if (profile.jobFamily && profile.level) {
		score += 20;
		strengths.push("명확한 직무 정의");
	} else {
		weaknesses.push("직무 정보 입력 필요");
	}

	if (profile.jpLevel && profile.jpLevel !== "None") {
		score += 25;
		if (profile.jpLevel === "N1" || profile.jpLevel === "N2") {
			strengths.push("일본어 능력 우수");
		}
	} else {
		weaknesses.push("일본어 능력 향상 필요");
	}

	if (profile.techStack && (profile.techStack as string[]).length >= 3) {
		score += 25;
		strengths.push("다양한 기술 스택");
	}

	if (profile.enLevel === "Business" || profile.enLevel === "Native") {
		score += 15;
		strengths.push("영어 비즈니스 레벨");
	}

	if (profile.targetCity) {
		score += 15;
	}

	const recommendation =
		score >= 80
			? "지금 바로 지원을 시작해도 좋아요!"
			: score >= 60
				? "조금만 더 준비하면 완벽해요"
				: score >= 40
					? "기본기를 더 다져주세요"
					: "프로필을 먼저 완성해주세요";

	return {
		hasResult: true,
		readinessScore: score,
		recommendation,
		strengths: strengths.slice(0, 3),
		weaknesses: weaknesses.slice(0, 3),
	};
}

// =============================================================================
// Phase 3A: Interview Prep Widget
// =============================================================================
export async function getInterviewPrepData(userId: string) {
	const now = new Date();

	// 면접 진행 중인 지원들
	const interviews = await db
		.select({
			id: pipelineItems.id,
			company: pipelineItems.company,
			position: pipelineItems.position,
			date: pipelineItems.date,
		})
		.from(pipelineItems)
		.where(
			and(
				eq(pipelineItems.userId, userId),
				eq(pipelineItems.stage, "interviewing"),
			),
		)
		.orderBy(pipelineItems.date)
		.limit(5);

	const upcomingInterviews = interviews.map((interview) => {
		const interviewDate = interview.date ? new Date(interview.date) : null;
		const daysUntil = interviewDate
			? Math.ceil(
					(interviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
				)
			: 999;

		return {
			id: interview.id,
			company: interview.company,
			position: interview.position,
			date: interview.date,
			daysUntil,
		};
	});

	// 준비 체크리스트 (TODO: 실제 체크리스트 연동)
	const prepItems = [
		{ id: "1", title: "회사 리서치", completed: false },
		{ id: "2", title: "자기소개 준비", completed: false },
		{ id: "3", title: "기술 면접 준비", completed: false },
	];

	return { upcomingInterviews, prepItems };
}

// =============================================================================
// Phase 3A: Weekly Calendar Widget
// =============================================================================
export async function getWeeklyCalendarData(userId: string) {
	const now = new Date();
	const weekStart = new Date(now);
	weekStart.setDate(now.getDate() - now.getDay()); // 일요일
	const weekEnd = new Date(weekStart);
	weekEnd.setDate(weekStart.getDate() + 6); // 토요일

	// 멘토링 세션
	const sessions = await db
		.select({
			id: mentoringSessions.id,
			topic: mentoringSessions.topic,
			date: mentoringSessions.date,
		})
		.from(mentoringSessions)
		.where(
			and(
				eq(mentoringSessions.userId, userId),
				eq(mentoringSessions.status, "confirmed"),
			),
		)
		.limit(10);

	// 면접 일정
	const interviews = await db
		.select({
			id: pipelineItems.id,
			company: pipelineItems.company,
			date: pipelineItems.date,
		})
		.from(pipelineItems)
		.where(
			and(
				eq(pipelineItems.userId, userId),
				eq(pipelineItems.stage, "interviewing"),
			),
		)
		.limit(10);

	const events = [
		...sessions.map((s) => ({
			id: s.id,
			title: s.topic,
			type: "mentoring" as const,
			date: s.date,
			time: new Date(s.date).toLocaleTimeString("ko-KR", {
				hour: "2-digit",
				minute: "2-digit",
			}),
		})),
		...interviews.map((i) => ({
			id: i.id,
			title: `${i.company} 면접`,
			type: "interview" as const,
			date: i.date,
			time: null,
		})),
	].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	return {
		events,
		weekStart: weekStart.toISOString().split("T")[0],
		weekEnd: weekEnd.toISOString().split("T")[0],
	};
}

// =============================================================================
// Phase 3B~3C: Placeholder Data Functions
// =============================================================================
export async function getNearbyLocationsData(_userId: string) {
	return {
		favorites: [],
		recentSearches: [],
	};
}

export async function getJobPostingTrackerData(_userId: string) {
	return {
		savedJobs: [],
		newPostingsCount: 0,
	};
}

export async function getAchievementsData(_userId: string) {
	return {
		badges: [],
		nextBadge: null,
	};
}

export async function getSkillRadarData(userId: string) {
	const [profile] = await db
		.select({
			techStack: profiles.techStack,
		})
		.from(profiles)
		.where(eq(profiles.userId, userId))
		.limit(1);

	const techStack = (profile?.techStack as string[]) ?? [];
	const skills = techStack.slice(0, 6).map((skill) => ({
		name: skill,
		level: Math.floor(Math.random() * 40) + 60, // TODO: 실제 레벨 계산
		category: "tech",
	}));

	return {
		skills,
		topSkills: techStack.slice(0, 3),
	};
}

export async function getJapaneseStudyData(userId: string) {
	const [profile] = await db
		.select({
			jpLevel: profiles.jpLevel,
		})
		.from(profiles)
		.where(eq(profiles.userId, userId))
		.limit(1);

	return {
		currentLevel: profile?.jpLevel ?? "None",
		targetLevel: null,
		studyStreak: 0,
		nextExamDate: null,
	};
}

export async function getReputationStatsData(userId: string) {
	const [user] = await db
		.select({
			reputation: users.reputation,
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	const [totalUsersCount] = await db.select({ count: count() }).from(users);

	return {
		reputation: user?.reputation ?? 0,
		rank: null,
		totalUsers: totalUsersCount?.count ?? 0,
		recentActivities: [],
	};
}

export async function getQuickSearchData(_userId: string) {
	return {
		recentSearches: [],
		popularSearches: ["일본 취업", "JLPT N2", "도쿄 IT기업"],
	};
}

export async function getSubscriptionStatusData(_userId: string) {
	return {
		plan: "free" as const,
		usage: {
			mentoring: 0,
			documents: 0,
		},
		renewalDate: null,
	};
}
