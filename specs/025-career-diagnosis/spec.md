# Feature Specification: Career Diagnosis (Onboarding Assessment)

**Feature Branch**: `025-career-diagnosis`  
**Created**: 2026-01-02  
**Status**: ✅ **Implemented** (Retroactive Documentation)  
**Priority**: Critical (Core User Journey - Entry Point)  
**Current Version**: v1.0

---

## 0. Executive Summary

### 0.1 이 기능은 무엇인가?

**Career Diagnosis**는 사용자의 **직무**, **경력 수준**, **어학 능력**, **목표 도시**를 파악하여 개인화된 일본 취업 전략을 수립하는 **온보딩 진단 시스템**입니다.

3단계 위저드 형태의 간단한 설문을 통해:
1. 사용자 프로필을 구조화된 데이터로 저장 (`profiles` 테이블)
2. 알고리즘 기반 추천 생성 (채널, 비자, 준비 사항)
3. 로드맵 자동 생성의 기반 데이터 제공 (SPEC-016 연동)

### 0.2 왜 이 기능이 필요한가? (Problem Statement)

| 문제 | 현재 상태 | 영향 |
|------|----------|------|
| **막막한 시작** | 일본 취업 준비 방법을 모름 | 정보 검색에 시간 낭비 → 이탈 |
| **개인화 부재** | 모두에게 같은 조언 제공 | 비효율적 학습 경로 → 좌절 |
| **추천 근거 불명확** | "일본어 공부하세요" 같은 일반론 | 동기 부여 부족 → 실행력 저하 |

### 0.3 이 기능은 어떻게 문제를 해결하는가?

```
[3-Step Wizard] → [Profile Storage] → [Recommendation Engine] → [Result Page]
                ↓                     ↓                         ↓
          (DB: profiles)     (채널/비자/스킬 분석)      (맞춤 전략 제시)
                                                           ↓
                                                   [Roadmap Generation]
                                                        (SPEC-016)
```

**핵심 가치**:
1. **3분 완료**: 간단한 5개 필수 input만 수집
2. **즉각 피드백**: 제출 즉시 개인화된 추천 표시
3. **실행 가능**: "Next Steps" 명확히 제시 (채널 + 우선순위)
4. **로드맵 자동 생성**: Diagnosis 완료 → 10-15개 Task 자동 생성

### 0.4 기대 효과

#### 사용자 가치
- **방향성 획득**: "어디서부터 시작할지" 명확해짐
- **시간 절약**: 정보 검색 시간 90% 감축
- **개인화**: 불필요한 단계 제외 (예: N1 보유자는 일본어 학습 Task 생략)

#### 비즈니스 가치
- **전환율 향상**: 회원가입 → 활성 사용자 전환율 증가
- **Retention 증가**: Diagnosis 완료 시 7일 재방문율 2배
- **데이터 수집**: 사용자 프로필 DB 구축 → 마케팅/컨텐츠 개인화

### 0.5 성공 기준

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 완료율 | 신규 가입 후 24h 내 60%+ | `profiles` 생성 / 가입자 수 |
| 정확도 | 추천 만족도 4.0+ / 5.0 | 사후 설문 |
| 로드맵 생성률 | Diagnosis 완료 후 80%+ | SPEC-016 연동 추적 |

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Initial Diagnosis (Priority: P1)

**As a** new user registering on the platform,  
**I want** to complete a simple career assessment,  
**So that** I receive personalized recommendations for my Japan job search.

**Why this priority**: This is the entry point for all personalization. Without this, the platform cannot provide tailored value.

**Independent Test**: Can be tested by completing the wizard with various profiles (junior/senior, different languages) and verifying appropriate recommendations appear.

**Acceptance Scenarios**:

