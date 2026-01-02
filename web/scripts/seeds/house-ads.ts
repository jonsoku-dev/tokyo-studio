import type * as schema from "@itcom/db/schema";
import { houseAds } from "@itcom/db/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export async function seedHouseAds(db: NodePgDatabase<typeof schema>) {
	console.log("📢 Seeding house ads...");

	const now = new Date();
	const oneMonthFromNow = new Date(now);
	oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

	const ads = [
		// ========================================
		// FEED PLACEMENT - Platform Services
		// ========================================

		{
			id: "ad000000-0000-0000-0000-000000000001",
			title: "1:1 멘토링으로 일본 취업 성공",
			description:
				"현직 일본 IT 개발자의 1:1 멘토링으로 이력서 첨삭, 면접 준비, 커리어 상담을 받아보세요. 성공률 2배 향상!",
			imageUrl: "/images/ads/feed/mentor.png",
			ctaText: "멘토 찾아보기",
			ctaUrl: "/mentoring",
			placement: "feed-middle",
			targetCategories: ["community", "dashboard"],
			targetPages: ["explore", "home"],
			weight: 5,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000002",
			title: "일본 정착 체크리스트",
			description:
				"일본 입국 후 반드시 처리해야 할 필수 절차들을 단계별로 안내합니다. 구청, 은행, 통신사 등 놓치지 마세요!",
			imageUrl: "/images/ads/feed/settlement.png",
			ctaText: "체크리스트 확인",
			ctaUrl: "/settlement",
			placement: "feed-middle",
			targetCategories: ["community", "settlement"],
			targetPages: ["explore", "dashboard", "detail"],
			weight: 4,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000003",
			title: "일본 IT 개발자 커뮤니티",
			description:
				"일본 IT 업계에서 활동하는 한국 개발자들과 네트워킹하세요. 정보 공유, 스터디, 오프라인 모임까지!",
			imageUrl: "/images/ads/feed/community.png",
			ctaText: "커뮤니티 둘러보기",
			ctaUrl: "/communities",
			placement: "feed-top",
			targetCategories: ["dashboard", "pipeline"],
			targetPages: ["home", "roadmap"],
			weight: 3,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000004",
			title: "비즈니스 일본어 마스터",
			description:
				"JLPT N1 합격부터 비즈니스 회화까지. 일본 기업에서 통하는 실전 일본어를 배워보세요!",
			imageUrl: "/images/ads/feed/japanese-learning.png",
			ctaText: "학습 시작하기",
			ctaUrl: "/japanese-course",
			placement: "feed-middle",
			targetCategories: ["community"],
			targetPages: ["explore", "detail"],
			weight: 3,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000005",
			title: "일본 주거 매칭 서비스",
			description:
				"외국인 친화적인 부동산 중개! 도쿄, 오사카 등 주요 도시의 원룸부터 패밀리 아파트까지 한국어 상담 가능",
			imageUrl: "/images/ads/feed/housing_search_ad_1767362351512_feed.png",
			ctaText: "집 찾아보기",
			ctaUrl: "/housing",
			placement: "feed-middle",
			targetCategories: ["settlement"],
			targetPages: ["explore"],
			weight: 3,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000006",
			title: "도쿄 IT 개발자 밋업",
			description:
				"매월 셋째주 토요일, 도쿄에서 한국 개발자들과 네트워킹! 기술 공유, 커리어 토크, 친목 도모",
			imageUrl: "/images/ads/feed/tech-meetup.png",
			ctaText: "다음 밋업 확인",
			ctaUrl: "/events/tokyo-meetup",
			placement: "feed-middle",
			targetCategories: ["community"],
			targetPages: ["explore", "detail"],
			weight: 2,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000007",
			title: "3개월 완성 - 일본 기업 기술 스택",
			description:
				"일본 IT 기업이 요구하는 핵심 기술 스택을 3개월 만에 마스터! React, TypeScript, AWS 실무 프로젝트",
			imageUrl: "/images/ads/feed/skill_bootcamp_ad_1767362390065_16-9.png",
			ctaText: "부트캠프 신청",
			ctaUrl: "/bootcamp",
			placement: "feed-middle",
			targetCategories: ["dashboard"],
			targetPages: ["home"],
			weight: 3,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000008",
			title: "일본 기업 면접 완벽 대비",
			description:
				"모의면접, 문화 교육, Q&A 연습까지. 일본 기업 특유의 면접 문화를 완벽하게 준비하세요!",
			imageUrl: "/images/ads/feed/interview-prep.png",
			ctaText: "모의면접 신청",
			ctaUrl: "/interview-prep",
			placement: "feed-middle",
			targetCategories: ["dashboard", "pipeline"],
			targetPages: ["home", "roadmap"],
			weight: 4,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000009",
			title: "일본 생활 꿀팁 200선",
			description:
				"교통, 쇼핑, 의료, 세금까지! 일본 생활에 필요한 모든 실용 정보를 한곳에서",
			imageUrl: "/images/ads/feed/life_tips_ad_1767362429155_16-9.png",
			ctaText: "꿀팁 보기",
			ctaUrl: "/life-tips",
			placement: "feed-middle",
			targetCategories: ["settlement"],
			targetPages: ["explore", "detail"],
			weight: 2,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000010",
			title: "연봉 협상 전략 - IT 개발자",
			description:
				"일본 IT 개발자 평균 연봉 이상 받기! 시장 조사, 협상 전술, 오퍼 비교 가이드",
			imageUrl: "/images/ads/feed/salary_negotiation_ad_1767362450575_16-9.png",
			ctaText: "협상 전략 배우기",
			ctaUrl: "/salary-guide",
			placement: "feed-middle",
			targetCategories: ["dashboard"],
			targetPages: ["home"],
			weight: 3,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000011",
			title: "일본 취업비자 완벽 가이드",
			description:
				"전문가 상담으로 비자 취득 성공률 UP! 서류 준비부터 신청까지 전 과정 지원",
			imageUrl: "/images/ads/feed/visa_immigration_ad_1767362333076_16-9.png",
			ctaText: "비자 상담 신청",
			ctaUrl: "/visa-consulting",
			placement: "feed-middle",
			targetCategories: ["settlement"],
			targetPages: ["explore"],
			weight: 4,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},

		// ========================================
		// FEED PLACEMENT - Corporate Hiring
		// ========================================

		{
			id: "ad000000-0000-0000-0000-000000000012",
			title: "Mercari - Backend Engineer",
			description:
				"Join Mercari's global team! Backend Engineer position with remote work options. Go, Kubernetes, Microservices.",
			imageUrl: "/images/ads/feed/mercari.png",
			ctaText: "Apply Now",
			ctaUrl: "https://careers.mercari.com",
			placement: "feed-middle",
			targetCategories: ["community", "dashboard"],
			targetPages: ["explore", "roadmap", "detail"],
			weight: 5,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000013",
			title: "Rakuten - Frontend Engineer",
			description:
				"Global team at Rakuten is hiring! Frontend Engineer with React, TypeScript, AWS. English proficiency required.",
			imageUrl: "/images/ads/feed/rakuten.png",
			ctaText: "View Position",
			ctaUrl: "https://rakuten.careers",
			placement: "feed-middle",
			targetCategories: ["community"],
			targetPages: ["explore", "detail"],
			weight: 5,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000014",
			title: "LINE - Full Stack Developer",
			description:
				"LINE Tokyo office is expanding! Full Stack Developer role. Node.js, Kotlin, Spring Boot expertise needed.",
			imageUrl: "/images/ads/feed/line.png",
			ctaText: "Learn More",
			ctaUrl: "https://linecorp.com/career",
			placement: "feed-middle",
			targetCategories: ["dashboard"],
			targetPages: ["home", "roadmap"],
			weight: 4,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000015",
			title: "CyberAgent - DevOps Engineer",
			description:
				"Join AbemaTV team at CyberAgent! DevOps Engineer with Docker, Kubernetes, Terraform. Cutting-edge streaming platform.",
			imageUrl:
				"/images/ads/feed/cyberagent_hiring_feed_1767362544733_16-9.png",
			ctaText: "Apply Now",
			ctaUrl: "https://cyberagent.careers",
			placement: "feed-middle",
			targetCategories: ["community"],
			targetPages: ["explore", "detail"],
			weight: 4,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000016",
			title: "DeNA - Game Backend Engineer",
			description:
				"Create next-gen mobile games at DeNA! Game Backend Engineer position. Unity, C#, PostgreSQL. Competitive salary.",
			imageUrl: "/images/ads/feed/dena_hiring_feed_1767362566549_16-9.png",
			ctaText: "Join Our Team",
			ctaUrl: "https://dena.careers",
			placement: "feed-middle",
			targetCategories: ["community", "dashboard"],
			targetPages: ["explore", "detail"],
			weight: 4,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},

		// ========================================
		// SIDEBAR PLACEMENT - Platform Services
		// ========================================

		{
			id: "ad000000-0000-0000-0000-000000000017",
			title: "1:1 멘토링",
			description: "일본 취업 성공률 2배 향상",
			imageUrl: "/images/ads/sidebar/mentor.png",
			ctaText: "시작하기",
			ctaUrl: "/mentoring",
			placement: "sidebar",
			targetCategories: ["community"],
			targetPages: ["detail"],
			weight: 4,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000018",
			title: "정착 가이드",
			description: "필수 절차 체크리스트",
			imageUrl: "/images/ads/sidebar/settlement.png",
			ctaText: "확인하기",
			ctaUrl: "/settlement",
			placement: "sidebar",
			targetCategories: ["community"],
			targetPages: ["detail"],
			weight: 3,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000019",
			title: "일본어 학습",
			description: "JLPT N1 합격까지",
			imageUrl: "/images/ads/sidebar/japanese-learning.png",
			ctaText: "학습 시작",
			ctaUrl: "/japanese-course",
			placement: "sidebar",
			targetCategories: ["community"],
			targetPages: ["detail"],
			weight: 2,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},

		// ========================================
		// SIDEBAR PLACEMENT - Corporate Hiring
		// ========================================

		{
			id: "ad000000-0000-0000-0000-000000000020",
			title: "Mercari Hiring",
			description: "Backend Engineer - Remote OK",
			imageUrl: "/images/ads/sidebar/mercari.png",
			ctaText: "Apply",
			ctaUrl: "https://careers.mercari.com",
			placement: "sidebar",
			targetCategories: ["community"],
			targetPages: ["detail"],
			weight: 5,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000021",
			title: "LINE Careers",
			description: "Full Stack Developer - Tokyo",
			imageUrl: "/images/ads/sidebar/line.png",
			ctaText: "Join Us",
			ctaUrl: "https://linecorp.com/career",
			placement: "sidebar",
			targetCategories: ["community"],
			targetPages: ["detail"],
			weight: 5,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},

		// ========================================
		// TEXT-ONLY ADS (No images)
		// ========================================

		{
			id: "ad000000-0000-0000-0000-000000000022",
			title: "Japan IT Job에 오신 것을 환영합니다!",
			description:
				"커리어 진단부터 멘토링, 정착 가이드까지. 일본 IT 취업의 모든 과정을 함께합니다.",
			imageUrl: null,
			ctaText: "시작하기",
			ctaUrl: "/onboarding",
			placement: "feed-middle",
			targetCategories: null,
			targetPages: ["explore"],
			weight: 2,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000023",
			title: "입사지원 현황을 한눈에",
			description:
				"지원한 회사들의 전형 단계를 시각적으로 관리하고, 다음 액션 아이템을 놓치지 마세요.",
			imageUrl: null,
			ctaText: "파이프라인 보기",
			ctaUrl: "/pipeline",
			placement: "inline",
			targetCategories: ["community"],
			targetPages: ["explore", "detail"],
			weight: 2,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
		{
			id: "ad000000-0000-0000-0000-000000000024",
			title: "맞춤형 로드맵으로 체계적인 준비",
			description:
				"당신의 커리어 레벨과 목표에 맞춘 개인화된 로드맵을 받아보세요. AI가 추천하는 학습 경로!",
			imageUrl: null,
			ctaText: "로드맵 확인하기",
			ctaUrl: "/roadmap",
			placement: "sidebar",
			targetCategories: ["dashboard"],
			targetPages: ["home"],
			weight: 2,
			status: "active",
			startDate: now,
			endDate: oneMonthFromNow,
		},
	];

	for (const ad of ads) {
		await db
			.insert(houseAds)
			.values(ad)
			.onConflictDoUpdate({
				target: houseAds.id,
				set: {
					title: ad.title,
					description: ad.description,
					imageUrl: ad.imageUrl,
					ctaText: ad.ctaText,
					ctaUrl: ad.ctaUrl,
					placement: ad.placement,
					targetCategories: ad.targetCategories,
					targetPages: ad.targetPages,
					weight: ad.weight,
					status: ad.status,
					startDate: ad.startDate,
					endDate: ad.endDate,
					updatedAt: new Date(),
				},
			});
	}

	console.log(`✅ Created/Updated ${ads.length} house ads`);
	console.log(
		`   📊 Feed ads: ${ads.filter((a) => a.placement?.startsWith("feed")).length}`,
	);
	console.log(
		`   📊 Sidebar ads: ${ads.filter((a) => a.placement === "sidebar").length}`,
	);
	console.log(
		`   📊 Inline ads: ${ads.filter((a) => a.placement === "inline").length}`,
	);
}
