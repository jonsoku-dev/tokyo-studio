# Admin Tasks: Storage Management

## Backend Implementation
- [ ] **Query**: `adminGetFileLogs(userId, filters)`
    - Select from `file_operation_logs`.
    - Join `documents` for filename context.
    - Filter by operation type, date range.
- [ ] **Query**: `adminGetUserStorageStats(userId)`
    - Return: `{ totalSize: number, breakdown: { resume: N, portfolio: N, avatar: N } }`.
- [ ] **Query**: `adminGetLargeFiles(thresholdBytes)`
    - Global query on `documents` where `size > threshold`.
    - Include user info and upload date.
- [ ] **Mutation**: `adminForceDeleteFile(docId, reason)`
    - Delete from S3.
    - Set `documents.status = 'deleted'`, `deletedAt = NOW()`.
    - Log in `admin_audit_logs`.

## Frontend Implementation
- [ ] **Component**: "Storage Logs" table in User Detail.
- [ ] **Component**: "Storage Usage" card with breakdown chart (pie or bar).
- [ ] **Widget**: "Large Files" on Admin Dashboard Home.
- [ ] **Action**: "Force Delete" with confirmation modal.

## QA Verification
- [ ] **Test Case**: Upload a file as user. Check Admin log sees "upload" event.
- [ ] **Test Case**: View storage stats for a user with multiple files.
- [ ] **Test Case**: Force delete a file. Verify S3 object is removed and DB updated.