1. **Given** a logged-in user with no existing profile, **When** they navigate to `/diagnosis`, **Then** they see a 3-step wizard asking about career, languages, and preferences
2. **Given** a user on Step 1, **When** they select "Frontend Developer" and "Junior", **Then** the progress bar shows 33% completion
3. **Given** a user completes all 3 steps, **When** they click "Complete Diagnosis", **Then** their profile is saved to the database and they redirect to `/diagnosis/result`
4. **Given** a user with existing profile, **When** they visit `/diagnosis`, **Then** their previous answers are pre-filled
5. **Given** a user updates their profile, **When** they submit, **Then** the existing profile is updated (not duplicated)

---

### User Story 2 - View Personalized Recommendations (Priority: P1)

**As a** user who completed diagnosis,  
**I want** to see recommendations tailored to my profile,  
**So that** I know which job search channels and strategies to use.

**Why this priority**: This delivers the core value - actionable recommendations.

**Independent Test**: Can be tested by creating profiles with different language levels and verifying recommendation algorithm outputs correct channels.

**Acceptance Scenarios**:

1. **Given** a user with N1 Japanese, **When** they view results, **Then** they see recommendations for "Direct Application (Japanese Companies)" with Wantedly/Green
2. **Given** a user with Business English but low Japanese, **When** they view results, **Then** they see "Global/English-First Companies" with LinkedIn/Tokyodev
3. **Given** a senior developer (5+ years), **When** they view results, **Then** they see "High-Skilled Visa Target" recommendation
4. **Given** a frontend developer, **When** they view results, **Then** they see "Portfolio is Key" with modern stack advice
5. **Given** any user viewing results, **When** the page loads, **Then** each recommendation includes title, description, and relevant tags

---

### User Story 3 - Navigate to Next Steps (Priority: P2)

**As a** user viewing diagnosis results,  
**I want** to easily proceed to my dashboard with generated roadmap,  
**So that** I can start taking action on recommendations.

**Why this priority**: Ensures smooth transition from assessment to action.

**Acceptance Scenarios**:

1. **Given** a user on the result page, **When** they click "Go to Dashboard", **Then** they navigate to `/` (home/dashboard)
2. **Given** a user completes diagnosis for first time, **When** they reach dashboard, **Then** their roadmap is auto-generated (SPEC-016 integration)

---

### Edge Cases

- **Incomplete Submission**: What if user closes browser mid-wizard? → No profile saved until final submit
- **Duplicate Profiles**: What if user submits multiple times? → Upsert logic prevents duplicates per userId
- **Invalid Language Combinations**: What if user claims N5 + Native English? → System allows (self-reported data)
- **Missing userId**: What if session expires during submission? → `requireUserId` throws 401, redirects to login
- **Profile Update Impact**: When user re-diagnoses, does roadmap regenerate? → Currently manual; future enhancement for SPEC-016

---

### User Story 4 - Deep Context for LLM (Priority: P1)

**As a** user,
**I want** to provide details about my visa status, career values, and timeline,
**So that** the AI consultant can give me realistic and strategic advice.

**Why this priority**: General advice fails for edge cases (e.g., No degree, immediate need). LLM needs this "Hidden Context".

**Acceptance Scenarios**:
1. **Given** a user with "No Degree", **When** they complete assessment, **Then** the result emphasizes "Visa challenges" and suggests "Wharton/Specified Skilled Worker" paths.
2. **Given** a user valuing "Work-Life Balance" over "Money", **When** recommended companies appear, **Then** SIer/Traditional companies are ranked higher than aggressive startups.
3. **Given** a user with "ASAP" timeline, **When** roadmap generates, **Then** it skips long-term learning tasks and focuses on "Resume Polish" and "Apply Now".

---

### v2.0 LLM Readiness: "Deep Context" Data Model

To power a true AI Career Consultant, we need to capture the *constraints* and *values* that shape a career.

#### 1. Capability & Tech (The "Can I?")
- **Tech Stack**: Specifics (e.g., "Next.js", "NestJS") vs generics.
- **Coding Confidence**: Self-assessed practical ability.

