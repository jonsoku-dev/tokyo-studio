# SPEC-026: Dashboard (Home) Improvement - Unified Command Center

**Status**: Draft  
**Created**: 2026-01-02  
**Priority**: P1 (Critical - Primary User Touch Point)  
**Dependencies**: All active features (SPEC-001 through SPEC-025)  
**Estimated Effort**: 7-10 days

---

## 0. Executive Summary

### 0.1 What is this feature?

The **Unified Dashboard** is the central command center where users land after login. It transforms from a simple "task list + job recommendations" into an **intelligent, personalized hub** that:

1. **Surfaces Critical Actions**: Shows what matters most right now based on user's journey stage
2. **Tracks Progress**: Visualizes progress across multiple dimensions (roadmap, settlement, mentoring)
3. **Enables Quick Actions**: Provides one-click access to essential workflows
4. **Delivers Contextual Insights**: AI-powered recommendations based on user profile and behavior
5. **Unifies All Features**: Seamlessly integrates all 25+ platform capabilities

### 0.2 Why is this needed? (Problem Statement)

| Problem | Current State | Impact |
|---------|---------------|---------|
| **Information Overload** | Users don't know where to go after login | Lost productivity → Frustration → Churn |
| **Feature Discovery** | Users unaware of valuable features (mentoring, settlement, community) | Low feature adoption → Underutilized platform value |
| **Context Switching** | Users navigate between 5+ different pages to check status | Cognitive overload → Inefficiency |
| **Lack of Prioritization** | All tasks look equally important | Decision paralysis → Inaction |
| **No Progress Visibility** | Users can't see their overall journey progress | Low motivation → Abandonment |

### 0.3 How does this solve the problem?

```
[Smart Feed] → [Personalized Widgets] → [Quick Actions] → [Progress Tracking]
      ↓                  ↓                     ↓                    ↓
 Priority-Based     Context-Aware         One-Click          Visual Motivation
 Information        Recommendations        Workflows          & Accountability
```

**Core Value Propositions**:

1. **Personalized Experience**: Dashboard adapts to user's journey stage (assessment → roadmap → application → settlement)
2. **Actionable Intelligence**: Every widget leads to a clear next step
3. **Progress Transparency**: Multi-dimensional progress tracking (career, settlement, community)
4. **Unified Interface**: Single source of truth for all platform activities
5. **Smart Notifications**: Only the most important alerts, intelligently filtered

### 0.4 Expected Impact

#### User Value
| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to First Action | 10 seconds after login | Analytics tracking |
| Feature Discovery Rate | 80%+ users find mentoring/settlement within 7 days | Feature usage analytics |
| Daily Active Users (DAU) | 2x increase | Login frequency tracking |
| User Satisfaction | 4.5+ / 5.0 | Post-interaction survey |

#### Business Value
| Metric | Target | Measurement |
|--------|--------|-------------|
| Engagement Rate | 60%+ daily interaction | Click-through rates on widgets |
| Feature Adoption | 50%+ use 3+ features | Cross-feature usage analytics |
| Conversion to Paid | 25%+ upgrade to mentoring | Monetization funnel |
| Retention (30-day) | 70%+ active users | Cohort retention analysis |

---

## 1. User Personas & Journey Stages

The dashboard must adapt to different user journey stages. Each stage has different primary needs:

### Stage 1: Newcomer (0-7 days) - "Orientation"
**Profile**: Just signed up, may have completed assessment
**Primary Needs**:
- Understand what the platform offers
- Complete career assessment if not done
- Generate initial roadmap
- Discover key features (mentoring, community, settlement)

**Dashboard Priority**:
1. Onboarding assessment CTA (if incomplete)
2. Welcome tour / getting started guide
3. Feature showcase (mentoring, community highlights)
4. First 3 roadmap tasks

### Stage 2: Active Learner (7-30 days) - "Skill Building"
**Profile**: Roadmap in progress, actively completing tasks
**Primary Needs**:
- Track roadmap progress
- Access learning resources
- Get resume feedback
- Connect with mentors

**Dashboard Priority**:
1. Today's roadmap tasks (top 3)
2. Overall progress % with milestones
3. Mentor recommendations
4. Community posts from relevant categories

### Stage 3: Active Applicant (30-90 days) - "Job Hunting"
**Profile**: Applying to jobs, tracking pipeline
**Primary Needs**:
- Manage application pipeline
- Prepare for interviews
- Track application statuses
- Document organization

**Dashboard Priority**:
1. Pipeline overview (applications by stage)
2. Upcoming mentor sessions (interview prep)
3. Document checklist (resume versions)
4. Job recommendations

### Stage 4: Visa/Settlement (Offer accepted) - "Moving to Japan"
**Profile**: Has job offer, preparing to move
**Primary Needs**:
- Complete settlement checklist
- Understand visa process
- Find housing
- Prepare for arrival

**Dashboard Priority**:
1. Settlement checklist progress
2. Countdown to arrival date
3. Urgent pre-arrival tasks
4. Community connections in target city

