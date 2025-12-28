# Feature Specification: S3 Cloud File Storage System

**Feature Branch**: `006-s3-storage`
**Created**: 2025-12-28
**Status**: Draft
**Input**: User description: "Build a secure cloud file storage system for user documents including resumes, CVs, portfolios, and cover letters. Users upload files directly from their browser to cloud storage without server relay using presigned URLs for security. The system enforces file type validation (PDF, DOCX, TXT only), maximum file size of 10MB per file, and total storage quota of 100MB per user. Each file is assigned a unique identifier and stored with metadata including original filename, file size, upload date, and document type. Users cannot access other users' files even if they know the file URL. The system automatically generates thumbnail previews for PDF files and tracks download counts for analytics."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Direct Browser Upload with Presigned URLs (Priority: P1)

Users need to upload their career documents (resumes, CVs, portfolios, cover letters) directly from their browser to cloud storage without the files passing through the application server. This ensures faster uploads, reduced server load, and better scalability.

**Why this priority**: This is the core functionality of the feature. Without secure direct uploads, users cannot store files, making this the absolute foundation that all other stories depend on.

**Independent Test**: Can be fully tested by uploading a valid PDF file through the browser, verifying it appears in cloud storage with correct metadata, and confirming the upload bypassed the application server (no file data in server logs).

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they select a valid PDF file (5MB, resume.pdf), **Then** the system generates a presigned URL, uploads directly to cloud storage, and confirms successful upload with file metadata
2. **Given** a user selects multiple files, **When** they initiate upload, **Then** each file receives its own presigned URL and uploads in parallel
3. **Given** a presigned URL expires (after 15 minutes), **When** user attempts upload, **Then** system generates a fresh presigned URL automatically
4. **Given** network interruption occurs mid-upload, **When** connection is restored, **Then** system retries the upload from the failed point

---

### User Story 2 - File Type and Size Validation (Priority: P1)

Users can only upload specific document types (PDF, DOCX, TXT) with a maximum size of 10MB per file. This protects the system from malicious files, ensures storage is used efficiently, and maintains document quality standards.

**Why this priority**: Security and data integrity are critical from day one. Without validation, the storage system becomes vulnerable to abuse and inappropriate file types.

**Independent Test**: Can be tested independently by attempting to upload files of various types (PDF ✓, JPG ✗, DOCX ✓, EXE ✗) and sizes (5MB ✓, 15MB ✗), verifying only valid files are accepted and clear error messages are shown for rejections.

**Acceptance Scenarios**:

1. **Given** a user selects a 15MB PDF file, **When** they attempt upload, **Then** system rejects with error "File size exceeds 10MB limit"
2. **Given** a user selects a JPG image, **When** they attempt upload, **Then** system rejects with error "Only PDF, DOCX, and TXT files are allowed"
3. **Given** a user selects a file with .pdf extension but contains executable code, **When** upload completes, **Then** system performs content-type validation and rejects the file
4. **Given** a user selects a valid 8MB DOCX file, **When** they upload, **Then** system accepts and stores the file successfully
5. **Given** a user renames malware.exe to malware.pdf, **When** they attempt upload, **Then** system validates file content (magic bytes) and rejects the disguised file

---

### User Story 3 - User Storage Quota Management (Priority: P1)

Each user has a total storage quota of 100MB across all their uploaded documents. The system tracks cumulative storage usage and prevents uploads that would exceed this limit.

**Why this priority**: Quota management prevents system abuse, controls infrastructure costs, and ensures fair resource allocation among all users. This is essential for sustainable operation.

**Independent Test**: Can be tested by uploading files totaling 95MB, then attempting to upload a 10MB file (should fail), then deleting 20MB of files and successfully uploading the 10MB file.

**Acceptance Scenarios**:

