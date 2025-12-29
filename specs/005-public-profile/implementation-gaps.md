# SPEC 005: Public Profile System - Implementation Gaps

## 문서 정보
- **작성일**: 2025-12-28
- **상태**: 보완 필요
- **우선순위**: High

---

## 1. 누락된 핵심 기능

### 1.1 Badge System Integration (FR-005)
**상태**: ❌ 플레이스홀더만 존재

**요구사항**:
- 사용자 뱃지 표시
- 뱃지 타입: Mentor, Top Contributor, Early Adopter 등

**현재 상태**:
- UI에 뱃지 영역만 존재
- 실제 뱃지 시스템 미구현

**구현 필요 사항**:

```typescript
// 1. Database Schema
// app/shared/db/schema.ts
export const badges = sqliteTable('badges', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(), // Icon name or SVG path
  color: text('color').notNull(), // Hex color code
  criteria: text('criteria', { mode: 'json' }).notNull(), // JSON criteria
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const userBadges = sqliteTable('user_badges', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  badgeId: text('badge_id').notNull().references(() => badges.id, { onDelete: 'cascade' }),
  awardedAt: integer('awarded_at', { mode: 'timestamp' }).notNull(),
  displayOrder: integer('display_order').default(0),
});

// 2. Badge Definitions
// app/services/badges/badge-definitions.ts
export const BADGE_DEFINITIONS = [
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Verified mentor with 5+ completed sessions',
    icon: 'AcademicCapIcon',
    color: '#3B82F6',
    criteria: {
      type: 'mentor_sessions',
      threshold: 5,
    },
  },
  {
    id: 'top-contributor',
    name: 'Top Contributor',
    description: 'Posted 10+ helpful community posts',
    icon: 'StarIcon',
    color: '#F59E0B',
    criteria: {
      type: 'community_posts',
      threshold: 10,
      minUpvotes: 50,
    },
  },
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Joined during beta period',
    icon: 'SparklesIcon',
    color: '#8B5CF6',
    criteria: {
      type: 'signup_date',
      before: '2025-01-01',
    },
  },
  {
    id: 'verified',
    name: 'Verified',
    description: 'Email verified account',
    icon: 'CheckBadgeIcon',
    color: '#10B981',
    criteria: {
      type: 'email_verified',
    },
  },
];

// 3. Badge Award Service
// app/services/badges/award-badge.server.ts
export async function checkAndAwardBadges(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  for (const badgeDef of BADGE_DEFINITIONS) {
    const alreadyAwarded = await db.query.userBadges.findFirst({
      where: and(
        eq(userBadges.userId, userId),
        eq(userBadges.badgeId, badgeDef.id)
      ),
    });

    if (alreadyAwarded) continue;

    const qualifies = await checkBadgeCriteria(user, badgeDef.criteria);

    if (qualifies) {
      await awardBadge(userId, badgeDef.id);
    }
  }
}

async function checkBadgeCriteria(user: any, criteria: any): Promise<boolean> {
  switch (criteria.type) {
    case 'email_verified':
      return user.emailVerified === true;

    case 'signup_date':
      return new Date(user.createdAt) < new Date(criteria.before);

    case 'mentor_sessions':
      const sessionCount = await db
        .select({ count: count() })
        .from(mentoringSessions)
        .where(
          and(
            eq(mentoringSessions.mentorId, user.id),
            eq(mentoringSessions.status, 'completed')
          )
        );
      return sessionCount[0].count >= criteria.threshold;

    case 'community_posts':
      const postStats = await db
        .select({
          count: count(),
          totalUpvotes: sum(communityPosts.upvotes),
        })
        .from(communityPosts)
        .where(eq(communityPosts.authorId, user.id));

      return (
        postStats[0].count >= criteria.threshold &&
        (postStats[0].totalUpvotes || 0) >= criteria.minUpvotes
      );

    default:
      return false;
  }
}

async function awardBadge(userId: string, badgeId: string) {
  await db.insert(userBadges).values({
    id: crypto.randomUUID(),
    userId,
    badgeId,
    awardedAt: new Date(),
  });

  // Optional: Send notification to user
  await notifyBadgeAwarded(userId, badgeId);
}

// 4. Update Profile Component
// app/features/profile/components/ProfileBadges.tsx
export function ProfileBadges({ userId }: { userId: string }) {
  const userBadges = useLoaderData<typeof loader>();

  if (userBadges.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Badges</h3>
      <div className="flex flex-wrap gap-2">
        {userBadges.map((badge) => (
          <div
            key={badge.id}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
            style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
            title={badge.description}
          >
            <Icon name={badge.icon} className="h-4 w-4" />
            <span className="font-medium">{badge.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**우선순위**: High
**예상 작업량**: 1.5일

---

### 1.2 Real Activity Counts (FR-006, FR-007)
**상태**: ❌ 플레이스홀더만 존재

**요구사항**:
- 실제 데이터베이스에서 활동 카운트 조회
- 세션 수, 게시글 수, 댓글 수

**현재 상태**:
- 하드코딩된 값 (0 sessions, 0 posts)

**구현 필요 사항**:

```typescript
// app/features/profile/services/activity-stats.server.ts
export async function getUserActivityStats(userId: string) {
  const [
    mentoringSessions,
    communityPosts,
    comments,
    menteeReviews,
  ] = await Promise.all([
    // Mentoring sessions (as mentor)
    db
      .select({ count: count() })
      .from(mentoringSessions)
      .where(
        and(
          eq(mentoringSessions.mentorId, userId),
          eq(mentoringSessions.status, 'completed')
        )
      ),

    // Community posts
    db
      .select({ count: count() })
      .from(communityPosts)
      .where(eq(communityPosts.authorId, userId)),

    // Comments
    db
      .select({ count: count() })
      .from(comments)
      .where(eq(comments.authorId, userId)),

    // Reviews received (as mentee)
    db
      .select({ count: count() })
      .from(mentorReviews)
      .where(eq(mentorReviews.menteeId, userId)),
  ]);

  return {
    mentoringSessions: mentoringSessions[0]?.count || 0,
    communityPosts: communityPosts[0]?.count || 0,
    comments: comments[0]?.count || 0,
    reviews: menteeReviews[0]?.count || 0,
  };
}

