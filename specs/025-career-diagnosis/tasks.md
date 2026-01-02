# Implementation Tasks: Career Diagnosis

**Feature**: SPEC-025 Career Diagnosis  
**Status**: ✅ **Completed** (Retroactive Documentation)  
**Implementation Date**: 2025-12 (Estimated)  
**Documentation Date**: 2026-01-02

> **Note**: This feature is already implemented and functional. This task list documents what was built.

---

## Phase 1: Database Schema ✅

### 1.1 Profile Table
- [x] Create `profiles` table in schema
  - [x] Add core diagnosis fields: `jobFamily`, `level`, `jpLevel`, `enLevel`, `targetCity`
  - [x] Add profile enhancement fields: `bio`, `slug`, `website`, `linkedinUrl`, `githubUrl`
  - [x] Add FK to `users.id` via `userId`
  - [x] Add FK to `documents.id` via `portfolioDocumentId`
  - [x] Add timestamps: `createdAt`, `updatedAt`
  - [x] Add unique constraint on `slug`

### 1.2 Schema Validation
- [x] Export `insertProfileSchema` and `selectProfileSchema` using drizzle-zod
- [x] Export type helpers: `SelectProfile`, `InsertProfile`
- [x] Define relations to `users` and `documents` tables

---

## Phase 2: Service Layer ✅

### 2.1 Diagnosis Service
**File**: `web/app/features/diagnosis/domain/diagnosis.service.server.ts`

- [x] Implement `createProfile(data: InsertProfile)`
  - [x] Insert new profile to database
  - [x] Return created profile
- [x] Implement `getProfile(userId: string)`
  - [x] Query profile by userId
  - [x] Return single profile or undefined
- [x] Implement `updateProfile(userId, data)`
  - [x] Update existing profile
  - [x] Auto-update `updatedAt` timestamp
  - [x] Return updated profile

### 2.2 Recommendation Engine
- [x] Implement `calculateRecommendations(profile)`
  - [x] Analyze language levels (Japanese N1-N5, English)
  - [x] Determine primary strategy: Direct_JP / Global_EN / Agent_KR
  - [x] Add channel recommendations based on strategy
  - [x] Add visa recommendations for senior/lead levels
  - [x] Add skill-specific advice (frontend/backend)
  - [x] Return `{ strategy, items }` object

### 2.3 Type Definitions
**File**: `web/app/features/diagnosis/domain/diagnosis.types.ts`

- [x] Export schema from drizzle: `InsertProfileSchema`, `SelectProfileSchema`
- [x] Define `DiagnosisStepSchema` with Zod
  - [x] Enum for `jobFamily` (frontend, backend, fullstack, mobile, data, infra, manager, other)
  - [x] Enum for `level` (junior, mid, senior, lead)
  - [x] Number validation for `years` (0-50)
  - [x] Enum for `jpLevel` (N1-N5, None, Native)
  - [x] Enum for `enLevel` (Business, Conversational, Basic, Native)
  - [x] Default value for `targetCity` ("Tokyo")

---

## Phase 3: UI Components ✅

### 3.1 DiagnosisWizard Component
**File**: `web/app/features/diagnosis/components/DiagnosisWizard.tsx`

- [x] Create 3-step wizard with AnimatePresence
- [x] Implement progress bar (Step 1/3 → 2/3 → 3/3)
- [x] **Step 1: Career Information**
  - [x] Job family dropdown (frontend, backend, mobile, data, infra)
  - [x] Level selection buttons (junior, mid, senior, lead)
- [x] **Step 2: Language Skills**
  - [x] Japanese level grid (None, N5-N1, Native)
  - [x] English level dropdown (Basic, Conversational, Business, Native)
- [x] **Step 3: Preferences & Summary**
  - [x] Target city dropdown (Tokyo, Osaka, Fukuoka, Kyoto, Remote)
  - [x] Summary box displaying all selections
- [x] Navigation: "Back" and "Next/Complete" buttons
- [x] Disable "Back" on Step 1
- [x] Submit form data using `useSubmit` on final step
- [x] Show loading state during submission

### 3.2 Form State Management
- [x] Initialize formData with defaultValues (for profile updates)
- [x] Implement `updateField(field, value)` helper
- [x] Handle step navigation (forward/backward)
- [x] Pre-fill existing profile data if available

---

## Phase 4: Route Implementation ✅

### 4.1 Diagnosis Form Route
**File**: `web/app/features/diagnosis/routes/diagnosis.tsx`

- [x] Implement `meta()` - Set page title
- [x] Implement `loader({ request })`
  - [x] Require authentication via `requireUserId`
  - [x] Fetch existing profile from database
  - [x] Return `{ existingProfile }` for pre-fill
- [x] Implement `action({ request })`
  - [x] Require authentication
  - [x] Parse formData (jobFamily, level, jpLevel, enLevel, targetCity)
  - [x] Check if profile exists
  - [x] Upsert logic: update if exists, create if new
  - [x] Redirect to `/diagnosis/result`
- [x] Render component with PageHeader and DiagnosisWizard

### 4.2 Result Page Route
**File**: `web/app/features/diagnosis/routes/result.tsx`

- [x] Implement `meta()` - Set page title
- [x] Implement `loader({ request })`
  - [x] Require authentication
  - [x] Fetch user profile
  - [x] Throw 404 if profile not found
  - [x] Call `diagnosisService.calculateRecommendations(profile)`
  - [x] Return `{ profile, items, strategy }`
