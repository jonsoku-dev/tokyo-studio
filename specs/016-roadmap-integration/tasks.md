# Development Tasks: 016-Roadmap-Integration

**Feature Branch**: `016-roadmap-integration`
**Estimated Effort**: 5-7 days
**Prerequisites**: Diagnosis feature must be functional

---

## Phase 1: Database Schema (Day 1)

### 1.1 Schema Definition
- [ ] **Add `roadmapTemplates` to schema.ts**
  - Fields: id, title, description, category, estimatedMinutes, priority, orderIndex
  - Targeting: targetJobFamilies, targetLevels, targetJpLevels, targetCities
  - Meta: isActive, createdAt, updatedAt

- [ ] **Extend `tasks` table**
  - Add: estimatedMinutes, templateId, kanbanColumn, completedAt

- [ ] **Add `userRoadmaps` to schema.ts**
  - Fields: id, userId (unique), generatedAt, totalTasks, completedTasks
  - Milestones: currentMilestone, lastMilestoneAt

- [ ] **Add relations**
  - tasks → roadmapTemplates (optional FK)
  - userRoadmaps → users (1:1)
  - userRoadmaps → tasks (1:many via userId)

### 1.2 Migration
- [ ] Run `pnpm db:push` to apply schema
- [ ] Verify tables created in local PostgreSQL

### 1.3 Type Generation
- [ ] Run `pnpm typegen` for route types
- [ ] Export types from schema: `Task`, `RoadmapTemplate`, `UserRoadmap`

---

## Phase 2: Seed Data (Day 1)

### 2.1 Template Seed Script
- [ ] **Create `web/app/features/roadmap/scripts/seed-templates.ts`**
```typescript
// 15개 기본 템플릿 정의
const learningTemplates = [
  { title: "기술 스택 현대화", category: "Learning", targetJobFamilies: ["frontend"], ... },
  // ...
];
```

- [ ] **Run seed**: `pnpm tsx web/app/features/roadmap/scripts/seed-templates.ts`
- [ ] Verify templates in DB

---

## Phase 3: Core Service (Day 2)

### 3.1 Roadmap Service
- [ ] **Create `web/app/features/roadmap/services/roadmap.server.ts`**

#### Functions to implement:
```typescript
// Check if user has roadmap
hasRoadmap(userId: string): Promise<boolean>

// Generate roadmap for user based on profile
generateForUser(userId: string, profile: Profile): Promise<UserRoadmap>

// Get all tasks for user's roadmap
getRoadmapTasks(userId: string): Promise<Task[]>

// Update task status/column
updateTask(taskId: string, userId: string, data: Partial<Task>): Promise<Task>

// Create custom task
createCustomTask(userId: string, data: NewTask): Promise<Task>

// Delete custom task (only user-created)
deleteCustomTask(taskId: string, userId: string): Promise<void>

// Get progress stats
getProgress(userId: string): Promise<{ total: number, completed: number, percent: number }>
```

### 3.2 Template Matching Logic
- [ ] **Create `web/app/features/roadmap/services/template-matcher.server.ts`**

```typescript
// Filter templates that match user's profile
matchTemplates(profile: Profile): Promise<RoadmapTemplate[]>
```

**Matching Rules**:
- `targetJobFamilies`: NULL = all, or array includes profile.jobFamily
- `targetLevels`: NULL = all, or array includes profile.level
- `targetJpLevels`: NULL = all, or array includes profile.jpLevel
- `targetCities`: NULL = all, or array includes profile.targetCity

---

## Phase 4: Milestone Service (Day 2)

### 4.1 Milestone Detection
- [ ] **Create `web/app/features/roadmap/services/milestone.server.ts`**

```typescript
// Define milestones
type MilestoneType = 'started' | 'first_task' | 'learning_done' | 'fifty_percent' | 'settlement_done' | 'all_done';

// Check and trigger milestones
checkMilestones(userId: string): Promise<MilestoneType | null>

// Get milestone history
getMilestoneHistory(userId: string): Promise<Milestone[]>
```

**Milestone Triggers**:
| Milestone | Condition |
|-----------|-----------|
| `started` | Roadmap generated |
| `first_task` | 1st task completed |
| `learning_done` | All Learning tasks completed |
| `fifty_percent` | 50% tasks completed |
| `settlement_done` | All Settlement tasks completed |
| `all_done` | 100% completed |

---

## Phase 5: API Routes (Day 3)

### 5.1 User Routes
- [ ] **Create `web/app/routes.ts` entries** (under features/roadmap)

| Route | File | Purpose |
|-------|------|---------|
| `/roadmap` | `roadmap/routes/index.tsx` | Main Kanban page |
| `/api/roadmap` | `roadmap/apis/roadmap.ts` | GET roadmap data |
| `/api/roadmap/generate` | `roadmap/apis/generate.ts` | POST generate |
| `/api/roadmap/tasks/:id` | `roadmap/apis/task.$id.ts` | PATCH/DELETE task |
| `/api/roadmap/tasks` | `roadmap/apis/tasks.ts` | POST new task |

