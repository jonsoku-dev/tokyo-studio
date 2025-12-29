# Admin Feature Specification: Job Posting Management

**Feature**: `018-job-posting-parser`
**Role**: Admin
**Outcome**: Admins can manage scraped/parsed job postings and their quality.

## Current Implementation Status

### Main Spec Reference
- **File**: `specs/018-job-posting-parser/spec.md`
- **User Scenarios**: 2 stories (Parse Job URL, Caching & Refresh)
- **Requirements**: FR-001 to FR-008

### Existing Code
| Path | Status |
|------|--------|
| Job parser service | ❌ **Not Implemented** |

### Schema From Main Spec
- **JobPostingCache**: URL hash, parsed data JSON, timestamp

## 1. User Scenarios (Admin)

### 1.1 View All Job Postings
**As an**: Admin
**I want to**: See all parsed job postings
**So that**: I can review quality and completeness.

- **Supported Sites**: LinkedIn, Indeed, Green, Wantedly (from FR-001)

### 1.2 Edit Job Posting
**As an**: Admin
**I want to**: Correct parsing errors
**So that**: Users see accurate information.

### 1.3 Flag/Hide Posting
**As an**: Admin
**I want to**: Flag or hide suspicious/spam postings
**So that**: Users don't waste time on fake jobs.

### 1.4 Trigger Manual Parse
**As an**: Admin
**I want to**: Manually trigger a re-parse of a job source URL
**So that**: I can update stale listings.

### 1.5 Parser Health Dashboard
**As an**: Admin
**I want to**: See parser success/failure rates
**So that**: I know if scrapers are working.

- **Target**: >80% parsing success rate (SC-001)

## 2. Requirements

### 2.1 Dependencies (From Main Spec)
- **FR-003**: Parse OG tags and JSON-LD
- **FR-005**: Handle Japanese encoding correctly
- **FR-006**: Cache for 24 hours

### 2.2 Admin-Specific Requirements
- **FR_ADMIN_018.01**: Full job listing management
- **FR_ADMIN_018.02**: Edit parsed data
- **FR_ADMIN_018.03**: Flag/Hide capabilities
- **FR_ADMIN_018.04**: Manual parse trigger
- **FR_ADMIN_018.05**: Parser health monitoring

## 3. Data Model Reference (Proposed)

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `job_postings` | **Read/Write** | Parsed job data |
| `job_sources` | **Read/Write** | Source configurations |
| `parse_logs` | **Read** | Parser run history |
| `admin_audit_logs` | **Write** | Actions |

## 4. Work Definition (Tasks)

### Phase 1: Schema
- [ ] Create `job_postings` table
- [ ] Create `job_sources` table
- [ ] Create `parse_logs` table

### Phase 2: Backend
- [ ] `JobParserService.parse(url)` - Core parser
- [ ] `AdminJobService.listAll(filters)`
- [ ] `AdminJobService.update(jobId, data)`
- [ ] `AdminJobService.flag/hide(jobId, reason)`
- [ ] `AdminJobService.triggerParse(sourceId)`
- [ ] `AdminAnalyticsService.getParserHealth()`

### Phase 3: Frontend
- [ ] "Jobs" management page
- [ ] Parser health dashboard
