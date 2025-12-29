# Admin Feature Specification: Avatar Moderation

**Feature**: `004-avatar-upload`
**Role**: Admin
**Outcome**: Admins can enforce visual standards by removing inappropriate avatars.

## 1. User Scenarios

### 1.1 Review and Remove Avatar
**As an**: Admin
**I want to**: See a user's avatar and remove it if it violates policy
**So that**: The platform remains professional and safe.

- **Acceptance Criteria**:
    - "Remove Avatar" button available on profile picture hover.
    - Removal sets `users.avatarUrl` and `users.avatarThumbnailUrl` to `null`.
    - Removal adds entry to `avatar_logs` (Action: `admin_removed`).
    - Notification sent to user (Optional but recommended).

### 1.2 Audit Changes
**As an**: Admin
**I want to**: See `avatar_logs` for a user
**So that**: I can check if a user is repeatedly uploading offensive images.

## 2. Requirements

### 2.1 Functional Requirements
- **FR_ADMIN_004.01**: `adminRemoveAvatar(userId)` MUST delete the S3 object (or move to quarantine log) and clear DB fields.
- **FR_ADMIN_004.02**: System MUST log the Admin's ID in the `avatar_logs` (schema update may be needed if `userId` only tracks the target—audit log is better). *Correction*: Use `admin_audit_logs` for the ACTOR, `avatar_logs` for the EVENT.

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `users` | **Write** | Clear URL fields. |
| `avatar_logs` | **Read** | View history. |
| `admin_audit_logs` | **Write** | Record the moderation action. |

## 4. Work Definition (Tasks)

- [ ] **Backend**: `AdminProfileService.removeAvatar(userId)`.
- [ ] **Frontend**: Avatar Component in Admin with overlay "Delete" action.
