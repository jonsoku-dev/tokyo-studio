# Feature Specification: Threaded Comment System

**Feature Branch**: `008-threaded-comments`
**Created**: 2025-12-28
**Status**: Draft
**Input**: User description: "Build a threaded comment system for community posts where users can have nested discussions up to 3 levels deep. Users can reply to any comment, and replies are visually indented to show the conversation hierarchy. Each comment shows the author's avatar, name, timestamp, and content with Markdown formatting support. Users can edit their own comments within 15 minutes of posting (with an "edited" indicator), delete their comments (with confirmation), and report inappropriate comments. Comments display vote counts (upvotes minus downvotes) and users can vote once per comment. The system collapses deeply nested threads with a "Show more replies" button. Users receive notifications when someone replies to their comment or mentions them with @username syntax."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Comment Creation and Threading (Priority: P1)

Users can participate in focused discussions on community posts by creating comments and replying to existing comments, forming clear conversation threads that help them follow specific discussion branches.

**Why this priority**: This is the core value proposition - enabling asynchronous threaded conversations. Without this, users cannot engage in structured discussions. This delivers immediate value as an MVP.

**Independent Test**: Can be fully tested by creating a post, adding a root comment, replying to that comment, and verifying the visual hierarchy is displayed correctly. Delivers the fundamental value of threaded discussions.

**Acceptance Scenarios**:

1. **Given** I am viewing a community post, **When** I click "Add Comment" and submit my comment, **Then** my comment appears at the root level with my avatar, name, and timestamp
2. **Given** I see an existing comment, **When** I click "Reply" and submit my response, **Then** my reply appears visually indented under the parent comment
3. **Given** I am viewing a deeply nested thread (3 levels), **When** I try to reply to a third-level comment, **Then** my reply is added at the same indentation level (preventing 4+ levels)
4. **Given** I write a comment with Markdown syntax, **When** I submit the comment, **Then** the Markdown is properly rendered with formatting
5. **Given** I am viewing a long comment thread, **When** the thread exceeds 5 replies at a nested level, **Then** I see a "Show more replies (N)" button that expands when clicked

---

### User Story 2 - Comment Editing and Deletion (Priority: P1)

Users can correct mistakes or remove their own comments to maintain accuracy and control over their contributed content, with clear indicators when content has been modified.

**Why this priority**: User control over their own content is essential for trust and usability. Mistakes happen frequently in real-time discussions, and users need immediate ability to fix them. This is part of the MVP core functionality.

**Independent Test**: Can be fully tested by creating a comment, editing it within the time window, attempting to edit after the window, and deleting a comment. Delivers essential content management value.

**Acceptance Scenarios**:

1. **Given** I posted a comment less than 15 minutes ago, **When** I click the "Edit" button and modify the text, **Then** my comment is updated and shows an "(edited)" indicator
2. **Given** I posted a comment more than 15 minutes ago, **When** I view my comment, **Then** I do not see an "Edit" button
3. **Given** I am viewing my own comment, **When** I click "Delete" and confirm the action, **Then** my comment is removed from the thread
4. **Given** I am viewing my comment that has replies, **When** I delete the comment, **Then** the comment text is replaced with "[deleted]" but the thread structure is preserved
5. **Given** I am viewing someone else's comment, **When** I look for edit/delete options, **Then** I only see my own comments' edit/delete buttons

---

### User Story 3 - Comment Voting (Priority: P2)

Users can express agreement or disagreement with comments through upvotes and downvotes, helping surface the most valuable contributions and creating a quality signal for the community.

**Why this priority**: Voting creates community-driven quality signals and helps surface valuable content. While important for long-term community health, the system functions without it initially. It's the next logical enhancement after basic commenting.

**Independent Test**: Can be fully tested by creating comments, voting on them from different users, and verifying vote counts update correctly and persist. Delivers community moderation value independently.

**Acceptance Scenarios**:

