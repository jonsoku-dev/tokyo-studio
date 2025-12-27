아래는 “바로 스프린트에 투입 가능한 구현 단위”로 쪼갠 백로그다.

형식: 티켓ID / 설명 / 산출물(컴포넌트·엔드포인트) / 테스트(필수 케이스) / 완료조건(DOD)

  

가정

- FE: React 19 + React Router 7 + Tailwind 4
    
- BE: NestJS + PostgreSQL
    
- 테스트: FE는 Vitest + RTL, BE는 Jest + Supertest + test DB
    
- 문서 업로드: MVP는 presigned URL(권장) 또는 단순 서버 업로드(선택). 아래는 presigned 기준.
    

  

Sprint 1 (핵심 흐름: “진단 → 로드맵 생성 → 파이프라인 운영”)

  

S1-A. 인증/권한

  

S1-A1 / Auth: 회원가입

- 산출물
    
    - FE: , , 
        
    - BE: POST /auth/signup
        
    
- 테스트
    
    - BE: 201 생성, 중복 이메일 409, 비밀번호 규칙 위반 400
        
    - FE: 필수값 미입력 시 제출 불가, API 오류 메시지 표시
        
    
- DOD
    
    - JWT 발급 + 사용자 정보 반환, FE에서 토큰 저장 및 리다이렉트
        
    

  

S1-A2 / Auth: 로그인

- 산출물
    
    - FE: , 
        
    - BE: POST /auth/login
        
    
- 테스트
    
    - BE: 잘못된 비번 401, 존재하지 않는 계정 401
        
    - FE: 성공 시 홈으로 이동, 실패 시 에러 표시
        
    
- DOD
    
    - “로그인 상태 유지” 리프레시 전략은 Sprint 2로 미룸(세션 단순화)
        
    

  

S1-A3 / Auth: 내 정보 조회 + 라우트 가드

- 산출물
    
    - FE: , , auth store(토큰/유저)
        
    - BE: GET /me
        
    
- 테스트
    
    - BE: 토큰 없으면 401, 유효 토큰이면 200
        
    - FE: 비로그인 접근 시 /login로 리다이렉트
        
    
- DOD
    
    - 라우터 가드가 모든 보호 라우트에 적용
        
    

  

S1-B. 프로필/진단/로드맵

  

S1-B1 / Profile: 프로필 CRUD(단일 화면)

- 산출물
    
    - FE: , 
        
    - BE: PUT /profile, GET /profile
        
    
- 테스트
    
    - BE: enum 검증 실패 400, 정상 저장 200
        
    - FE: 입력값 변경 후 저장 성공 토스트/표시, 새로고침 후 값 유지
        
    
- DOD
    
    - 필수 필드 누락 시 저장 불가(클라+서버 둘 다)
        
    

  

S1-B2 / Diagnosis: 진단 실행(룰 기반 v0)

- 산출물
    
    - FE: , , 
        
    - BE: POST /diagnosis/run, GET /diagnosis/latest
        
    - BE 내부: DiagnosisService(rule set)
        
    
- 테스트
    
    - BE: 입력에 따라 channel_mix weight 합 1.0(또는 100) 보장, reason 최소 3개
        
    - FE: 결과 화면 렌더, 저장된 최신 결과 재조회 표시
        
    
- DOD
    
    - 진단 결과가 서버에 저장되고 최신 결과로 조회 가능
        
    

  

S1-B3 / Roadmap: 템플릿 기반 로드맵 생성

- 산출물
    
    - FE: , , , 
        
    - BE: POST /roadmaps, GET /roadmaps/:id
        
    - BE 내부: roadmap_templates seed(12주 템플릿 1종)
        
    
- 테스트
    
    - BE: 생성 시 tasks N개(예: 30~60) 생성 확인, 기본 due_date 계산
        
    - FE: 생성 버튼 → 생성 완료 후 /roadmap/:id 이동
        
    
- DOD
    
    - 진단 결과에서 추천된 template_id로 1클릭 생성
        
    

  

S1-B4 / Roadmap: 태스크 상태 변경 + 증빙 링크

- 산출물
    
    - FE: , 
        
    - BE: PATCH /roadmaps/:id/tasks/:taskId
        
    
