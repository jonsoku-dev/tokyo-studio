# Admin Tasks: Push Notifications

## Backend Implementation
- [ ] **Mutation**: `adminBroadcastPush(payload, target)`
    - Target: `{ type: 'all' | 'role' | 'verified' | 'custom', value?: string | string[] }`.
    - Insert into `notification_queue` for each matching user.
    - Log in `admin_audit_logs`.
- [ ] **Query**: `adminGetPreviewCount(target)`
    - Return count of users matching target criteria.
- [ ] **Query**: `adminGetNotificationHistory(userId)`
    - Return last 50 items from `notification_queue`.
- [ ] **Mutation**: `adminSendTestNotification(adminId, payload)`
    - Send only to admin's own subscription.
- [ ] **Query**: `adminGetBroadcastStats(broadcastId)`
    - Aggregate: sent, failed, pending counts.

## Frontend Implementation
- [ ] **Page**: `features/notifications/routes/broadcast.tsx`.
    - Form: Title, Body, URL, Target selector.
    - Preview count display.
    - "Send" and "Test Send" buttons.
- [ ] **Component**: Broadcast history table with stats.
- [ ] **Component**: User notification log in User Detail.

## QA Verification
- [ ] **Test Case**: Send broadcast to all. Verify `notification_queue` population.
- [ ] **Test Case**: Test send to self. Verify notification received.
- [ ] **Test Case**: Filter by role (mentors only). Verify count matches mentor count.
