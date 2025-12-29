# Admin Tasks: Review Moderation

## Backend Implementation
- [ ] **Query**: `adminListReviews(filters)`
    - Join with mentor/mentee users.
    - Filter by status, rating.
- [ ] **Mutation**: `adminModerateReview(reviewId, action, reason)`
    - Actions: hide, unhide, delete.
    - Log to `review_moderation_logs`.
- [ ] **Query**: `adminListDisputes(status)`
    - Filter by pending/resolved.
- [ ] **Mutation**: `adminResolveDispute(disputeId, action, reason)`
    - Update dispute status.
    - Optionally moderate the review.
- [ ] **Query**: `adminGetReviewStats()`
    - Aggregates: total, average, distribution.

## Frontend Implementation
- [ ] **Page**: `features/mentoring/routes/admin-reviews.tsx`.
- [ ] **Page**: `features/mentoring/routes/admin-disputes.tsx`.
- [ ] **Component**: Review table with actions.
- [ ] **Component**: Dispute queue with detail panel.
- [ ] **Widget**: Review stats on Dashboard.

## QA Verification
- [ ] **Test**: Hide a review, verify it doesn't appear publicly.
- [ ] **Test**: Submit dispute as mentor, resolve as admin.
- [ ] **Test**: View review stats chart.
