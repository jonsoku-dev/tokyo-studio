# Admin Feature Specification: Mentor Booking Management

**Feature**: `012-mentor-booking`
**Role**: Admin
**Outcome**: Admins can oversee booking operations, resolve disputes, and manage session lifecycle.

## Current Implementation Status

### Existing Code
| File | Functions | Status |
|------|-----------|--------|
| `web/app/features/mentoring/services/booking.server.ts` | `lockSlot`, `confirmBooking`, `releaseExpiredLocks` | ✅ Implemented |
| `web/app/features/mentoring/routes/mentoring.bookings.tsx` | User bookings page | ✅ Implemented |
| `web/app/features/mentoring/routes/my-sessions.tsx` | Session management | ✅ Implemented |

### Existing Schema
- `mentoring_sessions`: `id`, `mentorId`, `userId`, `date`, `duration`, `price`, `topic`, `status`, `meetingUrl`, `expiresAt`, `lockedAt`

## 1. User Scenarios

### 1.1 View All Bookings (Admin)
**As an**: Admin
**I want to**: See a global list of all mentoring sessions
**So that**: I can monitor platform activity and identify issues.

- **Existing**: No admin-specific service. Uses same `mentoring_sessions` table.
- **New**: Create `AdminBookingService.listAll(filters)`.

### 1.2 Cancel Booking on Behalf of User
**As an**: Admin
**I want to**: Cancel a session due to disputes or emergencies

- **Existing Logic**: Can reuse `releaseExpiredLocks` pattern.
- **New**: Add `status: 'admin_canceled'` with `canceledBy` field.

### 1.3 Monitor Expired Holds
**As an**: Admin
**I want to**: See sessions stuck in "pending" with expired `expiresAt`

- **Existing**: `releaseExpiredLocks()` deletes expired. 
- **Enhancement**: Change to soft-status update vs. DELETE for audit trail.

## 2. Requirements

### 2.1 Functional Requirements
- **FR_ADMIN_012.01**: Global booking list with filters (reuse `mentoring_sessions` schema).
- **FR_ADMIN_012.02**: Admin cancel with reason → `admin_audit_logs`.
- **FR_ADMIN_012.03**: Admin reschedule → update `date`, notify parties.

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `mentoring_sessions` | **Read/Write** | Existing table. |
| `admin_audit_logs` | **Write** | Log actions. |

## 4. Work Definition (Tasks)

### Leverage Existing Code
- [ ] Extend `BookingService` with admin functions OR create new `AdminBookingService`.

### New Backend
- [ ] `AdminBookingService.listAll(filters)` - paginated, filterable.
- [ ] `AdminBookingService.adminCancel(sessionId, adminId, reason)`.
- [ ] `AdminBookingService.reschedule(sessionId, newDate)`.

### Frontend
- [ ] **Page**: `admin/app/features/mentoring/routes/bookings.tsx`.
