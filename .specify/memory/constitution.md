# Japan IT Job Platform Constitution

<!--
Sync Impact Report:
Version: 1.0.0 → 1.2.0 (MINOR - Added detailed implementation status & admin config requirements)

Modified Principles: N/A
New Sections Added:
  - Detailed implementation status (✅ completed, 🚧 TODO markers)
  - Priority-ordered missing features (Phase 1/2/3)
  - Admin configuration requirements (MUST match web)
  - Development workflow scripts

Version 1.1.0 Changes:
  - Current Implementation Specifications (Monorepo structure, Web/Admin projects)
  - Actual tech stack documentation (Biome, Zustand, React Router 7, Drizzle)

Version 1.0.0 (Initial):
  - Core Principles (5 principles)
  - Technical Standards (Architecture, Database, API Design, Code Quality)
  - User Experience Standards (Interaction Patterns, Responsive Design, Accessibility)
  - Governance (Amendment Process, Versioning Policy, Compliance Review)

Templates Requiring Updates:
  ✅ plan-template.md - No changes needed
  ✅ spec-template.md - No changes needed
  ✅ tasks-template.md - No changes needed

Follow-up TODOs:
  - [ ] Configure admin project with Biome (copy biome.json from web)
  - [ ] Add lint/format scripts to admin/package.json
  - [ ] Verify admin tsconfig.json matches web
  - [ ] Run `pnpm run format` on all admin files
-->

## Core Principles

### I. TypeScript Strictness (NON-NEGOTIABLE)

Strict TypeScript typing MUST be enforced across the entire codebase with zero tolerance for type escape hatches.

**Rules**:
- NO `any` type casting permitted under any circumstances
- NO `@ts-ignore` or `@ts-expect-error` comments without explicit architectural approval
- All functions MUST have explicit return types
- All React components MUST have typed props interfaces
- Third-party libraries without types MUST have custom type declarations

**Rationale**: Type safety prevents runtime errors, improves code maintainability, enables better IDE support, and serves as living documentation. This is especially critical in a production career management platform where data integrity directly impacts user trust.

### II. Test-First Development (MANDATORY)

Test-Driven Development (TDD) is the default development methodology with tests written before implementation.

**Rules**:
- Unit tests MUST be written FIRST for all business logic
- Tests MUST fail before implementation begins (Red-Green-Refactor)
- Integration tests REQUIRED for all API endpoints and database operations
- E2E tests REQUIRED for critical user journeys (auth, payment, mentor booking)
- Minimum test coverage: 80% for services, 60% for components
- All tests MUST pass before merge to main branch

**Rationale**: Tests serve as executable specifications, prevent regressions, enable confident refactoring, and ensure business logic correctness in a platform handling sensitive career data and financial transactions.

### III. Performance-First Architecture

Performance optimization MUST be designed into the architecture from the start, not retrofitted.

**Performance Targets**:
- Time to Interactive (TTI): < 3 seconds on 3G networks
- First Contentful Paint (FCP): < 1.5 seconds
- Largest Contentful Paint (LCP): < 2.5 seconds
- API response time: p95 < 200ms, p99 < 500ms
- Database queries: < 100ms for reads, < 200ms for writes
- Bundle size: Main bundle < 200KB gzipped, lazy-loaded routes < 100KB each

**Required Practices**:
- Code splitting and lazy loading for all routes
- Database query optimization with proper indexes (verified via EXPLAIN)
- Image optimization (WebP/AVIF with fallbacks, responsive sizes)
- Caching strategy (Redis for sessions, browser cache for static assets)
- Performance budgets enforced in CI/CD
- Core Web Vitals monitored in production (PostHog/Sentry)

**Rationale**: Japanese users expect professional-grade performance. Slow platforms reduce trust and conversion rates, especially for career-critical decisions.

### IV. User Experience Consistency

All user interactions MUST follow consistent patterns with immediate, predictable feedback.

