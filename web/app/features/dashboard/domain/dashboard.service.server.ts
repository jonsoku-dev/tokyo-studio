import { db } from "@itcom/db/client";
import type { JourneyStage } from "@itcom/db/schema";
import { mentoringSessions, pipelineItems, profiles } from "@itcom/db/schema";
import { count, eq } from "drizzle-orm";

/**
 * Dashboard Service
 * 사용자 여정 분석 및 대시보드 데이터 집계
 */

/**
 * 사용자의 여정 단계(Journey Stage) 감지
 * 프로필, 로드맵 진행률, 지원 현황, 정착 정보를 기반으로 판단
 */
export async function getUserJourneyStage(
	userId: string,
): Promise<JourneyStage> {
	// 1. 프로필 확인
	const [profile] = await db
		.select()
		.from(profiles)
		.where(eq(profiles.userId, userId))
		.limit(1);

	// 프로필이 없으면 Newcomer
	if (!profile) {
		return "newcomer";
	}

	// 2. 지원 현황 확인
	const [applicationCount] = await db
		.select({ count: count() })
		.from(pipelineItems)
		.where(eq(pipelineItems.userId, userId));

	if (applicationCount && applicationCount.count > 0) {
		return "applicant";
	}

	// 3. 멘토링 세션 확인 (3회 이상이면 적극적 학습자)
	const [sessionCount] = await db
		.select({ count: count() })
		.from(mentoringSessions)
		.where(eq(mentoringSessions.userId, userId));

	if (sessionCount && sessionCount.count >= 3) {
		return "learner";
	}

	// 기본값: Learner (프로필이 있으면)
	return "learner";
}

/**
 * 사용자의 위젯 표시 컨텍스트 조회
 * 각 위젯의 visibilityCondition 평가에 사용
 */
export async function getUserWidgetContext(userId: string) {
	const [profile] = await db
		.select()
		.from(profiles)
		.where(eq(profiles.userId, userId))
		.limit(1);

	const [applicationCount] = await db
		.select({ count: count() })
		.from(pipelineItems)
		.where(eq(pipelineItems.userId, userId));

	const [sessionCount] = await db
		.select({ count: count() })
		.from(mentoringSessions)
		.where(eq(mentoringSessions.userId, userId));

	return {
		hasProfile: !!profile,
		hasApplications: (applicationCount?.count ?? 0) > 0,
		hasSessions: (sessionCount?.count ?? 0) > 0,
		hasArrivalDate: false, // TODO: settlementChecklists 스키마 추가 후 구현
		hasMentorApplication: false, // TODO: mentorApplications 스키마 추가 후 구현
	};
}
