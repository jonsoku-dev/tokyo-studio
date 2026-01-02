import { fakerKO as faker } from "@faker-js/faker";
import * as schema from "@itcom/db/schema";
import { count, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
	COMMUNITY_CATEGORIES,
	seedCommunityCategories,
} from "./community-categories";

// --- Realistic Data Sets ---

interface SeedPost {
	title: string;
	content: string;
	category: string; // for legacy field
	authorEmail?: string; // Optional, will random pick if undefined
	comments: { content: string; authorEmail?: string }[];
}

interface SeedCommunity {
	slug: string;
	name: string;
	description: string;
	categorySlug: string;
	ownerEmail?: string;
	iconUrl?: string; // Optional custom icon
	posts: SeedPost[];
}

// 1. Define Categories Topics for Random Generation
const CATEGORY_TOPICS: Record<string, string[]> = {
	tech: [
		"IT뉴스",
		"PC조립",
		"서버포럼",
		"보안",
		"오픈소스",
		"알고리즘",
		"코드리뷰",
		"사이드프로젝트",
		"해커톤",
		"개발자책",
		"개발장비",
		"개발유머",
		"맥북",
		"리눅스",
		"윈도우",
	],
	frontend: [
		"React",
		"Vue.js",
		"Angular",
		"Svelte",
		"Next.js",
		"TypeScript",
		"TailwindCSS",
		"WebGL",
		"웹접근성",
		"UI/UX",
		"프론트엔드면접",
		"상태관리",
		"테스팅",
		"퍼포먼스",
		"마이크로프론트엔드",
	],
	backend: [
		"Spring Boot",
		"Node.js",
		"Django",
		"GoLang",
		"NestJS",
		"FastAPI",
		"MSA",
		"DB설계",
		"SQL",
		"Redis",
		"Kafka",
		"AWS",
		"Docker",
		"Kubernetes",
		"시스템설계",
	],
	mobile: [
		"iOS",
		"Android",
		"Flutter",
		"ReactNative",
		"Swift",
		"Kotlin",
		"모바일UI",
		"앱배포",
		"앱수익화",
		"크로스플랫폼",
		"모바일게임개발",
	],
	"ai-ml": [
		"ChatGPT",
		"LLM",
		"StableDiffusion",
		"LangChain",
		"Python",
		"데이터분석",
		"딥러닝",
		"논문리뷰",
		"RAG",
		"프롬프트",
		"AI윤리",
		"Kaggle",
		"MLOps",
	],
	devops: [
		"AWS",
		"GCP",
		"Azure",
		"CI/CD",
		"Terraform",
		"Jenkins",
		"GithubActions",
		"모니터링",
		"SRE",
		"네트워크",
		"보안그룹",
		"서버비용",
	],
	career: [
		"이직상담",
		"연봉협상",
		"면접후기",
		"이력서첨삭",
		"포트폴리오",
		"재택근무",
		"외국계기업",
		"일본취업",
		"미국취업",
		"개발자성장",
		"번아웃",
		"사내정치",
		"팀장리더십",
	],
	freelance: [
		"프리랜서단가",
		"계약서작성",
		"세금신고",
		"개인사업자",
		"크몽",
		"원티드긱스",
		"외주구하기",
		"미수금해결",
		"디지털노마드",
		"코워킹스페이스",
	],
	startup: [
		"창업아이템",
		"투자유치",
		"팀빌딩",
		"스톡옵션",
		"피봇팅",
		"그로스해킹",
		"마케팅",
		"사업계획서",
		"정부지원사업",
		"실패경험",
		"유니콘",
		"J커브",
	],
	visa: [
		"취업비자",
		"영주권",
		"배우자비자",
		"고도인재",
		"귀화",
		"비자갱신",
		"행정서사",
		"세금납부",
		"연말정산",
		"주민세",
		"전출신고",
		"퇴직금",
	],
	life: [
		"맛집추천",
		"쇼핑정보",
		"날씨",
		"교통",
		"병원/약국",
		"미용실",
		"동호회",
		"육아",
		"반려동물",
		"연애/결혼",
		"한인마트",
		"일본물가",
		"편의점",
	],
	housing: [
		"야칭",
		"보증회사",
		"UR공단",
		"쉐어하우스",
		"이사준비",
		"가구가전",
		"인테리어",
		"층간소음",
		"동네추천",
		"부동산용어",
		"매매",
		"주택론",
	],
	finance: [
		"NISA",
		"iDeCo",
		"주식투자",
		"환율",
		"송금",
		"신용카드",
		"포인트적립",
		"가계부",
		"절세",
		"부업수익",
		"후루사토납세",
	],
	language: [
		"JLPT",
		"비즈니스일본어",
		"회화스터디",
		"일본어강의",
		"한자공부",
		"영어공부",
		"언어교환",
		"일본어표현",
		"번역기",
		"통번역",
	],
	gaming: [
		"PS5",
		"NintendoSwitch",
		"Steam",
		"롤",
		"오버워치",
		"발로란트",
		"몬스터헌터",
		"젤다",
		"포켓몬",
		"게임할인",
		"게임추천",
		"레트로게임",
	],
	gadgets: [
		"데스크셋업",
		"키보드",
		"마우스",
		"모니터",
		"헤드폰",
		"아이패드",
		"갤럭시",
		"아이폰",
		"스마트홈",
		"카메라",
		"드론",
		"웨어러블",
	],
	travel: [
		"도쿄여행",
		"오사카여행",
		"홋카이도",
		"규슈",
		"온천여행",
		"료칸",
		"호텔예약",
		"항공권",
		"기차여행",
		"렌트카",
		"캠핑",
		"등산",
		"축제",
	],
	general: [
		"자유수다",
		"고민상담",
		"유머",
		"공포",
		"감동",
		"이슈",
		"정치",
		"경제",
		"문화",
		"역사",
		"오늘의운세",
		"MBTI",
	],
};

