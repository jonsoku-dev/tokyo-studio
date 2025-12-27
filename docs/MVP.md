MVP 요구사항 명세서 + API 계약 + 티켓 백로그 + 커뮤니티 구조화 스키마 + 멘토 운영 매뉴얼 (v0.1)

기준일: 2025-12-27 JST

범위: “일본 IT 취업 전 과정 지원 플랫폼” 1차 출시(MVP)

0. MVP 성공 정의(기능이 아니라 결과)
    

  

- 사용자가 “어떤 경로로 무엇을 언제까지 해야 하는지”를 15분 안에 결정하고 실행에 들어간다.
    
- 사용자가 지원 활동을 파이프라인으로 관리하며, 문서/일정 누락이 줄어든다.
    
- 멘토링이 “예약→세션→리포트→다음 행동 반영”으로 닫힌 루프를 만든다.
    
- 커뮤니티가 자유글이 아니라 “구조화된 후기/질문 데이터”를 축적한다.
    
- 도쿄 정착 최소 체크리스트를 제공해 입사 직후 붕괴를 줄인다.
    

  

1. 전제 및 금지사항(초기 폭발을 막는 선)
    

  

- 채용공고 스크래핑/재배포: 금지(약관/저작권/차단/품질 리스크)
    
- 유료 알선/수수료형 소개: 금지(법무/컴플라이언스 설계 전)
    
- 비자/행정: “공식 링크 + 체크리스트”로만 제공(법률 자문처럼 서술 금지)
    
- 레퍼럴 보드: MVP에서 잠금(기능 플래그로 비활성)
    

  

2. 사용자 역할과 권한(RBAC)
    

  

- USER: 일반 사용자(구직자)
    
- MENTOR: 멘토(세션 제공, 리뷰 제공)
    
- MODERATOR: 커뮤니티/문서 모더레이션
    
- ADMIN: 전체 운영(멘토 승인, 템플릿 관리, 신고 처리, 시스템 설정)
    

  

권한 핵심 원칙

- USER의 문서/파이프라인/로드맵은 본인만 접근(멘토는 “요청을 받은 범위”만 접근)
    
- 커뮤니티 글은 공개(작성자 식별은 닉네임/레벨만 노출 옵션)
    
- 신고/차단/삭제는 MODERATOR 이상
    
- 템플릿/체크리스트 템플릿 수정은 ADMIN만
    

  

3. 핵심 도메인(상태기계)
    

  

- 사용자 상태(고정): Discover → Decide → Build → Apply → Interview → Offer → Visa/COE → Arrive → Onboard(30/60/90) → Grow
    
- MVP에서는 상태를 “자동 분류”까지는 하지 않고, 다음으로 대체한다
    
    - 로드맵 태스크 진행률
        
    - 파이프라인 아이템 상태
        
    - 정착 체크리스트 진행률
        
        이 3개가 합쳐져 사용자의 현재 상태를 사실상 표현한다.
        
    

  

4. 화면별 요구사항(유저 스토리 + 수용 기준)
    

  

4.1 홈(대시보드)

목적

- “오늘 할 일”을 한 화면에 제시해서 이탈을 줄인다.
    

  

구성

- 오늘의 할 일(로드맵 태스크 중 due 임박/지연)
    
- 이번 주 목표(지원 수, 문서 업데이트, 멘토 세션)
    
- 파이프라인 요약(상태별 개수)
    
- 정착 체크리스트(해당자만)
    
- 추천 액션(예: 문서 리뷰 요청, 모의면접 예약)
    

  

유저 스토리

- 사용자는 로그인하면 해야 할 일을 우선순위로 본다.
    
- 사용자는 할 일을 체크하면 진행률이 즉시 반영된다.
    
- 사용자는 지연된 할 일이 있으면 경고를 본다.
    

  

수용 기준

- 로그인 후 2초 내 대시보드 핵심 위젯 렌더
    
- due-date 기반 정렬(지연 > 오늘 > 7일 이내 > 그 외)
    
- 파이프라인 상태 변경/태스크 완료가 즉시 반영(낙관적 업데이트 가능)
    

  

4.2 온보딩 진단(Diagnosis)

목적

- “경로 결정”을 강제하고, 로드맵/채널 전략을 생성한다.
    

  

입력 항목(필수)

