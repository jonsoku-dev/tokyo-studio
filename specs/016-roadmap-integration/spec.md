# Feature Specification: Personalized Roadmap Generator

**Feature Branch**: `016-roadmap-integration`
**Created**: 2025-12-28
**Status**: Draft
**Input**: User description: "Build a personalized roadmap generator that creates a customized action plan based on user diagnosis results. When users complete the career diagnosis, the system analyzes their job family, experience level, language proficiency, and target city to generate a tailored roadmap with 10-15 actionable tasks. Tasks are categorized into Learning (skill development), Application (resume, job search), Preparation (interviews, language), and Settlement (visa, relocation). Each task includes a title, description, estimated time to complete, priority level, and recommended completion order. The roadmap displays as a Kanban board with columns for To Do, In Progress, and Completed. Users can drag-and-drop tasks between columns, add custom tasks, edit task details, and mark tasks complete with a checkbox. The system tracks progress percentage and suggests next steps when users complete milestones."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Personalized Roadmap from Diagnosis (Priority: P1)

A user completes the career diagnosis questionnaire and receives a customized roadmap with 10-15 actionable tasks tailored to their specific situation (job family, experience level, language skills, target city). The roadmap appears immediately after diagnosis completion, organized in a Kanban board with tasks distributed across "To Do," "In Progress," and "Completed" columns.

**Why this priority**: This is the core value proposition - transforming diagnosis results into actionable steps. Without this, the feature provides no value to users.

**Independent Test**: Can be fully tested by completing a career diagnosis with specific parameters and verifying that the generated roadmap contains relevant tasks appropriate to the user's profile.

**Acceptance Scenarios**:

1. **Given** a user completes the career diagnosis, **When** they submit their final answers, **Then** a personalized roadmap with 10-15 tasks appears categorized into Learning, Application, Preparation, and Settlement
2. **Given** a junior developer targeting Tokyo completes diagnosis, **When** the roadmap generates, **Then** tasks include beginner-level skill development, Japanese language study, visa application guidance, and Tokyo-specific settlement information
3. **Given** a senior engineer with N2 Japanese proficiency completes diagnosis, **When** the roadmap generates, **Then** advanced technical tasks are prioritized and Japanese language tasks are reduced or omitted
4. **Given** a user views their generated roadmap, **When** the page loads, **Then** each task displays a title, description, estimated time, priority level, and recommended order
5. **Given** a user receives their roadmap, **When** they view the initial state, **Then** all tasks start in the "To Do" column with priority indicators

---

### User Story 2 - Manage Tasks with Kanban Board Interface (Priority: P2)

A user actively manages their roadmap by dragging tasks between "To Do," "In Progress," and "Completed" columns to reflect their current progress. They can mark tasks complete with a checkbox, and the system visually tracks their overall progress percentage.

**Why this priority**: Provides essential interactivity for users to actively engage with their roadmap. Critical for ongoing user engagement but depends on P1 for initial roadmap generation.

**Independent Test**: Can be tested by generating a roadmap and verifying that tasks can be moved between columns, marked complete, and progress percentage updates correctly.

**Acceptance Scenarios**:

1. **Given** a user has tasks in their roadmap, **When** they drag a task from "To Do" to "In Progress," **Then** the task moves to the new column and the system updates the progress percentage
2. **Given** a user is working on a task, **When** they complete it and mark the checkbox, **Then** the task automatically moves to "Completed" and progress increases accordingly
3. **Given** a user has completed 5 out of 12 tasks, **When** they view the roadmap, **Then** the progress bar shows 42% completion (5/12)
4. **Given** a user wants to reprioritize, **When** they drag a task from "In Progress" back to "To Do," **Then** the task moves and progress percentage decreases
5. **Given** a user completes a task, **When** the task moves to "Completed," **Then** a visual indicator (checkmark, color change) confirms the completion

---

### User Story 3 - Customize Roadmap with Personal Tasks (Priority: P3)

