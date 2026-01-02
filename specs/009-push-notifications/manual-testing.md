# Push Notification System - Manual Testing Guide

## 개요

이 가이드는 프로덕션 푸시 알림 시스템의 수동 테스트 및 큐 처리 방법을 설명합니다.

---

## 📋 사전 준비

### 1. 환경변수 설정

`.env` 파일에 다음 변수들이 설정되어 있어야 합니다:

```bash
# Push Notifications
VAPID_PUBLIC_KEY=<your-vapid-public-key>
VAPID_PRIVATE_KEY=<your-vapid-private-key>
VAPID_SUBJECT=mailto:admin@example.com

# Cron Job Authentication
CRON_SECRET=<random-secret-for-cron-jobs>
# Generate with: openssl rand -hex 32
```

### 2. VAPID 키 생성 (최초 1회)

```bash
npx web-push generate-vapid-keys
```

출력된 키를 `.env`에 복사합니다.

### 3. CRON_SECRET 생성 (최초 1회)

```bash
openssl rand -hex 32
```

출력된 값을 `.env`의 `CRON_SECRET`에 설정합니다.

---

## 🚀 알림 큐 수동 처리

### 방법 1: npm 스크립트 사용 (추천)

#### 실제 처리 (큐 100개 처리)
```bash
pnpm notifications:process
```

#### Dry-run 모드 (테스트용, 실제 전송 안함)
```bash
pnpm notifications:process:dry
```

**출력 예시**:
```json
{
  "success": true,
  "queue": {
    "processed": 5,
    "failed": 0,
    "skipped": 0,
    "deleted": 2,
    "duration": 1234
  },
  "groups": {
    "processed": 1,
    "failed": 0,
    "duration": 567
  }
}
```

### 방법 2: curl 직접 호출

```bash
curl -X POST http://localhost:5173/api/notifications/process-queue \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "maxBatch=100&dryRun=false"
```

**파라미터**:
- `maxBatch`: 한 번에 처리할 최대 알림 개수 (기본: 100)
- `dryRun`: `true`면 실제 전송 없이 테스트만 (기본: false)

---

## 🧪 테스트 시나리오

### 1. 기본 알림 전송 테스트

```bash
# 1. 서버 실행
pnpm dev

# 2. 브라우저에서 알림 권한 허용
# http://localhost:5173/settings/notifications

# 3. 댓글 작성하여 알림 트리거
# (다른 사용자로 로그인 필요)

# 4. 알림이 즉시 전송되는지 확인
```

### 2. Quiet Hours 테스트

```bash
# 1. 알림 설정에서 Quiet Hours 설정
# 예: 22:00 - 08:00

# 2. Quiet Hours 시간대에 댓글 작성

# 3. 알림이 즉시 전송되지 않는지 확인

# 4. 데이터베이스에서 큐 확인
# SELECT * FROM notification_queue WHERE status='pending';

# 5. 다음날 08:00 이후에 큐 처리
pnpm notifications:process

# 6. 알림이 전송되는지 확인
```

### 3. 알림 그룹핑 테스트

```bash
# 1. 10분 내에 같은 사용자에게 댓글 3개 이상 작성

# 2. 처음 2개는 즉시 전송, 3번째부터는 그룹에 추가됨

# 3. 데이터베이스에서 그룹 확인
# SELECT * FROM notification_groupings WHERE status='pending';

# 4. 10분 후 (windowEnd 이후) 큐 처리
pnpm notifications:process

# 5. 배치 알림 (예: "3 new reply updates") 전송 확인
```

### 4. 재시도 로직 테스트

```bash
# 1. VAPID 키를 일부러 잘못 설정하여 전송 실패 유도

# 2. 알림 트리거

# 3. 큐에서 재시도 카운트 확인
# SELECT retry_count, scheduled_at FROM notification_queue;

# 4. 첫 재시도: 1분 후
# 두 번째 재시도: 5분 후
# 세 번째 재시도: 15분 후

# 5. 3회 실패 후 status='failed' 확인
# SELECT * FROM notification_queue WHERE status='failed';
```

---

## 📊 데이터베이스 조회

### 큐 상태 확인
```sql
-- Pending 알림 (전송 대기)
SELECT * FROM notification_queue 
WHERE status='pending' 
ORDER BY scheduled_at;

-- 실패한 알림
SELECT * FROM notification_queue 
WHERE status='failed' 
ORDER BY created_at DESC;

-- 전체 큐 통계
SELECT 
  status, 
  COUNT(*) as count,
  AVG(retry_count) as avg_retries
FROM notification_queue 
GROUP BY status;
```

### 그룹 상태 확인
```sql
-- Pending 그룹
SELECT * FROM notification_groupings 
WHERE status='pending' 
ORDER BY window_end;

-- 전송된 그룹
SELECT 
  type,
  COUNT(*) as total_groups,
  SUM(count) as total_notifications
FROM notification_groupings 
WHERE status='sent'
GROUP BY type;
```