// Update Profile Loader
// app/routes/profile.$username.tsx
export async function loader({ params }: LoaderFunctionArgs) {
  const user = await getUserByUsername(params.username);

  if (!user) {
    throw new Response('Not Found', { status: 404 });
  }

  const activityStats = await getUserActivityStats(user.id);
  const badges = await getUserBadges(user.id);

  return json({
    user,
    activityStats,
    badges,
  });
}

// Component
export default function PublicProfile() {
  const { user, activityStats } = useLoaderData<typeof loader>();

  return (
    <div>
      {/* Profile header */}

      {/* Activity Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <StatCard label="Sessions" value={activityStats.mentoringSessions} />
        <StatCard label="Posts" value={activityStats.communityPosts} />
        <StatCard label="Comments" value={activityStats.comments} />
      </div>
    </div>
  );
}
```

**우선순위**: High
**예상 작업량**: 0.5일

---

## 2. 멘토 프로필 강화

### 2.1 Mentor-Specific Fields (FR-015)
**상태**: ❌ 미구현

**요구사항**:
- 멘토 전용 필드: 회사, 경력 년수, 시간당 요금
- 멘토 프로필에만 표시

**구현 필요 사항**:

```typescript
// 1. Database Schema Extension
// app/shared/db/schema.ts
export const mentorProfiles = sqliteTable('mentor_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  company: text('company'),
  jobTitle: text('job_title'),
  yearsOfExperience: integer('years_of_experience'),
  hourlyRate: integer('hourly_rate'), // in cents
  bio: text('bio'),
  specialties: text('specialties', { mode: 'json' }), // Array of specialties
  availability: text('availability', { mode: 'json' }), // Weekly schedule
  languages: text('languages', { mode: 'json' }), // Supported languages
  timezone: text('timezone'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 2. Mentor Profile Component
// app/features/profile/components/MentorProfileSection.tsx
export function MentorProfileSection({ mentorProfile }: { mentorProfile: MentorProfile }) {
  return (
    <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <AcademicCapIcon className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold text-blue-900">Mentor Profile</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Company */}
        <div>
          <label className="text-sm text-gray-600">Company</label>
          <p className="font-medium">{mentorProfile.company}</p>
        </div>

        {/* Job Title */}
        <div>
          <label className="text-sm text-gray-600">Position</label>
          <p className="font-medium">{mentorProfile.jobTitle}</p>
        </div>

        {/* Years of Experience */}
        <div>
          <label className="text-sm text-gray-600">Experience</label>
          <p className="font-medium">{mentorProfile.yearsOfExperience} years</p>
        </div>

        {/* Hourly Rate */}
        <div>
          <label className="text-sm text-gray-600">Rate</label>
          <p className="font-medium">
            ${(mentorProfile.hourlyRate / 100).toFixed(2)}/hour
          </p>
        </div>
      </div>

      {/* Specialties */}
      <div className="mt-4">
        <label className="text-sm text-gray-600 block mb-2">Specialties</label>
        <div className="flex flex-wrap gap-2">
          {mentorProfile.specialties.map((specialty: string) => (
            <span
              key={specialty}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="mt-4">
        <label className="text-sm text-gray-600 block mb-2">About</label>
        <p className="text-gray-700">{mentorProfile.bio}</p>
      </div>

      {/* Book Session CTA */}
      <Link
        to={`/mentors/${mentorProfile.userId}/book`}
        className="mt-6 block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700"
      >
        Book a Session
      </Link>
    </div>
  );
}

// 3. Update Profile Loader
export async function loader({ params }: LoaderFunctionArgs) {
  const user = await getUserByUsername(params.username);

  // Check if user is a mentor
  const mentorProfile = await db.query.mentorProfiles.findFirst({
    where: and(
      eq(mentorProfiles.userId, user.id),
      eq(mentorProfiles.isActive, true)
    ),
  });

  return json({
    user,
    mentorProfile, // null if not a mentor
    activityStats: await getUserActivityStats(user.id),
  });
}
```

**우선순위**: High
**예상 작업량**: 1일

---

### 2.2 Mentor Reviews Display (FR-016, FR-017)
**상태**: ❌ 미구현

**요구사항**:
- 최근 3개 리뷰 표시
- 평균 평점 계산
- 리뷰 표시 여부 토글

**구현 필요 사항**:

```typescript
// 1. Fetch Mentor Reviews
// app/services/mentors/get-mentor-reviews.server.ts
export async function getMentorReviews(mentorId: string, limit = 3) {
  const reviews = await db.query.mentorReviews.findMany({
    where: eq(mentorReviews.mentorId, mentorId),
    orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
    limit,
    with: {
      mentee: {
        columns: {
          id: true,
          displayName: true,
          avatarThumbnailUrl: true,
        },
      },
    },
  });

  return reviews;
}

export async function getMentorRating(mentorId: string) {
  const result = await db
    .select({
      averageRating: avg(mentorReviews.rating),
      totalReviews: count(),
    })
    .from(mentorReviews)
    .where(eq(mentorReviews.mentorId, mentorId));

  return {
    averageRating: result[0]?.averageRating || 0,
    totalReviews: result[0]?.totalReviews || 0,
  };
}

// 2. Review Component
// app/features/profile/components/MentorReviews.tsx
export function MentorReviews({
  mentorId,
  showReviews = true,
}: {
  mentorId: string;
  showReviews: boolean;
}) {
  const { reviews, rating } = useLoaderData<typeof loader>();

  if (!showReviews) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">Reviews are hidden by this mentor</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Rating Summary */}
      <div className="flex items-center gap-4 mb-6">
        <div className="text-4xl font-bold">{rating.averageRating.toFixed(1)}</div>
        <div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(rating.averageRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Based on {rating.totalReviews} reviews
          </p>
        </div>
      </div>

      {/* Recent Reviews */}
      <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 bg-white border rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={review.mentee.avatarThumbnailUrl || '/default-avatar.png'}
                alt={review.mentee.displayName}
                className="h-10 w-10 rounded-full"
              />
              <div>
                <p className="font-medium">{review.mentee.displayName}</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {rating.totalReviews > 3 && (
        <Link
          to={`/mentors/${mentorId}/reviews`}
          className="mt-4 block text-blue-600 hover:underline"
        >
          View all {rating.totalReviews} reviews →
        </Link>
      )}
    </div>
  );
}
```

**우선순위**: High
**예상 작업량**: 1일

---

### 2.3 Auto-Update Rating (FR-018)
**상태**: ❌ 미구현

**요구사항**:
- 새 리뷰 작성 시 1시간 내 평점 업데이트
- 평균 평점 재계산

**구현 필요 사항**:

```typescript
// 1. Rating Calculation Service
// app/services/mentors/update-mentor-rating.server.ts
export async function updateMentorRating(mentorId: string) {
  const result = await db
    .select({
      averageRating: avg(mentorReviews.rating),
      totalReviews: count(),
    })
    .from(mentorReviews)
    .where(eq(mentorReviews.mentorId, mentorId));

  const averageRating = result[0]?.averageRating || 0;
  const totalReviews = result[0]?.totalReviews || 0;

  // Update mentor profile
  await db
    .update(mentorProfiles)
    .set({
      averageRating,
      totalReviews,
      updatedAt: new Date(),
    })
    .where(eq(mentorProfiles.userId, mentorId));

  return { averageRating, totalReviews };
}

// 2. Trigger on Review Creation
// app/routes/api.mentors.$mentorId.review.tsx
export async function action({ request, params }: ActionFunctionArgs) {
  const mentorId = params.mentorId!;
  const formData = await request.formData();

  // Create review
  await createMentorReview({
    mentorId,
    rating: Number(formData.get('rating')),
    comment: formData.get('comment') as string,
  });

  // Update rating immediately (or queue for background job)
  await updateMentorRating(mentorId);

  return json({ success: true });
}

// 3. Optional: Background Job for Delayed Update
// app/services/jobs/update-ratings.server.ts
import cron from 'node-cron';

// Run every hour
cron.schedule('0 * * * *', async () => {
  const recentReviews = await db.query.mentorReviews.findMany({
    where: gte(
      mentorReviews.createdAt,
      new Date(Date.now() - 60 * 60 * 1000)
    ),
    columns: {
      mentorId: true,
    },
  });

  const uniqueMentorIds = [...new Set(recentReviews.map((r) => r.mentorId))];

  for (const mentorId of uniqueMentorIds) {
    await updateMentorRating(mentorId);
  }

  console.log(`Updated ratings for ${uniqueMentorIds.length} mentors`);
});
```

**우선순위**: Medium
**예상 작업량**: 0.5일

---

### 2.4 "New Mentor" Badge (FR-019)
**상태**: ❌ 미구현

**요구사항**:
- 5회 미만 세션 완료 멘토에게 "New Mentor" 뱃지 표시

**구현 필요 사항**:

```typescript
// Include in badge system (1.1)
const NEW_MENTOR_BADGE = {
  id: 'new-mentor',
  name: 'New Mentor',
  description: 'New to mentoring (less than 5 sessions)',
  icon: 'SparklesIcon',
  color: '#10B981',
  criteria: {
    type: 'mentor_sessions',
    threshold: 5,
    inverse: true, // Award if BELOW threshold
  },
};

// Badge check logic
async function checkBadgeCriteria(user: any, criteria: any): Promise<boolean> {
  if (criteria.type === 'mentor_sessions') {
    const sessionCount = await getMentorSessionCount(user.id);

    if (criteria.inverse) {
      return sessionCount < criteria.threshold;
    }
    return sessionCount >= criteria.threshold;
  }
  // ...
}

// Auto-remove badge after 5th session
export async function onSessionCompleted(sessionId: string) {
  const session = await getSession(sessionId);
  const sessionCount = await getMentorSessionCount(session.mentorId);

  if (sessionCount >= 5) {
    // Remove "New Mentor" badge
    await db
      .delete(userBadges)
      .where(
        and(
          eq(userBadges.userId, session.mentorId),
          eq(userBadges.badgeId, 'new-mentor')
        )
      );

    // Award "Experienced Mentor" badge
    await awardBadge(session.mentorId, 'experienced-mentor');
  }
}
```

**우선순위**: Medium
**예상 작업량**: 0.25일

---

## 3. URL 및 SEO 개선

### 3.1 URL Slug History and Redirects (FR-028, FR-029)
**상태**: ❌ 미구현

**요구사항**:
- URL slug 변경 시 301 리디렉션
- 이전 slug 기록 유지
- slug 재사용 방지

**구현 필요 사항**:

```typescript
// 1. Database Schema
// app/shared/db/schema.ts
export const userSlugHistory = sqliteTable('user_slug_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 2. Slug Change Handler
// app/services/profile/update-slug.server.ts
export async function updateUserSlug(userId: string, newSlug: string) {
  // Check if slug is available
  const existingSlug = await db.query.userSlugHistory.findFirst({
    where: eq(userSlugHistory.slug, newSlug),
  });

  if (existingSlug) {
    throw new Error('This URL is already taken');
  }

  // Mark current slug as non-primary
  await db
    .update(userSlugHistory)
    .set({ isPrimary: false })
    .where(
      and(
        eq(userSlugHistory.userId, userId),
        eq(userSlugHistory.isPrimary, true)
      )
    );

  // Add new slug as primary
  await db.insert(userSlugHistory).values({
    id: crypto.randomUUID(),
    userId,
    slug: newSlug,
    isPrimary: true,
    createdAt: new Date(),
  });

  // Update user record
  await db.update(users).set({ urlSlug: newSlug }).where(eq(users.id, userId));
}

// 3. Profile Route with Redirect Support
// app/routes/profile.$username.tsx
export async function loader({ params, request }: LoaderFunctionArgs) {
  const { username } = params;

  // Try to find user by current slug
  let user = await db.query.users.findFirst({
    where: eq(users.urlSlug, username),
  });

  if (!user) {
    // Check slug history
    const slugHistory = await db.query.userSlugHistory.findFirst({
      where: eq(userSlugHistory.slug, username),
      with: {
        user: true,
      },
    });

    if (slugHistory && !slugHistory.isPrimary) {
      // Redirect to current slug
      const currentUser = await db.query.users.findFirst({
        where: eq(users.id, slugHistory.userId),
      });

      throw redirect(`/profile/${currentUser!.urlSlug}`, 301); // Permanent redirect
    }

    throw new Response('Not Found', { status: 404 });
  }

  // ... load profile data
  return json({ user });
}
```

**우선순위**: Medium
**예상 작업량**: 0.5일

---

### 3.2 Open Graph Image Optimization (FR-023)
**상태**: ⚠️ 확인 필요

**요구사항**:
- OG 이미지 최소 크기: 1200x630px
- 적절한 화질

**구현 검증**:

```typescript
// app/routes/profile.$username.tsx
export async function loader({ params }: LoaderFunctionArgs) {
  const user = await getUserByUsername(params.username);

  // Generate OG image URL
  let ogImage = user.avatarUrl;

  // If avatar is too small, use default OG image
  if (ogImage) {
    const imageInfo = await getImageDimensions(ogImage);
    if (imageInfo.width < 1200 || imageInfo.height < 630) {
      ogImage = `/og-images/default-profile.jpg`; // Fallback
    }
  } else {
    // Generate dynamic OG image with user info
    ogImage = `/api/og/profile/${user.id}`;
  }

  return json({
    user,
    meta: {
      title: `${user.displayName} | IT-Community`,
      description: user.bio || `View ${user.displayName}'s profile`,
      'og:image': ogImage,
      'og:image:width': '1200',
      'og:image:height': '630',
    },
  });
}

// Optional: Dynamic OG Image Generation
// app/routes/api.og.profile.$userId.tsx
export async function loader({ params }: LoaderFunctionArgs) {
  const user = await getUserById(params.userId);

  // Use @vercel/og or similar to generate dynamic image
  const ogImage = await generateProfileOGImage({
    name: user.displayName,
    bio: user.bio,
    avatar: user.avatarUrl,
  });

  return new Response(ogImage, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
```

**우선순위**: Low
**예상 작업량**: 1일 (동적 이미지 생성 포함)

---

## 4. 구현 우선순위 요약

### High Priority (다음 스프린트)
1. Badge System Integration (1.1)
2. Real Activity Counts (1.2)
3. Mentor-Specific Fields (2.1)
4. Mentor Reviews Display (2.2)

### Medium Priority
1. Auto-Update Rating (2.3)
2. "New Mentor" Badge (2.4)
3. URL Slug History and Redirects (3.1)

### Low Priority
1. Open Graph Image Optimization (3.2)

---

## 5. 테스트 계획

```typescript
describe('Public Profile', () => {
  it('should display real activity counts', async () => {
    const user = await createUserWithActivities({
      sessions: 5,
      posts: 10,
      comments: 20,
    });

    const response = await request(app).get(`/profile/${user.urlSlug}`);

    expect(response.text).toContain('5 sessions');
    expect(response.text).toContain('10 posts');
    expect(response.text).toContain('20 comments');
  });

  it('should redirect old slug to current slug', async () => {
    const user = await createUser({ urlSlug: 'johndoe' });
    await updateUserSlug(user.id, 'john-doe-dev');

    const response = await request(app).get('/profile/johndoe');

    expect(response.status).toBe(301);
    expect(response.headers.location).toBe('/profile/john-doe-dev');
  });

  it('should display mentor profile for mentors only', async () => {
    const mentor = await createMentor();
    const regularUser = await createUser();

    const mentorResponse = await request(app).get(`/profile/${mentor.urlSlug}`);
    expect(mentorResponse.text).toContain('Mentor Profile');

    const userResponse = await request(app).get(`/profile/${regularUser.urlSlug}`);
    expect(userResponse.text).not.toContain('Mentor Profile');
  });

  it('should award badges automatically', async () => {
    const user = await createUser({ emailVerified: true });
    await checkAndAwardBadges(user.id);

    const badges = await getUserBadges(user.id);
    expect(badges).toContainEqual(expect.objectContaining({ badgeId: 'verified' }));
  });
});
```

---

## 6. 데이터베이스 마이그레이션

```sql
-- Mentor profiles
CREATE TABLE IF NOT EXISTS mentor_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company TEXT,
  job_title TEXT,
  years_of_experience INTEGER,
  hourly_rate INTEGER,
  bio TEXT,
  specialties TEXT,
  availability TEXT,
  languages TEXT,
  timezone TEXT,
  is_active INTEGER DEFAULT 1,
  average_rating REAL DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  criteria TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- User badges
CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- Slug history
CREATE TABLE IF NOT EXISTS user_slug_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  is_primary INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- Indexes
CREATE INDEX idx_mentor_profiles_user_id ON mentor_profiles(user_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_slug_history_slug ON user_slug_history(slug);
```

---

## 7. 참고 문서

- [Badge System Design Patterns](https://medium.com/@alexvasserman/designing-a-badge-system-for-your-app-48db2e8b5d4d)
- [URL Slug Best Practices](https://developers.google.com/search/docs/crawling-indexing/url-structure)
- [Open Graph Protocol](https://ogp.me/)