- 직군(job_family), 레벨(level), 경력년수(years), 일본어 수준(jp_level), 영어 수준(en_level)
    
- 희망 지역(target_city: Tokyo default), 희망 근무형태(work_style), 해외지원 가능 여부(yes/no)
    
    입력 항목(선택)
    
- 학력(학사/석사/박사/기타), 현재 상태(학생/재직/구직/유학생), 희망 연봉 구간
    

  

출력

- 채널 믹스(영어권/일본어권/스카우트/에이전트) 추천과 이유
    
- 12주 로드맵(산출물 중심) 초안 생성
    
- 추천 멘토 유형(진단/서류/면접)과 우선순위
    

  

유저 스토리

- 사용자는 10분 내 진단을 끝내고 결과를 받는다.
    
- 사용자는 결과를 저장하고 언제든 수정한다.
    
- 사용자는 결과 기반으로 멘토 추천을 받는다.
    

  

수용 기준

- 필수 입력 누락 시 저장 불가
    
- 결과 화면에 “왜 이 채널 조합인가”가 최소 3개 근거로 표시
    
- 로드맵 생성이 자동으로 이뤄지고, 바로 편집 가능
    

  

4.3 로드맵(12주 플랜)

목적

- 학습이 아니라 “채용 가능한 증거”를 만드는 태스크 운영.
    

  

구성

- 주차별 태스크(산출물: 프로젝트, 문서, 테스트, 발표/글, 일본어 면접 준비 등)
    
- 태스크 상태: todo / doing / done / blocked
    
- 증빙 링크 첨부(깃헙, 배포 URL, 문서 링크)
    
- 멘토 피드백 연결(세션 리포트/문서 리뷰 코멘트가 태스크에 귀속)
    

  

유저 스토리

- 사용자는 태스크를 완료하고 증빙 링크를 붙인다.
    
- 사용자는 막힌 태스크를 표시하고 도움 요청을 한다.
    
- 멘토 세션 결과가 자동으로 다음 태스크로 반영된다.
    

  

수용 기준

- 태스크 편집(제목/설명/기한/증빙) 가능
    
- 태스크 완료 시 진행률과 홈 위젯 즉시 반영
    
- blocked 태스크는 “도움 요청” CTA가 노출
    

  

4.4 채널 디렉토리(Jobs / Channels)

목적

- 채용공고를 모으는 게 아니라, “어디서 구직할지”를 표준화한다.
    

  

구성

- 채널 카드(영어권/일본어권/스카우트/에이전트/공공지원)
    
- 필터: 언어 요구(영/일), 레벨, 해외지원 가능성(설명), 도쿄 우선 태그
    
- 각 채널: 장점/단점/주의점/추천 대상(진단 결과로 강조)
    

  

유저 스토리

- 사용자는 본인 전략에 맞는 채널을 선택해 즐겨찾기한다.
    
- 사용자는 채널별 체크리스트(가입/프로필 작성/서류 준비)를 본다.
    

  

수용 기준

- 채널 즐겨찾기 저장
    
- “채널별 준비 체크리스트” 최소 5개 항목 제공(템플릿 기반)
    

  

4.5 저장함(Saved Items)

목적

- 공고 링크를 안전하게 저장하고, 파이프라인으로 전환한다.
    

  

구성

- 저장 아이템: company_name, position_title, url, channel_type, tags, memo
    
- 액션: 파이프라인으로 이동(Convert)
    

  

수용 기준

- URL만 있어도 저장 가능
    
- Convert 시 파이프라인 아이템 생성 + 상태 “관심”으로 시작
    

  

4.6 지원 파이프라인(칸반 + 캘린더)

목적

- 지원을 프로젝트처럼 운영(누락 제거).
    

  

상태

- interested → applied → assignment → interview_1 → interview_2 → interview_3 → offer → visa_coe → joined → rejected → withdrawn
    

  

필드

- company_name, position_title, channel_type, current_status
    
- next_action_at(다음 행동 날짜), events(면접일정/과제마감), notes
    
- linked_documents(제출한 문서 버전들)
    

  

유저 스토리

- 사용자는 지원 건을 추가하고 상태를 이동한다.
    
- 사용자는 다음 행동 날짜를 설정하고 알림을 받는다.
    
- 사용자는 제출했던 문서 버전을 재현한다.
    

  

수용 기준

- 상태 드래그앤드롭 이동
    
