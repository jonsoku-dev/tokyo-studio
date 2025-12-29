# Admin Tasks: Roadmap Management

## Phase 1: Schema & Migration (Day 1)

### Database
- [ ] **Migration**: Create `roadmap_templates` table
  - `id`, `title`, `description`, `category`, `estimatedMinutes`, `priority`, `orderIndex`
  - `targetJobFamilies` (text[]), `targetLevels` (text[]), `targetJpLevels` (text[]), `targetCities` (text[])
  - `isActive`, `createdAt`, `updatedAt`

- [ ] **Migration**: Extend `tasks` table
  - Add `estimatedMinutes` (integer)
  - Add `templateId` (uuid FK to roadmap_templates)
  - Add `kanbanColumn` (text: 'todo' | 'in_progress' | 'completed')
  - Add `completedAt` (timestamp)

- [ ] **Migration**: Create `user_roadmaps` table
  - `id`, `userId` (unique FK), `generatedAt`, `totalTasks`, `completedTasks`
  - `currentMilestone`, `lastMilestoneAt`

- [ ] **Run**: `pnpm db:push` in packages/database

---

## Phase 2: Backend Service (Day 2)

### Admin Service
- [ ] **Create**: `admin/app/features/roadmap/services/admin-roadmap.server.ts`

```typescript
export const AdminRoadmapService = {
  // Template CRUD
  async listTemplates(filters: { category?: string, isActive?: boolean }) {},
  async createTemplate(data: InsertRoadmapTemplate, adminId: string) {},
  async updateTemplate(id: string, data: Partial<InsertRoadmapTemplate>, adminId: string) {},
  async deleteTemplate(id: string, adminId: string) {},
  async reorderTemplates(orderedIds: string[]) {},
  
  // Targeting Preview
  async previewTargeting(conditions: TargetingConditions): Promise<{ count: number, sample: User[] }> {},
  
  // Analytics
  async getRoadmapFunnel(): Promise<FunnelData> {},
  async getCategoryBreakdown(): Promise<CategoryData> {},
  async getUsersAtStage(stage: string, limit: number): Promise<User[]> {},
  
  // User Management
  async resetUserRoadmap(userId: string, adminId: string, reason: string) {},
  async getUserRoadmapDetail(userId: string): Promise<UserRoadmapDetail> {},
};
```

- [ ] **Audit Logging**: All mutations log to `admin_audit_logs`

---

## Phase 3: Admin Routes (Day 3)

### Routes Configuration
- [ ] Add routes to `admin/app/routes.ts`:
```typescript
route("roadmap/templates", "features/roadmap/routes/templates.tsx"),
route("roadmap/templates/new", "features/roadmap/routes/template.new.tsx"),
route("roadmap/templates/:id", "features/roadmap/routes/template.$id.tsx"),
route("roadmap/analytics", "features/roadmap/routes/analytics.tsx"),
```

### Template List Page
- [ ] **Create**: `admin/app/features/roadmap/routes/templates.tsx`
  - Loader: `AdminRoadmapService.listTemplates()`
  - Features: Filter by category, active status
  - Actions: Create, Edit, Deactivate, Delete
  - Drag-drop reordering

### Template Form Page
- [ ] **Create**: `admin/app/features/roadmap/routes/template.new.tsx`
- [ ] **Create**: `admin/app/features/roadmap/routes/template.$id.tsx`
  - Form fields: title, description, category (select), estimatedMinutes, priority
  - Targeting: Multi-select chips for each condition
  - Preview button: Shows matching user count

### Analytics Page
- [ ] **Create**: `admin/app/features/roadmap/routes/analytics.tsx`
  - Funnel chart: Generated → First Task → 50% → Complete
  - Category pie chart
  - User drill-down lists

---

## Phase 4: Admin Components (Day 4)

