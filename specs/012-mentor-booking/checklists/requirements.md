# Requirements Checklist: Mentor Booking System

## Functional Requirements
- [x] **FR-001**: Display mentor directory with cards (avatar, name, company, title, experience, rate, rating, sessions).
- [x] **FR-002**: Filter by job family, experience, availability, price.
- [x] **FR-003**: View mentor profile page.
- [x] **FR-004**: Display profile details (bio, expertise, background) and availability calendar.
- [x] **FR-005**: Display recent reviews.
- [x] **FR-006**: Calendar: 30-min slots, available/booked/locked states.
- [x] **FR-007**: Local timezone display.
- [x] **FR-008**: Select time slot.
- [x] **FR-009**: Select duration (30/60/90) & dynamic price.
- [x] **FR-010**: Session description input (20-500 chars).
- [x] **FR-011**: Lock slot on checkout start (Optimistic/DB lock).
- [-] **FR-012**: Lock expiration (5 mins). (Skipped: Atomic booking)
- [x] **FR-013**: Confirmation emails (User + Mentor).
- [x] **FR-014**: Prevent deleting booked slots.
- [x] **FR-015**: "My Sessions" page.
- [-] **FR-016**: Reminder notifications (10 min before) - *Optional/Later*.
- [x] **FR-017**: UTC storage, Local display.
- [x] **FR-018**: Prevent overlapping bookings.
- [x] **FR-019**: .ics attachment.
- [x] **FR-020**: Mock payment integration.
- [x] **FR-021**: Video link generation (Placeholder).
- [x] **FR-022**: Seed mentor data.

## Technical Components
### Database Schema
- [x] `mentors` table (extends users or separate? Usually separate profile linked to user).
- [x] `mentoring_sessions` table.
- [x] `mentor_availability` table (or simple JSON schedule?).
- [x] `mentor_reviews` table.

### API / Services
- [x] `MentoringService.getMentors(filters)`
- [x] `MentoringService.getMentorProfile(id)`
- [x] `MentoringService.getAvailability(mentorId, dateRange)`
- [x] `MentoringService.createBooking(...)` -> Handles lock, payment mock, email.
- [x] `MentoringService.getUserSessions(userId)`
- [x] `MentoringService.getMentorSessions(mentorId)`

### UI Routes
- [x] `/mentoring` (Directory)
- [x] `/mentoring/mentors/:mentorId` (Profile)
- [x] `/mentoring/bookings` (My Sessions)

## Verification
- [x] Typecheck pass.
- [x] Biome check pass.
- [x] Manual test: Browse -> Filter -> View -> Book -> Verify in "My Sessions".
