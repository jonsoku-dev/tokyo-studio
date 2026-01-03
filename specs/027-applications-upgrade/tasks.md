# Implementation Tasks: Applications Feature Upgrade (Phase 1)

**Feature**: SPEC-027 Applications Feature Upgrade  
**Status**: 📋 Planning  
**Created**: 2026-01-03  
**Estimated Effort**: 5-7 days

> **Note**: 이 문서는 기존 Applications 기능을 확장하는 Phase 1 작업 목록입니다.

---

## Phase 0: 현재 상태 문서화 ✅

### 0.1 기존 기능 분석
- [x] `pipeline_items` 테이블 구조 확인
  - 기존 필드: `id`, `company`, `position`, `stage`, `date`, `nextAction`, `orderIndex`, `userId`, `resumeId`, `createdAt`, `updatedAt`
- [x] `pipeline_stages` 테이블 구조 확인
  - Kanban 컬럼 설정: `name`, `displayName`, `orderIndex`, `isActive`, `color`
- [x] `pipelineService` 서비스 레이어 분석
  - `getItems`, `getItemById`, `addItem`, `updateItem`, `deleteItem`, `updateItemStatus`, `getStages`
- [x] 기존 API 엔드포인트 확인
  - `/api/pipeline/get-stages`, `/api/pipeline/update-item`, `/api/job-parser`
- [x] 기존 UI 구성 요소 확인
  - Kanban Board, Statistics Section, Help Modal, PageHeader

---

## Phase 1: Database Schema Extension

### 1.1 `pipeline_items` 테이블 확장
**File**: `packages/database/src/schema.ts`

- [ ] Intent & Context 필드 추가
  - [ ] `motivation` (text, nullable) - 지원 동기
  - [ ] `interestLevel` (text, nullable) - 관심도 enum: `high` | `medium` | `low`
  - [ ] `confidenceLevel` (text, nullable) - 자신감 enum: `confident` | `neutral` | `uncertain`

- [ ] Strategy Snapshot 필드 추가
  - [ ] `resumeVersionNote` (text, nullable) - 사용 이력서 설명
  - [ ] `positioningStrategy` (text, nullable) - 포지셔닝 전략 메모
  - [ ] `emphasizedStrengths` (jsonb, nullable) - `string[]` 강조 강점

- [ ] Outcome Reflection 필드 추가
  - [ ] `outcomeReason` (text, nullable) - 결과 원인
  - [ ] `lessonsLearned` (text, nullable) - 배운 점
  - [ ] `nextTimeChange` (text, nullable) - 다음에 바꿀 점

- [ ] Zod 스키마 업데이트
  - [ ] `insertPipelineItemSchema` 재생성
  - [ ] `selectPipelineItemSchema` 재생성

### 1.2 `application_steps` 테이블 생성 (새 테이블)
**File**: `packages/database/src/schema.ts`

- [ ] 테이블 정의
  ```typescript
  applicationSteps = pgTable("application_steps", {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .references(() => pipelineItems.id, { onDelete: "cascade" })
      .notNull(),
    stepType: text("step_type").notNull(),  // "interview" | "assignment" | "offer" | "other"
    date: text("date").notNull(),
    summary: text("summary").notNull(),
    selfEvaluation: text("self_evaluation"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  })
  ```

- [ ] 인덱스 추가
  - [ ] `application_id`에 대한 인덱스

- [ ] Relations 정의
  - [ ] `pipelineItems` ↔ `applicationSteps` 관계 설정

- [ ] Zod 스키마 생성
  - [ ] `insertApplicationStepSchema`
  - [ ] `selectApplicationStepSchema`

### 1.3 Database Migration
- [ ] `pnpm db:push` 실행하여 스키마 변경 적용
- [ ] 기존 데이터 영향 없음 확인 (모든 신규 필드 nullable)

---

## Phase 2: Type Definitions

### 2.1 타입 정의 업데이트
**File**: `web/app/features/applications/domain/pipeline.types.ts`

- [ ] 신규 필드 타입 추가
  ```typescript
  // Intent & Context
  interestLevel: 'high' | 'medium' | 'low' | null
  confidenceLevel: 'confident' | 'neutral' | 'uncertain' | null
  
  // 신규 타입
  type ApplicationStep = {
    id: string;
    applicationId: string;
    stepType: 'interview' | 'assignment' | 'offer' | 'other';
    date: string;
    summary: string;
    selfEvaluation: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  ```

- [ ] `PipelineItem` 인터페이스 확장

---

## Phase 3: Service Layer Extension

### 3.1 기존 서비스 확장
**File**: `web/app/features/applications/domain/pipeline.service.server.ts`

- [ ] `getItems` 메서드 확장
  - 신규 필드 포함하여 조회

- [ ] `getItemById` 메서드 확장
  - 신규 필드 + 관련 `applicationSteps` 포함

- [ ] `addItem` 메서드 확장
  - 신규 필드 저장 지원

- [ ] `updateItem` 메서드 확장
  - 신규 필드 수정 지원

### 3.2 Application Steps 서비스 추가
**File**: `web/app/features/applications/domain/pipeline.service.server.ts` (또는 분리)

