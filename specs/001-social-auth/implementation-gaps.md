# SPEC 001: Social Authentication - Implementation Gaps

## 문서 정보
- **작성일**: 2025-12-28
- **상태**: 보완 필요
- **우선순위**: High

---

## 1. 누락된 기능 요구사항

### 1.1 Multiple Social Account Linking (FR-008)
**상태**: ❌ 미구현

**요구사항**:
- 사용자가 하나의 계정에 여러 소셜 제공자를 연결할 수 있어야 함
- 현재는 이메일 기반 자동 연결만 지원

**구현 필요 사항**:
```typescript
// 1. Database Schema 추가
// app/shared/db/schema.ts
export const accountProviders = sqliteTable('account_providers', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider', { enum: ['google', 'github', 'kakao', 'line'] }).notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'), // 암호화 필요
  refreshToken: text('refresh_token'), // 암호화 필요
  tokenExpiresAt: integer('token_expires_at', { mode: 'timestamp' }),
  linkedAt: integer('linked_at', { mode: 'timestamp' }).notNull(),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),

  // Unique constraint
  UNIQUE: unique().on(provider, providerAccountId)
});

// 2. API Endpoints
// POST /api/auth/link/:provider - 추가 소셜 계정 연결
// DELETE /api/auth/unlink/:provider - 소셜 계정 연결 해제
// GET /api/auth/linked-accounts - 연결된 계정 목록 조회

// 3. UI Components
// - Account Settings 페이지에 연결된 소셜 계정 목록
// - "Connect Google/GitHub/Kakao/Line" 버튼
// - 연결 해제 확인 다이얼로그
```

**우선순위**: High
**예상 작업량**: 2-3일

---

### 1.2 Provider Email Fallback (FR-011)
**상태**: ⚠️ 부분 구현

**문제점**:
- Line/Kakao에서 이메일을 제공하지 않는 경우 합성 이메일 생성
- 사용자가 실제 이메일을 입력할 수 없음

**구현 필요 사항**:
```typescript
// 1. Email Input Flow
// app/routes/auth.email-required.tsx
// OAuth 후 이메일이 없는 경우 리디렉션

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  const pendingOAuth = session.get('pendingOAuth');

  if (!pendingOAuth) {
    return redirect('/login');
  }

  return json({ provider: pendingOAuth.provider });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;

  // 1. 이메일 중복 확인
  // 2. 이메일 검증 토큰 발송
  // 3. pendingOAuth 데이터와 함께 사용자 생성
  // 4. 이메일 인증 필요 상태로 설정
}

// 2. Update OAuth Callbacks
// - 이메일 없는 경우 /auth/email-required로 리디렉션
// - pendingOAuth 세션에 provider 정보 저장
```

**우선순위**: High
**예상 작업량**: 1일

---

### 1.3 Account Unlinking (FR-012)
**상태**: ❌ 미구현

**요구사항**:
- 연결된 소셜 계정 해제 기능
- 최소 1개의 인증 수단은 유지되어야 함

**구현 필요 사항**:
```typescript
// app/features/auth/apis/unlink-provider.ts
export async function unlinkProvider({
  userId,
  provider,
}: {
  userId: string;
  provider: string;
}) {
  // 1. 현재 연결된 provider 수 확인
  const linkedProviders = await db.query.accountProviders.findMany({
    where: eq(accountProviders.userId, userId),
  });

  // 2. 비밀번호 설정 여부 확인
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  // 3. Validation: 최소 1개의 인증 수단 보장
  if (linkedProviders.length === 1 && !user.password) {
    throw new Error('Cannot unlink the last authentication method');
  }

  // 4. Provider 삭제
  await db.delete(accountProviders)
    .where(
      and(
        eq(accountProviders.userId, userId),
        eq(accountProviders.provider, provider)
      )
    );

  // 5. Audit log 기록
}

// Validation Rules:
// - 비밀번호가 없고 provider가 1개인 경우: 해제 불가
// - 비밀번호가 있거나 provider가 2개 이상인 경우: 해제 가능
```

**우선순위**: Medium
**예상 작업량**: 0.5일

---

### 1.4 OAuth Token Storage (FR-013)
**상태**: ❌ 미구현

**요구사항**:
- Provider access token 및 refresh token 저장
- 향후 프로필 정보 갱신에 사용

**구현 필요 사항**:
```typescript
// 1. Token Encryption
// app/services/auth/token-encryption.server.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY!; // 32 bytes
const ALGORITHM = 'aes-256-gcm';

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptToken(encryptedToken: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(ivHex, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// 2. Update OAuth Callbacks to Store Tokens
// app/routes/auth.google.callback.tsx (예시)
const encryptedAccessToken = encryptToken(tokens.access_token);
const encryptedRefreshToken = tokens.refresh_token
  ? encryptToken(tokens.refresh_token)
  : null;

await db.insert(accountProviders).values({
  userId: user.id,
  provider: 'google',
  providerAccountId: profile.id,
  accessToken: encryptedAccessToken,
  refreshToken: encryptedRefreshToken,
  tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
  linkedAt: new Date(),
  lastUsedAt: new Date(),
});

// 3. Environment Variables
// .env
TOKEN_ENCRYPTION_KEY=<64-character hex string> # openssl rand -hex 32
```

**보안 고려사항**:
- AES-256-GCM 암호화 사용
- 환경 변수로 암호화 키 관리
- 토큰은 암호화된 상태로만 저장

**우선순위**: High
**예상 작업량**: 1일

---

### 1.5 Profile Refresh from Provider (FR-014)
**상태**: ❌ 미구현

