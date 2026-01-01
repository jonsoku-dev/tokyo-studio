# Feature Specification: Document Integration Across Features

**Feature Branch**: `022-document-integration`
**Created**: 2026-01-01
**Status**: Draft
**Depends On**: SPEC 006 (S3 Storage), SPEC 007 (Document Management), SPEC 012 (Mentor Booking), SPEC 018 (Job Posting Parser)

## Overview

이 스펙은 문서 관리 시스템(SPEC 007)을 다른 핵심 기능들과 통합하는 방법을 정의합니다. 사용자가 업로드한 경력 문서(이력서, CV, 포트폴리오, 자기소개서)를 채용 파이프라인, 멘토링 세션, 프로필에서 활용할 수 있도록 합니다.

### 핵심 통합 영역

1. **Pipeline ↔ Documents**: 채용 지원에 이력서 첨부
2. **Mentoring ↔ Documents**: 멘토링 세션에서 문서 공유/검토
3. **Profile ↔ Documents**: 공개 프로필에 포트폴리오 연결
4. **Roadmap ↔ Documents**: 문서 업로드 태스크 완료 확인

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Attach Resume to Job Application (Priority: P1)

사용자가 특정 회사에 지원할 때 어떤 버전의 이력서로 지원했는지 기록하고 싶습니다. 나중에 면접 준비 시 해당 지원에 사용한 이력서를 빠르게 확인할 수 있어야 합니다.

**Why this priority**: 채용 파이프라인의 핵심 사용 사례. 사용자가 여러 버전의 이력서를 관리할 때 어떤 버전을 어디에 제출했는지 추적하는 것이 필수.

**Independent Test**: 파이프라인 아이템에 이력서를 첨부하고, 나중에 해당 아이템에서 첨부된 이력서를 확인할 수 있는지 테스트.

**Acceptance Scenarios**:

1. **Given** 사용자가 파이프라인 아이템 편집 모달을 열었을 때, **When** "이력서 첨부" 드롭다운을 클릭하면, **Then** 사용자의 문서 목록(Resume/CV 타입)이 표시됨
2. **Given** 사용자가 문서를 선택했을 때, **When** 저장 버튼을 클릭하면, **Then** 파이프라인 아이템에 해당 문서 ID가 저장됨
3. **Given** 파이프라인 아이템에 이력서가 첨부되어 있을 때, **When** 아이템 카드를 보면, **Then** 첨부된 이력서 이름이 표시되고 클릭 시 미리보기 가능
4. **Given** 첨부된 문서가 삭제되었을 때, **When** 파이프라인 아이템을 보면, **Then** "문서 삭제됨" 상태 표시 (resumeId = null로 설정)
5. **Given** 사용자가 이력서를 첨부하지 않고 저장할 때, **When** 저장이 완료되면, **Then** resumeId는 null로 유지됨 (선택 사항)

---

### User Story 2 - Share Documents in Mentoring Session (Priority: P1)

멘티가 멘토링 세션에서 자신의 이력서나 포트폴리오를 멘토와 공유하여 피드백을 받고 싶습니다. 멘토는 세션 중 멘티의 문서를 열람하고 구체적인 조언을 제공할 수 있어야 합니다.

**Why this priority**: 멘토링의 핵심 가치. 추상적인 조언보다 실제 문서를 보면서 구체적인 피드백을 제공하는 것이 효과적.

**Independent Test**: 멘토링 세션 생성/편집 시 문서를 공유하고, 멘토가 해당 문서에 접근할 수 있는지 테스트.

**Acceptance Scenarios**:

1. **Given** 멘티가 멘토링 세션을 예약할 때, **When** "문서 공유" 버튼을 클릭하면, **Then** 자신의 문서 목록에서 공유할 문서를 선택 가능
2. **Given** 멘티가 복수의 문서를 선택했을 때, **When** 예약을 완료하면, **Then** 선택된 문서 ID 배열이 세션에 저장됨
3. **Given** 멘토가 세션 상세를 볼 때, **When** 멘티가 공유한 문서가 있으면, **Then** 공유된 문서 목록이 표시되고 미리보기/다운로드 가능
4. **Given** 멘티가 공유 문서를 수정(추가/제거)하고 싶을 때, **When** 세션 편집에서 문서를 변경하면, **Then** 변경 사항이 저장됨
5. **Given** 멘토가 멘티의 문서를 볼 때, **When** 문서를 클릭하면, **Then** PDF 뷰어에서 문서가 열림 (읽기 전용)
6. **Given** 세션이 완료되었을 때, **When** 세션 기록을 보면, **Then** 공유되었던 문서 이력이 유지됨