### Stage 5: Settled Professional (90+ days) - "Community Contributor"
**Profile**: Living in Japan, contributing back
**Primary Needs**:
- Help others (mentoring, community posts)
- Discover advanced opportunities
- Network with peers
- Share experiences

**Dashboard Priority**:
1. Mentor dashboard (if mentor)
2. Community engagement (posts, replies)
3. Settlement module creation tools
4. Advanced job opportunities

---

## 2. Dashboard Information Architecture

### 2.1 Core Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Top Navigation (Persistent)                                 │
├──────────────────────────────────────┬──────────────────────┤
│                                      │  Sidebar (Optional)  │
│  Hero / Status Banner                │  ┌────────────────┐  │
│  ┌────────────────────────────────┐  │  │ Quick Stats    │  │
│  │ Welcome + Journey Progress     │  │  │ * Roadmap: 45% │  │
│  │ "You're 45% to your goal!"     │  │  │ * Pipeline: 3  │  │
│  └────────────────────────────────┘  │  │ * Mentoring: 1 │  │
│                                      │  └────────────────┘  │
│  Priority Actions (Context-Aware)   │                       │
│  ┌────────────────────────────────┐  │  Upcoming Events     │
│  │ [!] Complete Today              │  │  ┌────────────────┐  │
│  │ • Resume Review (due today)     │  │  │ Mon 10:00 AM   │  │
│  │ • Apply to Sony (3 days left)   │  │  │ Mentor Session │  │
│  └────────────────────────────────┘  │  └────────────────┘  │
│                                      │                       │
│  Main Feed (2-Column Grid)          │  Community Snapshot   │
│  ┌──────────────┬──────────────────┐│  ┌────────────────┐  │
│  │ Roadmap      │  Pipeline        ││  │ Trending Posts │  │
│  │ Progress     │  Overview        ││  │ * Top Q&A      │  │
│  ├──────────────┼──────────────────┤│  └────────────────┘  │
│  │ Mentoring    │  Settlement      ││                       │
│  │ Sessions     │  Checklist       ││  Ads (House/Google)   │
│  └──────────────┴──────────────────┘│                       │
│                                      │                       │
│  Activity Feed (Optional)            │                       │
│  • Recent community posts            │                       │
│  • System notifications              │                       │
└──────────────────────────────────────┴──────────────────────┘
```

### 2.2 Widget Catalog (Priority-Ordered)

#### P1 Widgets (Always Visible)

**1. Journey Progress Bar** *(Motivational Anchor)*
- **What**: Horizontal progress bar showing overall Japan job journey completion
- **Data**: Aggregates from roadmap (40%), settlement (30%), pipeline (20%), community (10%) weights
- **Visual**: Gradient bar with milestone markers
- **CTA**: "View Detailed Progress" → Navigate to analytics page

```tsx
<JourneyProgressWidget 
  progress={67} 
  stage="Active Applicant"
  nextMilestone="Complete 3 more applications to unlock Settlement phase"
/>
```

**2. Priority Actions Card** *(Actionable Intelligence)*
- **What**: Top 3 most urgent/important actions for today
- **Logic**:
  - Overdue tasks (red)
  - Due today (orange)
  - High-impact next steps (yellow)
  - Mentor sessions within 24h (purple)
- **Visual**: Compact list with urgency badges
- **CTA**: Clicking opens relevant feature (roadmap, pipeline, mentoring)

```tsx
<PriorityActionsWidget
  actions={[
    { type: 'task', title: 'Update Resume', urgency: 'high', dueDate: 'Today' },
    { type: 'application', title: 'Follow up with LINE Corp', urgency: 'medium' },
    { type: 'mentor', title: 'Prep for 3PM session', urgency: 'high', dueIn: '2 hours' }
  ]}
/>
```

**3. Roadmap Snapshot** *(Progress Tracking)*
- **What**: Mini roadmap view showing current phase progress
- **Data**: Today's tasks + overall completion %
- **Visual**: Compact Kanban or list with checkboxes
- **CTA**: "View Full Roadmap" → /roadmap

```tsx
<RoadmapSnapshotWidget
  currentPhase="Application"
  Progress={12/15}
  todaysTasks={3}
  completedToday={1}
/>
```

#### P2 Widgets (Contextual - Shown Based on Journey Stage)

**4. Pipeline Overview** *(Application Stage)*
- **What**: Application funnel visualization
- **Data**: Count by stage (Applied → Interview → Offer)
- **Visual**: Horizontal funnel or card grid
- **CTA**: "Manage Pipeline" → /pipeline
- **When to Show**: Stage 3 (Active Applicant) OR has 1+ applications

```tsx
<PipelineOverviewWidget
  stages={{
    applied: 8,
    screening: 3,
    interview: 2,
    offer: 0
  }}
/>
```

**5. Settlement Checklist** *(Pre-Move Stage)*
- **What**: Critical pre-arrival tasks
- **Data**: Tasks due within next 30 days based on arrival date
- **Visual**: Progress ring + urgent task list
- **CTA**: "View Settlement Plan" → /settlement
- **When to Show**: Has arrival date set OR Stage 4 (Visa/Settlement)

```tsx
<SettlementChecklistWidget
  arrivalDate="2026-03-15"
  daysUntilArrival={45}
  progress={{completed: 8, total: 20}}
  urgentTasks={['Book temporary housing', 'Apply for COE']}
