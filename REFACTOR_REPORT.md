# 리팩토링 보고서: Admin 구조 개선 및 공통 스키마 통합

## 개요
이 보고서는 `web`과 `admin` 프로젝트 간의 코드 중복을 제거하고, 유지보수성을 높이기 위해 수행된 구조 개선 및 공통 모듈화 작업 내용을 다룹니다.

## 1. Admin 폴더 구조 리팩토링
`admin` 프로젝트의 폴더 구조를 `web` 프로젝트와 동일한 **Feature-based Architecture**로 변경했습니다.

- **기존**: `app/routes`, `app/services` 등의 평면적 구조
- **변경**: `app/features/[기능]/routes`, `app/features/[기능]/services` 구조

### 변경된 구조 예시
```
admin/app/
├── features/
│   ├── auth/
│   ├── content/
│   ├── dashboard/
│   ├── mentoring/
│   └── users/
└── shared/
    └── services/
```
이로 인해 `web`과 `admin` 간의 컨텍스트 스위칭 비용이 감소하고, 코드 일관성이 향상되었습니다.

## 2. 공통 데이터베이스 스키마 모듈화 (`@itcom/db`)
`schema.ts`와 `client.server.ts`가 `web`과 `admin` 양쪽에 중복 존재하던 문제를 해결하기 위해, **pnpm workspace**를 도입하여 공통 패키지로 분리했습니다.

### 적용 내용
1.  **Workspace 설정**: 프로젝트 루트에 `pnpm-workspace.yaml` 추가
2.  **패키지 생성**: `packages/database` (`@itcom/db`) 생성
3.  **파일 이동**:
    - `web/app/shared/db/schema.ts` -> `packages/database/src/schema.ts`
    - `web/app/shared/db/client.server.ts` -> `packages/database/src/client.ts`
4.  **참조 변경**: 양쪽 앱에서 `@itcom/db`를 의존성으로 추가하고 import 구문 일괄 변경

### 사용 방법
이제 양쪽 프로젝트에서 데이터베이스 관련 코드는 다음과 같이 import하여 사용합니다:

```typescript
// Shared Client
import { db } from "@itcom/db/client";

// Shared Schema
import { users, mentorApplications } from "@itcom/db/schema";
```

## 3. 검증 결과
- **Type Check**: `web`, `admin` 모두 `pnpm typecheck` 통과 완료.
- **Migration**: `drizzle.config.ts`가 공통 스키마 경로(`packages/database/src/schema.ts`)를 참조하도록 업데이트됨.

이 리팩토링을 통해 데이터베이스 스키마 변경 시 한 곳(`packages/database`)만 수정하면 양쪽 앱에 즉시 반영되는 **Single Source of Truth**가 확립되었습니다.