- next_action_at이 오늘이면 홈에 상단 노출
    
- 문서 링크가 없는 applied 상태는 경고 표시(“제출 문서 연결 필요”)
    

  

4.7 문서(템플릿 + 내 문서 + 리뷰)

목적

- 문서 품질을 올리고, 버전/제출 이력을 남긴다.
    

  

문서 타입

- resume_jp, resume_en, shokumu_keirekisho, pr_shiboudouki, interview_answers, offer_compare
    

  

흐름

- 템플릿에서 생성(초안) → 사용자 편집 → 파일 업로드/내보내기(PDF) → 리뷰 요청 → 멘토 코멘트 → 리비전 → 완료
    

  

유저 스토리

- 사용자는 템플릿으로 문서를 시작한다.
    
- 사용자는 특정 파이프라인 아이템에 “제출 버전”을 연결한다.
    
- 사용자는 멘토 리뷰를 받아 개선한다.
    

  

수용 기준

- 문서 버전이 누적되고, 각 버전의 생성일/제출처 기록
    
- 리뷰 요청 시 “목표 포지션/채널/언어”를 필수로 입력
    
- 리뷰 코멘트는 항목 단위(섹션/문장)로 남길 수 있음(최소: 범위 선택 + 코멘트)
    

  

4.8 멘토링(멘토 탐색/예약/세션/리포트)

목적

- 멘토링이 “상담”에서 끝나지 않고 다음 행동을 만든다.
    

  

세션 타입

- diagnosis, document_review, mock_interview
    

  

예약 흐름

- 멘토 추천(진단 결과 기반) → 슬롯 선택 → 결제(선택: MVP에서 무료/쿠폰 기반으로도 가능) → 캘린더 이벤트 생성(내부) → 세션 진행 → 리포트 제출 → 로드맵/파이프라인에 반영
    

  

유저 스토리

- 사용자는 목적에 맞는 멘토를 추천받아 예약한다.
    
- 멘토는 세션 후 결과 리포트를 제출한다.
    
- 사용자는 리포트 기반으로 다음 행동을 수행한다.
    

  

수용 기준

- 세션 종료 후 24시간 내 리포트 제출 미완료 시 멘토에게 자동 리마인드
    
- 리포트에는 “다음 3개 액션”이 필수(로드맵 태스크로 자동 생성 옵션)
    
- 사용자 평점/피드백 제출이 완료되어야 세션 종료 상태가 된다
    

  

4.9 커뮤니티(구조화)

목적

- 정보의 신뢰도를 올리고 검색 가능한 지식베이스를 만든다.
    

  

카테고리(MVP)

- QNA_ROUTE(경로/채널 질문)
    
- INTERVIEW_REVIEW(면접 후기)
    
- PORTFOLIO_REVIEW(포트폴리오 피드백 요청)
    

  

구조화 필드(면접 후기 필수)

- company (선택적 블라인드), role, level, language_used(ja/en/mix), rounds_count, format(online/onsite), assignment(yes/no), topics(tags), outcome(optional), date_month(YYYY-MM), notes(자유)
    

  

수용 기준

- INTERVIEW_REVIEW는 구조화 필드 누락 시 게시 불가
    
- 신고 기능 필수(스팸/기밀/개인정보/사기)
    
- MODERATOR는 게시글 숨김/수정요청/삭제 가능
    

  

4.10 정착(도쿄) 체크리스트

목적

- 입사 직후 붕괴를 줄이는 최소 절차 운영.
    

  

구성(MVP)

- 입국일 입력
    
- D+14 필수 항목 체크리스트(거주지 등록 등)
    
- 첫 30일 항목(은행/통신/보험 등은 “일반 가이드” 수준)
    

  

수용 기준

- 입국일 기준으로 due_date 자동 생성
    
- 체크 완료/미완료에 따른 홈 노출
    
- 각 항목은 “설명 + 공식 링크 + 준비물”을 가진다(짧아도 됨)
    

  

4.11 운영자/모더레이션(Admin)

필수 기능

- 멘토 승인/정지
    
- 신고 큐 처리(사유, 조치 로그)
    
- 템플릿/체크리스트 템플릿 관리
    
- 사용자 차단/경고(커뮤니티 위반)
    

  

수용 기준

- 모든 조치는 감사 로그를 남긴다(actor, action, target, timestamp, reason)
    

  