/>
```

**6. Mentor Sessions** *(Active Engagement)*
- **What**: Upcoming and past mentor sessions
- **Data**: Next session details + recent session count
- **Visual**: Session cards with countdown timer
- **CTA**: "Book Another Session" / "Join Session" → /mentoring
- **When to Show**: Has booked 1+ session OR Stage 2-3

```tsx
<MentorSessionsWidget
  upcoming={{
    mentor: '@tanaka_san',
    topic: 'Resume Review',
    datetime: '2026-01-03 15:00',
    hoursUntil: 16
  }}
  pastCount={3}
/>
```

**7. Community Highlights** *(Social Engagement)*
- **What**: Trending posts from relevant communities
- **Data**: Top 3 posts from joined communities or recommended categories
- **Visual**: Compact post cards (title + vote count + comment count)
- **CTA**: "View Community" → /r/[slug]
- **When to Show**: Always (to encourage feature discovery)

```tsx
<CommunityHighlightsWidget
  posts={[
    { community: 'r/frontend', title: 'React 19 trends in Tokyo companies', votes: 24 },
    { community: 'r/visa', title: 'COE timeline for 2026', votes: 18 }
  ]}
/>
```

#### P3 Widgets (Nice-to-Have)

**8. Document Hub** *(Organization)*
- **What**: Quick access to recent/important documents
- **Data**: Last 3 uploaded docs + storage usage
- **Visual**: File list with icons + progress bar for storage
- **CTA**: "Manage Documents" → /documents

**9. Job Recommendations** *(Discovery)*
- **What**: Personalized job listings based on profile
- **Data**: 3-5 jobs matching jobFamily + level + jpLevel
- **Visual**: Job cards with company logo
- **CTA**: "See All Jobs" / "Add to Pipeline"

**10. AI Career Insights** *(Advanced Intelligence)*
- **What**: LLM-generated weekly summary and suggestions
- **Data**: Analyzes user activity + profile + roadmap
- **Visual**: Card with bullet points
- **CTA**: "Get Detailed Analysis" → /insights

---

## 3. Technical Requirements

### 3.1 Functional Requirements

**Core Dashboard**
- **FR-001**: System MUST adapt dashboard layout based on user journey stage (Newcomer → Settled Professional)
- **FR-002**: System MUST calculate and display overall journey progress percentage aggregating roadmap (40%), settlement (30%), pipeline (20%), community (10%)
- **FR-003**: System MUST identify and display top 3 priority actions using urgency algorithm (overdue > due today > high-impact > upcoming)
- **FR-004**: System MUST load dashboard within 2 seconds (p95 latency)
- **FR-005**: System MUST support mobile-responsive layout (single column on mobile)

**Widget Customization System** (Core Feature - Phase 1)
- **FR-006**: System MUST implement all features as independent, draggable widgets using @dnd-kit
- **FR-007**: Users MUST be able to reorder widgets via drag-and-drop on desktop and touch gestures on mobile
- **FR-008**: Users MUST be able to show/hide individual widgets from Widget Gallery
- **FR-009**: Users MUST be able to resize widgets between compact/standard/expanded sizes
- **FR-010**: System MUST persist widget layout (order, visibility, size) to database per user
- **FR-011**: System MUST provide default widget layouts optimized for each journey stage
- **FR-012**: Users MUST be able to reset to default layout with one click
- **FR-013**: Widget configuration changes MUST apply optimistically (immediate UI update) with background persistence

**Widget Dynamic Loading**
- **FR-014**: Each widget MUST have clear CTA button leading to relevant feature
- **FR-015**: Widgets MUST only show when relevant (e.g., Pipeline widget only if user has applications)
- **FR-016**: Widgets MUST use lazy loading (React.lazy) to improve initial page load
- **FR-017**: Widgets MUST refresh data on page load without requiring full page refresh

**Data Integration**
- **FR-018**: Dashboard MUST fetch data from:
  - Profile service (assessment completion, stage)
  - Roadmap service (tasks, progress)
  - Pipeline service (applications by stage)
  - Mentoring service (sessions)
  - Settlement service (checklist progress, arrival date)
  - Community service (trending posts from joined communities)
  - Document service (recent uploads, storage quota)

**Notifications**
- **FR-019**: Priority Actions widget MUST highlight time-sensitive items with color coding
- **FR-020**: System MUST display badge count for unread notifications on navigation
- **FR-021**: System MUST send browser push notifications for critical actions (mentor session in 1 hour)

**Personalization**
- **FR-022**: System MUST pre-fill user name in welcome message
- **FR-023**: System MUST remember user's last dashboard scroll position
- **FR-024**: System MUST track widget interaction analytics (clicks, time spent, drag events)

### 3.2 Non-Functional Requirements

**Performance**
- **NFR-001**: Dashboard page initial load \u003c 2 seconds (p95)
- **NFR-002**: Widget data fetch \u003c 500ms per widget (parallel fetching)
- **NFR-003**: Page Time to Interactive (TTI) \u003c 3 seconds
- **NFR-004**: Lighthouse Performance Score \u003e 90

**Scalability**
- **NFR-005**: Dashboard MUST handle 10,000+ concurrent users without degradation
- **NFR-006**: System MUST cache widget data with appropriate TTL (1-5 minutes)
- **NFR-007**: Database queries MUST use indexes to prevent full table scans

**Accessibility**
- **NFR-008**: Dashboard MUST meet WCAG 2.1 Level AA standards
- **NFR-009**: All widgets MUST be keyboard navigable
- **NFR-010**: Screen readers MUST be able to narrate all content meaningfully

**Internationalization**
- **NFR-011**: All UI text MUST support Korean, Japanese, English
- **NFR-012**: Date/time displays MUST respect user's locale
- **NFR-013**: Numbers MUST format according to locale (e.g., commas for thousands)

### 3.3 Key Entities

**Dashboard State**
```typescript
interface DashboardState {
  userId: string;
  journeyStage: 'newcomer' | 'learner' | 'applicant' | 'settlement' | 'contributor';
  overallProgress: number; // 0-100
  lastVisitedAt: Date;
  widgetPreferences: Record<WidgetId, { visible: boolean; order: number }>;
}
```

**Priority Action**
```typescript
interface PriorityAction {
  id: string;
  type: 'task' | 'application' | 'mentor' | 'settlement' | 'document';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: Date;
  ctaLabel: string;
  ctaLink: string;
}
```

**Widget Data**
```typescript
interface WidgetData {
  id: WidgetId;
  name: string;
  priority: 1 | 2 | 3;
  visibilityCondition: (user: User) => boolean;
  dataFetcher: () => Promise<unknown>;
  refreshInterval: number; // seconds
}
```

---

## 4. User Stories & Testing

### User Story 1 - Quick Access to Priority Actions (P1)

**As a** user logging into the platform,  
**I want** to immediately see the 3 most important actions I should take today,  
**So that** I can be productive without having to search through multiple pages.

**Acceptance Scenarios**:
1. **Given** I have 2 overdue tasks and 1 mentor session in 3 hours, **When** I load the dashboard, **Then** I see these 3 items in Priority Actions widget with red/orange/purple urgency badges
2. **Given** I click on a priority action, **When** the link opens, **Then** I navigate directly to the relevant page (e.g., /roadmap#task-123)
3. **Given** I complete a priority action, **When** I return to dashboard, **Then** it's removed from the list and replaced with next priority item

---

### User Story 2 - Journey Progress Tracking (P1)

**As a** user actively working toward my goal,  
**I want** to see my overall progress across all platform dimensions,  
**So that** I stay motivated and understand how close I am to my goal.

**Acceptance Scenarios**:
1. **Given** I have completed 50% of roadmap, 30% of settlement, 2 applications, **When** I view the dashboard, **Then** I see "Overall Progress: 42%" calculated with weighted formula
2. **Given** I complete a major milestone (50% roadmap), **When** dashboard loads, **Then** I see congratulatory animation and next milestone target
3. **Given** I click "View Detailed Progress", **When** page loads, **Then** I see breakdown by category (Roadmap, Pipeline, Settlement, Community)

---

### User Story 3 - Feature Discovery (P2)

**As a** new user who just completed assessment,  
**I want** to discover key platform features (mentoring, community, settlement),  
**So that** I can leverage all available resources.

**Acceptance Scenarios**:
1. **Given** I'm a newcomer (0-7 days), **When** I load dashboard, **Then** I see feature showcase cards for Mentoring, Community, Settlement with "Explore" CTAs
2. **Given** I click "Explore Mentoring", **When** page loads, **Then** I navigate to /mentoring with onboarding tooltip
3. **Given** I've used 3+ features, **When** I load dashboard, **Then** showcase cards are replaced with actual usage widgets

---

### User Story 4 - Contextual Widget Visibility (P2)

**As a** user at different journey stages,  
**I want** the dashboard to adapt to show only relevant widgets,  
**So that** I'm not overwhelmed with irrelevant information.

**Acceptance Scenarios**:
1. **Given** I haven't set arrival date, **When** I load dashboard, **Then** Settlement Checklist widget is hidden
2. **Given** I set arrival date to 30 days from now, **When** I load dashboard, **Then** Settlement Checklist widget appears with countdown
3. **Given** I have 0 mentor sessions booked, **When** I load dashboard, **Then** I see "Book Your First Mentor" CTA instead of sessions list

---

### User Story 5 - Mobile Experience (P2)

**As a** user accessing on my phone,  
**I want** a streamlined mobile dashboard,  
**So that** I can quickly check status on-the-go.

**Acceptance Scenarios**:
1. **Given** I access dashboard on mobile, **When** page loads, **Then** widgets stack vertically with most important (Priority Actions) first
2. **Given** I swipe widgets horizontally, **When** gesture completes, **Then** I can quick-view next widget without scrolling
3. **Given** I tap a widget, **When** interaction completes, **Then** it expands inline to show more details

---

### Edge Cases

- **Newcomer with No Profile**: What if user skips assessment? → Show prominent "Complete Assessment" banner blocking 50% of dashboard
- **All Tasks Completed**: What if user has 0 pending tasks? → Show celebration message + suggestion to explore community or mentor others
- **Multiple Urgent Items**: What if user has 10+ urgent actions? → Priority Actions shows top 3 + "View 7 More" link
- **Slow Widget Load**: What if a widget API times out? → Show skeleton loading for 3s, then "Unable to load, refresh" message
- **Stale Data**: What if user leaves dashboard open for hours? → Auto-refresh widgets every 5 minutes, show "Updated X min ago" timestamp
- **Journey Stage Mismatch**: What if user regresses (e.g., loses job after settlement phase)? → Dashboard adapts backward to Application stage
- **Zero State for Each Widget**: Every widget must handle empty state gracefully with CTA to populate it

---

## 5. Success Criteria

### Measurable Outcomes

- **SC-001**: 90% of users complete at least 1 priority action within 24h of login
- **SC-002**: Average time to first meaningful action \u003c 15 seconds
- **SC-003**: Feature discovery rate increases by 50% (users try mentoring/settlement within first week)
- **SC-004**: Dashboard load time p95 \u003c 2 seconds
- **SC-005**: User satisfaction score (CSAT) for dashboard experience \u003e 4.5/5.0
- **SC-006**: Daily active users (DAU) increase by 30% within 30 days of launch
- **SC-007**: Average session duration on dashboard \u003e 2 minutes (indicating engagement, not confusion)
- **SC-008**: Widget click-through rate \u003e 50% (at least half of users click a widget per visit)
- **SC-009**: Mobile bounce rate \u003c 20%
- **SC-010**: Zero accessibility violations detected by axe-core tool

---

## 6. Implementation Phases

### Phase 1: Foundation & Widget System (4 days)
**Goal**: Customizable widget-based dashboard with drag-and-drop

**Widget System Core**:
- [ ] Widget configuration database schema
- [ ] dnd-kit integration (DndContext, SortableContext)
- [ ] SortableWidget wrapper component
- [ ] WidgetRenderer with dynamic imports
- [ ] Widget layout persistence API
- [ ] Default layouts for each journey stage
- [ ] Widget Gallery UI (add hidden widgets)
- [ ] Reset to default layout button

**Dashboard Services**:
- [x] Dashboard service layer (data aggregation)
- [ ] Journey stage detection algorithm
- [ ] Widget configuration service
- [ ] Optimistic update handler

**Core Widgets (P1)**:
- [ ] Journey Progress widget
- [ ] Priority Actions widget
- [ ] Roadmap Snapshot widget

**Acceptance**: User can drag-and-drop widgets, hide/show, and layout persists across sessions

---

### Phase 2: Feature Integration (3 days)
**Goal**: Complete all widgets with smart visibility

**Contextual Widgets (P2)**:
- [ ] Pipeline Overview widget
- [ ] Mentoring Sessions widget
- [ ] Settlement Checklist widget
- [ ] Community Highlights widget

**Discovery Widgets (P3)**:
- [ ] Document Hub widget
- [ ] Notifications Center widget
- [ ] Enhanced Mentor Application Status widget

**Smart Features**:
- [ ] Widget visibility conditional logic (journey stage aware)
- [ ] Widget size presets (compact/standard/expanded)
- [ ] Per-widget settings modal (if applicable)

**Acceptance**: All 10 widgets functional with proper visibility conditions and resize capability

---

### Phase 3: Polish & Optimization (2 days)
**Goal**: Performance, UX refinement, accessibility

**UX Polish**:
- [ ] Widget skeleton loading states
- [ ] Error boundaries for each widget
- [ ] Smooth drag animations
- [ ] Mobile touch gestures optimization
- [ ] 2-column desktop layout with column assignment
- [ ] Responsive breakpoint handling

**Performance**:
- [ ] Lazy loading for below-fold widgets
- [ ] Widget data caching (5-minute TTL)
- [ ] Optimistic updates with rollback on error
- [ ] Debounced layout persistence

**Analytics**:
- [ ] Widget view tracking
- [ ] Drag-and-drop event tracking
- [ ] Widget interaction heatmap

**Accessibility**:
- [ ] Keyboard shortcuts (Ctrl+E for edit mode)
- [ ] Screen reader announcements for drag events
- [ ] Focus management
- [ ] ARIA labels for all interactive elements

**Acceptance**: Passes all performance metrics + WCAG 2.1 AA + Zero axe-core violations

---

### Phase 4: Advanced Features (2 days, Future)
**Goal**: Next-level customization and intelligence

- [ ] Widget Marketplace (community-created widgets)
- [ ] Layout Templates (save/share popular layouts)
- [ ] Multiple Dashboard Presets (Focus/Overview/Mobile modes)
- [ ] AI Career Insights widget
- [ ] Real-time updates via WebSockets
- [ ] Cross-device layout sync
- [ ] Dark mode support
- [ ] Export dashboard as PDF

**Acceptance**: Advanced users can create custom widgets, share layouts, and receive AI recommendations

---

## 7. Analytics & Metrics

### Tracked Events

**Page Events**
```typescript
analytics.track('dashboard_loaded', {
  userId, journeyStage, loadTime, widgetsVisible
});

