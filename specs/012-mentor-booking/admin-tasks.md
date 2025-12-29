# Admin Tasks: Mentor Booking

## Backend Implementation
- [ ] **Query**: `adminListBookings(filters)`
    - Join `mentoring_sessions` with mentor/mentee users.
    - Support pagination, status/date filters.
- [ ] **Mutation**: `adminCancelSession(sessionId, reason)`
    - Update status, free slot, log action.
- [ ] **Mutation**: `adminRescheduleSession(sessionId, newDate, newSlotId)`
    - Update date, swap slots.
- [ ] **Query**: `adminGetStaleBookings()`
    - Find expired pending sessions.
- [ ] **Mutation**: `adminForceReleaseSession(sessionId)`
    - Set status to canceled, free slot.

## Frontend Implementation
- [ ] **Page**: `features/mentoring/routes/admin-bookings.tsx`.
- [ ] **Component**: Booking table with filters.
- [ ] **Component**: Booking detail modal.
- [ ] **Actions**: Cancel, Reschedule, Force Release buttons.

## QA Verification
- [ ] **Test**: Filter by "confirmed" status.
- [ ] **Test**: Admin cancel a session, verify slot is released.
- [ ] **Test**: View stale bookings and force release one.
