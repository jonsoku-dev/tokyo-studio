# Feature Specification: Tokyo Settlement Checklist

**Feature Branch**: `019-settlement-checklist`
**Created**: 2025-12-28
**Status**: Draft
**Input**: Build a Tokyo settlement guide with a personalized checklist based on arrival date. Users enter their planned arrival date in Tokyo and the system generates a timeline with tasks organized into Before Arrival (1-3 months before), First Week, First Month, and First 3 Months. Each task includes a title, detailed instructions in both Korean and Japanese, required documents, estimated time to complete, and important deadlines. Example tasks include applying for visa, booking temporary housing, registering at city hall, opening a bank account, getting a phone number, applying for residence card, joining national health insurance, and setting up utilities. The system displays a countdown showing days until arrival and highlights urgent tasks in red. Users check off completed tasks and the system calculates progress percentage. Tasks include helpful tips like "Bring your passport, residence card application, and employment contract" with links to downloadable form templates.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Arrival Date Setup and Timeline Generation (Priority: P1)

A user preparing to move to Tokyo wants to see a personalized checklist based on when they will arrive. They enter their planned arrival date and immediately see a timeline of tasks organized by urgency and time period. This gives them clarity on what needs to be done and when.

**Why this priority**: This is the core value proposition - without personalized timeline generation, the feature is just a static list. This delivers immediate value by showing users exactly what they need to do based on their specific timeline.

**Independent Test**: Can be fully tested by entering an arrival date (e.g., 60 days from now) and verifying that tasks are correctly categorized into time periods (Before Arrival, First Week, etc.) with appropriate countdown and urgency indicators.

**Acceptance Scenarios**:

1. **Given** a user is on the settlement checklist page, **When** they enter their arrival date as March 15, 2026 (60 days from now), **Then** the system displays tasks organized into "Before Arrival (1-3 months)", "First Week", "First Month", and "First 3 Months" sections
2. **Given** the user has entered an arrival date, **When** they view the checklist, **Then** a countdown shows "60 days until arrival" at the top of the page
3. **Given** the arrival date is 10 days away, **When** the system displays tasks, **Then** urgent tasks (those needing to be done in the next 2 weeks) are highlighted in red
4. **Given** the user's arrival date has passed, **When** they view the checklist, **Then** "Before Arrival" tasks are marked as overdue and "First Week" tasks are highlighted as urgent

---

### User Story 2 - Task Details and Bilingual Instructions (Priority: P1)

A user needs to understand exactly what documents to bring and how to complete bureaucratic procedures in Japan. They view detailed instructions in both Korean (for understanding) and Japanese (for communicating with officials), along with required documents, estimated completion time, and deadlines.

**Why this priority**: Without clear, actionable instructions, users cannot actually complete the tasks. Bilingual support is essential because users need to understand procedures but also communicate with Japanese authorities.

**Independent Test**: Can be fully tested by selecting any task (e.g., "Register at City Hall") and verifying that it displays comprehensive information including Korean/Japanese instructions, document list, time estimate, and deadline.

**Acceptance Scenarios**:

1. **Given** a user views the task "Register at City Hall", **When** they expand the task details, **Then** they see instructions in both Korean and Japanese explaining the registration process
2. **Given** a task requires specific documents, **When** the user views the task, **Then** it displays a checklist of required documents (e.g., "Passport", "Residence Card Application", "Employment Contract")
3. **Given** a task has a deadline, **When** the user views it, **Then** the deadline is clearly shown (e.g., "Must complete within 14 days of arrival") and the system calculates the specific date based on the user's arrival date
4. **Given** a task includes estimated completion time, **When** the user views it, **Then** it shows realistic time estimates (e.g., "Estimated: 1-2 hours" for city hall registration)

---

### User Story 3 - Progress Tracking and Task Completion (Priority: P1)

A user completing settlement tasks wants to track their progress and feel a sense of accomplishment as they check off completed items. They can mark tasks as complete, see their overall progress percentage, and understand what remains to be done.

**Why this priority**: Progress tracking provides motivation and clarity. Without it, users feel overwhelmed by the number of tasks and cannot easily see what they've accomplished versus what's left.

