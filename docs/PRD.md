# Product Requirements Document (PRD) - Japan IT Job Platform (Production)

## 1. 개요 (Overview)
**Japan IT Job Platform**은 일본 IT 취업을 희망하는 한국인 구직자를 위한 **"All-in-One Career Management Platform"**입니다.
정보 습득부터 서류 준비, 지원 관리, 멘토링, 그리고 도쿄 정착까지의 전 과정을 데이터 기반으로 지원합니다.

### 1.1 제품 철학 (Core Philosophy)
*   **Data-Driven**: 사용자의 활동 데이터를 분석하여 최적의 다음 행동을 제안합니다.
*   **Operational Excellence**: 단순 정보 소비가 아닌, 실제 취업 활동(Task)의 생산성을 극대화합니다.
*   **Trust & Quality**: 검증된 멘토와 구조화된 커뮤니티 데이터로 신뢰할 수 있는 정보를 제공합니다.

### 1.2 타겟 사용자 (Persona)
*   **Seeker**: 일본 취업을 목표로 하는 주니어~미들 레벨 개발자.
*   **Mentor**: 일본 현지 IT 기업 재직자 (검증된 경력).
*   **Admin**: 플랫폼 운영 및 콘텐츠 품질 관리자.

---

## 2. 디자인 및 UX 원칙 (Design Principles)
*   **Premium & Professional**: 신뢰감을 주는 모던한 디자인 (Inter/Pretendard 폰트, 여백 활용).
*   **Feedback Loop**: 모든 사용자 액션에 즉각적인 피드백 (Toast, Transition) 및 낙관적 UI 업데이트.
*   **Seamless Transition**: "진단 → 로드맵 → 액션"이 끊김 없이 연결되는 유려한 경험.

---

## 3. 상세 기능 명세 (Production Specifications)

### 3.1 인증 & 계정 (Authentication & Account)
*   **Social Login**: Google, GitHub OAuth 2.0 연동.
*   **Email Verification**: 회원가입 시 이메일 소유 인증 필수.
*   **Password Management**: 비밀번호 재설정(이메일 발송) 및 변경.
*   **Role Management**: User, Mentor, Admin 권한 분리 및 RBAC 적용.
*   **Profile**:
    *   기본 정보: 직군, 연차, 언어 능력(JLPT/TOEIC 등).
    *   공개 프로필: 닉네임, 활동 배지, 커뮤니티 기여도.
    *   비공개 정보: 실제 이름, 연락처 (멘토링/지원 시에만 활용).

### 3.2 온보딩 진단 시스템 (Diagnosis Engine)
*   **Dynamic Wizard**: 사용자의 응답에 따라 질문이 분기되는 동적 폼.
*   **Scoring Logic**: 입력 데이터(기술, 언어, 경력) 기반 취업 확률 및 추천 경로(채널) 점수 산출.
*   **Recommendation**:
    *   **Channel Mix**: 에이전트 vs 직접 지원 vs 스카우트 비중 제안.
    *   **Roadmap**: 사용자 레벨에 맞는 커스텀 로드맵 템플릿 자동 생성.
    *   **Mentor Matching**: 가장 적합한 멘토 추천 (유사 직군/경로).

### 3.3 로드맵 & 일정 관리 (Roadmap & Scheduling)
*   **Interactive Kanban/Gantt**: 주차별 할 일 관리, 드래그 앤 드롭 상태 변경.
*   **Sync**: Google Calendar 연동 (면접일정, 멘토링 세션 동기화).
*   **Notifications**:
    *   브라우저 권한(Push API) 또는 이메일 알림.
    *   마감 기한 임박, 면접 전날 리마인드.
*   **Achievement**: 태스크 완료 시 경험치/배지 시스템(Gamification) 도입.

### 3.4 지원 파이프라인 (Application Pipeline)
*   **Pipeline Board**: 지원한 기업을 상태별로 시각화 (Applied -> Interview -> Offer).
*   **Smart Automation**:
    *   채용 사이트 URL 입력 시 메타태그 파싱하여 기업명/포지션 자동 입력 (OG Tag).
    *   "불합격" 상태 변경 시 "회고 작성" 팝업 유도.