5. API 계약(REST, JSON, JWT 기반)
    
    원칙
    

  

- DTO는 서버에서 검증(class-validator)
    
- 모든 쓰기 작업은 idempotency 고려(특히 문서 업로드/세션 생성)
    
- 응답에는 서버 시간(server_time) 포함(클라이언트 정렬 안정화)
    

  

5.1 Auth

- POST /auth/signup
    
    - req: email, password, locale
        
    - res: access_token, user
        
    
- POST /auth/login
    
    - req: email, password
        
    - res: access_token, user
        
    
- POST /auth/logout (옵션)
    
- GET /me
    
    - res: user, roles
        
    

  

5.2 Profile & Diagnosis

- PUT /profile
    
    - req: job_family, level, years, jp_level, en_level, target_city, work_style, salary_range?, status?
        
    - res: profile
        
    
- POST /diagnosis/run
    
    - req: profile + optional answers
        
    - res:
        
        - channel_mix: [{type, weight, reason[]}]
            
        - roadmap_template_id
            
        - mentor_recommendations: [{mentor_id, type, reason[]}]
            
        
    
- GET /diagnosis/latest
    

  

5.3 Roadmap

- POST /roadmaps
    
    - req: template_id
        
    - res: roadmap
        
    
- GET /roadmaps/:id
    
- PATCH /roadmaps/:id/tasks/:taskId
    
    - req: status, due_date?, proof_links?, title?, description?
        
    
- POST /roadmaps/:id/tasks
    
    - req: title, description, due_date, task_type
        
    
- GET /roadmaps/:id/progress
    

  

5.4 Channels

- GET /channels
    
    - query: language?, level?, visa_support_hint?, region?
        
    
- POST /channels/:id/favorite
    
- DELETE /channels/:id/favorite
    
- GET /channels/favorites
    

  

5.5 Saved Items

- POST /saved-items
    
    - req: company_name?, position_title?, url, channel_type, tags?, memo?
        
    
- GET /saved-items
    
- DELETE /saved-items/:id
    
- POST /saved-items/:id/convert-to-pipeline
    
    - res: pipeline_item
        
    

  

5.6 Pipeline

- POST /pipeline-items
    
    - req: company_name, position_title, channel_type, status?, url?, next_action_at?, notes?
        
    
- GET /pipeline-items
    
    - query: status?, sort?
        
    
- PATCH /pipeline-items/:id
    
    - req: status?, next_action_at?, notes?, events?
        
    
- POST /pipeline-items/:id/link-document
    
    - req: document_version_id
        
    
- GET /pipeline-items/:id
    

  

5.7 Documents

- POST /documents
    
    - req: doc_type, language, source_template_id?
        
    - res: document(id, current_version)
        
    
- POST /documents/:id/versions
    
    - req: content_meta + file_upload_token(or presigned url flow)
        
    - res: version
        
    
- GET /documents/:id
    
- GET /documents/:id/versions
    
- POST /documents/:id/request-review
    
    - req: purpose(document_review), target_pipeline_item_id?, target_role, target_language
        
    - res: review_request
        
    

  

5.8 Reviews (Mentor)

- GET /mentor/review-requests
    
- POST /mentor/reviews/:requestId/submit
    
    - req: comments[{range, text, severity}], summary, next_actions[]
        
    
- GET /documents/:id/reviews
    

  

5.9 Mentors & Sessions

- GET /mentors
    
    - query: tags(job_family, level), language, type(diagnosis/document_review/mock_interview)
        
    
- GET /mentors/:id
    
- POST /sessions
    
    - req: mentor_id, type, scheduled_at, context(pipeline_item_id?, document_ids?)
        
    
- GET /sessions (user)
    
- GET /mentor/sessions (mentor)
    
- POST /mentor/sessions/:id/report
    
    - req: outcome_summary, strengths, risks, next_actions[{title, due_date?, link_to(task/pipeline)}]
        
    
- POST /sessions/:id/rate
    
    - req: rating(1-5), feedback
        
    

  

5.10 Community

- POST /community/posts
    
    - req: category, title, body, tags, structured_fields
        
    
- GET /community/posts
    
    - query: category?, tags?, sort?
        
    
- GET /community/posts/:id
    
- POST /community/posts/:id/report
    
    - req: reason, detail
        
    
