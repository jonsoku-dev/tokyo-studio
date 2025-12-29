# SPEC 002: Email Verification - Implementation Gaps

## 문서 정보
- **작성일**: 2025-12-28
- **상태**: Critical - 보완 필수
- **우선순위**: Critical

---

## 1. 누락된 핵심 기능 (Critical)

### 1.1 Feature Access Restrictions (FR-003)
**상태**: ❌ 미구현 - **BLOCKING PRODUCTION**

**요구사항**:
미인증 사용자는 다음 기능을 사용할 수 없어야 함:
- ❌ 게시글 작성 (Job Posting)
- ❌ 멘토 예약 (Mentor Booking)
- ❌ 댓글 작성 (Comments)

**현재 상태**:
- 이메일 인증 상태만 DB에 추적
- 실제 기능 제한 없음 → 미인증 사용자도 모든 기능 사용 가능

**구현 필요 사항**:

```typescript
// 1. Middleware for Email Verification Check
// app/services/auth/require-verified-email.server.ts
import { redirect } from 'react-router';
import { requireUser } from './session.server';

export async function requireVerifiedEmail(request: Request) {
  const user = await requireUser(request);

  if (!user.emailVerified) {
    throw redirect('/verify-email/required', {
      headers: {
        'Set-Cookie': await setFlashMessage({
          type: 'error',
          message: 'Please verify your email address to access this feature.',
        }),
      },
    });
  }

  return user;
}

// 2. Apply to Protected Routes
// app/routes/jobs.new.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  await requireVerifiedEmail(request); // 추가
  return json({});
}

// app/routes/mentors.$mentorId.book.tsx
export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireVerifiedEmail(request); // 추가
  const mentorId = params.mentorId!;
  // ...
}

// app/routes/community.$postId.comment.tsx
export async function action({ request }: ActionFunctionArgs) {
  await requireVerifiedEmail(request); // 추가
  // ...
}

// 3. Create User Notice Page
// app/routes/verify-email.required.tsx
export default function VerifyEmailRequired() {
  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h1 className="text-2xl font-bold text-yellow-900 mb-4">
        Email Verification Required
      </h1>
      <p className="text-yellow-800 mb-4">
        You need to verify your email address before you can:
      </p>
      <ul className="list-disc list-inside text-yellow-800 mb-6">
        <li>Post job opportunities</li>
        <li>Book mentoring sessions</li>
        <li>Write comments and participate in discussions</li>
      </ul>
      <p className="text-yellow-800 mb-6">
        We've sent a verification email to <strong>{user.email}</strong>.
        Please check your inbox and click the verification link.
      </p>
      <div className="flex gap-4">
        <form method="post" action="/auth/resend-verification">
          <button
            type="submit"
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Resend Verification Email
          </button>
        </form>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

// 4. UI Blocking for Client-Side Actions
// app/components/CommentForm.tsx
export function CommentForm() {
  const user = useUser();

  if (!user.emailVerified) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800">
          Please <Link to="/verify-email/required" className="underline">verify your email</Link> to comment.
        </p>
      </div>
    );
  }

  return (
    <Form method="post">
      {/* Comment form fields */}
    </Form>
  );
}
```

**적용 대상 Routes**:
```typescript
// 즉시 적용 필요
- app/routes/jobs.new.tsx (게시글 작성)
- app/routes/jobs.$jobId.edit.tsx (게시글 수정)
- app/routes/mentors.$mentorId.book.tsx (멘토 예약)
- app/routes/community.$postId.comment.tsx (댓글 작성)

// 향후 적용 가능
- app/routes/messages.new.tsx (메시지 전송)
- app/routes/reviews.new.tsx (리뷰 작성)
```

**우선순위**: **CRITICAL** - 즉시 구현 필요
**예상 작업량**: 0.5일

---

### 1.2 Read-Only Access Verification (FR-004)
**상태**: ⚠️ 미확인

**요구사항**:
- 미인증 사용자는 로그인 가능
- 읽기 전용 콘텐츠 접근 허용