### 5.2 Route Implementation

#### GET /api/roadmap
```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAuth(request);
  const roadmap = await roadmapService.getRoadmapTasks(user.id);
  const progress = await roadmapService.getProgress(user.id);
  return json({ roadmap, progress });
}
```

#### POST /api/roadmap/generate
```typescript
export async function action({ request }: Route.ActionArgs) {
  const user = await requireAuth(request);
  const profile = await diagnosisService.getProfile(user.id);
  if (!profile) throw redirect("/diagnosis");
  
  const roadmap = await roadmapService.generateForUser(user.id, profile);
  return json({ success: true, roadmap });
}
```

#### PATCH /api/roadmap/tasks/:id
```typescript
export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireAuth(request);
  const data = await request.json();
  const task = await roadmapService.updateTask(params.id, user.id, data);
  
  // Check milestones after update
  const milestone = await milestoneService.checkMilestones(user.id);
  return json({ task, milestone });
}
```

---

## Phase 6: Frontend Components (Day 4-5)

### 6.1 Component Structure
```
web/app/features/roadmap/components/
├── KanbanBoard.tsx      # Main container
├── KanbanColumn.tsx     # Single column (To Do / In Progress / Completed)
├── TaskCard.tsx         # Draggable card
├── ProgressBar.tsx      # Completion indicator
├── MilestoneToast.tsx   # Achievement popup
├── AddTaskModal.tsx     # Create custom task
└── TaskEditModal.tsx    # Edit task details
```

### 6.2 Component Implementation

#### KanbanBoard.tsx
- [ ] Implement using `@dnd-kit/core`
- [ ] Three fixed columns: To Do, In Progress, Completed
- [ ] Drag context with sortable items
- [ ] Optimistic UI updates

#### TaskCard.tsx
- [ ] Display: title, category badge, estimated time, priority
- [ ] Actions: checkbox, edit, delete (custom only)
- [ ] Drag handle

#### ProgressBar.tsx
- [ ] Visual: segmented bar by category
- [ ] Text: "X of Y tasks completed (Z%)"

#### MilestoneToast.tsx
- [ ] Animated celebration toast
- [ ] Suggestion for next action

### 6.3 Main Page
- [ ] **Create `web/app/features/roadmap/routes/index.tsx`**

```tsx
export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAuth(request);
  const [tasks, progress, profile] = await Promise.all([
    roadmapService.getRoadmapTasks(user.id),
    roadmapService.getProgress(user.id),
    diagnosisService.getProfile(user.id),
  ]);
  
  if (!tasks.length && !profile) {
    throw redirect("/diagnosis");
  }
  
  return json({ tasks, progress, hasRoadmap: tasks.length > 0 });
}

export default function RoadmapPage() {
  // Render KanbanBoard or "Generate" CTA
}
```

---

## Phase 7: Drag-and-Drop (Day 5)

### 7.1 DnD Setup
- [ ] Install `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- [ ] Configure DndContext with sensors
- [ ] Implement cross-column drag

### 7.2 State Management
- [ ] Use `useFetcher` for optimistic updates
- [ ] Debounce server sync (200ms)
- [ ] Handle drag-end: update kanbanColumn, status

---

## Phase 8: Admin Features (Day 6)

### 8.1 Admin Routes
- [ ] **Create `admin/app/features/roadmap/routes/templates.tsx`**
  - List all templates
  - Filter by category, active status
  - Reorder with drag-drop

- [ ] **Create `admin/app/features/roadmap/routes/template.$id.tsx`**
  - Edit template form
  - Preview targeting logic

### 8.2 Admin Service
- [ ] **Create `admin/app/features/roadmap/services/admin-roadmap.server.ts`**

---

## Phase 9: Testing & Polish (Day 7)

### 9.1 Testing
- [ ] E2E: Complete diagnosis → Generate → Complete 3 tasks → Milestone toast
- [ ] Edge: Empty roadmap, all completed, re-generation
- [ ] Mobile: Touch drag-drop

### 9.2 Performance
- [ ] Lazy load TaskEditModal
- [ ] Virtualize task list if >50 items

### 9.3 Accessibility
- [ ] Keyboard navigation for Kanban
- [ ] Screen reader announcements for drag

---

## QA Checklist

### User Flow
- [ ] New user completes diagnosis → sees "Generate Roadmap" CTA
- [ ] Generate → 10-15 tasks appear in To Do
- [ ] Drag task to In Progress → column updates
- [ ] Click checkbox → moves to Completed
- [ ] Complete all Learning → milestone toast
- [ ] Add custom task → appears in list
- [ ] Delete custom task → confirmation → removed
- [ ] Edit task → modal opens → save → updated

### Admin Flow
- [ ] View template list
- [ ] Create new template with targeting
- [ ] Edit existing template
- [ ] Deactivate template → excluded from generation

### Edge Cases
- [ ] User without profile → redirect to diagnosis
- [ ] Re-generate roadmap → replace existing tasks?
- [ ] Delete all tasks → show empty state
- [ ] 100% completion → celebration + "Share" option