- 테스트
    
    - BE: 다른 사용자 태스크 수정 403, 정상 수정 200
        
    - FE: 낙관적 업데이트(실패 시 롤백) 동작
        
    
- DOD
    
    - status/due_date/proof_links가 저장되고 즉시 반영
        
    

  

S1-C. 저장함/파이프라인

  

S1-C1 / Saved Items: 링크 저장

- 산출물
    
    - FE: , , 
        
    - BE: POST /saved-items, GET /saved-items, DELETE /saved-items/:id
        
    
- 테스트
    
    - BE: url 형식 검증 400, 정상 저장 201
        
    - FE: 목록 갱신, 삭제 후 목록에서 제거
        
    
- DOD
    
    - URL만으로 저장 가능(회사명/포지션은 optional)
        
    

  

S1-C2 / Saved → Pipeline 변환

- 산출물
    
    - FE: 
        
    - BE: POST /saved-items/:id/convert-to-pipeline
        
    
- 테스트
    
    - BE: convert 후 pipeline_item 생성 + saved_item 상태 처리(삭제 or converted 플래그)
        
    - FE: convert 성공 시 파이프라인으로 이동 or 토스트 + 파이프라인에 보임
        
    
- DOD
    
    - 변환된 아이템은 중복 변환 불가(idempotent)
        
    

  

S1-C3 / Pipeline: CRUD + 상태 전이

- 산출물
    
    - FE: , , , , 
        
    - BE: POST /pipeline-items, GET /pipeline-items, PATCH /pipeline-items/:id, GET /pipeline-items/:id
        
    
- 테스트
    
    - BE: 상태 enum 검증 400, 권한 403
        
    - FE: 드래그 이동(또는 드롭다운)으로 status 변경, 실패 시 롤백
        
    
- DOD
    
    - 상태 전이 기록이 남고 UI가 일관되게 반영
        
    

  

S1-C4 / Pipeline: next_action_at + 홈 집계용 최소 API

- 산출물
    
    - FE: , 파이프라인 카드에 DUE 표시
        
    - BE: PATCH /pipeline-items/:id (next_action_at)
        
    
- 테스트
    
    - BE: ISO 날짜 검증, 과거/미래 모두 저장 가능(경고는 FE)
        
    - FE: next_action_at 오늘이면 강조 표시
        
    
- DOD
    
    - 홈 위젯에 “오늘 해야 할 파이프라인 액션”을 띄울 수 있는 데이터 확보
        
    

  

S1-D. 홈(대시보드) 최소 버전

  

S1-D1 / Dashboard: 집계 API

- 산출물
    
    - BE: GET /dashboard (권장, 기존 엔드포인트 조합도 가능)
        
        - 반환: due_tasks, due_pipeline_actions, counts_by_pipeline_status
            
        
    - FE: , , 
        
    
- 테스트
    
    - BE: due 기준 정렬(지연>오늘>7일), 결과 개수 제한(예: 상위 20)
        
    - FE: 위젯 렌더, 빈 상태 UI
        
    
- DOD
    
    - 로그인 후 “다음 행동”이 즉시 보임
        
    

  

Sprint 2 (“문서/리뷰 + 멘토링 루프” 닫기)

  

S2-E. 문서/버전/업로드

  

S2-E1 / Documents: 템플릿 목록 + 문서 생성

- 산출물
    
    - FE: , , 
        
    - BE: GET /templates?type=document, POST /documents
        
    
- 테스트
    
    - BE: doc_type 허용값 외 400
        
    - FE: 템플릿 선택 → 문서 생성 후 문서 상세로 이동
        
    
- DOD
    
    - 문서가 “current_version null”로 생성됨
        
    

  

S2-E2 / Upload: presigned URL 발급

- 산출물
    
    - BE: POST /uploads/presign (req: filename, mime, size) -> res: url, fields(or headers), upload_token
        
    - FE: upload util + 
        
    
- 테스트
    
    - BE: 파일 사이즈 상한 초과 400, mime 제한 400
        
    - FE: 업로드 진행률, 실패 재시도(1회)
        
    
- DOD
    
    - 프론트에서 S3 업로드 완료 후 서버에 version 생성 가능
        
    

  

S2-E3 / Documents: 버전 생성(업로드 완료 후 메타 등록)

