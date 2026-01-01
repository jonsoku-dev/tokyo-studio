# Task Breakdown: Subreddit-style Community (r/korea Model)

## Phase 1: MVP - Core Infrastructure & Basic Feed (Weeks 1-2)
Goal: "Usable Reddit-like Experience" - Users can join communities, post (text/link/image), and view feeds.

### 1.1 Database Schema & Seeding
- [ ] Create `communities` table (slug, name, description, rules, theme, visibility).
- [ ] Create `community_members` table (role: member/mod/admin).
- [ ] Update `posts` table (add `community_id`, `type`, `link_url`, `is_pinned`).
- [ ] Create `community_post_media` table for multi-image support (start with 1 for MVP).
- [ ] Update `seeds/community.ts` to create default `r/general`, `r/qna`, `r/review` with sample data.
- [ ] **Migration**: Create `communities` for 'general', 'qna', 'review'.
- [ ] **Migration**: Run script to map existing `posts.category` to `posts.community_id`.
- [ ] **Migration**: Verify all existing posts belong to a community.

### 1.2 Access Control & Permissions
- [ ] Implement `requireCommunityPermission(slug, action)` middleware.
- [ ] Implement `joinCommunity` / `leaveCommunity` service logic.
- [ ] Update `session.server.ts` to cache user's community roles (optional optimization).

### 1.3 Community API & Service
- [ ] `GET /r/:slug`: Fetch community details + Pinned/Hot posts.
- [ ] `POST /r/:slug/join` & `POST /r/:slug/leave`.
- [ ] `GET /r/:slug/about`: Fetch rules and mod list.

### 1.4 UI: Community Shell
- [ ] Create `routes/r.$slug.tsx` (Layout route).
- [ ] Implement Community Header (Banner, Icon, Name, Join Button).
- [ ] Implement Left Navigation (Home, Popular, User's Communities).
- [ ] Implement Right Sidebar (About, Rules, Stats).

### 1.5 UI: Feed & Posting (MVP)
- [ ] Update `PostCard` to display `r/community` badge and flairs.
- [ ] Implement `SortControl` (Best/Hot/New) connection to API.
- [ ] Create `routes/r.$slug.submit.tsx` (Community-scoped Post Creation).
- [ ] Restrict post types based on Community settings (Text-only vs Media allowed).

---

## Phase 2: V1 - Visuals, Flairs & Basic Moderation (Weeks 3-4)
Goal: "Looks like Reddit" - Enhanced visuals, categorization, and moderation tools.

### 2.1 Rich Media & Link Previews
- [ ] Integrate OpenGraph scraper service for Link posts.
- [ ] Enhance `PostMedia` to support gallery view (Carousel).
- [ ] Implement `ImageUpload` component with S3/R2 integration.

### 2.2 Flairs System
- [ ] Create `post_flairs` and `user_flairs` tables.
- [ ] Add Flair management UI for Mods.
- [ ] Update Post Creation to select Flair.
- [ ] Update Feed to filter by Flair.

### 2.3 Basic Moderation Tools
- [ ] Create `reports` table (target_type, reason, status).
- [ ] Add "Report" action to Post/Comment dropdowns.
- [ ] Create `routes/r.$slug.mod.queue.tsx` (Mod Dashboard).
- [ ] Implement `Approve` / `Remove` / `Ban User` actions.

### 2.4 Search & Discovery
- [ ] Implement "Search within r/:slug" toggle in global search.
- [ ] Create `routes/r.$slug.search.tsx`.
- [ ] Add "Community Guide" / Wiki link support in Sidebar.

---

## Phase 3: V2 - Growth & Engagement (Weeks 5-6)
Goal: "Grows like Reddit" - Engagement loops, analytics, and refinement.

### 3.1 Advanced Ranking & Discovery
- [ ] Implement "Hot" sorting algorithm (Time decay + Score).
- [ ] Implement "Best" sorting (Weighted for comments/votes).
- [ ] Create "Trending Communities" widget in Home Sidebar.

### 3.2 User Engagement Features
- [ ] Implement "Crosspost" functionality.
- [ ] Add "User Flair" selection UI in sidebar.
- [ ] Implement "Community Highlights" (Pinned announcements card).

### 3.3 Analytics & Optimization
- [ ] Add "Traffic Stats" for Mods (Pageviews, Uniques, Joins).
- [ ] optimize `getFeed` queries with materialized views or heavier caching.
- [ ] Refine "Spam Protection" (Rate limiting new accounts).
