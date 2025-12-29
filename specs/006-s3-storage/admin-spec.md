# Admin Feature Specification: Storage Infrastructure

**Feature**: `006-s3-storage`
**Role**: Admin
**Outcome**: Admins can audit file consumption, monitor storage usage, and identify abuse patterns.

## 1. User Scenarios

### 1.1 Inspect File Operations
**As an**: Admin
**I want to**: View `file_operation_logs` (Uploads, Downloads) for a user
**So that**: I can detect excessive scraping or large file spamming.

- **Acceptance Criteria**:
    - Table: `operation`, `storageKey`, `ipAddress`, `timestamp`.
    - Filter by operation type (upload, download, delete).
    - Filter by date range.

### 1.2 View User Storage Usage
**As an**: Admin
**I want to**: See total storage consumed by a user
**So that**: I can identify heavy users or potential abuse.

- **Acceptance Criteria**:
    - Calculate SUM of `documents.size` WHERE `userId = X` AND `status != 'deleted'`.
    - Display as "Total Usage: 45.2 MB".
    - Show breakdown by document type (Resume, Portfolio, Avatar).

### 1.3 Monitor Large File Uploads
**As an**: Admin
**I want to**: See a global list of files exceeding a size threshold (e.g., 50MB)
**So that**: I can proactively review potentially problematic uploads.

- **Acceptance Criteria**:
    - Dashboard widget: "Large Files (>50MB)" with recent uploads.
    - Columns: User, Filename, Size, Upload Date, Action (View/Delete).

### 1.4 Force Delete File
**As an**: Admin
**I want to**: Permanently delete a file from S3
**So that**: I can remove malware or illegal content immediately.

- **Acceptance Criteria**:
    - "Force Delete" action removes from S3 AND sets `documents.status = 'deleted'`.
    - Requires confirmation with reason input.
    - Log in `admin_audit_logs`.

## 2. Requirements

### 2.1 Functional Requirements
- **FR_ADMIN_006.01**: List `file_operation_logs` with filters (Operation Type, Date).
- **FR_ADMIN_006.02**: Show file metadata (Size, MimeType) from `documents` table.
- **FR_ADMIN_006.03**: Calculate and display per-user storage totals.
- **FR_ADMIN_006.04**: Provide threshold-based monitoring for large files.
- **FR_ADMIN_006.05**: Enable force deletion with S3 cleanup.

### 2.2 Non-Functional Requirements
- **NFR_ADMIN_006.01**: Storage calculation queries MUST be optimized (consider materialized view for heavy users).

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `file_operation_logs` | **Read-Only** | Audit trail. |
| `documents` | **Read/Write** | File reference, deletion. |
| `admin_audit_logs` | **Write** | Force delete actions. |

## 4. Work Definition (Tasks)

- [ ] **Backend**: `AdminStorageService.getLogs(userId)`.
- [ ] **Backend**: `AdminStorageService.getUserStorageStats(userId)`.
- [ ] **Backend**: `AdminStorageService.getLargeFiles(thresholdBytes)`.
- [ ] **Backend**: `AdminStorageService.forceDeleteFile(docId, reason)`.
- [ ] **Frontend**: "Storage Logs" sub-tab in User Detail > Security/Infra.
- [ ] **Frontend**: "Storage Usage" card with breakdown chart.
- [ ] **Frontend**: "Large Files" widget on Admin Dashboard.
