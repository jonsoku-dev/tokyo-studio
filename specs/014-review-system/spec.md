# Feature Specification: Review System

**Feature Branch**: `014-review-system`  
**Created**: 2025-12-28  
**Status**: Draft  
**Input**: User description: "Build a post-session review system..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mentee Leaves a Review (Priority: P1)

After a mentorship session, a mentee needs to be able to evaluate their experience so that other users can make informed decisions and the mentor gets feedback.

**Why this priority**: Core value proposition of the review system. Without reviews, the system has no data.

**Independent Test**: Can be tested by simulating a completed session and verifying the review submission flow.

**Acceptance Scenarios**:

1. **Given** a session has just ended, **When** the mentee checks their email, **Then** they should receive a prompt to leave a review.
2. **Given** a customized review link, **When** the mentee clicks it, **Then** they see the review form.
3. **Given** the review form, **When** the mentee selects a 5-star rating and submits, **Then** the review is saved.
4. **Given** the review form, **When** the mentee chooses to remain anonymous, **Then** their name is not displayed on the public review.
5. **Given** a session ended more than 7 days ago, **When** accessibility is attempted, **Then** the system should prevent new reviews (or show as expired).

---

### User Story 2 - Mentor Profile & Reputation (Priority: P1)

A mentor needs their reviews displayed on their profile so that they can attract more mentees, and prospective mentees need to see these reviews to choose a mentor.

**Why this priority**: This is the consumption side of the review loop.

**Independent Test**: Can be tested by viewing a mentor profile with existing reviews.

**Acceptance Scenarios**:

1. **Given** a mentor profile, **When** a user views it, **Then** they see a list of reviews sorted by recency.
2. **Given** a mentor with >10 reviews and 4.8+ average, **When** viewing their profile, **Then** a "Top Rated" badge is visible.
3. **Given** the review list, **When** a user filters by "5 stars", **Then** only 5-star reviews are shown.
4. **Given** calculation logic, **When** the average is computed, **Then** recent reviews have higher weight than older ones.

---

### User Story 3 - Mentor Response & Moderation (Priority: P2)

A mentor needs to respond to feedback, and admins need to moderate content to keep the platform safe and fair.

**Why this priority**: managing community health and fairness.

**Independent Test**: Can be tested by a mentor replying to a review and an admin flagging/removing one.

**Acceptance Scenarios**:

1. **Given** a review on their profile, **When** a mentor replies, **Then** the reply is displayed threaded under the review.
2. **Given** a negative review, **When** a mentor tries to delete it, **Then** the system prevents deletion.
3. **Given** a disputed review, **When** an admin reviews and agrees it violates policy, **Then** the admin can remove it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST send an automated email to mentees immediately after a session is marked complete.
- **FR-002**: System MUST allow mentees to submit a review within 7 days of session completion.
- **FR-003**: System MUST require a star rating (1-5 integers) for every review.
- **FR-004**: System MUST allow optional text feedback.
- **FR-005**: System MUST allow mentees to toggle "Anonymous" visibility for their review.
- **FR-006**: System MUST calculate a weighted average rating where recent reviews (e.g., last 3 months) carry more weight.
- **FR-007**: System MUST automatically assign a "Top Rated" badge to mentors with 4.8+ weighted average and 10+ total reviews.
- **FR-008**: System MUST allow mentors to post one reply per review.
- **FR-009**: System MUST allow admins to hide or remove reviews.
- **FR-010**: System MUST allow mentors to "Dispute" a review, sending it to an admin queue.

### Key Entities

- **Review**: Associated with a Session, Mentee, and Mentor. Contains rating, text, anonymity flag, timestamp.
- **ReviewResponse**: Mentor's reply to a review.
- **Badge**: Metadata associated with a Mentor based on rating aggregation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of completed sessions generate a review prompt email.
- **SC-002**: Weighted average ratings update immediately (or within reasonable cache time) upon new review submission.
- **SC-003**: Reviews are visible on the profile page within 1 minute of submission.
- **SC-004**: Mentors with qualifying stats receive the badge automatically without manual intervention.
