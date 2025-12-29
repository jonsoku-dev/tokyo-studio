# Admin Feature Specification: Document Content Review

**Feature**: `007-document-management`
**Role**: Admin
**Outcome**: Admins can verify credentials (Resumes, Portfolios), review all document types, and remove illegal content.

## 1. User Scenarios

### 1.1 Download User Documents
**As an**: Admin
**I want to**: Download any of a user's documents securely (Resume, CV, Portfolio, Cover Letter)
**So that**: I can verify their credentials (e.g., for Mentor approval).

- **Acceptance Criteria**:
    - "Download" button generates a short-lived presigned URL (15 min expiry).
    - Admin access bypasses "Owner Only" restrictions in the backend service.
    - Log download action in `file_operation_logs` with `operation: 'admin_download'`.

### 1.2 View Document History
**As an**: Admin
**I want to**: See the version history of a document
**So that**: I can understand when and how a document was modified.

- **Acceptance Criteria**:
    - List entries from `document_versions` for the document.
    - Show `changeType` (upload, rename, status_change), `oldValue`, `newValue`, `createdAt`.

### 1.3 Delete Document
**As an**: Admin
**I want to**: Mark a document as deleted
**So that**: It is no longer accessible via public links.

- **Acceptance Criteria**:
    - Soft delete: Sets `documents.status = 'deleted'` and `deletedAt = NOW()`.
    - Confirmation dialog with reason input.
    - Log in `admin_audit_logs`.

### 1.4 Filter by Document Type
**As an**: Admin
**I want to**: View all documents of a specific type across all users (e.g., all Portfolios)
**So that**: I can audit specific categories of content.

- **Acceptance Criteria**:
    - Global document browser with type filter dropdown.
    - Columns: User, Title, Type, Status, Size, Uploaded At.
    - Pagination support.

## 2. Requirements

### 2.1 Functional Requirements
- **FR_ADMIN_007.01**: Admin `getDocument(id)` service MUST generate presigned URL.
- **FR_ADMIN_007.02**: Admin `deleteDocument(id)` MUST update `documents.status` = 'deleted' and `deletedAt` = NOW.
- **FR_ADMIN_007.03**: Admin MUST be able to view version history for any document.
- **FR_ADMIN_007.04**: Admin MUST be able to filter/search documents globally by type.

### 2.2 Security Requirements
- **SEC_ADMIN_007.01**: Presigned URLs for admin downloads MUST be logged.
- **SEC_ADMIN_007.02**: Document content MUST NOT be cached in browser (appropriate headers).

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `documents` | **Read/Write** | Status management, filtering. |
| `document_versions` | **Read** | Version history. |
| `file_operation_logs` | **Write** | Log admin downloads. |
| `admin_audit_logs` | **Write** | Log deletions. |

## 4. Work Definition (Tasks)

- [ ] **Backend**: `AdminDocumentService.generateDownloadLink(docId)`.
- [ ] **Backend**: `AdminDocumentService.softDelete(docId, reason)`.
- [ ] **Backend**: `AdminDocumentService.getVersionHistory(docId)`.
- [ ] **Backend**: `AdminDocumentService.listAll(filters)` - global list with type filter.
- [ ] **Frontend**: "Documents" Card in User Detail showing current Resume/Portfolio/etc.
- [ ] **Frontend**: Version history modal for each document.
- [ ] **Frontend**: Global "Documents Browser" page in Content section.
