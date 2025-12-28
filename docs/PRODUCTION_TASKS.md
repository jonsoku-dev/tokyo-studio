# Production Development Tasks

## Phase 1: Core Foundation & Auth (Production Grade)
- [ ] **Infrastructure**
    - [ ] Setup production PostgreSQL (AWS RDS or Supabase).
    - [ ] Configure Redis for session storage and caching.
    - [ ] Setup S3 Bucket (CORS, Permissions).
    - [ ] Setup CI/CD Pipeline (GitHub Actions -> Staging/Prod).
- [ ] **Authentication**
    - [ ] Google/GitHub OAuth 2.0 Integration.
    - [ ] Email Verification (SendGrid/Resend API).
    - [ ] Password Reset Flow (Token generation & Validation).
    - [ ] Role-Based Access Control (RBAC) implementation (Middleware).

## Phase 2: User Onboarding & Diagnosis
- [ ] **Diagnosis Engine**
    - [ ] Define detailed Scoring Algorithm (Ruleset).
    - [ ] Implement Wizard UI with Branching Logic.
    - [ ] Recommendations Generation Service.
- [ ] **Profile System**
    - [ ] Public Profile Page (Activity Log, Badges).
    - [ ] Profile Edit (Avatar Upload via S3).
    - [ ] Resume Parsers/PDF Generation (Basic).

## Phase 3: Career Management Tools (The "Loop")
- [ ] **Roadmap**
    - [ ] Dynamic Template Loading based on Diagnosis.
    - [ ] Task Scheduling & Calendar Sync (iCal/Google).
    - [ ] Progress Visualization (Burn-up Chart).
- [ ] **Pipeline**
    - [ ] URL Scraping/Parsing Service (OpenGraph).
    - [ ] Pipeline Analytics (Pass rate by stage).
    - [ ] Document Attachment (S3 Integration).
- [ ] **Documents**
    - [ ] Secure File Upload (Presigned URL flow).
    - [ ] Document Versioning System.
    - [ ] PDF Viewer Integration.

## Phase 4: Mentoring Ecosystem
- [ ] **Mentor Onboarding**
    - [ ] Mentor Application Form & Admin Approval Flow.
    - [ ] Availability Settings (Time Slots).
- [ ] **Booking & Payment**
    - [ ] Toss Payments Widget/API Integration.
    - [ ] Webhook Handling (Payment Success/Fail).
    - [ ] Booking Confirmation & Calendar Invite Emails.
- [ ] **Session Management**
    - [ ] Session Room (Video Link) Management.
    - [ ] Post-Session Report & Review System.

## Phase 5: Community & Content
- [ ] **Advanced Forum**
    - [ ] Rich Text Editor (Image Uploads).
    - [ ] Comment Threading (Nested).
    - [ ] Voting System (Upvote/Downvote).
    - [ ] Full-text Search Implementation.
- [ ] **Moderation**
    - [ ] Report Content Flow.
    - [ ] Automated Profanity Filter.
    - [ ] Admin Moderation Queue.

## Phase 6: Settlement & Localization
- [ ] **Settlement Checklist**
    - [ ] D-Day Calculation Logic.
    - [ ] Map Integration (Google Maps API).
    - [ ] Downloadable Forms (City Hall etc.).

## Phase 7: Admin & Operations
- [ ] **Admin Project Setup**
    - [ ] Initialize `admin` project (React Router 7 or Vite + React).
    - [ ] Analyze & Setup Monorepo workspace (if needed) or distinct package.
    - [ ] Configure Shared DB Connection (Drizzle).
- [ ] **Admin Dashboard**
    - [ ] KPI Dashboard (Charts/Graphs).
    - [ ] User/Mentor Management Table.
    - [ ] Payment/Refund Management.
    - [ ] System Health Monitoring.

## Phase 8: Optimization & Launch
- [ ] **Performance**
    - [ ] Code Splitting & Lazy Loading.
    - [ ] Image Optimization (WebP/Avif).
    - [ ] Database Indexing & Query Optimization.
- [ ] **SEO & Analytics**
    - [ ] Dynamic Sitemap Generation.
    - [ ] Meta Tags & OpenGraph Management.
    - [ ] Google Analytics / PostHog Integration.
- [ ] **Security Audit**
    - [ ] Rate Limiting.
    - [ ] CSRF/XSS Protection Review.
    - [ ] Penetration Testing (Basic).
