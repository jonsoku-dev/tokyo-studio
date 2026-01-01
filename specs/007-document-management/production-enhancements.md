# SPEC 007: Production-Level Enhancements & Advanced Features

**Status**: New Requirements Definition
**Target**: Production-Ready Implementation

---

## Overview

Beyond the basic feature specification, production deployment requires:
1. **Security & Compliance** features
2. **Performance & Scalability** optimizations
3. **Observability & Reliability** systems
4. **Admin & Operational** capabilities
5. **Advanced User** features

This document defines these requirements with detailed acceptance criteria for sub-agents to implement.

---

## Phase 1: Security & Stability Fixes (BLOCKING)

### PRD-SEC-001: Remove/Fix Legacy Service Vulnerability

**Priority**: CRITICAL 🚨

**Current Issue**:
```
File: app/features/documents/domain/documents.service.server.ts
Function: getDocuments() - Line 6-16
Problem: No user scoping - returns all documents globally
Impact: Security vulnerability if called from any production endpoint
```

**Requirement**:
- [ ] Delete unused legacy service file entirely, OR
- [ ] Add userId parameter and filter by user, OR
- [ ] Migrate all references to new service and delete old file

**Acceptance Criteria**:
- No unauthenticated document access possible
- All document queries are user-scoped
- Legacy service file removed from codebase
- No import statements reference old service
- Tests verify user isolation

**Files to Delete or Modify**:
- `/web/app/features/documents/domain/documents.service.server.ts`

---

### PRD-SEC-002: Consolidate PDF Viewer Implementations

**Priority**: HIGH

**Current Issue**:
```
Duplicate implementations:
1. PDFViewer.tsx (190 lines) - uses unpkg.com CDN
2. PDFViewer.client.tsx (345 lines) - uses cdnjs.cloudflare.com CDN
- Bundle size duplication
- Maintenance inconsistency
- Different features/bugs in each
```

**Requirement**:
- Single unified PDF viewer implementation
- Consistent CDN configuration
- Feature parity guaranteed

**Acceptance Criteria**:
- Only PDFViewer.client.tsx exists and is used
- PDFViewer.tsx removed from codebase
- All document preview uses unified viewer
- All keyboard shortcuts functional
- Zoom range: 50%-300%
- Page navigation works for multi-page PDFs
- Error states handled gracefully
- Loading states displayed
- Works on mobile devices

**Files**:
- Keep: `/web/app/features/documents/components/PDFViewer.client.tsx`
- Delete: `/web/app/features/documents/components/PDFViewer.tsx`

---

### PRD-SEC-003: Implement Comprehensive Error Handling

**Priority**: HIGH

**Requirement**: Centralized error handling with proper categorization

**Acceptance Criteria**:

1. **Error Types** - Define clear error categories:
   - `DocumentNotFound` - 404 when document doesn't exist
   - `Unauthorized` - 403 when user doesn't own document
   - `InvalidInput` - 400 for validation failures
   - `StorageQuotaExceeded` - 413 when user exceeded storage
   - `FileTooLarge` - 413 for file size limits
   - `UnsupportedFormat` - 400 for invalid file types
   - `ServerError` - 500 for unexpected errors
   - `ConcurrencyError` - 409 for conflicting updates

2. **Error Responses** - Standardized format:
```typescript
{
  error: string;        // User-friendly message
  code: string;         // Error type identifier
  details?: string;     // Additional context
  retry?: boolean;      // Whether operation is retryable
}
```

3. **Logging** - All errors logged with:
   - Timestamp
   - User ID
   - Document ID
   - Error type
   - Stack trace (for internal errors only)

4. **User-Facing Messages** - Actionable and specific:
   - Upload failed: "File is too large (max 10MB)"
   - Auth failed: "You don't have permission to modify this document"
   - Storage full: "Storage quota exceeded. [Manage Storage →]"

**Files**:
- Create: `/web/app/features/documents/errors.ts`
- Update: `/web/app/features/documents/services/documents.server.ts`
- Update: `/web/app/features/documents/apis/api.document-detail.ts`

---

### PRD-SEC-004: Input Validation & Sanitization

**Priority**: HIGH

**Requirement**: Validate all user inputs at API boundaries

**Acceptance Criteria**:

1. **Document Title Validation**:
   - Max 255 characters
   - No leading/trailing whitespace
   - No null bytes
   - Only alphanumeric, hyphens, underscores, dots, spaces

