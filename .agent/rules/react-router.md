# React Router v7 규칙 (Framework Mode)

## 핵심 원칙
*   **Framework Mode**: SSR 활성화, 서버/클라이언트 코드 분리.
*   **Config-based Routing**: `app/routes.ts`에서 라우트를 명시적으로 정의.
*   **Type-safe**: 자동 생성된 타입(`./+types/<route>`)을 사용.

## 라우트 설정 (`app/routes.ts`)
```typescript
import { 
  type RouteConfig, 
  route, 
  index, 
  layout, 
  prefix 
} from "@react-router/dev/routes";

export default [
  index("./home.tsx"),                          // / (홈)
  route("about", "./about.tsx"),                // /about
  
  layout("./features/auth/layout.tsx", [        // 레이아웃 공유
    route("login", "./features/auth/login.tsx"),
    route("register", "./features/auth/register.tsx"),
  ]),
  
  ...prefix("dashboard", [                      // /dashboard/*
    index("./features/dashboard/home.tsx"),
    route("roadmap", "./features/roadmap/index.tsx"),
    route("pipeline", "./features/pipeline/index.tsx"),
  ]),
] satisfies RouteConfig;
```

## 라우트 모듈 구조
```typescript
// app/features/roadmap/index.tsx
import type { Route } from "./+types/index";
import { getRoadmap } from "./roadmap.server"; // 서버 코드 분리

// 1. Loader (서버에서 실행, GET 요청)
export async function loader({ params, request }: Route.LoaderArgs) {
  const roadmap = await getRoadmap(params.id);
  return { roadmap };
}

// 2. Action (서버에서 실행, POST/PUT/DELETE)
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  // mutation logic
  return { success: true };
}

// 3. Component (클라이언트 렌더링)
export default function RoadmapPage({ loaderData }: Route.ComponentProps) {
  return <div>{loaderData.roadmap.name}</div>;
}

// 4. ErrorBoundary (선택)
export function ErrorBoundary() {
  return <div>오류가 발생했습니다.</div>;
}
```

## 파일 명명 규칙
*   **`*.server.ts`**: 서버에서만 실행. DB 접근, 비밀 키 등.
*   **`*.client.tsx`**: 클라이언트에서만 실행. `window`, `document` 접근.
*   일반 `*.tsx`: 양쪽 렌더링 가능.

## 주요 API
*   **`useLoaderData()`**: loader 데이터 접근 (deprecated, `loaderData` prop 사용 권장).
*   **`useFetcher()`**: 페이지 이동 없이 loader/action 호출.
*   **`<Await>`**: Streaming SSR용 비동기 데이터 렌더링.
*   **`useNavigation()`**: 현재 네비게이션 상태 확인.
*   **`useActionData()`**: action 반환값 접근.

## 공식 문서 (Must Research)
*   **Routing**: https://reactrouter.com/start/framework/routing
*   **Route Module**: https://reactrouter.com/start/framework/route-module
*   **Data Loading**: https://reactrouter.com/start/framework/data-loading
*   **Actions**: https://reactrouter.com/start/framework/actions
*   **Pending UI**: https://reactrouter.com/start/framework/pending-ui
*   **Testing**: https://reactrouter.com/start/framework/testing
