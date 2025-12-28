# 빠른 시작 가이드 - 복사 붙여넣기용

모든 명령어를 순서대로 복사하여 실행하세요.

---

## 🔴 Phase 1 - High Priority (즉시 시작 권장)

### 1. OAuth 소셜 로그인
```
/speckit.specify Build a social authentication system that allows users to sign up and log in using their Google or GitHub accounts. Users should be able to link multiple social accounts to a single platform account. The system must verify email ownership and create user profiles automatically from social account data including name, email, and profile picture. When a user logs in, they should see a unified dashboard regardless of which authentication method they used. Existing users who previously registered with email/password should be able to link their social accounts. The system must prevent duplicate accounts by matching email addresses and handle edge cases where social providers don't share email addresses.
```

### 2. 이메일 인증
```
/speckit.specify Build an email verification system that sends a confirmation link to users when they sign up with email/password. Users receive a welcome email with a verification link that expires after 24 hours. Until they verify their email, users see a banner reminding them to check their inbox and can request a new verification link. Verified users get a badge on their profile. The system must prevent brute force attacks by rate limiting verification email requests to 3 per hour per email address. Verification tokens must be cryptographically secure and single-use only.
```

### 3. 비밀번호 재설정
```
/speckit.specify Build a password reset flow where users who forgot their password can request a reset link via email. Users enter their email address and receive a secure reset link that expires after 1 hour. The reset page allows them to enter a new password with strength requirements (minimum 8 characters, at least one uppercase, one lowercase, one number). The system must invalidate all existing reset tokens when a password is successfully changed. Rate limiting prevents abuse by allowing only 3 reset requests per hour per email address. Users are notified via email when their password is changed as a security measure.
```

### 4. 프로필 사진 업로드
```
/speckit.specify Build a profile management system where users can upload and customize their profile picture (avatar). Users can upload images from their device or drag-and-drop files. The system displays a cropping interface where users can select the desired area in a circular frame. Uploaded images are automatically resized to 200x200px for display and 800x800px for high-resolution viewing. Supported formats are JPG, PNG, and WebP with a maximum file size of 5MB. Users can delete their avatar to revert to a default generated avatar based on their initials. The system must prevent uploading of inappropriate images and validate file types on both client and server.
```

### 5. 공개 프로필 페이지
```
/speckit.specify Build a public profile system where users can showcase their career journey and platform activity. Each user gets a unique profile URL (e.g., /profile/username) that displays their avatar, bio, job family, experience level, language skills, and location. Public profiles show badges earned from completing tasks, number of mentor sessions attended, community posts written, and helpful comments. Users control privacy settings to hide specific information like email, full name, or activity history. Mentors have enhanced profiles showing their company, years of experience, hourly rate, average rating, total sessions completed, and recent reviews. Profile pages are SEO-optimized with Open Graph tags for sharing on social media.
```

### 6. S3 파일 스토리지
```
/speckit.specify Build a secure cloud file storage system for user documents including resumes, CVs, portfolios, and cover letters. Users upload files directly from their browser to cloud storage without server relay using presigned URLs for security. The system enforces file type validation (PDF, DOCX, TXT only), maximum file size of 10MB per file, and total storage quota of 100MB per user. Each file is assigned a unique identifier and stored with metadata including original filename, file size, upload date, and document type. Users cannot access other users' files even if they know the file URL. The system automatically generates thumbnail previews for PDF files and tracks download counts for analytics.
```

### 7. 문서 관리 UI
```
/speckit.specify Build a document management interface where users organize their career documents by type and version. The main page displays documents in a grid layout with thumbnail previews, document name, type (Resume/CV/Portfolio/Cover Letter), version status (Draft/Final), file size, and upload date. Users can upload new documents via drag-and-drop or file picker, rename documents, mark versions as draft or final, download originals, and delete documents. A built-in PDF viewer allows users to preview documents without downloading, with zoom controls and page navigation. Users can search documents by name or filter by type and status. The system tracks version history showing when documents were uploaded, modified, or marked as final.
```