analytics.track('widget_viewed', {
  userId, widgetId, scrollDepth, timeOnScreen
});

analytics.track('widget_clicked', {
  userId, widgetId, ctaLabel, destinationUrl
});

analytics.track('priority_action_completed', {
  userId, actionType, urgency, timeToComplete
});
```

**User Flow**
```
Dashboard Load → Widget Interaction → Feature Entry → Goal Completion → Dashboard Return
```

**Funnel Metrics**
- Dashboard → Priority Action Click → Task Complete: Target 60%
- Dashboard → Mentoring Widget → Session Booked: Target 20%
- Dashboard → Community Widget → Post Viewed: Target 40%

---

## 8. Design System Integration

### 8.1 Design Philosophy & UX Patterns

**Core Philosophy**: "Don't Make Me Think" - Simple & Intuitive

The dashboard applies the following design patterns per [`.agent/rules/design_rules.md`](file:///Users/jongseoklee/Documents/GitHub/itcom/.agent/rules/design_rules.md):

#### 1. Reddit-Style Feed Pattern (Priority Actions, Community Widgets)
**Key**: Density & Scannability
- **Card-based containers**: Each widget is a distinct card with clear background separation
- **Left action bar**: Status badges/checkboxes on the left for quick scanning
- **Visual hierarchy**: Most important info (title, urgency) is bold, metadata (date, counts) is muted

**Implementation**:
```tsx
<div className="card"> {/* Premium Minimalism: whitespace + shadow */}
  <div className="flex gap-4">
    {/* Left: Status/Action */}
    <div className="flex items-center">
      <UrgencyBadge level="high" /> {/* Red/Orange/Blue/Green */}
    </div>
    
    {/* Main Content */}
    <div className="flex-1">
      <h3 className="font-semibold text-gray-900">Update Resume</h3>
      <p className="text-sm text-gray-600">Due today at 5 PM</p>
    </div>
    
    {/* Right: CTA */}
    <Button size="sm">View Task</Button>
  </div>