- PATCH /moderation/community/posts/:id
    
    - req: action(hide/request_edit/delete), reason
        
    

  

5.11 Settlement Checklist

- POST /settlement/tokyo
    
    - req: arrival_date
        
    - res: checklist
        
    
- GET /settlement/checklist
    
- PATCH /settlement/checklist/items/:id
    
    - req: completed(true/false)
        
    

  

5.12 Admin

- GET /admin/reports
    
- GET /admin/moderation-queue
    
- PATCH /admin/mentors/:id
    
    - req: status(approved/suspended), reason
        
    
- CRUD /admin/templates (docs, checklists)
    
- GET /admin/audit-logs
    

  

6. 커뮤니티 구조화 스키마(검증 규칙 포함)
    
    6.1 INTERVIEW_REVIEW 폼 필드
    

  

- required
    
    - role (enum: FE, BE, Mobile, Data, Infra, Security, QA, PM, Design, SalesEng, Other)
        
    - level (enum: Intern, Junior, Mid, Senior, Lead, Manager)
        
    - language_used (enum: ja, en, mix)
        
    - rounds_count (int 1-10)
        
    - format (enum: online, onsite, hybrid)
        
    - assignment (bool)
        
    - topics (string[] max 10, controlled tags 우선)
        
    - date_month (YYYY-MM)
        
    
- optional
    
    - company_display (enum: full, masked, hidden)
        
    - company_name (string, company_display가 full일 때만 저장/노출)
        
    - position_title (string)
        
    - outcome (enum: pass, fail, pending, withdraw)
        
    - notes (string max 3000)
        
    

  

검증

- rounds_count가 0이거나 10 초과면 거부
    
- notes에 개인정보 패턴(전화/이메일/주소/재류카드/여권 등) 탐지 시 게시 전 경고+차단 옵션
    
- company_display가 masked일 때 company_name은 내부 저장 가능(검색/노출은 마스킹 처리)
    

  

6.2 QNA_ROUTE 폼 필드

- required: route_type(영어권/일본어권/에이전트/유학생/전환/경력), question, context(profile snapshot)
    
- optional: jp_level, en_level, target_city, portfolio_link
    

  

6.3 PORTFOLIO_REVIEW 폼 필드

- required: target_role, repo_link or portfolio_link, what_to_review(enum: architecture, code_quality, testing, performance, docs, storytelling)
    
- required: constraints(시간/언어/목표 포지션)
    
- optional: screenshots, deployment_url
    

  

7. 멘토 운영 매뉴얼(MVP 운영 가능한 수준)
    
    7.1 멘토 모집/승인
    

  

- 지원서 필수 항목
    
    - 직군/레벨, 일본 취업 경로(영어권/일본어권/유학생/에이전트), 가능 언어(ko/ja/en)
        
    - 가능 세션 타입(진단/서류/면접)
        
    - 샘플 피드백 1개(문서 1페이지에 대한 코멘트 또는 모의면접 피드백)
        
    
- 승인 기준(최소)
    
    - 샘플 피드백이 “구체적 행동”을 제시하는지(추상적 칭찬/훈계는 탈락)
        
    - 특정 회사/개인정보 유도, 불법 알선 암시, 허위 경력 징후가 없는지
        
    
- 운영 규칙
    
    - 승인 전 멘토는 노출되지 않음
        
    - 초기에는 멘토 수를 제한(품질 확보가 최우선)
        
    

  

7.2 세션 표준 포맷

- Diagnosis(30~45분)
    
    - 입력: 프로필/목표/제약
        
    - 출력: 채널 전략 3줄, 12주 핵심 산출물 3개, 2주 단기 액션 5개
        
    
- Document Review(45~60분)
    
    - 입력: 문서 버전 + 목표 포지션
        
    - 출력: 수정 우선순위(상/중/하), 고쳐 쓸 문장 예시 5개, 제출 전 체크리스트
        
    
- Mock Interview(60분)
    
    - 입력: 포지션/언어/면접 타입
        
    - 출력: 강점 3, 리스크 3, 다음 답변 템플릿 3개, 추가 연습 과제
        
    

  

7.3 리포트 템플릿(제출 강제)

- 요약(3줄)
    
- 강점(근거 포함) 3개
    
- 리스크(근거 포함) 3개
    
- 다음 액션 3~7개(각 액션은 로드맵 태스크 또는 파이프라인 next_action으로 연결)
    
