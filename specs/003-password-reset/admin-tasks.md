# Admin Tasks: Password Reset

## Schema Changes
- [ ] **Migration**: Create `blocked_ips` table (`ip TEXT`, `reason TEXT`, `expiresAt TIMESTAMP`, `createdBy UUID`, `createdAt TIMESTAMP`).

## Backend Implementation
- [ ] **Mutation**: `adminTriggerPasswordReset(userId)`
    - Logic: Behaves like public "Forgot Password" but triggered by Admin ID.
    - Log event: `password_reset_logs` (`eventType: "admin_initiated"`).
- [ ] **Query**: `adminGetPasswordMeta(userId)`
    - Returns `{ hasPassword: boolean, lastReset: Date, activeResetToken: boolean }`.
- [ ] **Query**: `adminGetAttemptAnalytics(email?, ip?, days)`
    - Aggregate `password_reset_attempts`.
- [ ] **Mutation**: `adminBlockIP(ip, duration, reason)`
    - Insert into `blocked_ips`.
    - Log in `admin_audit_logs`.

## Frontend Implementation
- [ ] **Component**: `SecurityPanel` in User Detail.
    - "Send Reset Link" Button.
    - "Password Status" Indicator.
- [ ] **Page**: `features/security/routes/ip-management.tsx`.
    - IP attempt analytics table.
    - "Block IP" form.

## QA Verification
- [ ] **Test Case**: Click "Send Reset Link". Verify email received.
- [ ] **Test Case**: Verify Admin cannot see the actual password hash.
- [ ] **Test Case**: Block an IP, verify login attempts from that IP are rejected.
