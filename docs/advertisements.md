# Advertisement System (広告システム)

> **Architecture**: Core + Provider Pattern  
> **Providers**: Google Ads (外部) + House Ads (自体 운영)  
> **Philosophy**: UI/UX 안정성 보장, 정책 준수 코드 강제, SSR 안전성

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Core Components](#3-core-components)
4. [Providers](#4-providers)
5. [Google Ads Policy Compliance](#5-google-ads-policy-compliance)
6. [House Ads System](#6-house-ads-system)
7. [Layout Presets](#7-layout-presets)
8. [Safety Guards](#8-safety-guards)
9. [Implementation Guide](#9-implementation-guide)
10. [Testing & Verification](#10-testing--verification)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. System Overview

### Goals

✅ **Universal Placement**: 광고 슬롯을 어디에 꽂아도 UI가 깨지지 않는 범용성  
✅ **Resilient UX**: 광고 차단/네트워크 실패/SSR에서도 안정적인 UX  
✅ **Policy-First**: Google 정책 준수를 "문서가 아니라 코드로" 강제  
✅ **Unified Experience**: 자체 광고도 동일한 카드 톤/레이아웃 규격으로 관리

### Core Principles

- **Separation of Concerns**: UI/레이아웃은 Core, 정책/로딩/재고는 Provider
- **CLS Prevention**: Cumulative Layout Shift 방지 (skeleton/minHeight)
- **Graceful Degradation**: 실패 시 조용히 fallback (콘솔 스팸 금지)
- **SSR-Safe**: `window` 접근 방지, hydration mismatch 없음

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────┐
│                   AdSlot (Entry)                    │
│  - Provider 선택 (discriminated union)              │
│  - Props validation                                 │
└──────────────────┬──────────────────────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
┌──────▼──────┐        ┌──────▼──────┐
│ GoogleAdCard│        │ HouseAdCard │
│  (Provider) │        │  (Provider) │
└──────┬──────┘        └──────┬──────┘
       │                       │
       └───────────┬───────────┘
                   │
           ┌───────▼────────┐
           │  AdCardCore    │
           │ (공통 프레임)  │
           └────────────────┘
```

### Component Hierarchy

```tsx
<AdSlot provider="google" slot="7654321" layout="sidebar" />
  └─> <GoogleAdCard {...props}>
        └─> <AdCardCore 
              label="Advertisements"
              layout="sidebar"
              minHeight="280px">
              {/* Google Ads Script Rendering */}
            </AdCardCore>
      </GoogleAdCard>

<AdSlot provider="house" placement="feed-top" />
  └─> <HouseAdCard {...props}>
        └─> <AdCardCore 
              label="Sponsored"
              layout="feed"
              minHeight="200px">
              {/* House Ad Creative */}
            </AdCardCore>
      </HouseAdCard>
```

---

## 3. Core Components

### 3.1 AdCardCore

**책임**: 공통 카드 프레임 제공

#### Props API

```typescript
interface AdCardCoreProps {
  // Visual Structure
  label: string;              // Required: "Advertisements" | "Sponsored" | "Ad"
  title?: string;             // Optional header title
  rightAction?: React.ReactNode;
  
  // Layout
  layout: 'sidebar' | 'feed' | 'inline';
  minHeight?: string;         // CLS 방지
  
  // Content
  children: React.ReactNode;  // Provider가 렌더하는 광고 영역
  footer?: React.ReactNode;
  
  // Safety
  allowInOverlay?: boolean;   // Default: false
  className?: string;
}
```

#### Structure

```tsx
<div className="ad-card-core" data-layout={layout}>
  {/* Header */}
  <header className="ad-card-header">
    <span className="ad-label">{label}</span>
    {title && <h3>{title}</h3>}
    {rightAction}
  </header>
  
  {/* Body: Provider Rendering Area */}
  <div className="ad-card-body" style={{ minHeight }}>
    {children}
  </div>
  
  {/* Footer */}
  {footer && <footer className="ad-card-footer">{footer}</footer>}
</div>
```

#### Safety Guards (Built-in)

✅ **라벨 영역 강제**: 광고임을 명확히 표시  
✅ **Spacing 강제**: 인접 액션(CTA/네비) 사이 최소 간격 12px  
✅ **Overlay 차단**: `allowInOverlay=false` 기본값 (실수 모달 배치 방지)

---

## 4. Providers

### 4.1 Provider Interface

```typescript
interface AdProviderProps {
  layout: LayoutPreset;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  fallback?: React.ReactNode;
}
```

### 4.2 Provider Responsibilities

- **Google Provider**: 스크립트 로딩, 중복 방지, consent 관리, 정책 준수
- **House Provider**: 서버 연동, 재고 관리, frequency cap, targeting

---

## 5. Google Ads Policy Compliance

> **철학**: 정책을 "문서"가 아니라 "코드"로 강제

### 5.1 Mandatory Labeling

**Google 정책**: 광고는 주변 콘텐츠와 명확히 구분되어야 함

```typescript
// ✅ ALLOWED
const ALLOWED_GOOGLE_LABELS = ['Advertisements', 'Sponsored Links'] as const;

// ❌ FORBIDDEN
// - "Links", "Resources" (오해 유발)
// - "" (라벨 없음)
```

**강제 방법**:

```typescript
// GoogleAdCard.tsx
function GoogleAdCard({ label, ...props }: GoogleAdCardProps) {
  if (!ALLOWED_GOOGLE_LABELS.includes(label)) {
    throw new Error(
      `Google Ads Policy Violation: label must be one of ${ALLOWED_GOOGLE_LABELS.join(', ')}`
    );
  }
  // ...
}
```

### 5.2 Accidental Click Prevention

**Google 정책**: 실수로 클릭을 유도하는 배치 금지

#### Code-Level Guards

```typescript
// AdCardCore.tsx
const MIN_SPACING_FROM_NAV = 12; // px

function AdCardCore({ layout, allowInOverlay = false }: AdCardCoreProps) {
  // 1. Overlay 내부 배치 차단
  if (!allowInOverlay && isInOverlay()) {
    console.warn('Ad blocked: placement in overlay/modal is not allowed');
    return null;
  }
  
  // 2. Navigation 인접 검사 (개발 모드)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const navElements = document.querySelectorAll('nav, [role="navigation"]');
      // Check proximity and warn
    }
  }, []);
}
```

#### Spacing Standards

```css
/* app.css - Ad Card Spacing */
@layer components {
  .ad-card-core {
    /* 상하 최소 간격 */
    margin-block: --spacing(3); /* 12px */
    
    /* 네비/메인 액션과 구분 */
    &:has(+ nav),
    &:has(+ button[type="submit"]) {
      margin-bottom: --spacing(6); /* 24px */
    }
  }
}
```

### 5.3 Prohibited UI Patterns

❌ **절대 금지**:

1. **화살표/포인터로 광고 가리키기**
2. **"여기 클릭!" 등의 유도 텍스트 인접 배치**
3. **광고를 콘텐츠처럼 위장** (예: 게시물 목록 안에 숨기기)
4. **광고 라벨을 배경색과 동일하게 처리**

### 5.4 Consent Management

```typescript
type ConsentState = 'granted' | 'denied' | 'unknown';

function GoogleAdCard({ consentState = 'unknown' }: GoogleAdCardProps) {
  if (consentState === 'denied') {
    return null; // 요청 차단
  }
  
  if (consentState === 'unknown') {
    return <AdCardCore label="Advertisements">
      <div className="consent-pending">
        <p>광고 표시를 위해 쿠키 동의가 필요합니다</p>
      </div>
    </AdCardCore>;
  }
  
  // consentState === 'granted'
  return <GoogleAdsScript ... />;
}
```

---

## 6. House Ads System

### 6.1 Server API

#### Endpoint

```
GET /api/ads/serve?placement={placement}&context={context}
```

#### Request

```typescript
interface HouseAdRequest {
  placement: 'sidebar' | 'feed-top' | 'feed-middle' | 'inline';
  context?: {
    category?: string;      // "frontend", "backend", "infrastructure"
    page?: string;          // "dashboard", "pipeline", "community"
    userId?: string;        // 로그인 사용자 ID (targeting)
  };
}
```

#### Response

```typescript
interface HouseAdResponse {
  success: boolean;
  ad?: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    ctaText: string;
    ctaUrl: string;
    trackingId: string;   // 클릭/노출 추적용
  };
  reason?: 'no-inventory' | 'filtered' | 'frequency-capped';
}
```

### 6.2 Frequency Capping

```typescript
// Cookie-based frequency cap
const FREQUENCY_CAP_KEY = 'house_ad_shown';
const MAX_IMPRESSIONS_PER_DAY = 10;

function checkFrequencyCap(): boolean {
  const shown = parseInt(getCookie(FREQUENCY_CAP_KEY) || '0');
  return shown < MAX_IMPRESSIONS_PER_DAY;
}

function incrementFrequencyCap() {
  const shown = parseInt(getCookie(FREQUENCY_CAP_KEY) || '0');
  setCookie(FREQUENCY_CAP_KEY, (shown + 1).toString(), { 
    maxAge: 86400 // 24시간
  });
}
```

### 6.3 Targeting Logic

```typescript
// Server-side targeting
export async function serveHouseAd(request: HouseAdRequest) {
  const { placement, context } = request;
  
  // 1. 재고 조회
  const inventory = await db.query.houseAds.findMany({
    where: and(
      eq(houseAds.placement, placement),
      eq(houseAds.status, 'active'),
      gte(houseAds.startDate, new Date()),
      lte(houseAds.endDate, new Date())
    )
  });
  
  // 2. Targeting 필터
  const filtered = inventory.filter(ad => {
    if (ad.targetCategories && context?.category) {
      return ad.targetCategories.includes(context.category);
    }
    return true;
  });
  
  // 3. 가중치 기반 랜덤 선택
  const selected = weightedRandom(filtered);
  
  return selected || { success: false, reason: 'no-inventory' };
}
```

### 6.4 Graceful Empty State

```tsx
// HouseAdCard.tsx
function HouseAdCard({ placement }: HouseAdCardProps) {
  const { data, state } = useFetcher<HouseAdResponse>();
  
  if (state === 'loading') {
    return <AdCardCore label="Sponsored" layout="sidebar">
      <Skeleton height="200px" />
    </AdCardCore>;
  }
  
  if (!data?.success) {
    // 재고 없음: 조용히 빈 상태 (레이아웃 유지)
    return <AdCardCore label="Sponsored" layout="sidebar" minHeight="200px">
      <div className="empty-ad" />
    </AdCardCore>;
  }
  
  return <AdCardCore label="Sponsored" layout="sidebar">
    <HouseAdCreative ad={data.ad} />
  </AdCardCore>;
}
```

---

## 7. Layout Presets

### 7.1 Sidebar

**용도**: 사이드바 고정 영역  
**크기**: `280px × 400px`  
**CLS 방지**: `minHeight="400px"`

```tsx
<AdSlot 
  provider="google" 
  slot="7654321" 
  layout="sidebar"
/>
```

### 7.2 Feed

**용도**: 피드 중간 삽입  
**크기**: 반응형 (`100% × auto`, 최소 `200px`)  
**CLS 방지**: `minHeight="200px"`

```tsx
<AdSlot 
  provider="house" 
  placement="feed-middle" 
  layout="feed"
/>
```

### 7.3 Inline

**용도**: 본문 중간 삽입  
**크기**: 컨텐츠 너비에 맞춤  
**CLS 방지**: `minHeight="150px"`

```tsx
<AdSlot 
  provider="house" 
  placement="inline" 
  layout="inline"
/>
```

---

## 8. Safety Guards

### 8.1 SSR Safety

```typescript
// useGoogleAds.client.tsx (client-only hook)
import { useEffect, useState } from 'react';

export function useGoogleAds(slot: string) {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // window 접근은 오직 여기서만
    if (typeof window === 'undefined') return;
    
    // Google Ads 스크립트 로딩
    loadGoogleAdsScript().then(() => setLoaded(true));
  }, []);
  
  return { loaded };
}
```

### 8.2 Duplicate Prevention

```typescript
// GoogleAdsManager.client.tsx
let googleAdsScriptLoaded = false;
const pendingSlots = new Set<string>();

export async function loadGoogleAdsScript() {
  if (googleAdsScriptLoaded) return;
  
  const script = document.createElement('script');
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  script.async = true;
  document.head.appendChild(script);
  
  await new Promise((resolve) => {
    script.onload = resolve;
  });
  
  googleAdsScriptLoaded = true;
}

export function pushAdSlot(slot: string) {
  if (pendingSlots.has(slot)) {
    console.warn(`Ad slot ${slot} already pushed`);
    return;
  }
  
  pendingSlots.add(slot);
  (window.adsbygoogle = window.adsbygoogle || []).push({});
}
```

### 8.3 Route Navigation Cleanup

```typescript
// GoogleAdCard.tsx
function GoogleAdCard({ slot }: GoogleAdCardProps) {
  const location = useLocation();
  
  useEffect(() => {
    // 라우트 이동 시 슬롯 재설정
    return () => {
      pendingSlots.delete(slot);
    };
  }, [location.pathname, slot]);
  
  // ...
}
```

### 8.4 Timeout & Fallback

```typescript
const AD_LOAD_TIMEOUT = 5000; // 5초

function GoogleAdCard({ slot, fallback }: GoogleAdCardProps) {
  const [timedOut, setTimedOut] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, AD_LOAD_TIMEOUT);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (timedOut) {
    return fallback || <AdCardCore label="Advertisements">
      <div className="ad-fallback">광고를 불러올 수 없습니다</div>
    </AdCardCore>;
  }
  
  // ...
}
```

---

## 9. Implementation Guide

### 9.1 File Structure

```
web/app/
├── shared/
│   └── components/
│       └── ads/
│           ├── core/
│           │   ├── AdCardCore.tsx
│           │   └── AdCardCore.css
│           ├── providers/
│           │   ├── GoogleAdCard.tsx
│           │   ├── GoogleAdsManager.client.tsx
│           │   ├── HouseAdCard.tsx
│           │   └── useHouseAd.ts
│           ├── AdSlot.tsx
│           ├── types.ts
│           └── index.ts
└── features/
    └── */
        └── routes/
            └── *.tsx  # AdSlot 사용 예시
```

### 9.2 Basic Usage

#### Google Ads

```tsx
import { AdSlot } from '~/shared/components/ads';

export default function SidebarLayout() {
  return (
    <aside>
      <AdSlot 
        provider="google"
        slot="7654321"
        layout="sidebar"
        consentState="granted"
      />
    </aside>
  );
}
```

#### House Ads

```tsx
import { AdSlot } from '~/shared/components/ads';

export default function FeedPage() {
  return (
    <div className="feed">
      {posts.slice(0, 3).map(post => <PostCard key={post.id} {...post} />)}
      
      <AdSlot 
        provider="house"
        placement="feed-middle"
        layout="feed"
        context={{ category: 'frontend', page: 'dashboard' }}
      />
      
      {posts.slice(3).map(post => <PostCard key={post.id} {...post} />)}
    </div>
  );
}
```

### 9.3 Placement Guidelines

#### ✅ DO

- 피드 상단/중간 (3~5개 항목마다)
- 사이드바 고정 영역
- 본문 끝 (관련 콘텐츠 이후)

#### ❌ DON'T

- 모달/다이얼로그 내부
- 네비게이션 바로 아래
- 주요 CTA 버튼 옆
- 폼 제출 버튼 근처

### 9.4 Advanced: Custom Fallback

```tsx
<AdSlot
  provider="google"
  slot="7654321"
  layout="sidebar"
  fallback={
    <AdCardCore label="Sponsored" layout="sidebar">
      <div className="custom-fallback">
        <img src="/house-ad-placeholder.webp" alt="광고" />
        <p>광고를 불러올 수 없습니다</p>
      </div>
    </AdCardCore>
  }
/>
```

---

## 10. Testing & Verification

### 10.1 SSR Safety

```bash
# 1. 빌드
pnpm build

# 2. Production 모드 실행
pnpm start

# 3. 브라우저에서 광고 슬롯 확인
# - window 접근 에러 없음
# - hydration mismatch 없음
```

### 10.2 Duplicate Prevention

```tsx
// Test: 라우트 이동 5회 반복
// Expected: 각 슬롯당 1번만 push
// Actual: Console에서 `adsbygoogle.push()` 호출 횟수 확인
```

### 10.3 AdBlock Detection

```tsx
// Test: AdBlock 확장 프로그램 활성화
// Expected: Fallback UI 표시
// Actual: 5초 후 fallback 렌더링 확인
```

### 10.4 Consent State

```tsx
// Test: consentState = 'denied'
// Expected: 광고 요청 차단, null 렌더링
// Actual: Network 탭에서 Google Ads 요청 없음
```

### 10.5 Frequency Cap

```tsx
// Test: HouseAd 10회 노출 후
// Expected: 11번째부터 빈 상태
// Actual: Cookie `house_ad_shown=10` 확인
```

---

## 11. Troubleshooting

### 11.1 광고가 표시되지 않음

**Symptoms**: 빈 영역만 보임

**Checklist**:

1. ✅ `consentState`가 `'granted'`인지 확인
2. ✅ Google Ads 스크립트 로딩 완료 확인 (Network 탭)
3. ✅ AdBlock 비활성화
4. ✅ slot ID 올바른지 확인
5. ✅ Console에 에러 없는지 확인

### 11.2 중복 로딩

**Symptoms**: 같은 광고가 여러 번 요청됨

**Solutions**:

```typescript
// GoogleAdsManager.client.tsx에서 pendingSlots 확인
console.log('Pending slots:', Array.from(pendingSlots));

// 중복 push 방지 로직 작동 확인
```

### 11.3 SSR Hydration Mismatch

**Symptoms**: Warning: Text content did not match

**Solutions**:

```tsx
// ❌ BAD: SSR에서 조건부 렌더링
function GoogleAdCard({ slot }: GoogleAdCardProps) {
  if (typeof window === 'undefined') return null; // Mismatch!
  // ...
}

// ✅ GOOD: useEffect로 클라이언트 전용 처리
function GoogleAdCard({ slot }: GoogleAdCardProps) {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);
  
  return <AdCardCore>
    {loaded && <GoogleAdsScript />}
  </AdCardCore>;
}
```

### 11.4 House Ads 재고 없음

**Symptoms**: 항상 빈 상태

**Solutions**:

```bash
# 1. DB에 재고 확인
psql -d itcom -c "SELECT * FROM house_ads WHERE status = 'active';"