---

### User Story 3 - Showcase Portfolio on Profile (Priority: P2)

사용자가 자신의 공개 프로필에 대표 포트폴리오를 연결하여 다른 사용자(멘토, 커뮤니티 멤버)에게 자신의 실력을 보여주고 싶습니다.

**Why this priority**: 전문성 증명에 도움. 그러나 직접적인 취업 활동보다는 부차적.

**Independent Test**: 프로필 설정에서 포트폴리오 문서를 선택하고, 공개 프로필에서 해당 문서 링크가 표시되는지 테스트.

**Acceptance Scenarios**:

1. **Given** 사용자가 프로필 설정 페이지에 있을 때, **When** "대표 포트폴리오" 드롭다운을 클릭하면, **Then** Portfolio 타입 문서 목록이 표시됨
2. **Given** 사용자가 포트폴리오를 선택했을 때, **When** 저장 버튼을 클릭하면, **Then** profiles.portfolioDocumentId가 업데이트됨
3. **Given** 사용자가 공개 프로필을 조회할 때, **When** 포트폴리오가 설정되어 있으면, **Then** "포트폴리오 보기" 버튼/링크가 표시됨
4. **Given** 방문자가 "포트폴리오 보기"를 클릭했을 때, **When** 문서에 접근하면, **Then** PDF 뷰어에서 문서가 열림 (읽기 전용)
5. **Given** 포트폴리오 문서가 삭제되었을 때, **When** 프로필을 조회하면, **Then** 포트폴리오 링크 숨김 처리

---

### User Story 4 - Track Document Tasks in Roadmap (Priority: P3)

사용자가 로드맵의 "이력서 작성" 태스크를 완료할 때, 실제로 이력서를 업로드했는지 확인하고 싶습니다.

**Why this priority**: 편의 기능. 태스크 완료를 수동으로 체크해도 되지만, 자동 검증이 있으면 더 유용.

**Independent Test**: 문서 관련 태스크에서 자동 완료 확인 로직 테스트.

**Acceptance Scenarios**:

1. **Given** 로드맵에 "이력서 업로드" 태스크가 있을 때, **When** 사용자가 문서 페이지에서 이력서를 업로드하면, **Then** 태스크 옆에 "✓ 문서 업로드됨" 인디케이터 표시
2. **Given** 태스크에 문서 확인 기능이 연결되어 있을 때, **When** 사용자가 태스크를 완료 표시하면, **Then** 실제 문서 존재 여부 힌트 표시 (강제 아님)

---

## Edge Cases

- 멘토링 세션에서 공유된 문서가 세션 중 삭제된 경우 어떻게 처리할까?
  → 세션에는 문서 ID 참조 유지, UI에서 "문서를 찾을 수 없음" 표시

- 파이프라인 아이템에 첨부된 이력서가 삭제된 경우?
  → resumeId는 SET NULL로 처리, UI에서 "첨부 문서 없음" 표시

- 공유 문서의 접근 권한 관리?
  → 문서 소유자의 문서만 공유 가능, 멘토는 세션에 연결된 문서에만 접근 가능

- 대용량 포트폴리오(50MB+)를 프로필에 연결한 경우?
  → 기존 문서 업로드 제한(10MB) 적용, 프로필 연결에 추가 제한 없음

- 문서 타입 불일치 방지?
  → Pipeline: Resume/CV만 선택 가능, Profile: Portfolio만 선택 가능 (UI 필터링)

---

## Requirements *(mandatory)*

### Functional Requirements

#### Pipeline Integration
- **FR-PI-001**: 파이프라인 아이템에 resumeId FK 필드 존재해야 함 (documents 테이블 참조)
- **FR-PI-002**: 파이프라인 아이템 생성/편집 시 이력서 첨부 옵션 제공
- **FR-PI-003**: 이력서는 Resume 또는 CV 타입의 문서만 선택 가능
- **FR-PI-004**: 첨부된 이력서 삭제 시 resumeId NULL 처리 (ON DELETE SET NULL)
- **FR-PI-005**: 파이프라인 아이템 카드에 첨부된 이력서 표시 (이름, 미리보기 링크)

#### Mentoring Integration
- **FR-ME-001**: 멘토링 세션에 sharedDocumentIds JSONB 배열 필드 존재해야 함
- **FR-ME-002**: 멘토링 세션 생성/편집 시 문서 공유 옵션 제공
- **FR-ME-003**: 멘티만 자신의 문서를 공유할 수 있음 (소유권 확인)
- **FR-ME-004**: 멘토는 세션에 공유된 문서에 읽기 전용 접근 가능
- **FR-ME-005**: 공유 문서 최대 개수: 5개
- **FR-ME-006**: 세션 완료 후에도 공유 이력 유지 (감사 목적)

