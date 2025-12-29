# SPEC 003: Password Reset Flow - Implementation Gaps

## 문서 정보
- **작성일**: 2025-12-28
- **상태**: 보완 필요
- **우선순위**: High

---

## 1. 누락된 기능 요구사항

### 1.1 Real-time Password Strength Feedback (FR-006)
**상태**: ❌ 미구현

**요구사항**:
- 사용자가 타이핑하는 동안 실시간으로 비밀번호 강도 표시
- 강도 레벨: Weak, Fair, Good, Strong
- 시각적 인디케이터 (색상 바, 텍스트)

**현재 상태**:
- 폼 제출 시에만 검증
- 실시간 피드백 없음

**구현 필요 사항**:

```typescript
// 1. Password Strength Calculator
// app/utils/password-strength.ts
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
  score: number; // 0-4
  strength: PasswordStrength;
  feedback: string[];
  meets: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const meets = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // Calculate score
  let score = 0;
  if (meets.minLength) score++;
  if (meets.hasUppercase) score++;
  if (meets.hasLowercase) score++;
  if (meets.hasNumber) score++;
  if (meets.hasSpecialChar) score++;

  // Determine strength
  let strength: PasswordStrength;
  if (score <= 2) strength = 'weak';
  else if (score === 3) strength = 'fair';
  else if (score === 4) strength = 'good';
  else strength = 'strong';

  // Generate feedback
  const feedback: string[] = [];
  if (!meets.minLength) feedback.push('At least 8 characters required');
  if (!meets.hasUppercase) feedback.push('Add an uppercase letter');
  if (!meets.hasLowercase) feedback.push('Add a lowercase letter');
  if (!meets.hasNumber) feedback.push('Add a number');
  if (!meets.hasSpecialChar) feedback.push('Add a special character for extra security');

  // Check for common weak patterns
  if (/^(?:12345|password|qwerty)/i.test(password)) {
    feedback.push('Avoid common patterns');
    strength = 'weak';
  }

  return { score, strength, feedback, meets };
}

// 2. Client Component with Real-time Feedback
// app/components/PasswordStrengthIndicator.tsx
import { useState, useEffect } from 'react';
import { calculatePasswordStrength } from '~/utils/password-strength';

export function PasswordInput({ name }: { name: string }) {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<ReturnType<typeof calculatePasswordStrength> | null>(null);

  useEffect(() => {
    if (password) {
      setStrength(calculatePasswordStrength(password));
    } else {
      setStrength(null);
    }
  }, [password]);

  const strengthColors = {
    weak: 'bg-red-500',
    fair: 'bg-yellow-500',
    good: 'bg-blue-500',
    strong: 'bg-green-500',
  };

  const strengthWidths = {
    weak: 'w-1/4',
    fair: 'w-1/2',
    good: 'w-3/4',
    strong: 'w-full',
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        New Password
      </label>
      <input
        type="password"
        id={name}
        name={name}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        required
      />

      {/* Strength Indicator */}
      {strength && (
        <div className="mt-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strengthColors[strength.strength]} ${strengthWidths[strength.strength]}`}
            />
          </div>
          <p className="mt-1 text-sm capitalize">
            Strength: <span className="font-medium">{strength.strength}</span>
          </p>

          {/* Requirements Checklist */}
          <ul className="mt-2 space-y-1 text-sm">
            <li className={strength.meets.minLength ? 'text-green-600' : 'text-gray-500'}>
              {strength.meets.minLength ? '✓' : '○'} At least 8 characters
            </li>
            <li className={strength.meets.hasUppercase ? 'text-green-600' : 'text-gray-500'}>
              {strength.meets.hasUppercase ? '✓' : '○'} Uppercase letter
            </li>
            <li className={strength.meets.hasLowercase ? 'text-green-600' : 'text-gray-500'}>
              {strength.meets.hasLowercase ? '✓' : '○'} Lowercase letter
            </li>
            <li className={strength.meets.hasNumber ? 'text-green-600' : 'text-gray-500'}>
              {strength.meets.hasNumber ? '✓' : '○'} Number
            </li>
          </ul>

          {/* Feedback Messages */}
          {strength.feedback.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              <p className="font-medium">Suggestions:</p>
              <ul className="list-disc list-inside">
                {strength.feedback.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 3. Update Reset Password Form
// app/routes/auth.reset-password.$token.tsx
export default function ResetPassword() {
  return (
    <Form method="post">
      <PasswordInput name="password" /> {/* 교체 */}
      <PasswordInput name="confirmPassword" />
      <button type="submit">Reset Password</button>
    </Form>
  );
}
```

**우선순위**: Medium
**예상 작업량**: 1일

---

### 1.2 Enhanced Security Notification (FR-010)
**상태**: ⚠️ 부분 구현

**요구사항**:
- 비밀번호 변경 후 알림 이메일 발송
- **누락**: IP 주소, 디바이스 정보, 타임스탬프 포함
- **누락**: 계정 보안 가이드 링크

**현재 상태**:
- 기본 알림 이메일만 발송
- 상세 정보 부족

**구현 필요 사항**:

```typescript
// 1. Enhanced Email Template
// app/services/email/templates/password-changed.html
export const passwordChangedTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 20px;">
      <h2 style="margin: 0; color: #991b1b;">Password Changed</h2>
    </div>

    <p>Hello <strong>{{userName}}</strong>,</p>

    <p>Your password was successfully changed on <strong>{{timestamp}}</strong>.</p>

    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Security Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">IP Address:</td>
          <td style="padding: 8px 0; font-weight: 600;">{{ipAddress}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Location:</td>
          <td style="padding: 8px 0; font-weight: 600;">{{location}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Device:</td>
          <td style="padding: 8px 0; font-weight: 600;">{{device}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Browser:</td>
          <td style="padding: 8px 0; font-weight: 600;">{{browser}}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-weight: 600;">Didn't make this change?</p>
      <p style="margin: 8px 0 0 0;">
        If you didn't change your password, someone else may have accessed your account.
        <a href="{{accountSecurityUrl}}" style="color: #2563eb; text-decoration: none;">
          Secure your account immediately →
        </a>
      </p>
    </div>

    <h3>Account Security Tips</h3>
    <ul style="color: #4b5563;">
      <li>Use a unique password for each of your accounts</li>
      <li>Enable two-factor authentication (coming soon)</li>
      <li>Never share your password with anyone</li>
      <li>Use a password manager to generate and store strong passwords</li>
    </ul>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">
        Need help? Visit our <a href="{{helpCenterUrl}}" style="color: #2563eb;">Help Center</a>
        or contact <a href="mailto:{{supportEmail}}" style="color: #2563eb;">{{supportEmail}}</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

// 2. Extract Device/Browser Info
// app/utils/user-agent-parser.ts
import UAParser from 'ua-parser-js';

export function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: `${result.browser.name} ${result.browser.version}`,
    device: result.device.type || 'Desktop',
    os: `${result.os.name} ${result.os.version}`,
  };
}

// 3. IP Geolocation (Optional)
// app/utils/ip-geolocation.ts
export async function getLocationFromIP(ip: string): Promise<string> {
  try {
    // Using ipapi.co free tier (no API key needed)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return `${data.city}, ${data.country_name}`;
  } catch {
    return 'Unknown';
  }
}

// 4. Update Password Reset Handler
// app/routes/auth.reset-password.$token.tsx
export async function action({ request, params }: ActionFunctionArgs) {
  // ... existing validation

  // Extract request metadata
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  const { browser, device, os } = parseUserAgent(userAgent);
  const location = await getLocationFromIP(ipAddress);

  // Update password
  await updatePassword(user.id, hashedPassword);

  // Send enhanced notification
  await sendPasswordChangedEmail({
    to: user.email,
    userName: user.displayName,
    timestamp: new Date().toLocaleString(),
    ipAddress,
    location,
    device: `${device} (${os})`,
    browser,
    accountSecurityUrl: `${process.env.APP_URL}/settings/security`,
    helpCenterUrl: `${process.env.APP_URL}/help`,
    supportEmail: 'support@itcommunity.com',
  });

  return redirect('/login');
}
```

**우선순위**: Medium
**예상 작업량**: 1일

---

### 1.3 Rate Limiting Implementation (FR-008)
**상태**: ❌ 미구현 - **SECURITY CRITICAL**

**요구사항**:
- 동일 이메일로 시간당 최대 3회 요청 제한
- 브루트 포스 공격 방지

**현재 상태**:
- 무제한 요청 가능 → 보안 취약점

**구현 필요 사항**:

```typescript
// 1. Rate Limiter Service
// app/services/rate-limit/password-reset-limiter.server.ts
import { db } from '~/shared/db';
import { passwordResetAttempts } from '~/shared/db/schema';
import { and, eq, gte } from 'drizzle-orm';

const MAX_ATTEMPTS = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function checkPasswordResetRateLimit(email: string): Promise<{
  allowed: boolean;
  remainingAttempts: number;
  resetAt: Date | null;
}> {
  const windowStart = new Date(Date.now() - WINDOW_MS);

  // Count recent attempts
  const attempts = await db.query.passwordResetAttempts.findMany({
    where: and(
      eq(passwordResetAttempts.email, email.toLowerCase()),
      gte(passwordResetAttempts.attemptedAt, windowStart)
    ),
    orderBy: (attempts, { desc }) => [desc(attempts.attemptedAt)],
  });

  const attemptCount = attempts.length;
  const allowed = attemptCount < MAX_ATTEMPTS;
  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - attemptCount);

  let resetAt: Date | null = null;
  if (!allowed && attempts[0]) {
    resetAt = new Date(attempts[0].attemptedAt.getTime() + WINDOW_MS);
  }

  return { allowed, remainingAttempts, resetAt };
}

export async function recordPasswordResetAttempt(email: string, ipAddress: string) {
  await db.insert(passwordResetAttempts).values({
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    ipAddress,
    attemptedAt: new Date(),
  });
}

export async function cleanupOldAttempts() {
  const cutoff = new Date(Date.now() - WINDOW_MS);
  await db.delete(passwordResetAttempts)
    .where(gte(passwordResetAttempts.attemptedAt, cutoff));
}

// 2. Database Schema
// app/shared/db/schema.ts
export const passwordResetAttempts = sqliteTable('password_reset_attempts', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  ipAddress: text('ip_address').notNull(),
  attemptedAt: integer('attempted_at', { mode: 'timestamp' }).notNull(),
});

export const passwordResetAttemptsIndex = index('idx_password_reset_attempts_email')
  .on(passwordResetAttempts.email);

// 3. Apply to Forgot Password Route
// app/routes/auth.forgot-password.tsx
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;

  // Rate limit check
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rateLimit = await checkPasswordResetRateLimit(email);

  if (!rateLimit.allowed) {
    const minutesUntilReset = Math.ceil(
      (rateLimit.resetAt!.getTime() - Date.now()) / 60000
    );

    return json(
      {
        error: `Too many reset attempts. Please try again in ${minutesUntilReset} minutes.`,
      },
      { status: 429 }
    );
  }

  // Record attempt
  await recordPasswordResetAttempt(email, ipAddress);

  // Continue with existing logic
  const user = await findUserByEmail(email);

  if (user) {
    await sendPasswordResetEmail(user);
  }

  // Always return success to prevent email enumeration
  return json({
    success: true,
    message: 'If an account exists, a reset link has been sent.',
    remainingAttempts: rateLimit.remainingAttempts - 1,
  });
}

