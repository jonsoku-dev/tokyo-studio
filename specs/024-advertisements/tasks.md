# Advertisement System - Implementation Tasks

> **Status**: Core Implementation Complete  
> **Last Updated**: 2026-01-02

---

## Phase 1: Planning & Documentation ✅

- [x] Create comprehensive documentation (`docs/advertisements.md`)
- [x] Write implementation plan
- [x] Create spec.md
- [x] Create task checklist

---

## Phase 2: Type Definitions ✅

- [x] Create `types.ts` with core type definitions
  - [x] `LayoutPreset` type
  - [x] `ConsentState` type
  - [x] `AdCardCoreProps` interface
  - [x] `GoogleAdCardProps` interface
  - [x] `HouseAdCardProps` interface
  - [x] `AdSlotProps` discriminated union
  - [x] `HouseAdRequest` interface
  - [x] `HouseAdResponse` interface
  - [x] `HouseAdCreative` interface

---

## Phase 3: Core Components ✅

- [x] Create directory structure
  - [x] `web/app/shared/components/ads/`
  - [x] `web/app/shared/components/ads/core/`
  - [x] `web/app/shared/components/ads/providers/`

- [x] Implement `AdCardCore.tsx`
  - [x] Basic structure (header/body/footer)
  - [x] Layout presets (sidebar/feed/inline)
  - [x] Label prop validation
  - [x] `minHeight` CLS prevention
  - [x] Spacing enforcement utilities
  - [x] Overlay detection guard
  - [x] Proximity warning (dev mode only)

- [x] Implement `AdCardCore.css`
  - [x] Layout-specific styles
  - [x] Spacing utilities with design tokens
  - [x] Safety guard visual indicators
  - [x] Responsive breakpoints

---

## Phase 4: Google Ads Provider ✅

- [x] Implement `GoogleAdsManager.client.tsx`
  - [x] Script loading singleton
  - [x] `loadGoogleAdsScript()` function
  - [x] `pushAdSlot()` with duplicate prevention
  - [x] `clearSlot()` for cleanup
  - [x] Pending slots Set tracking

- [x] Implement `GoogleAdCard.tsx`
  - [x] Props interface with strict typing
  - [x] Label validation (only "Advertisements" | "Sponsored Links")
  - [x] Consent state handling (granted/denied/unknown)
  - [x] Script loading integration
  - [x] Slot push logic
  - [x] Timeout fallback (5 seconds)
  - [x] Route navigation cleanup (useEffect)
  - [x] Error handling and logging
  - [x] SSR safety checks

---

## Phase 5: House Ads Provider ✅

- [x] Implement `useHouseAd.ts` hook
  - [x] `useFetcher` wrapper for `/api/ads/serve`
  - [x] Frequency cap checking (cookie-based)
  - [x] Impression counter increment
  - [x] Return type: `{ data, state, error, refetch }`

- [x] Implement `HouseAdCard.tsx`
  - [x] Props interface
  - [x] `useHouseAd` hook integration
  - [x] Loading state (skeleton)
  - [x] Empty state (graceful, no inventory)
  - [x] Creative rendering component
  - [x] Click tracking
  - [x] Impression tracking
  - [x] Error handling

---

## Phase 6: Database & API ✅

- [x] Update database schema
  - [x] Add `house_ads` table definition to schema.ts
  - [x] Run `pnpm db:push` to apply schema
  - [x] Verify table creation in PostgreSQL

- [x] Create House Ads API route
  - [x] Create `web/app/features/ads/` directory
  - [x] Create `apis/` subdirectory
  - [x] Implement `ads.serve.ts` loader
  - [x] Parse query params (placement, context)
  - [x] Query active ads from database
  - [x] Apply targeting filters
  - [x] Weighted random selection logic
  - [x] Return HouseAdResponse

