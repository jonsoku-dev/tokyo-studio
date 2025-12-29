# Admin Feature Specification: Social Authentication Support

**Feature**: `001-social-auth`
**Role**: Admin
**Outcome**: Admins can monitor user social connections and investigate access issues using detailed logs.

## 1. User Scenarios

### 1.1 View User's Linked Providers
**As an**: Admin
**I want to**: See which social providers are linked to a user in `UserDetail`
**So that**: I can verify how a user is authenticating when they report issues.

- **Acceptance Criteria**:
    - Display list of providers from `account_providers` table.
    - Show `provider` (e.g., google), `linkedAt`, and `lastUsedAt`.
    - Show `providerAccountId` (masked or full) to help debug provider-side issues.

### 1.2 Audit Login History
**As an**: Admin
**I want to**: View a chronological log of authentication events for a specific user
**So that**: I can identify patterns of failed logins or unrecognized IP addresses.

- **Acceptance Criteria**:
    - Query `authentication_logs` table filtering by `userId`.
    - Display columns: `timestamp`, `eventType` (login_success/failed), `provider`, `ipAddress`, `userAgent`.
    - Pagination support (50 items per page).

## 2. Requirements

### 2.1 Functional Requirements
- **FR_ADMIN_001.01**: System MUST expose a `getAccountProviders(userId)` API for Admin.
- **FR_ADMIN_001.02**: System MUST expose a `getAuthLogs(userId, page, limit)` API.
- **FR_ADMIN_001.03**: Admin dashboard MUST allow filtering the User List by `provider` (e.g., "Show all GitHub users").
    - implementation detail: Query `users` joined with `account_providers`.

### 2.2 Security Requirements
- **SEC_ADMIN_001.01**: Log sensitive fields like `accessToken` MUST NEVER be returned to the Admin UI.
- **SEC_ADMIN_001.02**: Access to Auth Logs must be restricted to Super Admins (if role separation exists).

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `account_providers` | **Read-Only** | Used to list linked accounts. |
| `authentication_logs` | **Read-Only** | Critical for audit trail. |
| `users` | **Read-Only** | Basic profile data. |

## 4. Work Definition (Tasks)

- [ ] **Backend**: Create `AdminAuthService.getProviderStats(userId)` returning mapped `account_providers` data.
- [ ] **Backend**: Create `AdminAuthService.getLogs(userId)` returning paginated `authentication_logs`.
- [ ] **Frontend**: Implement `ConnectedAccountsCard` in `features/users/components/detail/`.
- [ ] **Frontend**: Implement `AuthLogTable` in `features/users/components/detail/SecurityTab.tsx`.
