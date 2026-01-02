export const TECH_STACKS = [
	{ value: "react", label: "React" },
	{ value: "vue", label: "Vue.js" },
	{ value: "angular", label: "Angular" },
	{ value: "nextjs", label: "Next.js" },
	{ value: "nodejs", label: "Node.js" },
	{ value: "spring", label: "Spring Boot" },
	{ value: "django", label: "Django" },
	{ value: "aws", label: "AWS" },
	{ value: "docker", label: "Docker" },
	{ value: "kubernetes", label: "Kubernetes" },
	{ value: "flutter", label: "Flutter" },
	{ value: "swift", label: "Swift" },
	{ value: "kotlin", label: "Kotlin" },
] as const;

export const WORK_VALUES = [
	{ value: "growth", label: "성장", desc: "기술적 도전과 배움" },
	{ value: "money", label: "연봉", desc: "높은 보상과 인센티브" },
	{ value: "wlb", label: "워라밸", desc: "일과 삶의 균형" },
	{ value: "culture", label: "조직문화", desc: "수평적이고 열린 분위기" },
	{ value: "stability", label: "안정성", desc: "고용 불안 없음" },
	{ value: "global", label: "글로벌", desc: "다국적 팀 경험" },
] as const;

export const TIMELINE_OPTIONS = [
	{ value: "ASAP", label: "급함 (3개월 내)", desc: "빠른 취업 희망" },
	{ value: "3M", label: "3~6개월", desc: "여유 있게 준비" },
	{ value: "6M", label: "6개월~1년", desc: "충분한 학습 후" },
	{ value: "1Y", label: "1년 이상", desc: "장기적인 계획" },
] as const;

export const RESIDENCE_OPTIONS = [
	{ value: "KR", label: "한국 거주" },
	{ value: "JP", label: "일본 거주" },
	{ value: "Other", label: "그 외 해외" },
] as const;

export const DEGREE_OPTIONS = [
	{ value: "bachelor", label: "4년제 학사 이상" },
	{ value: "associate", label: "2/3년제 전문학사" },
	{ value: "none", label: "학위 없음 (고졸 등)" },
] as const;

export const JOB_FAMILIES = [
	{ value: "frontend", label: "프론트엔드 개발자" },
	{ value: "backend", label: "백엔드 개발자" },
	{ value: "mobile", label: "모바일 개발자" },
	{ value: "data", label: "데이터 사이언티스트/엔지니어" },
	{ value: "infra", label: "인프라/DevOps 엔지니어" },
	{ value: "fullstack", label: "풀스택 개발자" },
] as const;

export const LEVELS = [
	{ value: "junior", label: "주니어", desc: "1-3년차" },
	{ value: "mid", label: "미들", desc: "4-6년차" },
	{ value: "senior", label: "시니어", desc: "7년차 이상" },
	{ value: "lead", label: "리드", desc: "팀 리딩 경험" },
] as const;

export const JP_LEVELS = [
	{ value: "None", label: "못함" },
	{ value: "N5", label: "N5" },
	{ value: "N4", label: "N4" },
	{ value: "N3", label: "N3" },
	{ value: "N2", label: "N2" },
	{ value: "N1", label: "N1" },
	{ value: "Native", label: "원어민 수준" },
] as const;

export const EN_LEVELS = [
	{ value: "Basic", label: "기초 (읽기만 가능)" },
	{ value: "Conversational", label: "일상 회화 가능" },
	{ value: "Business", label: "비즈니스 회화 가능" },
	{ value: "Native", label: "원어민 수준" },
] as const;

export const CITIES = [
	{ value: "Tokyo", label: "도쿄 (Tokyo)" },
	{ value: "Osaka", label: "오사카 (Osaka)" },
	{ value: "Fukuoka", label: "후쿠오카 (Fukuoka)" },
	{ value: "Kyoto", label: "교토 (Kyoto)" },
	{ value: "Remote", label: "풀 리모트 (일본 내)" },
] as const;

export const ASSESSMENT_STEPS = [
	{ id: 1, label: "경력 정보" },
	{ id: 2, label: "어학 능력" },
	{ id: 3, label: "기술 스택" },
	{ id: 4, label: "현재 상황" },
	{ id: 5, label: "직업 가치관" },
	{ id: 6, label: "선호도" },
] as const;