**확인 필요 사항**:
```typescript
// 다음 페이지들이 미인증 사용자에게 정상 작동하는지 확인:
- /dashboard (대시보드 조회)
- /jobs (채용 공고 목록)
- /jobs/:jobId (채용 공고 상세)
- /mentors (멘토 목록)
- /mentors/:mentorId (멘토 프로필)
- /community (커뮤니티 게시글 목록)
- /community/:postId (게시글 상세)
- /profile/:username (공개 프로필)

// 테스트 시나리오:
1. 미인증 계정으로 로그인
2. 위 모든 페이지 접근 시도
3. 에러 없이 정상 조회 되는지 확인
4. 작성/수정/삭제 버튼은 비활성화 또는 숨김 처리되는지 확인
```

**우선순위**: High
**예상 작업량**: 0.5일 (테스트 및 수정)

---

## 2. 보안 및 안정성 개선

### 2.1 Token Invalidation on New Request
**상태**: ⚠️ 확인 필요

**요구사항**:
- 새 인증 이메일 요청 시 이전 토큰 무효화
- 이메일 인증 성공 시 모든 미사용 토큰 무효화

**현재 구현 검증**:
```typescript
// app/routes/auth.resend-verification.tsx
// 확인 필요:
// 1. 새 토큰 생성 시 기존 토큰 삭제하는지?
// 2. 이메일 인증 완료 시 모든 pending 토큰 삭제하는지?

// 권장 구현:
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);

  // 1. 기존 미사용 토큰 모두 삭제
  await db.delete(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.userId, user.id),
        eq(emailVerificationTokens.used, false)
      )
    );

  // 2. 새 토큰 생성
  const newToken = crypto.randomBytes(32).toString('hex');
  await db.insert(emailVerificationTokens).values({
    id: crypto.randomUUID(),
    userId: user.id,
    token: newToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    used: false,
  });

  // 3. 이메일 발송
  await sendVerificationEmail(user.email, newToken);

  return json({ success: true });
}

// app/routes/auth.verify-email.$token.tsx
export async function loader({ params }: LoaderFunctionArgs) {
  const { token } = params;

  // ... 인증 성공 후
  // 해당 사용자의 모든 토큰 무효화
  await db.delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.userId, userId));
}
```

**우선순위**: Medium
**예상 작업량**: 0.25일

---

### 2.2 Verification Banner/Notice
**상태**: ❌ 미구현

**요구사항**:
- 대시보드 상단에 인증 안내 배너 표시
- 재발송 버튼 포함
- 이메일 인증 완료 시 자동 숨김

**구현 필요 사항**:
```typescript
// app/components/layout/VerificationBanner.tsx
import { Form, useLoaderData } from 'react-router';
import { XMarkIcon } from '@heroicons/react/24/outline';

export function VerificationBanner() {
  const { user } = useLoaderData<typeof rootLoader>();
  const [dismissed, setDismissed] = useState(false);

  if (user.emailVerified || dismissed) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-yellow-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </span>
            <p className="ml-3 font-medium text-yellow-800">
              <span className="inline">
                Please verify your email address to unlock all features.
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Form method="post" action="/auth/resend-verification">
              <button
                type="submit"
                className="text-sm font-medium text-yellow-800 underline hover:text-yellow-900"
              >
                Resend Email
              </button>
            </Form>
            <button
              onClick={() => setDismissed(true)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// app/routes/_layout.tsx (또는 root layout)
export default function Layout() {
  return (
    <div>
      <Navigation />
      <VerificationBanner /> {/* 추가 */}
      <Outlet />
    </div>
  );
}
```

**우선순위**: High
**예상 작업량**: 0.25일

---

## 3. 사용자 경험 개선

### 3.1 Enhanced Email Templates
**상태**: ⚠️ 개선 필요

**현재 상태**:
- 기본 텍스트 이메일

