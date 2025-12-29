# Feature Specification: Automatic Video Meeting Link Generation

**Feature Branch**: `013-video-links`
**Created**: 2025-12-28
**Status**: Final

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Join Proxy (Priority: P0)

To ensure safety and analytics, users join meetings through a platform-hosted link (e.g., `/mentoring/session/:id/join`) rather than a direct raw URL.

**Why this priority**:
- **Security**: Prevents unauthorized sharing of links (URL is hidden/dynamic until join).
- **Control**: Allows simple access revocation if session is cancelled.
- **Analytics**: Tracks "Join" events and attendance.

**Acceptance Scenarios**:
1. **Given** a confirmed session, **When** user clicks "Join", **Then** system validates user identity and session time.
2. **Given** validation passes, **Then** system redirects to the actual provider URL (Meet/Zoom/Jitsi).
3. **Given** session is cancelled, **When** user clicks "Join", **Then** system shows "Session Cancelled" error.

### User Story 2 - Jitsi Meet Integration (Priority: P1)

As a robust default provider without external API keys, the system supports Jitsi Meet.

**Acceptance Scenarios**:
1. **Given** no external provider configured, **When** session is booked, **Then** a unique Jitsi link (`meet.jit.si/<uuid>`) is generated.

### User Story 3 - Google Meet / Zoom Links (Priority: P2)

Support for external providers via OAuth integration (Architecture only for MVP).

**Acceptance Scenarios**:
1. **Given** mentor connected Google, **When** session booked, **Then** Google Meet link is generated (Mocked for now).

### User Story 4 - Manual Meeting URL (Priority: P1)

Mentors can provide a static personal meeting link (e.g., personal Zoom room) if they prefer not to use auto-generation.

**Acceptance Scenarios**:
1. **Given** mentor selected "Manual" provider and entered a URL, **When** session is booked, **Then** that static URL is used.
2. **Given** mentor manages settings, **Then** they can toggle between Jitsi, Manual, and other providers.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support pluggable video providers.
- **FR-002**: System MUST default to **Jitsi Meet** (free, no-auth) if no other provider is configured.
- **FR-003**: System MUST provide a secure Proxy Redirect URL (`/join`) instead of exposing raw meeting tokens in the UI.
- **FR-004**: System MUST validate User ID and Session Status before redirecting.
- **FR-005**: System MUST store OAuth tokens for external providers (Google/Zoom) securely encrypted (Structure only for MVP).

### Database Schema (Additions)

- **mentor_profiles**:
    - `preferredVideoProvider`: enum('jitsi', 'google', 'zoom', 'manual') default 'jitsi'
    - `manualMeetingUrl`: text (optional)

- **user_integrations` (New Table)**:
    - `userId`: FK users
    - `provider`: string ('google', 'zoom')
    - `accessToken`: text (encrypted)
    - `refreshToken`: text (encrypted)
    - `expiresAt`: timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: "Join" button works for 100% of confirmed sessions via Redirect.
- **SC-002**: Default Jitsi links generation success rate > 99%.