- 산출물
    
    - BE: POST /documents/:id/versions (req: upload_token, meta)
        
    - FE: , , 
        
    
- 테스트
    
    - BE: upload_token 유효성 검증 400/401, 버전 증가(1,2,3…)
        
    - FE: 새 버전 생성 후 히스토리에 추가, current_version 갱신
        
    
- DOD
    
    - 버전 히스토리 조회 가능
        
    

  

S2-E4 / Pipeline: 문서 버전 연결

- 산출물
    
    - FE: 
        
    - BE: POST /pipeline-items/:id/link-document
        
    
- 테스트
    
    - BE: 다른 사용자 문서 연결 403, 정상 연결 200
        
    - FE: 연결 후 파이프라인 카드/상세에 “제출 문서” 표시
        
    
- DOD
    
    - applied 상태인데 문서 없으면 경고(클라)
        
    

  

S2-F. 문서 리뷰(멘토)

  

S2-F1 / Review Request: 리뷰 요청 생성

- 산출물
    
    - FE: 
        
    - BE: POST /documents/:id/request-review
        
    
- 테스트
    
    - BE: target_language/role 누락 400
        
    - FE: 요청 성공 후 “대기중” 상태 표기
        
    
- DOD
    
    - 리뷰 요청이 멘토 큐에서 조회 가능
        
    

  

S2-F2 / Mentor: 리뷰 요청 큐 조회

- 산출물
    
    - FE(멘토 전용): , 
        
    - BE: GET /mentor/review-requests
        
    
- 테스트
    
    - BE: 멘토 권한 아니면 403
        
    - FE: 큐 목록 페이징/필터(최소: doc_type)
        
    
- DOD
    
    - 멘토가 할당/처리할 수 있는 리스트 확보
        
    

  

S2-F3 / Mentor: 리뷰 제출(코멘트 + 요약 + 다음 액션)

- 산출물
    
    - FE(멘토): ,  (범위 선택 최소 구현: 섹션 선택)
        
    - BE: POST /mentor/reviews/:requestId/submit
        
    
- 테스트
    
    - BE: next_actions 최소 3개 미만이면 400, 제출 후 request 상태 “completed”
        
    - FE: 제출 후 사용자 문서 화면에 리뷰 표시
        
    
- DOD
    
    - 리뷰 완료가 사용자 로드맵 태스크 생성(옵션)까지 이어짐(아래 S2-H1)
        
    

  

S2-G. 멘토링 세션(예약/리포트)

  

S2-G1 / Mentors: 리스트/상세/추천(단순 스코어)

- 산출물
    
    - FE: , , 
        
    - BE: GET /mentors, GET /mentors/:id
        
    
- 테스트
    
    - BE: 필터(job_family, type, language) 동작
        
    - FE: 진단 결과가 있으면 추천 섹션 노출
        
    
- DOD
    
    - 사용자가 목적별로 멘토를 탐색 가능
        
    

  

S2-G2 / Sessions: 예약 생성

- 산출물
    
    - FE: , 
        
    - BE: POST /sessions, GET /sessions (user)
        
    
- 테스트
    
    - BE: 과거 시간 예약 400, 멘토 가용시간 외 409(간단히 중복 방지)
        
    - FE: 예약 성공 후 세션 목록에 노출
        
    
- DOD
    
    - 최소한 “예약 생성/조회”가 동작(캘린더 연동은 Sprint 3)
        
    

  

S2-G3 / Mentor: 세션 리포트 제출(강제 포맷)

- 산출물
    
    - FE(멘토): 
        
    - BE: POST /mentor/sessions/:id/report
        
    
- 테스트
    
    - BE: next_actions 최소 3개 미만 400, 제출 후 세션 상태 “reported”
        
    - FE: 사용자 세션 상세에 리포트 표시
        
    
- DOD
    
    - 리포트 제출이 “다음 액션”으로 연결(아래 S2-H1)
        
    

  

S2-G4 / Session rating

- 산출물
    
    - FE: 
        
    - BE: POST /sessions/:id/rate
        
    
- 테스트
    
    - BE: rating 범위 1~5 아니면 400
        
    - FE: 평점 제출 전까지 “세션 종료” 배지 미표시
        
    