**UX Requirements**:
- Optimistic UI updates for all mutations (immediate visual feedback)
- Loading states for all async operations (skeleton screens, spinners)
- Error states with actionable recovery steps (never generic "Error occurred")
- Toast notifications for all user actions (success/failure confirmation)
- Seamless transitions between states (no jarring page reloads)
- Responsive design: Mobile-first with breakpoints at 640px, 1024px, 1440px
- Accessibility: WCAG 2.1 AA compliance minimum (keyboard nav, ARIA labels, color contrast)

**Design System** (Current Implementation):
- **Styling**: TailwindCSS v4 (@tailwindcss/vite)
- **Typography**:
  - Latin: Inter (TODO: configure font)
  - Korean: Pretendard (TODO: configure font)
  - Japanese: Noto Sans JP (TODO: configure font)
- **Spacing**: TailwindCSS default (4px base unit: 1, 2, 4, 6, 8, 12, 16, etc.)
- **Colors**: TailwindCSS default palette (TODO: customize with semantic tokens)
- **Components**:
  - Location: `web/app/shared/components/ui/`
  - Examples: Button, Input, Modal, Toast (TODO: build component library)
  - NO Storybook yet (TODO: add if needed)
- **Icons**: Lucide React (`lucide-react@^0.562.0`)
- **Animation**: Framer Motion (`framer-motion@^12.23.26`)

**Rationale**: Consistency builds trust and reduces cognitive load. Japanese users value polish and attention to detail. A cohesive experience differentiates professional platforms from amateur ones.

### V. Security-First Development

Security MUST be built into every layer with defense-in-depth strategy.

**Security Requirements**:
- Input validation at ALL boundaries (client-side + server-side)
- Parameterized queries ONLY (NO string concatenation in SQL)
- CSRF protection for all state-changing operations
- XSS prevention via Content Security Policy (CSP) headers
- Rate limiting on all public endpoints (auth, API, file uploads)
- Authentication: OAuth 2.0 only (Google, GitHub), NO custom password storage without explicit approval
- Authorization: Role-Based Access Control (RBAC) enforced at middleware layer
- Secrets management: Environment variables ONLY, NO hardcoded credentials
- File uploads: Type validation, size limits, virus scanning, S3 presigned URLs
- Audit logging: All privileged actions (admin, payment, mentor approval) logged with IP/timestamp
- Dependencies: Automated security scanning (npm audit, Dependabot), critical patches within 48 hours

**Prohibited Practices**:
- `eval()` or `Function()` constructors
- `dangerouslySetInnerHTML` without DOMPurify sanitization
- Direct database access from frontend
- Storing PII in browser localStorage (session storage acceptable with encryption)

**Rationale**: The platform handles sensitive career information, payment data, and personal details. Security breaches destroy trust irreparably and expose legal liability.

## Current Implementation Specifications

### Monorepo Structure

The project is organized as a monorepo with two main applications sharing a PostgreSQL database:

```
itcom/
├── web/              # User-facing application (React Router 7 + Zustand)
├── admin/            # Admin dashboard (React Router 7, simplified)
├── docs/             # Product requirements and documentation
├── .specify/         # SpecKit configuration and templates
└── docker-compose.yml # Shared infrastructure
```

**Shared Resources** (MUST be identical):
- **Database**: PostgreSQL (accessed via Drizzle ORM)
- **Schema**: `app/shared/db/schema.ts` (IDENTICAL in both projects - same file content)
- **Configuration Files**:
  - `biome.json` (IDENTICAL - same linting/formatting rules)
  - `tsconfig.json` (IDENTICAL - same TypeScript compiler options)
  - `drizzle.config.ts` (IDENTICAL - same database config)
- **Infrastructure**: Docker Compose for local development
- **Dependencies**: Core dependencies SHOULD match (React Router, Drizzle, TailwindCSS, Biome versions)

### Web Application (`web/`)

**Tech Stack**:
- **Framework**: React 19 + React Router 7
- **State Management**: Zustand (NOT Legend State)
- **Styling**: TailwindCSS v4
- **Linting/Formatting**: Biome (NOT ESLint/Prettier)
- **Database**: Drizzle ORM + PostgreSQL
- **Validation**: Zod + drizzle-zod
- **Payments**: Toss Payments SDK
- **Animation**: Framer Motion
- **3D**: Three.js + React Three Fiber
- **TypeScript**: v5.9+ with `strict: true`

