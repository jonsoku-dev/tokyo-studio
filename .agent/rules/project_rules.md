# 프로젝트 규칙 (Project Rules)

## 모노레포 구조
*   **`web`**: 구직자용 (React Router v7).
*   **`admin`**: 관리자용 (React Router v7).
*   **Shared**: DB, Redis, Utils.

## 기술 스택: React Router v7 (Framework Mode)
우리는 React Router v7을 **Framework Mode**로 사용하며, **SSR(Server-Side Rendering)**을 활성화합니다.

### 1. 파일 명명 & 분리 규칙 (Client vs Server)
React Router v7은 서버/클라이언트 코드를 엄격히 분리하지 않으면 번들 사이즈 문제나 서버 코드 누출이 발생할 수 있습니다.

*   **`*.server.ts`**: 서버에서만 실행되는 코드.
    *   DB 직접 접근, 비밀 키 사용 로직.
    *   `loader`, `action`에서만 import하여 사용.
    *   클라이언트 번들에 절대 포함되지 않음.
*   **`*.client.tsx`**: 브라우저에서만 실행되는 코드.
    *   `window`, `document` 접근 로직.
    *   무거운 라이브러리 (차트, 맵 등)는 `client` 확장자를 쓰거나 `SSROnly` 컴포넌트로 감싸야 함.

### 2. 데이터 로딩 & 뮤테이션 (Data Loading & Mutation)
*   **loader**: 데이터 조회 (GET). 병렬로 실행됨.
    *   컴포넌트 렌더링 전에 서버에서 실행.
    *   `useLoaderData`로 데이터 접근.
*   **action**: 데이터 변경 (POST/PUT/DELETE).
    *   Form 제출 시 서버에서 실행.
    *   성공 시 관련된 모든 loader가 자동 재검증(Revalidation)됨.
*   **useFetcher**: 페이지 이동 없이(URL 변경 없이) 데이터 로딩/변경 시 사용.
    *   예: "좋아요" 버튼, 모달 내부 폼 제출.

### 3. 주요 API 사용 규칙
*   **`<Await>`**: Streaming SSR 지원 시 사용. `Suspense`와 함께 사용하여 중요한 데이터는 먼저 보여주고, 느린 데이터는 나중에 스트리밍.
*   **Typing**: `Route.LoaderArgs`, `Route.ActionArgs` 등의 자동 생성 타입을 활용(설정 됨에 따름).

## 코딩 표준
*   **TailwindCSS v4**: 스타일링의 기본.
*   **TypeScript**: Strict 모드 필수.