// 2. Core Hand-crafted Communities (High Quality)
const REAL_COMMUNITIES_DATA: SeedCommunity[] = [
	// Tech > Frontend
	{
		slug: "react-users",
		name: "React & Next.js 모임",
		description: "React, Next.js, 생태계 동향을 공유하는 모임입니다.",
		categorySlug: "frontend",
		ownerEmail: "kim@example.com",
		posts: [
			{
				title: "Next.js 14 App Router 도입 후기 (장단점 정리)",
				content:
					"이번 프로젝트에 App Router를 도입해봤는데, Server Component 개념 잡는게 꽤 어렵네요. 하지만 렌더링 성능은 확실히 좋아진 것 같습니다. 특히 초기 로딩 속도와 SEO 측면에서 체감이 큽니다. 다만 기존 라이브러리와의 호환성 문제는 여전히 존재하네요.",
				category: "tech",
				authorEmail: "kim@example.com", // 김개발
				comments: [
					{
						content:
							"저도 마이그레이션 고민 중인데 도움 되네요! 캐싱 설정은 어떠셨나요?",
						authorEmail: "lee@example.com",
					},
					{
						content:
							"RSC 디버깅이 진짜 헬이더라고요 ㅠㅠ 다들 어떻게 하시나요?",
						authorEmail: "park@example.com",
					},
					{
						content: "결국 Pages Router로 돌아왔습니다...",
						authorEmail: "choi@example.com",
					},
				],
			},
			{
				title: "상태관리 라이브러리 뭐 쓰시나요? (Zustand vs Jotai)",
				content:
					"Redux는 이제 너무 무거운 것 같고, Zustand랑 Jotai 중에 고민입니다. 일본 현업에서는 보통 뭐 많이 쓰나요? 개인적으로는 Zustand가 좀 더 직관적인 것 같습니다만.",
				category: "qna",
				authorEmail: "choi@example.com",
				comments: [
					{
						content: "저희 회사는 아직도 Redux Toolkit 씁니다... 레거시의 늪",
						authorEmail: "kim@example.com",
					},
					{
						content:
							"Zustand 강추합니다. 보일러플레이트가 거의 없어서 너무 편해요.",
						authorEmail: "jung@example.com",
					},
					{
						content: "Recoil 쓰다가 Jotai로 넘어왔는데 만족합니다.",
						authorEmail: "lee@example.com",
					},
				],
			},
		],
	},
	// Tech > Backend
	{
		slug: "spring-boot-korea",
		name: "Spring Boot 개발자",
		description: "자바/스프링 백엔드 개발자들을 위한 공간입니다.",
		categorySlug: "backend",
		ownerEmail: "kim@example.com",
		posts: [
			{
				title: "일본 SI는 아직도 Java 8을 많이 쓰나요?",
				content:
					"한국에서는 이제 17이나 21로 많이 넘어가는 추세인데, 일본 취업 준비하면서 보니 8이나 11 요구하는 공고가 꽤 많네요. 실제로 현업 분위기가 어떤지 궁금합니다.",
				category: "qna",
				authorEmail: "lee@example.com",
				comments: [
					{
						content:
							"금융권이나 공공 프로젝트는 아직 8 많이 씁니다. 보수적이에요.",
						authorEmail: "park@example.com",
					},
					{
						content:
							"최근 웹서비스 기업들은 코틀린 + 최신 자바 많이 도입하고 있어요! 너무 걱정 마세요.",
						authorEmail: "kim@example.com",
					},
				],
			},
			{
				title: "JPA N+1 문제 해결 경험 공유합니다",
				content:
					"Fetch Join이랑 EntityGraph 써서 해결했는데, 다들 어떤 방식 선호하시나요? QueryDSL이 답일까요?",
				category: "tech",
				authorEmail: "kim@example.com",
				comments: [
					{
						content: "QueryDSL이 정신건강에 좋습니다.",
						authorEmail: "choi@example.com",
					},
				],
			},
		],
	},
	// Career > Career General
	{
		slug: "tokyo-dev-career",
		name: "도쿄 개발자 커리어",
		description: "도쿄 지역 개발자들의 이직, 연봉, 커리어 고민 상담소",
		categorySlug: "career",
		ownerEmail: "park@example.com",
		posts: [
			{
				title: "3년차 백엔드 개발자 연봉 600만엔 적정한가요?",
				content:
					"현재 한국에서 3년차이고 일본 이직 오퍼를 받았는데 600만엔 불렀습니다. 도쿄 거주 기준 생활비 생각하면 적정한 수준인지 감이 안 오네요. 미혼이고 세타가야구 쪽 생각 중입니다.",
				category: "career",
				authorEmail: "park@example.com",
				comments: [
					{
						content:
							"어떤 기업 규모냐에 따라 다르지만 3년차 600이면 나쁘지 않은 시작입니다.",
						authorEmail: "kim@example.com",
					},
					{
						content:
							"월세랑 세금 떼면 생각보다 빠듯할 수 있어요. 주택 수당 있는지 꼭 확인하세요.",
						authorEmail: "choi@example.com",
					},
					{
						content:
							"야근 수당 포함인지 별도인지가 중요합니다. 미나시 잔업 확인 필수!",
						authorEmail: "jung@example.com",
					},
				],
			},
			{
				title: "일본어 N2인데 면접 가능할까요?",
				content:
					"기술 면접은 영어로 본다고 쳐도, 임원 면접이나 컬처핏이 걱정입니다. N2 턱걸이인데 실제 비즈니스 회화는 많이 버벅거립니다.",
				category: "qna",
				authorEmail: "jung@example.com",
				comments: [
					{
						content: "N2면 충분합니다! 기술 용어 위주로 준비하면 통할 거예요.",
						authorEmail: "lee@example.com",
					},
					{
						content:
							"저도 N2로 왔는데 와서 부딪히며 배우는 게 더 큽니다. 화이팅!",
						authorEmail: "kim@example.com",
					},
					{
						content:
							"요즘은 기업들이 한국인 채용에 적극적이라 언어보다 실력을 봅니다.",
						authorEmail: "park@example.com",
					},
				],
			},
		],
	},
	// Life > Housing
	{
		slug: "tokyo-housing",
		name: "도쿄 집구하기",
		description: "야칭, 보증회사, 이사 팁 공유",
		categorySlug: "housing",
		ownerEmail: "choi@example.com",
		posts: [
			{
				title: "UR공단주택 들어가고 싶은데 대기가 기네요",
				content:
					"레이킹/시키킴 없고 보증인 필요 없어서 UR 알아보고 있는데 인기 매물은 나오자마자 나가네요. 팁 있으신가요? 대행 업체 쓰는 게 나을까요?",
				category: "general",
				authorEmail: "choi@example.com",
				comments: [
					{
						content:
							"매일 아침 9시에 사이트 새로고침 하는 수밖에 없어요 ㅠㅠ 전쟁입니다.",
						authorEmail: "park@example.com",
					},
					{
						content: "부동산 가서 직접 대기 걸어두는 것도 방법입니다.",
						authorEmail: "jung@example.com",
					},
				],
			},
			{
				title: "외국인 입주 가능한 쉐어하우스 추천해주세요",
				content:
					"초기 비용 아끼려고 쉐어하우스 알아보는데, 오크하우스랑 소셜아파트 중에 어디가 나을까요?",
				category: "qna",
				authorEmail: "lee@example.com",
				comments: [
					{
						content:
							"소셜아파트가 시설은 좋은데 비싸고, 오크하우스가 가성비는 좋습니다.",
						authorEmail: "kim@example.com",
					},
				],
			},
		],
	},
	// Life > General
	{
		slug: "life-in-japan",
		name: "슬기로운 일본생활",
		description: "일본 생활 꿀팁, 맛집, 일상 이야기",
		categorySlug: "life",
		ownerEmail: "lee@example.com",
		posts: [
			{
				title: "편의점 오뎅 시즌이 돌아왔네요 🍢",
				content:
					"퇴근길에 세븐일레븐 들려서 무랑 곤약 사먹었는데 역시 맛있습니다. 다들 최애 오뎅 추천해주세요! 저는 유부주머니가 제일 좋더라고요.",
				category: "general",
				authorEmail: "lee@example.com",
				comments: [
					{
						content: "저는 소세지랑 실곤약이요! 국물이 끝내줍니다.",
						authorEmail: "choi@example.com",
					},
					{
						content: "국물에 우동 사리 넣어 먹으면 끝장남",
						authorEmail: "kim@example.com",
					},
					{
						content: "로손 오뎅도 맛있어요. 꼬치류가 다양함.",
						authorEmail: "jung@example.com",
					},
				],
			},
			{
				title: "주말에 근교 여행 갈만한 곳 추천받아요",
				content:
					"도쿄에서 당일치기나 1박 2일로 가벼운 온천 여행 다녀오고 싶습니다. 하코네 말고 다른 곳 있을까요? 사람 너무 많은 곳은 피하고 싶어요.",
				category: "general",
				authorEmail: "kim@example.com", // 김개발
				comments: [
					{
						content: "아타미 어떠세요? 바다도 가깝고 불꽃놀이도 해요.",
						authorEmail: "lee@example.com",
					},
					{
						content: "가와구치코 가서 후지산 보고 오는 것도 좋습니다.",
						authorEmail: "jung@example.com",
					},
					{
						content: "쿠사츠 온천 강추합니다. 물이 진짜 좋아요.",
						authorEmail: "choi@example.com",
					},
				],
			},
		],
	},
	// Hobby > Gaming
	{
		slug: "console-gamers",
		name: "콘솔 게임 라이프",
		description: "PS5, Switch, Xbox 게이머들의 모임",
		categorySlug: "gaming",
		ownerEmail: "jung@example.com",
		posts: [
			{
				title: "몬헌 와일즈 베타 해보셨나요?",
				content:
					"이번에 그래픽 진짜 미쳤네요. 근데 프레임 드랍이 좀 걱정되는데... 다들 어떻게 생각하시나요? 저는 일단 예구했습니다.",
				category: "general",
				authorEmail: "jung@example.com", // 정후쿠오카
				comments: [
					{
						content: "프로 버전으로 돌려야 할 듯요 ㅠㅠ",
						authorEmail: "kim@example.com",
					},
					{ content: "PC버전 존버합니다...", authorEmail: "park@example.com" },
					{
						content: "무기 뭐 쓰시나요? 저는 태도 외길입니다.",
						authorEmail: "choi@example.com",
					},
				],
			},
		],
	},
	// Tech > AI
	{
		slug: "ai-study",
		name: "LLM & AI 스터디",
		description: "LLM, RAG, 프롬프트 엔지니어링 공부 모임",
		categorySlug: "ai-ml",
		ownerEmail: "kim@example.com",
		posts: [
			{
				title: "RAG 구현할 때 Chunking 전략 어떻게 가져가시나요?",
				content:
					"문맥 유지를 위해 오버랩을 20% 정도 주고 있는데, 더 좋은 방법이 있을까요? 시멘틱 청킹 도입해보신 분 계신가요?",
				category: "tech",
				authorEmail: "kim@example.com",
				comments: [
					{
						content:
							"LangChain 쓰시면 RecursiveCharacterTextSplitter가 무난합니다.",
						authorEmail: "park@example.com",
					},
				],
			},
		],
	},
];

