# Admin Feature Specification: Settlement Checklist Management

**Feature**: `019-settlement-checklist`
**Role**: Admin
**Outcome**: Admins can manage checklist templates and monitor user completion.

## Current Implementation Status

### Main Spec Reference
- **File**: `specs/019-settlement-checklist/spec.md`
- **User Scenarios**: 5 stories (Arrival Setup, Task Details, Progress Tracking, Forms, Filtering)
- **Requirements**: FR-001 to FR-015
- **Note**: Spec is titled "Tokyo Settlement Checklist" with bilingual KO/JP support

### Existing Code
| Path | Status |
|------|--------|
| Settlement feature | ❌ **Not Implemented** |

### Schema From Main Spec
- **Settlement Checklist Entry**: User's personalized journey with arrival date
- **Settlement Task**: Individual activity with KO/JP instructions, documents, deadlines
- **Task Completion**: User's progress on specific task
- **Form Template**: Downloadable PDFs with version control

## 1. User Scenarios (Admin)

### 1.1 Manage Checklist Templates
**As an**: Admin
**I want to**: Create and edit settlement checklist templates
**So that**: Users have up-to-date guidance for settling in Japan.

- **Categories**: Before Arrival, First Week, First Month, First 3 Months (FR-002)

### 1.2 Add Localized Content
**As an**: Admin
**I want to**: Add Korean/Japanese translations for items
**So that**: Users can see content in their preferred language.

- **Languages**: Korean, Japanese (FR-005)

### 1.3 View Completion Analytics
**As an**: Admin
**I want to**: See which items are most/least completed
**So that**: I can improve guidance for difficult steps.

### 1.4 Manage Form Templates
**As an**: Admin
**I want to**: Upload and version form templates (PDFs)
**So that**: Users have access to current official forms.

- **Examples**: Residence card, health insurance enrollment (FR-009)

### 1.5 Reset User Checklist
**As an**: Admin
**I want to**: Reset a user's checklist progress
**So that**: They can restart if templates were updated significantly.

## 2. Requirements

### 2.1 Dependencies (From Main Spec)
- **FR-005**: Bilingual KO/JP support
- **FR-009**: Downloadable PDF form templates
- **FR-013**: Persist arrival date and completion status

### 2.2 Admin-Specific Requirements
- **FR_ADMIN_019.01**: Template CRUD with i18n
- **FR_ADMIN_019.02**: Form template version control
- **FR_ADMIN_019.03**: Completion analytics
- **FR_ADMIN_019.04**: Per-user reset

## 3. Data Model Reference (Proposed)

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `checklist_categories` | **Read/Write** | Category templates with i18n |
| `checklist_items` | **Read/Write** | Item templates |
| `checklist_form_templates` | **Read/Write** | PDF versions |
| `user_checklist_entries` | **Read/Write** | User arrival date/progress |
| `user_task_completions` | **Read/Write** | Individual task status |
| `admin_audit_logs` | **Write** | Actions |

## 4. Work Definition (Tasks)

### Phase 1: Schema
- [ ] Create `checklist_categories` table (with KO/JP fields)
- [ ] Create `checklist_items` table
- [ ] Create `checklist_form_templates` table
- [ ] Create `user_checklist_entries` table
- [ ] Create `user_task_completions` table

### Phase 2: Backend
- [ ] `AdminChecklistService.manageCategories()`
- [ ] `AdminChecklistService.manageItems()`
- [ ] `AdminChecklistService.uploadFormTemplate()`
- [ ] `AdminAnalyticsService.getCompletionStats()`
- [ ] `AdminChecklistService.resetUserChecklist(userId)`

### Phase 3: Frontend
- [ ] Checklist template editor with i18n toggle
- [ ] Form template uploader with version history
- [ ] Completion stats chart