**요구사항**:
- Provider에서 프로필 정보 주기적 갱신
- 로그인 시 프로필 업데이트

**구현 필요 사항**:
```typescript
// app/services/auth/profile-refresh.server.ts
export async function refreshProfileFromProvider({
  userId,
  provider,
}: {
  userId: string;
  provider: string;
}) {
  // 1. 저장된 토큰 조회
  const account = await db.query.accountProviders.findFirst({
    where: and(
      eq(accountProviders.userId, userId),
      eq(accountProviders.provider, provider)
    ),
  });

  if (!account || !account.accessToken) {
    throw new Error('No access token found');
  }

  // 2. 토큰 만료 확인 및 갱신
  if (account.tokenExpiresAt && account.tokenExpiresAt < new Date()) {
    await refreshAccessToken(account);
  }

  // 3. Provider API 호출
  const decryptedToken = decryptToken(account.accessToken);
  const profile = await fetchProfileFromProvider(provider, decryptedToken);

  // 4. 사용자 정보 업데이트
  await db.update(users)
    .set({
      displayName: profile.name,
      avatarUrl: profile.picture,
      // 다른 필드들...
    })
    .where(eq(users.id, userId));

  // 5. lastUsedAt 업데이트
  await db.update(accountProviders)
    .set({ lastUsedAt: new Date() })
    .where(eq(accountProviders.id, account.id));
}

// OAuth Callback에서 호출
// - 로그인 성공 시마다 refreshProfileFromProvider 실행
// - 또는 Background Job으로 주기적 실행 (선택적)
```

**우선순위**: Medium
**예상 작업량**: 1-2일

---

## 2. 보안 및 규정 준수

### 2.1 Authentication Event Logging (FR-016)
**상태**: ❌ 미구현

**구현 필요 사항**:
```typescript
// app/shared/db/schema.ts
export const authenticationLogs = sqliteTable('authentication_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  eventType: text('event_type', {
    enum: ['login_success', 'login_failed', 'account_linked', 'account_unlinked', 'logout']
  }).notNull(),
  provider: text('provider', { enum: ['google', 'github', 'kakao', 'line', 'email'] }),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  metadata: text('metadata', { mode: 'json' }), // 추가 정보 (JSON)
});

// Usage Example
await logAuthEvent({
  userId: user.id,
  eventType: 'login_success',
  provider: 'google',
  ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
  userAgent: request.headers.get('user-agent') || 'unknown',
  metadata: { sessionId: session.id }
});
```

**우선순위**: Medium
**보안 요구사항**: GDPR/CCPA 로그 보존 정책 고려

---

### 2.2 Session Expiration Policy (FR-017)
**상태**: ❌ 미구현

**요구사항**:
- 30일 비활성 시 세션 자동 만료
- 활동 시 자동 연장

**구현 필요 사항**:
```typescript
// app/services/session/session-manager.server.ts
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds
const SESSION_IDLE_TIMEOUT = 30 * 24 * 60 * 60; // 30 days

export async function validateSession(sessionId: string): Promise<boolean> {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });

  if (!session) return false;

  const now = new Date();
  const lastActivity = new Date(session.lastActivityAt);
  const idleTime = (now.getTime() - lastActivity.getTime()) / 1000;

  // Idle timeout check
  if (idleTime > SESSION_IDLE_TIMEOUT) {
    await deleteSession(sessionId);
    return false;
  }

  // Update last activity
  await db.update(sessions)
    .set({ lastActivityAt: now })
    .where(eq(sessions.id, sessionId));

  return true;
}

// Add to sessions schema
export const sessions = sqliteTable('sessions', {
  // ... existing fields
  lastActivityAt: integer('last_activity_at', { mode: 'timestamp' }).notNull(),
});

// Middleware to update lastActivityAt on every request
```

**우선순위**: Medium
**예상 작업량**: 0.5일

---

### 2.3 Security Issue: TypeScript Error Suppression
**상태**: ⚠️ 발견됨

**위치**: `app/routes/auth.google.callback.tsx:6`

**문제**:
```typescript
// @ts-expect-error - This is being used incorrectly
```

**해결 방법**:
```typescript
// Before
// @ts-expect-error
const tokens = await oauth2Client.getToken(code);

// After
const { tokens } = await oauth2Client.getToken(code);
// 또는 적절한 타입 정의 추가
```

**우선순위**: High (타입 안정성 확보)

---

## 3. 구현 우선순위 요약

### Critical (즉시 수정)
1. ✅ TypeScript 오류 수정 (2.3)

### High Priority (다음 스프린트)
1. Multiple Account Linking (1.1)
2. OAuth Token Storage (1.4)
3. Email Fallback (1.2)

### Medium Priority (향후 계획)
1. Profile Refresh (1.5)
2. Account Unlinking (1.3)
3. Event Logging (2.1)
4. Session Expiration (2.2)

---

## 4. 테스트 계획

### 4.1 Unit Tests
```typescript
// Tests needed:
- Token encryption/decryption
- Multiple provider linking logic
- Account unlinking validation
- Session expiration logic
```

### 4.2 Integration Tests
```typescript
// Tests needed:
- Complete OAuth flow with token storage
- Profile refresh from each provider
- Multi-account linking scenario
- Unlinking last provider prevention
```

### 4.3 E2E Tests
```typescript
// Tests needed:
- Link Google account → Link GitHub account → Unlink Google
- OAuth without email → Email input flow
- Session expiration after 30 days
```

---

## 5. 참고 문서

- [OAuth 2.0 Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Token Storage Security](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
