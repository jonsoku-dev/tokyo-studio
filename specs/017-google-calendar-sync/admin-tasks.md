# Admin Tasks: Calendar Sync

## Backend Implementation
- [ ] Reuse `AdminIntegrationService` from 013 for connection status.
- [ ] **Schema**: Consider adding `calendar_sync_logs` for error tracking.
- [ ] **Query**: `adminGetCalendarSyncErrors(userId?)`.

## Frontend Implementation
- [ ] Enhance User Detail > Integrations to show Google Calendar status.
- [ ] Add sync error logs section if logging implemented.

## QA Verification
- [ ] **Test**: View user with Google Calendar connected.
- [ ] **Test**: Force disconnect, verify reconnection required.
