/**
 * Settlement Task Seed Data for Tokyo Settlement Checklist (Spec 019)
 * Contains 22 tasks organized by time phase with bilingual (Korean/Japanese) content
 */

export interface SettlementTaskSeed {
	slug: string;
	titleKo: string;
	titleJa: string;
	instructionsKo: string;
	instructionsJa: string;
	requiredDocuments: string[];
	estimatedMinutes: number;
	category: "government" | "housing" | "finance" | "utilities" | "other";
	timePhase: "before_arrival" | "first_week" | "first_month" | "first_3_months";
	deadlineType: "relative" | "absolute";
	deadlineDays?: number;
	tips?: string;
	officialUrl?: string;
	orderIndex: number;
}

export const settlementTaskSeeds: SettlementTaskSeed[] = [
	// ============ BEFORE ARRIVAL ============
	{
		slug: "prepare-documents",
		titleKo: "필수 서류 준비",
		titleJa: "必要書類の準備",
		instructionsKo:
			"일본 입국 및 정착에 필요한 모든 서류를 준비하세요. 여권, 비자, 재류자격증명서, 고용계약서 등을 챙기세요.",
		instructionsJa:
			"日本入国・定住に必要な全ての書類を準備してください。パスポート、ビザ、在留資格認定証明書、雇用契約書などを用意してください。",
		requiredDocuments: [
			"여권/パスポート",
			"비자/ビザ",
			"재류자격증명서/在留資格認定証明書",
			"고용계약서/雇用契約書",
			"증명사진/証明写真",
		],
		estimatedMinutes: 120,
		category: "government",
		timePhase: "before_arrival",
		deadlineType: "relative",
		deadlineDays: -30,
		tips: "서류는 원본과 사본 모두 준비하세요.",
		orderIndex: 1,
	},
	{
		slug: "temporary-housing",
		titleKo: "임시 숙소 예약",
		titleJa: "一時滞在先の予約",
		instructionsKo:
			"도착 후 최소 1주일간 머물 임시 숙소를 예약하세요. 호텔, 에어비앤비, 또는 위클리 맨션을 추천합니다.",
		instructionsJa:
			"到着後、最低1週間の一時滞在先を予約してください。ホテル、Airbnb、またはウィークリーマンションがおすすめです。",
		requiredDocuments: [],
		estimatedMinutes: 60,
		category: "housing",
		timePhase: "before_arrival",
		deadlineType: "relative",
		deadlineDays: -14,
		tips: "주민등록이 가능한 주소가 있는 숙소를 선택하세요.",
		orderIndex: 2,
	},
	{
		slug: "japan-cash",
		titleKo: "일본 엔화 준비",
		titleJa: "日本円の準備",
		instructionsKo:
			"도착 직후 사용할 현금을 준비하세요. 최소 10만엔~20만엔 정도를 권장합니다.",
		instructionsJa:
			"到着直後に使う現金を準備してください。最低10万円〜20万円程度をお勧めします。",
		requiredDocuments: [],
		estimatedMinutes: 30,
		category: "finance",
		timePhase: "before_arrival",
		deadlineType: "relative",
		deadlineDays: -7,
		tips: "일본은 아직 현금 사회입니다. 충분한 현금을 준비하세요.",
		orderIndex: 3,
	},

	// ============ FIRST WEEK ============
	{
		slug: "residence-card",
		titleKo: "재류카드 수령",
		titleJa: "在留カードの受け取り",
		instructionsKo:
			"나리타/하네다 공항에서 재류카드를 수령하세요. 이것은 일본에서의 신분증입니다.",
		instructionsJa:
			"成田/羽田空港で在留カードを受け取ってください。これは日本での身分証明書です。",
		requiredDocuments: ["여권/パスポート", "재류자격증명서/在留資格認定証明書"],
		estimatedMinutes: 30,
		category: "government",
		timePhase: "first_week",
		deadlineType: "absolute",
		deadlineDays: 0,
		tips: "공항 입국심사에서 바로 발급됩니다.",
		officialUrl: "https://www.moj.go.jp/isa/applications/guide/qaq5.html",
		orderIndex: 4,
	},
	{
		slug: "city-hall-registration",
		titleKo: "구청 주민등록",
		titleJa: "区役所での住民登録",
		instructionsKo:
			"거주지 관할 구청에서 주민등록(전입신고)을 하세요. 이것이 있어야 은행, 휴대폰 등 모든 것이 가능합니다.",
		instructionsJa:
			"居住地の区役所で住民登録（転入届）をしてください。これがないと銀行、携帯電話など全てができません。",
		requiredDocuments: ["재류카드/在留カード", "여권/パスポート"],
		estimatedMinutes: 90,
		category: "government",
		timePhase: "first_week",
		deadlineType: "relative",
		deadlineDays: 14,
		tips: "평일 오전에 가면 대기시간이 짧습니다. 번호표를 뽑고 기다리세요.",
		officialUrl: "https://www.city.tokyo.lg.jp/",
		orderIndex: 5,
	},
	{
		slug: "my-number",
		titleKo: "마이넘버 신청",
		titleJa: "マイナンバー申請",
		instructionsKo:
			"주민등록 시 마이넘버(개인번호)를 신청하세요. 카드는 1~2개월 후 우편으로 도착합니다.",
		instructionsJa:
			"住民登録時にマイナンバー（個人番号）を申請してください。カードは1〜2ヶ月後に郵便で届きます。",
		requiredDocuments: ["재류카드/在留カード", "증명사진/証明写真"],
		estimatedMinutes: 30,
		category: "government",
		timePhase: "first_week",
		deadlineType: "relative",
		deadlineDays: 14,
		tips: "마이넘버 카드가 있으면 편의점에서 주민표 발급이 가능합니다.",
		officialUrl: "https://www.kojinbango-card.go.jp/",
		orderIndex: 6,
	},
	{
		slug: "bank-account",
		titleKo: "은행 계좌 개설",
		titleJa: "銀行口座の開設",
		instructionsKo:
			"급여 수령 및 공과금 납부를 위한 은행 계좌를 개설하세요. MUFG, SMBC, 미즈호 등 메가뱅크를 추천합니다.",
		instructionsJa:
			"給与受取・公共料金支払いのための銀行口座を開設してください。MUFG、SMBC、みずほなどのメガバンクがおすすめです。",
		requiredDocuments: [
			"재류카드/在留カード",
			"여권/パスポート",
			"인감(없으면 서명)/印鑑（なければサイン）",
		],
		estimatedMinutes: 90,
		category: "finance",
		timePhase: "first_week",
		deadlineType: "relative",
		deadlineDays: 7,
		tips: "일본어가 어려우면 영어 서비스가 있는 지점을 찾으세요.",
		orderIndex: 7,
	},
	{
		slug: "phone-sim",
		titleKo: "휴대폰/SIM 카드 개통",
		titleJa: "携帯電話/SIMカードの開通",
		instructionsKo:
			"일본 전화번호를 개통하세요. 은행, 회사 연락처 등으로 필요합니다. 격안SIM이나 대형 통신사 중 선택하세요.",
		instructionsJa:
			"日本の電話番号を開通してください。銀行、会社連絡先などに必要です。格安SIMや大手キャリアから選んでください。",
		requiredDocuments: [
			"재류카드/在留カード",
			"은행 계좌(자동이체용)/銀行口座（自動引落用）",
		],
		estimatedMinutes: 60,
		category: "utilities",
		timePhase: "first_week",
		deadlineType: "relative",
		deadlineDays: 7,
		tips: "ahamo, LINEMO, UQ모바일 등은 온라인으로 개통 가능합니다.",
		orderIndex: 8,
	},

	// ============ FIRST MONTH ============
	{
		slug: "health-insurance",
		titleKo: "국민건강보험 가입",
		titleJa: "国民健康保険加入",
		instructionsKo:
			"회사에서 사회보험에 가입하지 않는 경우, 구청에서 국민건강보험에 가입하세요.",
		instructionsJa:
			"会社で社会保険に加入しない場合、区役所で国民健康保険に加入してください。",
		requiredDocuments: ["재류카드/在留カード", "주민표/住民票"],
		estimatedMinutes: 60,
		category: "government",
		timePhase: "first_month",
		deadlineType: "relative",
		deadlineDays: 14,
		tips: "회사원은 대부분 회사에서 건강보험에 가입해줍니다.",
		officialUrl:
			"https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/index.html",
		orderIndex: 9,
	},
	{
		slug: "pension-enrollment",
		titleKo: "국민연금 가입",
		titleJa: "国民年金加入",
		instructionsKo:
			"20세 이상 일본 거주자는 연금에 가입해야 합니다. 회사원은 후생연금에 자동 가입됩니다.",
		instructionsJa:
			"20歳以上の日本居住者は年金に加入する必要があります。会社員は厚生年金に自動加入されます。",
		requiredDocuments: ["재류카드/在留カード", "마이넘버/マイナンバー"],
		estimatedMinutes: 45,
		category: "government",
		timePhase: "first_month",
		deadlineType: "relative",
		deadlineDays: 14,
		tips: "탈퇴일시금 제도로 귀국 시 일부 환급 가능합니다.",
		officialUrl: "https://www.nenkin.go.jp/",
		orderIndex: 10,
	},
	{
		slug: "apartment-search",
		titleKo: "본 거주지 계약",
		titleJa: "本住居の契約",
		instructionsKo:
			"장기 거주할 아파트를 찾아 계약하세요. 부동산 중개소를 통해 진행합니다.",
		instructionsJa:
			"長期滞在する部屋を探して契約してください。不動産仲介業者を通して進めます。",
		requiredDocuments: [
			"재류카드/在留カード",
			"재직증명서/在職証明書",
			"은행잔고증명/銀行残高証明",
		],
		estimatedMinutes: 480,
		category: "housing",
		timePhase: "first_month",
		deadlineType: "relative",
		deadlineDays: 30,
		tips: "보증인이 없으면 보증회사를 이용하세요. 초기비용은 월세의 4~6배 정도 예상하세요.",
		orderIndex: 11,
	},
	{
		slug: "suumo",
		titleKo: "이사 및 입주",
		titleJa: "引っ越し・入居",
		instructionsKo:
			"새 아파트로 이사하세요. 이사 업체를 이용하거나 직접 옮기세요.",
		instructionsJa:
			"新しい部屋に引っ越してください。引っ越し業者を利用するか、自分で運んでください。",
		requiredDocuments: [],
		estimatedMinutes: 240,
		category: "housing",
		timePhase: "first_month",
		deadlineType: "relative",
		deadlineDays: 30,
		tips: "전기/가스/수도는 입주 전에 미리 연락해두세요.",
		orderIndex: 12,
	},
	{
		slug: "address-change",
		titleKo: "주소 변경 신고",
		titleJa: "住所変更届",
		instructionsKo: "이사 후 14일 이내에 새 주소지 구청에서 전입신고를 하세요.",
		instructionsJa:
			"引っ越し後14日以内に新住所の区役所で転入届をしてください。",
		requiredDocuments: ["재류카드/在留カード", "새 주소 계약서/新住所契約書"],
		estimatedMinutes: 60,
		category: "government",
		timePhase: "first_month",
		deadlineType: "relative",
		deadlineDays: 14,
		tips: "재류카드 뒷면 주소도 갱신해야 합니다.",
		orderIndex: 13,
	},
	{
		slug: "electricity",
		titleKo: "전기 계약",
		titleJa: "電気契約",
		instructionsKo:
			"새 거주지의 전기 계약을 신청하세요. 도쿄전력 또는 신전력회사를 선택할 수 있습니다.",
		instructionsJa:
			"新居の電気契約を申し込んでください。東京電力または新電力会社を選べます。",
		requiredDocuments: [],
		estimatedMinutes: 15,
		category: "utilities",
		timePhase: "first_month",
		deadlineType: "relative",
		deadlineDays: 30,
		tips: "온라인으로 신청 가능합니다.",
		officialUrl: "https://www.tepco.co.jp/",
		orderIndex: 14,
	},
	{
		slug: "gas",
		titleKo: "가스 계약",
		titleJa: "ガス契約",
		instructionsKo:
			"가스 계약을 신청하세요. 도시가스 또는 프로판가스에 따라 회사가 다릅니다.",
		instructionsJa:
			"ガス契約を申し込んでください。都市ガスかプロパンガスかで会社が異なります。",
		requiredDocuments: [],
		estimatedMinutes: 30,
		category: "utilities",
		timePhase: "first_month",
		deadlineType: "relative",
		deadlineDays: 30,
		tips: "가스는 개통 시 입회가 필요합니다.",
		officialUrl: "https://home.tokyo-gas.co.jp/",
		orderIndex: 15,
	},
	{
		slug: "water",
		titleKo: "수도 계약",
		titleJa: "水道契約",
		instructionsKo: "수도 계약을 신청하세요. 도쿄도 수도국에 연락하면 됩니다.",
		instructionsJa:
			"水道契約を申し込んでください。東京都水道局に連絡してください。",
		requiredDocuments: [],
		estimatedMinutes: 15,
		category: "utilities",
		timePhase: "first_month",
		deadlineType: "relative",
		deadlineDays: 30,
		tips: "온라인 또는 전화로 신청 가능합니다.",
		officialUrl: "https://www.waterworks.metro.tokyo.lg.jp/",
		orderIndex: 16,
	},
	{
		slug: "internet",
		titleKo: "인터넷 계약",
		titleJa: "インターネット契約",
		instructionsKo:
			"집에 인터넷을 설치하세요. 광케이블 또는 포켓와이파이 중 선택하세요.",
		instructionsJa:
			"自宅にインターネットを設置してください。光回線かポケットWi-Fiを選んでください。",
		requiredDocuments: ["재류카드/在留カード", "은행계좌/銀行口座"],
		estimatedMinutes: 30,
		category: "utilities",
		timePhase: "first_month",
		deadlineType: "relative",
		deadlineDays: 30,
		tips: "광케이블은 개통까지 2~4주 걸릴 수 있습니다.",
		orderIndex: 17,
	},

	// ============ FIRST 3 MONTHS ============
	{
		slug: "drivers-license",
		titleKo: "운전면허 전환",
		titleJa: "運転免許の切り替え",
		instructionsKo:
			"한국 운전면허가 있다면 일본 면허로 전환할 수 있습니다. 면허센터에서 진행합니다.",
		instructionsJa:
			"韓国の運転免許があれば日本の免許に切り替えられます。免許センターで手続きします。",
		requiredDocuments: [
			"한국 운전면허증/韓国運転免許証",
			"재류카드/在留カード",
			"번역문/翻訳文",
			"여권/パスポート",
		],
		estimatedMinutes: 240,
		category: "other",
		timePhase: "first_3_months",
		deadlineType: "relative",
		deadlineDays: 90,
		tips: "JAF에서 공식 번역을 받을 수 있습니다.",
		officialUrl: "https://www.keishicho.metro.tokyo.lg.jp/menkyo/index.html",
		orderIndex: 18,
	},
	{
		slug: "hospital-search",
		titleKo: "병원 찾아두기",
		titleJa: "病院を探しておく",
		instructionsKo:
			"근처 병원(내과, 치과 등)을 미리 찾아두세요. 한국어나 영어가 가능한 병원이 편합니다.",
		instructionsJa:
			"近くの病院（内科、歯科など）をあらかじめ探しておいてください。韓国語や英語ができる病院が便利です。",
		requiredDocuments: ["건강보험증/健康保険証"],
		estimatedMinutes: 60,
		category: "other",
		timePhase: "first_3_months",
		deadlineType: "relative",
		deadlineDays: 90,
		tips: "AMDA 국제의료정보센터에서 다국어 의료상담이 가능합니다.",
		orderIndex: 19,
	},
	{
		slug: "emergency-contacts",
		titleKo: "긴급연락망 정리",
		titleJa: "緊急連絡網の整理",
		instructionsKo:
			"경찰(110), 소방/구급(119), 대사관 연락처 등 긴급연락망을 저장해두세요.",
		instructionsJa:
			"警察(110)、消防・救急(119)、大使館連絡先など緊急連絡網を保存しておいてください。",
		requiredDocuments: [],
		estimatedMinutes: 15,
		category: "other",
		timePhase: "first_3_months",
		deadlineType: "relative",
		deadlineDays: 90,
		tips: "주한일본대사관 연락처도 저장해두세요.",
		orderIndex: 20,
	},
	{
		slug: "credit-card",
		titleKo: "신용카드 발급",
		titleJa: "クレジットカード発行",
		instructionsKo:
			"일본 신용카드를 발급받으세요. 처음에는 외국인에게 친화적인 카드를 추천합니다.",
		instructionsJa:
			"日本のクレジットカードを発行してください。最初は外国人に優しいカードがおすすめです。",
		requiredDocuments: [
			"재류카드/在留カード",
			"은행계좌/銀行口座",
			"재직증명서/在職証明書",
		],
		estimatedMinutes: 30,
		category: "finance",
		timePhase: "first_3_months",
		deadlineType: "relative",
		deadlineDays: 90,
		tips: "라쿠텐카드, 이온카드 등이 외국인에게 비교적 발급이 쉽습니다.",
		orderIndex: 21,
	},
	{
		slug: "japanese-study",
		titleKo: "일본어 학습 시작",
		titleJa: "日本語学習開始",
		instructionsKo:
			"일본 생활을 위해 일본어 공부를 시작하세요. 구청에서 무료 일본어 교실을 운영하는 경우도 있습니다.",
		instructionsJa:
			"日本生活のために日本語の勉強を始めてください。区役所で無料日本語教室を運営している場合もあります。",
		requiredDocuments: [],
		estimatedMinutes: 60,
		category: "other",
		timePhase: "first_3_months",
		deadlineType: "relative",
		deadlineDays: 90,
		tips: "JLPT N3 이상이면 일상생활이 편해집니다.",
		orderIndex: 22,
	},
];
