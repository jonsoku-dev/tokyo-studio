# Admin Tasks: Profile Management

## Backend Implementation
- [ ] **Mutation**: `adminUpdateUserProfile(userId, input)`
    - Updates `profiles` table.
    - Updates `users` table (name).
    - Log `admin_audit_logs` (`action: "update_profile"`, with before/after diff).
- [ ] **Mutation**: `adminSuspendUser(userId, reason)`
    - Set `users.status = 'suspended'`.
    - Invalidate sessions (clear from session store).
    - Log `admin_audit_logs`.
- [ ] **Mutation**: `adminReactivateUser(userId)`
    - Set `users.status = 'active'`.
    - Log `admin_audit_logs`.
- [ ] **Mutation**: `adminChangeSlug(userId, newSlug)`
    - Validate uniqueness.
    - Update `users.urlSlug`.
    - Insert old slug into `user_slug_history`.

## Frontend Implementation
- [ ] **Component**: Reuse User Profile Form but with Admin permissions.
- [ ] **Component**: "Suspend" / "Reactivate" toggle buttons with status badge.
- [ ] **Component**: Slug change input with real-time availability check.
- [ ] **UI**: Confirmation modals with reason input for suspension.
- [ ] **UI**: "Public View" link to see what the profile looks like live.

## QA Verification
- [ ] **Test Case**: Admin changes Bio to "Edited by Admin". Check public page.
- [ ] **Test Case**: Suspend user. Verify they cannot log in.
- [ ] **Test Case**: Reactivate user. Verify login works again.
- [ ] **Test Case**: Change slug, verify old slug redirects (if implemented) or 404s.