- 추천 채널/지원 전략(필요 시)
    
- 금지: “비자 확정” “합격 보장” 같은 확언
    

  

7.4 품질 지표와 제재

- 지표
    
    - 평균 평점(최근 20세션), 리포트 제출 지연률, 재예약률, 신고/클레임률
        
    
- 제재 룰(예시)
    
    - 리포트 24시간 내 미제출 3회: 신규 예약 잠금 7일
        
    - 평점 3.5 미만 지속: 노출 제한 + 재교육
        
    - 부적절 발언/알선 암시/개인정보 요구: 즉시 정지 + 조사
        
    

  

7.5 가격/결제(선택, MVP에서는 보류 가능)

- MVP는 “쿠폰/무료 베타”로 운영해도 된다.
    
- 유료화는 결제보다 “환불/분쟁/세금”이 본체라서, 제품이 닫힌 루프를 만든 다음 도입한다.
    

  

8. 티켓 백로그(에픽 단위, 의존성 포함)
    
    에픽 A: 인증/권한
    

  

- A1 JWT 기반 Auth(가입/로그인/me)
    
- A2 RBAC 미들웨어/가드(User/Mentor/Mod/Admin)
    

  

에픽 B: 프로필/진단/로드맵

- B1 프로필 CRUD + 검증
    
- B2 진단 엔진 v0(룰 기반 추천: 언어/레벨/경력/해외지원)
    
- B3 로드맵 템플릿 1종 생성 + 사용자 로드맵 생성/편집
    
- B4 홈 “오늘 할 일” 집계(로드맵+파이프라인+정착)
    

  

에픽 C: 저장함/파이프라인

- C1 Saved Items CRUD + Convert
    
- C2 Pipeline CRUD + 상태 전이 + next_action_at
    
- C3 칸반 UI + 캘린더 뷰(최소)
    

  

에픽 D: 문서/리뷰

- D1 템플릿 목록(메타) + 문서 생성
    
- D2 문서 버전 업로드(프리사인 URL 또는 서버 업로드)
    
- D3 리뷰 요청 생성 + 멘토 리뷰 큐
    
- D4 코멘트 저장 + 문서 화면 표시 + 제출 버전 링크
    

  

에픽 E: 멘토링

- E1 멘토 리스트/상세 + 추천(진단 결과 기반 단순 스코어링)
    
- E2 세션 예약/목록
    
- E3 멘토 리포트 제출 + 로드맵 태스크 자동 생성 옵션
    
- E4 세션 평점/피드백
    

  

에픽 F: 커뮤니티/모더레이션

- F1 게시글 CRUD(카테고리별 스키마 검증)
    
- F2 신고 기능 + 모더레이션 큐
    
- F3 개인정보/기밀 키워드 기본 필터(1차 룰 기반)
    

  

에픽 G: 도쿄 정착 체크리스트

- G1 입국일 입력 → 템플릿 기반 체크리스트 생성
    
- G2 항목 완료/미완료 + 홈 위젯 연결
    
- G3 항목 상세(설명/링크/준비물)
    

  

에픽 H: 운영/감사 로그/분석 이벤트

- H1 감사 로그 테이블 + 관리자 조회
    
- H2 주요 이벤트 로깅(진단 완료, 로드맵 생성, 지원 상태 변경, 리뷰 완료, 세션 리포트 완료, 후기 작성)
    

  

의존성(중요)

- B4 홈 집계는 B3/C2/G2 이후
    
- D3 리뷰 요청은 D2 문서 버전 이후
    
- E3 리포트→태스크 생성은 B3 로드맵 이후
    
- F2 모더레이션 큐는 F1 이후
    

  

9. 다음 실행(즉시 진행 순서)
    

  

- 1. 에픽 A, B1~B3 먼저(“결정→실행”이 MVP의 심장)
        
    
- 2. 에픽 C(지원 운영이 돌아가야 성과가 난다)
        
    
- 3. 에픽 D/E(멘토링 루프를 닫아야 재방문이 생긴다)
        
    
- 4. 에픽 F/G(신뢰 데이터와 정착 붕괴 방지)
        
    

  

원하면, 위 티켓을 “구현 단위(컴포넌트/엔드포인트/테스트 케이스)”로 더 쪼개서 바로 개발 스프린트에 넣을 수 있는 형태로 다시 내려준다.