// 4. Cleanup Job (run periodically)
// app/services/jobs/cleanup-rate-limits.server.ts
import cron from 'node-cron';

// Run every hour
cron.schedule('0 * * * *', async () => {
  await cleanupOldAttempts();
  console.log('Cleaned up old password reset attempts');
});
```

**우선순위**: **HIGH** - 보안 필수
**예상 작업량**: 0.5일

---

### 1.4 Weak Password Detection (FR-005 Enhancement)
**상태**: ⚠️ 부분 구현

**요구사항**:
- 기본 요구사항 (8자, 대소문자, 숫자) 구현됨 ✅
- **누락**: 일반적인 약한 패턴 차단
  - Sequential numbers (12345678)
  - Keyboard patterns (qwerty, asdfgh)
  - Common passwords (password123)

**구현 필요 사항**:

```typescript
// app/utils/password-validation.ts
const COMMON_PASSWORDS = [
  'password', 'password123', '12345678', '123456789', 'qwerty',
  'abc123', 'monkey', '1234567', 'letmein', 'trustno1',
  'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123',
  'password1', 'qwerty123', 'admin', 'welcome', 'login',
];

const KEYBOARD_PATTERNS = [
  'qwerty', 'qwertyuiop', 'asdfgh', 'asdfghjkl', 'zxcvbn',
  'qazwsx', 'qweasd', '1qaz2wsx',
];