#### Profile Integration
- **FR-PR-001**: profiles 테이블에 portfolioDocumentId FK 필드 존재해야 함
- **FR-PR-002**: 프로필 설정에서 대표 포트폴리오 선택 UI 제공
- **FR-PR-003**: Portfolio 타입 문서만 선택 가능
- **FR-PR-004**: 공개 프로필에서 포트폴리오 미리보기 링크 표시
- **FR-PR-005**: 포트폴리오 문서의 공개 접근 시 presigned URL 사용 (제한 시간)
- **FR-PR-006**: 포트폴리오 삭제 시 portfolioDocumentId NULL 처리

#### Roadmap Integration (Optional)
- **FR-RO-001**: 문서 관련 태스크에 문서 존재 여부 힌트 표시
- **FR-RO-002**: 강제 연결 없음, 사용자가 수동으로 태스크 완료 처리

### Non-Functional Requirements

- **NFR-001**: 문서 접근 권한 체크 응답 시간 < 100ms
- **NFR-002**: 공유 문서 presigned URL 만료 시간: 1시간
- **NFR-003**: 멘토링 세션당 공유 문서 최대 5개 제한으로 성능 유지

---

## Key Entities

### PipelineItem (Extended)

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| resumeId | UUID | 첨부된 이력서 문서 ID | FK → documents.id, ON DELETE SET NULL |

### MentoringSession (Extended)

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| sharedDocumentIds | UUID[] | 공유된 문서 ID 배열 | JSONB, 최대 5개 |

### Profile (Extended)

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| portfolioDocumentId | UUID | 대표 포트폴리오 문서 ID | FK → documents.id, ON DELETE SET NULL |

---

## API Specification

### Pipeline APIs

#### PATCH /api/pipeline/items/:id
이력서 첨부 포함 파이프라인 아이템 업데이트

**Request Body**:
```json
{
  "company": "Sony",
  "position": "Frontend Engineer",
  "stage": "applied",
  "resumeId": "uuid-of-resume-document"  // Optional, null to remove
}
```

**Response**: Updated pipeline item with resume info

---

### Mentoring APIs

#### POST /api/mentoring/sessions/:id/share-documents
세션에 문서 공유

**Request Body**:
```json
{
  "documentIds": ["uuid-1", "uuid-2"]
}
```

**Response**: Updated session with shared documents

#### GET /api/mentoring/sessions/:id/shared-documents
세션에 공유된 문서 조회 (멘토용)

**Response**:
```json
{
  "documents": [
    {
      "id": "uuid",
      "title": "Resume 2024",
      "type": "Resume",
      "previewUrl": "presigned-url"
    }
  ]
}
```

---

### Profile APIs

#### PATCH /api/users/me/profile
포트폴리오 설정 포함 프로필 업데이트

**Request Body**:
```json
{
  "bio": "Full-stack developer",
  "portfolioDocumentId": "uuid-of-portfolio"
}
```

---

### Document Access API

#### GET /api/documents/:id/shared-access
공유된 문서에 대한 접근 URL 생성 (권한 확인 포함)

**Query Params**:
- `context`: "mentoring" | "profile"
- `contextId`: sessionId or profileId

**Response**:
```json
{
  "previewUrl": "presigned-url",
  "expiresIn": 3600
}
```

---

## Data Model Changes

### Migration: 022_document_integration

```sql
-- 1. Add resumeId to pipeline_items
ALTER TABLE pipeline_items
ADD COLUMN resume_id UUID REFERENCES documents(id) ON DELETE SET NULL;

-- 2. Add shared_document_ids to mentoring_sessions
ALTER TABLE mentoring_sessions
ADD COLUMN shared_document_ids JSONB DEFAULT '[]';

-- 3. Add portfolio_document_id to profiles
ALTER TABLE profiles
ADD COLUMN portfolio_document_id UUID REFERENCES documents(id) ON DELETE SET NULL;

-- 4. Create index for efficient document lookups
CREATE INDEX idx_pipeline_items_resume ON pipeline_items(resume_id) WHERE resume_id IS NOT NULL;
CREATE INDEX idx_profiles_portfolio ON profiles(portfolio_document_id) WHERE portfolio_document_id IS NOT NULL;
```

---

## UI/UX Specifications