#### 2. Feasibility (The "May I?")
- **Degree Status**: *CRITICAL* for Japanese Work Visa. (No Degree = Hard Mode).
- **Residence**: Already in Japan? (Easier) vs Overseas? (Harder).
- **Visa**: Current status (Student, Specialist, Spouse).

#### 3. Intent & Values (The "Do I Want To?")
- **Work Values**: What matters? (Money, Growth, Stability, WLB).
- **Timeline**: Urgency dictates strategy (Sprint vs Marathon).
- **Investment**: Willingness to learn Japanese (High/Low).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-014 (Deep Context)**: System MUST collect:
    - `techStack` (List<String>)
    - `degree` (Enum: Bachelor+, Associate, None)
    - `residence` (Enum: KR, JP, Other)
    - `workValues` (Select Top 3)
    - `timeline` (Enum: ASAP, <3M, <6M, >1Y)
- **FR-015 (Feasibility Check)**: If `degree` == "None" AND `years` < 10, System MUST display a "Visa Warning" modal or alert in the specific recommendation section.
- **FR-016 (Persona Generation)**: Service MUST be able to serialize this data into a "System Prompt" string for future LLM calls.

### Key Entities (Updated Profile)
```typescript
{
  // ... existing fields ...
  techStack: ["React", "TypeScript", "Tailwind"],
  hardConstraints: {
    degree: "bachelor",
    criminalRecord: false
  },
  softConstraints: {
    residence: "KR",
    timeline: "3_months"
  },
  values: ["growth", "money"] // Prioritized list
}
```

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST collect 5 core inputs: jobFamily, level, jpLevel, enLevel, targetCity
- **FR-002**: System MUST save profile to `profiles` table with userId foreign key
- **FR-003**: System MUST support profile updates (upsert logic, not insert-only)
- **FR-004**: System MUST redirect to `/diagnosis/result` upon successful submission
- **FR-005**: Result page MUST display 2-4 personalized recommendations based on profile
- **FR-006**: Recommendations MUST categorize by type: channel, visa, action
- **FR-007**: Each recommendation MUST include title, description, and optional tags
- **FR-008**: Wizard MUST show progress indicator (Step 1/3, 2/3, 3/3)
- **FR-009**: Wizard MUST allow "Back" navigation between steps
- **FR-010**: Wizard MUST validate required fields before allowing "Next"
- **FR-011**: Step 3 MUST display summary of all previous selections
- **FR-012**: System MUST pre-fill wizard with existing profile data if available
- **FR-013**: Result page MUST provide clear CTA to dashboard/roadmap

### Non-Functional Requirements

- **NFR-001**: Wizard completion time MUST be under 3 minutes for 90% of users
- **NFR-002**: Profile save/update MUST complete within 500ms
- **NFR-003**: Result page MUST load within 1 second
- **NFR-004**: System MUST be accessible on mobile (responsive wizard)
- **NFR-005**: Form inputs MUST have appropriate labels for screen readers

### Key Entities

- **Profile**: User's career assessment data (jobFamily, level, jpLevel, enLevel, targetCity, userId)
- **Recommendation**: Algorithm-generated suggestion (title, type, description, tags)
- **DiagnosisStrategy**: Enum-like classification (Direct_JP, Global_EN, Agent_KR)

---

## Technical Architecture

### Data Model (Existing)

**Table**: `profiles` (packages/database/src/schema.ts, lines 584-604)

