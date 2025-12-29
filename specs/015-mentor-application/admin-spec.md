# Admin Feature Specification: Mentor Application Processing

**Feature**: `015-mentor-application`
**Role**: Admin
**Outcome**: Admins can review, approve, or reject mentor applications efficiently.

## Current Implementation Status

### Existing Code (Complete)
| File | Functions | Status |
|------|-----------|--------|
| `web/app/features/mentoring/services/mentor-application.server.ts` | `canUserApply`, `submitApplication`, `getApplication`, `getApplications`, `markAsUnderReview`, `approveApplication`, `rejectApplication`, `requestMoreInfo`, `getUserApplicationStatus`, `countPendingApplications` | ✅ **Fully Implemented** |

### Existing Admin Route
- `admin/app/features/mentoring/routes/applications.tsx` - Already created.

### Existing Schema
| Table | Key Fields |
|-------|------------|
| `mentor_applications` | `id`, `userId`, `jobTitle`, `company`, `yearsOfExperience`, `linkedinUrl`, `bio`, `expertise`, `languages`, `verificationFileUrl`, `status`, `rejectionReason`, `reviewedBy`, `reviewedAt` |
| `admin_audit_logs` | `id`, `adminId`, `action`, `targetId`, `metadata`, `createdAt` |

### Implementation Highlights
- **Rate Limiting**: 30-day reapplication block after rejection.
- **Atomic Transactions**: Approval creates `mentors` + `mentor_profiles` atomically.
- **Audit Logging**: All admin actions logged to `admin_audit_logs`.

## 1. User Scenarios (Already Implemented)

### 1.1 View Application Queue ✅
- **Implemented**: `getApplications(filters)` with status/limit/offset.

### 1.2 Review Application Details ✅
- **Implemented**: `getApplication(applicationId)` with user data.
- **Implemented**: Presigned URL for verification document.

### 1.3 Approve Application ✅
- **Implemented**: `approveApplication(appId, adminId)`.
- Creates `mentors` entry + `mentor_profiles` entry.
- Logs to `admin_audit_logs`.

### 1.4 Reject Application ✅
- **Implemented**: `rejectApplication(appId, adminId, reason)`.
- Sets 30-day lock.
- Logs to `admin_audit_logs`.

### 1.5 Request Additional Information ✅
- **Implemented**: `requestMoreInfo(appId, adminId, message)`.

## 2. Requirements

All requirements from spec.md are **already implemented**.

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `mentor_applications` | **Read/Write** | Existing, fully utilized. |
| `mentors` | **Write** | Created on approval. |
| `mentor_profiles` | **Write** | Created on approval. |
| `admin_audit_logs` | **Write** | Already logging actions. |

## 4. Work Definition (Tasks)

### Existing (Complete)
- [x] **Backend**: All service functions implemented.
- [x] **Admin Route**: `applications.tsx` exists.

### Enhancement Tasks
- [ ] **Frontend**: Improve UI polish of existing applications page.
- [ ] **Frontend**: Add document preview component.
- [ ] **Email**: Integrate transactional email for approval/rejection.
