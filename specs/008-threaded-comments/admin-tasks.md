# Admin Tasks: Moderation

## Backend Implementation
- [ ] **Query**: `adminGetReports(status='pending')`
    - Join `communityComments` for content preview.
- [ ] **Mutation**: `adminModerateComment(commentId, action)`
    - if delete: `update communityComments set deletedAt = NOW()`.
    - `update commentReports set status = 'resolved' where commentId = ...`.

## Frontend Implementation
- [ ] **Page**: `features/content/routes/moderation.tsx`.
    - Split view: List of reports (Left), Selected detail (Right).
- [ ] **UI**: "Delete Content" button (Destructive). "Ignore Report" button.

## QA Verification
- [ ] **Test Case**: User reports comment. Admin sees it in queue. Admin deletes it. Check public page (comment gone).