**Feature-Based Architecture**:
```
web/app/
├── features/
│   ├── auth/           # Authentication & authorization
│   │   ├── components/ # Feature-specific UI components
│   │   ├── domain/     # Business logic & types
│   │   ├── hooks/      # React hooks for this feature
│   │   ├── routes/     # Route handlers
│   │   ├── store/      # Zustand stores
│   │   └── utils/      # Feature utilities
│   ├── community/      # Community posts & comments
│   ├── dashboard/      # User dashboard
│   ├── diagnosis/      # Career diagnosis wizard
│   ├── documents/      # Document management (resume, CV)
│   ├── mentoring/      # Mentor booking & sessions
│   ├── payment/        # Payment processing (Toss)
│   ├── pipeline/       # Job application pipeline tracker
│   └── roadmap/        # Roadmap & task management
├── shared/
│   ├── components/
│   │   ├── layout/     # Layout components (Header, Footer, Nav)
│   │   └── ui/         # Reusable UI components (Button, Input, Modal)
│   └── db/
│       ├── client.server.ts  # Database client (server-only)
│       └── schema.ts         # Drizzle schema definitions
├── routes/             # Route files (React Router 7 conventions)
├── root.tsx            # Root layout component
├── routes.ts           # Route configuration
└── app.css             # Global styles
```

**React Router 7 Conventions** (Enforced):
- `*.client.tsx` - Client-side components (React hooks, browser APIs)
- `*.server.tsx` - Server-side components (database access, server actions)
- `*.tsx` - Universal components (no browser/server-specific APIs)
- Server actions for data mutations

**Path Alias**: `~/*` maps to `./app/*` (configured in tsconfig.json)

### Admin Application (`admin/`)

**Tech Stack** (MUST match Web):
- **Framework**: React 19 + React Router 7
- **Styling**: TailwindCSS v4
- **Linting/Formatting**: Biome (SAME as web - REQUIRED)
- **Database**: Drizzle ORM + PostgreSQL (shared with web)
- **State Management**: React state only (no Zustand - simpler requirements)
- **TypeScript**: v5.9+ with `strict: true` (SAME as web)
- **Configuration**: `biome.json`, `tsconfig.json` MUST be identical to web

**Simplified Route-Based Architecture**:
```
admin/app/
├── routes/
│   ├── content/
│   │   └── posts.tsx       # Community content moderation
│   ├── users/
│   │   ├── users.tsx       # User management list
│   │   └── detail.tsx      # User detail view
│   └── home.tsx            # Admin dashboard home
├── shared/
│   └── db/
│       ├── client.server.ts  # Database client (server-only)
│       └── schema.ts         # Same schema as web/
├── root.tsx
├── routes.ts
└── app.css
```

**Architectural Patterns**:
- **Feature-Based Organization** (Web): Each feature is a self-contained module
- **Route-Based Organization** (Admin): Simpler hierarchy for admin tasks
- **Shared Database Schema**: Both projects import from identical schema files
- **Server Actions**: All database mutations via React Router 7 server actions
- **Error Boundary Pattern**: All routes wrapped in error boundaries (TODO: implement)
- **Loading Boundary Pattern**: Suspense boundaries for async components (TODO: implement)

### Implemented Features (Web)

**✅ Fully Implemented** (As of 2025-12-28):