```typescript
{
  id: uuid (PK)
  jobFamily: text (required)    // "frontend" | "backend" | "mobile" | "data" | "infra"
  level: text (required)        // "junior" | "mid" | "senior" | "lead"
  jpLevel: text (required)      // "N1" | "N2" | "N3" | "N4" | "N5" | "None" | "Native"
  enLevel: text (required)      // "Business" | "Conversational" | "Basic" | "Native"
  targetCity: text default("Tokyo")
  bio: text
  slug: text (unique)
  website: text
  linkedinUrl: text
  githubUrl: text
  userId: uuid (FK → users.id)
  portfolioDocumentId: uuid (FK → documents.id, nullable)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Service Layer

**File**: `web/app/features/diagnosis/domain/diagnosis.service.server.ts`

```typescript
diagnosisService = {
  createProfile(data: InsertProfile): Promise<Profile[]>
  getProfile(userId: string): Promise<Profile | undefined>
  updateProfile(userId: string, data: Partial<InsertProfile>): Promise<Profile[]>
  calculateRecommendations(profile: InsertProfile): {
    strategy: string,
    items: RecommendationItem[]
  }
}
```

### Recommendation Algorithm (Current v1.0)

**Logic** (lines 25-93 in `diagnosis.service.server.ts`):

1. **Language Strategy**:
   - jpLevel in [N1, N2, Native] → `Direct_JP` (Wantedly, Green)
   - enLevel in [Business, Native] → `Global_EN` (Rakuten, LINE, Mercari)
   - Else → `Agent_KR` (Korean recruitment agents)

2. **Visa Recommendation**:
   - IF (years >= 5 OR level in [senior, lead]) → Add HSP Visa recommendation

3. **Skill-Specific Advice**:
   - jobFamily === "frontend" → Portfolio emphasis
   - jobFamily === "backend" → System design + cloud

**Limitations**:
- Hardcoded years=1 (not collected from wizard)
- Basic rule-based (no ML/personalization)
- Limited to 2-4 recommendations (room for expansion)

### Routes

**Page Routes** (web/app/routes.ts):
- Line 103: `/diagnosis` → `features/diagnosis/routes/diagnosis.tsx`
- Line 60: `/diagnosis/result` → `features/diagnosis/routes/result.tsx`

**No API Routes**: Uses inline loaders/actions (React Router v7 pattern)

---

## Integration Points

### Consumed By
1. **Roadmap Generator (SPEC-016)**:
   - Reads profile via `diagnosisService.getProfile(userId)`
   - Uses profile to select task templates
   - Referenced in: `roadmap/routes/index.tsx`, `plan.md`, `tasks.md`

### Depends On
1. **Authentication**: `requireUserId` from `auth/utils/session.server`
2. **Database**: `profiles` table, `db` client
3. **UI Components**: `PageHeader`, `Button`, `DiagnosisWizard`

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of users complete wizard without errors (measured by success redirects vs. attempts)
- **SC-002**: Profile save latency p95 < 500ms
- **SC-003**: Recommendation relevance score 4.0+ / 5.0 (user survey)
- **SC-004**: 70%+ of diagnosed users proceed to generate roadmap (SPEC-016 trigger rate)
- **SC-005**: Zero profile data loss incidents (upsert logic prevents duplicates)
- **SC-006**: Mobile wizard completion rate >= desktop rate (responsive parity)

---

## Future Enhancements

### v1.1 Roadmap
- [ ] Add "years of experience" input field (currently hardcoded to 1)
- [ ] Support multiple target cities
- [ ] Add "Save & Continue Later" functionality (draft profiles)
- [ ] Track completion funnel (Step 1 → 2 → 3 → Submit)

### v2.0 Advanced Features
- [ ] ML-based recommendation scoring
- [ ] A/B test recommendation variations
- [ ] Add "Why this recommendation?" explanation tooltips
- [ ] Export profile as PDF
- [ ] Import LinkedIn profile data (auto-fill wizard)

---

## Related Specifications

- **SPEC-016** (Roadmap Integration): Consumes diagnosis profile
- **SPEC-001** (Social Auth): Provides userId for profile FK
- **SPEC-022** (Document Integration): Supports portfolioDocumentId FK

---

## Notes

- This spec is **retroactive documentation** of existing implementation
- Feature is **production-ready** but lacks formal spec until now
- Current recommendation algorithm is **rule-based v1.0** - simple but effective
- No known bugs or critical issues as of 2026-01-02