export async function seedCommunity(db: NodePgDatabase<typeof schema>) {
	console.log("🌱 Seeding Community (Expanded Realistic Data)...");

	// 1. Get existing users and map by email
	const users = await db.select().from(schema.users);
	if (users.length === 0) {
		console.warn("⚠️ No users found. Skipping community seed.");
		return;
	}

	const userMap = new Map<string, string>(); // email -> id
	const userEmails = users.map((u) => u.email);
	for (const u of users) {
		userMap.set(u.email, u.id);
	}

	// Fallback user if email not found (admin)
	const adminUserId = userMap.get("test@example.com") || users[0].id;
	const fallbackUserId = adminUserId;

	// 2. Cleanup (Wipe existing community data for fresh realistic seed)
	console.log("🗑️ Cleaning up existing community data...");
	await db.delete(schema.communityComments);
	await db.delete(schema.communityPosts);
	await db.delete(schema.communityRules);
	await db.delete(schema.communityMembers);
	await db.delete(schema.communities);

	// 3. Seed Categories
	await seedCommunityCategories(db);
	const dbCategories = await db.select().from(schema.communityCategories);
	const categoryMap = new Map(dbCategories.map((c) => [c.slug, c.id]));

	console.log("  📁 Creating realistic communities...");
	const communityMap = new Map<string, string>(); // slug -> id

	// Prepare Combined List: Core + Generated
	const allCommunities: SeedCommunity[] = [...REAL_COMMUNITIES_DATA];

	for (const cat of COMMUNITY_CATEGORIES) {
		const topics = CATEGORY_TOPICS[cat.slug] || ["일반"];
		const coreCount = REAL_COMMUNITIES_DATA.filter(
			(c) => c.categorySlug === cat.slug,
		).length;

		// Target: 6 to 20 communities per category
		const targetCount = faker.number.int({ min: 6, max: 20 });
		const needed = Math.max(0, targetCount - coreCount);

		// Shuffle topics to pick random ones
		const shuffledTopics = faker.helpers.shuffle(topics);

		for (let i = 0; i < needed; i++) {
			const topic = shuffledTopics[i % shuffledTopics.length];
			const adjective = faker.helpers.arrayElement([
				"즐거운",
				"함께하는",
				"열정적인",
				"초보",
				"고수",
				"공유",
				"연구",
				"토론",
				"심층",
				"유용한",
				"궁금한",
			]);
			const suffix = i > shuffledTopics.length ? `-${i}` : ""; // Avoid duplicate slugs

			// Random Owner
			const randomOwnerEmail = faker.helpers.arrayElement(
				userEmails.filter((e) => e !== "test@example.com"),
			);

			const slug =
				`${cat.slug}-${topic.replace(/\//g, "-").replace(/\s+/g, "-")}${suffix}`.toLowerCase();

			// Generate MANY random posts for this generated community (15~40 posts)
			// Use fakerKO for realistic Korean lorem
			const numPosts = faker.number.int({ min: 15, max: 40 });
			const generatedPosts: SeedPost[] = [];

			for (let j = 0; j < numPosts; j++) {
				const postTopic = faker.helpers.arrayElement(topics);
				const title =
					faker.helpers.arrayElement([
						`${postTopic} 질문있습니다`,
						`${postTopic} 관련 이슈 공유`,
						`${postTopic} 꿀팁 정리`,
						`${postTopic} 요즘 어때요?`,
						`${postTopic} 사용기`,
						`${postTopic} 추천 부탁드립니다`,
						`${postTopic} 뉴스`,
						`${postTopic} 고민입니다`,
						`${postTopic} 해결법 아시는 분?`,
						`${postTopic} 스터디 모집`,
					]) +
					" " +
					faker.lorem.words(3); // Add some randomness

				const content = faker.lorem.paragraphs(2, "\n\n");

				generatedPosts.push({
					title: title,
					content: content,
					category: "general",
					authorEmail: faker.helpers.arrayElement(userEmails), // Random author
					comments: Array.from({
						length: faker.number.int({ min: 0, max: 8 }),
					}).map(() => ({
						content: faker.lorem.sentence(),
						authorEmail: faker.helpers.arrayElement(userEmails),
					})),
				});
			}

			allCommunities.push({
				slug,
				name: `${topic} ${adjective} 모임`,
				description: `${cat.name} 카테고리의 ${topic} 주제를 다루는 ${adjective} 커뮤니티입니다. \n\n${faker.lorem.paragraph()}`,
				categorySlug: cat.slug,
				ownerEmail: randomOwnerEmail,
				iconUrl: `https://ui-avatars.com/api/?name=${topic}&background=random&color=fff&length=2`,
				posts: generatedPosts,
			});
		}
	}

	// 4. Create All Communities (Batch Insert Optimized theoretically, but keeping loop for logic safety)
	let communityIndex = 0;
	for (const commData of allCommunities) {
		communityIndex++;
		const categoryId = categoryMap.get(commData.categorySlug);

		// Determine Owner ID
		const ownerId = commData.ownerEmail
			? userMap.get(commData.ownerEmail) || fallbackUserId
			: fallbackUserId;

		// Determine Icon (Fallback if not provided)
		const iconUrl =
			commData.iconUrl ||
			`https://ui-avatars.com/api/?name=${commData.slug}&background=random&color=fff`;

		// Create Community
		let communityId: string;
		try {
			// Try insert, catch slug conflict
			const [created] = await db
				.insert(schema.communities)
				.values({
					slug: commData.slug,
					name: commData.name,
					description: commData.description,
					visibility: "public",
					createdBy: ownerId,
					categoryId: categoryId,
					iconUrl: iconUrl,
					memberCount: 0,
				})
				.onConflictDoNothing()
				.returning(); // safe insert

			if (created) {
				communityId = created.id;
			} else {
				// Should have been wiped, but just in case
				const [existing] = await db
					.select()
					.from(schema.communities)
					.where(eq(schema.communities.slug, commData.slug));
				if (!existing) continue;
				communityId = existing.id;
			}
		} catch (e) {
			console.error(`Failed to create community ${commData.slug}`, e);
			continue;
		}

		if (communityIndex % 10 === 0)
			console.log(
				`    ... Processing community ${communityIndex}/${allCommunities.length}: ${commData.name}`,
			);

		// Add Owner as member
		await db
			.insert(schema.communityMembers)
			.values({
				communityId,
				userId: ownerId,
				role: "owner",
			})
			.onConflictDoNothing();

		communityMap.set(commData.slug, communityId);

		// 5. Create Posts (Batching could be better but let's stick to loop for simplicity in script)
		for (const postData of commData.posts) {
			const authorId = postData.authorEmail
				? userMap.get(postData.authorEmail) || fallbackUserId
				: faker.helpers.arrayElement(Array.from(userMap.values()));

			const createdAt = faker.date.recent({ days: 90 }); // Wider date range
			const [newPost] = await db
				.insert(schema.communityPosts)
				.values({
					communityId,
					title: postData.title,
					content: postData.content,
					category: postData.category, // Legacy
					postType: "text",
					authorId,
					upvotes: faker.number.int({ min: 0, max: 100 }),
					downvotes: faker.number.int({ min: 0, max: 10 }),
					score: faker.number.int({ min: 0, max: 100 }),
					createdAt,
					updatedAt: createdAt,
				})
				.returning();

			// 6. Create Comments
			if (newPost) {
				for (const commentData of postData.comments) {
					const commentAuthorId = commentData.authorEmail
						? userMap.get(commentData.authorEmail) || fallbackUserId
						: faker.helpers.arrayElement(Array.from(userMap.values()));
					const commentCreatedAt = faker.date.between({
						from: createdAt,
						to: new Date(),
					});

					await db.insert(schema.communityComments).values({
						postId: newPost.id,
						content: commentData.content,
						authorId: commentAuthorId,
						upvotes: faker.number.int({ min: 0, max: 20 }),
						createdAt: commentCreatedAt,
						updatedAt: commentCreatedAt,
					});
				}
			}
		}
	}

	// 7. Update member counts
	console.log("  Updating member counts...");
	for (const [_slug, communityId] of communityMap) {
		const memberCountResult = await db
			.select({ count: count() })
			.from(schema.communityMembers)
			.where(eq(schema.communityMembers.communityId, communityId));

		await db
			.update(schema.communities)
			.set({ memberCount: memberCountResult[0]?.count || 0 })
			.where(eq(schema.communities.id, communityId));
	}

	console.log(
		`✅ Seeded realistic communities and posts! Total Communities: ${allCommunities.length}`,
	);
}