### 8. 중첩 댓글 시스템
```
/speckit.specify Build a threaded comment system for community posts where users can have nested discussions up to 3 levels deep. Users can reply to any comment, and replies are visually indented to show the conversation hierarchy. Each comment shows the author's avatar, name, timestamp, and content with Markdown formatting support. Users can edit their own comments within 15 minutes of posting (with an "edited" indicator), delete their comments (with confirmation), and report inappropriate comments. Comments display vote counts (upvotes minus downvotes) and users can vote once per comment. The system collapses deeply nested threads with a "Show more replies" button. Users receive notifications when someone replies to their comment or mentions them with @username syntax.
```

### 9. 커뮤니티 이미지 업로드
```
/speckit.specify Build an image upload system for community posts and comments where users can embed images directly in their Markdown content. Users can upload images via drag-and-drop, paste from clipboard, or file picker while writing a post. Uploaded images are automatically resized for web optimization (max 1920px width, 80% quality) while preserving aspect ratio. Supported formats are JPG, PNG, GIF, and WebP with a maximum size of 5MB per image and 10 images per post. The Markdown editor shows live image previews inline. Users can add alt text for accessibility and delete uploaded images. The system prevents hotlinking by validating referrer headers and generates responsive image URLs for different screen sizes.
```

### 10. 전체 텍스트 검색
```
/speckit.specify Build a full-text search system for community posts where users can find relevant discussions quickly. The search bar is prominently displayed at the top of the community page with autocomplete suggestions as users type. Search results rank posts by relevance (keyword matching, title weight, recency) and display snippets highlighting matching keywords. Users can filter results by category (Interview Review, QnA, General Discussion), date range (Last Week, Last Month, Last Year), and tags. Advanced search supports operators like quotes for exact phrases, minus sign to exclude terms, and OR for alternatives. The system indexes post titles, content, author names, and tags for comprehensive search. Search queries are logged anonymously to improve ranking algorithms and suggest trending topics.
```

### 11. 투표 시스템
```
/speckit.specify Build a voting system where users can upvote or downvote community posts and comments to surface the most helpful content. Each post and comment displays a vote score (upvotes minus downvotes) with up/down arrow buttons. Users can vote once per item and can change their vote at any time. Posts with high scores appear at the top of lists (Best sorting) while newest posts appear in chronological order (Recent sorting). Users who contribute highly-voted content earn reputation points that unlock privileges like editing others' posts or moderating. The system prevents vote manipulation by rate limiting votes to 100 per day per user and detecting suspicious voting patterns. Vote counts update in real-time without page refresh.
```

---

## 🟡 Phase 2 - Medium Priority

### 12. 멘토 예약 시스템
```
/speckit.specify Build a mentor booking system where users can browse available mentors, view their calendars, and book 1-on-1 sessions. The mentor directory displays cards with avatar, name, current company, job title, years of experience, hourly rate, average rating, and total sessions completed. Users can filter mentors by job family (Frontend, Backend, Mobile, etc.), experience level, availability, and price range. Clicking a mentor shows their full profile with detailed bio, areas of expertise, availability calendar, and recent reviews. Users select an available time slot (shown in their local timezone), choose session duration (30min, 60min, 90min), write a brief description of what they want to discuss, and confirm payment. The system prevents double-booking by locking time slots during checkout and sends confirmation emails to both parties with session details.
```

### 13. 비디오 링크 자동 생성
```
/speckit.specify Build an automatic video meeting link generation system for mentor sessions. When a session is booked and payment is confirmed, the system automatically generates a unique Google Meet or Zoom meeting link and adds it to the session details. Both the mentor and mentee receive calendar invites (ICS files) via email containing the meeting link, session topic, duration, and participant information. The meeting link is also displayed on the session details page in both users' dashboards. Reminders are sent 24 hours before and 1 hour before the session with a quick link to join the meeting. The system supports timezone conversion to show meeting times in each participant's local timezone. Meeting links expire 2 hours after the scheduled session end time for security.
```

