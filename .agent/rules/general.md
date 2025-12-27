# 일반 아키텍처 규칙 (General Rules)

## 아키텍처 철학: 도메인 주도 & 기능 기반 (Feature-Based)
우리는 기술적 레이어(components, hooks, utils)가 아니라 **기능(Feature)**과 **도메인(Domain)**을 기준으로 코드를 구성합니다.

## 디렉토리 구조 제약 (Directory Constraints)
`app` 디렉토리 하위에는 **반드시** 다음 두 폴더만 최상위로 존재해야 합니다:

1.  **`app/features`**: 도메인별 기능 모듈.
    *   예: `app/features/auth`, `app/features/roadmap`, `app/features/pipeline`.
    *   각 기능 폴더 내부에 해당 기능을 위한 UI, 로직, 쿼리, 타입을 모두 포함합니다.
    *   *이점*: 기능 삭제 시 폴더 하나만 지우면 됩니다 (Colocation).
2.  **`app/shared`**: 여러 기능에서 공통으로 사용하는 재사용 가능한 모듈.
    *   예: `app/shared/ui` (버튼, 인풋), `app/shared/lib` (날짜 포맷팅).

### 금지 사항
*   `app/components`, `app/hooks` 처럼 기술적 분류로 최상위 폴더를 만들지 마세요. `shared` 내부로 이동시키세요.
*   `routes` 폴더는 React Router v7 구조상 필요하다면 두되, 실제 로직은 `features`에서 가져와서 사용해야 합니다. 
    *   라우트 파일은 "껍데기(Shell)" 역할만 하고, 실제 페이지 컴포넌트는 `features`에 위치합니다.

## 언어 규칙
*   **코드 주석**: 한국어 권장 (복잡한 로직 설명 시).
*   **변수명**: 영어 (명확한 의미 전달).
*   **커밋 메시지**: 영어 또는 한국어 (일관성 유지).

## 에이전트 행동 지침
*   항상 이 파일에서 정의된 디렉토리 구조(`features`, `shared`)를 준수하여 파일을 생성/이동하세요.
*   사용자가 별도 지시가 없으면 이 구조를 리팩토링의 기준으로 삼으세요.
