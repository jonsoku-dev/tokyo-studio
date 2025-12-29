# Implementation Plan: Personalized Roadmap Generator

**Feature**: `016-roadmap-integration`
**Status**: **Ready for Development**
**Estimated Effort**: 5-7 days

---

## 1. Overview

사용자가 Career Diagnosis를 완료하면, 시스템이 10-15개의 개인화된 Task를 생성하여 Kanban 보드 형태로 표시합니다.

### 핵심 가치
- **Actionable**: 정보 제공이 아닌 "다음 행동" 중심
- **Personalized**: Diagnosis 결과(jobFamily, level, jpLevel, targetCity) 기반 맞춤
- **Trackable**: 진행률과 마일스톤 시각화

---

## 2. Architecture Decision

### 2.1 기존 스키마 활용 vs 신규 생성

**Decision: 기존 `tasks` 테이블 확장 + 신규 `roadmap_templates` 테이블 추가**

| 옵션 | 장점 | 단점 |
|------|------|------|
| 기존 `tasks` 확장 | 이미 Dashboard에서 사용중, 단순함 | 템플릿과 인스턴스 구분 필요 |
| 완전 신규 테이블 | 깔끔한 분리 | 중복 코드, Dashboard 연동 복잡 |

**선택 이유**: `tasks` 테이블이 이미 `category`, `status`, `priority`, `userId` 필드를 가지고 있어 Roadmap Task로 확장하기 적합.

### 2.2 Task 생성 방식

**Decision: 서버사이드 템플릿 기반 생성**

1. `roadmap_templates` 테이블에 템플릿 정의 (Admin 관리)
2. Diagnosis 완료 시 템플릿 조건에 맞는 Task 인스턴스를 `tasks` 테이블에 복사
3. 사용자는 `tasks` 테이블의 본인 레코드만 수정

---

## 3. Database Schema Changes

### 3.1 신규 테이블: `roadmap_templates`

```sql
CREATE TABLE roadmap_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Learning' | 'Application' | 'Preparation' | 'Settlement'
  estimated_minutes INTEGER NOT NULL DEFAULT 60,
  priority TEXT NOT NULL DEFAULT 'normal', -- 'urgent' | 'normal' | 'low'
  order_index INTEGER NOT NULL DEFAULT 0,
  
  -- Targeting Conditions (NULL = applies to all)
  target_job_families TEXT[], -- ['frontend', 'backend'] or NULL for all
  target_levels TEXT[], -- ['junior', 'mid'] or NULL for all
  target_jp_levels TEXT[], -- ['N3', 'N4', 'N5', 'None'] or NULL for all
  target_cities TEXT[], -- ['Tokyo', 'Osaka'] or NULL for all
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2 기존 테이블 확장: `tasks`

```sql
-- 기존 필드 유지
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS 
  estimated_minutes INTEGER DEFAULT 60,
  template_id UUID REFERENCES roadmap_templates(id),
  kanban_column TEXT DEFAULT 'todo', -- 'todo' | 'in_progress' | 'completed'
  completed_at TIMESTAMP;
```

### 3.3 신규 테이블: `user_roadmaps`

```sql
CREATE TABLE user_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL UNIQUE,
  generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  total_tasks INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  current_milestone TEXT, -- 'started' | 'learning_done' | '50_percent' | 'settlement_done' | 'all_done'
  last_milestone_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Implementation Phases

### Phase 1: Schema & Admin (Day 1-2)

#### 4.1.1 Database Migration
- [ ] Create `roadmap_templates` table
- [ ] Extend `tasks` table with new fields
- [ ] Create `user_roadmaps` table
- [ ] Seed initial templates (10-15개 기본 템플릿)

#### 4.1.2 Admin CRUD
- [ ] `AdminRoadmapService.createTemplate(data)`
- [ ] `AdminRoadmapService.updateTemplate(id, data)`
- [ ] `AdminRoadmapService.deleteTemplate(id)`
- [ ] `AdminRoadmapService.listTemplates(filters)`
- [ ] Admin UI: Template editor page

### Phase 2: Roadmap Generation (Day 3-4)

#### 4.2.1 Core Service
```typescript
// web/app/features/roadmap/services/roadmap.server.ts
export const roadmapService = {
  async generateForUser(userId: string, profile: Profile) {
    // 1. Check if roadmap already exists
    // 2. Get matching templates based on profile
    // 3. Create tasks from templates
    // 4. Create user_roadmaps entry
    // 5. Return generated tasks
  },
  
  async getCustomizedTasks(profile: Profile): Promise<TaskTemplate[]> {
    // Query templates where profile matches targeting conditions
  }
};
```

#### 4.2.2 Integration with Diagnosis
- [ ] Modify `diagnosis/routes/result.tsx` to trigger roadmap generation
- [ ] Add "Generate Roadmap" CTA button
- [ ] Redirect to Kanban view after generation