export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Basic requirements
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Weak pattern detection
  const lowerPassword = password.toLowerCase();

  // Check common passwords
  if (COMMON_PASSWORDS.some(common => lowerPassword.includes(common))) {
    errors.push('Password is too common. Please choose a more unique password.');
  }

  // Check keyboard patterns
  if (KEYBOARD_PATTERNS.some(pattern => lowerPassword.includes(pattern))) {
    errors.push('Avoid keyboard patterns in your password.');
  }

  // Check sequential numbers
  if (/(?:0123|1234|2345|3456|4567|5678|6789|7890)/.test(password)) {
    errors.push('Avoid sequential numbers in your password.');
  }

  // Check repeated characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Avoid repeating the same character multiple times.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Usage in action
export async function action({ request, params }: ActionFunctionArgs) {
  const password = formData.get('password') as string;

  const validation = validatePasswordStrength(password);
  if (!validation.valid) {
    return json(
      { errors: validation.errors },
      { status: 400 }
    );
  }

  // Continue...
}
```

**우선순위**: Medium
**예상 작업량**: 0.5일

---

## 2. 보안 및 규정 준수

### 2.1 Security Event Logging (FR-013)
**상태**: ❌ 미구현

**요구사항**:
- 비밀번호 재설정 요청 로그
- 성공/실패 이벤트 기록
- IP 주소 및 타임스탬프 저장

**구현 필요 사항**:

```typescript
// app/shared/db/schema.ts
export const passwordResetLogs = sqliteTable('password_reset_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  eventType: text('event_type', {
    enum: ['requested', 'completed', 'failed_invalid_token', 'failed_expired_token']
  }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