2. **File Upload Validation**:
   - MIME type whitelist: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - Max file size: 50MB (configurable)
   - Min file size: 1KB
   - File extension must match MIME type

3. **Document Type Validation**:
   - Enum: `"Resume"`, `"CV"`, `"Portfolio"`, `"Cover Letter"`

4. **Status Validation**:
   - Enum: `"draft"`, `"final"`

5. **Query Parameters**:
   - Search query: max 100 characters, SQL injection protection
   - Page number: positive integer
   - Page size: 1-100 items

**Files**:
- Create: `/web/app/features/documents/validation.ts`
- Update: API endpoints with validation middleware

---

### PRD-SEC-005: Add Database Constraints & Transactions

**Priority**: HIGH

**Requirement**: Ensure data integrity at database level

**Acceptance Criteria**:

1. **Foreign Key Constraints**:
   - Document.userId must exist in users table
   - DocumentVersion.documentId must exist in documents table
   - CASCADE DELETE on user deletion

2. **Check Constraints**:
   - Document title NOT NULL and length > 0
   - Document status in ('draft', 'final', 'pending', 'uploaded', 'deleted')
   - Document type in enum values
   - File size >= 0

3. **Transaction Management**:
   - Upload + version log: single transaction
   - Update + version log: single transaction
   - Delete + soft delete: single transaction
   - All or nothing - no partial updates

4. **Indexes**:
   - userId + uploadedAt (for faster queries)
   - userId + status (for filtering)
   - documentId + createdAt (for version queries)

**Files**:
- Update: `/packages/database/src/schema.ts`
- Update: `/web/app/features/documents/services/documents.server.ts`

---

## Phase 2: Admin Features (REQUIRED FOR PRODUCTION)

### PRD-ADMIN-001: Admin Document Browser

**Priority**: HIGH

**Requirement**: Global document management interface for admins

**Acceptance Criteria**:

1. **View All Documents**:
   - List all documents across all users
   - Columns: User, Document Title, Type, Status, Size, Uploaded Date, Actions
   - Pagination (20 items per page)

2. **Filters**:
   - By document type (Resume/CV/Portfolio/Cover Letter)
   - By status (Draft/Final/Deleted)
   - By date range
   - By file size range
   - Search by document title or user email

3. **Actions per Document**:
   - View document (open PDF viewer)
   - Download document
   - View version history
   - Soft delete with reason
   - Restore deleted documents

4. **Bulk Actions**:
   - Select multiple documents
   - Bulk delete with reason
   - Bulk status change

5. **Audit Trail**:
   - Show last modified by (user or admin)
   - Show modification timestamp
   - Link to user profile

**UI Path**: `/admin/documents`

**API Endpoints**:
- `GET /api/admin/documents` - List all documents
- `GET /api/admin/documents/:id` - Get document with full details
- `POST /api/admin/documents/:id/soft-delete` - Soft delete with reason
- `POST /api/admin/documents/:id/restore` - Restore deleted document
- `GET /api/admin/documents/:id/audit-log` - View all changes

---

### PRD-ADMIN-002: Version History UI

**Priority**: HIGH

**Requirement**: Display document change timeline

**Acceptance Criteria**:

1. **Version History Modal**:
   - Triggered from document card "History" button
   - Timeline view showing all changes chronologically
   - Each entry shows:
     - Change type (upload/rename/status_change/deleted/restored)
     - Timestamp
     - Old value → New value
     - Changed by (user or admin)

2. **Version Restore**:
   - Button to restore previous version (admin only)
   - Confirmation dialog with reason
   - Creates new version entry for restore action

3. **Visual Timeline**:
   - Vertical line connecting events
   - Icons for different change types
   - Color coding for severity (delete = red, rename = blue, etc.)

4. **Search/Filter**:
   - Filter by change type
   - Filter by date range
   - Search for specific values

**Component**: `/web/app/features/documents/components/VersionHistoryModal.tsx`

---

### PRD-ADMIN-003: Soft Delete & Restore

**Priority**: HIGH

**Requirement**: Safe deletion with recovery option

**Acceptance Criteria**:

1. **Soft Delete Implementation**:
   - Instead of deleting records, set `documents.status = 'deleted'`
   - Record `deletedAt` timestamp
   - Record deletion reason (admin input)
   - Log deletion in admin audit trail

2. **Visibility**:
   - Deleted documents not shown in user's document list
   - Deleted documents still visible to admins (with "deleted" badge)
   - Users cannot restore their own documents (admin-only)

