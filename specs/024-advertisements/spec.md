# SPEC-024: Advertisement System (Core + Provider)

> **Status**: Implementation Complete (Core + API)  
> **Last Updated**: 2026-01-02  
> **Dependencies**: Design System v4, Drizzle ORM, React Router v7

> [!IMPORTANT]
> **필수 참조 문서**: 이 스펙을 구현하기 전에 반드시 [`docs/advertisements.md`](file:///Users/jongseoklee/Documents/GitHub/itcom/docs/advertisements.md)를 먼저 읽어야 합니다.  
> 해당 문서에는 상세한 아키텍처, Google 정책 준수 가이드, 안전 가드, 구현 예시, 트러블슈팅 등이 포함되어 있습니다.

---

## Overview

A comprehensive advertisement card system built on **Core + Provider** architecture to support both **Google Ads** (external) and **House Ads** (internal). The system guarantees UI/UX stability, Google policy compliance, and graceful degradation across edge cases (SSR, AdBlock, network failures).

---

## Architecture

### Core Principles

1. **Separation of Concerns**: UI/레이아웃은 Core, 정책/로딩/재고는 Provider
2. **CLS Prevention**: Cumulative Layout Shift 방지 (skeleton/minHeight)
3. **Graceful Degradation**: 실패 시 조용히 fallback (콘솔 스팸 금지)
4. **SSR-Safe**: `window` 접근 방지, hydration mismatch 없음
5. ** Google Policy-First**: 정책 준수를 "문서가 아니라 코드로" 강제

### Component Hierarchy

```
AdSlot (Entry Point)
 ├─> GoogleAdCard (Provider)
 │    └─> AdCardCore (Frame)
 │         ├─> Header (label + title)
 │         ├─> Body (ad content)
 │         └─> Footer
 └─> HouseAdCard (Provider)
      └─> AdCardCore (Frame)
           ├─> Header (label + title)
           ├─> Body (ad creative)
           └─> Footer
```

---

## Components

For detailed component documentation, see [`docs/advertisements.md`](file:///Users/jongseoklee/Documents/GitHub/itcom/docs/advertisements.md).

### Core: AdCardCore

**Location**: `web/app/shared/components/ads/core/AdCardCore.tsx`

**Responsibilities**:
- Common card frame (header/body/footer)
- Layout presets configuration (sidebar/feed/inline)
- CLS prevention via `minHeight`
- Safety guards:
  - Mandatory labeling area
  - Spacing enforcement (12px minimum from navigation)
  - Overlay placement blocking (default)

**Props**:
```typescript
interface AdCardCoreProps {
  label: string;
  title?: string;
  rightAction?: ReactNode;
  layout: 'sidebar' | 'feed' | 'inline';
  minHeight?: string;
  children: ReactNode;
  footer?: ReactNode;
  allowInOverlay?: boolean;
  className?: string;
}
```

### Provider: GoogleAdCard

**Location**: `web/app/shared/components/ads/providers/GoogleAdCard.tsx`

**Responsibilities**:
- Google Ads script loading (singleton)
- Duplicate slot prevention
- Consent management (`granted` | `denied` | `unknown`)
- Policy-compliant labeling (enforced)
- Timeout fallback (5s)
- Route navigation cleanup

**Props**:
```typescript
interface GoogleAdCardProps {
  slot: string; // Ad Unit ID
  layout: LayoutPreset;
  consentState?: ConsentState;
  fallback?: ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}
```

**Policy Compliance**:
- ✅ Labels must be "Advertisements" or "Sponsored Links" (enforced in code)
- ✅ Minimum spacing from navigation (12px)
- ✅ Overlay/modal placement blocked by default
- ✅ No misleading UI patterns

### Provider: HouseAdCard

**Location**: `web/app/shared/components/ads/providers/HouseAdCard.tsx`

**Responsibilities**:
- Server-side ad fetching (`/api/ads/serve`)
- Frequency cap enforcement (10 impressions/day)
- Graceful empty state (no inventory)
- Click/impression tracking
- Targetingz support (category, page)

**Props**:
```typescript
interface HouseAdCardProps {
  placement: string;
  layout: LayoutPreset;
  context?: HouseAdContext;
  fallback?: ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}
```

### Entry Point: AdSlot

**Location**: `web/app/shared/components/ads/AdSlot.tsx`

**Responsibilities**:
- Unified entry point with discriminated union
- Type-safe provider routing

**Usage**:
```typescript
// Google Ads
<AdSlot
  provider="google"
  slot="1234567890"
  layout="sidebar"
  consentState="granted"
/>

// House Ads
<AdSlot
  provider="house"
  placement="feed-middle"
  layout="feed"
  context={{ category: 'frontend', page: 'dashboard' }}
/>
```

---

## Database Schema

### `house_ads` Table

**Location**: `packages/database/src/schema.ts`

```typescript
export const houseAds = pgTable("house_ads", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  ctaText: text("cta_text").notNull(),
  ctaUrl: text("cta_url").notNull(),
  
  // Placement & Targeting
  placement: text("placement").notNull(),
  targetCategories: jsonb("target_categories").$type<string[]>(),
  targetPages: jsonb("target_pages").$type<string[]>(),
  
  // Ad Management
  weight: integer("weight").default(1).notNull(),
  status: text("status").default("active").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  
  // Analytics
  impressions: integer("impressions").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**Indexes**:
- `placement` (filtering by placement)
- `status` (active ads query)
- `startDate, endDate` (date range filtering)

---

## API Routes

### `GET /api/ads/serve`

**Location**: `web/app/features/ads/apis/ads.serve.ts`

**Query Parameters**:
- `placement` (required): Ad placement (sidebar, feed-top, etc.)
- `context` (optional): JSON string with targeting context

**Response**:
```typescript
interface HouseAdResponse {
  success: boolean;
  ad?: HouseAdCreative;
  reason?: 'no-inventory' | 'filtered' | 'frequency-capped';
}
```

**Logic**:
1. Parse query params
2. Query active ads (by placement, status, date range)
3. Apply targeting filters (category, page)
4. Weighted random selection
5. Increment impression count
6. Return ad creative

---

## Layout Presets

### Sidebar
- **Size**: `280px × 400px`
- **Min Height**: `400px`
- **Use Case**: Fixed sidebar ads

### Feed
- **Size**: `100% × auto` (responsive)
- **Min Height**: `200px`
- **Use Case**: Inline feed ads (between posts)

### Inline
- **Size**: Content width
- **Min Height**: `150px`
- **Use Case**: In-content ads (blog posts, articles)

---

## Safety Guards

### 1. SSR Safety
- `window` access only in `useEffect`
- No hydration mismatch
- Client-only hooks (`.client.tsx` suffix)

### 2. Duplicate Prevention
- Singleton script loading
- Pending slots tracking (`Set<string>`)
- Route navigation cleanup

### 3. Frequency Capping
- Cookie-based tracking (`house_ad_shown`)
- 10 impressions per day
- Graceful empty state after cap

### 4. Policy Compliance (Google)
- Label validation (runtime error on invalid labels)
- Minimum spacing enforcement
- Overlay placement blocking
- No misleading UI patterns

---

## Testing Guidelines

### Automated Tests
```bash
pnpm typecheck
pnpm biome check .
pnpm build
```

### Manual Verification
- **SSR**: No `window is not defined` errors
- **Duplicate Slots**: `adsbygoogle.push()` called once per slot
- **Consent**: Verify `denied`/`unknown`/`granted` states
- **AdBlock**: Fallback UI after 5s timeout
- **Frequency Cap**: Empty state after 10 impressions
- **CLS**: Lighthouse CLS < 0.1

---

## Integration Examples

### Example 1: Sidebar (Google Ads)

**File**: `web/app/features/community/components/CommunitySidebar.tsx`

```tsx
import { AdSlot } from '~/shared/components/ads';

export function CommunitySidebar() {
  return (
    <aside>
      {/* Other sidebar content */}
      
      <AdSlot
        provider="google"
        slot="YOUR_SLOT_ID"
        layout="sidebar"
        consentState="granted"
      />
    </aside>
  );
}
```

### Example 2: Feed (House Ads)

**File**: `web/app/features/community/routes/communities.explore.tsx`

```tsx
import { AdSlot } from '~/shared/components/ads';

export default function CommunitiesExplore() {
  return (
    <div className="feed">
      {communities.slice(0, 6).map(community => (
        <CommunityCard key={community.id} {...community} />
      ))}
      
      <AdSlot
        provider="house"
        placement="feed-middle"
        layout="feed"
        context={{ category: 'community', page: 'explore' }}
      />
      
      {communities.slice(6).map(community => (
        <CommunityCard key={community.id} {...community} />
      ))}
    </div>
  );
}
```

---

## Placement Guidelines

### ✅ DO
- Feed top/middle (every 3-5 items)
- Sidebar fixed areas
- End of content (above footer)

### ❌ DON'T
- Modal/dialog interiors
- Directly below navigation
- Adjacent to primary CTA buttons
- Near form submit buttons

---

## Future Enhancements

1. **Admin UI**: Manage House Ads inventory (create, edit, archive)
2. **Analytics Dashboard**: Click-through rates, impression stats
3. **A/B Testing**: Creative variations, placement optimization
4. **GDPR Compliance**: Consent banner integration
5. **Click Tracking**: Full analytics integration
6. **Seeding Script**: Mock ads for development

---

## Migration Notes

None (new feature).

---

## Related Documentation

- [Full Documentation](file:///Users/jongseoklee/Documents/GitHub/itcom/docs/advertisements.md)
- [Design System v4](file:///Users/jongseoklee/Documents/GitHub/itcom/web/docs/design-system.md)
- [Project Rules](file:///Users/jongseoklee/Documents/GitHub/itcom/.agent/rules/project_rules.md)

---

## Changelog

### 2026-01-02 - Initial Implementation
- ✅ Core components (`AdCardCore`)
- ✅ Google Ads provider
- ✅ House Ads provider
- ✅ Database schema (`house_ads`)
- ✅ API route (`/api/ads/serve`)
- ✅ Type definitions
- ✅ Safety guards
- ✅ Documentation