// Usage
await logPasswordResetEvent({
  userId: user?.id,
  email,
  eventType: 'requested',
  ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
  userAgent: request.headers.get('user-agent') || 'unknown',
});
```

**우선순위**: Medium
**예상 작업량**: 0.5일

---

## 3. 사용자 경험 개선

### 3.1 Token Expiration User Feedback
**상태**: ⚠️ 개선 필요

**개선 사항**:
```typescript
// app/routes/auth.reset-password.$token.tsx
export async function loader({ params }: LoaderFunctionArgs) {
  const { token } = params;

  const resetToken = await db.query.passwordResetTokens.findFirst({
    where: eq(passwordResetTokens.token, token),
  });

  if (!resetToken) {
    return json(
      { error: 'Invalid reset link. Please request a new password reset.' },
      { status: 400 }
    );
  }

  if (resetToken.expiresAt < new Date()) {
    const expiredMinutesAgo = Math.floor(
      (Date.now() - resetToken.expiresAt.getTime()) / 60000
    );

    return json(
      {
        error: 'This reset link expired',
        expiredAt: resetToken.expiresAt,
        expiredMinutesAgo,
        canRequestNew: true,
      },
      { status: 400 }
    );
  }

  return json({ valid: true });
}

// Component
export default function ResetPassword() {
  const data = useLoaderData<typeof loader>();

  if (data.error) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-red-50 rounded-lg">
        <h1 className="text-2xl font-bold text-red-900 mb-4">
          {data.expiredAt ? 'Link Expired' : 'Invalid Link'}
        </h1>
        <p className="text-red-800 mb-4">{data.error}</p>
        {data.expiredAt && (
          <p className="text-sm text-red-700 mb-6">
            This link expired {data.expiredMinutesAgo} minutes ago.
            Reset links are valid for 1 hour after being sent.
          </p>
        )}
        <Link
          to="/auth/forgot-password"
          className="block w-full px-4 py-2 bg-red-600 text-white text-center rounded"
        >
          Request New Reset Link
        </Link>
      </div>
    );
  }

  // Show password reset form
}
```

**우선순위**: Low
**예상 작업량**: 0.25일

---

## 4. 구현 우선순위 요약

### Critical (즉시 구현)
1. ✅ **Rate Limiting (1.3)** - SECURITY CRITICAL

### High Priority (다음 스프린트)
1. Real-time Password Strength Feedback (1.1)
2. Weak Password Detection (1.4)

### Medium Priority
1. Enhanced Security Notification (1.2)
2. Security Event Logging (2.1)
3. Token Expiration Feedback (3.1)

---

## 5. 테스트 계획

### 5.1 Security Tests
```typescript
describe('Password Reset Rate Limiting', () => {
  it('should allow 3 requests per hour', async () => {
    for (let i = 0; i < 3; i++) {
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
    }

    // 4th request should be blocked
    const response = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'test@example.com' });

    expect(response.status).toBe(429);
    expect(response.body.error).toContain('Too many reset attempts');
  });

  it('should reset limit after 1 hour', async () => {
    // Use fake timers
    jest.useFakeTimers();

    // Make 3 requests
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' });
    }

    // Advance time by 1 hour
    jest.advanceTimersByTime(60 * 60 * 1000);

    // Should allow new request
    const response = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'test@example.com' });

    expect(response.status).toBe(200);
  });
});

