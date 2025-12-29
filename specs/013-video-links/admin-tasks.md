# Admin Tasks: Video Integration

## Backend Implementation
- [ ] **Query**: `adminGetUserIntegrations(userId)`
    - Return `provider`, `createdAt`, `expiresAt` (mask tokens).
- [ ] **Mutation**: `adminForceDisconnect(userId, provider)`
    - Delete from `user_integrations`.
    - Log action.
- [ ] **Query**: `adminGetVideoProviderStats()`
    - Aggregate `mentor_profiles.preferredVideoProvider`.

## Frontend Implementation
- [ ] **Component**: "Integrations" section in User Detail.
- [ ] **Component**: Disconnect button per integration.
- [ ] **Widget**: Video provider pie chart on Dashboard.

## QA Verification
- [ ] **Test**: View user with Google integration. See "Google" listed.
- [ ] **Test**: Force disconnect. Verify `user_integrations` row deleted.