### Component List
```
admin/app/features/roadmap/components/
├── TemplateList.tsx        # Sortable table
├── TemplateForm.tsx        # Create/Edit form
├── TargetingSelector.tsx   # Multi-select for conditions
├── TargetingPreview.tsx    # User count preview
├── FunnelChart.tsx         # Stage funnel
├── CategoryPieChart.tsx    # Category breakdown
└── UserRoadmapCard.tsx     # User detail view
```

### TemplateForm.tsx
- [ ] Fields: title (input), description (textarea), category (select)
- [ ] Fields: estimatedMinutes (number), priority (select), isActive (toggle)
- [ ] Targeting: JobFamily chips, Level chips, JP Level chips, City chips
- [ ] Preview button inline

### TargetingPreview.tsx
- [ ] Query API when conditions change (debounced)
- [ ] Show: "This template will apply to X users"
- [ ] Show: Sample of 5 matching profiles

### FunnelChart.tsx
- [ ] Stages: Generated, First Task, 50%, Learning Done, Complete
- [ ] Click stage → drill-down modal
- [ ] Use chart library (Recharts)

---

## Phase 5: Seed Default Templates (Day 1)

### Script
- [ ] **Create**: `admin/app/features/roadmap/scripts/seed-templates.ts`

```typescript
const templates = [
  // Learning (4)
  { title: "기술 스택 현대화", category: "Learning", targetJobFamilies: ["frontend"], estimatedMinutes: 120, priority: "normal" },
  { title: "코딩 테스트 준비", category: "Learning", estimatedMinutes: 180, priority: "urgent" },
  { title: "일본어 업무 표현", category: "Learning", targetJpLevels: ["N3", "N4", "N5", "None"], estimatedMinutes: 60 },
  { title: "영문 이력서 작성", category: "Learning", estimatedMinutes: 90 },
  
  // Application (4)
  { title: "LinkedIn 프로필 최적화", category: "Application", estimatedMinutes: 45 },
  { title: "Wantedly/Green 계정 생성", category: "Application", targetCities: ["Tokyo", "Osaka"], estimatedMinutes: 30 },
  { title: "포트폴리오 사이트 제작", category: "Application", targetJobFamilies: ["frontend", "fullstack"], estimatedMinutes: 240 },
  { title: "추천서 확보", category: "Application", targetLevels: ["mid", "senior", "lead"], estimatedMinutes: 60 },
  
  // Preparation (4)
  { title: "모의 면접 연습", category: "Preparation", estimatedMinutes: 120 },
  { title: "연봉 협상 리서치", category: "Preparation", estimatedMinutes: 60 },
  { title: "회사 문화 조사", category: "Preparation", estimatedMinutes: 90 },
  { title: "비자 요건 확인", category: "Preparation", estimatedMinutes: 45 },
  
  // Settlement (3)
  { title: "임시 숙소 예약", category: "Settlement", estimatedMinutes: 60 },
  { title: "핸드폰 계약 조사", category: "Settlement", targetCities: ["Tokyo"], estimatedMinutes: 30 },
  { title: "은행 계좌 조사", category: "Settlement", estimatedMinutes: 45 },
];
```

- [ ] **Run**: `pnpm tsx admin/app/features/roadmap/scripts/seed-templates.ts`

---

## Phase 6: Testing & QA (Day 5)

### Admin Flow Testing
- [ ] **Test**: View template list → all seeded templates visible
- [ ] **Test**: Create new template → appears in list
- [ ] **Test**: Edit template → changes persist
- [ ] **Test**: Deactivate template → excluded from user generation
- [ ] **Test**: Delete template → removed (soft delete)
- [ ] **Test**: Reorder → new order persists

### Targeting Testing
- [ ] **Test**: Set `targetJobFamilies: ['frontend']` → preview shows frontend users only
- [ ] **Test**: Multiple conditions → intersection applied
- [ ] **Test**: No conditions → shows all users

### Analytics Testing
- [ ] **Test**: Funnel shows correct counts
- [ ] **Test**: Drill-down opens user list
- [ ] **Test**: Category breakdown matches DB

### User Management Testing
- [ ] **Test**: Reset user roadmap → tasks deleted
- [ ] **Test**: Audit log created with reason
