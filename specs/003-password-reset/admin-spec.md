# Admin Feature Specification: Password Support

**Feature**: `003-password-reset`
**Role**: Admin
**Outcome**: Admins can manage security incidents and assist with account recovery.

## 1. User Scenarios

### 1.1 Support Password Reset
**As an**: Admin
**I want to**: Trigger a password reset email for a user
**So that**: I can assist a non-technical user or one who claims "I didn't get the link".

- **Acceptance Criteria**:
    - "Send Password Reset" action makes an entry in `password_reset_tokens` and sends email.
    - Action is logged in `password_reset_logs` with `eventType: "admin_requested"`.

### 1.2 Investigate Brute Force Attacks
**As an**: Admin
**I want to**: View `password_reset_attempts` for an email or IP
**So that**: I can identify and respond to credential stuffing or abuse.

- **Acceptance Criteria**:
    - Table view of attempts with columns: `email`, `ipAddress`, `attemptedAt`.
    - Filter by date range (Last 24h, 7d, 30d).
    - Aggregate view: "Top 10 IPs by attempt count".

### 1.3 Block Suspicious IP
**As an**: Admin
**I want to**: Add an IP address to a blocklist
**So that**: I can stop an ongoing brute force attack immediately.

- **Acceptance Criteria**:
    - "Block IP" action creates entry in `blocked_ips` table (or Redis if external).
    - Duration options: 1 hour, 24 hours, Permanent.
    - Log action in `admin_audit_logs`.

## 2. Requirements

### 2.1 Functional Requirements
- **FR_ADMIN_003.01**: Admin CANNOT set a password directly (Security Best Practice). MUST only send reset link.
- **FR_ADMIN_003.02**: System MUST show if a user HAS a password (vs Social Only). logic: `user.password IS NOT NULL`.
- **FR_ADMIN_003.03**: System MUST provide IP blocking capability with time-based expiration.
- **FR_ADMIN_003.04**: System MUST aggregate `password_reset_attempts` for analytics.

### 2.2 Security Requirements
- **SEC_ADMIN_003.01**: IP block actions MUST require confirmation and audit log.
- **SEC_ADMIN_003.02**: Rate limit visibility should be restricted to Security Admin role.

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `password_reset_tokens` | **Write** | Create token. |
| `password_reset_logs` | **Read/Write** | Audit reset requests. |
| `password_reset_attempts` | **Read** | Check for abuse patterns. |
| `blocked_ips` (New) | **Write** | IP blocklist. |
| `admin_audit_logs` | **Write** | Log blocking actions. |

## 4. Work Definition (Tasks)

- [ ] **Schema**: Add `blocked_ips` table (`ip`, `reason`, `expiresAt`, `createdBy`, `createdAt`).
- [ ] **Backend**: `AdminAuthService.sendPasswordReset(userId)`.
- [ ] **Backend**: `AdminAuthService.getPasswordResetHistory(userId)`.
- [ ] **Backend**: `AdminSecurityService.getAttemptsByIP(ip)`.
- [ ] **Backend**: `AdminSecurityService.blockIP(ip, duration, reason)`.
- [ ] **Frontend**: "Security" tab in User Detail.
- [ ] **Frontend**: Display "Password: Set (Last change...)" or "Not Set".
- [ ] **Frontend**: "Security Dashboard" with IP analytics and block controls.
