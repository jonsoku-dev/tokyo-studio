# 개발 규칙 (Development Rules)

본 문서는 **Japan IT Job Platform (Gemini Project)**의 기술 스택과 코딩 컨벤션을 정의합니다.
모든 코드는 이 규칙을 준수해야 합니다.

## 1. 기술 스택 (Tech Stack)
*   **Runtime**: Node.js v20+ / pnpm v9+
*   **Framework**: React 19 + React Router 7 (Framework Mode)
*   **Language**: TypeScript 5.0+ (Strict Mode)
*   **Styling**: Tailwind CSS v4
*   **Icons**: Lucide React
*   **UI Components**: Headless UI (Active Usage Required)
*   **State Management**: 
    *   Server State: React Router `loader` / `action` (**최우선**)
    *   Client State: **Zustand** (필수). React Context 사용 금지.

## 2. 프로젝트 구조 (File Structure)
우리는 **기능 기반(Feature-based) + 공유 모듈(Shared)** 구조를 엄격히 따릅니다.
**`web/app/routes` 디렉토리는 사용하지 않으며, 모든 라우트는 Feature 내부에 위치해야 합니다.**

```
web/app/
├── shared/             # 전역적으로 공유되는 코드
│   ├── components/     # UI 라이브러리 (Atomic, 독립적)
│   └── lib/            # 유틸리티, 훅 (utils, hooks)
├── features/           # 기능별(Domain) 모듈
│   ├── auth/           # [Feature] 인증
│   │   ├── components/ # 인증 전용 컴포넌트
│   │   ├── routes/     # **라우트 파일 위치** (예: login.tsx)
│   │   └── store/      # Zustand Store
│   ├── dashboard/      # [Feature] 대시보드
│   │   └── routes/     # (예: home.tsx)
│   └── pipeline/       # [Feature] 파이프라인
└── routes.ts           # React Router Config (Feature 라우트 매핑 역할)
```

**규칙**:
*   **Feature-First Routing**: 모든 페이지 컴포넌트는 `features/{feature}/routes/`에 위치시킵니다.
*   **routes.ts**: `web/app/routes.ts`에서 각 Feature의 라우트 파일을 import하거나 경로를 지정하여 라우팅을 구성합니다.
*   **Encapsulation**: Feature 내부 구현은 외부로 노출하지 않으며, 필요한 경우 `index.ts`를 통해 공유합니다.

## 3. 코딩 컨벤션 (React & RR7 Lifecycle)

### 3.1. React Router 7 Lifecycle 준수 (Critical)
*   **Data Loading**: 데이터 페칭은 `useEffect`가 아닌 **`loader`**에서 처리합니다.
*   **Data Mutation**: 데이터 변경은 `onClick` 핸들러가 아닌 **`Form`**과 **`action`**을 통해 처리합니다.

### 3.2. 상태 관리 (Zustand)
*   전역 클라이언트 상태(테마, 유저 세션 등)는 반드시 **Zustand**를 사용합니다.
*   Context API는 라이브러리 내부 구현 외에는 비즈니스 로직에 사용하지 않습니다.

### 3.3. 스타일링 (Tailwind)
*   **Utility First**: `style={}` 사용 금지.
*   **clsx/tailwind-merge**: `cn()` 유틸리티 사용 필수.