A user wants to add their own custom tasks to supplement the system-generated roadmap. They click "Add Custom Task," fill in the title, description, category, estimated time, and priority, and the new task appears in the "To Do" column alongside generated tasks.

**Why this priority**: Enables personalization beyond algorithm-generated suggestions. Valuable for user agency but not critical for core roadmap functionality.

**Independent Test**: Can be tested by adding custom tasks with various attributes and verifying they appear correctly in the roadmap and can be managed like generated tasks.

**Acceptance Scenarios**:

1. **Given** a user views their roadmap, **When** they click "Add Custom Task" and fill in the required fields (title, description, category, time estimate, priority), **Then** the new task appears in the "To Do" column
2. **Given** a user creates a custom task, **When** they save it, **Then** the task includes all specified attributes and can be dragged, edited, and completed like generated tasks
3. **Given** a user wants to modify a custom task, **When** they click "Edit" on the task, **Then** they can update any field and the changes persist
4. **Given** a user creates multiple custom tasks, **When** they assign different categories (Learning, Application, Preparation, Settlement), **Then** the tasks are visually distinguished by category
5. **Given** a user deletes a custom task, **When** they confirm deletion, **Then** the task is permanently removed from the roadmap

---

### User Story 4 - Receive Milestone Suggestions and Next Steps (Priority: P4)

A user completes a significant milestone (e.g., all Learning tasks, 50% overall completion, all Settlement tasks) and receives an automated suggestion for the next recommended action. These suggestions help guide the user through their journey sequentially and adaptively.

**Why this priority**: Enhances user guidance and motivation but is not essential for basic roadmap functionality. Provides ongoing engagement value.

**Independent Test**: Can be tested by completing specific milestone thresholds and verifying that appropriate next-step suggestions appear with relevant content.

**Acceptance Scenarios**:

1. **Given** a user completes all tasks in the "Learning" category, **When** they mark the final Learning task complete, **Then** a notification appears suggesting they focus on "Application" tasks next
2. **Given** a user reaches 50% overall completion, **When** the milestone is achieved, **Then** the system displays a congratulatory message and highlights the highest-priority remaining task
3. **Given** a user completes all "Settlement" tasks, **When** this milestone is reached, **Then** the system suggests connecting with mentors or exploring community resources as next steps
4. **Given** a user completes a milestone, **When** the suggestion appears, **Then** it includes specific, actionable recommendations relevant to their remaining tasks and profile
5. **Given** a user dismisses a milestone suggestion, **When** they click "Dismiss" or "Got it," **Then** the notification disappears and does not reappear for that specific milestone

---

### Edge Cases