### Phase 3: Kanban UI (Day 5-6)

#### 4.3.1 Components
- [ ] `KanbanBoard.tsx` - Main container
- [ ] `KanbanColumn.tsx` - To Do / In Progress / Completed
- [ ] `TaskCard.tsx` - Draggable task card
- [ ] `ProgressBar.tsx` - Overall completion indicator
- [ ] `MilestoneNotification.tsx` - Toast for achievements

#### 4.3.2 Routes
- [ ] `roadmap/routes/index.tsx` - Main Kanban page
- [ ] API routes for drag-drop updates

#### 4.3.3 Drag-and-Drop
- **Library**: `@dnd-kit/core` (React 19 compatible)
- State management via Optimistic UI + Server sync

### Phase 4: Polish & Analytics (Day 7)

#### 4.4.1 Milestone Detection
```typescript
async function checkMilestones(userId: string) {
  const progress = await getProgress(userId);
  
  if (progress.learningDonePercent === 100 && !progress.milestones.learningDone) {
    await triggerMilestone(userId, 'learning_done');
  }
  // ... other milestones
}
```

#### 4.4.2 Custom Task Management
- [ ] "Add Custom Task" modal
- [ ] Task edit functionality
- [ ] Task delete with confirmation

---

## 5. File Structure

```
web/app/features/roadmap/
├── components/
│   ├── KanbanBoard.tsx
│   ├── KanbanColumn.tsx
│   ├── TaskCard.tsx
│   ├── ProgressBar.tsx
│   ├── MilestoneToast.tsx
│   └── AddTaskModal.tsx
├── routes/
│   ├── index.tsx          # Main Kanban view
│   └── api.tasks.tsx      # Task CRUD API
├── services/
│   ├── roadmap.server.ts  # Core logic
│   └── milestone.server.ts # Milestone detection
├── domain/
│   └── roadmap.types.ts   # Type definitions
└── hooks/
    └── useKanban.ts       # DnD state management
```

---

## 6. API Design

### 6.1 User APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roadmap` | Get user's roadmap with tasks |
| POST | `/api/roadmap/generate` | Generate roadmap from diagnosis |
| PATCH | `/api/roadmap/tasks/:id` | Update task (status, column) |
| POST | `/api/roadmap/tasks` | Create custom task |
| DELETE | `/api/roadmap/tasks/:id` | Delete custom task only |

### 6.2 Admin APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/api/roadmap/templates` | List templates |
| POST | `/admin/api/roadmap/templates` | Create template |
| PUT | `/admin/api/roadmap/templates/:id` | Update template |
| DELETE | `/admin/api/roadmap/templates/:id` | Delete template |

---

## 7. Default Templates (Seed Data)

### Learning Tasks (4개)
1. **기술 스택 현대화** - Frontend: Next.js/React, Backend: Node.js/Go
2. **코딩 테스트 준비** - LeetCode/AtCoder 주 3회
3. **일본어 업무 표현** - 敬語, 기술 용어
4. **영문 이력서 작성** - ATS 최적화

### Application Tasks (4개)
5. **LinkedIn 프로필 최적화** - Japan IT 키워드
6. **Wantedly/Green 계정 생성** - 일본 로컬 플랫폼
7. **포트폴리오 사이트 제작** - 프로젝트 3개 이상
8. **추천서 확보** - 전 동료/상사

### Preparation Tasks (4개)
9. **모의 면접 연습** - STAR 기법
10. **연봉 협상 리서치** - Tokyo 시장 조사
11. **회사 문화 조사** - 관심 기업 5개
12. **비자 요건 확인** - 고도인재 점수 계산

### Settlement Tasks (3개)
13. **임시 숙소 예약** - 도착 후 2주
14. **핸드폰 계약 조사** - 외국인 가능 캐리어
15. **은행 계좌 조사** - 개설 가능 은행 리스트

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 로드맵 생성률 | Diagnosis 완료 후 70%+ | `user_roadmaps` count / profiles count |
| 첫 Task 완료율 | 생성 후 24h 내 50%+ | Task 완료 timestamp 분석 |
| 전체 완료율 | 30일 내 30%+ | `completed_tasks / total_tasks` |
| DAU/MAU | 로드맵 사용자 2배 | 페이지 조회 분석 |

---

## 9. Dependencies

- `@dnd-kit/core`, `@dnd-kit/sortable` - Drag and drop
- `framer-motion` - Animations (optional)
- `recharts` - Progress visualization (optional)

---

## 10. Out of Scope (v1)

- 다른 사용자와 로드맵 공유
- AI 기반 동적 Task 추천
- Google Calendar 연동 (별도 Feature 017)
- 마일스톤 푸시 알림 (별도 Feature 009)
