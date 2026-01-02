# Widget System Architecture - Customizable Dashboard

## Overview

**모든 대시보드 기능을 독립적인 Widget으로 구현**하여 사용자가 자유롭게 배치하고 구성할 수 있는 시스템입니다. `@dnd-kit/core`를 활용하여 드래그 앤 드롭 기능을 제공합니다.

---

## Core Principles

1. **Everything is a Widget**: 모든 기능(Roadmap, Pipeline, Mentoring 등)이 독립적인 Widget 컴포넌트
2. **User Control**: 사용자가 Widget의 순서, 표시 여부, 크기를 자유롭게 설정
3. **Persistent Layout**: 사용자 설정을 DB에 저장하여 모든 디바이스에서 동일한 레이아웃 유지
4. **Responsive**: Desktop(2열), Tablet(1-2열), Mobile(1열) 자동 조정
5. **Smart Defaults**: 신규 사용자에게는 Journey Stage 기반 기본 레이아웃 제공

---

## Widget Catalog

### Available Widgets (10개)

| Widget ID | Name | Priority | Default Visibility |
|-----------|------|----------|-------------------|
| `journey-progress` | Journey Progress Bar | P1 | Always |
| `priority-actions` | Priority Actions | P1 | Always |
| `roadmap-snapshot` | Roadmap Snapshot | P1 | Always |
| `pipeline-overview` | Pipeline Overview | P2 | If has applications |
| `mentor-sessions` | Mentor Sessions | P2 | If has sessions |
| `settlement-checklist` | Settlement Checklist | P2 | If arrival date set |
| `community-highlights` | Community Highlights | P2 | Always |
| `document-hub` | Document Hub | P3 | Always |
| `notifications-center` | Notifications Center | P3 | If notifications enabled |
| `mentor-application` | Mentor Application Status | P3 | If application exists |

---

## Data Model

### Widget Configuration Schema

```typescript
// Database Schema
export const widgetConfigurations = pgTable("widget_configurations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  
  // Widget Layout
  widgets: jsonb("widgets").$type<WidgetLayout[]>().notNull(),
  
  // Metadata
  lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
  version: integer("version").default(1).notNull(), // For schema migrations
});

// TypeScript Types
interface WidgetLayout {
  id: WidgetId;
  order: number; // 0-based index
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

interface WidgetMetadata {
  id: WidgetId;
  name: string;
  description: string;
  icon: LucideIcon;
  defaultSize: 'compact' | 'standard' | 'expanded';
  minSize: 'compact' | 'standard';
  maxSize: 'standard' | 'expanded';
  visibilityCondition?: (user: User) => boolean;
}
```

---

## DnD Implementation using dnd-kit

### 1. Setup

```tsx
// web/app/features/dashboard/components/DashboardGrid.tsx
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export function DashboardGrid() {
  const [widgets, setWidgets] = useState<WidgetLayout[]>(initialWidgets);
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        const reordered = arrayMove(items, oldIndex, newIndex);
        
        // Save to database
        saveWidgetLayout(reordered);
        
        return reordered;
      });
    }
  };
  
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={widgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
        {widgets.filter(w => w.visible).map((widget) => (
          <SortableWidget key={widget.id} widget={widget} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

### 2. Sortable Widget Wrapper

```tsx
// web/app/features/dashboard/components/SortableWidget.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  };
  
  return (
    <div ref={setNodeRef} style={style} className="widget-container">
      {/* Drag Handle */}
      <div className="widget-header" {...attributes} {...listeners}>
        <GripVertical className="drag-handle" />
        <h3>{widgetMetadata[widget.id].name}</h3>
        <WidgetActions widgetId={widget.id} />
      </div>
      
      {/* Widget Content */}
      <WidgetRenderer id={widget.id} size={widget.size} />
    </div>
  );
}
```

### 3. Widget Renderer (Dynamic Import)

```tsx
// web/app/features/dashboard/components/WidgetRenderer.tsx
import { lazy, Suspense } from 'react';

const widgetComponents = {
  'journey-progress': lazy(() => import('./widgets/JourneyProgressWidget')),
  'priority-actions': lazy(() => import('./widgets/PriorityActionsWidget')),
  'roadmap-snapshot': lazy(() => import('./widgets/RoadmapSnapshotWidget')),
  // ... 나머지 widgets
};