### 14. 리뷰 시스템
```
/speckit.specify Build a post-session review system where mentees can rate their experience and provide feedback. After a session ends, mentees receive an email prompting them to leave a review within 7 days. Reviews consist of a 5-star rating (required) and written feedback (optional) covering aspects like helpfulness, expertise, communication, and value for money. Mentees can remain anonymous or attach their name to the review. Mentors can respond to reviews to thank mentees or clarify feedback. Reviews are displayed on mentor profile pages sorted by recency with the ability to filter by rating. The system calculates average ratings weighted by recency (more weight to recent reviews) and displays badges for top-rated mentors (4.8+ stars with 10+ reviews). Inappropriate reviews can be flagged and removed by admins. Mentors cannot delete negative reviews but can dispute them for admin review.
```

### 15. 멘토 신청 워크플로우
```
/speckit.specify Build a mentor application workflow where users can apply to become platform mentors. The application form collects current job title, company name, years of IT experience in Japan, LinkedIn profile URL, areas of expertise (Frontend, Backend, Mobile, etc.), languages spoken, preferred hourly rate, and a detailed bio explaining why they want to mentor. Applicants upload a verification document (company ID badge or recent payslip with sensitive info redacted) to prove employment. Applications are submitted to an admin review queue where admins can approve, reject with feedback, or request additional information. Approved applicants receive an email notification and their account is upgraded to mentor status, unlocking the availability scheduler and profile customization. Rejected applicants can reapply after 30 days. The system tracks application status (Pending, Under Review, Approved, Rejected) and displays it on the applicant's dashboard.
```

### 16. 로드맵 & 진단 통합
```
/speckit.specify Build a personalized roadmap generator that creates a customized action plan based on user diagnosis results. When users complete the career diagnosis, the system analyzes their job family, experience level, language proficiency, and target city to generate a tailored roadmap with 10-15 actionable tasks. Tasks are categorized into Learning (skill development), Application (resume, job search), Preparation (interviews, language), and Settlement (visa, relocation). Each task includes a title, description, estimated time to complete, priority level, and recommended completion order. The roadmap displays as a Kanban board with columns for To Do, In Progress, and Completed. Users can drag-and-drop tasks between columns, add custom tasks, edit task details, and mark tasks complete with a checkbox. The system tracks progress percentage and suggests next steps when users complete milestones.
```

### 17. Google Calendar 동기화
```
/speckit.specify Build a Google Calendar integration where users can sync their roadmap tasks, mentor sessions, and application deadlines with their personal calendar. Users authorize the platform to access their Google Calendar via OAuth, selecting which calendar to sync with. Roadmap tasks with due dates automatically create calendar events with task title, description, and due time. Mentor sessions create calendar events with meeting links, duration, and mentor information. Job application deadlines create reminder events 1 day before and on the deadline day. Changes made in the platform (task completed, session rescheduled, deadline updated) automatically sync to Google Calendar within 5 minutes. Users can disconnect the integration at any time, which removes all synced events. The system supports two-way sync where tasks completed in Google Calendar are marked complete in the platform.
```

### 18. 채용공고 URL 파싱
```
/speckit.specify Build an automatic job posting parser that extracts company and position information from URLs. When users add a new job application to their pipeline, they can paste a job posting URL from sites like LinkedIn, Indeed, Green, Wantedly, or company career pages. The system fetches the page content and parses Open Graph meta tags and structured data to extract the company name, job title, location, and job description summary. Extracted information auto-populates the application form fields, which users can edit before saving. If parsing fails or the URL is not a job posting, users see a warning and can manually enter the information. The system caches parsed results for 24 hours to avoid re-fetching the same URL. Users can refresh parsed data if the job posting was updated. Parsing works for both Japanese and English job postings with proper character encoding.
```

---

## 🟢 Phase 3 - Low Priority

