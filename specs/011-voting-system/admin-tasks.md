# Admin Tasks: Vote Integrity

## Backend Implementation
- [ ] **Query**: `adminGetVoteDetails(targetId, targetType)`
    - Return list: User, VoteType, Timestamp, IP (from audit log).
    - Join `post_votes`/`comment_votes` with `users` and `vote_audit_logs`.
- [ ] **Query**: `adminGetVotesByUser(userId)`
    - Return all votes cast by user (posts + comments).
    - Include target content title/snippet.
- [ ] **Mutation**: `adminResetScore(targetId, targetType, reason)`
    - Delete from `post_votes` or `comment_votes` where target matches.
    - Update content: `score = 0, upvotes = 0, downvotes = 0`.
    - Log in `admin_audit_logs`.
- [ ] **Mutation**: `adminRemoveAllVotesByUser(userId, reason)`
    - Delete from both vote tables where `userId = X`.
    - Recalculate scores for all affected content.
    - Log in `admin_audit_logs`.
- [ ] **Query**: `adminGetVoteAuditLogs(filters)`
    - Search `vote_audit_logs` with filters (user, target, IP, date).

## Frontend Implementation
- [ ] **Component**: "Votes" Tab in Post/Comment Detail.
    - Voter list table.
    - "Reset Score" button.
- [ ] **Component**: "Vote History" in User Detail.
    - All votes by user.
    - "Remove All Votes" button.
- [ ] **Page**: `features/security/routes/vote-audit.tsx`.
    - Global audit log browser.
    - Filters and export.

## QA Verification
- [ ] **Test Case**: Vote on post. Check Admin detail sees the vote.
- [ ] **Test Case**: Reset post score. Verify score becomes 0.
- [ ] **Test Case**: Remove all votes from a user. Verify affected posts recalculated.
- [ ] **Test Case**: Search audit logs by IP. Verify results match.