3. **Restore**:
   - Admin can restore with reason
   - Restores `status` back to previous state
   - Logs restoration in audit trail
   - User gets notification of restoration

4. **Permanent Delete**:
   - After 30 days, soft-deleted documents can be permanently purged
   - Admin setting for retention period
   - Automatic job to purge expired deletions

**Files**:
- Update: Database schema (status enum, deletedAt field)
- Create: `/web/app/features/documents/services/admin-documents.server.ts`
- Update: `/web/app/features/documents/apis/admin-documents.ts`

---

### PRD-ADMIN-004: Audit Logging

**Priority**: HIGH

**Requirement**: Comprehensive audit trail for compliance

**Acceptance Criteria**:

1. **Admin Audit Logs Table**:
```typescript
{
  id: uuid;
  adminId: uuid;
  action: string; // 'download', 'delete', 'restore', 'view'
  documentId: uuid;
  userId: uuid; // document owner
  reason?: string;
  ipAddress: string;
  userAgent: string;
  createdAt: timestamp;
}
```

2. **File Operation Logs Table**:
```typescript
{
  id: uuid;
  documentId: uuid;
  userId: uuid;
  operation: string; // 'upload', 'download', 'rename', 'delete'
  fileSize?: number;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  createdAt: timestamp;
}
```

3. **Logged Events**:
   - User uploads document
   - User downloads document (increment counter)
   - User renames document
   - User changes document status
   - User deletes document
   - Admin views document
   - Admin downloads document
   - Admin soft deletes document
   - Admin restores document

4. **Audit Log Queries**:
   - View all activity for specific document
   - View all activity for specific user
   - View all activity for specific admin
   - Export audit logs (CSV/JSON)
   - Search by date range, action type, user

**Files**:
- Update: `/packages/database/src/schema.ts`
- Create: `/web/app/services/audit-logger.server.ts`

---

## Phase 3: Production Hardening

### PRD-PERF-001: Pagination for Document Lists

**Priority**: HIGH

**Requirement**: Handle large document collections efficiently

**Acceptance Criteria**:

1. **Server-Side Pagination**:
   - Default page size: 20 documents
   - Max page size: 100 documents
   - Cursor-based or offset-based pagination
   - Total count provided

2. **URL Parameters**:
   - `?page=1&pageSize=20`
   - `?cursor=<encoded-cursor>`

