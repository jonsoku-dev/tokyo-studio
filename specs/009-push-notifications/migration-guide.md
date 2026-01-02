# Notification System Migration Guide

이 가이드는 기존 pushService 직접 호출을 NotificationOrchestrator 기반으로 마이그레이션하는 방법을 설명합니다.

---

## 마이그레이션 필요성

**현재 문제점**:
- 알림 로직이 여러 곳에 산재 (community, mentoring 등)
- Quiet Hours, 그룹핑, 분석 없음
- 재시도 로직 없음

**orchestrator를 사용하면**:
- ✅ 중앙집중식 알림 관리
- ✅ 자동 Quiet Hours 처리
- ✅ 자동 그룹핑 및 중복 제거
- ✅ 이벤트 로깅 및 분석
- ✅ 실패 시 자동 재시도

---

## 마이그레이션 패턴

### Before (직접 pushService 호출)

```typescript
// ❌ 구식 방법
await pushService.sendPushNotification(userId, {
  title: "New Reply",
  body: "Someone replied to your comment.",
  url: `/community/${postId}`,
});
```

### After (orchestrator 사용)

```typescript
// ✅ 새 방법
const { notificationOrchestrator } = await import(
  "~/features/notifications/services/orchestrator.server"
);

await notificationOrchestrator.trigger({
  type: "community.reply", // 트리거 설정에 정의된 타입
  userId: targetUserId,
  payload: {
    title: "New Reply",
    body: `${authorName} replied to your comment`,
    url: `/communities/${communitySlug}?highlight=${commentId}`,
    icon: "/icons/comment.png",
  },
  metadata: { // 그룹핑, 분석에 사용
    postId,
    commentId,
    parentId,
    actorId,
    authorName,
    communitySlug,
    eventId: commentId, // 중복 제거 키
  },
});
```

---

## 마이그레이션 체크리스트

### 1. Community 알림 (comments.server.ts)

#### 📍 위치: `web/app/features/community/services/comments.server.ts`

**변경할 코드 2곳**:

#### A. Reply 알림 (라인 82-87)

**기존 코드**:
```typescript
// Send Push Notification
await pushService.sendPushNotification(parent.authorId, {
  title: "New Reply",
  body: "Someone replied to your comment.",
  url: `/community/${data.postId}`,
});
```

**새 코드**:
```typescript
// Get additional data for notification
const post = await db.query.posts.findFirst({
  where: eq(posts.id, data.postId),
  with: { community: { columns: { slug: true } } },
});

const author = await db.query.users.findFirst({
  where: eq(users.id, data.authorId!),
  columns: { name: true },
});

// Trigger notification via orchestrator
const { notificationOrchestrator } = await import(
  "~/features/notifications/services/orchestrator.server"
);

await notificationOrchestrator.trigger({
  type: "community.reply",
  userId: parent.authorId,
  payload: {
    title: "New Reply",
    body: `${author?.name || "Someone"} replied to your comment`,
    url: `/communities/${post?.community?.slug}?highlight=${comment.id}`,
    icon: "/icons/comment.png",
  },
  metadata: {
    postId: data.postId,
    commentId: comment.id,
    parentId: parent.id,
    actorId: data.authorId!,
    authorName: author?.name || "Someone",
    communitySlug: post?.community?.slug || "",
    eventId: comment.id,
  },
});
```

#### B. Mention 알림 (라인 112-117)

**기존 코드**:
```typescript
// Send Push Notification
await pushService.sendPushNotification(profile.userId, {
  title: "New Mention",
  body: "You were mentioned in a comment.",
  url: `/community/${data.postId}`,
});
```

**새 코드**:
```typescript
// Get additional data for notification
const post = await db.query.posts.findFirst({
  where: eq(posts.id, data.postId),
  with: { community: { columns: { slug: true } } },
});

const author = await db.query.users.findFirst({
  where: eq(users.id, data.authorId!),
  columns: { name: true },
});

// Trigger notification via orchestrator
const { notificationOrchestrator } = await import(
  "~/features/notifications/services/orchestrator.server"
);

await notificationOrchestrator.trigger({
  type: "community.mention",
  userId: profile.userId,
  payload: {
    title: "New Mention",
    body: `${author?.name || "Someone"} mentioned you in a comment`,
    url: `/communities/${post?.community?.slug}?highlight=${comment.id}`,
    icon: "/icons/at-sign.png",
  },
  metadata: {
    postId: data.postId,
    commentId: comment.id,
    actorId: data.authorId!,
    authorName: author?.name || "Someone",
    communitySlug: post?.community?.slug || "",
    eventId: comment.id,
  },
});
```

**검증**:
```bash
# 1. 타입 체크
pnpm typecheck

# 2. 포맷
pnpm biome check --write app/features/community/services/comments.server.ts

# 3. 테스트
# - 댓글 작성 시 알림 오는지 확인
# - 멘션(@username) 시 알림 오는지 확인
# - 10분 내 3개 이상 댓글 시 그룹핑 확인
```

---

### 2. Mentoring 알림 (예정)

#### 📍 위치: `web/app/features/mentoring/services/...`

**변경 대상**:
- ` mentoring.session_reminder`: 세션 24시간 전 알림
- `mentoring.booking_accepted`: 예약 승인 알림

**패턴**:
```typescript
await notificationOrchestrator.trigger({
  type: "mentoring.session_reminder",
  userId: mentee.userId,
  payload: {
    title: "Upcoming Session",
    body: `Your session with ${mentor.name} starts in 24 hours`,
    url: `/mentoring/sessions/${sessionId}`,
    icon: "/icons/calendar.png",
  },
  metadata: {
    sessionId,
    mentorId: mentor.id,
    mentorName: mentor.name,
    eventId: sessionId,
  },
});
```