describe('Weak Password Detection', () => {
  it('should reject common passwords', async () => {
    const response = await request(app)
      .post('/auth/reset-password/token123')
      .send({ password: 'password123', confirmPassword: 'password123' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain('Password is too common');
  });

  it('should reject keyboard patterns', async () => {
    const response = await request(app)
      .post('/auth/reset-password/token123')
      .send({ password: 'Qwerty123', confirmPassword: 'Qwerty123' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain('keyboard patterns');
  });
});
```

---

## 6. 데이터베이스 마이그레이션

```sql
-- Rate limiting table
CREATE TABLE IF NOT EXISTS password_reset_attempts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  attempted_at INTEGER NOT NULL
);

CREATE INDEX idx_password_reset_attempts_email
  ON password_reset_attempts(email);

-- Event logging table
CREATE TABLE IF NOT EXISTS password_reset_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('requested', 'completed', 'failed_invalid_token', 'failed_expired_token')),
  ip_address TEXT,
  user_agent TEXT,
  timestamp INTEGER NOT NULL
);

CREATE INDEX idx_password_reset_logs_user_id
  ON password_reset_logs(user_id);

CREATE INDEX idx_password_reset_logs_timestamp
  ON password_reset_logs(timestamp);
```

---

## 7. 참고 문서

- [OWASP Password Reset Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [Common Password List](https://github.com/danielmiessler/SecLists/tree/master/Passwords)
