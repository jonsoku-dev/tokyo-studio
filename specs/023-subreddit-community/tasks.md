# Task Breakdown: Subreddit-style Community (r/korea Model)

> **Dependencies**: Spec 011 (Voting System), Spec 008 (Threaded Comments), Spec 010 (Search)

---

## Phase 0: Schema Migration (Pre-requisite) - Day 1
> ⚠️ **Critical Path**: Must complete before any other work.

### 0.1 Database Schema
- [ ] **Schema**: Create `communities` table.
  - Fields: `id`, `slug` (unique), `name`, `description`, `banner_url`, `icon_url`, `visibility`, `created_by`, `created_at`.
  - Add indexes on `slug`.
- [ ] **Schema**: Create `community_members` table.
  - Fields: `id`, `community_id`, `user_id`, `role` (member/moderator/admin), `joined_at`.
  - Composite unique index on `(community_id, user_id)`.
- [ ] **Schema**: Create `community_rules` table.
  - Fields: `id`, `community_id`, `order_index`, `title`, `description`.
- [ ] **Schema**: Add `community_id` to `community_posts` (nullable initially).
- [ ] **Schema**: Run `pnpm db:push` to apply changes.

### 0.2 Data Migration
- [ ] **Seed**: Create default communities: `r/general`, `r/qna`, `r/review`.
  - Set `created_by` to admin user.
- [ ] **Script**: Create `scripts/migrate-categories.ts`:
  ```sql
  UPDATE community_posts 
  SET community_id = (SELECT id FROM communities WHERE slug = category);
  ```
- [ ] **Verify**: Run `SELECT COUNT(*) FROM community_posts WHERE community_id IS NULL` → Expect 0.
- [ ] **Finalize**: `ALTER TABLE community_posts ALTER COLUMN community_id SET NOT NULL`.