---

### 3. 새로운 알림 추가

기존에 없던 알림 타입을 추가할 때:

#### Step 1: config/triggers.ts에 설정 추가

```typescript
export const notificationTriggers = {
  // ... 기존 설정

  "pipeline.deadline_approaching": {
    enabled: true,
    priority: "high",
    grouping: {
      enabled: false, // 마감 알림은 그룹핑 안함
    },
    skipQuietHours: true, // 조용한 시간 무시
  },
};
```

#### Step 2: types/index.ts에 타입 추가

```typescript
export type NotificationEventName =
  | "community.reply"
  | "community.mention"
  | "mentoring.session_reminder"
  | "mentoring.booking_accepted"
  | "pipeline.deadline_approaching" // ✅ 추가
  | "roadmap.task_due"
  | "payment.completed"
  | "weekly.digest";
```

#### Step 3: 이벤트 발생 시점에서 trigger 호출

```typescript
// 예: 파이프라인 마감 24시간 전
await notificationOrchestrator.trigger({
  type: "pipeline.deadline_approaching",
  userId: item.userId,
  payload: {
    title: "Application Deadline Approaching",
    body: `Your application for ${item.companyName} is due in 24 hours`,
    url: `/pipeline?highlight=${item.id}`,
    icon: "/icons/warning.png",
  },
  metadata: {
    pipelineId: item.id,
    companyName: item.companyName,
    deadline: item.deadline,
    eventId: `deadline-${item.id}`,
  },
});
```

---

## 주요 변경 사항 요약

### 데이터 수집 변경

**기존**: 기본 정보만 전달
```typescript
{
  title: "New Reply",
  body: "Someone replied",
  url: "/community/123"
}
```

**변경 후**: 풍부한 메타데이터
```typescript
{
  payload: { title, body, url, icon },
  metadata: {
    postId, 
    commentId,
    parentId,
    actorId,
    authorName,
    communitySlug,
    eventId // 중복 제거용
  }
}
```

### URL 패턴 변경

**기존**: `/community/${postId}`  
**변경 후**: `/communities/${communitySlug}?highlight=${commentId}`

더 나은 UX를 위해 slug 사용 + 하이라이트 기능

---

## 테스트 시나리오

### 1. 기본 알림 테스트
```bash
# 1. 사용자 A로 로그인
# 2. 댓글 작성
# 3. 사용자 B로 댓글에 답글 작성
# 4. 사용자 A가 알림 받는지 확인
```

### 2. Quiet Hours 테스트
```bash
# 1. 사용자 A: 설정에서 Quiet Hours 설정 (22:00-08:00)
# 2. 밤 11시에 사용자 B가 댓글 작성
# 3. 즉시 알림 오지 않는지 확인
# 4. DB 확인: SELECT * FROM notification_queue WHERE user_id='A';
# 5. 다음날 아침 8시 이후 pnpm notifications:process 실행
# 6. 알림 오는지 확인
```

### 3. 그룹핑 테스트
```bash
# 1. 10분 내에 사용자 A에게 댓글 3개 이상 달기
# 2. 처음 2개는 즉시 전송, 3번째부터는 그룹핑
# 3. DB 확인: SELECT * FROM notification_groupings WHERE user_id='A';
# 4. 10분 후 pnpm notifications:process 실행
# 5. "3 new reply updates" 배치 알림 오는지 확인
```

### 4. 분석 확인
```sql
-- 알림 타입별 성공률
SELECT 
  type,
  COUNT(CASE WHEN event='sent' THEN 1 END) as sent,
  COUNT(CASE WHEN event='delivered' THEN 1 END) as delivered,
  COUNT(CASE WHEN event='failed' THEN 1 END) as failed
FROM notification_event_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY type;
```

---

## 롤백 계획

문제 발생 시 이전 코드로 되돌리는 방법:

```bash
# 1. Git에서 변경 전 버전 확인
git diff app/features/community/services/comments.server.ts

# 2. 롤백
git checkout HEAD -- app/features/community/services/comments.server.ts

# 3. 서버 재시작
pnpm dev
```

---

## 마이그레이션 순서 (권장)

1. ✅ **Community 알림** (reply, mention)
   - 가장 빈번하게 사용
   - 그룹핑 효과 테스트하기 좋음

2. ⬜ **Mentoring 알림** (session_reminder, booking_accepted)
   - 중요도 높음
   - 스케줄 알림 패턴 확립

3. ⬜ **신규 알림** (pipeline, roadmap, payment)
   - 기존에 없던 기능
   - 처음부터 orchestrator 사용

4. ⬜ **Weekly Digest**
   - Cron job으로 실행
   - 배치 처리 패턴

---

## 문제 해결

### "notificationOrchestrator is not defined"
```typescript
// ❌ 잘못된 import
import { notificationOrchestrator } from "...";

// ✅ 올바른 import (dynamic)
const { notificationOrchestrator } = await import(
  "~/features/notifications/services/orchestrator.server"
);
```

### "type is not defined in triggers"
1. `config/triggers.ts`에 타입 추가
2. `types/index.ts`의 `NotificationEventName`에 추가
3. 서버 재시작

### "알림이 즉시 안 와요"
1. Quiet Hours 확인
2. 그룹핑 여부 확인 (3개 이상 연속)
3. 큐 확인: `SELECT * FROM notification_queue;`

---

## 다음 단계

1. ✅ Community 마이그레이션 완료
2. ⬜ Mentoring 마이그레이션
3. ⬜ 신규 알림 추가 (pipeline, roadmap, payment)
4. ⬜ Weekly digest 구현
5. ⬜ 프로덕션 배포
6. ⬜ 모니터링 및 최적화
