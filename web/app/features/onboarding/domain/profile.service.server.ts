import { db } from "@itcom/db/client";
import { profiles } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import type { InsertProfile } from "./profile.types";

export const profileService = {
	async createProfile(data: InsertProfile) {
		return await db.insert(profiles).values(data).returning();
	},

	async getProfile(userId: string) {
		return await db.query.profiles.findFirst({
			where: eq(profiles.userId, userId),
		});
	},

	async updateProfile(userId: string, data: InsertProfile) {
		const [profile] = await db
			.insert(profiles)
			.values({ ...data, userId })
			.onConflictDoUpdate({
				target: profiles.userId,
				set: {
					...data,
					updatedAt: new Date(),
				},
			})
			.returning();
		return profile;
	},

	calculateRecommendations(profile: InsertProfile) {
		const recommendations = [];
		const { jpLevel, enLevel, jobFamily, level } = profile;

		// v2.0 Deep Context Logic
		const isNoDegree = profile.hardConstraints?.degree === "none";
		const isUrgent = profile.careerTimeline === "ASAP";
		const valuesWorkLife = (profile.workValues as string[])?.includes("wlb");
		const visaStatus = profile.hardConstraints?.visaStatus;

		/* ------------------------------------------------------------------
       1. Visa / Degree Strategy (Hard Constraint)
       ------------------------------------------------------------------ */
		let visaStrategy = "";
		if (isNoDegree) {
			visaStrategy = "Visa_Challenge";
			recommendations.push({
				title: "비자 발급을 위한 학위 전략",
				type: "visa",
				description:
					"일본 취업 비자는 '학위'가 필수적입니다. 학점은행제를 통한 학사 취득 또는 '특정기능비자' 시험 준비를 병행해야 합니다.",
				tags: ["Must Read", "Visa"],
			});
		} else if (visaStatus === "working") {
			visaStrategy = "Visa_Change";
			recommendations.push({
				title: "이직 활동 가이드 (비자 갱신)",
				type: "visa",
				description:
					"현재 취업 비자를 보유 중이시군요. 퇴사 후 3개월 이내 재취업 시 비자 변경 절차와 주의사항을 확인하세요.",
				tags: ["Visa", "Immediate"],
			});
		}

		/* ------------------------------------------------------------------
       2. Job Strategy based on Values & Timeline
       ------------------------------------------------------------------ */
		if (isUrgent) {
			recommendations.push({
				title: "즉시 지원 가능한 '채용 급구' 포지션",
				type: "job",
				description:
					"빠른 취업이 목표시라면, 기술 스택 매칭도가 높은 파견/SIer 기업부터 공략하여 일본 경력을 시작하는 것이 유리합니다.",
				tags: ["Speed", "Strategy"],
			});
		} else if (valuesWorkLife) {
			recommendations.push({
				title: "워라밸 중시 기업 리스트",
				type: "job",
				description:
					"잔업 시간이 월 20시간 미만이고 리모트 근무가 활성화된 '자사 서비스' 및 '화이트 SI' 기업 위주로 준비하세요.",
				tags: ["WLB", "Culture"],
			});
		}

		/* ------------------------------------------------------------------
       3. Language Strategy
       ------------------------------------------------------------------ */
		let langStrategy = "";
		if (["N1", "N2", "Native"].includes(jpLevel)) {
			langStrategy = "Direct_JP";
			if (!recommendations.some((r) => r.type === "channel")) {
				recommendations.push({
					title: "일본 현지 기업 직접 지원",
					type: "channel",
					description:
						"일본어 실력이 충분합니다. Wantedly나 Green을 통해 현지 기업에 직접 지원해보세요.",
					tags: ["Wantedly", "Green"],
				});
			}
		} else if (["Business", "Native"].includes(enLevel)) {
			langStrategy = "Global_EN";
			recommendations.push({
				title: "영어 사용 글로벌 기업 공략",
				type: "channel",
				description:
					"라쿠텐, 라인, 메르카리 등 사내 공용어가 영어인 글로벌 기업을 목표로 하세요.",
				tags: ["LinkedIn", "Tokyodev"],
			});
		} else {
			langStrategy = "Agent_KR";
			recommendations.push({
				title: "한일 채용 에이전트 활용",
				type: "channel",
				description:
					"한국어 지원이 가능한 에이전트를 통해 일본어 부담을 줄이고 적합한 포지션을 추천받으세요.",
				tags: ["KOREC", "WorldJob"],
			});
		}

		/* ------------------------------------------------------------------
       4. Role Strategy
       ------------------------------------------------------------------ */
		if (jobFamily === "frontend") {
			recommendations.push({
				title: "포트폴리오 고도화 전략",
				type: "action",
				description:
					"일본 기업은 기술 스택뿐만 아니라 디자인 감각과 사용자 경험(UX)에 대한 이해도를 높게 평가합니다.",
				tags: ["Portfolio", "UX"],
			});
		}

		return {
			strategy: langStrategy || visaStrategy || "General",
			items: recommendations,
		};
	},
};
