# SPEC-027: Applications Feature Upgrade - Phase 1

**Status**: Draft  
**Created**: 2026-01-03  
**Priority**: P1 (Core Feature Enhancement)  
**Dependencies**: SPEC-022 (Document Integration)  
**Estimated Effort**: 5-7 days

---

## 0. Executive Summary

### 0.1 이 기능은 무엇인가?

**Applications Feature Upgrade**는 기존의 단순한 지원 현황 목록을 **의도, 전략, 진행 과정, 결과를 구조화하여 기록하는 완전한 지원 관리 시스템**으로 발전시키는 것입니다.

**Phase 1 목표**:
- 지원 의도와 동기 수준 기록 (왜 지원했는지)
- 전략 스냅샷 저장 (어떤 이력서/포트폴리오 사용, 어떤 강점 강조)
- 최소한의 진행 로그 (면접, 과제 등 주요 단계 기록)
- 결과 회고 (합격/탈락 이유, 교훈)

### 0.2 왜 이 기능이 필요한가? (Problem Statement)

| 문제 | 현재 상태 | 영향 |
|------|----------|------|
| **수동적 기록** | 단순히 "어디에 지원했는지"만 저장 | 데이터 활용 불가능 → 분석 제한 |
| **맥락 부재** | 왜 지원했는지, 어떤 준비를 했는지 기록 없음 | 과거 성찰 불가 → 반복 실수 |
| **진행 과정 누락** | 면접 일정, 과제 등 추적 불가 | 체계적 관리 불가능 |
| **교훈 휘발** | 결과에 대한 회고 기록 없음 | 경험 학습 기회 상실 |

### 0.3 이 기능은 어떻게 문제를 해결하는가?

```
[기존: 수동적 로그]     →     [개선: 구조화된 기록 시스템]
        ↓                              ↓
   "지원했다"              의도 + 전략 + 과정 + 결과 회고
                                       ↓
                          미래 멘토링/분석 준비 완료
```

**핵심 가치**:
1. **지원 의도 명시화**: 왜 지원했는지, 동기 수준이 어떤지 기록
2. **전략 스냅샷**: 해당 지원에 사용한 이력서/포트폴리오 버전 및 전략 보관
3. **과정 로그**: 면접/과제 등 주요 단계의 날짜, 요약, 자기 평가
4. **결과 회고**: 주관적이지만 명시적인 교훈 기록

### 0.4 기대 효과

#### 사용자 가치
- **체계적 관리**: 지원 전체 사이클 추적 가능
- **자기 성찰**: 결과 회고를 통한 학습
- **미래 활용**: 멘토링/LLM 분석의 입력 데이터로 활용 가능

#### 비즈니스 가치
- **데이터 품질 향상**: 풍부한 구조화 데이터 축적
- **미래 기능 기반**: 멘토링/분석 기능의 사전 준비
- **사용자 가치 증대**: Applications가 단순 목록에서 전략 도구로 전환

### 0.5 설계 원칙 (Phase 1 제약사항)

> [!IMPORTANT]
> **Phase 1 제약사항**
> 1. 기존 동작 유지 (Backward Compatibility 필수)
> 2. 증분 변경 (재작성 금지)
> 3. 멘토링/LLM 기능과 결합 금지 (독립 유지)
> 4. 과도한 추상화 금지 (단순 명확한 구현)
> 5. 추측적 기능 배제 (명확한 목적만)

---

## 1. 현재 기능 상태 (Baseline)

### 1.1 기존 데이터 모델

**Table**: `pipeline_items` (packages/database/src/schema.ts, lines 118-133)

