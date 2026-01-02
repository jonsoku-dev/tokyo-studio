# SPEC-026: Dashboard Improvement - Implementation Tasks

## Phase 1: Foundation & Widget System (4 days)

### 1.1 Database Schema - Widget Configuration
**File**: `packages/database/src/schema.ts`
- [x] Create `widgetConfigurations` table
  ```typescript
  export const widgetConfigurations = pgTable("widget_configurations", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    widgets: jsonb("widgets").$type<WidgetLayout[]>().notNull(),
    lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
    version: integer("version").default(1).notNull(),
  });
  ```
- [x] Run `pnpm db:push` to apply schema
- [x] Add TypeScript types in `packages/database/src/schema.ts`:
  ```typescript
  interface WidgetLayout {
    id: WidgetId;
    order: number;
    visible: boolean;
    size: 'compact' | 'standard' | 'expanded';
    column?: 1 | 2; // For desktop 2-column layout
  }
  
  type WidgetId = 
    | 'journey-progress'
    | 'priority-actions'
    | 'roadmap-snapshot'
    | 'pipeline-overview'
    | 'mentor-sessions'
    | 'settlement-checklist'
    | 'community-highlights'
    | 'document-hub'
    | 'notifications-center'
    | 'mentor-application';
  ```

**Dependencies**: None

### 1.2 Widget Configuration Service
**File**: `web/app/features/dashboard/domain/widget-config.service.server.ts`
- [ ] `getConfiguration(userId)` - Fetch user's widget layout
- [ ] `saveConfiguration(userId, widgets)` - Persist layout changes
- [ ] `getDefaultLayout(journeyStage)` - Return stage-specific defaults
- [ ] `validateLayout(widgets)` - Ensure valid widget IDs and structure

**Default Layouts**:
- [ ] Define layouts for 5 journey stages (newcomer, learner, applicant, settlement, contributor)
- [ ] Each layout specifies order, visibility, size for all 10 widgets

**Acceptance**: Service can CRUD widget configurations with proper validation

### 1.3 dnd-kit Integration - Core Components

#### DashboardGrid Component
**File**: `web/app/features/dashboard/components/DashboardGrid.tsx`
- [ ] Install/verify @dnd-kit packages:
  ```bash
  pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @dnd-kit/modifiers
  ```
- [ ] Implement `DndContext` wrapper
- [ ] Use `verticalListSortingStrategy` from @dnd-kit/sortable
- [ ] Handle `onDragEnd` event
- [ ] Implement optimistic UI updates
- [ ] Call widget config service to persist changes

**Example**:
```tsx
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

export function DashboardGrid({ initialWidgets }: { initialWidgets: WidgetLayout[] }) {
  const [widgets, setWidgets] = useState(initialWidgets);
  const fetcher = useFetcher();
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex).map((w, idx) => ({
          ...w,
          order: idx,
        }));
        
        // Persist optimistically
        fetcher.submit(
          { widgets: JSON.stringify(reordered) },
          { method: 'post', action: '/api/dashboard/widgets' }
        );
        
        return reordered;
      });
    }
  };
  
  const visibleWidgets = widgets.filter(w => w.visible);
  
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={visibleWidgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
        <div className="grid gap-6 lg:grid-cols-2">
          {visibleWidgets.map((widget) => (
            <SortableWidget key={widget.id} widget={widget} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

#### SortableWidget Wrapper
**File**: `web/app/features/dashboard/components/SortableWidget.tsx`
- [ ] Use `useSortable` hook from @dnd-kit/sortable
- [ ] Apply transform and transition styles
- [ ] Add drag handle with GripVertical icon
- [ ] Show dragging state (opacity, elevation)
- [ ] Integrate WidgetActions menu (resize, hide buttons)

**Example**:
```tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export function SortableWidget({ widget }: { widget: WidgetLayout }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging ? '0 10px 40px rgba(0,0,0,0.2)' : undefined,
  };
  
  return (
    <div ref={setNodeRef} style={style} className={`card ${widget.size}`}>
      {/* Drag Handle Header */}
      <div className="flex items-center gap-2 mb-4 cursor-move" {...attributes} {...listeners}>
        <GripVertical size={16} className="text-gray-400" />
        <h3 className="flex-1 font-semibold">{WIDGET_METADATA[widget.id].name}</h3>
        <WidgetActions widgetId={widget.id} currentSize={widget.size} />
      </div>
      
      {/* Widget Content */}
      <WidgetRenderer id={widget.id} size={widget.size} />
    </div>
  );
}
```

#### WidgetRenderer with Dynamic Imports
**File**: `web/app/features/dashboard/components/WidgetRenderer.tsx`
- [ ] Use React.lazy for code splitting
- [ ] Implement Suspense with skeleton fallback
- [ ] Handle widget loading errors gracefully

**Example**:
```tsx
import { lazy, Suspense } from 'react';
import { WidgetSkeleton } from './shared/WidgetSkeleton';

