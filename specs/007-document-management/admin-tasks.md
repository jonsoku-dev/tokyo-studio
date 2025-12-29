# Admin Tasks: Document Management

## Backend Implementation
- [ ] **Query**: `adminGetDocuments(userId)`
    - Return list of active documents with type classification.
- [ ] **Query**: `adminGetAllDocuments(filters)`
    - Global document list with filters (type, status, date).
    - Pagination support.
- [ ] **Mutation**: `adminGetDocumentUrl(docId)`
    - Generate S3 Presigned URL (15 min expiry).
    - Log access in `file_operation_logs`.
- [ ] **Mutation**: `adminDeleteDocument(docId, reason)`
    - Soft delete in DB.
    - Log in `admin_audit_logs`.
- [ ] **Query**: `adminGetDocumentVersions(docId)`
    - Return list from `document_versions`.

## Frontend Implementation
- [ ] **Component**: "Documents" card in User Detail showing Resume/Portfolio/Cover Letter.
- [ ] **Component**: "Download" icon per document.
- [ ] **Component**: "Version History" modal.
- [ ] **Page**: `features/content/routes/documents.tsx` - Global document browser.
- [ ] **Action**: Delete confirmation with reason input.

## QA Verification
- [ ] **Test Case**: Admin downloads a resume. Link works.
- [ ] **Test Case**: Admin deletes resume. User can no longer download it.
- [ ] **Test Case**: View version history for a document with multiple changes.
- [ ] **Test Case**: Filter global documents by "Portfolio" type.
