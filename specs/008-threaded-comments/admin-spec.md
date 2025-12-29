# Admin Feature Specification: Community Moderation

**Feature**: `008-threaded-comments`
**Role**: Admin
**Outcome**: Admins can efficiently handle reported content and maintain community health.

## 1. User Scenarios

### 1.1 Handle Content Reports
**As an**: Admin
**I want to**: View a list of reported comments (`comment_reports`)
**So that**: I can decide to "Delete", "Dismiss", or "Warning".

- **Acceptance Criteria**:
    - Queue of "Pending" reports.
    - View Report Reason (Spam, Harassment) + Comment Content.
    - Action: "Resolve (Delete Comment)" -> Updates `comment.deletedAt` and report status.
    - Action: "Dismiss Report" -> Updates report status to `dismissed`.

### 1.2 Deep Link to Context
**As an**: Admin
**I want to**: Click "View Context" on a report
**So that**: I can see the parent post and surrounding conversation to judge intent.

## 2. Requirements

### 2.1 Functional Requirements
- **FR_ADMIN_008.01**: Moderation Queue MUST show aggregated reports (e.g., "5 reports on this comment").
- **FR_ADMIN_008.02**: Deleting a comment MUST cascade to (or hide) its children to preserve tree consistency (UI decision: usually "Msg Deleted" placeholder).

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `comment_reports` | **Write** | Update status (pending -> resolved). |
| `community_comments` | **Write** | Soft delete (`deletedAt`). |

## 4. Work Definition (Tasks)

- [ ] **Backend**: `AdminCommunityService.getReportQueue()`.
- [ ] **Backend**: `AdminCommunityService.resolveReport(reportId, action)`.
- [ ] **Frontend**: "Moderation" Dashboard Page.
