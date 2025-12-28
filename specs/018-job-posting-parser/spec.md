# Feature Specification: Job Posting Parser

**Feature Branch**: `018-job-posting-parser`  
**Created**: 2025-12-28  
**Status**: Draft  
**Input**: User description: "Build an automatic job posting parser..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Parse Job URL (Priority: P1)

A user wants to quickly add a job application by pasting a URL so that they don't have to manual type all details.

**Why this priority**: Core efficiency feature.

**Independent Test**: Paste a valid URL and verify fields populate.

**Acceptance Scenarios**:

1. **Given** a new application form, **When** the user pastes a LinkedIn Job URL, **Then** Company, Title, and Location fields are auto-filled.
2. **Given** a parsed result, **When** the user sees an error in the data, **Then** they can manually edit the fields before saving.
3. **Given** an invalid URL, **When** parsing is attempted, **Then** a graceful error message is shown and fields remain empty for manual entry.

---

### User Story 2 - Caching & Refresh (Priority: P2)

The system needs to cache results to be polite to target sites, but allow refreshing if data changed.

**Why this priority**: Performance and reliability.

**Independent Test**: Parse the same URL twice; second time should be instant/cached. Force refresh and check new fetch.

**Acceptance Scenarios**:

1. **Given** a previously parsed URL (< 24h ago), **When** accessed again, **Then** the cached result is returned without a network request.
2. **Given** a cached result, **When** the user clicks "Refresh Data", **Then** the system re-fetches the URL and updates the fields.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept URLs from common job sites (LinkedIn, Indeed, Green, Wantedly).
- **FR-002**: System MUST fetch HTML content (server-side to avoid CORS).
- **FR-003**: System MUST parse Open Graph tags (`og:title`, `og:description`, `og:site_name`, etc.) and structured data (JSON-LD).
- **FR-004**: System MUST extraction Company Name, Job Title, Location, and Description.
- **FR-005**: System MUST handle character encoding (UTF-8, Shift_JIS, etc.) correctly for Japanese sites.
- **FR-006**: System MUST cache parsed results for 24 hours keyed by URL.
- **FR-007**: System MUST provide a manual override for all auto-populated fields.
- **FR-008**: System MUST handle extensive timeouts or blocking (e.g., 403 Forbidden) by failing gracefully to manual mode.

### Key Entities

- **JobPostingCache**: Stores URL hash, parsed data JSON, and timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Parsing success rate > 80% for supported domains.
- **SC-002**: Parsing completes in under 5 seconds (excluding external site latency).
- **SC-003**: 95% of Japanese text parses without mojibake (encoding errors).
