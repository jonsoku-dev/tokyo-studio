# Admin Feature Specification: Video Integration Management

**Feature**: `013-video-links`
**Role**: Admin
**Outcome**: Admins can monitor video integrations and troubleshoot connection issues.

## Current Implementation Status

### Existing Code
| File | Functions | Status |
|------|-----------|--------|
| `web/app/features/mentoring/services/video-provider.server.ts` | `generateMeetingLink`, `generateJitsiLink`, `generateGoogleMeetLink`, `generateZoomLink`, `verifyJoinToken` | ✅ Implemented |
| `web/app/features/mentoring/services/video-conferencing.server.ts` | Video conferencing utilities | ✅ Implemented |

### Existing Schema
- `mentor_profiles.preferredVideoProvider`: `'jitsi' | 'google' | 'zoom' | 'manual'`
- `mentor_profiles.manualMeetingUrl`: Manual URL storage
- `user_integrations`: OAuth tokens for external providers

### Provider Support
| Provider | Implementation | Notes |
|----------|----------------|-------|
| **Jitsi** | ✅ Full | `meet.jit.si/itcom-session-{id}` |
| **Google** | 🟡 Mock | Requires OAuth integration |
| **Zoom** | 🟡 Mock | Requires OAuth integration |
| **Manual** | ✅ Full | Mentor provides static URL |

## 1. User Scenarios

### 1.1 View User Integrations
**As an**: Admin
**I want to**: See which video providers a user has connected
**So that**: I can help troubleshoot meeting link generation.

- **Data Source**: `user_integrations` table.

### 1.2 Force Disconnect Integration
**As an**: Admin
**I want to**: Disconnect a user's video integration to help them reconnect.

- **Existing**: DELETE from `user_integrations` WHERE userId AND provider.

### 1.3 View Provider Stats
**As an**: Admin
**I want to**: See aggregate data on which video providers are most used.

- **Query**: `SELECT preferredVideoProvider, COUNT(*) FROM mentor_profiles GROUP BY preferredVideoProvider`.

## 2. Requirements

### 2.1 Functional Requirements
- **FR_ADMIN_013.01**: View user integration status without exposing tokens.
- **FR_ADMIN_013.02**: Admin can force-disconnect integrations.
- **FR_ADMIN_013.03**: Aggregate stats on video provider preferences.

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `user_integrations` | **Read/Write** | OAuth connections. |
| `mentor_profiles` | **Read** | Provider preference. |

## 4. Work Definition (Tasks)

### Leverage Existing Code
- [ ] Reuse `video-provider.server.ts` functions for admin utilities.

### New Backend
- [ ] `AdminIntegrationService.getUserIntegrations(userId)`.
- [ ] `AdminIntegrationService.forceDisconnect(userId, provider)`.
- [ ] `AdminAnalyticsService.getVideoProviderStats()`.

### Frontend
- [ ] "Integrations" card in User Detail.
- [ ] "Video Provider Stats" widget on Dashboard.
