# SPEC 014: Review System - Implementation Details

**Last Updated**: 2025-12-29
**Status**: Ready for Implementation

---

## 📊 Database Schema

```sql
-- Reviews table
CREATE TABLE mentor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sessionId UUID NOT NULL REFERENCES mentoring_sessions(id) ON DELETE CASCADE,
  menteeId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentorId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,

  isAnonymous BOOLEAN DEFAULT false,

  status VARCHAR DEFAULT 'published', -- 'published', 'flagged', 'hidden', 'deleted'

  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Mentor Review Responses
CREATE TABLE mentor_review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewId UUID NOT NULL REFERENCES mentor_reviews(id) ON DELETE CASCADE,
  mentorId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  text TEXT NOT NULL,

  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Mentor Badges (Denormalized for performance)
CREATE TABLE mentor_badges (
  mentorId UUID PRIMARY KEY REFERENCES mentors(id) ON DELETE CASCADE,
  badgeType VARCHAR NOT NULL, -- 'top_rated'

  weightedAverageRating DECIMAL(3,2),
  totalReviews INTEGER,

  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Admin Moderation Log
CREATE TABLE review_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewId UUID NOT NULL REFERENCES mentor_reviews(id),
  adminId UUID NOT NULL REFERENCES users(id),

  action VARCHAR NOT NULL, -- 'flag', 'hide', 'unhide', 'delete'
  reason TEXT,

  createdAt TIMESTAMP DEFAULT NOW()
);

-- Review Disputes
CREATE TABLE review_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewId UUID NOT NULL REFERENCES mentor_reviews(id),
  mentorId UUID NOT NULL REFERENCES users(id),

  reason TEXT NOT NULL,
  status VARCHAR DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'

  createdAt TIMESTAMP DEFAULT NOW(),
  resolvedAt TIMESTAMP,
  resolvedBy UUID REFERENCES users(id)
);
```

---

## 🎯 Review Workflow

### 1. Post-Session Email Trigger

**When**: Session marked as completed
**What**: Send review invitation email with unique link

```typescript
// Unique review token (valid for 7 days)
const reviewToken = generateSecureToken();
const reviewUrl = `${appUrl}/mentoring/session/${sessionId}/review?token=${reviewToken}`;

// Email template
Subject: "How was your session with {mentorName}?"
Body:
- Thank you message
- Session details recap
- "Leave a Review" button → reviewUrl
- Deadline: "You can review until {expireDate}"
```

### 2. Rating Calculation (Weighted Average)

**Algorithm**:
```
weightedRating = SUM(rating * weight) / SUM(weight)

Where weight is based on review age:
- Last 3 months: weight = 1.0 (recent)
- 3-6 months ago: weight = 0.8
- 6-12 months ago: weight = 0.6
- 12+ months: weight = 0.4
```

**Calculation Frequency**:
- Real-time calculation on review list (for accuracy)
- Cached in `mentor_badges` table (updated every hour)
- Display both in mentor card

### 3. Badge Assignment Logic

```typescript
// Top Rated Badge Criteria
const isTopRated = (mentor) => {
  const reviews = mentor.reviews.filter(r => r.status === 'published');

  // Must have minimum 10 reviews
  if (reviews.length < 10) return false;

  // Weighted average must be >= 4.8
  const weightedAvg = calculateWeightedAverage(reviews);
  return weightedAvg >= 4.8;
};

// Trigger: Update daily via cron job
// or on-demand when review count reaches 10
```

### 4. Anonymous Review Handling

```typescript
// If isAnonymous = true:
- Frontend: "Anonymous" badge instead of name
- Admin view: Shows actual reviewer name (for moderation)
- Mentor response: Addressed to "Anonymous Reviewer"
```

### 5. Mentor Response

```typescript
// Constraints:
- One response per review (editable, not deletable)
- Limited to 500 characters
- Cannot be hidden even if review is hidden
- Both review + response visible together
```

### 6. Admin Moderation

```typescript
// Actions available:
- Flag: Mark as under review, visible to admins
- Hide: Remove from public view (mentee can still see)
- Delete: Permanently remove (logs reason)
- Unhide: Make visible again

// Moderation criteria:
- Spam/off-topic
- Harassment or personal attacks
- Unverified claims
- Conflict of interest

// Access: Admin-only route /admin/reviews
```

### 7. Dispute Resolution

```typescript
// Mentor can dispute review with reason
// Options:
- "Review is inaccurate"
- "Harassment/Personal attack"
- "Unverified claim"
- "Other" (free text)

// Admin workflow:
1. Receive dispute notification
2. Review both review + dispute reason
3. Decide: Dismiss or Uphold (hide/delete)
4. Email mentor + reviewer with decision
```

---

## 📧 Email Templates

### Review Invitation Email
```
Subject: "How was your mentoring session with {mentorName}?"

Hi {menteeName},

Thank you for your mentoring session with {mentorName}!
We'd love to hear about your experience.

Session Details:
- Date: {sessionDate} at {sessionTime}
- Duration: {duration} minutes
- Topic: {topic}

[LEAVE A REVIEW BUTTON]

Your review helps other users find great mentors, and gives {mentorName}
valuable feedback to improve their mentoring.

You can leave a review until: {expiryDate}

Questions? Contact support@itcom.com
```

### Review Response Notification Email
```
Subject: "{mentorName} responded to your review"

Hi {menteeName},

{mentorName} responded to your review:

Original Review: ⭐⭐⭐⭐⭐
"{reviewText}"

Response:
"{responseText}"

[VIEW FULL PROFILE BUTTON]
```

### Top Rated Badge Email
```
Subject: "Congratulations! You've earned the Top Rated badge 🌟"

Hi {mentorName},

Your excellent mentoring has been recognized!
You've earned the "Top Rated" badge for maintaining a 4.8+ rating
with 10+ reviews.

Your current rating: {weightedAvg}
Total reviews: {count}

This badge is now displayed on your mentor profile to attract more mentees.
```

---

## 🧪 Test Scenarios

1. **Review Submission**:
   - Complete session
   - Receive email with review link
   - Submit review with rating + text
   - Verify rating updated in mentor profile

2. **Anonymous Review**:
   - Submit with anonymous flag
   - Verify name shows as "Anonymous" in public view
   - Admin can see actual name in moderation view

3. **Mentor Response**:
   - Mentor leaves response to review
   - Verify response appears under review
   - Mentee receives notification email

4. **Badge Award**:
   - Mentor has 9 reviews at 4.8+
   - No badge yet
   - 10th review submitted
   - Badge automatically appears

5. **Moderation**:
   - Review flagged as spam
   - Admin hides review
   - Review no longer visible to public
   - Mentee still sees their own review

---

## 📋 Implementation Checklist

- [ ] Create `mentor_reviews` table with migration
- [ ] Create `mentor_review_responses` table
- [ ] Create `mentor_badges` table
- [ ] Create review moderation admin routes
- [ ] Build review submission form
- [ ] Implement weighted average calculation
- [ ] Setup review email trigger (on session completion)
- [ ] Build mentor response modal
- [ ] Create badge assignment cron job
- [ ] Add review filters to mentor profile
- [ ] Implement admin moderation interface
- [ ] Build review dispute workflow
- [ ] Add review analytics dashboard
