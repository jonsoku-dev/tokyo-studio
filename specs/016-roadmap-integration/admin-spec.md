# Admin Feature Specification: Roadmap Content Management

**Feature**: `016-roadmap-integration`
**Role**: Admin
**Outcome**: Admins can manage roadmap templates, targeting rules, and user progress analytics.

## Current Implementation Status

### Main Spec Reference
- **File**: `specs/016-roadmap-integration/spec.md`
- **Plan**: `specs/016-roadmap-integration/plan.md`
- **Tasks**: `specs/016-roadmap-integration/tasks.md`

### Existing Schema (To Be Extended)
| Table | Status |
|-------|--------|
| `tasks` | ✅ Exists - will add `estimatedMinutes`, `templateId`, `kanbanColumn`, `completedAt` |
| `profiles` | ✅ Exists - has `jobFamily`, `level`, `jpLevel`, `enLevel`, `targetCity` |
| `roadmap_templates` | 🟡 New table required |
| `user_roadmaps` | 🟡 New table required |

---

## 1. User Scenarios (Admin)

### 1.1 Manage Roadmap Templates
**As an**: Admin
**I want to**: Create/edit/delete roadmap templates
**So that**: Users receive curated, high-quality task suggestions.

**Acceptance Criteria**:
- Template fields: title, description, category, estimated time, priority, order
- Targeting rules: job families, levels, JP levels, cities (multi-select)
- Activate/deactivate toggle
- Drag-and-drop reordering

### 1.2 Preview Template Targeting
**As an**: Admin
**I want to**: See how many users a template would affect
**So that**: I can optimize targeting rules.

**Acceptance Criteria**:
- "Preview" button shows count of profiles matching targeting
- Sample of 5 matching user profiles displayed

### 1.3 View User Progress Analytics
**As an**: Admin
**I want to**: See funnel completion rates per stage
**So that**: I can identify where users get stuck.

**Acceptance Criteria**:
- Funnel chart: Generated → First Task → 50% → Complete
- Category breakdown: Learning vs Application vs Settlement
- Drill-down to specific users at each stage

### 1.4 Reset User Roadmap
**As an**: Admin
**I want to**: Reset a specific user's roadmap
**So that**: They can regenerate after major template updates.

**Acceptance Criteria**:
- Confirmation modal with reason
- Deletes user's tasks (template-generated only)
- Resets `user_roadmaps` entry
- Logs action to `admin_audit_logs`

### 1.5 Bulk Template Operations
**As an**: Admin
**I want to**: Export/import templates as JSON
**So that**: I can backup or migrate configurations.

---

## 2. Requirements

### 2.1 Functional Requirements
- **FR_ADMIN_016.01**: CRUD for `roadmap_templates` with all fields
- **FR_ADMIN_016.02**: Target preview with user count
- **FR_ADMIN_016.03**: Progress funnel analytics
- **FR_ADMIN_016.04**: Per-user roadmap reset
- **FR_ADMIN_016.05**: Template export/import

### 2.2 Security Requirements
- **SEC_ADMIN_016.01**: All template changes logged to `admin_audit_logs`
- **SEC_ADMIN_016.02**: User roadmap reset requires confirmation and reason

---

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `roadmap_templates` | **Read/Write** | Template definitions (New) |
| `tasks` | **Read/Write** | User task instances (Extended) |
| `user_roadmaps` | **Read/Write** | User progress summary (New) |
| `profiles` | **Read** | For targeting preview |
| `admin_audit_logs` | **Write** | Audit trail |

### Schema: `roadmap_templates`
```typescript
{
  id: UUID,
  title: string,
  description: string,
  category: 'Learning' | 'Application' | 'Preparation' | 'Settlement',
  estimatedMinutes: number,
  priority: 'urgent' | 'normal' | 'low',
  orderIndex: number,
  
  // Targeting (NULL = all)
  targetJobFamilies: string[] | null,
  targetLevels: string[] | null,
  targetJpLevels: string[] | null,
  targetCities: string[] | null,
  
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
}
```

---

## 4. Work Definition (Tasks)

### Phase 1: Backend Service
- [ ] `AdminRoadmapService.listTemplates(filters)` - with pagination, category filter
- [ ] `AdminRoadmapService.createTemplate(data)` - validate, insert, audit log
- [ ] `AdminRoadmapService.updateTemplate(id, data)` - partial update, audit log
- [ ] `AdminRoadmapService.deleteTemplate(id)` - soft delete, audit log
- [ ] `AdminRoadmapService.reorderTemplates(ids[])` - bulk update orderIndex
- [ ] `AdminRoadmapService.previewTargeting(conditions)` - count + sample profiles

### Phase 2: Analytics Service
- [ ] `AdminAnalyticsService.getRoadmapFunnel()` - stage counts
- [ ] `AdminAnalyticsService.getCategoryBreakdown()` - Learning/App/Prep/Settlement
- [ ] `AdminAnalyticsService.getUsersAtStage(stage)` - drill-down

### Phase 3: User Management
- [ ] `AdminRoadmapService.resetUserRoadmap(userId, adminId, reason)`
- [ ] `AdminRoadmapService.getUserRoadmapDetail(userId)` - for support

### Phase 4: Admin Frontend

#### Routes
| Route | File | Purpose |
|-------|------|---------|
| `/admin/roadmap/templates` | `templates.tsx` | Template list |
| `/admin/roadmap/templates/new` | `template.new.tsx` | Create template |
| `/admin/roadmap/templates/:id` | `template.$id.tsx` | Edit template |
| `/admin/roadmap/analytics` | `analytics.tsx` | Funnel dashboard |

#### Components
- [ ] `TemplateList.tsx` - Sortable table with actions
- [ ] `TemplateForm.tsx` - Full form with targeting UI
- [ ] `TargetingPreview.tsx` - User count + sample
- [ ] `FunnelChart.tsx` - Stage visualization
- [ ] `CategoryBreakdown.tsx` - Pie chart

---

## 5. QA Verification

### Template Management
- [ ] Create template with all fields → appears in list
- [ ] Edit template → changes saved
- [ ] Deactivate template → excluded from generation
- [ ] Reorder templates → order persists

### Targeting
- [ ] Set `targetJobFamilies: ['frontend']` → only frontend users get task
- [ ] Set `targetJpLevels: ['N5', 'None']` → only low-JP users get task
- [ ] Preview shows correct count

### Analytics
- [ ] View funnel → numbers match DB
- [ ] Drill-down to 50% stage → see user list

### User Management
- [ ] Reset user roadmap → tasks deleted, progress zeros
- [ ] Audit log contains reason