1. **Given** I am viewing a comment I have not voted on, **When** I click the upvote arrow, **Then** the vote count increases by 1 and the upvote arrow is highlighted
2. **Given** I previously upvoted a comment, **When** I click the upvote arrow again, **Then** my vote is removed and the count decreases by 1
3. **Given** I previously upvoted a comment, **When** I click the downvote arrow, **Then** my vote changes to downvote and the count decreases by 2 (removing upvote, adding downvote)
4. **Given** I am viewing a comment with multiple votes, **When** the page loads, **Then** I see the net vote score (upvotes minus downvotes) displayed
5. **Given** I voted on a comment, **When** I refresh the page, **Then** my vote state is preserved and visually indicated

---

### User Story 4 - User Mentions and Notifications (Priority: P2)

Users receive timely notifications when their comments get replies or when they are mentioned in discussions, keeping them engaged in conversations they care about without constantly checking the site.

**Why this priority**: Notifications drive engagement and ensure users don't miss relevant responses. However, the comment system provides value without notifications initially. This enhances the user experience significantly but isn't blocking for MVP.

**Independent Test**: Can be fully tested by creating a comment, having another user reply, and verifying the notification appears. Can also test @username mentions independently. Delivers engagement value.

**Acceptance Scenarios**:

1. **Given** another user replies to my comment, **When** the reply is posted, **Then** I receive a notification with the replier's name and a preview of their comment
2. **Given** I am mentioned with @username in a comment, **When** the comment is posted, **Then** I receive a notification indicating I was mentioned
3. **Given** I have unread comment notifications, **When** I view the notification list, **Then** I see all unread notifications with timestamps and preview text
4. **Given** I click on a comment notification, **When** the page loads, **Then** I am taken directly to that comment in the thread
5. **Given** I have notification preferences, **When** I disable comment reply notifications, **Then** I no longer receive notifications for replies to my comments

---

### User Story 5 - Content Moderation (Priority: P3)

Users can report inappropriate or harmful comments to moderators, creating a safer community environment where problematic content can be reviewed and addressed by administrators.

**Why this priority**: Important for long-term community health and safety, but the system can operate without it initially in a small, trusted community. This becomes critical as the community scales but isn't needed for initial MVP validation.

**Independent Test**: Can be fully tested by reporting a comment, verifying it appears in a moderation queue, and testing admin review actions. Delivers safety value independently but not required for basic functionality.

**Acceptance Scenarios**:

1. **Given** I am viewing any comment, **When** I click the "Report" button, **Then** I see a modal asking for a reason (Spam, Harassment, Inappropriate, Other)
2. **Given** I submit a report for a comment, **When** the report is sent, **Then** I see a confirmation message and the report is queued for moderator review
3. **Given** I am a moderator viewing reported comments, **When** I access the moderation queue, **Then** I see all reported comments with report reasons and reporter count
4. **Given** I am a moderator reviewing a reported comment, **When** I choose to hide/remove the comment, **Then** the comment is hidden from public view but preserved for admin review
5. **Given** I previously reported a comment, **When** I view that comment again, **Then** I see an indicator that I already reported it and cannot report again

---

### Edge Cases

