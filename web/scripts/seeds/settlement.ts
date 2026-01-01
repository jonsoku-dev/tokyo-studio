import * as schema from "@itcom/db/schema";
import {
	settlementReviews,
	settlementTaskTemplates,
	settlementTemplates,
} from "@itcom/db/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export async function seedSettlement(
	db: NodePgDatabase<typeof schema>,
	_mainUserId: string,
) {
	console.log("📝 Seeding settlement templates...");

	// Fetch phases for ID lookup
	const allPhases = await db.select().from(schema.settlementPhases);
	const getPhaseId = (days: number) => {
		const found = allPhases.find((p) => days >= p.minDays && days <= p.maxDays);
		return found?.id || null;
	};

	// Deterministic User IDs (must match auth.ts)
	const ID_TEST = "00000000-0000-0000-0000-000000000000";
	const ID_KIM = "11111111-1111-1111-1111-111111111111"; // Engineer/Family
	const ID_LEE = "22222222-2222-2222-2222-222222222222"; // WorkingHoliday/Single
	const ID_PARK = "33333333-3333-3333-3333-333333333333"; // Startup/Single
	const ID_CHOI = "44444444-4444-4444-4444-444444444444"; // Engineer/Pet
	const ID_JUNG = "55555555-5555-5555-5555-555555555555"; // Spouse/Couple

	// --- 1. [Official] Tokyo IT Settlement (Standard) ---
	const [t1] = await db
		.insert(settlementTemplates)
		.values({
			title: "일본 IT 취업: 도쿄 정착의 정석 (공식)",
			description:
				"도쿄로 취업한 1인구 개발자를 위한 필수 정착 가이드입니다. 구청 수속부터 인터넷 개통, 신용카드 발급 꿀팁 등을 포함합니다.",
			authorId: ID_TEST,
			isOfficial: true,
			tags: ["도쿄", "취업", "개발자", "필수"],
			version: 1,
			status: "published",
			targetVisa: "Engineer",
			familyStatus: "Single",
			region: "Tokyo",
		})
		.returning();

	// --- 2. [User] Osaka Family Migration ---
	const [t2] = await db
		.insert(settlementTemplates)
		.values({
			title: "가족과 함께하는 오사카 이주 가이드",
			description:
				"자녀가 있는 4인 가족의 오사카 정착기. 보육원(호이쿠엔) 찾기 팁과 아이와 갈만한 병원 리스트를 정리했습니다.",
			authorId: ID_KIM,
			isOfficial: false,
			tags: ["오사카", "가족", "육아", "보육원"],
			version: 3,
			status: "published",
			targetVisa: "Engineer",
			familyStatus: "Family with Kids",
			region: "Osaka",
		})
		.returning();

	// --- 3. [User] Kyoto Working Holiday ---
	const [t3] = await db
		.insert(settlementTemplates)
		.values({
			title: "교토에서 즐기는 워킹홀리데이 1년",
			description:
				"고즈넉한 교토에서의 1년 살기. 쉐어하우스 구하기부터 아르바이트(카페) 면접 팁까지.",
			authorId: ID_LEE,
			isOfficial: false,
			tags: ["교토", "워킹홀리데이", "카페", "알바"],
			version: 1,
			status: "published",
			targetVisa: "Working Holiday",
			familyStatus: "Single",
			region: "Remote",
		})
		.returning();

	// --- 4. [User] Fukuoka Startup Life ---
	const [t4] = await db
		.insert(settlementTemplates)
		.values({
			title: "후쿠오카 스타트업 비자 완전정복",
			description:
				"스타트업의 도시 후쿠오카에서 창업 비자로 살아남기. 스타트업 카페 활용법과 사무실 임대 팁.",
			authorId: ID_PARK,
			isOfficial: false,
			tags: ["후쿠오카", "창업", "스타트업", "비자"],
			version: 2,
			status: "published",
			targetVisa: "Startup",
			familyStatus: "Single",
			region: "Fukuoka",
		})
		.returning();

	// --- 5. [User] Tokyo Pet Life ---
	const [t5] = await db
		.insert(settlementTemplates)
		.values({
			title: "반려견과 함께 도쿄로 이사하기",
			description:
				"대형견과 함께 일본으로 이주하는 절차(검역, 수입신고)와 도쿄 내 반려동물 가능 맨션 찾기 노하우.",
			authorId: ID_CHOI,
			isOfficial: false,
			tags: ["반려동물", "강아지", "검역", "이사"],
			version: 5,
			status: "published",
			targetVisa: "Engineer",
			familyStatus: "Pet Owner",
			region: "Tokyo",
		})
		.returning();

	// --- 6. [User] Nagoya Newlyweds ---
	const [t6] = await db
		.insert(settlementTemplates)
		.values({
			title: "나고야에서 시작하는 신혼생활",
			description:
				"나고야로 발령받은 남편을 따라온 아내의 정착기. 배우자 비자 변경 신청과 가구 구매 팁.",
			authorId: ID_JUNG,
			isOfficial: false,
			tags: ["나고야", "신혼", "부부", "가구"],
			version: 1,
			status: "published",
			targetVisa: "Spouse",
			familyStatus: "Couple",
			region: "Nagoya",
		})
		.returning();

	// Generate heavy task load (20+ per template)
	const tasks = [
		// --- T1: Tokyo Standard (20 tasks) ---
		{
			tId: t1.id,
			cat: "Administrative",
			day: -30,
			title: "COE(재류자격인정증명서) 수령 확인",
		},
		{
			tId: t1.id,
			cat: "Administrative",
			day: -25,
			title: "주한일본대사관 비자 신청 예약",
		},
		{
			tId: t1.id,
			cat: "Housing",
			day: -20,
			title: "임시 숙소(에어비앤비/호텔) 2주 예약",
		},
		{
			tId: t1.id,
			cat: "Communication",
			day: -15,
			title: "일본 유심/eSIM 사전 구매 (입국 당일용)",
		},
		{
			tId: t1.id,
			cat: "Administrative",
			day: -10,
			title: "도장(인감/막도장) 제작",
		},
		{
			tId: t1.id,
			cat: "Finance",
			day: -7,
			title: "해외 결제 가능한 신용카드(트래블로그 등) 발급",
		},
		{ tId: t1.id, cat: "Health", day: -5, title: "치과 검진 및 치료 완료하기" },
		{
			tId: t1.id,
			cat: "Administrative",
			day: 0,
			title: "입국 심사 및 재류카드 수령 확인",
		},
		{
			tId: t1.id,
			cat: "Administrative",
			day: 1,
			title: "관할 구청 전입신고 (주민표 발급)",
		},
		{ tId: t1.id, cat: "Health", day: 1, title: "국민건강보험 가입 (구청)" },
		{
			tId: t1.id,
			cat: "Administrative",
			day: 1,
			title: "마이넘버카드 교부 신청 (구청)",
		},
		{
			tId: t1.id,
			cat: "Communication",
			day: 2,
			title: "일본 휴대폰 번호 개통 (빅심/라인모/아하모)",
		},
		{
			tId: t1.id,
			cat: "Finance",
			day: 3,
			title: "우체국 은행(유초은행) 계좌 개설",
		},
		{
			tId: t1.id,
			cat: "Housing",
			day: 5,
			title: "부동산 사이트(Suumo/Homes) 매물 검색 시작",
		},
		{
			tId: t1.id,
			cat: "Housing",
			day: 7,
			title: "부동산 중개인 미팅 및 내견(집 구경)",
		},
		{
			tId: t1.id,
			cat: "Housing",
			day: 10,
			title: "입주 신청 및 심사 서류 제출",
		},
		{
			tId: t1.id,
			cat: "Housing",
			day: 14,
			title: "부동산 초기비용(송금) 납부",
		},
		{
			tId: t1.id,
			cat: "Housing",
			day: 20,
			title: "라이프라인(전기/수도/가스) 입주 신청",
		},
		{
			tId: t1.id,
			cat: "Communication",
			day: 21,
			title: "집 인터넷(히카리) 신청 (공사 2주 소요)",
		},
		{
			tId: t1.id,
			cat: "Shopping",
			day: 30,
			title: "니토리/IKEA 가구 구매 및 배송 예약",
		},
		{
			tId: t1.id,
			cat: "Finance",
			day: 40,
			title: "일본 신용카드(라쿠텐/에포스) 신청",
		},

		// --- T2: Osaka Family (20 tasks) ---
		{
			tId: t2.id,
			cat: "Administrative",
			day: -60,
			title: "가족 전원 여권 유효기간 확인",
		},
		{
			tId: t2.id,
			cat: "Administrative",
			day: -45,
			title: "가족관계증명서 번역 및 공증",
		},
		{
			tId: t2.id,
			cat: "Housing",
			day: -30,
			title: "2LDK 이상 오사카 물건지 사전 조사",
		},
		{
			tId: t2.id,
			cat: "Education",
			day: -20,
			title: "근처 보육원/유치원 공석 현황 확인 (전화/메일)",
		},
		{
			tId: t2.id,
			cat: "Health",
			day: -10,
			title: "자녀 예방접종 증명서 영문 발급",
		},
		{
			tId: t2.id,
			cat: "Administrative",
			day: 1,
			title: "구청 전입신고 (세대주/세대원 전원)",
		},
		{
			tId: t2.id,
			cat: "Administrative",
			day: 1,
			title: "아동수당(Jido Teate) 신청",
		},
		{
			tId: t2.id,
			cat: "Administrative",
			day: 1,
			title: "어린이 의료비 조성제도 신청",
		},
		{
			tId: t2.id,
			cat: "Education",
			day: 3,
			title: "보육원 입소 신청서류 수령 (구청 보육과)",
		},
		{
			tId: t2.id,
			cat: "Transport",
			day: 5,
			title: "패밀리카 렌트 또는 카쉐어 등록",
		},
		{
			tId: t2.id,
			cat: "Shopping",
			day: 7,
			title: "오사카 코스트코/이케아 멤버십 가입",
		},
		{
			tId: t2.id,
			cat: "Housing",
			day: 10,
			title: "층간소음 방지 매트 구매 (일본 맨션 필수)",
		},
		{
			tId: t2.id,
			cat: "Health",
			day: 14,
			title: "근처 소아과 및 야간응급병원 위치 파악",
		},
		{
			tId: t2.id,
			cat: "Education",
			day: 20,
			title: "보육원 견학(켄가쿠) 스케줄 잡기",
		},
		{
			tId: t2.id,
			cat: "Shopping",
			day: 25,
			title: "자전거(마마챠리) 구매 및 보험 가입",
		},
		{
			tId: t2.id,
			cat: "Community",
			day: 30,
			title: "지역 커뮤니티 센터/아동관 방문",
		},
		{
			tId: t2.id,
			cat: "Finance",
			day: 40,
			title: "가족 생활비 관리용 공동 계좌 설정",
		},
		{
			tId: t2.id,
			cat: "Administrative",
			day: 60,
			title: "한국 영사관 재외국민 등록 (가족)",
		},
		{
			tId: t2.id,
			cat: "Education",
			day: 90,
			title: "한글 학교 주말반 알아보기",
		},
		{ tId: t2.id, cat: "Housing", day: 120, title: "겨울 대비 코타츠 구매" },

		// --- T3: Kyoto Holiday (20 tasks) ---
		{
			tId: t3.id,
			cat: "Administrative",
			day: -60,
			title: "워킹홀리데이 비자 합격 및 수령",
		},
		{
			tId: t3.id,
			cat: "Business",
			day: -30,
			title: "일본어 이력서(리레키쇼) 초안 작성",
		},
		{
			tId: t3.id,
			cat: "Housing",
			day: -20,
			title: "교토 쉐어하우스(오크하우스 등) 공실 확인",
		},
		{
			tId: t3.id,
			cat: "Shopping",
			day: -10,
			title: "110V 변압기 및 돼지코 어댑터 대량 구매",
		},
		{
			tId: t3.id,
			cat: "Administrative",
			day: 0,
			title: "입국 시 재류카드에 '지정서' 도장 확인",
		},
		{
			tId: t3.id,
			cat: "Administrative",
			day: 1,
			title: "주소지 등록 (쉐어하우스)",
		},
		{
			tId: t3.id,
			cat: "Housing",
			day: 2,
			title: "쉐어하우스 입주 오리엔테이션 및 룰 숙지",
		},
		{
			tId: t3.id,
			cat: "Shopping",
			day: 3,
			title: "자전거 구매 (중고샵/리사이클샵)",
		},
		{
			tId: t3.id,
			cat: "Administrative",
			day: 3,
			title: "자전거 방범등록 (필수)",
		},
		{
			tId: t3.id,
			cat: "Business",
			day: 5,
			title: "바이토루/타운워크 앱 설치 및 가입",
		},
		{ tId: t3.id, cat: "Business", day: 7, title: "알바 면접용 증명사진 촬영" },
		{
			tId: t3.id,
			cat: "Business",
			day: 10,
			title: "카페/레스토랑 알바 지원 (3군데 이상)",
		},
		{
			tId: t3.id,
			cat: "Communication",
			day: 14,
			title: "일본인 쉐어메이트와 라인 교환",
		},
		{ tId: t3.id, cat: "Business", day: 20, title: "알바 급여 통장 사본 제출" },
		{
			tId: t3.id,
			cat: "Shopping",
			day: 25,
			title: "업무용 신발/검은 바지 구매",
		},
		{
			tId: t3.id,
			cat: "Finance",
			day: 30,
			title: "가계부 앱으로 지출 관리 시작",
		},
		{
			tId: t3.id,
			cat: "Community",
			day: 40,
			title: "교토 대학생 언어교환 모임 참석",
		},
		{
			tId: t3.id,
			cat: "Administrative",
			day: 90,
			title: "국민건강보험료 감면 신청 확인",
		},
		{
			tId: t3.id,
			cat: "Shopping",
			day: 150,
			title: "귀국 짐 정리용 박스 구매 (미리)",
		},
		{
			tId: t3.id,
			cat: "Administrative",
			day: 360,
			title: "귀국 전 전출신고 및 보험증 반납",
		},

		// --- T4: Fukuoka Startup (20 tasks) ---
		{
			tId: t4.id,
			cat: "Business",
			day: -60,
			title: "스타트업 비자 사업계획서(Pitch Deck) 초안",
		},
		{
			tId: t4.id,
			cat: "Business",
			day: -45,
			title: "후쿠오카시 스타트업 카페 사전 온라인 상담",
		},
		{
			tId: t4.id,
			cat: "Finance",
			day: -30,
			title: "초기 자본금 증명서 준비 (통장 잔고)",
		},
		{
			tId: t4.id,
			cat: "Administrative",
			day: -10,
			title: "경력증명서 및 졸업증명서 영문/일문 공증",
		},
		{
			tId: t4.id,
			cat: "Administrative",
			day: 1,
			title: "후쿠오카시 츄오구청 전입신고",
		},
		{
			tId: t4.id,
			cat: "Business",
			day: 2,
			title: "스타트업 카페 오프라인 미팅 (다이묘)",
		},
		{
			tId: t4.id,
			cat: "Administrative",
			day: 5,
			title: "개인 인감증명서 등록 (구청)",
		},
		{
			tId: t4.id,
			cat: "Business",
			day: 7,
			title: "회사 정관(Teikan) 작성 및 공증인 인증",
		},
		{
			tId: t4.id,
			cat: "Networking",
			day: 10,
			title: "Fukuoka Growth Next(FGN) 코워킹 투어",
		},
		{
			tId: t4.id,
			cat: "Business",
			day: 14,
			title: "법무국 법인 설립 등기 신청",
		},
		{
			tId: t4.id,
			cat: "Administrative",
			day: 20,
			title: "세무서 법인 설립 신고서 제출",
		},
		{
			tId: t4.id,
			cat: "Administrative",
			day: 21,
			title: "시/도세 사무소 법인 설립 신고",
		},
		{
			tId: t4.id,
			cat: "Administrative",
			day: 22,
			title: "연금사무소 사회보험 가입 신청",
		},
		{
			tId: t4.id,
			cat: "Finance",
			day: 30,
			title: "법인 명의 은행 계좌 개설 (난이도 높음)",
		},
		{ tId: t4.id, cat: "Business", day: 40, title: "법인 인감카드 수령" },
		{
			tId: t4.id,
			cat: "Networking",
			day: 45,
			title: "규슈 스타트업 밋업 행사 참여",
		},
		{
			tId: t4.id,
			cat: "Business",
			day: 60,
			title: "세리사(세무사) 계약 및 기장 의뢰",
		},
		{
			tId: t4.id,
			cat: "Business",
			day: 90,
			title: "경영관리 비자로 변경 신청 (6개월 내)",
		},
		{ tId: t4.id, cat: "Finance", day: 100, title: "법인 신용카드 발급 신청" },
		{
			tId: t4.id,
			cat: "Business",
			day: 180,
			title: "첫 결산 준비 및 예산안 수립",
		},

		// --- T5: Tokyo Pet (20 tasks) ---
		{
			tId: t5.id,
			cat: "Administrative",
			day: -210,
			title: "반려견 마이크로칩 이식 (ISO 규격)",
		},
		{
			tId: t5.id,
			cat: "Health",
			day: -200,
			title: "광견병 예방접종 (1차) & 증명서",
		},
		{
			tId: t5.id,
			cat: "Health",
			day: -170,
			title: "광견병 예방접종 (2차) - 30일 간격",
		},
		{
			tId: t5.id,
			cat: "Administrative",
			day: -160,
			title: "혈청 항체가 검사 (채혈 후 송부)",
		},
		{
			tId: t5.id,
			cat: "Housing",
			day: -60,
			title: "채혈일로부터 180일 대기 (이 기간에 집 구하기)",
		},
		{
			tId: t5.id,
			cat: "Housing",
			day: -50,
			title: "반려동물 가능(Pet Friendly) 맨션 필터링 검색",
		},
		{
			tId: t5.id,
			cat: "Administrative",
			day: -40,
			title: "NACCS 동물 검역 사전 신고 (도착 40일 전 필수)",
		},
		{
			tId: t5.id,
			cat: "Transport",
			day: -30,
			title: "항공사 반려동물 운송 예약 (케이지 규격 확인)",
		},
		{
			tId: t5.id,
			cat: "Health",
			day: -10,
			title: "출국 전 수의사 최종 임상 검사 및 증명서",
		},
		{
			tId: t5.id,
			cat: "Administrative",
			day: -5,
			title: "한국 검역소 수출 검역 및 증명서 발급",
		},
		{
			tId: t5.id,
			cat: "Administrative",
			day: 0,
			title: "일본 공항 도착 후 동물 검역소 수입 검사",
		},
		{
			tId: t5.id,
			cat: "Transport",
			day: 0,
			title: "펫 택시 예약 (공항 -> 집)",
		},
		{
			tId: t5.id,
			cat: "Housing",
			day: 1,
			title: "입주 시 관리회사에 사육 신청서 제출",
		},
		{
			tId: t5.id,
			cat: "Administrative",
			day: 7,
			title: "구청 보건소에 반려견 등록 (감찰 교부)",
		},
		{
			tId: t5.id,
			cat: "Administrative",
			day: 7,
			title: "일본 광견병 예방주사 (필요 시) 및 주사표 수령",
		},
		{
			tId: t5.id,
			cat: "Shopping",
			day: 10,
			title: "반려동물 사료 및 배변패드 정기배송 신청",
		},
		{
			tId: t5.id,
			cat: "Health",
			day: 14,
			title: "심장사상충 예방약 처방 (현지 병원)",
		},
		{
			tId: t5.id,
			cat: "Community",
			day: 20,
			title: "동네 반려견 산책 코스 탐방",
		},
		{
			tId: t5.id,
			cat: "Health",
			day: 30,
			title: "일본 펫 보험 가입 비교 (아니콤 등)",
		},
		{ tId: t5.id, cat: "Shopping", day: 40, title: "소음 방지용 펫 매트 시공" },

		// --- T6: Nagoya Couple (20 tasks) ---
		{
			tId: t6.id,
			cat: "Administrative",
			day: -60,
			title: "남편의 재직증명서 및 납세증명서 준비",
		},
		{
			tId: t6.id,
			cat: "Administrative",
			day: -50,
			title: "혼인관계증명서 번역본 준비",
		},
		{
			tId: t6.id,
			cat: "Administrative",
			day: -30,
			title: "배우자 비자(가족체재) COE 신청",
		},
		{
			tId: t6.id,
			cat: "Housing",
			day: -20,
			title: "나고야 2인 거주 가능 맨션 찾기 (메이역/사카에)",
		},
		{
			tId: t6.id,
			cat: "Shopping",
			day: -10,
			title: "한국에서 쓰던 소형 가전 당근마켓 처분",
		},
		{
			tId: t6.id,
			cat: "Administrative",
			day: 1,
			title: "나고야시 구청 전입신고 (동반인 등록)",
		},
		{
			tId: t6.id,
			cat: "Transport",
			day: 5,
			title: "마나카(Manaca) 교통카드 2장 구매",
		},
		{
			tId: t6.id,
			cat: "Shopping",
			day: 7,
			title: "이케아 나가쿠테점 방문 (가구 구매)",
		},
		{
			tId: t6.id,
			cat: "Shopping",
			day: 10,
			title: "오스 시장 구경 및 생활용품 구매",
		},
		{
			tId: t6.id,
			cat: "Finance",
			day: 14,
			title: "부부 생활비 공용 계좌 개설",
		},
		{
			tId: t6.id,
			cat: "Communication",
			day: 15,
			title: "가족 할인 결합 휴대폰 요금제 가입",
		},
		{
			tId: t6.id,
			cat: "Transport",
			day: 20,
			title: "한국 운전면허증 일본 면허로 전환 (평침시험장)",
		},
		{
			tId: t6.id,
			cat: "Housing",
			day: 25,
			title: "쓰레기 분리수거 요일표 냉장고 부착",
		},
		{
			tId: t6.id,
			cat: "Shopping",
			day: 30,
			title: "근처 슈퍼마켓(MaxValu/Valor) 포인트카드 만들기",
		},
		{
			tId: t6.id,
			cat: "Work",
			day: 40,
			title: "타이미(Timee) 등 단기 알바 앱 확인",
		},
		{
			tId: t6.id,
			cat: "Administrative",
			day: 45,
			title: "자격외활동허가서 신청 (알바 가능하도록)",
		},
		{ tId: t6.id, cat: "Community", day: 60, title: "나고야 한인 모임 검색" },
		{ tId: t6.id, cat: "Transport", day: 90, title: "중고 경차 구매 알아보기" },
		{
			tId: t6.id,
			cat: "Housing",
			day: 100,
			title: "여름 대비 에어컨 청소 업체 예약",
		},
		{
			tId: t6.id,
			cat: "Community",
			day: 120,
			title: "일본어 교실(자원봉사) 등록",
		},
	];

	for (const task of tasks) {
		await db.insert(settlementTaskTemplates).values({
			templateId: task.tId,
			title: task.title,
			description: `${task.title}에 대한 상세 설명 및 팁입니다.`,
			category: task.cat,
			dayOffset: task.day,
			phaseId: getPhaseId(task.day),
			isRequired: true,
			orderIndex: 0,
		});
	}

	// Reviews (Mixing users)
	console.log("📝 Seeding reviews...");
	await db
		.insert(settlementReviews)
		.values([
			{
				templateId: t1.id,
				userId: ID_KIM,
				rating: 5,
				comment: "정석 그 자체입니다. 덕분에 초기 정착 완벽하게 했어요.",
				createdAt: new Date(),
			},
			{
				templateId: t2.id,
				userId: ID_JUNG,
				rating: 4,
				comment: "육아 정보가 조금 더 있었으면 좋겠지만 전반적으로 만족합니다.",
				createdAt: new Date(),
			},
			{
				templateId: t5.id,
				userId: ID_LEE,
				rating: 5,
				comment: "강아지 데려오는게 막막했는데 이 가이드 보고 용기 얻었습니다!",
				createdAt: new Date(),
			},
			{
				templateId: t4.id,
				userId: ID_CHOI,
				rating: 5,
				comment: "스타트업 비자 준비하시는 분들께 강력 추천합니다.",
				createdAt: new Date(),
			},
		])
		.onConflictDoNothing();

	console.log(
		"✅ Seeded 6 diverse settlement templates in Korean with 20+ tasks each",
	);
}
