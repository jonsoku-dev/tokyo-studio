# Settlement Checklist Tasks

This document tracks the implementation of the Settlement Checklist feature.

## Phase 1: Core Data Models
- [x] **Schema Design**:Define `settlement_templates`, `settlement_task_templates`, `user_settlements` tables.
- [x] **Seed Data**: Create initial seed script for basic templates.

## Phase 2: User Dashboard (Checklist View)
- [x] **Route**: `/settlement` (Main Dashboard).
- [x] **Logic**:
    - [x] Auto-subscribe to "Official" template on first visit (or arrival).
    - [x] Fetch user's tasks.
    - [x] Group tasks by phases (e.g., "D-7", "D-Day", "Week 1").
    - [x] Handle "Task Completion" toggle.

### 2.1 Timeline & Progress
- [x] **Progress Bar**: Visual indicator of completion %.
- [x] **Arrival Date**: Edit/Set arrival date.

### 2.2 Dashboard Refinement
- [x] **Grouping**: Better visual separation of time-based groups.
- [x] **Empty States**: Handle cases with no subscription.

### 2.3 Integration with Subscriptions
- [x] Display active subscriptions.
- [x] Show "Source Template" for each task.

## Phase 3: Creator Tools (Template Editor)
- [x] **Editor Route**: `/settlement/editor/:templateId`.
- [x] **Create New Template**: Form to start a blank template.
- [x] **Task Management**: Add, Edit, Delete tasks within a template.
- [x] **Publishing**: "Draft" vs "Published" status.

## Phase 4: Social & Engagement
### 4.1 Reviews & Ratings
- [x] **Schema**: Add `settlement_reviews` table (`template_id`, `user_id`, `rating`, `comment`).
- [x] **UI**: Add "Write Review" button on Template Detail page (only if equipped).
- [ ] **Aggregation**: Cron job or trigger to update `settlement_templates.rating_avg`.

### 4.2 Combinations (Loadouts)
- [ ] **Schema**: `settlement_collections` (`title`, `template_ids[]`).
- [ ] **UI**: "Recommended Sets" section in Marketplace.
    - "Click to Equip All" action.

## Phase 5: Administration
- [x] **Admin Dashboard (`/admin/settlement`)**
    - List of all user-generated templates.
    - Actions: `Verify` (Add Official Badge), `Hide`, `Delete`.
    - Metrics: Usage stats (Install count).

## Phase 6: Dynamic Phases
- [x] **Schema**: `settlement_phases` table (min/max days)
- [x] **Seed**: Populate standard phases & localized titles
- [x] **Service**: `getPhases`, `groupTasksByPhase`
- [x] **UI**: Group tasks by phases (Dashboard & Marketplace)

## Phase 7: Marketplace Contribution
- [x] **UI**: "Create New Template" button and flow
- [x] **Route**: Ensure `editor.new` is linked and functional
- [x] **Action**: "Publish" template availability

## Phase 8: Final Polish & Zero Error
- [x] **Refactor**: Remove legacy `TimePhase` from server logic
- [x] **Fix**: Resolve all lint/type errors in `settlement.server.ts` and `index.tsx`
- [x] **Seed**: Clean up duplicate keys and ensure schema compliance

## Phase 9: Explicit Phase Association
- [x] **Schema**: Add `phaseId` to `settlementTaskTemplates`
- [x] **Seed**: Update `settlement.ts` to link tasks to phases
- [x] **Service**: Update `groupTasksByPhase` to use `phaseId`
- [x] **UI**: Add Phase Selector to Editor
- [x] **Verify**: Check Dashboard & Marketplace grouping-driven phases.

## Phase 10: Editor Rebuild (Clean Slate)
- [x] **Service Refactor**: Simplify `getTemplate` and task fetching to avoid nested relation errors.
- [x] **Editor Rewrite**: Create new `editor.$templateId.tsx` with explicit Phase-based grouping.
- [x] **Task Management**: Implement Add/Edit tasks with forced `phaseId` selection.
- [x] **Validation**: Verify creating a full checklist from scratch works without errors.

## Phase 11: Editor Polish & DnD
- [x] **DnD Implementation**: Add `@dnd-kit` to `editor.$templateId.tsx` for task reordering.
- [x] **UI Polish**: Improve spacing, empty states, and add transitions/animations.
- [x] **Design Review**: Ensure strict adherence to shared UI components and "Premium" feel.
- [x] **Optimistic UI**: Ensure DnD updates are instant and robust.
