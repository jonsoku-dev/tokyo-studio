# Admin Feature Specification: Calendar Sync Monitoring

**Feature**: `017-google-calendar-sync`
**Role**: Admin
**Outcome**: Admins can monitor calendar integrations and troubleshoot sync issues.

## Current Implementation Status

### Main Spec Reference
- **File**: `specs/017-google-calendar-sync/spec.md`
- **User Scenarios**: 4 stories (Connect, One-Way Sync, Two-Way Sync, Disconnect)
- **Requirements**: FR-001 to FR-009

### Existing Code
| Path | Status |
|------|--------|
| `user_integrations` table | ✅ Schema exists |
| OAuth flow | 🟡 Partial (video-provider uses mock) |

### Schema From Main Spec
- **CalendarIntegration**: `access_token`, `refresh_token`, `expiry`, `target_calendar_id`
- **SyncMapping**: Maps Platform Entity ID to Google Event ID

## 1. User Scenarios (Admin)

### 1.1 View User Calendar Connection
**As an**: Admin
**I want to**: See if a user has connected Google Calendar
**So that**: I can help debug booking sync issues.

- **Data Source**: `user_integrations` WHERE `provider = 'google'`

### 1.2 Force Disconnect Calendar
**As an**: Admin
**I want to**: Disconnect a user's calendar integration
**So that**: I can help them re-authenticate if tokens are corrupted.

### 1.3 View Sync Error Logs
**As an**: Admin
**I want to**: See failed calendar sync attempts
**So that**: I can identify systemic issues.

## 2. Requirements

### 2.1 Dependencies (From Main Spec)
- **FR-001**: OAuth2 for Calendar scope
- **FR-006**: Update GCal events within 5 minutes
- **FR-007**: Handle token refresh automatically

### 2.2 Admin-Specific Requirements
- **FR_ADMIN_017.01**: View calendar connection status per user
- **FR_ADMIN_017.02**: Force disconnect capability
- **FR_ADMIN_017.03**: Error log visibility

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `user_integrations` | **Read/Write** | Existing OAuth storage |
| `calendar_sync_logs` | **Read** | TBD - for error tracking |
| `admin_audit_logs` | **Write** | Actions |

## 4. Work Definition (Tasks)

### Phase 1: Schema (If Logging Needed)
- [ ] Consider adding `calendar_sync_logs` for error tracking

### Phase 2: Backend
- [ ] Reuse `AdminIntegrationService` from 013
- [ ] Add `adminGetCalendarSyncErrors(userId?)` if logging implemented

### Phase 3: Frontend
- [ ] Enhance User Detail > Integrations to show Google Calendar status
- [ ] Add sync error logs section if logging implemented