- [ ] `getApplicationSteps(applicationId: string)` 구현
- [ ] `addApplicationStep(applicationId, data)` 구현
- [ ] `updateApplicationStep(stepId, data)` 구현
- [ ] `deleteApplicationStep(stepId)` 구현

---

## Phase 4: API Layer

### 4.1 기존 API 확장
**File**: `web/app/features/applications/apis/api.pipeline.update-item.ts`

- [ ] 신규 필드 처리 추가
  - `motivation`, `interestLevel`, `confidenceLevel`
  - `resumeVersionNote`, `positioningStrategy`, `emphasizedStrengths`
  - `outcomeReason`, `lessonsLearned`, `nextTimeChange`

### 4.2 Application Steps API 추가
**New Files**:

- [ ] `api.applications.steps.ts` (또는 별도 파일들)
  - [ ] `POST` action: 단계 추가
  - [ ] `PUT` action: 단계 수정
  - [ ] `DELETE` action: 단계 삭제
  - [ ] `GET` loader: 단계 목록 조회 (applicationId 기준)

### 4.3 Route 등록
**File**: `web/app/routes.ts`

- [ ] 새 API 라우트 등록

---

## Phase 5: UI Components

### 5.1 Application Detail View 확장
**File**: `web/app/features/applications/components/` (기존 또는 신규)

- [ ] **Intent & Context 섹션** 추가
  - [ ] 동기 입력 (textarea)
  - [ ] 관심도 선택 (radio/select)
  - [ ] 자신감 선택 (radio/select)

- [ ] **Strategy 섹션** 추가
  - [ ] 이력서 버전 메모 (text)
  - [ ] 포지셔닝 전략 (textarea)
  - [ ] 강조 강점 (chips/tags input)

- [ ] **Process Log 섹션** 추가
  - [ ] 단계 목록 표시
  - [ ] 단계 추가 폼
  - [ ] 단계 수정/삭제 기능

- [ ] **Reflection 섹션** 추가 (종료된 지원만)
  - [ ] 결과 원인 (textarea)
  - [ ] 배운 점 (textarea)
  - [ ] 다음에 바꿀 점 (textarea)

### 5.2 Kanban Card 최소 변경
**File**: `web/app/features/applications/components/`

- [ ] (선택) 높은 관심도 항목에 작은 배지 표시
- [ ] 기존 Kanban 동작 100% 유지 확인

---

## Phase 6: Quality Assurance

### 6.1 Code Quality
- [ ] `pnpm biome check` 통과
- [ ] `pnpm typecheck` 통과 (web, packages/database)
- [ ] `pnpm build` 성공

### 6.2 호환성 테스트
- [ ] 기존 Kanban 드래그앤드롭 정상 동작
- [ ] 기존 API 호출 정상 동작 (신규 필드 없이)
- [ ] 기존 데이터 조회 정상 (null 필드 처리)

### 6.3 신규 기능 테스트
- [ ] Intent & Context 필드 저장/조회
- [ ] Strategy 필드 저장/조회
- [ ] Process Log CRUD 동작
- [ ] Reflection 필드 저장/조회

---

## Phase 7: Documentation

### 7.1 Spec 문서
- [x] `spec.md` 작성 (현행 + 개선)
- [x] `tasks.md` 작성 (이 문서)

### 7.2 Knowledge Base 업데이트
- [ ] Job Applications System KI 업데이트
  - `architecture/data_model.md` 신규 필드 추가
  - `implementation/` 관련 문서 업데이트

---

## Verification Plan

### Automated Tests
```bash
# 1. Type check
cd /Users/jongseoklee/Documents/GitHub/itcom
pnpm typecheck

# 2. Lint check
pnpm biome check .

# 3. Build check
cd web && pnpm build
```

### Manual Verification

1. **Kanban 호환성 테스트**
   - 기존 항목 드래그앤드롭이 정상 동작하는지 확인
   - 기존 항목 추가/수정/삭제가 정상 동작하는지 확인

2. **신규 필드 테스트**
   - 지원 상세 보기에서 Intent & Context 필드 저장/표시 확인
   - Strategy 필드 저장/표시 확인
   - Process Log 추가/수정/삭제 확인
   - Reflection 필드 저장/표시 확인 (종료된 지원)

3. **기존 데이터 호환성**
   - 신규 필드가 없는 기존 데이터가 정상 표시되는지 확인
   - 기존 API 호출이 오류 없이 동작하는지 확인

---

## Future Enhancement Backlog (Phase 2+)

### v1.1 Improvements
- [ ] Application Steps 템플릿 (면접 유형별 기본 질문)
- [ ] 관심도/자신감 기반 자동 정렬/필터
- [ ] 이력서 버전 히스토리 연동

### v2.0 Mentoring Integration
- [ ] 멘토가 mentee의 지원 현황 조회
- [ ] 지원 전략에 대한 멘토 코멘트

### v3.0 LLM Analysis
- [ ] 지원 패턴 분석
- [ ] 합격/탈락 요인 자동 추론
- [ ] 개선 추천

---

## Notes

- **Phase 1 범위**: Applications 도메인의 자립적 완성
- **결합 금지**: 멘토링/LLM 기능과의 결합은 Phase 2 이후
- **호환성 필수**: 기존 기능/데이터에 영향 없어야 함
- **점진적 구현**: 각 Phase 완료 후 검증 진행
