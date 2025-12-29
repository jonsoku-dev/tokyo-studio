# Admin Tasks: Social Authentication

## Backend Implementation
- [ ] **API Endpoint**: `GET /api/admin/users/:userId/auth-providers`
    - Query `account_providers` table.
    - Omit `accessToken`, `refreshToken`.
- [ ] **API Endpoint**: `GET /api/admin/users/:userId/auth-logs`
    - Query `authentication_logs` table.
    - Sort by `timestamp` DESC.

## Frontend Implementation
- [ ] **Component**: `ConnectedAccountsCard`
    - Props: `providers: AccountProvider[]`
    - UI: List with icons (Google, GitHub), "Linked since [Date]", "Last used [Date]".
- [ ] **Component**: `AuthActivityLog`
    - Columns: Event (Badge: Success/Fail), Time, IP, Device.

## QA Verification
- [ ] **Test Case**: Login as Admin, view details of a user who used Google Auth. Verify "Google" icon appears.
- [ ] **Test Case**: Verify that `accessToken` is NOT visible in the network response.