### 분석 이벤트 로그
```sql
-- 최근 이벤트 (24시간)
SELECT 
  type,
  event,
  COUNT(*) as count
FROM notification_event_log 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY type, event
ORDER BY type, event;

-- 알림 타입별 성공률
SELECT 
  type,
  COUNT(CASE WHEN event='sent' THEN 1 END) as sent,
  COUNT(CASE WHEN event='delivered' THEN 1 END) as delivered,
  COUNT(CASE WHEN event='failed' THEN 1 END) as failed,
  ROUND(
    COUNT(CASE WHEN event='delivered' THEN 1 END)::numeric / 
    NULLIF(COUNT(CASE WHEN event='sent' THEN 1 END), 0) * 100, 
    2
  ) as delivery_rate
FROM notification_event_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY type;
```

---

## 🐛 문제 해결

### 1. "Unauthorized" 오류

**원인**: CRON_SECRET이 잘못 설정됨

**해결**:
```bash
# .env 파일 확인
cat .env | grep CRON_SECRET

# 환경변수 재로드
source .env

# 스크립트 재실행
pnpm notifications:process
```

### 2. "Service unavailable" 오류

**원인**: CRON_SECRET이 설정되지 않음

**해결**:
```bash
# CRON_SECRET 생성
openssl rand -hex 32

# .env에 추가
echo "CRON_SECRET=<generated-secret>" >> .env

# 서버 재시작
pnpm dev
```

### 3. 알림이 전송되지 않음

**체크리스트**:
1. ✅ VAPID 키가 올바르게 설정되었는가?
2. ✅ 브라우저에서 알림 권한을 허용했는가?
3. ✅ Service Worker가 등록되었는가? (DevTools > Application > Service Workers)
4. ✅ 사용자가 푸시 구독을 했는가? (Settings > Notifications)
5. ✅ Quiet Hours 시간대가 아닌가?

**디버깅**:
```bash
# 1. 구독 상태 확인
SELECT * FROM push_subscriptions WHERE user_id='<user-id>';

# 2. 알림 설정 확인
SELECT * FROM notification_preferences WHERE user_id='<user-id>';

# 3. 이벤트 로그 확인
SELECT * FROM notification_event_log 
WHERE user_id='<user-id>' 
ORDER BY created_at DESC 
LIMIT 10;
```

### 4. 큐가 처리되지 않음

**원인**: `scheduledAt`이 미래 시간으로 설정됨

**확인**:
```sql
SELECT 
  id,
  scheduled_at,
  NOW() as current_time,
  scheduled_at - NOW() as time_until_scheduled
FROM notification_queue 
WHERE status='pending'
ORDER BY scheduled_at;
```

**해결**:
```bash
# 시간 지나면 자동으로 처리됨
# 또는 강제로 scheduledAt 업데이트:
# UPDATE notification_queue SET scheduled_at = NOW() WHERE id='<id>';
```

---

## 📈 성능 모니터링

### 처리 속도 측정

```bash
# 100개 처리 시간 측정
time pnpm notifications:process
```

**예상 시간**:
- 큐 100개: ~5초
- 그룹 10개: ~2초

### 메트릭 확인

```sql
-- 평균 전송 시간
SELECT 
  AVG(EXTRACT(EPOCH FROM (delivered.created_at - sent.created_at))) as avg_delivery_seconds
FROM notification_event_log sent
JOIN notification_event_log delivered 
  ON sent.notification_id = delivered.notification_id 
  AND delivered.event = 'delivered'
WHERE sent.event = 'sent'
  AND sent.created_at > NOW() - INTERVAL '24 hours';
```

---

## 🔄 자동화 (추후)

현재는 수동으로 `pnpm notifications:process`를 실행하지만, 나중에는 다음 방법으로 자동화할 수 있습니다:

### 1. GitHub Actions (추천)
- 파일: `.github/workflows-disabled/cron-notifications.yml`
- 활성화: `workflows-disabled` → `workflows`로 이동
- Secrets 설정: `APP_URL`, `CRON_SECRET`

### 2. PM2 Cron
```bash
pm2 start ecosystem.config.js
```

### 3. Systemd Timer (Linux)
```bash
sudo systemctl enable notification-processor.timer
```

---

## 📚 관련 문서

- [Production Spec](./production-spec.md) - 전체 기능 요구사항
- [Implementation Tasks](./implementation-tasks.md) - 구현 태스크
- [Implementation Plan](./implementation_plan.md) - 구현 계획 및 검증

---

## 💡 팁

1. **개발 중**: Dry-run 모드로 테스트
   ```bash
   pnpm notifications:process:dry
   ```

2. **Quiet Hours 무시**: 긴급 알림 테스트 시
   ```typescript
   await orchestrator.trigger({
     ...event,
     options: { skipQuietHours: true }
   });
   ```

3. **큐 초기화**: 테스트 후 큐 정리
   ```sql
   DELETE FROM notification_queue WHERE status='pending';
   DELETE FROM notification_groupings WHERE status='pending';
   ```

4. **로그 확인**: 서버 로그에서 `[QueueProcessor]`, `[GroupProcessor]` 검색