**Independent Test**: Can be fully tested by checking off multiple tasks and verifying that the progress percentage updates correctly, completed tasks are visually marked, and the remaining task count decreases.

**Acceptance Scenarios**:

1. **Given** a user has 20 total tasks, **When** they check off 5 tasks as complete, **Then** the progress bar shows "25% complete (5/20 tasks)"
2. **Given** a user marks a task as complete, **When** they view the checklist, **Then** the completed task shows a checkmark, is visually de-emphasized (e.g., grayed out or moved to a "Completed" section), and its timestamp is recorded
3. **Given** a user has completed all tasks in the "First Week" section, **When** they view the checklist, **Then** the section shows "100% complete" and congratulates them
4. **Given** a user unchecks a previously completed task, **When** the action is confirmed, **Then** the progress percentage decreases accordingly and the task returns to the active list

---

### User Story 4 - Downloadable Form Templates and Helpful Resources (Priority: P2)

A user preparing documents needs access to official form templates and helpful resources. They can download PDF templates for common forms (residence card application, health insurance enrollment) and access links to official government websites and helpful tips.

**Why this priority**: This significantly improves user experience by providing everything in one place, but the checklist is still valuable without downloadable templates - users can find these forms elsewhere if needed.

**Independent Test**: Can be fully tested by accessing tasks that include form templates (e.g., "Apply for Residence Card") and verifying that PDF templates can be downloaded and helpful tips are displayed.

**Acceptance Scenarios**:

1. **Given** a task requires filling out a form, **When** the user views the task, **Then** they see a "Download Form Template" button that provides a pre-filled or blank PDF form
2. **Given** a user views a task, **When** helpful tips are available, **Then** they see contextual advice (e.g., "Tip: Bring photocopies of all documents - the office doesn't provide copying services")
3. **Given** a task involves government procedures, **When** the user views details, **Then** links to official government websites are provided for verification and additional information
4. **Given** a user downloads a form template, **When** they open it, **Then** the form is properly formatted and includes instructions in both Japanese and English/Korean where available

---

### User Story 5 - Task Filtering and Custom Organization (Priority: P3)

A user with limited time wants to focus on specific types of tasks. They can filter tasks by category (government, housing, finance, utilities), urgency level, or completion status to focus on what matters most at the moment.

**Why this priority**: This is a convenience feature that improves usability but isn't essential for the core experience. Users can still complete all tasks without filtering capabilities.

**Independent Test**: Can be fully tested by applying various filters (e.g., "Show only urgent tasks", "Show only government-related tasks") and verifying that the displayed task list updates correctly.

**Acceptance Scenarios**:

1. **Given** a user wants to focus on urgent tasks, **When** they select "Urgent Only" filter, **Then** only tasks with deadlines within 2 weeks are displayed
2. **Given** a user wants to see housing-related tasks, **When** they select "Housing" category filter, **Then** only tasks related to finding accommodation, signing leases, and setting up utilities are shown
3. **Given** a user wants to review completed tasks, **When** they select "Completed" status filter, **Then** all checked-off tasks are displayed with their completion timestamps
4. **Given** multiple filters are applied, **When** the user views the list, **Then** tasks matching ALL filter criteria are shown (e.g., "Urgent" AND "Government" shows only urgent government tasks)

---

### Edge Cases

