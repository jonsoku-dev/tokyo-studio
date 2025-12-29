# Feature 006: S3 Cloud File Storage System - Requirements Checklist

## 1. Database Schema
- [x] **New Table `documents` Update**: Added `storageKey`, `mimeType`, `size`, `originalName`, `downloadCount`, `thumbnailUrl`.
- [x] **Relations**: `documents` is related to `users` (one-to-many).
- [x] **Quota Tracking**: Implemented via `sum(size)` query in `storageService`.

## 2. Service Layer
- [x] **Presigned URL Generation**: `storageService.generatePresignedUrl` simulates S3 presigned POST.
- [x] **User Quota Management**: Enforces 100MB limit. Calculate usage before upload authorization.
- [x] **File Deletion**: Removes file from disk loop and DB record.
- [x] **File Type Validation**: Rejects non-allowed types (PDF, DOCX, TXT only).
- [x] **Filename Sanitization**: Handled by encoding in URL and using UUIDs for storage keys.
- [x] **Thumbnail Generation**: Stub service prepared (`thumbnailService`).

## 3. API Layer
- [x] **`POST /api/storage/presigned`**: Returns upload URL and key.
- [x] **`POST /api/storage/upload`**: Handles the actual file write (simulating S3).
- [x] **`POST /api/storage/files`**: Finalizes metadata or handles deletion.

## 4. UI Layer
- [x] **File Uploader Component**: Drag & Drop, Progress Bar, Error Handling.
- [x] **Document List**: Shows file name, type, size (MB), upload date.
- [x] **Quota Display**: Visual progress bar showing usage / 100MB.
- [x] **Actions**: Download and Delete buttons working.

## 5. Security & Edge Cases
- [x] **Directory Traversal**: Prevented in `upload.ts` by checking for `..`.
- [x] **Unauthorized Access**: `requireUserId` checks on all endpoints. Users can only see/delete their own files.
- [x] **File Size Limit**: 10MB limit enforced in both UI (`react-dropzone`) and API.