</div>
```

#### 2. GitHub Activity Dashboard Pattern (Journey Progress, Roadmap)
**Key**: Visualization & Achievement
- **Contribution graph**: Progress heatmap showing consistency
- **Clean lists**: Efficient data display with tight spacing
- **Subtle micro-interactions**: Hover effects, smooth transitions

**Implementation**:
```tsx
<div className="widget-progress">
  {/* Visual Progress Bar with Gradient */}
  <div className="relative h-3 rounded-full bg-gray-200 overflow-hidden">
    <div 
      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
      style={{ width: `${progress}%` }}
    />
  </div>
  
  {/* Milestone Markers */}
  <div className="flex justify-between mt-2 text-xs text-gray-600">
    <span>Newcomer</span>
    <span>Active</span>
    <span>Settled</span>
  </div>
</div>
```

#### 3. Micro-Interactions (All Widgets)
**Key**: Living, Responsive Feel
- **Hover states**: Button elevates, background lightens
- **Drag feedback**: Opacity 0.5, shadow increases during drag
- **Loading states**: Skeleton shimmer, not spinners
- **Success feedback**: Toast notifications, checkmark animations

### 8.2 Design System (Tailwind CSS v4)

**Reference**: [`web/docs/design-system.md`](file:///Users/jongseoklee/Documents/GitHub/itcom/web/docs/design-system.md)

**Technology Stack**:
- **CSS Framework**: Tailwind CSS v4 with `@theme` directive
- **Typography**: LINE Seed (EN/KR/JP), Manrope (Display), Inter (Fallback)
- **Icons**: Lucide React (consistent line style)
- **Interaction**: Headless UI v2 (accessibility built-in)

#### Brand Colors (OKLCH)

**Primary (Blue 243°)** - Trust, stability, tech
```css
--color-primary-500: oklch(0.60 0.190 243); /* Default */
--color-primary-600: oklch(0.52 0.190 243); /* Hover */
--color-primary-700: oklch(0.45 0.170 243); /* Active */
```
Usage: Main CTAs, links, navigation, widget headers

**Accent (Teal 175°)** - Growth, opportunities
```css
--color-accent-500: oklch(0.65 0.140 175);
```
Usage: Success states, progress indicators, positive badges

**Semantic Colors**:
| Color | CSS Variable | Usage in Dashboard |
|-------|--------------|--------------------|
| Critical | `--color-error-600` | Overdue tasks |
| High | `--color-warning-600` | Due today |
| Medium | `--color-primary-600` | High-impact items |
| Low | `--color-success-600` | Completed, low priority |
| Muted | `--color-gray-600` | Secondary text, timestamps |
| Border | `--color-gray-200` | Widget borders, dividers |
| Surface | `--color-white` | Widget backgrounds |

#### Typography Scale

```tsx
/* Widget Titles */
<h3 className="font-display text-lg font-semibold text-gray-900">
  Priority Actions