- What happens when a user enters an arrival date in the past? System should still display the checklist but mark "Before Arrival" tasks as overdue and focus on current phase tasks
- What happens when a user changes their arrival date after already completing some tasks? System should preserve completed tasks but recalculate urgency levels and deadlines for remaining tasks
- How does the system handle tasks with absolute deadlines vs. relative deadlines? Some tasks have fixed government deadlines (e.g., "residence card within 14 days of arrival") while others are recommendations
- What if a user arrives in Tokyo without entering an arrival date beforehand? System should allow backdating and adjust task urgency accordingly
- How are tasks handled for users with different visa types? Some tasks (e.g., work visa procedures) only apply to certain visa categories
- What happens when downloadable forms are updated by the Japanese government? System should version forms and notify users of updates to templates they've already downloaded

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to input and save their planned Tokyo arrival date with calendar picker or manual date entry
- **FR-002**: System MUST automatically categorize tasks into time periods: "Before Arrival (1-3 months)", "Before Arrival (1 month)", "First Week", "First Month", and "First 3 Months"
- **FR-003**: System MUST calculate and display a countdown showing days remaining until arrival date, updating daily
- **FR-004**: System MUST highlight urgent tasks (those with deadlines within 14 days) in red color with high-priority visual indicators
- **FR-005**: System MUST display task details in both Korean and Japanese languages, allowing users to toggle between language views
- **FR-006**: System MUST show for each task: title, detailed instructions, required documents list, estimated completion time, and deadline (absolute or relative to arrival date)
- **FR-007**: System MUST allow users to mark tasks as complete/incomplete with checkbox interaction
- **FR-008**: System MUST calculate and display overall progress as a percentage (completed tasks / total tasks × 100)
- **FR-009**: System MUST provide downloadable PDF form templates for common procedures (residence card application, health insurance enrollment, etc.)
- **FR-010**: System MUST include helpful tips and context for each task (e.g., "Bring photocopies", "Office hours are 9 AM - 5 PM")
- **FR-011**: System MUST provide links to official government websites for verification and additional information
- **FR-012**: System MUST persist user's arrival date, task completion status, and completion timestamps across sessions
- **FR-013**: System MUST allow users to modify their arrival date and automatically recalculate task urgency and deadlines
- **FR-014**: System MUST display tasks in order of urgency within each time period section
- **FR-015**: System MUST show section-level progress (e.g., "First Week: 3/5 tasks completed")

- **FR-016**: System MUST allow creators to reorder tasks using drag-and-drop within a phase.
- **FR-017**: System MUST allow moving tasks between phases via drag-and-drop, automatically updating the task's Phase ID.
- **FR-018**: System MUST support strict Phase-based task organization in the Editor, preventing tasks from having invalid or ambiguous timing rules.
- **FR-019**: System SHOULD provide optimistic UI updates for reordering to ensure a responsive feel.

### Key Entities

- **Settlement Checklist Entry**: Represents a user's personalized settlement journey with arrival date, overall progress percentage, and creation timestamp
- **Settlement Task**: Represents an individual settlement activity with title, Korean instructions, Japanese instructions, required documents list, estimated time, deadline type (relative/absolute), deadline value, category (government/housing/finance/utilities/other), base urgency level, and optional form template URL
- **Task Completion**: Represents a user's progress on a specific task with completion status (boolean), completion timestamp, and association to user and task
- **Form Template**: Represents downloadable PDF forms with template name, description, file URL, version number, last updated date, and associated task categories

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can set up their personalized checklist by entering an arrival date and seeing organized tasks in under 30 seconds
- **SC-002**: 90% of users can identify their next 3 most urgent tasks within 10 seconds of viewing the checklist
- **SC-003**: Task details provide sufficient information that users can complete at least 80% of tasks without external research
- **SC-004**: Users can track their settlement progress from 0% to 100% complete as they check off all tasks
- **SC-005**: Bilingual instructions are accurate and clear enough that users can understand procedures in Korean and communicate with Japanese officials using Japanese text
- **SC-006**: Form templates are downloadable and usable without requiring additional software or conversion
- **SC-007**: The system correctly calculates task urgency and deadlines for arrival dates ranging from 90 days in the future to 90 days in the past
- **SC-008**: Progress percentages update in real-time (< 1 second) when users check/uncheck tasks
- **SC-009**: The checklist covers all essential settlement tasks required for legal residence in Tokyo (minimum 20-25 distinct tasks)
- **SC-010**: 95% of task deadlines and time estimates are accurate based on real-world settlement experiences

### User Experience Goals

- Users feel organized and in control of their Tokyo settlement process rather than overwhelmed
- Users can confidently complete bureaucratic procedures without fear of missing critical deadlines
- Users save time by having all necessary information, instructions, and forms in one centralized location
- Users completing the checklist reduce the risk of legal or administrative issues from missed requirements

## Out of Scope

The following are explicitly excluded from this feature:

- Multi-city support (only Tokyo is supported; other Japanese cities have different procedures)
- Visa application guidance (assumes user already has valid visa; focuses on post-arrival settlement)
- Housing search functionality (includes tasks for housing registration but not apartment hunting)
- Job search or career support (assumes user already has employment)
- Language learning resources (provides translations but not language education)
- Community forum or peer support features (focus is on checklist functionality)
- Immigration lawyer referrals or legal advice
- Financial services beyond basic bank account setup guidance
- Personalization based on family status, age, or other demographic factors (version 1 provides general guidance)
- Integration with government systems or automated form submission
- Task reminders via email or push notifications (may be added in future versions)

## Assumptions and Dependencies

### Assumptions

- Users have basic understanding of their visa type and employment status in Japan
- Users have internet access to view the checklist and download forms
- Users can read Korean or Japanese (or use external translation tools)
- Users are responsible for verifying official requirements with government sources
- Task information remains relatively stable (government procedures don't change frequently)

### Dependencies

- PDF form templates must be sourced from official government websites or created based on official requirements
- Task instructions require research and validation from reliable sources about Tokyo settlement procedures
- Bilingual content requires professional translation or native speaker verification for accuracy
- System relies on accurate information about government office hours, locations, and requirements as of the implementation date

## Technical Considerations (Non-Prescriptive)

While implementation details are not specified, the following technical aspects should be considered during planning:

### Data Considerations

- Task completion data should be associated with user accounts for persistence
- Arrival dates and progress should sync across devices if user accesses from multiple locations
- Form templates may require file storage solution with version control
- Bilingual content storage strategy (separate fields vs. translation system)

### Performance Considerations

- Checklist should load and display within 2 seconds even with 30+ tasks
- Progress percentage calculations should not cause noticeable UI lag
- Filtering and sorting operations should feel instant (< 200ms)
- PDF downloads should initiate immediately without preprocessing delays

### Accessibility Considerations

- Checklist should be keyboard navigable for users unable to use mouse
- Color-coding (red for urgent) must be supplemented with text/icons for colorblind users
- Screen readers should be able to interpret task status, urgency, and progress information
- Form templates should be accessible PDFs when possible

### Internationalization Considerations

- Date formats should follow user's locale preferences (while supporting Japanese format for local use)
- All UI text should be localizable (currently Korean/Japanese, potentially expandable)
- Currency and time displays should be consistent with Tokyo locale (JPY, 24-hour time)

## Future Enhancements

Potential features for future versions:

- Email/push notification reminders for upcoming task deadlines
- Integration with calendar apps to schedule tasks
- Support for other major Japanese cities (Osaka, Nagoya, Fukuoka)
- Family-specific checklists (tasks for bringing spouse, children)
- Community-contributed tips and recent experiences
- Cost estimation for each task (visa fees, registration costs, etc.)
- Task dependencies (e.g., "Complete Task A before Task B")
- Custom task creation for user-specific needs
- Export checklist to PDF or spreadsheet
- Multi-language support beyond Korean/Japanese (English, Chinese, etc.)
- Integration with local services (bank account opening, phone contracts)
- Photo documentation feature (upload photos of completed forms/documents)
- Sharing checklists with family members or colleagues also moving to Tokyo

---

---

## Extended Specification: Settlement Marketplace & Ecosystem (Product Vision)

### 1. Product Vision
**From "Static Checklist" to "Living Settlement Ecosystem"**

The goal is to evolve the settlement feature from a simple "To-Do List" into a **dynamic ecosystem** where collective intelligence helps users settle faster and smarter.
- **Current**: "Here is a standard list of things everyone does."
- **Future**: "Here is the best strategy for *you*, verified by people *like you*."

We treat settlement checklists not as static documents, but as **equippable modules ("Loadouts")**. Users can mix and match these modules to build their perfect personal roadmap.

---

### 2. Core User Experience (UX)

#### 2.1 The "Loadout" Concept (Checklist Composition)
Just like equipping gear in an RPG game, users "equip" Settlement Modules to their journey.
- **Base Layer**: The "Official Tokyo Settlement Guide" (Fundamental legal/admin tasks).
- **Add-on Layers**: Specialized modules that plug into the timeline.
    - 🏢 *Employment Type*: "Engineer Job Change Guide", "Fresh Graduate Guide"
    - 👨‍👩‍👧 *Family Status*: "Moving with Spouse", "Raising Kids (School/Nursery)", "Pet Relocation"
    - 🏠 *Lifestyle*: "Minato-ku Luxury Living", "Cost-effective Sharehouse Life"

**User Value**: Instead of ignoring 50% of irrelevant tasks in a generic list, users get a 100% relevant roadmap.

#### 2.2 User Scenarios

**Scenario A: The 30s Single Developer**
1.  **Onboarding**: Enters "Tokyo", "Single", "Engineer", "Arrival: Mar 1".
2.  **Recommendation**: System suggests the **"Tokyo Tech Starter Pack"**.
    - 📦 *Official Settlement Guide* (Visa/Resident Card)
    - 📦 *IT Engineer Setup* (Internet/Desk Setup/Tech Meetups)
    - 📦 *Single Life Hacks* (Furnished Apartments/Meal Delivery)
3.  **Action**: User clicks "Equip All".
4.  **Result**: A unified timeline appears. "Getting a SIM Card" (from Kit A) and "Registering at Connpass" (from Kit B) are scheduled intelligently.

**Scenario B: The Family Mover**
1.  **Context**: Moving with wife and 3-year-old child.
2.  **Selection**:
    - Equips *Official Guide*.
    - Equips *Dependent Visa Supplement*.
    - Equips *Tokyo Nursery (Hoikuen) Hunting Guide*.
3.  **Clash Management**: If two modules suggest "Bank Account", the system recognizes the duplication and merges them or asks the user which specific bank advice to follow.

---

### 3. Marketplace Mechanics

#### 3.1 Collections (꿀조합 / Best Practice Sets)
- **Problem**: Users don't know which modules they need.
- **Solution**: "Collections".
    - curated sets of modules.
    - Examples: "Zero-Japanese Survival Kit", "High-Income Expat Kit".
- **Social Proof**: Collections show "Used by 1,230 people", "98% Satisfaction".

#### 3.2 Forks & Remixes
- **Evolution**: A power user finds the "Official Guide" too slow. They modify it to add shortcuts (e.g., "Pre-fill forms online").
- **Sharing**: They publish this as "Fast-Track Official Guide (Remix)".
- **Attribution**: Original authors are credited. The community decides if the Remix is better via usage stats.

#### 3.3 Reviews & Feedback
- Users review **Modules**, not just the app.
- "This 'Pet Guide' is outdated for 2025" -> Author gets notified, or community flags it.
- "Helpful" votes push high-quality guides to the top.

---

### 4. Creator Ecosystem & Rewards

#### 4.1 Motivation (Why create?)
- **Altruism**: "I suffered so you don't have to."
- **Reputation (Honor)**:
    - High-ranking authors get "Settlement Guru" badges on their profiles.
    - This reputation spills over to other interactions (Mentoring, Hiring).
    - *Example*: A mentor with a top-rated "Junior Dev Settlement Guide" is seen as more trustworthy.

#### 4.2 Indirect Rewards
- **No Cash Payouts**: To avoid spam/low-quality bait.
- **Perks**:
    - Platform points (redeemable for mentoring sessions or premium features).
    - Exposure (Pinned profile, Featured author status).
    - Coffee coupons (eventual partnership potential).

---

### 5. Administration & Trust

#### 5.1 The "Official" Baseline
- The Admin team maintains the **"Standard Protocol"** (Core Module).
- This ensures legal accuracy implies "If you only do this, you won't get deported."
- All other modules are "Community Extensions".

#### 5.2 Quality Control
- **Verified Badge**: For community modules that have been manually audited by Admins.
- **Deprecation**: Old modules can be marked "Outdated" if the author doesn't update them.

---

### 6. Technical / Data Implications (Brief)
- **Multi-Subscription Engine**: The dashboard must query `UserTasks` from multiple source `Templates` and render them in a single `TimelineView`.
- **Conflict Resolution**: Logic to handle tasks with same `slug` or `intent` from different modules.
- **Versioning**: When a Creator updates a Module v1 -> v2, Subscribers get a "Update Available" prompt (like App Store updates).


