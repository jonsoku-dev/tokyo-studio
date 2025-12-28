# Japan IT Job Platform (Project Gemini)

## Project Overview
**"Japan IT Job"** is a comprehensive platform designed to support Korean IT professionals in their journey to find employment in Japan. It covers the entire lifecycle from preparation to settlement and career growth.

### Core Philosophy
*   **Simple & Intuitive**: "Don't Make Me Think". The interface should be as familiar as Reddit or GitHub.
*   **Operational**: Focus on "Next Actions" and "Outcomes" rather than just information consumption.

---

## Rules & Conventions (Single Source of Truth)

### Route type
example: import type { Route } from "./+types/checkout";
이런 +types을 사용하려면 반드시 typegen 스크립트를 실행하고사용한다.
```sh
pnpm run typegen
```

### Core Principals
*   **Zero-Error Policy**: `lint`, `typecheck`, `build` must pass after every significant step.
*   **Strict Feature Architecture**: Code must be organized by feature (`features/auth`, `features/dashboard`).
*   **Strict Routing**: Routes must be defined in `routes.ts` pointing to feature directories.
*   **API/Page Separation**: APIs must be in `features/*/apis`, Pages in `features/*/routes`.
    *   **Prefix**: API routes must start with `api/` (e.g., `api/auth/google`).
    *   **Order**: Pages first, APIs second in `routes.ts`.

### Detailed Rule Files
*   **General Rules**: [`.agent/rules/general.md`](file:///Users/jongseoklee/Documents/GitHub/itcom/.agent/rules/general.md)
*   **Project Rules**: [`.agent/rules/project_rules.md`](file:///Users/jongseoklee/Documents/GitHub/itcom/.agent/rules/project_rules.md)
*   **Design Rules**: [`.agent/rules/design_rules.md`](file:///Users/jongseoklee/Documents/GitHub/itcom/.agent/rules/design_rules.md)
*   **Development Rules**: [`.agent/rules/development_rules.md`](file:///Users/jongseoklee/Documents/GitHub/itcom/.agent/rules/development_rules.md)
*   **Database Rules (Drizzle)**: [`.agent/rules/db.md`](file:///Users/jongseoklee/Documents/GitHub/itcom/.agent/rules/db.md)
*   **Domain Rules**: [`.agent/rules/domain_rules.md`](file:///Users/jongseoklee/Documents/GitHub/itcom/.agent/rules/domain_rules.md)
*   **Tailwind Rules**: [`.agent/rules/tailwind.md`](file:///Users/jongseoklee/Documents/GitHub/itcom/.agent/rules/tailwind.md)
*   **React Router Rules**: [`.agent/rules/react-router.md`](file:///Users/jongseoklee/Documents/GitHub/itcom/.agent/rules/react-router.md)
*   **TDD Workflow**: [`.agent/rules/tdd.md`](file:///Users/jongseoklee/Documents/GitHub/itcom/.agent/rules/tdd.md)

### Design Aesthetics
*   **Premium Minimalist**: Uses whitespace and typography (Inter/Pretendard) to create a high-quality feel.
*   **Feedback-Oriented**: Every action provides immediate visual feedback (Toast, Transitions).

### UI Patterns
1.  **Feed Cards (Reddit-style)**: Used for Dashboards and Job Listings. Focus on scannability and quick actions (Checkboxes, Status Badges).
2.  **Threaded Detail Views**: Used for Reviews and Comments. Visualizes depth of discussion with vertical lines.
3.  **Activity Dashboards (GitHub-style)**: Visualizes progress (Roadmap) with contribution graphs and clean lists.
4.  **Intuitive Forms**: Simplifies complex inputs (Diagnosis, Resume) using wizards and contextual help.

---

## Tech Stack
*   **Frontend**: React 19, React Router 7, Tailwind CSS v4
*   **Icons**: Lucide React
*   **Interaction**: Headless UI / Radix UI
*   **Database**: PostgreSQL (Docker), Drizzle ORM
*   **Linting/Formatting**: BiomeJS (Zero-Error)

---

## Project Structure
*   `web/`: User-facing application (Remix/RR7)
    *   `app/features/`: Feature-based modules (auth, dashboard, pipeline, etc.)
    *   `app/shared/`: Shared components and utilities
    *   `app/db/`: Database schema and connection
*   `admin/`: Admin dashboard (separate project, TBD)
*   `docs/`: Project documentation and specifications
*   `designs/`: Design references and analysis
*   `.agent/`: AI Agent rules and workflows

## Development Workflows
*   **Local Dev**: `pnpm dev` in `web/` directory.
*   **Database**: `docker compose up -d` (Root) -> `pnpm db:push` (Web)