- [x] Render result page
  - [x] Success header with checkmark icon
  - [x] Display strategy name
  - [x] Show user's role (level + jobFamily)
  - [x] Render recommendation cards grid
  - [x] Show icon per recommendation type (channel/visa/action)
  - [x] Display tags for each recommendation
  - [x] "Next Steps" CTA with gradient background
  - [x] Link to dashboard ("/")

---

## Phase 5: Route Registration ✅

**File**: `web/app/routes.ts`

- [x] Register `/diagnosis` route
  - Line 103: `route("diagnosis", "features/diagnosis/routes/diagnosis.tsx")`
- [x] Register `/diagnosis/result` route
  - Line 60: `route("diagnosis/result", "features/diagnosis/routes/result.tsx")`
- [x] Place routes in protected layout (authentication required)
- [x] Place routes in container layout (1280px centered)

---

## Phase 6: Integration with Roadmap (SPEC-016) ✅

- [x] Roadmap feature reads diagnosis profile
  - Reference: `roadmap/routes/index.tsx` calls `diagnosisService.getProfile(userId)`
- [x] Roadmap redirects to `/diagnosis` if profile missing
- [x] Roadmap uses profile data for task template matching
- [x] Document prerequisite relationship in specs

---

## Phase 7: Quality Assurance ✅

### 7.1 Code Quality
- [x] Pass BiomeJS linting (`pnpm biome check`)
- [x] Pass TypeScript type checking (`pnpm typecheck`)
- [x] No console errors or warnings
- [x] Follow project naming conventions (.server.ts for server code)

### 7.2 Data Validation
- [x] Prevent duplicate profiles (upsert by userId)
- [x] Require authentication for all diagnosis routes
- [x] Handle missing profile gracefully (404 on result page)
- [x] Pre-fill wizard with existing data

### 7.3 UX Validation
- [x] Smooth step transitions with animations
- [x] Clear progress indication
- [x] Responsive design (mobile-friendly)
- [x] Accessible form labels
- [x] Loading states during submission

---

## Phase 8: Documentation ✅

- [x] Create specification document (`spec.md`)
  - [x] Executive summary
  - [x] User stories with acceptance criteria
  - [x] Functional and non-functional requirements
  - [x] Technical architecture
  - [x] Integration points
  - [x] Success criteria
- [x] Create verification report (`verification_report.md`)
  - [x] Code quality verification
  - [x] Database schema documentation
  - [x] Feature functionality analysis
  - [x] Recommendations for future enhancements
- [x] Create task checklist (`tasks.md`) ← You are here

---

## Future Enhancement Backlog (Not Implemented)

### v1.1 Improvements
- [ ] Add "years of experience" input field (currently hardcoded)
- [ ] Support multiple target cities selection
- [ ] Add "Save & Continue Later" (draft profiles)
- [ ] Track wizard completion funnel analytics

### v2.0 Advanced Features
- [ ] ML-based recommendation scoring
- [ ] A/B test recommendation variations
- [ ] Add explanation tooltips for recommendations
- [ ] Export profile as PDF
- [ ] Import LinkedIn profile data (auto-fill)
- [ ] Add profile visibility settings (public/private)
- [ ] Support profile slugs for public sharing

### Integration Enhancements
- [ ] Auto-trigger roadmap regeneration on profile update
- [ ] Add diagnosis completion badge to user profile
- [ ] Email summary of recommendations
- [ ] Push notification when new recommendation categories available

---

## Testing Coverage (Recommended - Not Yet Implemented)

### Unit Tests
- [ ] Test `diagnosisService.createProfile`
- [ ] Test `diagnosisService.updateProfile`
- [ ] Test `diagnosisService.calculateRecommendations`
  - [ ] N1 Japanese → Direct_JP strategy
  - [ ] Business English → Global_EN strategy
  - [ ] Low languages → Agent_KR strategy
  - [ ] Senior level → HSP Visa recommendation

### Integration Tests
- [ ] Test complete wizard flow (Step 1 → 2 → 3 → Submit)
- [ ] Test profile upsert (create vs update)
- [ ] Test authentication requirement
- [ ] Test redirect to result page

### E2E Tests
- [ ] User completes diagnosis for first time
- [ ] User updates existing diagnosis
- [ ] User without profile tries to access result (404)
- [ ] User completes diagnosis → sees recommendations → goes to dashboard

---

## Deployment Checklist ✅

- [x] Database migration applied (`pnpm db:push`)
- [x] Routes registered in `routes.ts`
- [x] Feature accessible in production
- [x] No breaking changes to existing features
- [x] Integration with Roadmap (SPEC-016) working

---

## Known Limitations

1. **Hardcoded Years**: Recommendation algorithm uses `years = 1` instead of actual experience
2. **Basic Recommendations**: Rule-based algorithm, not ML-powered
3. **Single Strategy**: Users assigned only one primary strategy (could support hybrid)
4. **No Draft Saving**: Must complete all 3 steps in one session
5. **No Analytics**: Completion funnel not tracked

---

## Notes

- Feature is **production-ready** and has been serving users
- This task list is **retroactive documentation** of completed work
- All checkboxes marked as completed represent existing implementation
- Future enhancements listed as unchecked items for visibility
