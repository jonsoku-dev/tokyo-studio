# Admin Tasks: Settlement Checklist

## Schema
- [ ] Create `checklist_categories` table (with i18n support).
- [ ] Create `checklist_items` table.
- [ ] Create `user_checklist_progress` table.

## Backend Implementation
- [ ] **CRUD**: `adminManageCategories()`.
- [ ] **CRUD**: `adminManageItems()`.
- [ ] **Query**: `adminGetCompletionStats()`.
- [ ] **Mutation**: `adminResetUserChecklist(userId)`.

## Frontend Implementation
- [ ] **Page**: `features/checklist/routes/admin.tsx`.
- [ ] **Component**: Template editor with i18n fields.
- [ ] **Widget**: Completion stats chart.

## QA Verification
- [ ] **Test**: Create category and items, verify public display.
- [ ] **Test**: View completion analytics.