</h3>

/* Widget Content */
<p className="font-sans text-sm text-gray-600">
  Complete 3 tasks to unlock next milestone
</p>

/* Metadata (dates, counts) */
<span className="text-xs text-gray-500">
  Updated 5 minutes ago
</span>
```

#### Spacing & Layout

**Widget Container**:
```tsx
<div className="card"> {/* Defined in @layer components */}
  {/* Equivalent to: */}
  <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
    {/* Content */}
  </div>
</div>
```

**Radius Tokens**:
- Widgets: `rounded-lg` (0.5rem)
- Buttons: `rounded-md` (0.375rem)
- Badges: `rounded-full`
- Modals: `rounded-xl` (0.75rem)

**Shadow Tokens**:
- Default cards: `shadow-md`
- Dragging widgets: `shadow-xl`
- Dropdowns: `shadow-lg`

**Grid Layout**:
```tsx
{/* Desktop: 2-column */}
<div className="grid gap-6 lg:grid-cols-2">
  {widgets.map(widget => <Widget key={widget.id} />)}
</div>

{/* Mobile: 1-column with reduced gap */}
<div className="grid gap-4 grid-cols-1">
  {/* Auto-applied below lg breakpoint */}
</div>
```

### 8.3 Component Library

**Use existing shared components** ([`web/app/shared/components/ui/`](file:///Users/jongseoklee/Documents/GitHub/itcom/web/app/shared/components/ui)):
- `Badge` - Urgency indicators, status labels
- `Button` - CTAs, actions
- `Card` - Widget containers
- `Dropdown` - Widget actions menu
- `Dialog` - Widget gallery modal
- `Skeleton` - Loading states
- `Toast` - Success/error feedback

**New Dashboard-Specific Components**:
```
web/app/features/dashboard/components/
├── layout/
│   ├── DashboardGrid.tsx          # DndContext wrapper
│   ├── SortableWidget.tsx         # useSortable hook
│   └── WidgetRenderer.tsx         # React.lazy loader
├── widgets/
│   ├── JourneyProgressWidget.tsx
│   ├── PriorityActionsWidget.tsx
│   ├── RoadmapSnapshotWidget.tsx
│   ├── PipelineOverviewWidget.tsx
│   ├── MentorSessionsWidget.tsx
│   ├── SettlementChecklistWidget.tsx
│   ├── CommunityHighlightsWidget.tsx
│   ├── DocumentHubWidget.tsx
│   ├── NotificationsWidget.tsx
│   └── MentorApplicationWidget.tsx
└── shared/
    ├── WidgetSkeleton.tsx         # Shimmer loading
    ├── WidgetActions.tsx          # Resize/hide menu
    ├── WidgetGallery.tsx          # Add widgets modal
    ├── UrgencyBadge.tsx           # Color-coded badges
    ├── ProgressRing.tsx           # Circular progress
    └── EmptyState.tsx             # Zero-data states