export function WidgetRenderer({ id, size }: { id: WidgetId; size: string }) {
  const Component = widgetComponents[id];
  
  return (
    <Suspense fallback={<WidgetSkeleton size={size} />}>
      <Component size={size} />
    </Suspense>
  );
}
```

---

## Widget Actions (Per-Widget Controls)

각 Widget 헤더에 표시되는 액션 버튼들:

```tsx
function WidgetActions({ widgetId }: { widgetId: WidgetId }) {
  return (
    <div className="widget-actions">
      {/* Size Toggle (compact ↔ standard ↔ expanded) */}
      <button onClick={() => toggleSize(widgetId)} aria-label="Resize">
        <Maximize2 size={16} />
      </button>
      
      {/* Hide Widget */}
      <button onClick={() => hideWidget(widgetId)} aria-label="Hide">
        <EyeOff size={16} />
      </button>
      
      {/* Widget Settings (if applicable) */}
      {hasSettings(widgetId) && (
        <button onClick={() => openWidgetSettings(widgetId)} aria-label="Settings">
          <Settings size={16} />
        </button>
      )}
    </div>
  );
}
```

---

## Dashboard Customization UI

### Widget Gallery Modal

사용자가 숨긴 Widget을 다시 추가할 수 있는 UI:

```tsx
// /dashboard/customize 또는 모달
function WidgetGallery() {
  const availableWidgets = getAvailableWidgets(); // 조건 충족하는 위젯만
  const hiddenWidgets = availableWidgets.filter(w => !w.visible);
  
  return (
    <div className="widget-gallery">
      <h2>Add Widgets</h2>
      <div className="widget-grid">
        {hiddenWidgets.map((widget) => (
          <WidgetCard
            key={widget.id}
            widget={widget}
            onAdd={() => showWidget(widget.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

### Reset to Default Button

```tsx
function ResetLayoutButton() {
  return (
    <button onClick={() => resetToDefaultLayout(currentJourneyStage)}>
      Reset to Default Layout
    </button>
  );
}
```

---

## Default Layouts by Journey Stage

신규 사용자나 Reset 시 적용되는 기본 레이아웃:

```typescript
const defaultLayouts: Record<JourneyStage, WidgetLayout[]> = {
  newcomer: [
    { id: 'journey-progress', order: 0, visible: true, size: 'standard', column: 1 },
    { id: 'priority-actions', order: 1, visible: true, size: 'standard', column: 1 },
    { id: 'roadmap-snapshot', order: 2, visible: true, size: 'standard', column: 1 },
    { id: 'community-highlights', order: 3, visible: true, size: 'compact', column: 2 },
    { id: 'document-hub', order: 4, visible: true, size: 'compact', column: 2 },
    // Pipeline, Mentor Sessions 등은 visible: false
  ],
  
  learner: [
    { id: 'roadmap-snapshot', order: 0, visible: true, size: 'expanded', column: 1 },
    { id: 'priority-actions', order: 1, visible: true, size: 'standard', column: 1 },
    { id: 'journey-progress', order: 2, visible: true, size: 'compact', column: 2 },
    { id: 'mentor-sessions', order: 3, visible: true, size: 'standard', column: 2 },
    { id: 'community-highlights', order: 4, visible: true, size: 'compact', column: 2 },
  ],
  
  applicant: [
    { id: 'pipeline-overview', order: 0, visible: true, size: 'expanded', column: 1 },
    { id: 'priority-actions', order: 1, visible: true, size: 'standard', column: 1 },
    { id: 'roadmap-snapshot', order: 2, visible: true, size: 'compact', column: 2 },
    { id: 'mentor-sessions', order: 3, visible: true, size: 'standard', column: 2 },
    { id: 'document-hub', order: 4, visible: true, size: 'compact', column: 2 },
  ],
  
  settlement: [
    { id: 'settlement-checklist', order: 0, visible: true, size: 'expanded', column: 1 },
    { id: 'priority-actions', order: 1, visible: true, size: 'standard', column: 1 },
    { id: 'pipeline-overview', order: 2, visible: true, size: 'compact', column: 2 },
    { id: 'community-highlights', order: 3, visible: true, size: 'standard', column: 2 },
  ],
  
  contributor: [
    { id: 'mentor-application', order: 0, visible: true, size: 'standard', column: 1 },
    { id: 'community-highlights', order: 1, visible: true, size: 'expanded', column: 1 },
    { id: 'mentor-sessions', order: 2, visible: true, size: 'standard', column: 2 },
    { id: 'journey-progress', order: 3, visible: true, size: 'compact', column: 2 },
  ],
};
```

---

## Responsive Behavior

### Desktop (≥ 1024px)
- 2-column grid layout
- Widgets assigned to `column: 1` or `column: 2`
- Drag-and-drop between columns

### Tablet (768px - 1023px)
- 1-2 column hybrid (depending on widget size)
- Expanded widgets take full width
- Standard/Compact widgets can be side-by-side

### Mobile (< 768px)
- Single column layout
- All widgets stack vertically
- Drag-and-drop reorders vertical list
- Compact size automatically applied for all widgets

---

## API Routes

### GET /api/dashboard/widgets
사용자의 Widget 설정 조회

```typescript
export async function loader({ request }: { request: Request }) {
  const userId = await requireUserId(request);
  const config = await widgetService.getConfiguration(userId);
  
  // 설정 없으면 Journey Stage 기반 기본값 생성
  if (!config) {
    const stage = await getUserJourneyStage(userId);
    const defaultConfig = defaultLayouts[stage];
    await widgetService.saveConfiguration(userId, defaultConfig);
    return json({ widgets: defaultConfig });
  }
  
  return json({ widgets: config.widgets });
}
```

### POST /api/dashboard/widgets
Widget 레이아웃 저장

```typescript
export async function action({ request }: { request: Request }) {
  const userId = await requireUserId(request);
  const { widgets } = await request.json();
  
  // Validate
  const isValid = validateWidgetLayout(widgets);
  if (!isValid) {
    return json({ error: 'Invalid widget configuration' }, { status: 400 });
  }
  
  // Save
  await widgetService.saveConfiguration(userId, widgets);
  
  return json({ success: true });
}
```

---

## Widget State Management

### Optimistic Updates

```tsx
function useDashboardWidgets() {
  const [widgets, setWidgets] = useState<WidgetLayout[]>([]);
  const fetcher = useFetcher();
  
  const reorderWidgets = (newOrder: WidgetLayout[]) => {
    // Optimistic update
    setWidgets(newOrder);
    
    // Persist to server
    fetcher.submit(
      { widgets: JSON.stringify(newOrder) },
      { method: 'post', action: '/api/dashboard/widgets' }
    );
  };
  
  const toggleWidgetVisibility = (widgetId: WidgetId) => {
    const updated = widgets.map(w =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    );
    reorderWidgets(updated);
  };
  
  const changeWidgetSize = (widgetId: WidgetId, newSize: WidgetSize) => {
    const updated = widgets.map(w =>
      w.id === widgetId ? { ...w, size: newSize } : w
    );
    reorderWidgets(updated);
  };
  
  return { widgets, reorderWidgets, toggleWidgetVisibility, changeWidgetSize };
}
```

---

## Accessibility

### Keyboard Navigation

```tsx
// Add keyboard shortcuts for widget management
useEffect(() => {
  const handleKeyboard = (e: KeyboardEvent) => {
    // Ctrl/Cmd + E: Enter edit mode (show drag handles)
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      setEditMode(true);
    }
    
    // Escape: Exit edit mode
    if (e.key === 'Escape' && editMode) {
      setEditMode(false);
    }
  };
  
  window.addEventListener('keydown', handleKeyboard);
  return () => window.removeEventListener('keydown', handleKeyboard);
}, [editMode]);
```

### Screen Reader Announcements

```tsx
<div role="region" aria-label="Customizable Dashboard">
  <div aria-live="polite" className="sr-only">
    {isDragging && `Moving ${activeWidget?.name}`}
    {dropSuccess && `${activeWidget?.name} moved successfully`}
  </div>
  
  {/* Widget grid */}
</div>
```

---

## Migration Strategy

### Phase 1: Existing Users
- 현재 대시보드를 사용 중인 유저는 기본 레이아웃으로 마이그레이션
- Journey Stage 감지하여 적절한 기본값 적용

```typescript
async function migrateExistingUsers() {
  const usersWithoutConfig = await db.query.users.findMany({
    where: notExists(
      db.select().from(widgetConfigurations)
        .where(eq(widgetConfigurations.userId, users.id))
    )
  });
  
  for (const user of usersWithoutConfig) {
    const stage = await getUserJourneyStage(user.id);
    const defaultLayout = defaultLayouts[stage];
    
    await widgetService.saveConfiguration(user.id, defaultLayout);
  }
}
```

---

## Future Enhancements

1. **Widget Marketplace**: 커뮤니티가 만든 커스텀 위젯 공유
2. **Layout Templates**: 인기 있는 레이아웃 템플릿 제공
3. **Multiple Dashboards**: 여러 개의 대시보드 프리셋 (Focus, Overview 등)
4. **Widget Sharing**: 친구에게 내 대시보드 레이아웃 공유
5. **Smart Suggestions**: AI가 사용 패턴 분석해서 최적 레이아웃 제안

---

**Last Updated**: 2026-01-02  
**Status**: Core Feature (Phase 1)
