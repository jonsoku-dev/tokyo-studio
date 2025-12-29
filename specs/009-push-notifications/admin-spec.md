# Admin Feature Specification: Push Notification Management

**Feature**: `009-push-notifications`
**Role**: Admin
**Outcome**: Admins can broadcast messages, target specific user segments, and debug delivery issues.

## 1. User Scenarios

### 1.1 Broadcast Announcement to All Users
**As an**: Admin
**I want to**: Send a manual push notification to all subscribed users
**So that**: I can announce critical updates, maintenance windows, or new features.

- **Acceptance Criteria**:
    - Form: Title, Body, Launch URL (optional), Icon (optional).
    - "Send to All" creates `notification_queue` entries for all users with valid `push_subscriptions`.
    - Background worker processes the queue (non-blocking).

### 1.2 Target Specific User Segments
**As an**: Admin
**I want to**: Send notifications to specific user groups
**So that**: I can deliver relevant messages (e.g., only Mentors, only users in Japan).

- **Acceptance Criteria**:
    - Target options:
        - All Users
        - By Role: `admin`, `user`, `mentor`
        - By Verified Status: Verified / Unverified
        - Custom User IDs (paste list)
    - Preview: "This will reach ~X users" before sending.

### 1.3 Inspect Notification Queue
**As an**: Admin
**I want to**: View the `notification_queue` for a specific user
**So that**: I can tell them "Yes, we sent the notification at 5:00 PM" and check delivery status.

- **Acceptance Criteria**:
    - Table: `payload.title`, `scheduledAt`, `status`, `retryCount`.
    - Filter by status (pending, failed, stale).

### 1.4 View Delivery Statistics
**As an**: Admin
**I want to**: See aggregate stats for a broadcast campaign
**So that**: I know how many notifications were sent vs failed.

- **Acceptance Criteria**:
    - Dashboard widget after broadcast: Sent, Failed, Pending counts.
    - Drill-down to failed items with error details.

### 1.5 Test Notification (Send to Self)
**As an**: Admin
**I want to**: Send a test notification to my own device
**So that**: I can verify content and formatting before broadcasting.

- **Acceptance Criteria**:
    - "Test Send" button uses current admin's `userId`.
    - Immediate feedback if admin has no subscription.

## 2. Requirements

### 2.1 Functional Requirements
- **FR_ADMIN_009.01**: Broadcasts MUST run in background worker (not blocking HTTP request).
- **FR_ADMIN_009.02**: Admin view showing `status` of notifications ("pending", "stale", "failed").
- **FR_ADMIN_009.03**: System MUST support segmented targeting by role and verification status.
- **FR_ADMIN_009.04**: System MUST provide recipient preview count before sending.
- **FR_ADMIN_009.05**: System MUST allow test sends to admin's own devices.

### 2.2 Non-Functional Requirements
- **NFR_ADMIN_009.01**: Broadcast to 10,000 users should complete within 5 minutes.

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `notification_queue` | **Read/Write** | Create broadcast entries, read logs. |
| `push_subscriptions` | **Read** | Count reachable users, find targets. |
| `users` | **Read** | Filter by role/status for targeting. |
| `admin_audit_logs` | **Write** | Log broadcast actions. |

## 4. Work Definition (Tasks)

- [ ] **Backend**: `AdminNotificationService.sendBroadcast(payload, target)`.
- [ ] **Backend**: `AdminNotificationService.getPreviewCount(target)`.
- [ ] **Backend**: `AdminNotificationService.getUserNotificationHistory(userId)`.
- [ ] **Backend**: `AdminNotificationService.sendTestNotification(adminId, payload)`.
- [ ] **Frontend**: "Broadcast" page with targeting form.
- [ ] **Frontend**: Preview count component.
- [ ] **Frontend**: "Test Send" button.
- [ ] **Frontend**: Broadcast history with stats.