- **Empty Diagnosis Results**: What happens when a user's diagnosis is incomplete or missing critical information? System should either prompt for additional information or generate a minimal roadmap with general tasks and encourage profile completion.
- **Conflicting Task Dependencies**: How does the system handle when a user wants to move a dependent task to "Completed" before its prerequisite is finished? System should allow the action but display a warning indicator showing recommended order is not being followed.
- **Excessive Custom Tasks**: What happens if a user adds 50+ custom tasks, overwhelming the Kanban board? System should support pagination or scrolling within columns and display a task count indicator.
- **Progress Regression**: How does the system handle when a user moves multiple completed tasks back to "To Do" or "In Progress"? System should update progress percentage downward and optionally ask for confirmation if moving more than 3 tasks at once.
- **Roadmap Regeneration**: What happens if a user wants to retake the diagnosis after already having a roadmap with partial progress? System should offer options to either merge new tasks with existing roadmap or start fresh (with confirmation warning about losing progress).
- **Task Time Estimates Accuracy**: How does the system handle when actual time spent significantly differs from estimated time? System could track actual completion time and learn to improve estimates over time, or allow users to manually adjust estimates.
- **Milestone Notification Frequency**: How does the system prevent overwhelming users with too many milestone notifications? System should throttle notifications to one per session or per day and allow users to mute milestone suggestions in settings.
- **Concurrent Task Editing**: What happens if a user has their roadmap open in multiple browser tabs and makes conflicting changes? System should use optimistic locking or last-write-wins with visual indicators when data has been updated externally.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST generate a personalized roadmap with 10-15 tasks immediately upon completion of career diagnosis
- **FR-002**: System MUST analyze diagnosis inputs (job family, experience level, language proficiency, target city) to tailor task recommendations
- **FR-003**: System MUST categorize all tasks into one of four types: Learning, Application, Preparation, or Settlement
- **FR-004**: Each task MUST include a title, description, estimated time to complete, priority level, and recommended completion order
- **FR-005**: System MUST display roadmap as a Kanban board with three columns: "To Do," "In Progress," and "Completed"
- **FR-006**: Users MUST be able to drag-and-drop tasks between any of the three columns
- **FR-007**: Users MUST be able to mark tasks complete using a checkbox, which automatically moves the task to "Completed"
- **FR-008**: System MUST calculate and display overall progress percentage based on completed tasks versus total tasks
- **FR-009**: Users MUST be able to add custom tasks with specified title, description, category, time estimate, and priority
- **FR-010**: Users MUST be able to edit custom task details after creation
- **FR-011**: Users MUST be able to delete custom tasks with a confirmation prompt
- **FR-012**: System MUST detect when users reach milestones (category completion, percentage thresholds) and suggest next steps
- **FR-013**: System MUST persist roadmap state (task positions, completion status, custom tasks) across user sessions
- **FR-014**: System MUST visually distinguish tasks by category using color coding, icons, or labels
- **FR-015**: System MUST display recommended task order through visual indicators (numbering, priority badges, or sorting)
- **FR-016**: System MUST allow users to dismiss milestone suggestions without affecting task data
- **FR-017**: System MUST support responsive design so roadmap is usable on mobile devices with touch-based drag-and-drop

### Key Entities

- **Roadmap**: Represents a user's complete action plan, containing multiple tasks, associated with a specific user and diagnosis result, including generation timestamp, overall progress percentage, and current milestone status
- **Task**: Represents a single actionable item with attributes including title, description, category (Learning/Application/Preparation/Settlement), estimated time to complete, priority level (High/Medium/Low), recommended order number, current status (To Do/In Progress/Completed), creation source (generated vs. custom), and completion timestamp
- **Diagnosis Result**: Represents the user's completed career assessment including job family, experience level (Junior/Mid/Senior), language proficiency (JLPT levels or equivalent), target city, and additional profile information used for roadmap personalization
- **Milestone**: Represents significant progress checkpoints including milestone type (category completion, percentage threshold), achievement timestamp, and associated next-step suggestion content
- **Task Category**: Enum defining the four task types (Learning, Application, Preparation, Settlement) with associated metadata for color coding and icon representation

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users receive a personalized roadmap within 3 seconds of completing their career diagnosis
- **SC-002**: 90% of generated roadmaps contain tasks relevant to the user's specific profile (validated through user feedback survey)
- **SC-003**: Users can drag-and-drop tasks between columns with visual feedback appearing within 100ms of interaction
- **SC-004**: Progress percentage updates in real-time (within 200ms) when tasks change status
- **SC-005**: 70% of users who receive a roadmap interact with it (move tasks, mark complete, or add custom tasks) within their first session
- **SC-006**: Users complete an average of 3+ tasks per week after roadmap generation
- **SC-007**: 80% of milestone suggestions result in user engagement with the recommended next task within 24 hours
- **SC-008**: Custom task creation and editing flows complete in under 30 seconds per task
- **SC-009**: Roadmap state persists accurately across sessions with zero data loss incidents
- **SC-010**: Mobile users can successfully manage their roadmap using touch gestures with 90% task success rate (completing intended drag-and-drop actions)
- **SC-011**: Users who actively use the roadmap (5+ task status changes) have 60% higher platform engagement compared to users who don't use roadmaps (measured over 30 days)
