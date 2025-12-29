# Admin Tasks: Mentor Application

## Backend Implementation
- [ ] **Query**: `adminListApplications(filters)`
    - Join with `users` for applicant info.
    - Filter by status, sort by date.
- [ ] **Query**: `adminGetApplicationDetail(appId)`
    - Return all fields + generate presigned URL for document.
- [ ] **Mutation**: `adminApproveApplication(appId)`
    - Create `mentors` and `mentor_profiles` entries.
    - Update application status.
    - Trigger email.
    - Log action.
- [ ] **Mutation**: `adminRejectApplication(appId, reason)`
    - Update status and reason.
    - Trigger email.
    - Log action.
- [ ] **Mutation**: `adminRequestMoreInfo(appId, message)`
    - Update status or add note.
    - Trigger email.

## Frontend Implementation
- [ ] **Page**: `features/mentoring/routes/applications.tsx` (existing, enhance).
- [ ] **Component**: Application detail panel.
- [ ] **Component**: Document preview/download.
- [ ] **Actions**: Approve, Reject, Request Info buttons.
- [ ] **Component**: Rejection reason modal.

## QA Verification
- [ ] **Test**: Submit application as user. View in admin queue.
- [ ] **Test**: Approve application. Verify mentor profile created.
- [ ] **Test**: Reject application. Verify email sent with reason.