1. **diagnosis/** - Career Diagnosis Wizard (완료)
   - ✅ Wizard UI with branching logic
   - ✅ Scoring algorithm (career readiness calculation)
   - ✅ Recommendation engine (personalized suggestions)
   - ✅ Result page with actionable insights
   - ✅ Job family selection (frontend, backend, mobile, etc.)
   - ✅ Level assessment (junior, mid, senior)
   - ✅ Language proficiency (Japanese: N1-N3, English: Business/Conversational)
   - ✅ Target city selection

2. **payment/** - Payment Processing (완료)
   - ✅ Toss Payments Widget integration
   - ✅ Order creation & validation
   - ✅ Payment success/failure handling
   - ✅ Order tracking (READY, IN_PROGRESS, DONE, CANCELED, ABORTED)
   - ✅ Database schema (payments table with orderId, paymentKey, amount, status)

3. **mentoring/** - Mentoring System (기본 완료)
   - ✅ Database schema (mentors, mentor_availability tables)
   - ✅ Mentor profiles (title, company, bio, hourlyRate)
   - ✅ Mentor scheduler UI (availability management)
   - ✅ Mentor service logic (booking, scheduling)
   - ✅ Approval workflow (isApproved flag, admin can promote users)
   - ✅ Time slot management (day of week + start/end time)
   - 🚧 TODO: Video link generation (Google Meet/Zoom)
   - 🚧 TODO: Review system (post-session ratings)
   - 🚧 TODO: Mentor application form (frontend)

4. **community/** - Community Forum (기본 완료)
   - ✅ Database schema (communityPosts, communityComments)
   - ✅ Markdown editor (react-markdown + remark-gfm)
   - ✅ Post list & create UI
   - ✅ Categories (review, qna, general)
   - 🚧 TODO: Threaded (nested) comments UI
   - 🚧 TODO: Full-text search (PostgreSQL TSV or Algolia)
   - 🚧 TODO: Image upload in Markdown
   - 🚧 TODO: Voting system (upvote/downvote)

5. **auth/** - Authentication & Authorization (기본 완료)
   - ✅ User registration, login, logout
   - ✅ Password hashing (bcryptjs)
   - ✅ Session management
   - ✅ Role-based access control (user, admin)
   - 🚧 TODO: Social login (Google, GitHub OAuth 2.0)
   - 🚧 TODO: Email verification (SendGrid/Resend)
   - 🚧 TODO: Password reset flow
   - 🚧 TODO: Avatar upload (S3 integration)
   - 🚧 TODO: Public profile pages

6. **dashboard/** - User Dashboard (기본 완료)
   - ✅ Task management (pending, completed)
   - ✅ Quick stats overview
   - ✅ Priority system (urgent, normal)
   - ✅ Task categories (Roadmap, Settle Tokyo, Job Hunt)

7. **pipeline/** - Job Application Tracker (기본 완료)
   - ✅ Application tracking (company, position, date)
   - ✅ Stage management (applied → interview → offer → rejected)
   - ✅ Next action planning
   - 🚧 TODO: OG Tag parsing for job URLs (auto-populate company/position)

8. **documents/** - Document Management (기본 완료)
   - ✅ Database schema (documents table)
   - ✅ Document types (Resume, CV, Portfolio)
   - ✅ Versioning (draft, final status)
   - 🚧 TODO: S3 file upload (presigned URLs)
   - 🚧 TODO: PDF viewer integration

9. **roadmap/** - Roadmap & Planning (기본 완료)
   - ✅ Roadmap visualization components
   - ✅ Task categorization
   - ✅ Due date management
   - 🚧 TODO: Integration with Diagnosis results
   - 🚧 TODO: Kanban/Gantt view
   - 🚧 TODO: Google Calendar sync

**✅ Admin Application** (기본 완료):
- ✅ Separate project structure (`/admin`)
- ✅ Shared database & schema with web
- ✅ Dashboard with KPIs (placeholder)
- ✅ User management (list, detail view)
- ✅ User actions (suspend/activate)
- ✅ Content moderation (post list, delete)
- ✅ Mentor promotion action (convert user → mentor)

**🚧 Missing Features** (Priority Order):

### High Priority (Phase 1)
1. **Authentication**
   - [ ] Social login (Google, GitHub OAuth 2.0)
   - [ ] Email verification (SendGrid/Resend API)
   - [ ] Password reset flow (email token)
   - [ ] Avatar upload (S3 integration)

2. **File Storage**
   - [ ] AWS S3 setup & configuration
   - [ ] Presigned URL generation (secure uploads)
   - [ ] Resume/CV upload to S3
   - [ ] PDF viewer integration

3. **Community**
   - [ ] Threaded comments UI & logic
   - [ ] Image upload in Markdown editor
   - [ ] Full-text search (PostgreSQL TSV or Algolia)

### Medium Priority (Phase 2)
4. **Mentoring**
   - [ ] Video link auto-generation (Google Meet/Zoom API)
   - [ ] Post-session review system (ratings + text)
   - [ ] Mentor application form (frontend)

5. **Career Tools**
   - [ ] Roadmap integration with Diagnosis results
   - [ ] Google Calendar API sync
   - [ ] Pipeline OG Tag parsing (auto-fill job details)

### Low Priority (Phase 3)
6. **Settlement Guide** (Tokyo)
   - [ ] D-Day based checklist (arrival date tracking)
   - [ ] Google Maps API integration (city hall, immigration, etc.)
   - [ ] Step-by-step guides (downloadable forms)

7. **Infrastructure**
   - [ ] SEO (dynamic meta tags, sitemap generation)
   - [ ] CI/CD pipeline (GitHub Actions finalization)
   - [ ] Performance monitoring (PostHog/Sentry setup)
   - [ ] Push notifications (browser API)
   - [ ] Community voting system (upvote/downvote)

8. **Admin Project Configuration** (URGENT - MUST match Web)
   - [ ] Add Biome to admin project (`pnpm add -D @biomejs/biome`)
   - [ ] Copy `biome.json` from web to admin (identical configuration)
   - [ ] Add lint/format scripts to admin/package.json
   - [ ] Verify `tsconfig.json` matches web exactly
   - [ ] Verify `drizzle.config.ts` matches web exactly
   - [ ] Add pre-commit hooks if needed (Husky)
   - [ ] Run `pnpm run format` on all admin files
   - [ ] Ensure all core dependency versions match web

### Development Workflow

**Scripts** (Web):
```bash
pnpm run dev          # Start development server (React Router dev)
pnpm run build        # Production build
pnpm run start        # Start production server
pnpm run typecheck    # TypeScript type checking
pnpm run lint         # Biome linting
pnpm run format       # Biome formatting
pnpm run db:push      # Push schema changes to database (Drizzle)
pnpm run db:studio    # Open Drizzle Studio (database GUI)
```

**Scripts** (Admin - MUST match Web):
```bash
pnpm run dev          # Start development server
pnpm run build        # Production build
pnpm run start        # Start production server
pnpm run typecheck    # TypeScript type checking
pnpm run lint         # Biome linting (REQUIRED - same as web)
pnpm run format       # Biome formatting (REQUIRED - same as web)
pnpm run db:push      # Push schema changes (shared DB)
pnpm run db:studio    # Open Drizzle Studio
```

**Database Management**:
```bash
# Development (quick iteration)
pnpm run db:push      # Push schema changes directly (no migration files)

# Production (controlled migrations)
drizzle-kit generate  # Generate migration SQL files
drizzle-kit migrate   # Apply migrations to database

# Inspection
pnpm run db:studio    # Visual database browser (localhost:4983)
```

**Environment Variables** (Required):
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/itcom
# TODO: Add NODE_ENV, AWS_S3_*, TOSS_*, OAUTH_* etc.
```

## Technical Standards

### Architecture & File Organization

**File Naming Conventions** (React Router 7):
- `*.client.tsx` - Client-side components (React hooks, browser APIs)
- `*.server.tsx` - Server-side components (database access, server actions)
- `*.tsx` - Universal components (no browser/server-specific APIs)

**Feature Module Structure** (Web only):
```
features/[feature-name]/
├── components/       # Feature-specific UI components
├── domain/           # Business logic, types, interfaces
├── hooks/            # React hooks (useAuth, useDiagnosis, etc.)
├── routes/           # Route handlers for this feature
├── store/            # Zustand stores (if stateful)
└── utils/            # Pure utility functions
```

**Shared Resources**:
```
shared/
├── components/
│   ├── layout/       # Header, Footer, Navigation
│   └── ui/           # Button, Input, Modal, Toast, etc.
└── db/
    ├── client.server.ts  # Database connection (PostgreSQL)
    └── schema.ts         # Drizzle schema (users, tasks, payments, etc.)
```

### Database Standards

**Current Implementation** (Drizzle ORM + PostgreSQL):

**Schema Design** (Enforced):
- Every table MUST have `id` (UUID, `defaultRandom()`), `createdAt`, `updatedAt`
- **UUID Primary Keys**: `uuid("id").primaryKey().defaultRandom()`
- **Foreign Keys**: Use `.references(() => otherTable.id)` with cascade where appropriate
- **Text Types**: Use `text()` for all strings (including enums - e.g., `status: text("status")`)
- **Timestamps**: `timestamp("created_at").defaultNow()`, `timestamp("updated_at").defaultNow()`
- **Soft Deletes**: Add `deletedAt` column for user-generated content (TODO: implement)
- **Audit Columns**: Add `createdBy`, `updatedBy` for user-modified data (TODO: implement)

**Current Schema Tables**:
```typescript
// app/shared/db/schema.ts
users, tasks, pipelineItems, documents, mentoringSessions,
communityPosts, communityComments, profiles, payments,
mentors, mentorAvailability
```

**Validation with drizzle-zod** (MANDATORY):
```typescript
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
```

**Query Optimization**:
- All queries MUST be profiled with EXPLAIN before production
- N+1 queries PROHIBITED - use eager loading or batching
- Complex queries MUST have covering indexes
- Database migrations MUST be reversible (up + down)

**ORM Usage (Drizzle)**:
- Type-safe queries ONLY (no raw SQL unless performance-critical)
- Schema changes via `drizzle-kit push` (development) or migrations (production)
- NEVER manual ALTER TABLE statements
- Use `drizzle-kit studio` for database inspection

### API Design

**REST Conventions**:
- RESTful endpoints: `/api/[resource]/[id]`
- HTTP methods: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove)
- Status codes: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 422 (Validation Error), 500 (Server Error)
- Pagination: `?page=1&limit=20` (default limit=20, max limit=100)
- Filtering: `?status=active&role=mentor`
- Sorting: `?sort=createdAt&order=desc`

**Response Format**:
```typescript
// Success
{ data: T, meta?: { page, total, hasMore } }

// Error
{ error: { code: string, message: string, details?: unknown } }
```

### Code Quality Standards

**Linting & Formatting** (Current Implementation):

**Web Project**:
- **Biome** (NOT ESLint/Prettier): `@biomejs/biome@2.3.10`
- Configuration: `biome.json` at project root
- Scripts:
  - `pnpm run lint` - Check code quality
  - `pnpm run format` - Auto-format code
- Biome Rules:
  - `"recommended": true`
  - Tab indentation (`"indentStyle": "tab"`)
  - Double quotes (`"quoteStyle": "double"`)
  - Auto-organize imports (`"organizeImports": "on"`)
  - Tailwind CSS support enabled

**Admin Project** (MUST match Web):
- **Biome** (REQUIRED - identical to web configuration)
- Configuration: `biome.json` (copy from web, same rules)
- Scripts:
  - `pnpm run lint` - Check code quality (MANDATORY)
  - `pnpm run format` - Auto-format code (MANDATORY)
- Biome Rules (IDENTICAL to web):
  - `"recommended": true`
  - Tab indentation (`"indentStyle": "tab"`)
  - Double quotes (`"quoteStyle": "double"`)
  - Auto-organize imports (`"organizeImports": "on"`)
  - Tailwind CSS support enabled

**TypeScript**:
- `pnpm run typecheck` - Type checking (React Router typegen + tsc)
- `strict: true` ENFORCED in both projects
- Path alias: `~/*` → `./app/*`

**Build Process**:
- No warnings allowed in production builds
- TypeScript errors MUST be fixed before merge
- Build script: `pnpm run build` (React Router build)

**Code Review Requirements**:
- All PRs MUST have 1+ approval from code owner
- CI MUST pass (typecheck, lint, build)
- No merge to main without passing checks
- PR description MUST link to spec/task

**Naming Conventions** (Enforced):
- **Components**: PascalCase (`UserProfile.tsx`, `LoginForm.tsx`)
- **Functions**: camelCase (`getUserById`, `formatDate`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`, `MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (`User`, `MentorSession`, `PaymentStatus`)
- **Files**:
  - Components: PascalCase (`Button.tsx`, `Header.tsx`)
  - Non-components: kebab-case (`user-service.ts`, `format-utils.ts`)
- **Database columns**: snake_case (`created_at`, `user_id`, `is_approved`)

## User Experience Standards

### Interaction Patterns

**Loading States**:
- Skeleton screens for initial page load (> 200ms)
- Inline spinners for button actions (< 200ms)
- Progress bars for file uploads
- NEVER blocking spinners without cancel option

**Error Handling**:
- Inline field validation (real-time with debounce)
- Form-level error summary at top
- API errors mapped to user-friendly messages
- Retry mechanism for transient failures
- Fallback UI for component errors (error boundaries)

**Success Feedback**:
- Toast notifications (3 second duration, dismissible)
- Visual confirmation (checkmark icon, color change)
- Redirect to success page for critical flows (payment, mentor booking)

### Responsive Design

**Breakpoints**:
- Mobile: < 640px (single column, stacked navigation)
- Tablet: 640px - 1024px (two columns, sidebar navigation)
- Desktop: > 1024px (multi-column, persistent navigation)

**Touch Targets**:
- Minimum 44x44px for all interactive elements
- Spacing between targets: minimum 8px

**Typography Scale**:
- Mobile: Base 14px, headings 18px-28px
- Desktop: Base 16px, headings 24px-48px

### Accessibility

**Keyboard Navigation**:
- All interactive elements accessible via Tab
- Logical tab order (left-to-right, top-to-bottom)
- Focus indicators visible (2px outline)
- Escape key closes modals/dropdowns

**Screen Readers**:
- Semantic HTML (nav, main, article, aside)
- ARIA labels for icon-only buttons
- Alt text for all images
- Live regions for dynamic content

**Color & Contrast**:
- Text contrast minimum 4.5:1 (WCAG AA)
- Large text (18px+) minimum 3:1
- Color NEVER sole indicator (use icons + text)

## Governance

### Amendment Process

This Constitution supersedes all other development practices and MUST be followed without exception.

**Amendment Procedure**:
1. Proposal submitted via GitHub issue with rationale
2. Team discussion (minimum 3 business days)
3. Approval requires consensus from all code owners
4. Migration plan required for breaking changes
5. Version incremented according to semantic versioning
6. All dependent templates updated for consistency

### Versioning Policy

**Version Format**: MAJOR.MINOR.PATCH

- **MAJOR**: Backward-incompatible principle removals or redefinitions (e.g., removing TypeScript strictness)
- **MINOR**: New principles added or existing principles materially expanded (e.g., adding mobile-specific UX requirements)
- **PATCH**: Clarifications, wording improvements, non-semantic refinements (e.g., fixing typos, adding examples)

### Compliance Review

**Pre-Merge Checklist**:
- [ ] TypeScript strictness verified (no `any` types)
- [ ] Tests written and passing (coverage thresholds met)
- [ ] Performance budgets met (bundle size, Core Web Vitals)
- [ ] UX consistency verified (loading states, error handling, accessibility)
- [ ] Security review completed (input validation, OWASP top 10)
- [ ] Code review approved by code owner
- [ ] CI/CD pipeline green

**Complexity Justification**:
- Any violation of principles MUST be documented in plan.md Complexity Tracking table
- Justification MUST explain why simpler alternatives are insufficient
- Technical debt created MUST have remediation plan with timeline

**Periodic Review**:
- Constitution reviewed quarterly for relevance
- Metrics collected: test coverage, performance benchmarks, security incidents
- Principles updated based on production learnings

**Version**: 1.2.0 | **Ratified**: 2025-12-28 | **Last Amended**: 2025-12-28
