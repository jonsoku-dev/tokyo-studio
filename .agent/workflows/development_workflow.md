---
description: 새로운 기능 개발 또는 프로젝트 초기 설정 시 참고하는 개발 가이드
---
# 개발 워크플로우 (Development Workflow)

> **중요**: 내용이 불확실하거나 최신이 아닐 수 있을 경우, **반드시 공식 문서를 브라우저에서 직접 조회**하여 확인해야 합니다.

## 1. 환경 설정 (Setup)
*   Node.js 22+ 및 pnpm 10+ 설치 확인.
*   루트 디렉토리에서 `pnpm install` 실행.
*   Docker 설치 확인 (PostgreSQL/Redis 실행용).

## 2. 로컬 개발 서버 실행
```bash
# DB/Redis 먼저 실행
docker-compose up -d db redis

# Web (사용자용)
cd web && pnpm dev

# Admin (관리자용)
cd admin && pnpm dev
```

## 3. 새로운 기능 개발 절차

### Step 1: 규칙 확인
1.  `.agent/rules/domain_rules.md` - 도메인/상태 머신 확인.
2.  `.agent/rules/design_rules.md` - UI/UX 규칙 확인.
3.  `.agent/rules/project_rules.md` - React Router v7 API 규칙 확인.

### Step 2: 라우트 추가 (React Router v7)
`app/routes.ts`에 라우트를 정의합니다. **파일 시스템 라우팅이 아닌 Config-based 라우팅**을 사용합니다.
```typescript
import { type RouteConfig, route, index, layout, prefix } from "@react-router/dev/routes";

export default [
  index("./home.tsx"),
  route("about", "./about.tsx"),
  ...prefix("features", [
    route("auth/login", "./features/auth/login.tsx"),
    route("roadmap", "./features/roadmap/index.tsx"),
  ]),
] satisfies RouteConfig;
```
> **참고**: @[.agent/rules/react-router.md] 또는 공식 문서: https://reactrouter.com/start/framework/routing

### Step 3: 로더/액션 구현
라우트 모듈(`*.tsx`)은 `loader`와 `action`을 export합니다. 타입은 자동 생성됩니다.
```typescript
import type { Route } from "./+types/my-route";

export async function loader({ params }: Route.LoaderArgs) {
  // DB 조회 등 서버 로직 (*.server.ts에서 import)
  return { data: ... };
}

export default function Component({ loaderData }: Route.ComponentProps) {
  return <div>{loaderData.data}</div>;
}
```
> **주의**: DB/서버 코드는 반드시 `*.server.ts` 파일로 분리!

### Step 4: UI 컴포넌트 구현
*   위치: `app/features/<도메인>/components/` 또는 `app/shared/ui/`.
*   스타일링: **TailwindCSS v4** (CSS-first). @[.agent/rules/tailwind.md] 참고.

### Step 5: 검증
1.  로컬에서 테스트 (`npx vitest run`).
2.  브라우저에서 수동 확인.
3.  필요시 Playwright E2E 테스트.

## 4. 데이터베이스 변경 (Drizzle ORM)
```bash
# 스키마 수정 후
npx drizzle-kit generate  # 마이그레이션 생성
npx drizzle-kit migrate   # 적용
```
> **참고**: @[.agent/rules/db.md] 또는 공식 문서: https://orm.drizzle.team/docs/get-started-postgresql

## 5. 공식 문서 참조 (Must Research)
불확실한 사항은 다음 문서를 **반드시 브라우저로 직접 조회**하세요:

| 분야 | 공식 문서 URL |
|------|--------------|
| React Router v7 | https://reactrouter.com/start/framework/routing |
| Drizzle ORM | https://orm.drizzle.team/docs/get-started-postgresql |
| TailwindCSS v4 | https://tailwindcss.com/docs/installation/vite |
| Vitest | https://vitest.dev/guide/ |
| Playwright | https://playwright.dev/docs/intro |
