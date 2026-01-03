export const TECH_STACKS = [
	{ value: "react", label: "React" },
	{ value: "vue", label: "Vue.js" },
	{ value: "angular", label: "Angular" },
	{ value: "nextjs", label: "Next.js" },
	{ value: "nodejs", label: "Node.js" },
	{ value: "spring", label: "Spring Boot" },
	{ value: "django", label: "Django" },
	{ value: "rails", label: "Ruby on Rails" },
	{ value: "aws", label: "AWS" },
	{ value: "gcp", label: "GCP" },
	{ value: "docker", label: "Docker" },
	{ value: "kubernetes", label: "Kubernetes" },
	{ value: "flutter", label: "Flutter" },
	{ value: "swift", label: "Swift" },
	{ value: "kotlin", label: "Kotlin" },
	{ value: "python", label: "Python (Data/ML)" },
	{ value: "go", label: "Go" },
	{ value: "rust", label: "Rust" },
] as const;

export const WORK_VALUES = [
	{
		value: "growth",
		label: "성장 가능성",
		desc: "지속적인 기술 성장과 전문성 향상 기회",
	},
	{
		value: "money",
		label: "높은 보상",
		desc: "업계 상위 수준의 연봉과 스톡옵션",
	},
	{
		value: "wlb",
		label: "워라밸",
		desc: "유연한 근무 시간과 충분한 휴식 보장",
	},
	{
		value: "culture",
		label: "조직 문화",
		desc: "상호 존중하고 자율적인 수평적 분위기",
	},
	{
		value: "stability",
		label: "안정성",
		desc: "탄탄한 비즈니스 모델과 재무 건전성",
	},
	{
		value: "global",
		label: "글로벌 환경",
		desc: "다국적 동료들과 영어/일본어로 협업",
	},
] as const;

export const TIMELINE_OPTIONS = [
	{
		value: "ASAP",
		label: "즉시 구직",
		desc: "3개월 내 취업/이직을 목표로 집중",
	},
	{
		value: "3M",
		label: "단기 준비",
		desc: "3~6개월 정도 여유를 두고 차근차근",
	},
	{
		value: "6M",
		label: "중기 계획",
		desc: "6개월~1년 뒤 목표, 현재는 스킬업 중심",
	},
	{
		value: "1Y",
		label: "장기 관점",
		desc: "1년 이상, 천천히 기회를 탐색",
	},
] as const;

export const RESIDENCE_OPTIONS = [
	{ value: "KR", label: "현재 한국 거주 중" },
	{ value: "JP", label: "현재 일본 거주 중" },
	{ value: "Other", label: "그 외 해외 거주" },
] as const;

export const DEGREE_OPTIONS = [
	{ value: "bachelor", label: "4년제 학사 학위 이상" },
	{ value: "associate", label: "2~3년제 전문학사" },
	{ value: "none", label: "학위 없음 / 고졸 포함" },
] as const;

export const JOB_FAMILIES = [
	{ value: "frontend", label: "Frontend Engineer" },
	{ value: "backend", label: "Backend Engineer" },
	{ value: "mobile", label: "Mobile App Engineer" },
	{ value: "data", label: "Data Scientist / Engineer" },
	{ value: "infra", label: "DevOps / SRE / Infra" },
	{ value: "fullstack", label: "Fullstack Engineer" },
	{ value: "pm", label: "Product Manager (PO/PM)" },
	{ value: "design", label: "Product Designer" },
] as const;

export const LEVELS = [
	{
		value: "junior",
		label: "주니어 (Junior)",
		desc: "1~3년차 · 기초가 튼튼한 성장형 인재",
	},
	{
		value: "mid",
		label: "미들 (Mid-Level)",
		desc: "4~6년차 · 주도적으로 실무 수행 가능",
	},
	{
		value: "senior",
		label: "시니어 (Senior)",
		desc: "7년차+ · 기술적 난제 해결 및 리딩",
	},
	{
		value: "lead",
		label: "리드/매니저 (Lead)",
		desc: "팀 관리 경험 및 기술 전략 리딩",
	},
] as const;

export const JP_LEVELS = [
	{ value: "None", label: "입문/못함", desc: "히라가나 정도 혹은 전혀 모름" },
	{ value: "N5", label: "N5 수준", desc: "기본적인 인사말과 단어 이해" },
	{ value: "N4", label: "N4 수준", desc: "기본적인 일상 회화 조금 가능" },
	{ value: "N3", label: "N3 수준", desc: "일상적인 의사소통에 무리 없음" },
	{ value: "N2", label: "N2 수준", desc: "비즈니스 회화 시도 가능" },
	{ value: "N1", label: "N1 수준", desc: "자연스러운 비즈니스 커뮤니케이션" },
	{ value: "Native", label: "원어민 수준", desc: "현지인과 구분 어려운 수준" },
] as const;

export const EN_LEVELS = [
	{ value: "Basic", label: "기초 (Basic)", desc: "간단한 읽기/쓰기만 가능" },
	{
		value: "Conversational",
		label: "일상 회화 (Conversational)",
		desc: "여행/캐주얼한 대화 가능",
	},
	{
		value: "Business",
		label: "비즈니스 (Business)",
		desc: "업무 회의 및 문서 작성 능숙",
	},
	{
		value: "Native",
		label: "원어민 수준 (Native)",
		desc: "복잡한 뉘앙스까지 완벽 구사",
	},
] as const;

export const CITIES = [
	{ value: "Tokyo", label: "도쿄 (Tokyo)", desc: "가장 많은 기회와 높은 연봉" },
	{
		value: "Osaka",
		label: "오사카 (Osaka)",
		desc: "활기찬 분위기와 저렴한 물가",
	},
	{
		value: "Fukuoka",
		label: "후쿠오카 (Fukuoka)",
		desc: "한국과 가깝고 살기 좋은 도시",
	},
	{ value: "Kyoto", label: "교토 (Kyoto)", desc: "전통과 IT의 조화" },
	{ value: "Remote", label: "풀 리모트 (Remote)", desc: "거주지 제약 없음" },
] as const;

export const ASSESSMENT_STEPS = [
	{ id: 1, label: "기본 경력" },
	{ id: 2, label: "어학 능력" },
	{ id: 3, label: "스킬셋" },
	{ id: 4, label: "현재 상황" },
	{ id: 5, label: "직업 가치관" },
	{ id: 6, label: "선호도" },
] as const;
