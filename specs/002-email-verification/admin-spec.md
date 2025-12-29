# Admin Feature Specification: Email Verification Management

**Feature**: `002-email-verification`
**Role**: Admin
**Outcome**: Admins can override verification status and debug delivery issues.

## 1. User Scenarios

### 1.1 Manual Verification Override
**As an**: Admin
**I want to**: Manually set a user's status to "Verified"
**So that**: I can unblock a user whose email provider aggressively filters our verification links.

- **Acceptance Criteria**:
    - "Verify Manually" button in User Detail.
    - Action updates `users.emailVerified` timestamp to `NOW()`.
    - Action CREATEs an entry in `admin_audit_logs` (Action: `manual_verify`, Target: `userId`).

### 1.2 View Token Status
**As an**: Admin
**I want to**: See if a verification token exists and when it expires
**So that**: I know if the user just needs to check their spam folder or if the token is already expired.

## 2. Requirements

### 2.1 Functional Requirements
- **FR_ADMIN_002.01**: Admin API `verifyUser(userId)` MUST update `emailVerified` and log the action.
- **FR_ADMIN_002.02**: Admin API `resendVerification(userId)` MUST generate a NEW token in `verification_tokens` and trigger the email job.

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `users` | **Write** | Update `emailVerified`. |
| `verification_tokens` | **Read/Write** | Check existence / Create new. |
| `admin_audit_logs` | **Write** | Log the manual override. |

## 4. Work Definition (Tasks)

- [ ] **Backend**: Implement `AdminUserService.manualVerify(userId, adminId)`.
- [ ] **Backend**: Implement `AdminAuthService.resendVerification(userId)`.
- [ ] **Frontend**: Add "Verification Status" indicator in User Info Header (Green Check / Yellow !).
- [ ] **Frontend**: Add Actions menu: "Mark as Verified", "Resend Email".