*   **Insight**: 나의 파이프라인 상태 분석 (서류 통과율, 면접 합격률) 대시보드.

### 3.5 문서 관리 (Documents)
*   **Cloud Storage**: AWS S3 (Presigned URL) 기반 안전한 파일 업로드.
*   **Version Control**: 이력서/포트폴리오의 버전 관리 (v1, v2...) 및 차이점 메모.
*   **PDF Viewer**: 브라우저 내장 뷰어로 업로드된 문서 미리보기.
*   **Export**: 작성한 텍스트 데이터를 기반으로 표준 이력서 포맷(PDF) 생성 기능 (추후).

### 3.6 멘토링 마켓플레이스 (Mentoring)
*   **Booking System**:
    *   멘토의 가능 시간(Availability) 슬롯 기반 예약.
    *   예약 확정 시 구글 미트/줌 링크 자동 생성.
*   **Payment**:
    *   **Toss Payments** 연동 (Korean Payment Gateway).
    *   쿠폰/포인트 시스템 지원.
    *   에스크로(세션 완료 후 정산) 구조.
*   **Review & Report**:
    *   세션 종료 후 멘토의 상세 리포트 제출 필수.
    *   사용자의 평점 및 후기 작성.

### 3.7 구조화된 커뮤니티 (Structured Community)
*   **Structured Post**: 면접 후기, 연봉 정보 등 카테고리별 정형 데이터 입력 폼.
*   **Rich Editor**: Markdown 지원, 이미지 업로드, 코드 하이라이팅.
*   **Search**: Full-text Search (PostgreSQL TSV) 또는 Algolia 연동 검색.
*   **Interaction**: 좋아요, 댓글(대댓글), 북마크, 공유하기.
*   **Filtering**: 직군별, 연차별, 태그별 고급 필터링.

### 3.8 도쿄 정착 가이드 (Settlement Support)
*   **Interactive Checklist**: 입국일 D-Day 기준 자동 생성되는 정착 할 일 목록.
*   **Geo-Location**: 구청, 보건소, 추천 부동산 위치 지도 표시 (Google Maps API).
*   **Step-by-Step Guide**: 각 절차(전입신고, 통장개설)에 대한 상세 가이드 및 필수 서류 안내.

### 3.9 관리자 (Admin & Back-office)
*   **Architecture**:
    *   별도 프로젝트 (`admin/`)로 분리 개발.
    *   **Shared Database**: `web` 프로젝트와 동일한 PostgreSQL 데이터베이스 사용.
*   **Dashboard**:
    *   실시간 가입자, DAU/MAU, 매출 지표.
    *   콘텐츠 신고 현황 및 처리 대기열.
*   **User Management**: 사용자 검색, 차단, 권한 변경, 멘토 승인/거절.
*   **Content Management**: 공지사항 작성, 악성 게시글 숨김/삭제, 템플릿 관리.
*   **Audit Log**: 운영진의 모든 조치 기록(감사).

---

## 4. 기술 스택 (Tech Stack - Production)
*   **Frontend**: React 19, React Router 7, TailwindCSS v4, Framer Motion, Zustand.
*   **Backend**: Remix (RR7 Server Actions), Node.js.
*   **Database**: PostgreSQL 16 (Primary), Redis (Session/Cache).
*   **ORM**: Drizzle ORM.
*   **Storage**: AWS S3.
*   **Payment**: Toss Payments.
*   **Deploy**: Docker, AWS (ECS or App Runner) / Vercel (Frontend).
*   **CI/CD**: GitHub Actions (Test -> Build -> Deploy).
*   **Monitoring**: Sentry (Error), PostHog (Analytics).

## 5. 데이터 스키마 요약 (Expanded)
*   `users`: social_id, is_email_verified 추가.
*   `profiles`: job_detail, skills(json), recommendations(json) 추가.
*   `mentors`: availability(json), bank_info, verified_status.
*   `payments`: transaction_id, amount, currency, status.
*   `notifications`: type, payload, is_read.
*   `audit_logs`: admin_id, action, target_id, ip_address.
