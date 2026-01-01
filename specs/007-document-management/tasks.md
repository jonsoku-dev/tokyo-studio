# SPEC 007: Implementation Tasks for Sub-Agents

**Status**: Ready for Implementation
**Target Completion**: Phase-based rollout

---

## Task Assignment Overview

Each task below is **self-contained** and can be executed by a sub-agent in **parallel**. Tasks are organized by implementation phase.

---

## PHASE 1: Security & Stability (BLOCKING)

### TASK-SEC-001: Remove Legacy Document Service

**Assigned to**: Code Refactoring Agent
**Estimated Time**: 1-2 hours
**Priority**: CRITICAL 🚨

**Objective**: Eliminate security vulnerability in unused legacy service

**Acceptance Criteria**:

1. ✅ File `app/features/documents/domain/documents.service.server.ts` is **completely deleted**

2. ✅ Verify no imports of deleted file exist:
   - Search codebase for `from '@/features/documents/domain/documents.service.server.ts`
   - Search for `documents.service.server`
   - Zero results expected

3. ✅ Build passes with zero errors: `pnpm run build`

4. ✅ TypeScript passes with zero errors: `pnpm run typecheck`

5. ✅ Lint passes with zero errors: `pnpm run lint`

**Steps**:
1. Delete the legacy service file
2. Run codebase search to find any remaining imports
3. Run build/typecheck/lint
4. Report success with build output

**Related Files**:
- Delete: `/web/app/features/documents/domain/documents.service.server.ts`

---

### TASK-SEC-002: Consolidate PDF Viewer Implementations

**Assigned to**: Component Refactoring Agent
**Estimated Time**: 2-3 hours
**Priority**: CRITICAL 🚨

**Objective**: Remove duplicate PDF viewer, keep optimized version

**Acceptance Criteria**:

1. ✅ File `app/features/documents/components/PDFViewer.tsx` is **completely deleted**

2. ✅ File `app/features/documents/components/PDFViewer.client.tsx` is kept and verified:
   - Has all keyboard shortcuts (arrows, +/-, 0, Esc, Home, End)
   - Zoom range works: 50%-300% with 25% increments
   - Page navigation works for multi-page PDFs
   - PDF.js worker configured from CDN
   - Loading state displays
   - Error state displays
   - Mobile responsive

3. ✅ All references to old PDFViewer are updated:
   - Search for `import.*PDFViewer.*from.*PDFViewer` (without .client)
   - All imports updated to use `PDFViewer.client.tsx`
   - Zero import failures

4. ✅ Components using PDFViewer updated:
   - `documents.tsx` - verified using new viewer
   - Any other component using viewer - updated

5. ✅ Build passes: `pnpm run build`

6. ✅ TypeScript passes: `pnpm run typecheck`

7. ✅ Lint passes: `pnpm run lint`

**Steps**:
1. Verify PDFViewer.client.tsx has all required features
2. Delete PDFViewer.tsx
3. Find all imports of old PDFViewer
4. Update imports to .client version
5. Test PDF preview functionality
6. Run full build/typecheck/lint

**Related Files**:
- Delete: `/web/app/features/documents/components/PDFViewer.tsx`
- Keep & Verify: `/web/app/features/documents/components/PDFViewer.client.tsx`
- Update: `/web/app/features/documents/routes/documents.tsx`

---

### TASK-SEC-003: Implement Input Validation Layer

**Assigned to**: Validation & Security Agent
**Estimated Time**: 3-4 hours
**Priority**: HIGH

**Objective**: Add comprehensive input validation for all document operations

**Acceptance Criteria**:

1. ✅ Create validation module: `/web/app/features/documents/validation.ts` with:
   - `validateDocumentTitle(title: string): ValidationResult`
   - `validateUploadFile(file: File): ValidationResult`
   - `validateDocumentType(type: string): ValidationResult`
   - `validateDocumentStatus(status: string): ValidationResult`
   - `validateSearchQuery(query: string): ValidationResult`
   - `validatePaginationParams(page: number, pageSize: number): ValidationResult`

