# Admin Tasks: Avatar Moderation

## Backend Implementation
- [ ] **Mutation**: `adminRemoveAvatar(userId)`
    - Fetch current key from DB.
    - Delete from S3 (ensure S3 service handles key correctly).
    - Update `users` table (`avatarUrl = null`).
    - Log to `admin_audit_logs` (`action: "remove_avatar"`).

## Frontend Implementation
- [ ] **Component**: `AdminAvatar`
    - Standard Avatar with "X" button on hover.
    - Confirmation Dialog: "Are you sure? This cannot be undone."

## QA Verification
- [ ] **Test Case**: Upload avatar -> Admin removes -> Verify User sees default avatar.