### 0.3 Acceptance Criteria
- [ ] All existing posts have valid `community_id`.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm build` succeeds.

---

## Phase 1: MVP - Core Community Experience (Week 1)
> **Goal**: Users can browse, join communities, and see community-scoped feeds.

### 1.1 Community Service Layer
- [ ] **Service**: Create `community.server.ts`:
  - `getCommunity(slug)`: Fetch community with member count.
  - `getCommunities()`: List all public communities.
  - `getUserCommunities(userId)`: List joined communities.
- [ ] **Service**: Create `membership.server.ts`:
  - `joinCommunity(userId, communityId)`: Insert member row.
  - `leaveCommunity(userId, communityId)`: Delete member row.
  - `hasJoined(userId, communityId)`: Boolean check.
  - `getUserRole(userId, communityId)`: Return role or null.

### 1.2 Community APIs
- [ ] **API**: `api.communities.ts` (Loader):
  - GET: Return list of communities with `{id, slug, name, description, member_count}`.
- [ ] **API**: `api.community.$slug.ts` (Loader):
  - GET: Return single community with full details.
- [ ] **API**: `api.community.join.ts` (Action):
  - POST: `{ intent: 'join' | 'leave', communityId }`.
  - Return updated membership status.

### 1.3 Community Layout & UI
- [ ] **Route**: Create `routes/r.$slug.tsx` (Layout).
  - Fetch community in loader.
  - Render `CommunityHeader` + `Outlet` + `CommunitySidebar`.
- [ ] **Component**: Create `CommunityHeader.tsx`:
  - Banner image (full width, 200px height).
  - Icon (96px circle, offset from banner).
  - Name + description + member count.
  - Join/Leave button (useFetcher).
- [ ] **Component**: Create `CommunitySidebar.tsx`:
  - About card (description, member count, created date).
  - Rules accordion (from `community_rules`).
  - "Create Post" button.
- [ ] **Route**: Create `routes/r.$slug._index.tsx`:
  - Loader: Fetch posts for this community.
  - UI: Reuse enhanced `PostCard` + `SortControl`.

### 1.4 Enhance PostCard for Communities
- [ ] **Component**: Update `PostCard.tsx`:
  - Show `r/{community.slug}` badge (link to community).
  - Show author with community-specific user flair (later).
  - Keep existing vote controls.
- [ ] **Component**: Create/Update `SortControl.tsx`:
  - Options: Hot, New, Top.
  - Top sub-options: Today, Week, Month, Year, All.
  - Sync with URL params.

### 1.5 Community-Scoped Post Creation
- [ ] **Route**: Create `routes/r.$slug.submit.tsx`:
  - Form: Title, Content (Markdown), Post Type (text/link/image).
  - Action: Create post with `community_id` from params.
- [ ] **Service**: Update `createPost()`:
  - Require `community_id`.
  - Validate user is member of community.

### 1.6 Update Home Feed
- [ ] **Route**: Update `community.tsx` (Home):
  - Loader: `getPostsFromJoinedCommunities(userId)`.
  - If not logged in or no communities joined, show "Popular" posts.
  - Add "Discover Communities" sidebar section.

### 1.7 Phase 1 Acceptance Criteria
- [ ] User can view list of communities at `/explore`.
- [ ] User can join/leave a community.
- [ ] User can view community feed at `/r/{slug}`.
- [ ] User can create post scoped to a community.
- [ ] Home feed shows posts from joined communities only.

---

## Phase 2: V1 - Flairs, Rich Media & Moderation (Week 2)
> **Goal**: Communities feel organized and manageable.

### 2.1 Flair System
- [ ] **Schema**: Create `post_flairs` table.
  - Fields: `id`, `community_id`, `name`, `color`, `bg_color`, `is_required`.
- [ ] **Schema**: Add `flair_id` FK to `community_posts`.
- [ ] **Service**: `getFlairs(communityId)`, `createFlair(...)`.
- [ ] **Component**: Create `FlairBadge.tsx`:
  - Colored pill with text.
- [ ] **Component**: Create `FlairSelector.tsx`:
  - Dropdown for post creation.
- [ ] **Route**: Update `r.$slug.submit.tsx`:
  - Include flair selector if flairs exist for community.

### 2.2 Link Previews (OpenGraph)
- [ ] **Service**: Create `og-scraper.server.ts`:
  - Fetch URL, parse OG meta tags.
  - Extract: `og:title`, `og:description`, `og:image`.
  - Cache results by URL.
- [ ] **Schema**: Add `og_title`, `og_description`, `og_image` to posts.
- [ ] **Route**: Update post creation action:
  - If type=link, fetch OG data and store.
  - Show preview in `PostCard`.

### 2.3 Multi-Image Posts
- [ ] **Schema**: Create `post_media` table.
  - Fields: `id`, `post_id`, `url`, `type`, `order_index`.
- [ ] **Component**: Create `ImageGallery.tsx`:
  - Carousel/grid for multiple images.
- [ ] **Route**: Update `r.$slug.submit.tsx`:
  - Multi-file upload.
  - Integrate with existing S3 upload logic.

### 2.4 Report System
- [ ] **Schema**: Create `reports` table.
  - Fields: `id`, `target_type`, `target_id`, `reporter_id`, `reason`, `status`, `resolved_by`, `created_at`.
- [ ] **API**: `api.reports.ts`:
  - POST: Create report.
  - GET: List reports for mod queue (mod only).
  - PATCH: Resolve report.
- [ ] **Component**: Add "Report" option to PostCard/CommentItem dropdowns.
- [ ] **UI**: Modal for selecting report reason.

### 2.5 Mod Queue
- [ ] **Route**: Create `routes/r.$slug.about.modqueue.tsx`:
  - Loader: Fetch pending reports for this community.
  - UI: List of `ModQueueItem` components.
- [ ] **Component**: Create `ModQueueItem.tsx`:
  - Content preview.
  - Report reason + count.
  - Action buttons: Approve, Remove, Ban.
- [ ] **API**: Extend `api.reports.ts`:
  - Action handlers for approve/remove/ban.

### 2.6 Community Settings (Mod)
- [ ] **Route**: Create `routes/r.$slug.about.edit.tsx`:
  - Form for editing name, description, banner, icon.
  - Rules management (add/edit/delete/reorder).
  - Flair management.
- [ ] **Permission**: Only accessible if `getUserRole() === 'moderator' | 'admin'`.

### 2.7 Phase 2 Acceptance Criteria
- [ ] Posts can have flairs; feed can filter by flair.
- [ ] Link posts show OG preview.
- [ ] Image posts support multiple images.
- [ ] Users can report posts/comments.
- [ ] Mods can review and resolve reports.
- [ ] Mods can edit community settings.

---

## Phase 3: V2 - Growth & Engagement (Week 3+)
> **Goal**: Community discovery and long-term engagement.

### 3.1 Advanced Ranking
- [ ] **Service**: Create `ranking.server.ts`:
  - `calculateHotScore(post)`: Time decay formula.
  - `calculateWilsonScore(ups, total)`: Best sort for comments.
- [ ] **Migration**: Backfill `hot_score` for existing posts.
- [ ] **Job**: Background job to recalculate hot scores periodically.

### 3.2 Trending Communities
- [ ] **Service**: `getTrendingCommunities()`:
  - Based on recent join rate + post activity.
- [ ] **Component**: Create `TrendingCommunitiesWidget.tsx`:
  - Display in Home sidebar.

### 3.3 Crosspost
- [ ] **Schema**: Add `crosspost_id` FK to posts.
- [ ] **UI**: "Crosspost to..." action in post detail.
- [ ] **Route**: Crosspost creation flow.

### 3.4 User Flairs (Community-specific)
- [ ] **Schema**: Create `user_flairs`, `community_user_flairs` tables.
- [ ] **UI**: Flair selector in sidebar.
- [ ] **Display**: Show user flair next to author name.

### 3.5 Analytics for Mods
- [ ] **Route**: Create `routes/r.$slug.about.stats.tsx`:
  - Charts: Daily joins, posts, comments.
  - Top contributors.
- [ ] **Service**: Aggregate queries for community stats.

### 3.6 Push Notifications (Integration)
- [ ] **Integration**: Hook into existing push system for:
  - Replies to your post/comment.
  - Mod actions on your content.

### 3.7 Phase 3 Acceptance Criteria
- [ ] Hot sort works correctly (new quality content rises).
- [ ] Trending communities widget shows active communities.
- [ ] Users can set community-specific flairs.
- [ ] Mods can view community analytics.

---

## Verification Checklist

### Before Phase 1 Completion
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm biome check .` passes.
- [ ] `pnpm build` succeeds.
- [ ] Migration script tested on staging data.

### Before Phase 2 Completion
- [ ] Manual QA: Full mod queue workflow.
- [ ] Manual QA: Multi-image upload and gallery.
- [ ] Performance: Feed queries < 200ms with 1000 posts.

### Before Phase 3 Completion
- [ ] E2E: User signup → Join community → Create post → Receive notification.
- [ ] Analytics: Data populates correctly for sample community.