const widgetComponents = {
  'journey-progress': lazy(() => import('./widgets/JourneyProgressWidget')),
  'priority-actions': lazy(() => import('./widgets/PriorityActionsWidget')),
  'roadmap-snapshot': lazy(() => import('./widgets/RoadmapSnapshotWidget')),
  'pipeline-overview': lazy(() => import('./widgets/PipelineOverviewWidget')),
  'mentor-sessions': lazy(() => import('./widgets/MentorSessionsWidget')),
  'settlement-checklist': lazy(() => import('./widgets/SettlementChecklistWidget')),
  'community-highlights': lazy(() => import('./widgets/CommunityHighlightsWidget')),
  'document-hub': lazy(() => import('./widgets/DocumentHubWidget')),
  'notifications-center': lazy(() => import('./widgets/NotificationsWidget')),
  'mentor-application': lazy(() => import('./widgets/MentorApplicationWidget')),
};

export function WidgetRenderer({ id, size }: { id: WidgetId; size: WidgetSize }) {
  const Component = widgetComponents[id];
  
  return (
    <Suspense fallback={<WidgetSkeleton size={size} />}>
      <Component size={size} />
    </Suspense>
  );
}
```

### 1.4 API Routes - Widget Configuration

#### GET /api/dashboard/widgets
**File**: `web/app/features/dashboard/apis/widgets.server.ts`
- [ ] Loader function to fetch user's config
- [ ] If no config exists, generate default based on journey stage
- [ ] Return JSON with widgets array

#### POST /api/dashboard/widgets
**File**: Same file as above
- [ ] Action function to save widget layout
- [ ] Validate incoming widget array
- [ ] Upsert to database
- [ ] Return success response

**Example**:
```tsx
export async function loader({ request }: { request: Request }) {
  const userId = await requireUserId(request);
  const config = await widgetConfigService.getConfiguration(userId);
  
  if (!config) {
    const stage = await dashboardService.getUserJourneyStage(userId);
    const defaultLayout = widgetConfigService.getDefaultLayout(stage);
    await widgetConfigService.saveConfiguration(userId, defaultLayout);
    return json({ widgets: defaultLayout });
  }
  
  return json({ widgets: config.widgets });
}

export async function action({ request }: { request: Request }) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const widgets = JSON.parse(formData.get('widgets') as string);
  
  const isValid = widgetConfigService.validateLayout(widgets);
  if (!isValid) {
    return json({ error: 'Invalid widget configuration' }, { status: 400 });
  }
  
  await widgetConfigService.saveConfiguration(userId, widgets);
  return json({ success: true });
}
```

**Routes Config**:
- [ ] Add to `web/app/routes.ts`:
  ```ts
  { path: '/api/dashboard/widgets', file: 'features/dashboard/apis/widgets.server.ts' }
  ```
- [ ] Run `pnpm typegen` to generate route types

### 1.5 Widget Actions Menu
**File**: `web/app/features/dashboard/components/WidgetActions.tsx`
- [ ] Size toggle button (compact ↔ standard ↔ expanded)
- [ ] Hide widget button  
- [ ] Widget-specific settings button (conditional)
- [ ] Implement using Dropdown from shared/ui

**Example**:
```tsx
import { Maximize2, MinimizeSize, EyeOff, Settings } from 'lucide-react';
import { Dropdown } from '../../../shared/components/ui/Dropdown';

