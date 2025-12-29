# Admin Feature Specification: Review System Moderation

**Feature**: `014-review-system`
**Role**: Admin
**Outcome**: Admins can moderate reviews, handle disputes, and maintain review integrity.

## Current Implementation Status

### Existing Code
| File | Functions | Status |
|------|-----------|--------|
| `web/app/features/mentoring/services/review.server.ts` | `createReview`, `getReviews`, `canReview` | ✅ Implemented |
| Route: `mentoring.session.$sessionId.review.tsx` | Review submission UI | ✅ Implemented |

### Existing Schema
| Table | Key Fields |
|-------|------------|
| `mentor_reviews` | `id`, `sessionId`, `menteeId`, `mentorId`, `rating`, `text`, `isAnonymous`, `status`, `createdAt` |
| `mentor_review_responses` | `id`, `reviewId`, `mentorId`, `text` |
| `review_moderation_logs` | `id`, `reviewId`, `adminId`, `action`, `reason`, `createdAt` |
| `review_disputes` | `id`, `reviewId`, `mentorId`, `reason`, `status`, `resolvedAt`, `resolvedBy` |

### Existing Logic
- **Stats Update**: `createReview` automatically recalculates `mentor_profiles.averageRating` and `totalReviews`.
- **Push Notification**: Mentor receives push when review is posted.

## 1. User Scenarios

### 1.1 View All Reviews
**As an**: Admin
**I want to**: See a global list of mentor reviews
**So that**: I can monitor review quality and spot abuse.

- **Data**: Query `mentor_reviews` with joins.

### 1.2 Moderate Review (Hide/Delete)
**As an**: Admin
**I want to**: Hide or delete inappropriate reviews.

- **Schema Ready**: `mentor_reviews.status` supports `published`, `flagged`, `hidden`, `deleted`.
- **Audit**: Write to `review_moderation_logs`.

### 1.3 Handle Disputes
**As an**: Admin
**I want to**: View and resolve `review_disputes` submitted by mentors.

- **Schema Ready**: `review_disputes` table exists.

### 1.4 View Review Statistics
**As an**: Admin
**I want to**: See platform-wide review metrics.

- **Query**: Aggregate from `mentor_reviews` (total, avg, distribution).

## 2. Requirements

### 2.1 Functional Requirements
- **FR_ADMIN_014.01**: Global review list with status and rating filters.
- **FR_ADMIN_014.02**: Hide/Delete/Unhide actions with logging to `review_moderation_logs`.
- **FR_ADMIN_014.03**: Dispute queue with resolution workflow.
- **FR_ADMIN_014.04**: Platform review statistics.

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `mentor_reviews` | **Read/Write** | Review content and status. |
| `review_moderation_logs` | **Write** | Moderation audit trail. |
| `review_disputes` | **Read/Write** | Dispute handling. |

## 4. Work Definition (Tasks)

### Leverage Existing Code
- [ ] Extend `reviewService` with admin functions.

### New Backend
- [ ] `AdminReviewService.listAll(filters)`.
- [ ] `AdminReviewService.moderate(reviewId, action, reason)`.
- [ ] `AdminReviewService.listDisputes(status)`.
- [ ] `AdminReviewService.resolveDispute(disputeId, action, reason)`.

### Frontend
- [ ] "Reviews" management page.
- [ ] "Disputes" queue page.