```

### 8.4 Animation & Transitions

**Easing Functions** (from design-system.md):
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);       /* Exit animations */
--ease-out: cubic-bezier(0, 0, 0.2, 1);      /* Enter animations */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1); /* Transitions */
```

**Widget Drag Animation**:
```tsx
<div 
  style={{
    transform: CSS.Transform.toString(transform),
    transition: 'transform 200ms ease-out',
    opacity: isDragging ? 0.5 : 1,
  }}
>
  {/* Widget content */}
</div>
```

**Button Micro-Interaction**:
```tsx
<button className="
  bg-primary-500 text-white px-4 py-2 rounded-md
  transition-all duration-150 ease-out
  hover:bg-primary-600 hover:shadow-md hover:-translate-y-0.5
  active:translate-y-0
">
  View Task
</button>
```

### 8.5 Accessibility Requirements

Per WCAG 2.1 Level AA:

**Color Contrast**:
- Text on white: Minimum 4.5:1 (gray-900, gray-800)
- Secondary text: Minimum 3:1 (gray-600)
- Urgency badges: Use both color AND icon

**Keyboard Navigation**:
```tsx
{/* Enable keyboard drag-and-drop */}
<DndContext sensors={[pointerSensor, keyboardSensor]}>
  {/* Keyboard shortcuts */}
  <button onClick={toggleEditMode} aria-label="Edit dashboard layout (Ctrl+E)">
    Edit Layout
  </button>
</DndContext>
```

**Screen Reader Labels**:
```tsx
<div role="region" aria-label="Dashboard Widgets">
  <div aria-live="polite" className="sr-only">
    {isDragging && `Moving ${widget.name}`}
    {dropSuccess && `${widget.name} moved successfully`}
  </div>
</div>
```

### 8.6 Responsive Design

**Breakpoint Strategy** (mobile-first):
```tsx
{/* Mobile: Single column, compact widgets */}
<div className="grid grid-cols-1 gap-4">
  
{/* Tablet: Hybrid layout */}
<div className="md:grid-cols-2 md:gap-5">

{/* Desktop: 2-column with explicit column assignment */}
<div className="lg:grid-cols-2 lg:gap-6">
  <Widget column={1} /> {/* Left column */}
  <Widget column={2} /> {/* Right column */}
</div>
```