### 19. 도쿄 정착 체크리스트
```
/speckit.specify Build a Tokyo settlement guide with a personalized checklist based on arrival date. Users enter their planned arrival date in Tokyo and the system generates a timeline with tasks organized into Before Arrival (1-3 months before), First Week, First Month, and First 3 Months. Each task includes a title, detailed instructions in both Korean and Japanese, required documents, estimated time to complete, and important deadlines. Example tasks include applying for visa, booking temporary housing, registering at city hall, opening a bank account, getting a phone number, applying for residence card, joining national health insurance, and setting up utilities. The system displays a countdown showing days until arrival and highlights urgent tasks in red. Users check off completed tasks and the system calculates progress percentage. Tasks include helpful tips like "Bring your passport, residence card application, and employment contract" with links to downloadable form templates.
```

### 20. 지도 통합
```
/speckit.specify Build an interactive Tokyo map showing key locations for settlement and daily life. The map displays markers for important places including city halls (Shibuya, Shinjuku, Minato, etc.), immigration offices, major banks (SMBC, MUFG, Mizuho), mobile carriers (Docomo, Softbank, au), popular housing areas (Shibuya, Nakameguro, Ebisu, Meguro), and convenience stores for administrative tasks (7-Eleven, Family Mart with multi-copy machines). Each marker shows the location name in English, Japanese, and Korean with address, phone number, business hours, and nearest train station. Users can filter markers by category (Government, Banking, Housing, Mobile, Shopping) and search for specific locations. The map integrates with Google Maps to show walking/transit directions from the user's current location. Users can save favorite locations and add custom markers with notes. The system defaults to showing locations in central Tokyo but allows users to search other areas if they plan to live outside the city center.
```

### 21. SEO 최적화
```
/speckit.specify Build an SEO optimization system that improves search engine visibility for the platform. Each page should have unique, descriptive meta titles (under 60 characters) and meta descriptions (under 160 characters) that include relevant keywords like "Japan IT jobs," "Tokyo software engineer," "Korean developers in Japan," etc. Public pages like mentor profiles, community posts, and the homepage should have Open Graph tags for rich social media previews when shared on Facebook, Twitter, or LinkedIn. The system automatically generates a sitemap.xml file listing all public URLs, updated daily as new content is published. A robots.txt file guides search engine crawlers to index public content while excluding admin pages and user dashboards. Page load performance is optimized with lazy loading images, minified CSS/JS bundles, and server-side rendering for critical content. Structured data (JSON-LD) marks up mentor profiles, reviews, and job postings for rich search results. The system tracks core web vitals (LCP, FID, CLS) and alerts when performance degrades.
```

### 22. 푸시 알림
```
/speckit.specify Build a browser push notification system that keeps users engaged with timely updates. Users are prompted to enable notifications on their first visit with a clear explanation of benefits (session reminders, application deadlines, community replies). Once enabled, users receive notifications for important events: mentor session starting in 1 hour, job application deadline tomorrow, someone replied to your community post, mentor accepted your booking, payment completed, roadmap task due today, and weekly summary of platform activity. Each notification includes a title, message, icon, and click action that opens the relevant page. Users can customize notification preferences in settings, choosing which types to receive and quiet hours (e.g., no notifications between 10 PM - 8 AM). The system respects browser notification permissions and handles cases where users block or revoke permissions. Notifications are sent via the Push API for web browsers and work even when the platform tab is closed. Undelivered notifications (when user is offline) are queued and delivered when they come back online.
```

---

## 📝 실행 후 다음 단계

각 명령어 실행 후:
1. 생성된 `/specs/[feature-name]/spec.md` 파일을 리뷰
2. `/speckit.plan` 명령어로 구현 계획 수립
3. `/speckit.tasks` 명령어로 작업 목록 생성
4. Constitution v1.2.0 준수 확인 (Test-First, TypeScript Strictness 등)

## 💡 팁

- **Phase 1**부터 순서대로 진행하는 것을 강력히 권장합니다
- 한 번에 1-2개 기능씩 spec → plan → implement 사이클을 완료하세요
- 각 기능은 독립적으로 개발/테스트/배포 가능하도록 설계되었습니다
