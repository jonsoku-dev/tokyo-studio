# Push Notification System - Architecture Overview

## 핵심 개념

**기본은 실시간 전송입니다.** 알림의 90% 이상은 이벤트 발생 즉시(0.1초 이내) 전송됩니다.

큐 시스템은 실시간 전송이 **불가능하거나 부적절한 특수 상황**에서만 사용되는 보조 메커니즘입니다.

---

## 알림 전송 흐름

### 정상 흐름 (90%+)

```
댓글 작성 (0.0초)
    ↓
orchestrator.trigger() (0.1초)
    ↓
Quiet Hours 확인? → 아니오
    ↓
pushService.sendPushNotification() (0.2초)
    ↓
웹푸시 서버로 전송 (0.3초)
    ↓
사용자 알림 수신 ✅ (0.5초)
```

**결과**: 이벤트 발생 후 **0.5초 이내 실시간 전송**

---

## 큐를 사용하는 3가지 예외 상황

### 1. Quiet Hours (조용한 시간) - 5%

사용자가 방해금지 시간을 설정한 경우 (예: 22:00-08:00)

```
밤 23:00 댓글 작성
    ↓
Quiet Hours 확인? → 예
    ↓
notificationQueue에 추가
    scheduledAt: 다음날 08:00
    ↓
[대기]
    ↓
다음날 08:05 Queue Processor 실행
    ↓
사용자 알림 수신 ✅
```

**목적**: 사용자 수면 방해 방지

---

### 2. 전송 실패 시 재시도 - 2%

푸시 서버 장애 등으로 전송 실패 시

```
댓글 작성
    ↓
webpush.sendNotification() 호출
    ↓
❌ 오류 발생 (500 Server Error)
    ↓
notificationQueue에 추가
    scheduledAt: 현재 + 1분
    retryCount: 1
    ↓
1분 후 Queue Processor 실행
    ↓
재시도 → 성공 ✅
```

**재시도 전략** (Exponential Backoff):
- 1차 실패: 1분 후 재시도
- 2차 실패: 5분 후 재시도  
- 3차 실패: 15분 후 재시도
- 3회 실패 후: `status='failed'` 처리

**목적**: 일시적 장애 대응, 안정성 향상

---

### 3. 알림 그룹핑 - 3%

10분 내 동일 타입 알림이 3개 이상 발생 시

```
0분: 첫 댓글 → 즉시 전송 ✅
2분: 두 번째 댓글 → 즉시 전송 ✅
4분: 세 번째 댓글 → notificationGroupings에 추가 (전송 안함)
6분: 네 번째 댓글 → 그룹 count 증가
    ↓
windowEnd (14분) 도달
    ↓
Group Processor 실행
    ↓
"4 new reply updates" 배치 알림 전송 ✅
```

**목적**: 알림 스팸 방지, UX 개선

---

## 아키텍처 다이어그램

```
┌──────────────────────────────────────────────────────┐
│                    이벤트 발생                        │
│              (댓글, 멘션, 세션 등)                    │
└────────────────────┬─────────────────────────────────┘
                     ↓
              orchestrator.trigger()
                     ↓
        ┌────────────┴────────────┐
        ↓                         ↓
   [정상 케이스 90%+]        [예외 케이스 10%]
        ↓                         ↓
pushService.send()    ┌───────────┴───────────┐
        ↓             ↓           ↓           ↓
   즉시 전송 ✅   Quiet Hours  전송실패   그룹핑 대기
    (0.5초)          ↓           ↓           ↓
                 큐에 추가    큐에 추가   그룹에 추가
                     ↓           ↓           ↓
              ┌──────┴───────────┴───────────┘
              ↓
    Queue/Group Processor (5분마다)
              ↓
         ┌────┴────┐
         ↓         ↓
   큐 처리    그룹 처리
         ↓         ↓
       전송 ✅    전송 ✅
```

---

## 핵심 코드 흐름

### pushService.sendPushNotification()

```typescript
async sendPushNotification(userId, payload, options?) {
  // 1️⃣ Quiet Hours 체크
  if (isQuietHours(userPreferences)) {
    await queueNotification(userId, payload, getQuietHoursEnd());
    return; // 큐에 추가하고 종료
  }

  // 2️⃣ 실시간 전송 시도 (메인 로직)
  const subscriptions = await getSubscriptions(userId);
  
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
      // ✅ 성공 → 끝
    } catch (error) {
      if (isTemporaryError(error)) {
        // 3️⃣ 일시적 오류 → 큐에 추가, 재시도
        await queueForRetry(userId, payload);
      }
    }
  }
}
```

