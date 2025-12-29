# Admin Feature Specification: Vote Integrity

**Feature**: `011-voting-system`
**Role**: Admin
**Outcome**: Admins can audit vote manipulation, identify brigading, and take corrective actions.

## 1. User Scenarios

### 1.1 Inspect Vote Distribution on Content
**As an**: Admin
**I want to**: See the list of users who voted on a specific post or comment
**So that**: I can see if a "bot farm" account list is targeting content.

- **Acceptance Criteria**:
    - Select post/comment by ID.
    - Table: Voter (User), Vote Type (+1/-1), Timestamp, IP Address.
    - Source: `post_votes` / `comment_votes` joined with `vote_audit_logs`.

### 1.2 Detect Voting Patterns by User
**As an**: Admin
**I want to**: See all votes cast by a specific user
**So that**: I can identify if they are part of a coordinated attack.

- **Acceptance Criteria**:
    - Input: User ID.
    - Output: All votes (posts + comments) with targets and timestamps.
    - Highlight: Suspicious patterns (e.g., 50+ votes in 1 minute).

### 1.3 Reset Votes on Content
**As an**: Admin
**I want to**: Reset the score of a post or comment to zero
**So that**: I can neutralize a brigade attack.

- **Acceptance Criteria**:
    - "Reset Score" action deletes all entries in `post_votes` (or `comment_votes`) for the target.
    - Recalculates `score`, `upvotes`, `downvotes` to 0.
    - Confirmation dialog with reason input.
    - Log in `admin_audit_logs`.

### 1.4 Remove All Votes by Specific User
**As an**: Admin
**I want to**: Delete all votes cast by a malicious user
**So that**: I can undo the damage from a bot account.

- **Acceptance Criteria**:
    - Input: User ID.
    - Action: Delete all `post_votes` and `comment_votes` where `userId = X`.
    - Recalculate affected content scores.
    - Log in `admin_audit_logs`.

### 1.5 View Vote Audit Logs
**As an**: Admin
**I want to**: See historical vote actions including IP addresses
**So that**: I can track abuse even after votes are removed.

- **Acceptance Criteria**:
    - Global search of `vote_audit_logs`.
    - Filter by user, target, IP, date range.
    - Export to CSV (optional).

## 2. Requirements

### 2.1 Functional Requirements
- **FR_ADMIN_011.01**: View `post_votes` / `comment_votes` joined with `users` for voter identity.
- **FR_ADMIN_011.02**: Mutation to delete votes for a target object.
- **FR_ADMIN_011.03**: Mutation to delete all votes from a specific user.
- **FR_ADMIN_011.04**: Recalculate affected content scores after vote deletion.
- **FR_ADMIN_011.05**: Query `vote_audit_logs` for forensic investigation.

### 2.2 Security Requirements
- **SEC_ADMIN_011.01**: Bulk vote deletion MUST require confirmation and audit logging.
- **SEC_ADMIN_011.02**: Audit logs MUST NOT be deletable by any admin.

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `post_votes` | **Read/Write** | Live votes on posts. |
| `comment_votes` | **Read/Write** | Live votes on comments. |
| `vote_audit_logs` | **Read** | Historical forensic data. |
| `community_posts` | **Write** | Recalculate score. |
| `community_comments` | **Write** | Recalculate score. |
| `admin_audit_logs` | **Write** | Log moderation actions. |

## 4. Work Definition (Tasks)

- [ ] **Backend**: `AdminVoteService.getVotersForContent(targetId, targetType)`.
- [ ] **Backend**: `AdminVoteService.getVotesByUser(userId)`.
- [ ] **Backend**: `AdminVoteService.resetContentScore(targetId, targetType, reason)`.
- [ ] **Backend**: `AdminVoteService.removeAllVotesByUser(userId, reason)`.
- [ ] **Backend**: `AdminVoteService.getAuditLogs(filters)`.
- [ ] **Frontend**: "Votes" Tab in Content Detail (post/comment).
- [ ] **Frontend**: "User Vote History" in User Detail.
- [ ] **Frontend**: "Reset Score" and "Remove All Votes" actions with confirmation.
- [ ] **Frontend**: Vote Audit Log browser page.
