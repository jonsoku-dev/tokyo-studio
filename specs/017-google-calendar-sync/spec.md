# Feature Specification: Google Calendar Sync

**Feature Branch**: `017-google-calendar-sync`  
**Created**: 2025-12-28  
**Status**: Draft  
**Input**: User description: "Build a Google Calendar integration..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Connect Google Calendar (Priority: P1)

A user needs to connect their Google Calendar so that they can see their platform tasks alongside their personal schedule.

**Why this priority**: Prerequisite for the entire feature.

**Independent Test**: Can be tested by initiating the OAuth flow and verifying a successful token exchange and storage.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they click "Connect Google Calendar", **Then** they are redirected to Google's consent screen.
2. **Given** the consent screen, **When** they authorize the app, **Then** they are redirected back with a success message.
3. **Given** multiple calendars, **When** connected, **Then** the user can select which specific calendar to sync to.

---

### User Story 2 - One-Way Sync (Platform to GCal) (Priority: P1)

A user needs their platform activities (sessions, tasks, deadlines) to appear in GCal to avoid missing them.

**Why this priority**: Core value of the integration.

**Independent Test**: Create a task in the platform and check GCal.

**Acceptance Scenarios**:

1. **Given** a connected calendar, **When** a mentor session is booked, **Then** a GCal event is created with the meeting link.
2. **Given** a roadmap task with a due date, **When** created, **Then** a GCal event is created at that time.
3. **Given** a job application deadline, **When** set, **Then** an all-day event or reminder is created 1 day before.
4. **Given** an existing synced item, **When** it is modified in the platform, **Then** the GCal event updates within 5 minutes.

---

### User Story 3 - Two-Way Sync (Completion Status) (Priority: P2)

A user needs to mark tasks as done in GCal and have it reflect in the platform to manage their workflow from one place.

**Why this priority**: Enhances usability by allowing management from the external tool.

**Independent Test**: Mark an event as "done" or delete it in GCal and check platform status.

**Acceptance Scenarios**:

1. **Given** a synced roadmap task in GCal, **When** the user marks the event as "completed" (or modifies description to a specific tag if API limitations exist), **Then** the platform task is marked as done.
    *   *Clarification*: Standard GCal events don't have a "completed" state like tasks. We assume this maps to Google Tasks API or we use a convention (e.g., event deleted or color changed)? 
    *   *Assumption*: The Spec says "Tasks completed in Google Calendar". This implies using the Google Tasks API or interpreting an event action. We will assume for now it syncs to Google Tasks or looks for "Done" status if available in specific calendar extensions, OR it interprets deleting/clearing the event as "removing from schedule". 
    *   *Refinement*: Let's stick strictly to the prompt: "two-way sync where tasks completed in Google Calendar are marked complete in the platform." This strongly suggests integration with Google Tasks, not just Calendar events, OR using Calendar Events and maybe changing the title to "[DONE] Task"?
    *   *Decision*: For this spec, we will specify that Roadmap Tasks sync to Google Tasks (if possible) or as Calendar Events. If Calendar Events, we needs a way to mark complete. The prompt says "Google Calendar integration". We will assume for this MVP that "marking complete" might mean deleting the event or updating a specific field. However, to keep it simple and robust: "Tasks" in the platform are synced as *Events* in GCal. If the prompt insists on "completion", maybe it implies the user deletes it?
    *   *Let's check the prompt again*: "Roadmap tasks... create calendar events". "Tasks completed in Google Calendar are marked complete in the platform." 
    *   *Interpretation*: Google Calendar has a "Tasks" feature. We should probably sync Roadmap items to Google Tasks, and Sessions to Google Calendar Events. But the prompt says "Roadmap tasks... create calendar events". This is a contradiction or a simplification.
    *   *Resolution*: We will requirement that changes sync. For completion, maybe we just provide a link in the event description "Click to complete" if native sync isn't possible, OR we try to use the GCal Tasks API if that's what was intended. Given "Calendar Integration", let's assume Events for now, and "Completion" might require a specific action or we accept this might be a "Nice to have" detailed in the technical plan.
    *   *Actually*, let's just write the requirement as stated and let the plan figure out the API details.

---

### User Story 4 - Disconnect (Priority: P3)

A user needs to remove the integration and clean up their calendar.

**Acceptance Scenarios**:

1. **Given** a connected account, **When** the user clicks "Disconnect", **Then** the token is revoked.
2. **Given** a disconnect action, **When** confirmed, **Then** all future syncs stop.
3. **Given** a disconnect action, **When** confirmed, **Then** previously created events are removed (optional, but "removes all synced events" is in the prompt).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement OAuth2 flow with Google for Calendar scope.
- **FR-002**: System MUST allow users to selecting a target calendar list.
- **FR-003**: System MUST sync Roadmap Tasks as Calendar Events (or Tasks).
- **FR-004**: System MUST sync Mentor Sessions as Calendar Events.
- **FR-005**: System MUST sync Application Deadlines as Calendar Events.
- **FR-006**: System MUST update GCal events within 5 minutes of platform changes (Webhook or Polling).
- **FR-007**: System MUST handle token refresh automatically.
- **FR-008**: System MUST delete all synced events when user disconnects.
- **FR-009**: System MUST reflect completion status from Google side back to Platform (if technically feasible via chosen API entity).

### Key Entities

- **CalendarIntegration**: Stores access_token, refresh_token, expiry, target_calendar_id.
- **SyncMapping**: Maps Platform Entity ID (Task/Session) to Google Event ID to track updates.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: OAuth success rate > 95%.
- **SC-002**: Sync latency < 5 minutes for 99% of updates.
- **SC-003**: 100% of disconnected accounts have their platform-specific events cleaned up.