```typescript
{
  id: uuid (PK)
  company: text (required)         // 회사명
  position: text (required)        // 포지션
  stage: text (required)           // 진행 단계 (Kanban 컬럼)
  date: text (required)            // 지원일 또는 면접일
  nextAction: text                 // 다음 할 일 메모
  orderIndex: integer default(0)   // Kanban 내 순서
  userId: uuid (FK → users.id)     // 소유자
  resumeId: uuid (FK → documents.id, nullable)  // 첨부 이력서
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Table**: `pipeline_stages` (lines 100-115)

```typescript
{
  id: uuid (PK)
  name: text (unique)              // "interested", "applied", etc.
  displayName: text                // 화면 표시명
  orderIndex: integer              // Kanban 컬럼 순서
  isActive: boolean default(true)
  color: text                      // UI 색상
  description: text
  createdAt, updatedAt: timestamp
}
```

### 1.2 기존 서비스 레이어

**File**: `web/app/features/applications/domain/pipeline.service.server.ts`

| 메서드 | 설명 | 상태 |
|--------|------|------|
| `getItems(userId)` | 사용자의 모든 지원 현황 조회 | ✅ 유지 |
| `getItemById(id)` | 단일 항목 조회 | ✅ 유지 |
| `addItem(userId, data)` | 새 지원 항목 추가 | ✅ 확장 |
| `updateItem(userId, itemId, data)` | 항목 수정 | ✅ 확장 |
| `deleteItem(userId, itemId)` | 항목 삭제 | ✅ 유지 |
| `updateItemStatus(id, stage)` | 상태 변경 (Kanban 이동) | ✅ 유지 |
| `getStages()` | 모든 단계 조회 | ✅ 유지 |

### 1.3 기존 API 엔드포인트

| 경로 | 목적 | 상태 |
|------|------|------|
| `GET /api/pipeline/get-stages` | 단계 목록 조회 | ✅ 유지 |
| `POST /api/pipeline/update-item` | 항목 수정 | ✅ 확장 |
| `POST /api/job-parser` | Magic Paste 파싱 | ✅ 유지 |

### 1.4 기존 UI

- **Kanban Board**: `@dnd-kit` 기반 드래그앤드롭 인터페이스
- **Statistics Section**: 상단 요약 통계 (총 지원, 진행 중, 면접 진행, 합격)
- **Help Modal**: 사용 가이드
- **페이지 헤더**: 표준 `PageHeader` 컴포넌트 사용

---

## 2. User Scenarios & Testing

### User Story 1 - 지원 의도 기록 (Priority: P1)

**As a** 일본 취업을 준비하는 사용자,  
**I want** 각 지원에 대해 왜 지원했는지, 얼마나 관심이 있는지 기록하고 싶습니다,  
**So that** 나중에 지원 우선순위를 파악하고 회고할 수 있습니다.

**Acceptance Scenarios**:

1. **Given** 새 지원 항목 추가 폼, **When** 사용자가 "지원 동기"와 "관심도"를 입력, **Then** 해당 데이터가 저장됩니다.
2. **Given** 기존 지원 항목, **When** 상세 보기/수정 모달을 열면, **Then** 저장된 동기와 관심도가 표시됩니다.
3. **Given** 관심도가 없는 기존 데이터, **When** 조회하면, **Then** 관심도 필드는 `null`로 표시됩니다 (Backward compatible).

---

### User Story 2 - 전략 스냅샷 저장 (Priority: P1)

**As a** 사용자,  
**I want** 이 지원에 어떤 이력서/포트폴리오를 사용했고, 어떤 강점을 강조했는지 기록하고 싶습니다,  
**So that** 어떤 전략이 효과적이었는지 나중에 분석할 수 있습니다.

**Acceptance Scenarios**:

1. **Given** 지원 항목 수정 폼, **When** 사용자가 "사용 이력서 버전", "강조한 강점" 메모를 입력, **Then** 저장됩니다.
2. **Given** 기존 `resumeId` 필드, **When** 여전히 문서 첨부 기능으로 작동, **Then** 기존 동작 유지.
3. **Given** 전략 스냅샷 필드들이 비어 있는 경우, **When** API 호출, **Then** 기존 API와 동일하게 동작 (비파괴적 추가).

---

### User Story 3 - 진행 과정 로그 (Priority: P2)

**As a** 사용자,  
**I want** 면접, 과제 전형 등 주요 단계를 날짜, 요약, 자기 평가와 함께 기록하고 싶습니다,  
**So that** 전체 과정을 체계적으로 추적할 수 있습니다.

**Acceptance Scenarios**:

1. **Given** 지원 항목 상세 페이지, **When** "단계 추가" 버튼 클릭, **Then** 날짜, 요약, 평가 입력 폼이 표시됩니다.
2. **Given** 저장된 진행 단계들, **When** 조회, **Then** 시간순으로 정렬되어 표시됩니다.
3. **Given** 단계 수정/삭제 기능, **When** 사용, **Then** 해당 단계만 변경됩니다.

> [!NOTE]
> 이것은 **로그**입니다. 워크플로우 엔진이 아닙니다. 사용자의 자유로운 기록을 위한 것입니다.

---

### User Story 4 - 결과 회고 (Priority: P2)

**As a** 지원이 종료된 사용자,  
**I want** 결과의 원인, 교훈, 다음에 바꿀 점을 기록하고 싶습니다,  
**So that** 경험을 축적하고 다음 지원에 반영할 수 있습니다.

**Acceptance Scenarios**:

1. **Given** 지원 상태가 "rejected" 또는 "withdrawn", **When** 상세 페이지를 열면, **Then** 회고 입력 폼이 표시됩니다.
2. **Given** 회고 저장, **When** 다시 조회, **Then** 저장된 회고 내용이 표시됩니다.
3. **Given** 회고 필드가 비어 있어도, **When** 저장, **Then** 오류 없이 동작 (선택 필드).

---

### Edge Cases

- **기존 데이터 호환성**: 새 필드가 없는 기존 데이터는 `null`로 처리, 기존 UI/API 정상 동작
- **빈 필드 저장**: 모든 새 필드는 선택 사항, 빈 상태로 저장 가능
- **대량 데이터**: 진행 로그는 배열로 저장, 항목당 최대 20개로 제한
- **삭제 시 정리**: 지원 항목 삭제 시 관련 진행 로그도 cascade 삭제

---

## 3. Requirements

### 3.1 Functional Requirements

**A. Application Intent & Context**
- **FR-001**: System MUST support optional `motivation` text field (최대 500자)
- **FR-002**: System MUST support optional `interestLevel` enum field (`high` | `medium` | `low`)
- **FR-003**: System MUST support optional `confidenceLevel` enum field (`confident` | `neutral` | `uncertain`)

**B. Strategy Snapshot**
- **FR-004**: System MUST support optional `resumeVersionNote` text field (사용 이력서 설명)
- **FR-005**: System MUST support optional `positioningStrategy` text field (포지셔닝 전략 메모)
- **FR-006**: System MUST support optional `emphasizedStrengths` text[] field (강조한 강점 목록)

**C. Process Log**
- **FR-007**: System MUST support `applicationSteps` table for logging process steps
- **FR-008**: Each step MUST have: `date`, `summary`, `selfEvaluation` (optional), `stepType`
- **FR-009**: Steps MUST be ordered by date (ascending)
- **FR-010**: System MUST limit steps per application to 20

**D. Outcome Reflection**
- **FR-011**: System MUST support optional `outcomeReason` text field (결과 원인)
- **FR-012**: System MUST support optional `lessonsLearned` text field (배운 점)
- **FR-013**: System MUST support optional `nextTimeChange` text field (다음에 바꿀 점)

**E. Compatibility**
- **FR-014**: All new fields MUST be nullable (기존 데이터 호환)
- **FR-015**: Existing API endpoints MUST continue working unchanged
- **FR-016**: Existing Kanban board MUST function without modification

### 3.2 Non-Functional Requirements

- **NFR-001**: Migration MUST be non-destructive (데이터 손실 금지)
- **NFR-002**: New fields SHOULD NOT impact existing query performance
- **NFR-003**: UI extensions MUST be additive (리스트 뷰 변경 최소화, 상세 뷰 확장)
- **NFR-004**: All changes MUST pass existing linting and type checks

### 3.3 Key Entities (Updated)

**Extended `pipeline_items`**:
```typescript
{
  // === 기존 필드 (유지) ===
  id, company, position, stage, date, nextAction,
  orderIndex, userId, resumeId, createdAt, updatedAt,
  
  // === Phase 1 신규 필드 ===
  // Application Intent & Context
  motivation: text | null,           // 지원 동기
  interestLevel: text | null,        // "high" | "medium" | "low"
  confidenceLevel: text | null,      // "confident" | "neutral" | "uncertain"
  
  // Strategy Snapshot
  resumeVersionNote: text | null,    // 사용 이력서 설명
  positioningStrategy: text | null,  // 포지셔닝 전략
  emphasizedStrengths: jsonb | null, // string[] 강조 강점
  
  // Outcome Reflection
  outcomeReason: text | null,        // 결과 원인 (주관적)
  lessonsLearned: text | null,       // 배운 점
  nextTimeChange: text | null,       // 다음에 바꿀 점
}
```

**New `application_steps`**:
```typescript
{
  id: uuid (PK)
  applicationId: uuid (FK → pipeline_items.id, cascade delete)
  stepType: text                     // "interview" | "assignment" | "offer" | "other"
  date: text                         // YYYY-MM-DD
  summary: text                      // 요약 (필수)
  selfEvaluation: text | null        // 자기 평가 (선택)
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## 4. Technical Architecture

### 4.1 Database Changes

#### Schema Extension (`packages/database/src/schema.ts`)

**1. Extend `pipelineItems`**:
- 9개의 nullable 컬럼 추가
- `emphasizedStrengths`는 `jsonb` 타입 (string 배열)

**2. New Table `applicationSteps`**:
- `pipeline_items`와 1:N 관계
- Cascade delete 적용

#### Migration

```sql
-- Phase 1a: Extend pipeline_items
ALTER TABLE pipeline_items
ADD COLUMN motivation TEXT,
ADD COLUMN interest_level TEXT,       -- CHECK('high','medium','low')
ADD COLUMN confidence_level TEXT,     -- CHECK('confident','neutral','uncertain')
ADD COLUMN resume_version_note TEXT,
ADD COLUMN positioning_strategy TEXT,
ADD COLUMN emphasized_strengths JSONB DEFAULT '[]',
ADD COLUMN outcome_reason TEXT,
ADD COLUMN lessons_learned TEXT,
ADD COLUMN next_time_change TEXT;

-- Phase 1b: New table
CREATE TABLE application_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES pipeline_items(id) ON DELETE CASCADE,
  step_type TEXT NOT NULL,            -- CHECK('interview','assignment','offer','other')
  date TEXT NOT NULL,
  summary TEXT NOT NULL,
  self_evaluation TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX application_steps_app_id_idx ON application_steps(application_id);
```

### 4.2 Service Layer Extension

**File**: `web/app/features/applications/domain/pipeline.service.server.ts`

```typescript
// 신규 메서드
addApplicationStep(applicationId, data): Promise<ApplicationStep>
updateApplicationStep(stepId, data): Promise<ApplicationStep>
deleteApplicationStep(stepId): Promise<void>
getApplicationSteps(applicationId): Promise<ApplicationStep[]>

// 기존 메서드 확장
getItems(userId): // 기존 + 신규 필드 포함
updateItem(userId, itemId, data): // 기존 + 신규 필드 지원
```

### 4.3 API Extensions

| 경로 | 메서드 | 목적 |
|------|--------|------|
| `POST /api/pipeline/update-item` | POST | 기존 + 신규 필드 지원 확장 |
| `POST /api/applications/steps` | POST | 진행 단계 추가 |
| `PUT /api/applications/steps/:id` | PUT | 진행 단계 수정 |
| `DELETE /api/applications/steps/:id` | DELETE | 진행 단계 삭제 |

### 4.4 UI Extensions

**1. Application Card (Kanban)**
- 기존 동작 유지
- 관심도 높은 항목에 작은 배지 표시 (선택적)

**2. Application Detail Modal/Page (신규 또는 확장)**
- 탭 또는 섹션 구조:
  - **기본 정보**: 기존 필드들
  - **지원 컨텍스트**: 동기, 관심도, 자신감
  - **전략**: 이력서 버전, 포지셔닝, 강점
  - **진행 로그**: 단계별 기록 리스트
  - **회고**: 결과 분석 (종료된 지원만)

---

## 5. Success Criteria

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| **SC-001** | 기존 Kanban 기능 100% 호환 | 수동 테스트 |
| **SC-002** | 기존 API 응답 구조 변경 없음 | API 테스트 |
| **SC-003** | 신규 필드 저장/조회 정상 동작 | 통합 테스트 |
| **SC-004** | 진행 로그 CRUD 정상 동작 | 통합 테스트 |
| **SC-005** | 회고 저장/조회 정상 동작 | 통합 테스트 |
| **SC-006** | 마이그레이션 데이터 손실 없음 | DB 검증 |
| **SC-007** | Lint/Typecheck 통과 | CI 확인 |

---

## 6. Future Enablement (Phase 2+)

> [!CAUTION]
> 아래 기능들은 Phase 1에서 **구현하지 않습니다**. 현재 설계가 이러한 기능을 자연스럽게 지원할 수 있도록 데이터 모델을 설계합니다.

### 6.1 멘토링 연동 (미구현)
- 멘토가 사용자의 지원 현황을 조회하여 코칭
- `motivation`, `positioningStrategy` → 멘토 피드백 기반

### 6.2 LLM 분석 (미구현)
- `emphasizedStrengths`, `lessonsLearned` → 패턴 분석
- 합격/탈락 요인 자동 추론

### 6.3 통계/대시보드 (미구현)
- 지원 전략별 성공률 분석
- 시간대별 지원 패턴 가시화

---

## 7. Related Specifications

- **SPEC-022**: Document Integration (resumeId FK 유지)
- **SPEC-026**: Dashboard (Applications 위젯 - 기존 동작 유지)
- **SPEC-016**: Roadmap Integration (독립 유지, 결합하지 않음)

---

## 8. Notes

- Phase 1은 **Applications 도메인의 자립성 강화**가 목표입니다.
- 다른 도메인과의 결합은 Phase 2 이후에 검토합니다.
- 모든 신규 필드는 선택 사항으로, 기존 워크플로우에 영향을 주지 않습니다.
