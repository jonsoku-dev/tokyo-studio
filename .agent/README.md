# 에이전트 규칙 및 워크플로우 (Agent Rules & Workflows)

이 디렉토리는 AI 에이전트가 따라야 할 규칙과 워크플로우를 정의합니다.

## 규칙 (Rules) - `.agent/rules/`

| 파일 | 설명 | 공식 문서 |
|------|------|----------|
| [general.md](rules/general.md) | 아키텍처 (`app/features`, `app/shared` 구조) | - |
| [project_rules.md](rules/project_rules.md) | React Router v7 SSR 기본 규칙 | - |
| [react-router.md](rules/react-router.md) | React Router v7 상세 API 및 라우팅 | https://reactrouter.com/start/framework/routing |
| [tailwind.md](rules/tailwind.md) | TailwindCSS v4 CSS-first 설정 (**config.ts 금지**) | https://tailwindcss.com/blog/tailwindcss-v4 |
| [domain_rules.md](rules/domain_rules.md) | 10단계 상태 머신, RBAC, 도메인 기능 | docs/기획서.md, docs/MVP.md |
| [design_rules.md](rules/design_rules.md) | 프리미엄 UX, 반응형 디자인 | - |
| [db.md](rules/db.md) | Drizzle ORM + PostgreSQL 설정 | https://orm.drizzle.team/docs/get-started-postgresql |
| [tdd.md](rules/tdd.md) | Kent Beck TDD, Vitest/Playwright | - |

## 워크플로우 (Workflows) - `.agent/workflows/`

| 파일 | 슬래시 명령 | 설명 |
|------|-------------|------|
| [development_workflow.md](workflows/development_workflow.md) | `/development-workflow` | 기능 개발 전체 절차 + 공식 문서 링크 |
| [tdd.md](workflows/tdd.md) | `/tdd` | TDD Red-Green-Refactor 사이클 |
| [deploy.md](workflows/deploy.md) | `/deploy` | Docker 로컬/프로덕션 배포 |

## 공식 문서 참조 (Must Research)
**불확실한 내용은 반드시 브라우저로 직접 조회하세요:**
*   **React Router v7**: https://reactrouter.com/start/framework/routing
*   **TailwindCSS v4**: https://tailwindcss.com/docs/installation/vite
*   **Drizzle ORM**: https://orm.drizzle.team/docs/get-started-postgresql
*   **Vitest**: https://vitest.dev/guide/
*   **Playwright**: https://playwright.dev/docs/intro

## 참고 문서
*   **기획서**: `docs/기획서.md`
*   **MVP 명세**: `docs/MVP.md`