- DOD
    
    - 멘토 품질 지표 수집 가능
        
    

  

S2-H. “닫힌 루프” 자동화(로드맵 연동)

  

S2-H1 / Next Actions → 로드맵 태스크 자동 생성(옵션)

- 산출물
    
    - BE: 내부 유스케이스
        
        - ReviewSubmit/SessionReport 제출 시 next_actions를 roadmap task로 생성(사용자 선택 플래그 지원)
            
        
    - FE:  (체크박스로 일부만 추가 가능)
        
    
- 테스트
    
    - BE: 로드맵 없으면 409 + 생성 유도, 있으면 tasks 생성
        
    - FE: 선택한 액션만 태스크로 추가, 홈/로드맵에 즉시 반영
        
    
- DOD
    
    - 멘토링이 “다음 행동”을 실제 태스크로 만든다
        
    

  

Sprint 3 (커뮤니티 구조화 + 모더레이션 + 정착 체크리스트)

  

S3-I. 커뮤니티(구조화 게시)

  

S3-I1 / Community: 게시글 작성(QNA)

- 산출물
    
    - FE: , , 
        
    - BE: POST /community/posts (category=QNA_ROUTE), GET /community/posts
        
    
- 테스트
    
    - BE: route_type 누락 400
        
    - FE: 작성 성공 후 상세로 이동
        
    
- DOD
    
    - QNA 게시글 기본 흐름 동작
        
    

  

S3-I2 / Community: 면접 후기 작성(구조화 필수)

- 산출물
    
    - FE:  (role, level, language_used, rounds_count, format, assignment, topics, date_month 필수)
        
    - BE: POST /community/posts (category=INTERVIEW_REVIEW) + 서버 스키마 검증
        
    
- 테스트
    
    - BE: 필수 구조화 필드 누락 400, rounds_count 범위 외 400
        
    - FE: 필수값 미입력 시 제출 비활성, topic 최대 10개 제한
        
    
- DOD
    
    - “구조화 누락 방지”가 클라+서버 모두에서 보장
        
    

  

S3-I3 / Community: 포트폴리오 리뷰 요청(구조화)

- 산출물
    
    - FE: 
        
    - BE: POST /community/posts (category=PORTFOLIO_REVIEW)
        
    
- 테스트
    
    - BE: repo/portfolio 링크 둘 다 없으면 400
        
    - FE: 링크 검증, 제출 성공
        
    
- DOD
    
    - 포트폴리오 리뷰 요청이 데이터로 쌓임
        
    

  

S3-J. 신고/모더레이션

  

S3-J1 / Community: 신고 기능

- 산출물
    
    - FE: 
        
    - BE: POST /community/posts/:id/report
        
    
- 테스트
    
    - BE: reason 누락 400, 동일 사용자 중복 신고 409(또는 누적)
        
    - FE: 신고 후 버튼 비활성/상태 표기
        
    
- DOD
    
    - 신고 데이터가 모더레이션 큐로 들어감
        
    

  

S3-J2 / Moderation: 큐 조회 + 조치(숨김/수정요청/삭제)

- 산출물
    
    - FE(모더레이터): , 
        
    - BE: GET /admin/moderation-queue, PATCH /moderation/community/posts/:id
        
    - BE: audit log 기록
        
    
- 테스트
    
    - BE: 권한 없으면 403, 조치 후 게시글 상태 변경
        
    - FE: 큐에서 처리 후 제거/상태 변경
        
    
- DOD
    
    - 운영자가 스팸/기밀을 처리할 수 있음
        
    

  

S3-J3 / 1차 개인정보 필터(룰 기반)

- 산출물
    
    - BE: 게시글 생성 시 텍스트 스캔(이메일/전화/주소 패턴) → 경고 or 차단 플래그
        
    - FE: 차단 사유 UI
        
    
- 테스트
    
    - BE: 이메일 포함 시 blocked=true 반환(정책에 따라)
        
    - FE: 사용자에게 수정 안내
        
    
- DOD
    
    - 최소한의 사고 예방 장치 확보
        
    

  

S3-K. 도쿄 정착 체크리스트

  

S3-K1 / 체크리스트 생성(입국일 기반)