### orchestrator.trigger() (그룹핑 로직)

```typescript
async trigger(event) {
  const config = notificationTriggers[event.type];
  
  // 1️⃣ 그룹핑 필요한지 확인
  if (shouldGroup(event, config)) {
    // 그룹에 추가만 하고 전송 안함
    await addToGroup(event, config);
    return;
  }

  // 2️⃣ 일반 케이스 → 즉시 전송
  await pushService.sendPushNotification(userId, payload);
}
```

---

## 비율 분석

| 상황 | 처리 방식 | 비율 | 지연 시간 |
|------|----------|------|----------|
| 정상 | 실시간 전송 | 90%+ | 0.5초 |
| Quiet Hours | 큐 → 아침 전송 | ~5% | 수 시간 |
| 그룹핑 | 그룹 → 10분 후 | ~3% | 10분 |
| 전송 실패 | 큐 → 재시도 | ~2% | 1-15분 |

---

## Queue Processor의 역할

**Queue Processor는 타이머가 아니라 정리부입니다.**

### 주요 작업

1. **스케줄된 알림 전송**
   - Quiet Hours 종료 후 대기 중인 알림
   - 재시도 대기 중인 알림

2. **Stale 알림 정리**
   - 24시간 이상 된 알림 삭제

3. **실패한 알림 관리**
   - 3회 재시도 후 `status='failed'` 처리

### 실행 주기

- **개발 환경**: 수동 실행 (`pnpm notifications:process`)
- **프로덕션**: 5분마다 자동 실행 (GitHub Actions/Cron)

**왜 5분?**
- 재시도 최소 간격이 1분이므로 충분히 빠름
- 리소스 효율적
- 대부분 알림은 이미 실시간으로 전송됨

---

## Group Processor의 역할

**Group Processor는 배치 알림 전송자입니다.**

### 작업 흐름

1. 만료된 그룹 윈도우 조회 (`windowEnd < 현재시간`)
2. 배치 알림 생성 (예: "5 new reply updates")
3. 전송
4. 그룹 상태 업데이트 (`status='sent'`)

### 실행 주기

Queue Processor와 함께 5분마다 실행

---

## 성능 특성

### 실시간 전송 (90%+ 케이스)

```
평균 지연: 0.5초
P50: 0.3초
P95: 1.0초
P99: 2.0초
```

### 큐 기반 전송 (10% 케이스)

```
Quiet Hours: 수 시간 (의도적)
재시도: 1-15분 (exponential backoff)
그룹핑: 최대 10분 (의도적)
```

---

## 확장성

### 실시간 전송의 확장

- 웹푸시 서버가 병렬 처리
- 사용자당 여러 디바이스 동시 전송
- 비동기 처리로 블로킹 없음

### 큐 처리의 확장

- 배치 처리 (한 번에 100개)
- 실패 시 자동 재시도
- 데이터베이스 인덱스 최적화

---

## 트러블슈팅 가이드

### "알림이 안 와요!"

1. ✅ 실시간 전송 실패 확인
   ```sql
   SELECT * FROM notification_event_log 
   WHERE user_id='<id>' AND event='failed'
   ORDER BY created_at DESC;
   ```

2. ✅ Quiet Hours 확인
   ```sql
   SELECT * FROM notification_preferences 
   WHERE user_id='<id>';
   ```

3. ✅ 큐 대기 확인
   ```sql
   SELECT * FROM notification_queue 
   WHERE user_id='<id>' AND status='pending';
   ```

### "알림이 늦게 와요!"

1. Quiet Hours 설정 확인
2. 그룹핑 여부 확인 (3개 이상 연속 이벤트)
3. Queue Processor 실행 주기 확인

---

## 요약

✅ **실시간이 기본입니다** (90%+)  
📦 **큐는 백업입니다** (10%)  
🎯 **사용자 경험 최적화가 목적입니다**

큐 시스템은:
- 대규모 트래픽 대비가 **아닙니다**
- Quiet Hours, 재시도, 그룹핑을 위한 **보조 메커니즘**입니다
- 실시간 전송의 안정성을 보장하는 **안전망**입니다