2. ✅ Document Title Validation:
   - Max 255 characters
   - Not empty/whitespace
   - No null bytes
   - Pattern: alphanumeric, hyphens, underscores, dots, spaces only
   - Return: `{ valid: boolean; error?: string }`

3. ✅ File Upload Validation:
   - MIME type: Only `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - File size: Min 1KB, Max 50MB
   - Extension must match MIME type
   - Return detailed error messages

4. ✅ Add validation to all API endpoints:
   - `POST /api/documents` - validate upload
   - `PATCH /api/documents/:id` - validate title and status
   - `GET /api/documents` - validate query params

5. ✅ Unit tests for validation module:
   - Test valid inputs
   - Test boundary cases
   - Test invalid inputs

6. ✅ Build/typecheck/lint passes

**Steps**:
1. Create `validation.ts` with all validators
2. Add Zod schemas for type safety (reuse existing)
3. Update API endpoints to call validators
4. Return standardized error responses
5. Write unit tests
6. Run build/typecheck/lint

**Related Files**:
- Create: `/web/app/features/documents/validation.ts`
- Update: `/web/app/features/documents/apis/api.document-detail.ts`
- Update: `/web/app/features/documents/services/documents.server.ts`

---

### TASK-SEC-004: Implement Error Handling System

**Assigned to**: Error Handling Agent
**Estimated Time**: 4-5 hours
**Priority**: HIGH

**Objective**: Standardized error handling with proper categorization

**Acceptance Criteria**:

1. ✅ Create error types module: `/web/app/features/documents/errors.ts` with classes:
   - `DocumentNotFoundError` (404)
   - `UnauthorizedError` (403)
   - `InvalidInputError` (400)
   - `StorageQuotaExceededError` (413)
   - `FileTooLargeError` (413)
   - `UnsupportedFormatError` (400)
   - `ConcurrencyError` (409)
   - `DocumentError` (base class with code, message, details, retry)

2. ✅ Standardized error response format:
```json
{
  "error": "User-friendly message",
  "code": "DOCUMENT_NOT_FOUND",
  "details": "Document with ID xxx not found",
  "retry": false
}
```

3. ✅ Update all API endpoints to:
   - Throw typed errors
   - Catch and format errors properly
   - Return correct HTTP status codes
   - Log errors with context (user ID, document ID, etc.)

4. ✅ Update all service methods to:
   - Throw typed errors
   - Include actionable error messages
   - Preserve stack traces for debugging

5. ✅ Add error handling to document operations:
   - Upload validation errors
   - Database errors (not found, conflict)
   - Storage errors (quota, file size)
   - Authorization errors

6. ✅ Unit tests for error handling:
   - Test error creation
   - Test error formatting
   - Test error responses

7. ✅ Build/typecheck/lint passes

**Steps**:
1. Create `errors.ts` with error classes
2. Define error codes and messages
3. Update API endpoints to use new errors
4. Update services to throw typed errors
5. Add logging with context
6. Write unit tests
7. Run build/typecheck/lint

**Related Files**:
- Create: `/web/app/features/documents/errors.ts`
- Update: `/web/app/features/documents/apis/api.document-detail.ts`
- Update: `/web/app/features/documents/services/documents.server.ts`

---

### TASK-SEC-005: Add Database Constraints & Transactions

**Assigned to**: Database Agent
**Estimated Time**: 3-4 hours
**Priority**: HIGH

**Objective**: Ensure data integrity at database level

**Acceptance Criteria**:

1. ✅ Update database schema (`/packages/database/src/schema.ts`):
   - Add NOT NULL constraints to title field
   - Add CHECK constraint for status enum values
   - Add CHECK constraint for type enum values
   - Add CHECK constraint for file size >= 0
   - Add FOREIGN KEY constraints with CASCADE DELETE
   - Add indexes for common queries:
     - (userId, uploadedAt DESC)
     - (userId, status)
     - (documentId, createdAt DESC)

2. ✅ Update document service to use transactions:
   - Upload + version log in single transaction
   - Update title + version log in single transaction
   - Delete + version log in single transaction
   - All-or-nothing semantics

3. ✅ Database migration required:
   - Create migration file
   - Run migration: `pnpm db:push`
   - Verify existing data integrity

4. ✅ Unit tests:
   - Test constraint violations
   - Test transaction rollback
   - Test cascade deletion

5. ✅ Build/typecheck/lint passes

**Steps**:
1. Review current schema
2. Add constraints and indexes
3. Create database migration
4. Update service for transactions
5. Test constraint enforcement
6. Run migration
7. Run build/typecheck/lint

**Related Files**:
- Update: `/packages/database/src/schema.ts`
- Create: Database migration in `/packages/database/migrations/`
- Update: `/web/app/features/documents/services/documents.server.ts`

---

## PHASE 2: Admin Features (REQUIRED FOR PRODUCTION)

### TASK-ADMIN-001: Create Admin Document Service

**Assigned to**: Admin Service Agent
**Estimated Time**: 5-6 hours
**Priority**: HIGH

**Objective**: Backend service for admin document operations

**Acceptance Criteria**:

1. ✅ Create service: `/web/app/features/documents/services/admin-documents.server.ts` with:
   - `listAllDocuments(filters: DocumentFilters): Promise<Document[]>`
   - `getDocumentWithHistory(documentId: string): Promise<DocumentWithHistory>`
   - `softDeleteDocument(documentId: string, reason: string, adminId: string): Promise<void>`
   - `restoreDocument(documentId: string, reason: string, adminId: string): Promise<void>`
   - `generateAdminDownloadUrl(documentId: string): Promise<string>`

2. ✅ List All Documents:
   - Accept filters: type, status, dateRange, sizeRange
   - Pagination support (page, pageSize)
   - Return: documents with user info (email, name)
   - Include audit info (lastModifiedBy, lastModifiedAt)

3. ✅ Get Document with History:
   - Return document details
   - Include all version history entries
   - Include admin audit log entries
   - Include file operation log entries

4. ✅ Soft Delete:
   - Update `documents.status = 'deleted'`
   - Set `documents.deletedAt = NOW()`
   - Set `documents.deletedBy = adminId`
   - Set `documents.deletedReason = reason`
   - Log in admin audit logs
   - Soft-deleted docs not visible to users

5. ✅ Restore:
   - Update `documents.status = 'final'` (or previous)
   - Clear `deletedAt`, `deletedBy`, `deletedReason`
   - Log restoration in audit logs
   - Restored docs visible to users again

6. ✅ Admin Download URL:
   - Generate presigned URL (15-minute expiry)
   - Log download in admin audit logs
   - Include original filename

7. ✅ Security:
   - Admin role verification (in API layer, not service)
   - User-scoped data in soft deletes/restores

8. ✅ Unit tests:
   - Test all service methods
   - Test filtering
   - Test soft delete/restore
   - Test logging

9. ✅ Build/typecheck/lint passes

**Steps**:
1. Create admin service file
2. Implement all methods with proper error handling
3. Add logging for audit trail
4. Create unit tests
5. Verify with sample data
6. Run build/typecheck/lint

**Related Files**:
- Create: `/web/app/features/documents/services/admin-documents.server.ts`
- Update: `/packages/database/src/schema.ts` (for deleted fields)

---

### TASK-ADMIN-002: Create Admin API Endpoints

**Assigned to**: Admin API Agent
**Estimated Time**: 4-5 hours
**Priority**: HIGH

**Objective**: REST endpoints for admin document operations

**Acceptance Criteria**:

1. ✅ Create API routes: `/web/app/features/documents/apis/admin-documents.ts` with:
   - `GET /api/admin/documents` - List all documents
   - `GET /api/admin/documents/:id` - Get document with history
   - `POST /api/admin/documents/:id/soft-delete` - Soft delete
   - `POST /api/admin/documents/:id/restore` - Restore
   - `GET /api/admin/documents/:id/download` - Generate download URL

2. ✅ GET /api/admin/documents:
   - Query params: type, status, dateFrom, dateTo, sizeMin, sizeMax, page, pageSize
   - Returns: paginated list with pagination metadata
   - Error 403 if user not admin

3. ✅ GET /api/admin/documents/:id:
   - Returns: full document + all history + audit logs
   - Error 404 if document not found
   - Error 403 if user not admin

4. ✅ POST /api/admin/documents/:id/soft-delete:
   - Body: `{ reason: string }`
   - Returns: `{ success: true }`
   - Error 400 if reason missing
   - Error 403 if user not admin

5. ✅ POST /api/admin/documents/:id/restore:
   - Body: `{ reason: string }`
   - Returns: `{ success: true }`
   - Error 400 if document not deleted
   - Error 403 if user not admin

6. ✅ GET /api/admin/documents/:id/download:
   - Returns: `{ downloadUrl: string }`
   - Log download in admin audit logs
   - Error 403 if user not admin
   - Error 404 if document not found

7. ✅ Authentication:
   - All endpoints require user session
   - Verify admin role (requireAdmin helper)
   - Log admin action with IP/user agent

8. ✅ Error Handling:
   - Use typed error classes
   - Consistent error response format
   - Proper HTTP status codes

9. ✅ Build/typecheck/lint passes

**Steps**:
1. Create API file with route definitions
2. Implement each endpoint
3. Add admin role verification
4. Add error handling
5. Add audit logging
6. Test endpoints with curl/Postman
7. Run build/typecheck/lint

**Related Files**:
- Create: `/web/app/features/documents/apis/admin-documents.ts`
- Update: `routes.ts` (add new routes)

---

### TASK-ADMIN-003: Build Admin Document Browser UI

**Assigned to**: Admin UI Agent
**Estimated Time**: 6-8 hours
**Priority**: HIGH

**Objective**: Full-featured admin interface for document management

**Acceptance Criteria**:

1. ✅ Create page: `/web/app/features/admin/documents/routes/index.tsx` with:
   - Document list table (or cards in grid)
   - Pagination controls
   - Search and filter interface
   - Bulk action bar

2. ✅ Table Columns:
   - User (email + name link to user profile)
   - Document Title
   - Type (Resume/CV/Portfolio/Cover Letter)
   - Status (Draft/Final/Deleted)
   - File Size (formatted)
   - Uploaded Date
   - Actions (View, Download, History, Delete, Restore if deleted)

3. ✅ Filters:
   - Document Type dropdown (All/Resume/CV/Portfolio/Cover Letter)
   - Status dropdown (All/Draft/Final/Deleted)
   - Date range (From/To pickers)
   - File size range (Min/Max inputs)
   - Search by title or user email

4. ✅ Pagination:
   - Show X to Y of Z format
   - Page size selector (20/50/100)
   - First/Prev/Next/Last buttons
   - Jump to page input

5. ✅ Document Actions:
   - **View**: Open PDF in modal
   - **Download**: Generate presigned URL + download
   - **History**: Show version history modal
   - **Delete**: Soft delete with confirmation + reason input
   - **Restore**: Restore if deleted, with reason input

6. ✅ Bulk Operations:
   - Checkbox to select documents
   - "Select All" toggle
   - Bulk delete with reason
   - Selected count display

7. ✅ Visual Design:
   - Consistent with project design system
   - Responsive (mobile-friendly)
   - Accessibility (keyboard nav, ARIA labels)
   - Loading states
   - Error states

8. ✅ Components:
   - Create: `DocumentBrowser.tsx` (main component)
   - Create: `DocumentTable.tsx` (table display)
   - Create: `DocumentFilters.tsx` (filter UI)
   - Create: `DocumentActions.tsx` (action buttons)
   - Create: `DeleteReasonDialog.tsx` (delete confirmation)

9. ✅ Integration:
   - Call `/api/admin/documents` on mount
   - Call `/api/admin/documents/:id/soft-delete` on delete
   - Call `/api/admin/documents/:id/restore` on restore
   - Refresh list after actions

10. ✅ Build/typecheck/lint passes

**Steps**:
1. Create main page component
2. Build sub-components
3. Implement filter logic
4. Integrate with API endpoints
5. Add loading/error states
6. Test all functionality
7. Run build/typecheck/lint

**Related Files**:
- Create: `/web/app/features/admin/documents/routes/index.tsx`
- Create: `/web/app/features/admin/documents/components/DocumentBrowser.tsx`
- Create: `/web/app/features/admin/documents/components/DocumentTable.tsx`
- Create: `/web/app/features/admin/documents/components/DocumentFilters.tsx`

---

### TASK-ADMIN-004: Build Version History UI

**Assigned to**: History UI Agent
**Estimated Time**: 4-5 hours
**Priority**: HIGH

**Objective**: Display document change timeline

**Acceptance Criteria**:

1. ✅ Create component: `/web/app/features/documents/components/VersionHistoryModal.tsx` with:
   - Timeline view of all document changes
   - Triggered from document detail or admin browser
   - Modal dialog layout

2. ✅ Timeline Display:
   - Vertical line connecting events
   - Each entry shows:
     - Icon (upload/edit/status/delete icon)
     - Change type label
     - Timestamp (formatted relative + absolute)
     - Old value → New value
     - Changed by (user name or admin name)
   - Color coding:
     - Upload: blue
     - Rename/Edit: gray
     - Status change: green
     - Delete: red
     - Restore: green

3. ✅ Version Entries Types:
   - **Upload**: "Document uploaded" (no old value)
   - **Rename**: "Title: Old Name → New Name"
   - **Status Change**: "Status: Draft → Final"
   - **Delete**: "Soft deleted by admin [reason]"
   - **Restore**: "Restored by admin [reason]"

4. ✅ Features:
   - Filter by change type (dropdown)
   - Search by value
   - Sort by date (newest first - default)
   - Export as CSV/JSON (admin only)
   - Restore to this version (admin only)

5. ✅ Styling:
   - Dark background for timeline
   - Clear visual hierarchy
   - Responsive (mobile-friendly)
   - Smooth animations

6. ✅ Integration:
   - Call `/api/documents/:id/versions` (GET endpoint)
   - Call `/api/admin/documents/:id` for full history (admin)

7. ✅ Build/typecheck/lint passes

**Steps**:
1. Create modal component
2. Design timeline layout
3. Implement version entry display
4. Add filters and sorting
5. Integrate with API
6. Add animations
7. Run build/typecheck/lint

**Related Files**:
- Create: `/web/app/features/documents/components/VersionHistoryModal.tsx`
- Update: `/web/app/features/documents/routes/documents.tsx` (add modal trigger)
- Create: `/web/app/features/documents/apis/api.versions.ts` (if not exists)

---

### TASK-ADMIN-005: Implement Audit Logging Tables

**Assigned to**: Database & Logging Agent
**Estimated Time**: 3-4 hours
**Priority**: HIGH

**Objective**: Add audit trail for compliance and investigation

**Acceptance Criteria**:

1. ✅ Create/Update tables in database schema:

   **admin_audit_logs**:
   ```typescript
   {
     id: uuid (PK)
     adminId: uuid (FK → users.id, NOT NULL)
     action: text (NOT NULL) // 'download'|'delete'|'restore'|'view'
     documentId: uuid (FK → documents.id, NOT NULL)
     userId: uuid (FK → users.id, NOT NULL) // document owner
     reason?: text
     ipAddress: text (NOT NULL)
     userAgent: text (NOT NULL)
     status: text // 'success'|'failed'
     error?: text
     createdAt: timestamp (DEFAULT NOW, NOT NULL)
   }
   ```

   **file_operation_logs**:
   ```typescript
   {
     id: uuid (PK)
     documentId: uuid (FK → documents.id, NOT NULL)
     userId: uuid (FK → users.id, NOT NULL)
     operation: text (NOT NULL) // 'upload'|'download'|'rename'|'delete'
     fileSize?: bigint
     oldValue?: text
     newValue?: text
     ipAddress: text (NOT NULL)
     status: text // 'success'|'failed'
     error?: text
     createdAt: timestamp (DEFAULT NOW, NOT NULL)
   }
   ```

2. ✅ Create migration:
   - Migration file in `/packages/database/migrations/`
   - Run migration: `pnpm db:push`
   - Verify schema updated

3. ✅ Create logging service: `/web/app/services/audit-logger.server.ts` with:
   - `logAdminAction(action, documentId, adminId, reason, request)`
   - `logFileOperation(operation, documentId, userId, details, request)`
   - Automatic IP/User-Agent extraction from request
   - Error handling for failed logs (don't break operation)

4. ✅ Integrate logging:
   - Call from admin service on delete/restore
   - Call from documents service on upload/download/rename
   - Include request context (IP, user agent)
   - Log success/failure

5. ✅ Query functions:
   - `getDocumentAuditLog(documentId)` - all audit entries for doc
   - `getAdminActivityLog(adminId)` - all actions by admin
   - `getUserActivityLog(userId)` - all file operations by user

6. ✅ Build/typecheck/lint passes

**Steps**:
1. Define schema for audit tables
2. Create migration
3. Create logging service
4. Integrate into document service
5. Integrate into admin service
6. Test logging
7. Run build/typecheck/lint

**Related Files**:
- Update: `/packages/database/src/schema.ts`
- Create: Migration file
- Create: `/web/app/services/audit-logger.server.ts`
- Update: `/web/app/features/documents/services/documents.server.ts`
- Update: `/web/app/features/documents/services/admin-documents.server.ts`

---

## PHASE 3: Production Hardening

### TASK-PERF-001: Add Pagination to Document List

**Assigned to**: Performance Agent
**Estimated Time**: 3-4 hours
**Priority**: MEDIUM

**Objective**: Handle large document collections efficiently

**Acceptance Criteria**:

1. ✅ Update loader in documents route (`routes/documents.tsx`):
   - Accept `?page=1&pageSize=20` query params
   - Validate pagination params
   - Return paginated results

2. ✅ Loader Response Format:
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

3. ✅ Pagination Rules:
   - Default page size: 20
   - Max page size: 100
   - Min page size: 1
   - Default page: 1
   - Valid page range: 1 to totalPages

4. ✅ Database Query:
   - Use LIMIT and OFFSET
   - Get total count in single query
   - Apply filters (type, status, search) before pagination

5. ✅ UI Updates in DocumentGrid:
   - Display pagination controls
   - "Showing X to Y of Z" indicator
   - Page size selector (20/50/100)
   - First/Prev/Next/Last buttons
   - Jump to page input
   - Preserve filters when changing pages

6. ✅ URL State:
   - Update URL params on pagination
   - Shareable links preserve page
   - Back button returns to previous page

7. ✅ Performance:
   - Query time < 300ms for 1000+ documents
   - Load 20 items < 500ms
   - No client-side filtering

8. ✅ Build/typecheck/lint passes

**Steps**:
1. Update document loader
2. Add pagination validation
3. Update database query
4. Update UI components
5. Add pagination controls
6. Test with large dataset
7. Run build/typecheck/lint

**Related Files**:
- Update: `/web/app/features/documents/routes/documents.tsx`
- Update: `/web/app/features/documents/components/DocumentGrid.tsx`
- Update: `/web/app/features/documents/services/documents.server.ts`

---

### TASK-PERF-002: Implement Download Count Tracking

**Assigned to**: Feature Agent
**Estimated Time**: 2-3 hours
**Priority**: MEDIUM

**Objective**: Accurately track and display document downloads

**Acceptance Criteria**:

1. ✅ Database Schema Update:
   - Change `documents.downloadCount` from text to integer
   - Default value: 0
   - Add index for queries

2. ✅ Create API endpoint: `POST /api/documents/:id/download` with:
   - Generate presigned S3 URL
   - Increment download counter
   - Log in file_operation_logs
   - Return `{ downloadUrl: string }`

3. ✅ Download Tracking:
   - Increment counter on successful download
   - Log with timestamp and user ID
   - Handle concurrent downloads safely
   - No race conditions

4. ✅ UI Integration:
   - Change download button to call new endpoint
   - Display count: "⬇️ 42 downloads"
   - Show "Never" if count is 0
   - Update count optimistically (show new count before API response)

5. ✅ Fallback:
   - If tracking fails, download still succeeds
   - Log error for debugging
   - User experience not affected

6. ✅ Build/typecheck/lint passes

**Steps**:
1. Create migration for downloadCount type change
2. Create download API endpoint
3. Update download button in UI
4. Add download tracking to service
5. Test download flow
6. Run build/typecheck/lint

**Related Files**:
- Create: Migration file
- Create: `/web/app/features/documents/apis/api.download.ts`
- Update: `/web/app/features/documents/components/DocumentGrid.tsx`
- Update: `/web/app/features/documents/services/documents.server.ts`

---

### TASK-PERF-003: Implement Rate Limiting for Uploads

**Assigned to**: Security & Rate Limiting Agent
**Estimated Time**: 3-4 hours
**Priority**: MEDIUM

**Objective**: Prevent abuse and ensure fair resource usage

**Acceptance Criteria**:

1. ✅ Upload Rate Limits:
   - Max 5 concurrent uploads per user
   - Max 500MB/hour per user
   - Return 429 (Too Many Requests) when exceeded

2. ✅ Rate Limit Tracking:
   - Track in Redis or in-memory (cache)
   - Key: `upload:userId:timestamp`
   - Auto-expire old entries

3. ✅ Error Response (429):
```json
{
  "error": "Upload quota exceeded",
  "code": "UPLOAD_QUOTA_EXCEEDED",
  "retryAfter": 3600,
  "details": "You have uploaded 500MB in the last hour. Try again in 1 hour."
}
```

4. ✅ UI Feedback:
   - Show quota status: "100/500 MB used this hour"
   - Disable upload button if quota exceeded
   - Show time until quota reset

5. ✅ Concurrent Upload Management:
   - Queue additional uploads
   - Show queue status: "3 uploads queued"
   - Auto-upload when slot becomes available

6. ✅ Build/typecheck/lint passes

**Steps**:
1. Create rate limiting service
2. Add middleware to upload endpoint
3. Track uploads per user
4. Implement quota display in UI
5. Test rate limiting behavior
6. Run build/typecheck/lint

**Related Files**:
- Create: `/web/app/services/rate-limiter.server.ts`
- Update: `/web/app/features/storage/apis/upload.ts`
- Update: `/web/app/features/storage/components/FileUploader.tsx`

---

## PHASE 4: Testing

### TASK-TEST-001: Unit Tests for Document Service

**Assigned to**: Test Agent
**Estimated Time**: 6-8 hours
**Priority**: HIGH

**Objective**: 80%+ code coverage with unit tests

**Acceptance Criteria**:

1. ✅ Create test file: `/web/app/features/documents/services/documents.server.test.ts`

2. ✅ Test Scenarios:
   - **Search Documents**:
     - Search by title (case-insensitive)
     - Filter by type
     - Filter by status
     - Combine search + filters
     - No results handling
   - **Update Document**:
     - Valid title update
     - Valid status update
     - Both update simultaneously
     - Invalid title rejected
     - Ownership verification
   - **Log Version**:
     - Version entry created
     - All change types tracked
     - Timestamps correct
   - **Get Versions**:
     - All versions returned
     - Ordered by date (newest first)
     - Empty result for new document

3. ✅ Error Cases:
   - Document not found
   - Unauthorized access (wrong user)
   - Invalid input
   - Database errors

4. ✅ Mock Setup:
   - Mock database (Drizzle)
   - Mock authentication context
   - Sample test data

5. ✅ Code Coverage:
   - Statements: > 85%
   - Branches: > 80%
   - Functions: > 85%
   - Lines: > 85%

6. ✅ Run tests: `pnpm run test`

**Steps**:
1. Setup test file with mocks
2. Write tests for each method
3. Test error cases
4. Check coverage
5. Refactor for coverage if needed
6. Run build/typecheck/lint

**Related Files**:
- Create: `/web/app/features/documents/services/documents.server.test.ts`

---

### TASK-TEST-002: Integration Tests for Document Flow

**Assigned to**: Integration Test Agent
**Estimated Time**: 6-8 hours
**Priority**: HIGH

**Objective**: End-to-end feature testing

**Acceptance Criteria**:

1. ✅ Create test file: `/web/app/features/documents/integration.test.ts`

2. ✅ Test Flows:
   - **Upload Flow**:
     - Upload PDF → stored in S3 → database record created → grid updated
   - **Search Flow**:
     - Upload 10 documents → search by name → result found
   - **Status Toggle**:
     - Upload (draft) → toggle to final → version entry created → UI reflects change
   - **Delete Flow**:
     - Upload → delete → soft deleted → not in user list → admin can restore
   - **Admin Download**:
     - Upload → admin downloads → logged in audit trail → counter incremented

3. ✅ Database Integration:
   - Real database for tests (test DB)
   - Setup/teardown data
   - Transaction rollback between tests

4. ✅ API Integration:
   - Call real API endpoints
   - Test request/response formats
   - Test error scenarios

5. ✅ Run tests: `pnpm run test:integration`

**Steps**:
1. Setup integration test framework
2. Create test database
3. Write flow tests
4. Test all edge cases
5. Run full integration suite
6. Run build/typecheck/lint

**Related Files**:
- Create: `/web/app/features/documents/integration.test.ts`

---

## Success Criteria & Validation

### Build & Quality Checklist

After all tasks complete, verify:

```
☐ pnpm run build - Zero errors
☐ pnpm run typecheck - Zero errors
☐ pnpm run lint - Zero errors
☐ pnpm run test - All tests pass
☐ No security vulnerabilities
☐ No deprecated APIs
☐ No console.log in production code
☐ No any types in TypeScript
☐ No unused imports
```

### Feature Completion Matrix

| Feature | Task | Status |
|---------|------|--------|
| Security Fixes | TASK-SEC-001 to 005 | Pending |
| Admin Features | TASK-ADMIN-001 to 005 | Pending |
| Performance | TASK-PERF-001 to 003 | Pending |
| Testing | TASK-TEST-001 to 002 | Pending |

---

## Implementation Order

**Recommended sequence** (accounting for dependencies):

1. **TASK-SEC-001** (Delete legacy service) - No dependencies
2. **TASK-SEC-002** (Consolidate PDF viewers) - No dependencies
3. **TASK-SEC-003** (Input validation) - No dependencies
4. **TASK-SEC-004** (Error handling) - After SEC-003
5. **TASK-SEC-005** (DB constraints) - After SEC-004
6. **TASK-ADMIN-005** (Audit logging tables) - Can run in parallel with SEC tasks
7. **TASK-ADMIN-001** (Admin service) - Depends on ADMIN-005
8. **TASK-ADMIN-002** (Admin API) - Depends on ADMIN-001
9. **TASK-ADMIN-003** (Admin UI) - Depends on ADMIN-002
10. **TASK-ADMIN-004** (History UI) - Depends on ADMIN-005
11. **TASK-PERF-001** (Pagination) - After SEC tasks
12. **TASK-PERF-002** (Download tracking) - After SEC tasks
13. **TASK-PERF-003** (Rate limiting) - Independent
14. **TASK-TEST-001 & 002** (Testing) - Last (can start earlier in parallel)

---

**Total Estimated Time**: 50-65 hours for all tasks

**Can be parallelized**: All Phase 1 + Phase 3 tasks can run in parallel
**Must be sequential**: Some Phase 2 tasks depend on prior tasks

All tasks are self-contained with clear acceptance criteria for sub-agents to execute independently.