- 산출물
    
    - FE: , , 
        
    - BE: POST /settlement/tokyo, GET /settlement/checklist
        
    - BE: tokyo checklist template seed
        
    
- 테스트
    
    - BE: arrival_date 기준 due_date 계산, 중복 생성 방지(이미 있으면 409 또는 update)
        
    - FE: 생성 후 목록 렌더
        
    
- DOD
    
    - 입국일 입력만으로 체크리스트 생성
        
    

  

S3-K2 / 체크리스트 항목 완료 처리

- 산출물
    
    - FE:  (toggle)
        
    - BE: PATCH /settlement/checklist/items/:id
        
    
- 테스트
    
    - BE: 다른 사용자 항목 변경 403
        
    - FE: 완료 토글 즉시 반영
        
    
- DOD
    
    - 홈 대시보드에 정착 due 표시 가능
        
    

  

S3-K3 / 체크리스트 항목 상세(설명/공식 링크/준비물)

- 산출물
    
    - FE: 
        
    - BE: 템플릿에 description/link/requirements 포함
        
    
- 테스트
    
    - FE: 링크 클릭 시 새 탭
        
    - BE: 템플릿 변경이 사용자 인스턴스에 반영되는 정책(스냅샷 vs 참조) 테스트
        
    
- DOD
    
    - 최소 안내 수준 확보(법률자문 금지 문구 포함)
        
    

  

공통(모든 Sprint에 적용) 테스트/품질 티켓

  

Q1 / API 계약 테스트 스위트(스냅샷 금지)

- 산출물
    
    - BE: Supertest로 주요 엔드포인트 성공/실패 케이스(표준 에러 포맷 포함)
        
    
- 필수 케이스
    
    - 401/403/400/409 공통 포맷 검증
        
    - 소유권 검증(타 유저 리소스 접근 차단)
        
    
- DOD
    
    - CI에서 통과, 회귀 방지
        
    

  

Q2 / FE 통합 테스트(핵심 플로우)

- 산출물
    
    - FE: 진단→로드맵→저장→파이프라인 전환 플로우 RTL 테스트
        
    
- 필수 케이스
    
    - 로그인 가드, 폼 검증, API 실패 시 UX
        
    
- DOD
    
    - 핵심 사용자 여정이 깨지면 테스트가 잡는다
        
    

  

Q3 / 접근성/폼 검증 기본 규칙

- 산출물
    
    - FE: 폼 컴포넌트 공통 규칙(aria, error message 연결)
        
    
- 필수 케이스
    
    - required field에 error가 연결됨, 키보드 탭 이동 가능
        
    
- DOD
    
    - 최소 접근성 사고 방지
        
    

  

Q4 / 감사 로그(Audit Log) 최소 구현(운영 필수)

- 산출물
    
    - BE: audit_logs 테이블 + 기록 미들웨어(모더레이션, 멘토 상태 변경, 템플릿 변경)
        
    
- 테스트
    
    - 관리자 액션 후 audit row 생성 확인
        
    
- DOD
    
    - 운영상 분쟁/추적 가능
        
    

  

스프린트 투입을 위한 “Definition of Done”(전 티켓 공통)

- BE
    
    - DTO 검증(400), 권한(401/403), 도메인 충돌(409) 처리
        
    - e2e 테스트 1개 이상 포함(해당 기능 핵심 엔드포인트)
        
    - 마이그레이션/시드 포함(템플릿/체크리스트/기본 채널)
        
    
- FE
    
    - 로딩/에러/빈 상태 UI 포함
        
    - 주요 상호작용 RTL 테스트 1개 이상
        
    - URL 상태(라우팅)와 데이터 상태 불일치 방지
        
    

  

추가로 바로 만들어야 하는 “시드 데이터” 티켓(초기 서비스 품질의 핵)

- SEED-1 채널 디렉토리 시드(영어/일본어/스카우트/에이전트/공공지원 카드)
    
- SEED-2 12주 로드맵 템플릿 1종(직군 공통) + 직군별 변형은 Sprint 4
    
- SEED-3 도쿄 정착 체크리스트 템플릿(최소 항목 8~12개)
    

  

원하면, 위 티켓을 그대로 Jira/Linear에 붙여넣기 좋게 “JSON/CSV” 형태로도 변환해서 내릴 수 있다.