export function WidgetActions({ widgetId, currentSize }: { widgetId: WidgetId; currentSize: WidgetSize }) {
  const fetcher = useFetcher();
  
  const toggleSize = () => {
    const nextSize = currentSize === 'compact' ? 'standard' : currentSize === 'standard' ? 'expanded' : 'compact';
    fetcher.submit(
      { action: 'resize', widgetId, size: nextSize },
      { method: 'post', action: '/api/dashboard/widgets/action' }
    );
  };
  
  const hideWidget = () => {
    fetcher.submit(
      { action: 'hide', widgetId },
      { method: 'post', action: '/api/dashboard/widgets/action' }
    );
  };
  
  return (
    <Dropdown>
      <Dropdown.Trigger asChild>
        <button className="p-1 hover:bg-gray-100 rounded">
          <Settings size={16} />
        </button>
      </Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Item onClick={toggleSize}>
          <Maximize2 size={14} />
          Resize
        </Dropdown.Item>
        <Dropdown.Item onClick={hideWidget}>
          <EyeOff size={14} />
          Hide Widget
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown>
  );
}
```

### 1.6 Widget Gallery (Add Hidden Widgets)
**File**: `web/app/features/dashboard/components/WidgetGallery.tsx`
- [ ] Modal or sidebar component
- [ ] Display all available widgets with preview cards
- [ ] Show only widgets that meet visibility conditions
- [ ] "Add to Dashboard" button for hidden widgets
- [ ] Grid layout with widget icons and descriptions

**Example**:
```tsx
export function WidgetGallery({ currentWidgets }: { currentWidgets: WidgetLayout[] }) {
  const availableWidgets = WIDGET_METADATA.filter(w => 
    w.visibilityCondition ? w.visibilityCondition(user) : true
  );
  const hiddenWidgets = availableWidgets.filter(
    aw => !currentWidgets.find(cw => cw.id === aw.id && cw.visible)
  );
  
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Add Widgets</Button>
      </DialogTrigger>
      <DialogContent>
        <h2>Widget Gallery</h2>
        <div className="grid grid-cols-2 gap-4">
          {hiddenWidgets.map((widget) => (
            <WidgetGalleryCard key={widget.id} widget={widget} onAdd={addWidget} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 1.7 Reset to Default Layout
**File**: `web/app/features/dashboard/components/DashboardSettings.tsx`
- [ ] "Reset Layout" button in settings or dashboard header
- [ ] Confirmation dialog
- [ ] Fetch default layout for current journey stage
- [ ] Apply and persist to database

### 1.8 Dashboard Services

#### Journey Stage Detection
**File**: `web/app/features/dashboard/domain/dashboard.service.server.ts`
- [ ] `getUserJourneyStage(userId)` function
- Logic:
  ```typescript
  async function getUserJourneyStage(userId: string): Promise<JourneyStage> {
    const profile = await profileService.getProfile(userId);
    const roadmapProgress = await roadmapService.getProgress(userId);
    const applicationCount = await pipelineService.countApplications(userId);
    const settlementData = await settlementService.getChecklist(userId);
    
    // Newcomer: No profile or roadmap progress < 10%
    if (!profile || roadmapProgress < 0.1) return 'newcomer';
    
    // Settlement: Has arrival date set
    if (settlementData?.arrivalDate) return 'settlement';
    
    // Applicant: Has 1+ applications
    if (applicationCount > 0) return 'applicant';
    
    // Learner: Has profile and active roadmap
    if (roadmapProgress >= 0.1 && roadmapProgress < 0.7) return 'learner';
    
    // Contributor: Roadmap mostly complete
    return 'contributor';
  }
  ```

**Acceptance**: Correctly classifies users into 5 stages

### 1.9 Core Widgets (P1) - Implementation

#### Journey Progress Widget
**File**: `web/app/features/dashboard/components/widgets/JourneyProgressWidget.tsx`
- [ ] Gradient progress bar component
- [ ] Current stage badge
- [ ] Next milestone text
- [ ] Calculate progress: (roadmap * 0.4) + (settlement * 0.3) + (pipeline * 0.2) + (community * 0.1)
- [ ] "View Detailed Progress" CTA link

#### Priority Actions Widget  
**File**: `web/app/features/dashboard/components/widgets/PriorityActionsWidget.tsx`
- [ ] Fetch top 3 urgent actions from dashboard service
- [ ] Render with urgency badges (red/orange/yellow/purple)
- [ ] Click navigates to specific task/item
- [ ] Empty state: "All caught up!"

#### Roadmap Snapshot Widget
**File**: `web/app/features/dashboard/components/widgets/RoadmapSnapshotWidget.tsx`
- [ ] Show current phase name
- [ ] Progress fraction (X/Y tasks)
- [ ] Today's tasks list (max 3)
- [ ] Quick checkbox to complete task
- [ ] "View Full Roadmap" CTA

**Acceptance**: All 3 P1 widgets render correctly with real data

### 1.10 Design System Implementation
**Reference**: [`.agent/rules/design_rules.md`](file:///Users/jongseoklee/Documents/GitHub/itcom/.agent/rules/design_rules.md), [`web/docs/design-system.md`](file:///Users/jongseoklee/Documents/GitHub/itcom/web/docs/design-system.md)

#### Widget Base Styles
**File**: `web/app/features/dashboard/components/styles/widget.css`
- [ ] Create `@layer components` for widget base class
  ```css
  @layer components {
    .card {
      background-color: var(--color-white);
      border-radius: var(--radius-lg);
      padding: --spacing(6);
      box-shadow: var(--shadow-md);
      border: 1px solid var(--color-gray-200);
      transition: box-shadow 200ms ease-out;
    }
    
    .card:hover {
      box-shadow: var(--shadow-lg);
    }
  }
  ```
- [ ] Define widget size variants (compact/standard/expanded)
- [ ] Create urgency badge styles (critical/high/medium/low)

#### Typography & Color Usage
- [ ] Use `font-display` for widget titles
- [ ] Use `font-sans` for widget content
- [ ] Apply semantic colors consistently:
  - Critical: `text-error-600` or `bg-error-50`
  - High: `text-warning-600` or `bg-warning-50`
  - Medium: `text-primary-600` or `bg-primary-50`
  - Low: `text-success-600` or `bg-success-50`
  - Muted: `text-gray-600`

#### Animation Standards
- [ ] All transitions use `duration-150` or `duration-200`
- [ ] Use `ease-out` for enter animations
- [ ] Use `ease-in` for exit animations
- [ ] Drag state: `opacity-50` + `shadow-xl`
- [ ] Hover state: `hover:-translate-y-0.5` + `hover:shadow-md`

#### Accessibility Checklist
- [ ] All interactive elements have `aria-label`
- [ ] Drag handles have `role="button"`
- [ ] Color contrast meets 4.5:1 minimum
- [ ] Keyboard navigation functional (Tab, Enter, Space, Arrow keys)
- [ ] Screen reader announcements for drag events

**Acceptance**: Passes BiomeJS linting + axe-core accessibility audit

---

## Phase 2: Widget Implementation (3 days)

### 2.1 Priority Widgets (P1 - Always Visible)

#### Journey Progress Widget
**File**: `web/app/features/dashboard/components/widgets/JourneyProgressWidget.tsx`
- [ ] Gradient progress bar component
- [ ] Milestone markers (25%, 50%, 75%, 100%)
- [ ] Current stage badge
- [ ] Next milestone text
- [ ] CTA: "View Detailed Progress"

**Design**:
```tsx
<div className="card">
  <div className="mb-4">
    <h3>Your Journey Progress</h3>
    <Badge>{stage}</Badge> {/* e.g., "Active Applicant" */}
  </div>
  <ProgressBar value={67} gradient />
  <p className="text-sm text-gray-600 mt-2">
    Complete 3 more applications to unlock Settlement phase
  </p>
</div>
```

#### Priority Actions Widget
**File**: `web/app/features/dashboard/components/widgets/PriorityActionsWidget.tsx`
- [ ] Action list with urgency badges (red/orange/yellow/purple)
- [ ] Compact layout (title + urgency + due date)
- [ ] Click-to-navigate functionality
- [ ] Empty state: "All caught up!"

**Features**:
- Red badge: Overdue
- Orange badge: Due today
- Yellow badge: High-impact
- Purple badge: Mentor session \u003c 24h

#### Roadmap Snapshot Widget
**File**: `web/app/features/dashboard/components/widgets/RoadmapSnapshotWidget.tsx`
- [ ] Current phase indicator
- [ ] Progress fraction (12/15 tasks)
- [ ] Today's tasks list (max 3, compact)
- [ ] Quick complete checkbox
- [ ] CTA: "View Full Roadmap"

### 2.2 Contextual Widgets (P2 - Conditional Display)

#### Pipeline Overview Widget
**File**: `web/app/features/dashboard/components/widgets/PipelineOverviewWidget.tsx`
- [ ] Funnel visualization (horizontal bars)
- [ ] Stage counts (Applied → Screening → Interview → Offer)
- [ ] Color-coded stages
- [ ] CTA: "Manage Pipeline"
- [ ] Visibility: Only if user has 1+ applications

#### Mentor Sessions Widget
**File**: `web/app/features/dashboard/components/widgets/MentorSessionsWidget.tsx`
- [ ] Next session card (mentor name, topic, time, countdown)
- [ ] "Join Session" button (if \u003c 1h away)
- [ ] Past sessions count
- [ ] CTA: "Book Another Session"
- [ ] Visibility: Only if has booked 1+ session

**New feature to add**: 
- [ ] Session reminder badge (if \u003c 1h away)
- [ ] Quick-prep checklist (from SPEC-013 video links)

#### Settlement Checklist Widget
**File**: `web/app/features/dashboard/components/widgets/SettlementChecklistWidget.tsx`
- [ ] Arrival countdown (days until arrival)
- [ ] Progress ring (completed/total tasks)
- [ ] Urgent task list (top 3 due soon)
- [ ] CTA: "View Settlement Plan"
- [ ] Visibility: Only if arrival date is set

**Enhanced from SPEC-019**:
- [ ] Red highlight for tasks due \u003c 14 days
- [ ] Phase indicator (Before Arrival / First Week / First Month)

#### Community Highlights Widget
**File**: `web/app/features/dashboard/components/widgets/CommunityHighlightsWidget.tsx`
- [ ] Top 3 posts from joined communities
- [ ] Post cards: title + community badge + vote count + comment count
- [ ] Trending indicator (hot posts)
- [ ] CTA: "View Community"
- [ ] Visibility: Always (for feature discovery)

**From SPEC-023**:
- [ ] Support for different community categories
- [ ] "Join Community" CTA if not member

### 2.3 Discovery Widgets (P3 - Nice-to-Have)

#### Document Hub Widget
**File**: `web/app/features/dashboard/components/widgets/DocumentHubWidget.tsx`
- [ ] Last 3 uploaded documents (icon + name + date)
- [ ] Storage usage progress bar
- [ ] CTA: "Manage Documents"
- [ ] Visibility: Always (encourage usage)

**From SPEC-007 + SPEC-022**:
- [ ] Show document types (Resume, Portfolio, etc.)
- [ ] Quick preview on hover

#### Notifications Center Widget
**File**: `web/app/features/dashboard/components/widgets/NotificationsWidget.tsx`
- [ ] Unread count badge
- [ ] Last 5 notifications (compact list)
- [ ] Notification types with icons
- [ ] Mark as read functionality
- [ ] CTA: "View All Notifications"

**From SPEC-009**:
- [ ] Push notification status indicator
- [ ] Enable notifications CTA (if not granted)

#### Mentor Application Status Widget (Already Exists - Enhance)
**File**: `web/app/features/dashboard/components/MentorApplicationStatus.tsx` (current)
- [x] Basic status display (existing)
- [ ] Enhanced with rich status messages from SPEC-015:
  - Pending: "Under review, typically 3-5 business days"
  - Approved: Link to mentor dashboard
  - Rejected: Feedback + reapplication date
  - Additional Info Requested: Update application CTA

---

## Phase 3: UX Polish & Optimization (2 days)

### 3.1 Loading States & Error Handling
- [ ] Skeleton loading for each widget
- [ ] Error boundaries with retry buttons
- [ ] Graceful degradation (hide widget if data fails)
- [ ] Loading shimmer animations

**Files**:
- `web/app/features/dashboard/components/layout/WidgetSkeleton.tsx`
- `web/app/features/dashboard/components/shared/ErrorBoundary.tsx`

### 3.2 Mobile Optimization
- [ ] Single-column layout on mobile
- [ ] Widget priority reordering (most important first)
- [ ] Swipeable widget carousel (optional)
- [ ] Touch-friendly CTAs (larger tap targets)

**Breakpoints**:
- Desktop: 2-column grid
- Tablet: 1-column with wide widgets
- Mobile: 1-column with compact widgets

### 3.3 Performance Optimization
- [ ] Implement React.lazy for below-fold widgets
- [ ] Virtualize long lists in widgets
- [ ] Cache widget data with 5-minute TTL
- [ ] Prefetch next likely page on widget hover

**Target Metrics**:
- Time to Interactive (TTI): \u003c 3 seconds
- Largest Contentful Paint (LCP): \u003c 2.5 seconds
- Cumulative Layout Shift (CLS): \u003c 0.1

### 3.4 Analytics Integration
- [ ] Track widget views (scroll depth)
- [ ] Track widget clicks (CTR)
- [ ] Track user journey stage transitions
- [ ] Track priority action completion rate

**Events to track**:
```typescript
- 'dashboard_loaded'
- 'widget_viewed'
- 'widget_clicked'
- 'priority_action_completed'
- 'journey_stage_advanced'
```

### 3.5 Accessibility Audit
- [ ] Screen reader announcements for dynamic content
- [ ] Keyboard navigation for all widgets
- [ ] Focus management (skip to main content)
- [ ] ARIA labels for all interactive elements
- [ ] Color contrast \u003e 4.5:1 for all text

**Tools**:
- Run axe-core automated tests
- Manual screen reader testing (VoiceOver/NVDA)

---

## Phase 4: Advanced Features (2 days, Optional)

### 4.1 Widget Customization
- [ ] Drag-and-drop widget reordering
- [ ] Show/hide widget toggles in settings
- [ ] Widget size options (compact/standard/expanded)
- [ ] Save custom layout to user preferences

**File**: `web/app/features/dashboard/domain/widget-preferences.server.ts`

### 4.2 AI Career Insights (Future)
- [ ] Weekly digest generation using LLM
- [ ] Personalized recommendations
- [ ] Risk alerts (e.g., resume not updated in 30 days)
- [ ] Timeline predictions

**Dependencies**: LLM integration (separate spec needed)

### 4.3 Real-Time Updates
- [ ] Websocket connection for live updates
- [ ] Real-time notification badge updates
- [ ] Optimistic UI updates
- [ ] Auto-refresh stale data

**Technology**: Consider Server-Sent Events (SSE) or WebSockets

### 4.4 Export & Sharing
- [ ] Export dashboard as PDF
- [ ] Share progress with accountability partner
- [ ] Public progress page (optional)

---

## Testing Checklist

### Unit Tests
- [ ] Journey stage detection algorithm
- [ ] Overall progress calculation
- [ ] Priority action sorting
- [ ] Widget visibility conditions

### Integration Tests
- [ ] Dashboard loader fetches all data correctly
- [ ] Widgets display correct data
- [ ] CTAs navigate to correct pages
- [ ] Error states handled gracefully

### E2E Tests (Playwright)
- [ ] New user sees onboarding CTA
- [ ] Active learner sees roadmap snapshot
- [ ] Active applicant sees pipeline overview
- [ ] Settlement stage sees checklist widget
- [ ] Mobile experience (responsive layout)

### Performance Tests
- [ ] Load time \u003c 2s with 10 widgets
- [ ] No memory leaks on repeated navigation
- [ ] Smooth scrolling (60fps)

---

## Success Metrics (Post-Launch)

**Week 1**:
- [ ] Dashboard load time p95 \u003c 2 seconds
- [ ] Widget click-through rate \u003e 30%
- [ ] Feature discovery rate +20%

**Week 4**:
- [ ] DAU increase +30%
- [ ] Time to first meaningful action \u003c 15 seconds
- [ ] User satisfaction (CSAT) \u003e 4.5/5.0

**Month 3**:
- [ ] Priority action completion rate \u003e 60%
- [ ] Journey stage progression rate +25%
- [ ] Overall platform engagement +50%

---

## Migration Plan

### Week 1: Build in Parallel
- New dashboard behind feature flag `ENABLE_NEW_DASHBOARD`
- Old dashboard remains default
- Internal testing only

### Week 2: A/B Test
- 25% of users see new dashboard
- Track comparative metrics (engagement, completion rates)
- Gather user feedback

### Week 3: Rollout
- If metrics positive: 100% rollout
- If metrics negative: iterate based on feedback

### Week 4: Cleanup
- Remove old dashboard code
- Remove feature flag
- Optimize based on real usage data

---

## Open Questions & Decisions Needed

1. **Widget Ordering**: Fixed by platform or user-customizable?
   - **Recommendation**: Phase 1-3 uses fixed order, Phase 4 adds customization

2. **Real-Time Updates**: Polling (5min) or WebSockets?
   - **Recommendation**: Start with polling, add WebSockets in Phase 4

3. **Community Content**: Joined only or trending from all?
   - **Recommendation**: Joined first, trending from recommended categories as fallback

4. **Metrics Dashboard**: Separate page or in-app modal?
   - **Recommendation**: Separate /dashboard/analytics page (Phase 4)

5. **Push Notifications**: Dashboard widget or top-nav badge?
   - **Recommendation**: Both - widget for feed, badge for urgency

---

## Dependencies & Blockers

**Critical Dependencies**:
- SPEC-025 (Diagnosis) - Required for journey stage
- SPEC-016 (Roadmap) - Required for roadmap widget
- SPEC-012 (Mentoring) - Required for sessions widget
- SPEC-019 (Settlement) - Required for checklist widget
- SPEC-023 (Community) - Required for highlights widget

**Technical Blockers**:
- None currently identified
- All required services already exist

**Resource Requirements**:
- 1 Frontend Engineer (7-10 days full-time)
- 1 Designer (2-3 days for widget designs)
- 1 QA Engineer (2 days for testing)

---

**Last Updated**: 2026-01-02  
**Status**: Ready for Implementation →