**개선 사항**:
```typescript
// app/services/email/templates/verification-email.html
export const verificationEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    /* Responsive email styles */
  </style>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #333;">Welcome to IT-Community!</h1>
    <p>Thank you for signing up. Please verify your email address to get started.</p>

    <div style="margin: 30px 0;">
      <a
        href="{{verificationUrl}}"
        style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
        "
      >
        Verify Email Address
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      Or copy and paste this link into your browser:<br>
      <a href="{{verificationUrl}}">{{verificationUrl}}</a>
    </p>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      This link will expire in 24 hours.
    </p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

    <p style="color: #999; font-size: 12px;">
      If you didn't create an account, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
`;
```

**우선순위**: Low
**예상 작업량**: 0.5일

---

### 3.2 Email Verification Success Page
**상태**: ⚠️ 개선 필요

**개선 사항**:
```typescript
// app/routes/auth.verify-email.$token.tsx
export default function VerifyEmailSuccess() {
  const { success, error } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h1 className="text-2xl font-bold text-red-900 mb-4">
          Verification Failed
        </h1>
        <p className="text-red-800 mb-6">{error}</p>
        <div className="flex gap-4">
          <Form method="post" action="/auth/resend-verification">
            <button className="px-4 py-2 bg-red-600 text-white rounded">
              Request New Link
            </button>
          </Form>
          <Link to="/dashboard" className="px-4 py-2 bg-gray-200 rounded">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center mb-4">
        <CheckCircleIcon className="h-12 w-12 text-green-600 mr-4" />
        <h1 className="text-2xl font-bold text-green-900">
          Email Verified!
        </h1>
      </div>
      <p className="text-green-800 mb-6">
        Your email has been successfully verified. You now have full access to all features.
      </p>
      <Link
        to="/dashboard"
        className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded hover:bg-green-700"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
```

**우선순위**: Medium
**예상 작업량**: 0.25일

---

## 4. 테스트 계획

### 4.1 Critical Tests (우선)
```typescript
// tests/email-verification/access-control.test.ts
describe('Email Verification Access Control', () => {
  it('should block unverified user from posting jobs', async () => {
    const unverifiedUser = await createUnverifiedUser();
    const response = await request(app)
      .post('/jobs/new')
      .set('Cookie', unverifiedUser.sessionCookie);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/verify-email/required');
  });

  it('should allow unverified user to view jobs', async () => {
    const unverifiedUser = await createUnverifiedUser();
    const response = await request(app)
      .get('/jobs')
      .set('Cookie', unverifiedUser.sessionCookie);

    expect(response.status).toBe(200);
  });

  it('should block unverified user from booking mentors', async () => {
    const unverifiedUser = await createUnverifiedUser();
    const response = await request(app)
      .post('/mentors/123/book')
      .set('Cookie', unverifiedUser.sessionCookie);

    expect(response.status).toBe(302);
  });

  it('should block unverified user from commenting', async () => {
    const unverifiedUser = await createUnverifiedUser();
    const response = await request(app)
      .post('/community/post-123/comment')
      .set('Cookie', unverifiedUser.sessionCookie);

    expect(response.status).toBe(302);
  });
});
```

### 4.2 Security Tests
```typescript
describe('Token Invalidation', () => {
  it('should invalidate old tokens when new verification email is sent', async () => {
    const user = await createUnverifiedUser();
    const oldToken = user.verificationToken;

    // Request new verification email
    await request(app)
      .post('/auth/resend-verification')
      .set('Cookie', user.sessionCookie);

    // Old token should be invalid
    const response = await request(app)
      .get(`/auth/verify-email/${oldToken}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('invalid or expired');
  });
});
```

---

## 5. 구현 우선순위 요약

### Critical (즉시 구현)
1. ✅ **Feature Access Restrictions (1.1)** - BLOCKING
2. ✅ **Verification Banner (2.2)** - UX Critical

### High Priority (다음 스프린트)
1. Read-Only Access Verification (1.2)
2. Enhanced Success/Error Pages (3.2)

### Medium Priority
1. Token Invalidation Verification (2.1)
2. Email Template Enhancement (3.1)

---

## 6. 데이터베이스 마이그레이션

```sql
-- 필요한 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id
  ON email_verification_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token
  ON email_verification_tokens(token);

CREATE INDEX IF NOT EXISTS idx_users_email_verified
  ON users(email_verified);
```

---

## 7. 참고 문서

- [Email Verification Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#email-verification)
- [OWASP Authentication Guidelines](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/04-Authentication_Testing/README)