1. **Given** a user has uploaded 95MB of documents, **When** they attempt to upload a 10MB file, **Then** system rejects with error "Upload would exceed your 100MB storage quota (95MB used)"
2. **Given** a user has 50MB used, **When** they view their storage dashboard, **Then** system displays "50MB / 100MB used (50% quota remaining)"
3. **Given** a user deletes a 20MB file, **When** quota is recalculated, **Then** storage usage decreases by 20MB immediately
4. **Given** a user has exactly 100MB used, **When** they delete any file, **Then** they can upload new files up to the freed space
5. **Given** multiple users upload simultaneously, **When** quota calculations occur, **Then** each user's quota is tracked independently without interference

---

### User Story 4 - Secure File Access Control (Priority: P1)

Users can only access their own uploaded files. Even if a user discovers another user's file URL or identifier, the system prevents unauthorized access through authentication checks.

**Why this priority**: Data privacy and security are non-negotiable. A single data breach could expose sensitive career documents (resumes with personal information), destroying user trust.

**Independent Test**: Can be tested by User A uploading a file, User B obtaining the file URL, and verifying User B receives a 403 Forbidden error when attempting to access User A's file.

**Acceptance Scenarios**:

1. **Given** User A uploads resume.pdf, **When** User B tries to access the file URL directly, **Then** system returns 403 Forbidden error
2. **Given** an unauthenticated visitor obtains a file URL, **When** they attempt access, **Then** system returns 401 Unauthorized and redirects to login
3. **Given** a user's session expires, **When** they attempt to access their own files, **Then** system re-authenticates before allowing access
4. **Given** a file URL contains a user ID parameter, **When** an attacker modifies the user ID, **Then** system validates ownership and denies access
5. **Given** a user shares a file URL with a colleague, **When** the colleague clicks the link, **Then** they cannot access it without proper authorization

---

### User Story 5 - File Metadata Management (Priority: P2)

Each uploaded file is assigned a unique identifier (UUID) and stored with comprehensive metadata including original filename, file size, upload timestamp, document type (Resume/CV/Portfolio/Cover Letter), and MIME type. This metadata enables file organization, searching, and analytics.

**Why this priority**: While uploads work without rich metadata, users need this information to manage and organize their documents effectively. This is important but not blocking for core functionality.

**Independent Test**: Can be tested by uploading a file named "Software_Engineer_Resume_2024.pdf", then verifying the system stores metadata showing original filename, generates a unique UUID, records file size (e.g., 2.4MB), captures upload timestamp, and allows user to categorize as "Resume".

**Acceptance Scenarios**:

1. **Given** a user uploads "resume_final.pdf", **When** the upload completes, **Then** system generates a UUID (e.g., a7f3c9b2-4e8d-4f1a-9c6e-8d3f2a1b5e7c) and stores original filename
2. **Given** a user uploads a file, **When** viewing file details, **Then** system displays file size in human-readable format (e.g., "2.4 MB" not "2457600 bytes")
3. **Given** a user uploads multiple files with the same name, **When** storing metadata, **Then** each receives a unique UUID preventing overwrites
4. **Given** a file is uploaded, **When** metadata is saved, **Then** timestamp is stored in UTC and displayed in user's local timezone
5. **Given** a user categorizes a file as "Portfolio", **When** they search for portfolios later, **Then** system filters by document type metadata

---

### User Story 6 - PDF Thumbnail Preview Generation (Priority: P2)

When users upload PDF files, the system automatically generates thumbnail preview images of the first page. These thumbnails provide visual recognition and help users quickly identify documents in their file list.

**Why this priority**: Thumbnails significantly improve user experience and document management, but uploads work without them. This is a valuable enhancement rather than a core requirement.

**Independent Test**: Can be tested by uploading a PDF file with distinctive first-page content, then verifying a thumbnail image (200x260px) is automatically generated and displayed in the file list within 30 seconds of upload completion.

**Acceptance Scenarios**:

1. **Given** a user uploads a PDF resume, **When** processing completes, **Then** system generates a 200x260px thumbnail of the first page
2. **Given** a PDF has no text (scanned image), **When** thumbnail generation runs, **Then** system renders the visual content correctly
3. **Given** a PDF is corrupted, **When** thumbnail generation fails, **Then** system displays a default document icon and logs the error
4. **Given** a user uploads a 50-page portfolio PDF, **When** thumbnail generation runs, **Then** only the first page is rendered (not all 50 pages)
5. **Given** multiple PDFs upload simultaneously, **When** thumbnail generation queues, **Then** thumbnails are generated asynchronously without blocking the UI

---

### User Story 7 - Download Count Analytics (Priority: P3)

The system tracks how many times each file has been downloaded. This provides users with insights into document engagement and helps identify which versions of resumes or portfolios are being viewed most frequently.

**Why this priority**: Analytics are valuable for users to understand document usage patterns, but this is not essential for core file storage and retrieval functionality.

**Independent Test**: Can be tested by downloading a file 5 times (from different sessions or clearing cache), then verifying the file metadata shows "Downloaded: 5 times" and the count increments with each subsequent download.

**Acceptance Scenarios**:

1. **Given** a user downloads their resume.pdf, **When** the download completes, **Then** download count increments from 0 to 1
2. **Given** a file has been downloaded 15 times, **When** user views file details, **Then** system displays "Downloaded 15 times"
3. **Given** a user downloads the same file twice in one session, **When** counting downloads, **Then** both downloads are counted (no deduplication)
4. **Given** a download is initiated but cancelled, **When** tracking downloads, **Then** count does not increment (only successful downloads)
5. **Given** a user shares a file URL, **When** another authorized user downloads via that URL, **Then** download count still increments (tracks all authorized downloads)

---

### Edge Cases

- **What happens when a user uploads a file at exactly the 100MB quota limit?** System should accept the file if it exactly meets the quota (100MB used), but reject if even 1 byte over.

- **How does the system handle file uploads with special characters in filenames?** System sanitizes filenames by removing or replacing special characters (e.g., `../`, `\0`, Unicode control characters) while preserving readability and uniqueness.

- **What happens when presigned URL generation fails due to cloud service outage?** System displays user-friendly error message "Cloud storage temporarily unavailable, please try again in a few minutes" and logs the incident for monitoring.

- **How does the system prevent race conditions when multiple files upload simultaneously and approach quota limit?** System uses atomic quota checks with database locks/transactions to ensure quota calculations are consistent even under concurrent uploads.

- **What happens when a file upload succeeds to cloud storage but metadata save to database fails?** System implements two-phase commit pattern: if metadata save fails, the orphaned cloud file is cleaned up via background job, and user receives upload failure notification.

- **How does the system handle file deletion when the file exists in metadata but not in cloud storage?** System detects missing cloud files during deletion attempts, removes the metadata record, and logs a data inconsistency warning for investigation.

- **What happens when a user tries to upload a 0-byte (empty) file?** System rejects with error "Cannot upload empty files" since they provide no value and could indicate corruption.

- **How does the system verify file content type for DOCX files (which are ZIP archives)?** System validates DOCX by checking for ZIP magic bytes (PK\x03\x04) and verifying the presence of required internal XML structure (`word/document.xml`).

- **What happens when a user's session expires during a long file upload?** Presigned URLs remain valid regardless of session state, so upload completes successfully. However, the post-upload metadata association requires valid authentication, prompting user to re-login if needed.

