# Admin Feature Specification: Public Profile Management

**Feature**: `005-public-profile`
**Role**: Admin
**Outcome**: Admins can correct misinformation, censor inappropriate text, and control profile visibility.

## 1. User Scenarios

### 1.1 Edit Profile Details
**As an**: Admin
**I want to**: Edit a user's "Job Title", "Bio", or other profile fields
**So that**: I can fix obvious spam (e.g., "Buy Crypto" links) without deleting the account.

- **Acceptance Criteria**:
    - Full form access to `profiles` table fields (`jobFamily`, `bio`, `website`, `linkedinUrl`, `githubUrl`).
    - Updates are logged in `admin_audit_logs`.

### 1.2 Suspend User Account
**As an**: Admin
**I want to**: Change `users.status` to "suspended"
**So that**: The user cannot log in and their profile is hidden from public view.

- **Acceptance Criteria**:
    - "Suspend User" button in User Detail header.
    - Requires confirmation dialog with mandatory "Reason" input.
    - Sets `users.status = 'suspended'`.
    - Invalidates all active sessions for the user.
    - Log action in `admin_audit_logs` with reason.

### 1.3 Reactivate User Account
**As an**: Admin
**I want to**: Change `users.status` back to "active"
**So that**: A previously suspended user can regain access.

- **Acceptance Criteria**:
    - "Reactivate" button visible only when `status = 'suspended'`.
    - Log action in `admin_audit_logs`.

### 1.4 Force Slug Change
**As an**: Admin
**I want to**: Modify a user's `urlSlug`
**So that**: I can remove offensive or impersonating slugs (e.g., "official-support").

- **Acceptance Criteria**:
    - Verify slug uniqueness before saving.
    - Old slug added to `user_slug_history` with `isPrimary = false`.
    - New slug becomes the active one.

## 2. Requirements

### 2.1 Functional Requirements
- **FR_ADMIN_005.01**: Admin updates to profile MUST bypass some validation (e.g., allowing empty fields if removing bad content).
- **FR_ADMIN_005.02**: Admin can modify `slug` if it mimics an official account.
- **FR_ADMIN_005.03**: Suspending a user MUST invalidate their sessions AND hide their public profile.
- **FR_ADMIN_005.04**: All profile changes MUST be audited with before/after values.

### 2.2 Non-Functional Requirements
- **NFR_ADMIN_005.01**: Suspension should take effect within 30 seconds (session invalidation).

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `users` | **Write** | Update `status`, `urlSlug`. |
| `profiles` | **Read/Write** | Core content fields. |
| `user_slug_history` | **Write** | Track slug changes. |
| `admin_audit_logs` | **Write** | Full audit trail. |

## 4. Work Definition (Tasks)

- [ ] **Backend**: `AdminProfileService.updateProfile(userId, data)`.
- [ ] **Backend**: `AdminUserService.suspendUser(userId, reason)`.
- [ ] **Backend**: `AdminUserService.reactivateUser(userId)`.
- [ ] **Backend**: `AdminProfileService.changeSlug(userId, newSlug)`.
- [ ] **Frontend**: "Edit Profile" Modal in User Detail.
- [ ] **Frontend**: "Suspend" / "Reactivate" buttons with confirmation dialogs.
- [ ] **Frontend**: Slug change input with availability check.
