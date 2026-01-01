# Tasks: Settlement Checklist Marketplace

## Phase 1: Data Architecture & Core Migration
The goal is to transition from a "Static Single List" to a "Dynamic Template Subscription" model.

### 1.1 Database Schema Design (Drizzle)
- [ ] **Define `settlement_templates` table**
    - Columns: `id` (uuid), `author_id` (uuid), `title`, `description` (text), `tags` (jsonb), `is_official` (bool), `status` (enum: draft, published, archived), `version` (int), `created_at`, `updated_at`.
    - Indexes: `author_id`, `is_official`, `status`.
- [ ] **Define `settlement_task_templates` table**
    - Columns: `id` (uuid), `include_template_id` (uuid, fk), `title`, `description` (md), `category` (enum), `timing_rule` (jsonb: `{type: "relative", days: -7}`), `is_required` (bool).
    - Meaning: These are the "blueprint" tasks inside a template.
- [ ] **Define `settlement_subscriptions` table**
    - Columns: `id` (uuid), `user_id` (uuid), `template_id` (uuid), `is_active` (bool), `equipped_at`.
    - Unique Constraint: `(user_id, template_id)`.
- [ ] **Migrate `user_settlement_tasks` table**
    - Add `subscription_id` (nullable for legacy support, eventually required).
    - Add `task_template_id` (fk).
    - Migration Script:
        1. Create "Official Tokyo Basic" template in `settlement_templates`.
        2. Move hardcoded tasks to `settlement_task_templates` linking to Official Template.
        3. For every existing user, create a `settlement_subscriptions` entry linking them to Official Template.
        4. Link existing user tasks to the new schema.

### 1.2 Service Layer Refactor
- [ ] **Implement `SettlementTemplateService`**
    - `createTemplate(authorId, data)`
    - `getTemplate(id)`
    - `publishTemplate(id)`
- [ ] **Refactor `SettlementService.getTasks(userId)`**
    - Logic Change: Instead of returning static tasks, query all **Active Subscriptions** for the user.
    - Fetch all `TaskTemplates` for those subscriptions.
    - **Merge Logic**:
        - Combine tasks from all templates.
        - Calculate absolute dates based on User's Arrival Date (`timing_rule` + `arrivalDate`).
        - Sort by calculated date.
    - Return unified `JobTask[]` structure to the frontend.

## Phase 2: Marketplace & Discovery (Frontend)

### 2.1 Marketplace UI
- [ ] **Create `features/settlement/routes/marketplace.tsx`**
    - Layout: Grid view of available templates.
    - Filter Bar: Tags (Visa, Job, Family), Sort (Popular, New).
- [ ] **Implement `ChecklistCard` Component**
    - Props: `template: SettlementTemplate`.
    - Display: Title, Description (truncated), Author Avatar, Tags, "Official" Badge.
    - Action: "Preview" button.

### 2.2 Template Detail & Preview
- [ ] **Create `features/settlement/routes/marketplace.$templateId.tsx`**
    - Header: Title, Author, "Equip" button (or "Unequip" if already owned).
    - Content: Full description (Markdown).
    - **Preview List**: Show the list of tasks included in this module.
        - Visual: "Timeline Preview" (e.g., "Arrive - 7 days: Do this").
- [ ] **Implement `Equip/Unequip` Action**
    - Server Action: Call `SettlementService.subscribe(userId, templateId)`.
    - Toast Feedback: "Equipped! 15 new tasks added to your timeline."

### 2.3 Dashboard Integration
- [ ] **Update `features/settlement/routes/index.tsx`**
    - Add "Manage Modules" button (links to Marketplace or simple modal).
    - Show list of equipped modules (Active Subscriptions) in the sidebar or header.
    - **Task Source Indicator**: In the task list, show a small icon or badge indicating which module this task came from (e.g., " 🏦 Finance Pack").

## Phase 3: Creator Tools (User-Generated Content)

### 3.1 Editor UI
- [ ] **Create `features/settlement/routes/editor.new.tsx`**
    - Form: Title, Description, Tags.
- [ ] **Create `features/settlement/routes/editor.$templateId.tsx`**
    - **Task Manager**: Interactive list to add/edit/delete tasks within the template.
    - **Task Render**: Inline edit for Title. Modal for Description/Timing.
    - **Timing Editor**: UI to select "Before Arrival", "After Arrival" and set days.

### 3.2 Publishing Flow
- [ ] **Implement "Publish" Action**
    - Validation: Ensure at least 3 tasks exist, title is not empty.
    - Status Change: `DRAFT` -> `PUBLISHED` (or `PENDING_REVIEW` if we implement moderation).

## Phase 4: Social & Engagement

### 4.1 Reviews & Ratings
- [ ] **Schema**: Add `settlement_reviews` table (`template_id`, `user_id`, `rating`, `comment`).
- [ ] **UI**: Add "Write Review" button on Template Detail page (only if equipped).
- [ ] **Aggregation**: Cron job or trigger to update `settlement_templates.rating_avg`.

### 4.2 Combinations (Loadouts)
- [ ] **Schema**: `settlement_collections` (`title`, `template_ids[]`).
- [ ] **UI**: "Recommended Sets" section in Marketplace.
    - "Click to Equip All" action.

## Phase 5: Administration
- [ ] **Admin Dashboard (`/admin/settlement`)**
    - List of all user-generated templates.
    - Actions: `Verify` (Add Official Badge), `Hide`, `Delete`.
    - Metrics: Usage stats (Install count).