3. **Response Format**:
```typescript
{
  documents: Document[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

4. **UI**:
   - Pagination controls (First/Prev/Next/Last)
   - Page size selector (20/50/100)
   - "Showing X to Y of Z" indicator
   - Preserve filters when changing pages

**Performance Target**: Load 20 items in <300ms for 1000+ documents

---

### PRD-PERF-002: Download Count Tracking

**Priority**: MEDIUM

**Requirement**: Accurately track document downloads

**Acceptance Criteria**:

1. **Database Field**:
   - `documents.downloadCount` type: integer (not text)
   - Default value: 0

2. **Tracking Mechanism**:
   - Increment counter when document is downloaded
   - Track in file_operation_logs table
   - Include timestamp and user ID

3. **API Endpoint**:
```
POST /api/documents/:id/download
Purpose: Generate presigned URL AND increment counter
Returns: { downloadUrl: string }
```

4. **UI Display**:
   - Show download count in document card
   - Update count immediately after download (optimistic)
   - Format: "⬇️ 42 downloads"

---

### PRD-PERF-003: Lazy Loading & Code Splitting

**Priority**: MEDIUM

**Requirement**: Optimize bundle size and initial load

**Acceptance Criteria**:

1. **PDF Viewer**:
   - Lazy load PDFViewer component
   - Load on-demand when user clicks "Preview"
   - Suspense fallback: loading spinner

2. **PDF.js Worker**:
   - Use CDN for pdf.worker.js
   - Configure worker URL dynamically
   - Fallback CDN if primary fails

3. **Bundle Analysis**:
   - Run `npm run build` and check bundle size
   - PDF viewer should not increase main bundle > 100KB
   - Target: React-pdf adds < 200KB (gzipped)

---

### PRD-PERF-004: Caching Strategy

**Priority**: MEDIUM

**Requirement**: Optimize repeated access patterns

**Acceptance Criteria**:

1. **Client-Side Caching**:
   - Cache document list for 5 minutes
   - Invalidate on upload/delete/rename
   - Use React Query for cache management

2. **Thumbnail Caching**:
   - Browser cache: 7 days (via S3 headers)
   - CDN cache: 30 days (via CloudFront)

3. **Presigned URLs**:
   - Cache for URL validity period (1 hour)
   - Auto-refresh if approaching expiry

---

### PRD-PERF-005: Bandwidth Throttling & Rate Limiting

**Priority**: MEDIUM

**Requirement**: Prevent abuse and ensure fair resource usage

**Acceptance Criteria**:

1. **Upload Rate Limiting**:
   - Max 5 concurrent uploads per user
   - Max 500MB/hour per user
   - Return 429 (Too Many Requests) when exceeded
   - Queue additional requests

2. **Download Rate Limiting**:
   - Max 10 downloads/minute per user (reasonable for bulk operations)
   - Implement progressive backoff

3. **API Rate Limiting**:
   - Max 100 requests/minute per user (general API)
   - Return 429 with `Retry-After` header

4. **Storage Quota Enforcement**:
   - Check quota before accepting upload
   - Return 413 (Payload Too Large) with available space
   - Display quota usage in UI with warning at 80%

---

## Phase 4: Testing & Observability

### PRD-TEST-001: Unit Tests

**Priority**: HIGH

**Requirement**: 80% code coverage with unit tests

**Acceptance Criteria**:

1. **Test Files**:
   - `/web/app/features/documents/services/documents.server.test.ts`
   - `/web/app/features/documents/validation.test.ts`
   - `/web/app/features/documents/components/*.test.tsx`

2. **Test Scenarios**:
   - Upload validation (file type, size, user quota)
   - Document CRUD operations
   - Search and filter functionality
   - Version history tracking
   - Error handling
   - User isolation

3. **Mocking**:
   - Mock database using vitest
   - Mock S3 operations
   - Mock authentication

4. **Coverage**:
   - Statements: > 80%
   - Branches: > 75%
   - Functions: > 80%
   - Lines: > 80%

---

### PRD-TEST-002: Integration Tests

**Priority**: HIGH

**Requirement**: End-to-end feature testing

**Acceptance Criteria**:

1. **Upload Flow**:
   - Upload file → stored in S3 → database record created → thumbnail generated

2. **Search Flow**:
   - User uploads 10 documents → search for specific name → result found

3. **Status Toggle**:
   - Upload document (draft) → toggle to final → version entry created → UI updated

4. **Delete Flow**:
   - Upload → delete → soft delete recorded → not visible in user list → admin can restore

5. **Admin Download**:
   - Admin downloads user's document → logged in audit trail → counter incremented

---

### PRD-OBS-001: Monitoring & Alerting

**Priority**: HIGH

**Requirement**: Production observability

**Acceptance Criteria**:

1. **Metrics to Track**:
   - Upload success rate
   - Average upload time
   - Download count
   - Document count per user
   - Storage quota usage
   - Error rates by type
   - API response times

2. **Alerts**:
   - Alert if upload success rate < 90%
   - Alert if API response time > 1s
   - Alert if storage usage > 95%
   - Alert if error rate > 5%

3. **Logging**:
   - Structured logging (JSON format)
   - Log level: DEBUG, INFO, WARN, ERROR
   - Include request ID for tracing
   - Sensitive data redaction

4. **Dashboard**:
   - Metrics visualization (document counts, upload rates)
   - Error trends
   - User activity
   - Storage utilization

---

## Phase 5: Advanced Features (OPTIONAL)

### PRD-ADV-001: Bulk Operations

**Priority**: LOW

**Requirement**: Batch document management

**Acceptance Criteria**:

1. **Multi-Select UI**:
   - Checkbox on each document card
   - "Select All" / "Deselect All" toggle
   - Selection count display
   - Bulk action bar

2. **Bulk Delete**:
   - Select multiple documents
   - Confirm deletion
   - Delete all selected (transactional)

3. **Bulk Download**:
   - Download selected documents as ZIP
   - Include folder structure (by type)
   - Max size: 500MB

4. **Bulk Status Change**:
   - Change multiple documents from Draft → Final
   - One version entry per document

---

### PRD-ADV-002: Document Sharing

**Priority**: LOW

**Requirement**: Share documents with specific users or publicly

**Acceptance Criteria**:

1. **Share Types**:
   - Private link (expiring URL)
   - Public link (permanent or time-limited)
   - Share with specific users (email)

2. **Permissions**:
   - View only (read-only)
   - Download allowed/not allowed
   - Comment allowed/not allowed

3. **Expiration**:
   - Set custom expiration date
   - Auto-expire after N days
   - Ability to revoke share

4. **Sharing Notification**:
   - Email notification to shared users
   - Notification in app
   - Share history in document details

---

### PRD-ADV-003: Document Templates

**Priority**: LOW

**Requirement**: Pre-built templates for common documents

**Acceptance Criteria**:

1. **Template Library**:
   - 5+ resume templates
   - 3+ cover letter templates
   - Customize with user information

2. **Template Management**:
   - Admin can create/edit templates
   - Version control for templates
   - A/B testing different templates

---

### PRD-ADV-004: Advanced Filtering & Search

**Priority**: LOW

**Requirement**: Powerful document discovery

**Acceptance Criteria**:

1. **Date Range Filter**:
   - Uploaded between dates X and Y
   - Last modified between dates

2. **File Size Filter**:
   - Documents between X and Y MB
   - Sort by size

3. **Fuzzy Search**:
   - "Resum" matches "Resume"
   - Typo-tolerant search
   - Suggestions/autocomplete

4. **Saved Searches**:
   - Save filter combinations
   - One-click access
   - Default search

---

## Database Schema Updates

### New Tables Required

```typescript
// admin_audit_logs
{
  id: uuid (PK)
  adminId: uuid (FK → users.id)
  action: text ('download'|'delete'|'restore'|'view')
  documentId: uuid (FK → documents.id)
  userId: uuid (FK → users.id, document owner)
  reason?: text
  ipAddress: text
  userAgent: text
  createdAt: timestamp (DEFAULT NOW)
}

// file_operation_logs
{
  id: uuid (PK)
  documentId: uuid (FK → documents.id)
  userId: uuid (FK → users.id)
  operation: text ('upload'|'download'|'rename'|'delete')
  fileSize?: bigint
  oldValue?: text
  newValue?: text
  ipAddress: text
  createdAt: timestamp (DEFAULT NOW)
}
```

### Schema Updates Required

```typescript
// documents table - ADD/MODIFY fields
{
  // Existing fields
  ...

  // Modify
  downloadCount: integer (change from text)
  size: bigint (change from text, for better math)

  // Add
  status: text DEFAULT 'uploaded' ('draft'|'final'|'pending'|'uploaded'|'deleted')
  deletedAt?: timestamp
  deletedBy?: uuid (FK → users.id for admin deletion)
  deletedReason?: text
}
```

---

## Implementation Priority Matrix

| Feature | Phase | Priority | Complexity | Est. Hours |
|---------|-------|----------|------------|-----------|
| Remove Legacy Service | 1 | CRITICAL | Low | 1 |
| Consolidate PDF Viewers | 1 | CRITICAL | Low | 2 |
| Error Handling | 1 | HIGH | Medium | 4 |
| Input Validation | 1 | HIGH | Medium | 3 |
| DB Constraints | 1 | HIGH | Low | 2 |
| Admin Browser | 2 | HIGH | High | 8 |
| Version History UI | 2 | HIGH | Medium | 6 |
| Soft Delete | 2 | HIGH | Medium | 5 |
| Audit Logging | 2 | HIGH | Medium | 6 |
| Pagination | 3 | MEDIUM | Low | 3 |
| Download Tracking | 3 | MEDIUM | Low | 2 |
| Lazy Loading | 3 | MEDIUM | Low | 2 |
| Unit Tests | 4 | HIGH | High | 12 |
| Integration Tests | 4 | HIGH | High | 10 |
| Monitoring | 4 | MEDIUM | Medium | 5 |
| Bulk Operations | 5 | LOW | Medium | 6 |
| Document Sharing | 5 | LOW | High | 10 |

---

## Success Metrics

| Metric | Target | Monitoring |
|--------|--------|-----------|
| Build Errors | 0 | CI/CD |
| Type Errors | 0 | TypeScript |
| Lint Errors | 0 | ESLint |
| Test Coverage | > 80% | Vitest |
| Upload Success Rate | > 99% | Metrics dashboard |
| API Response Time | < 500ms | APM |
| Document Load Time | < 1s | RUM |
| Security Issues | 0 | Code review + SAST |
| Accessibility (WCAG 2.1) | AA level | Axe audits |

---

**Next Step**: Create sub-agent tasks based on this specification for parallel implementation.