- What happens when a user edits a comment at exactly 15 minutes after posting (race condition)?
- How does the system handle vote count display when the number is very large (e.g., 10,000+ votes)?
- What happens when a user tries to mention a non-existent username with @syntax?
- How does the system handle extremely long comments (10,000+ characters)?
- What happens when a deeply nested thread is collapsed and a user receives a notification for a reply in that collapsed section?
- How does the system handle simultaneous edits if the same user has the comment open in multiple tabs?
- What happens when a user deletes their account but has many comments in threads?
- How does the system handle special characters or XSS attempts in Markdown content?
- What happens when a user tries to vote on their own comment?
- How does the system handle the display of threads when the parent comment is deleted but has many child replies?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support creating root-level comments on any community post
- **FR-002**: System MUST support replying to any existing comment, creating a parent-child relationship
- **FR-003**: System MUST limit comment nesting to a maximum of 3 levels deep
- **FR-004**: System MUST display comments with visual indentation to show hierarchy (level 1, 2, 3)
- **FR-005**: System MUST render Markdown formatting in comment content (bold, italic, links, code blocks, lists)
- **FR-006**: System MUST sanitize Markdown input to prevent XSS attacks and malicious script injection
- **FR-007**: System MUST display each comment with author's avatar, display name, username, and timestamp
- **FR-008**: System MUST allow comment authors to edit their own comments within 15 minutes of posting
- **FR-009**: System MUST display an "(edited)" indicator on comments that have been modified after posting
- **FR-010**: System MUST allow comment authors to delete their own comments at any time
- **FR-011**: System MUST preserve thread structure when a comment with replies is deleted by showing "[deleted]" placeholder
- **FR-012**: System MUST require confirmation before deleting a comment
- **FR-013**: System MUST support upvote and downvote actions on any comment
- **FR-014**: System MUST display vote count as net score (upvotes minus downvotes)
- **FR-015**: System MUST allow each user to vote only once per comment (can change vote but not double-vote)
- **FR-016**: System MUST highlight the user's current vote state (upvoted, downvoted, or neutral)
- **FR-017**: System MUST collapse deeply nested threads with more than 5 replies with a "Show more replies (N)" button
- **FR-018**: System MUST expand collapsed threads when the "Show more replies" button is clicked
- **FR-019**: System MUST detect @username syntax in comments and create user mentions
- **FR-020**: System MUST send notifications to users when someone replies to their comment
- **FR-021**: System MUST send notifications to users when they are mentioned with @username
- **FR-022**: System MUST allow users to report comments with a reason selection
- **FR-023**: System MUST queue reported comments for moderator review
- **FR-024**: System MUST prevent users from reporting the same comment multiple times
- **FR-025**: System MUST display timestamps in relative format (e.g., "2 hours ago") with absolute time on hover
- **FR-026**: System MUST load comments in chronological order (oldest to newest by default)
- **FR-027**: System MUST support real-time vote count updates without page refresh
- **FR-028**: System MUST validate comment content is not empty before allowing submission
- **FR-029**: System MUST enforce a maximum comment length [NEEDS CLARIFICATION: specific character limit not specified - suggest 10,000 characters]
- **FR-030**: System MUST validate @username mentions exist before creating notification links

### Key Entities

- **Comment**: Represents a user's contribution to a discussion, containing the text content, authorship information, timestamp, edit history, parent relationship (if reply), nesting level, and vote counts. Each comment knows its position in the hierarchy.

- **CommentVote**: Represents a user's vote on a specific comment, storing whether it's an upvote or downvote. Enforces one-vote-per-user-per-comment constraint.

- **CommentReport**: Represents a user's report of inappropriate comment content, storing the reporter identity, report reason category, timestamp, and moderation status.

- **CommentNotification**: Represents a notification triggered by comment activity, storing the recipient user, notification type (reply or mention), the triggering comment reference, read/unread status, and timestamp.

- **User**: The actor who creates comments, votes, reports, and receives notifications. Includes profile information (avatar, name, username) displayed with comments.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create and submit a comment on any post in under 30 seconds with visible confirmation
- **SC-002**: Thread hierarchy is visually clear - 95% of users in testing can correctly identify parent-child comment relationships without instruction
- **SC-003**: Comment editing completes in under 5 seconds with the "(edited)" indicator appearing immediately
- **SC-004**: Vote interactions provide immediate visual feedback within 200ms (optimistic updates before server confirmation)
- **SC-005**: Markdown rendering displays correctly for all standard syntax (bold, italic, links, code blocks, lists) in 100% of test cases
- **SC-006**: Notifications for replies and mentions are delivered within 30 seconds of the triggering action
- **SC-007**: Users can navigate to the specific comment from a notification in one click
- **SC-008**: Collapsed threads with "Show more replies" reduce initial page load by at least 40% for threads with 20+ nested comments
- **SC-009**: Security testing confirms zero successful XSS injection attempts through comment content or Markdown
- **SC-010**: Delete confirmation prevents at least 80% of accidental deletions based on user testing
- **SC-011**: Comment system maintains performance with threads containing 100+ comments, with load time under 2 seconds
- **SC-012**: Moderators can review and action reported comments within the admin interface with all necessary context visible
