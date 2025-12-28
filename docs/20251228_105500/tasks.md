# Web Project Status & Missing Features (Gap Analysis)
Date: 2025-12-28

## ✅ Implemented (개발 완료)
- [x] **Diagnosis (진단)**
    - Wizard UI & Branching Logic
    - Scoring Algorithm
    - Recommendation Engine
    - Result Page
- [x] **Payment (결제)**
    - Toss Payments Integration (Widget)
    - Order Creation & Validation
    - Payment Success/Failure Handling
- [x] **Admin (관리자)**
    - Separate Project Structure (`/admin`)
    - Shared Database & Schema
    - Dashboard (KPIs - Placeholder)
    - User Management (List, Detail, Suspend/Activate)
    - Content Moderation (Post List, Delete)
    - Mentor Promotion Action
- [x] **Mentoring (멘토링 - Basic)**
    - Schema (`mentors`, `mentor_availability`)
    - Mentor Scheduler UI
    - Mentor Service Logic
- [x] **Community (커뮤니티 - Basic)**
    - Markdown Editor
    - Post List/Create
    - Schema

---

## 🚧 Missing / To-Do (미개발 리스트)

### 1. Authentication & Profile
- [ ] **Social Login**: Google/GitHub OAuth 2.0 Integration.
- [ ] **Email Verification**: SendGrid/Resend API integration for sign-up.
- [ ] **Password Reset**: Forgot password flow with email link.
- [ ] **Public Profile**: Detailed view of User/Mentor profiles.
- [ ] **Avatar Upload**: S3 integration for profile pictures.

### 2. Career Tools
- [ ] **Roadmap Integration**: Link Diagnosis results to a dynamic Kanban/Gantt roadmap.
- [ ] **Calendar Sync**: Google Calendar API integration for schedules.
- [ ] **Pipeline Automation**: OG Tag parsing for job URLs.
- [ ] **Document Management**: Resume upload (S3) & PDF Viewer.

### 3. Mentoring (Advanced)
- [ ] **Video Link Gen**: Auto-generate Google Meet/Zoom links upon booking.
- [ ] **Review System**: Post-session rating and text reviews.
- [ ] **Mentor Application**: Frontend form for users to apply as mentors.

### 4. Community (Advanced)
- [ ] **Comments**: Threaded (nested) comments UI & logic.
- [ ] **Search**: Full-text search for posts.
- [ ] **Image Upload**: Upload images within the Markdown editor.
- [ ] **Voting**: Upvote/Downvote system.

### 5. Settlement (Tokyo Guide)
- [ ] **Checklist**: D-Day based settlement task list.
- [ ] **Map**: Google Maps API integration for key locations.

### 6. Infrastructure & Ops
- [ ] **File Storage**: AWS S3 setup & Presigned URL logic.
- [ ] **SEO**: Dynamic Meta Tags & Sitemap generation.
- [ ] **CI/CD**: Finalize GitHub Actions workflow.