### Pipeline Item Modal

```
┌─────────────────────────────────────────────┐
│ Edit Application                             │
├─────────────────────────────────────────────┤
│ Company: [Sony                           ]  │
│ Position: [Frontend Engineer             ]  │
│ Stage:    [Applied ▼                     ]  │
│ Date:     [2024-01-15                    ]  │
│                                             │
│ 📎 Attached Resume                          │
│ ┌─────────────────────────────────────────┐ │
│ │ [▼ Select a resume...                 ] │ │
│ │                                         │ │
│ │ ○ Resume_EN_2024.pdf (Final)           │ │
│ │ ● Resume_JP_2024.pdf (Final) ✓         │ │
│ │ ○ Resume_Tech_2024.pdf (Draft)         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│               [Cancel]  [Save]              │
└─────────────────────────────────────────────┘
```

### Mentoring Session - Document Sharing

```
┌─────────────────────────────────────────────┐
│ Book Session with @mentor                    │
├─────────────────────────────────────────────┤
│ Topic: [Resume review and feedback    ]    │
│ Date:  [Select date... ▼            ]      │
│                                             │
│ 📄 Share Documents (Optional)               │
│ ┌─────────────────────────────────────────┐ │
│ │ [+ Add document]                        │ │
│ │                                         │ │
│ │ ✓ Resume_EN_2024.pdf     [×]            │ │
│ │ ✓ Portfolio_2024.pdf      [×]           │ │
│ │                                         │ │
│ │ (Maximum 5 documents)                   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│               [Cancel]  [Book Session]      │
└─────────────────────────────────────────────┘
```

### Profile Settings

```
┌─────────────────────────────────────────────┐
│ Profile Settings                             │
├─────────────────────────────────────────────┤
│ Display Name: [Kim Developer             ]  │
│ Bio:          [Full-stack developer...   ]  │
│                                             │
│ 🖼️ Featured Portfolio                       │
│ ┌─────────────────────────────────────────┐ │
│ │ [▼ Select a portfolio...              ] │ │
│ │                                         │ │
│ │ ○ None                                  │ │
│ │ ● Portfolio_2024.pdf (Final) ✓          │ │
│ │ ○ Design_Works.pdf (Draft)              │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ 💡 Tip: Your portfolio will be visible     │
│    on your public profile.                  │
│                                             │
│                          [Save Changes]     │
└─────────────────────────────────────────────┘
```

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 파이프라인 아이템에 이력서 첨부 시 500ms 내 저장 완료
- **SC-002**: 멘토링 세션 문서 공유 후 멘토가 2초 내 접근 가능
- **SC-003**: 공개 프로필 포트폴리오 클릭 시 1초 내 PDF 뷰어 로드
- **SC-004**: 문서 삭제 후 관련 참조가 NULL로 정상 처리되는 비율 100%
- **SC-005**: 권한 없는 사용자의 문서 접근 시도 차단율 100%

---

## Security Considerations

1. **문서 접근 권한**
   - 기본: 문서 소유자만 접근 가능
   - 멘토링: 세션에 연결된 멘토만 공유 문서 접근
   - 프로필: portfolioDocumentId로 설정된 문서만 공개 접근

2. **Presigned URL 보안**
   - 만료 시간: 1시간
   - 서명된 URL만 문서 접근 허용
   - 접근 로그 기록 (file_operation_logs)

3. **SQL Injection 방지**
   - 모든 document ID는 UUID 형식 검증
   - Drizzle ORM 파라미터 바인딩 사용

---

## Implementation Phases

### Phase 1: Schema & Basic API (1-2 days)
- [x] DB 스키마 변경 (이미 완료)
- [ ] Pipeline 서비스 resumeId 지원
- [ ] Mentoring 서비스 sharedDocumentIds 지원
- [ ] Profile 서비스 portfolioDocumentId 지원

### Phase 2: UI Integration (2-3 days)
- [ ] PipelineItemModal 이력서 선택 UI
- [ ] MentoringBooking 문서 공유 UI
- [ ] ProfileSettings 포트폴리오 선택 UI

### Phase 3: Access Control & Polish (1 day)
- [ ] 공유 문서 접근 API
- [ ] 권한 체크 로직
- [ ] 에러 핸들링 및 Edge case 처리

---

## Dependencies

- SPEC 006: S3 Storage (presigned URL 생성)
- SPEC 007: Document Management (documents 테이블)
- SPEC 012: Mentor Booking (mentoring_sessions 테이블)
- SPEC 018: Job Posting Parser (pipeline_items 테이블)