**Mobile Optimizations**:
- Touch targets: Minimum 44x44px (Drag handles, action buttons)
- Reduced animations: `prefers-reduced-motion`
- Compact widget sizes: Auto-applied below `md` breakpoint
- Swipe gestures: Consider for widget carousel (Phase 4)

### 8.7 Dark Mode Support (Future)

```tsx
<div className="
  bg-white text-gray-950 border-gray-200
  dark:bg-gray-950 dark:text-gray-50 dark:border-gray-800
">
  {/* Widget content automatically adapts */}
</div>
```

All color tokens defined in `@theme` support dark mode variants automatically.

---

## 9. Migration Strategy

### Current Dashboard Analysis

**Existing Features** (kept):
- ✅ WelcomeHero (enhanced with journey progress)
- ✅ Onboarding CTA (if no profile)
- ✅ Mentor Application Status widget
- ✅ Today's Tasks section (integrated into Priority Actions)
- ✅ Job Recommendations (moved to P3 widget)

**What Changes**:
- TaskCard → Priority Actions Widget (smarter prioritization)
- JobCard grid → Optional widget (not always visible)
- Static layout → Dynamic widget system

**Migration Path**:
1. Week 1: Build new widgets alongside existing dashboard (feature flag)
2. Week 2: A/B test new dashboard with 25% of users
3. Week 3: Rollout to 100% based on metrics
4. Week 4: Remove old code, optimize

---

## 10. Future Enhancements (V2+)

**AI-Powered Insights**
- Weekly digest: "You're applying 2x faster than average, but missing networking opportunities"
- Personalized timeline: "Based on your progress, estimated job offer in 6 weeks"
- Risk alerts: "Your resume hasn't been updated in 30 days, refreshing is recommended"

**Social Features**
- Dashboard sharing: "Share your journey with friends"
- Peer comparison (optional): "You're in top 20% of active applicants"
- Accountability partners: "Connect with someone at same stage"

**Gamification**
- Achievement badges: "Completed 10 tasks this week!"
- Streak tracking: "5-day login streak"
- Leaderboards: "Top contributors this month"

**Advanced Customization**
- Widget marketplace: Community-created widgets
- Custom widget creation: Power users build their own
- Multiple dashboard layouts: Focus mode, Overview mode, Mobile mode

---

## 11. Dependencies & Risks

### Technical Dependencies
- SPEC-025 (Career Diagnosis) - Required for journey stage detection
- SPEC-016 (Roadmap) - Required for Roadmap Snapshot widget
- SPEC-012 (Mentoring) - Required for Mentor Sessions widget
- SPEC-019 (Settlement) - Required for Settlement Checklist widget
- SPEC-023 (Community) - Required for Community Highlights widget

### Risks & Mitigation
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Slow widget API calls | High | Medium | Parallel fetching + caching + fallback to last known state |
| Widget data inconsistency | Medium | Medium | Timestamp each widget data, show staleness indicator |
| User overwhelm (too many widgets) | High | High | Strict P1/P2/P3 prioritization, conditional visibility |
| Mobile performance issues | High | Medium | Lazy load below-fold widgets, optimize images |
| Journey stage misdetection | Medium | Low | Manual override option, fallback to heuristics |

---

## 12. Open Questions

1. **Real-Time Updates**: Should widgets auto-refresh in real-time (e.g., websockets) or on page load only?
   - **Recommendation**: Start with page load + periodic polling (5min), add websockets in V2

2. **Community Content**: Should we show posts from all communities or only joined ones?
   - **Recommendation**: Prioritize joined communities, fall back to trending from recommended categories

3. **Metrics Dashboard**: Should we provide a separate analytics page for progress deep-dive?
   - **Recommendation**: Yes, Phase 3 adds /dashboard/analytics with detailed breakdowns

4. **Dark Mode**: Is dark mode a P1 or nice-to-have?
   - **Recommendation**: P3 - Nice-to-have, but use design tokens to make future implementation easy

5. **Widget Marketplace**: Should we allow third-party widgets from the community?
   - **Recommendation**: V2 feature - Start with platform-defined widgets, open marketplace later

---

##13. Conclusion

The improved dashboard transforms from a simple "task list page" into an **intelligent command center** that:

✅ **Guides users** through their Japan job journey with personalized, stage-appropriate content  
✅ **Surfaces critical actions** using smart prioritization to reduce decision fatigue  
✅ **Unifies all features** into a single, coherent interface  
✅ **Drives engagement** through progress tracking and contextual recommendations  
✅ **Scales with users** from newcomer to settled professional  

**Success means**: Users spend 80% less time navigating, discover features 2x faster, and complete actions 50% more efficiently - ultimately achieving their goal of landing a job in Japan faster and with less frustration.

---

**Last Updated**: 2026-01-02  
**Document Version**: 1.0  
**Author**: Development Team  
**Status**: Ready for Review →