- **How does the system handle timezone differences for upload timestamps?** All timestamps are stored in UTC in the database and converted to user's local timezone on display using browser's Intl.DateTimeFormat API.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST generate presigned URLs that allow direct browser-to-cloud uploads without server relay for all supported file types
- **FR-002**: System MUST validate file types (PDF, DOCX, TXT only) using both file extension and content-type magic bytes verification
- **FR-003**: System MUST enforce maximum file size of 10MB per upload, validating size on both client and server sides
- **FR-004**: System MUST enforce total storage quota of 100MB per user across all uploaded files
- **FR-005**: System MUST assign a unique UUID to each uploaded file to prevent naming collisions
- **FR-006**: System MUST store file metadata including: unique identifier, original filename, file size (bytes), upload timestamp (UTC), document type category, MIME type, and owner user ID
- **FR-007**: System MUST prevent users from accessing files owned by other users, even if they possess the file URL or identifier
- **FR-008**: System MUST authenticate and authorize all file access requests using session tokens or equivalent authentication mechanisms
- **FR-009**: System MUST generate thumbnail preview images (200x260px) for all uploaded PDF files asynchronously
- **FR-010**: System MUST track download count for each file, incrementing on successful download completion
- **FR-011**: System MUST display user's current storage usage and remaining quota in human-readable format (e.g., "45MB / 100MB used")
- **FR-012**: System MUST recalculate user quota immediately when files are deleted or uploaded
- **FR-013**: System MUST expire presigned URLs after 15 minutes to limit security exposure window
- **FR-014**: System MUST sanitize uploaded filenames to remove path traversal attempts and control characters
- **FR-015**: System MUST support parallel uploads of multiple files with independent presigned URLs per file
- **FR-016**: Presigned URLs MUST include security parameters that bind the URL to the authenticated user preventing URL sharing
- **FR-017**: System MUST implement two-phase commit for file uploads: cloud storage first, then metadata persistence with rollback on failure
- **FR-018**: System MUST provide user-facing error messages that distinguish between quota exceeded, invalid file type, size limit exceeded, and network errors
- **FR-019**: System MUST log all file operations (upload, download, delete) with user ID, file ID, timestamp, and operation outcome for audit trails
- **FR-020**: System MUST clean up orphaned cloud files (in storage but no metadata) via scheduled background job running at least daily

### Key Entities

- **StoredFile**: Represents a user-uploaded document in cloud storage
  - Unique identifier (UUID)
  - Owner (relationship to User entity)
  - Original filename (as uploaded by user)
  - Storage key (path/key in cloud storage)
  - File size (bytes)
  - MIME type (e.g., "application/pdf")
  - Document type category (Resume, CV, Portfolio, Cover Letter)
  - Upload timestamp (UTC)
  - Download count (integer, defaults to 0)
  - Thumbnail URL (for PDF files, nullable)
  - Checksum/hash (for integrity verification)

- **UserStorageQuota**: Tracks storage usage per user
  - User (relationship to User entity)
  - Total quota allowed (bytes, default 100MB)
  - Current usage (bytes, calculated from sum of all StoredFiles)
  - Last calculated timestamp (for cache invalidation)

- **PresignedUploadURL**: Temporary upload authorization (may be ephemeral, not persisted)
  - Target storage key (where file will be stored)
  - Expiration timestamp (15 minutes from generation)
  - Allowed MIME types (for this specific upload)
  - Maximum allowed file size (for this specific upload)
  - User ID (who requested this presigned URL)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can upload a 5MB PDF file in under 30 seconds on a standard broadband connection (10 Mbps upload)
- **SC-002**: File upload success rate exceeds 99% for files under 10MB (excluding user-cancelled uploads)
- **SC-003**: PDF thumbnail generation completes within 30 seconds for 90% of single-page PDFs
- **SC-004**: Zero unauthorized file access incidents (users accessing files they don't own)
- **SC-005**: Quota calculations are accurate within 1 second of file upload or deletion completion
- **SC-006**: System handles 100 concurrent file uploads across different users without performance degradation
- **SC-007**: File validation rejects 100% of non-allowed file types (no false accepts, <1% false rejects due to unusual but valid files)
- **SC-008**: Users can understand storage usage at a glance with clear "X MB / 100 MB used" display
- **SC-009**: Presigned URL generation completes in under 500ms for 95th percentile requests
- **SC-010**: Orphaned file cleanup job identifies and removes inconsistencies within 24 hours of occurrence
