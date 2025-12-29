import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import {
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import pg from "pg";

// Define table inline to avoid ESM import issues
const roadmapTemplates = pgTable("roadmap_templates", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	category: text("category").notNull(),
	estimatedMinutes: integer("estimated_minutes").notNull().default(60),
	priority: text("priority").notNull().default("normal"),
	orderIndex: integer("order_index").notNull().default(0),
	targetJobFamilies: jsonb("target_job_families").$type<string[] | null>(),
	targetLevels: jsonb("target_levels").$type<string[] | null>(),
	targetJpLevels: jsonb("target_jp_levels").$type<string[] | null>(),
	targetCities: jsonb("target_cities").$type<string[] | null>(),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const templates = [
	// === Learning Tasks (4) ===
	{
		title: "기술 스택 현대화",
		description:
			"일본 IT 시장에서 수요가 높은 기술 스택을 학습합니다. Frontend는 React/Next.js, Backend는 Node.js/Go/Java가 인기입니다.",
		category: "Learning",
		estimatedMinutes: 120,
		priority: "normal",
		orderIndex: 1,
		targetJobFamilies: ["frontend", "fullstack"],
		targetLevels: null,
		targetJpLevels: null,
		targetCities: null,
		isActive: true,
	},
	{
		title: "코딩 테스트 준비",
		description:
			"일본 IT 기업 면접에서는 코딩 테스트가 일반적입니다. LeetCode 또는 AtCoder에서 주 3회 연습하세요.",
		category: "Learning",
		estimatedMinutes: 180,
		priority: "urgent",
		orderIndex: 2,
		targetJobFamilies: null,
		targetLevels: ["junior", "mid"],
		targetJpLevels: null,
		targetCities: null,
		isActive: true,
	},
	{
		title: "일본어 업무 표현 학습",
		description:
			"敬語(경어)와 기술 관련 일본어 표현을 학습합니다. 회의, 이메일, 슬랙 메시지에서 자주 사용되는 표현을 익히세요.",
		category: "Learning",
		estimatedMinutes: 90,
		priority: "normal",
		orderIndex: 3,
		targetJobFamilies: null,
		targetLevels: null,
		targetJpLevels: ["N3", "N4", "N5", "None"],
		targetCities: null,
		isActive: true,
	},
	{
		title: "영문 이력서 작성",
		description:
			"ATS(지원자 추적 시스템) 최적화된 영문 이력서를 작성합니다. 정량적 성과 중심으로 작성하세요.",
		category: "Learning",
		estimatedMinutes: 90,
		priority: "urgent",
		orderIndex: 4,
		targetJobFamilies: null,
		targetLevels: null,
		targetJpLevels: null,
		targetCities: null,
		isActive: true,
	},

	// === Application Tasks (4) ===
	{
		title: "LinkedIn 프로필 최적화",
		description:
			"'Japan', 'IT', 'software engineer' 등 키워드를 포함하여 LinkedIn 프로필을 최적화합니다. 헤드라인과 About 섹션을 업데이트하세요.",
		category: "Application",
		estimatedMinutes: 45,
		priority: "normal",
		orderIndex: 5,
		targetJobFamilies: null,
		targetLevels: null,
		targetJpLevels: null,
		targetCities: null,
		isActive: true,
	},
	{
		title: "Wantedly/Green 계정 생성",
		description:
			"일본 로컬 채용 플랫폼에 프로필을 등록합니다. Wantedly는 스타트업, Green은 IT 전반에 강합니다.",
		category: "Application",
		estimatedMinutes: 30,
		priority: "normal",
		orderIndex: 6,
		targetJobFamilies: null,
		targetLevels: null,
		targetJpLevels: null,
		targetCities: ["Tokyo", "Osaka"],
		isActive: true,
	},
	{
		title: "포트폴리오 사이트 제작",
		description:
			"개인 프로젝트 3개 이상을 포함한 포트폴리오 사이트를 제작합니다. Vercel/Netlify로 무료 배포하세요.",
		category: "Application",
		estimatedMinutes: 240,
		priority: "normal",
		orderIndex: 7,
		targetJobFamilies: ["frontend", "fullstack"],
		targetLevels: null,
		targetJpLevels: null,
		targetCities: null,
		isActive: true,
	},
	{
		title: "추천서 확보",
		description:
			"전 동료, 상사, 또는 클라이언트로부터 LinkedIn 추천 또는 추천서를 받습니다. 시니어 이상 권장.",
		category: "Application",
		estimatedMinutes: 60,
		priority: "low",
		orderIndex: 8,
		targetJobFamilies: null,
		targetLevels: ["mid", "senior", "lead"],
		targetJpLevels: null,
		targetCities: null,
		isActive: true,
	},

	// === Preparation Tasks (4) ===
	{
		title: "모의 면접 연습",
		description:
			"STAR 기법(Situation, Task, Action, Result)을 사용하여 행동 면접에 대비합니다. 친구나 멘토와 연습하세요.",
		category: "Preparation",
		estimatedMinutes: 120,
		priority: "urgent",
		orderIndex: 9,
		targetJobFamilies: null,
		targetLevels: null,
		targetJpLevels: null,
		targetCities: null,
		isActive: true,
	},
	{
		title: "연봉 협상 리서치",
		description:
			"Tokyo 지역 개발자 시장 연봉을 조사합니다. OpenSalary, Glassdoor Japan 등을 참고하세요.",
		category: "Preparation",
		estimatedMinutes: 60,
		priority: "normal",
		orderIndex: 10,
		targetJobFamilies: null,
		targetLevels: null,
		targetJpLevels: null,
		targetCities: null,
		isActive: true,
	},
	{
		title: "관심 회사 문화 조사",
		description:
			"지원하고 싶은 회사 5개를 선정하고, 기업 문화, 기술 스택, 팀 구성을 조사합니다.",
		category: "Preparation",
		estimatedMinutes: 90,
		priority: "normal",
		orderIndex: 11,
		targetJobFamilies: null,
		targetLevels: null,
		targetJpLevels: null,
		targetCities: null,
		isActive: true,
	},
	{
		title: "비자 요건 확인",
		description:
			"고도인재(HSP) 비자 포인트를 계산하고, 필요한 서류를 확인합니다. 80점 이상이면 HSP 비자 자격이 됩니다.",
		category: "Preparation",
		estimatedMinutes: 45,
		priority: "urgent",
		orderIndex: 12,
		targetJobFamilies: null,
		targetLevels: ["senior", "lead"],
		targetJpLevels: null,
		targetCities: null,
		isActive: true,
	},

	// === Settlement Tasks (3) ===
	{
		title: "임시 숙소 예약",
		description:
			"도착 후 2주간 머물 숙소를 예약합니다. Airbnb, 서비스 아파트, 또는 게스트하우스를 고려하세요.",
		category: "Settlement",
		estimatedMinutes: 60,
		priority: "urgent",
		orderIndex: 13,
		targetJobFamilies: null,
		targetLevels: null,
		targetJpLevels: null,
		targetCities: null,
		isActive: true,
	},
	{
		title: "핸드폰 계약 조사",
		description:
			"외국인이 가입 가능한 통신사를 조사합니다. Rakuten Mobile, IIJmio 등이 SIM만 계약에 유리합니다.",
		category: "Settlement",
		estimatedMinutes: 30,
		priority: "normal",
		orderIndex: 14,
		targetJobFamilies: null,
		targetLevels: null,
		targetJpLevels: null,
		targetCities: ["Tokyo"],
		isActive: true,
	},
	{
		title: "은행 계좌 개설 조사",
		description:
			"외국인 개설이 가능한 은행을 조사합니다. Wise, Yucho, SMBC 등을 비교하세요.",
		category: "Settlement",
		estimatedMinutes: 45,
		priority: "normal",
		orderIndex: 15,
		targetJobFamilies: null,
		targetLevels: null,
		targetJpLevels: null,
		targetCities: null,
		isActive: true,
	},
];

async function seedTemplates() {
	console.log("🌱 Seeding roadmap templates...");

	for (const template of templates) {
		await db.insert(roadmapTemplates).values(template).onConflictDoNothing();
	}

	console.log(`✅ Seeded ${templates.length} roadmap templates`);
	await pool.end();
}

seedTemplates()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error("❌ Seed failed:", err);
		process.exit(1);
	});
