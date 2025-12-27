# 도메인 규칙: 일본 IT 취업 플랫폼

## 핵심 로직: 상태 기계 (State Machine)
사용자의 여정은 상태 머신으로 모델링됩니다. 플랫폼은 다음 상태를 추적하고 유도해야 합니다:

### 상태 정의 (MVP 기준)
1.  **Discover (탐색)**: 정보 수집 단계.
2.  **Decide (결정)**: 의사 결정 (진단, 로드맵 생성).
3.  **Build (준비)**: 스펙 쌓기 (프로젝트, JLPT, 문서 작성).
4.  **Apply (지원)**: 지원서 제출.
5.  **Interview (면접)**: 과제/면접 진행 (1차/2차/3차).
6.  **Offer (제안)**: 오퍼 수령 및 비교.
7.  **Visa/COE (비자)**: 비자/재류자격인정증명서 발급.
8.  **Arrive (입국)**: 일본 도착.
9.  **Onboard (정착)**: 30/60/90일 적응 기간.
10. **Grow (성장)**: 커리어 성장 및 이직 준비.

> **MVP 참고**: 상태 자동 분류는 하지 않고, `로드맵 진행률`, `파이프라인 상태`, `정착 체크리스트`로 상태를 간접 표현.

## 역할 기반 접근 제어 (RBAC)
*   **USER (사용자/구직자)**: 본인의 데이터 소유. 본인의 파이프라인/로드맵만 볼 수 있음. 공개 프로필은 선택 사항.
*   **MENTOR (멘토)**: 배정된 사용자의 데이터(리뷰 요청, 세션 컨텍스트)만 열람 가능.
*   **ADMIN (관리자)**: 전체 접근 권한. 템플릿, 사용자, 멘토 관리.
*   **MODERATOR (운영진)**: 커뮤니티 관리 (게시글 숨김/삭제).

## 파이프라인 상태 (Pipeline Status)
`interested` → `applied` → `assignment` → `interview_1` → `interview_2` → `interview_3` → `offer` → `visa_coe` → `joined` / `rejected` / `withdrawn`

## 주요 도메인 기능 (Key Domain Features)

### 1. 진단 & 로드맵 (Diagnosis & Roadmap)
*   **입력**: 직군(job_family), 레벨(level), 경력년수(years), 일본어 수준(jp_level), 영어 수준(en_level), 희망 도시(target_city), 근무형태(work_style).
*   **출력**: 채널 믹스 전략, 12주 태스크 로드맵, 추천 멘토 유형.
*   **제약사항**: 로드맵 태스크는 **"산출물(Deliverables)"** 중심 (예: "이력서 제출", "앱 배포").

### 2. 문서 타입 (Document Types)
`resume_jp`, `resume_en`, `shokumu_keirekisho` (職務経歴書), `pr_shiboudouki` (PR/志望動機), `interview_answers`, `offer_compare`

### 3. 커뮤니티 카테고리 (Community Categories)
*   `QNA_ROUTE`: 경로/채널 질문.
*   `INTERVIEW_REVIEW`: 면접 후기 (구조화 필드 강제).
*   `PORTFOLIO_REVIEW`: 포트폴리오 피드백 요청.

### 4. 면접 후기 구조화 필드 (Required)
`company`, `role`, `level`, `language_used`, `rounds_count`, `format`, `assignment`, `topics`, `outcome`, `date_month`, `notes`

## 법적 & 컴플라이언스 제약 (Legal)
*   **스크래핑 금지**: 잡보드를 무단 크롤링하는 기능을 구현하지 말 것. "링크 저장(Bookmarking)" 방식으로만 구현.
*   **유료 알선/파견 금지**: 우리는 지원 플랫폼이지 인력 소개소가 아님(초기 MVP). 성공보수 모델 도입 금지.
*   **도쿄 우선**: 정착 정보는 도쿄(Tokyo)를 최우선으로 제공.
*   **비자/행정**: "공식 링크 + 체크리스트"로만 제공. 법률 자문처럼 서술 금지.
*   **레퍼럴 보드**: MVP에서 잠금 (기능 플래그로 비활성).