# 2. Targeting 조건 완화
# context.category를 제거하고 테스트

# 3. Server 로그 확인
# "no-inventory" reason 확인
```

### 11.5 Layout Shift

**Symptoms**: 광고 로딩 시 페이지가 밀림

**Solutions**:

```tsx
// minHeight 명시적 설정
<AdSlot 
  provider="google" 
  slot="7654321" 
  layout="sidebar"
  minHeight="400px"  // ← 필수
/>
```

---

## Appendix A: Google Ads Policy Checklist

- [ ] 라벨이 "Advertisements" 또는 "Sponsored Links"인가?
- [ ] 라벨이 배경색과 구분되는 색상인가?
- [ ] 광고 영역과 네비게이션 사이 최소 12px 간격?
- [ ] 광고 영역과 주요 CTA 사이 최소 24px 간격?
- [ ] 모달/오버레이 내부 배치 없음?
- [ ] "여기 클릭", 화살표 등 유도 요소 없음?
- [ ] 광고를 콘텐츠처럼 위장하지 않음?

## Appendix B: Performance Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| CLS | < 0.1 | Lighthouse Report |
| Ad Load Time | < 3s | Performance.measure() |
| Fallback Activation | < 5s | Timeout 설정 |
| Script Size | < 50KB | Network Tab (gzip) |

---

**Last Updated**: 2026-01-02  
**Version**: 1.0.0  
**Contributors**: Development Team