- [x] Update routes.ts
  - [x] Add API route: `route('api/ads/serve', './features/ads/apis/ads.serve.ts')`
  - [x] Run `pnpm typegen`

- [ ] Seed House Ads data (Optional)
  - [ ] Create seed script
  - [ ] Add 5-10 mock ads with various placements
  - [ ] Run seed script

---

## Phase 7: Entry Point & Barrel Exports ✅

- [x] Implement `AdSlot.tsx`
  - [x] Discriminated union props
  - [x] Provider routing logic (google vs house)
  - [x] Type-safe prop forwarding
  - [x] Default fallback

- [x] Create `index.ts` barrel export
  - [x] Export `AdSlot`
  - [x] Export `AdCardCore`
  - [x] Export all types

- [x] Update `app.css`
  - [x] Import `AdCardCore.css`

---

## Phase 8: Route Integration (Examples)

- [x] Integrate in CommunitySidebar
  - [x] Import `AdSlot`
  - [x] Add Google Ad slot after community info card
  - [x] Configure: `provider="google"`, `layout="sidebar"`
  - [x] Add placeholder slot ID (to be replaced)

- [x] Integrate in communities.explore
  - [x] Import `AdSlot`
  - [x] Add House Ad in feed (after recommended section)
  - [x] Configure: `provider="house"`, `layout="feed"`
  - [x] Pass context: `{ category: 'community', page: 'explore' }`

---

## Phase 9: Code Quality & Fixes

- [x] Fix lint warnings
  - [x] Refactor GoogleAdCard hook order (move hooks before conditional returns)
  - [x] Fix CSS class sorting issues

- [x] Run verification
  - [x] `pnpm typecheck` passes (excluding unrelated map errors)
  - [x] `pnpm biome check .` passes (only cookie warning remains)
  - [x] `pnpm build` succeeds
  - [x] No console errors in dev mode

---

## Phase 10: Testing & Validation

### Automated Tests

- [ ] `pnpm typecheck`
- [ ] `pnpm biome check .`
- [ ] `pnpm build`

### Manual Browser Testing

#### Google Ads
- [ ] SSR safety (no hydration mismatch)
- [ ] Duplicate prevention (route navigation 5x)
- [ ] Consent state handling (denied/unknown/granted)
- [ ] AdBlock fallback (5s timeout)

#### House Ads
- [ ] API integration (network request)
- [ ] Frequency cap (10 impressions max)
- [ ] Targeting verification (context filtering)
- [ ] Empty state (no inventory)

#### UI/UX
- [ ] Lighthouse CLS < 0.1
- [ ] Spacing guards (12px from nav, 24px from CTA)
- [ ] Overlay placement blocked
- [ ] Responsive design (mobile/tablet/desktop)

---

## Phase 11: Polish & Documentation Review

- [x] Add JSDoc comments to all public APIs
- [x] Review placement guidelines accuracy
- [x] Review Google policy checklist completeness
- [x] Test all code examples in documentation

---

## Future Enhancements (V2+)

- [ ] Admin UI for House Ads management
- [ ] Analytics dashboard (CTR, impressions)
- [ ] A/B testing for creative variations
- [ ] GDPR consent banner integration
- [ ] Click tracking with analytics platform
- [ ] Seeding script for development mock ads

---

## Dependencies

- Phase 3 depends on Phase 2  
- Phase 4-5 depend on Phase 3  
- Phase 6 can run in parallel with Phase 4-5  
- Phase 7 depends on Phase 4-5  
- Phase 8 depends on Phase 7  
- Phase 9-10 depend on Phase 8  
- Phase 11 depends on Phase 9-10

---

## Notes

- **Google Ad Unit IDs**: Need actual AdSense account slot IDs for production
- **Consent Management**: Currently defaults to `consentState="granted"` - implement GDPR banner for EU compliance
- **House Ads Admin**: Future work to create admin UI for managing inventory
- **Analytics Integration**: Future work for click/impression tracking
