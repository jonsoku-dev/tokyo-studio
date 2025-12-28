# Feature Specification: Mentor Application Workflow

**Feature Branch**: `015-mentor-application`
**Created**: 2025-12-28
**Status**: Draft
**Input**: User description: "Build a mentor application workflow where users can apply to become platform mentors. The application form collects current job title, company name, years of IT experience in Japan, LinkedIn profile URL, areas of expertise (Frontend, Backend, Mobile, etc.), languages spoken, preferred hourly rate, and a detailed bio explaining why they want to mentor. Applicants upload a verification document (company ID badge or recent payslip with sensitive info redacted) to prove employment. Applications are submitted to an admin review queue where admins can approve, reject with feedback, or request additional information. Approved applicants receive an email notification and their account is upgraded to mentor status, unlocking the availability scheduler and profile customization. Rejected applicants can reapply after 30 days. The system tracks application status (Pending, Under Review, Approved, Rejected) and displays it on the applicant's dashboard."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Application Submission (Priority: P1)

Regular users can submit an application to become a platform mentor by filling out a comprehensive application form that captures their professional background, expertise, and motivation.

**Why this priority**: This is the entry point for the entire mentor onboarding flow. Without the ability to submit applications, no other functionality in this feature has value. This represents the minimum viable product that delivers immediate value by allowing users to express interest and begin the qualification process.

**Independent Test**: Can be fully tested by allowing a user to access the application form, complete all required fields, upload a verification document, and submit the application successfully. The test confirms that application data is persisted to the database with "Pending" status and the user receives immediate visual confirmation.

**Acceptance Scenarios**:

1. **Given** a logged-in user with a regular account, **When** they navigate to the "Become a Mentor" section, **Then** they see an application form with fields for job title, company name, years of IT experience in Japan, LinkedIn URL, areas of expertise (multi-select: Frontend, Backend, Mobile, DevOps, Data, Design), languages spoken (Japanese proficiency: N1/N2/N3, English proficiency: Business/Conversational/Basic), preferred hourly rate (JPY), and a bio text area (minimum 200 characters explaining why they want to mentor)

2. **Given** a user is filling out the application form, **When** they attempt to submit with incomplete required fields, **Then** they see inline validation errors highlighting missing or invalid fields (e.g., invalid LinkedIn URL format, hourly rate below minimum threshold of ¥3,000, bio too short)

3. **Given** a user has completed all required fields, **When** they upload a verification document (company ID badge or payslip), **Then** the system validates the file type (PDF, JPG, PNG only), file size (max 5MB), and displays a preview or confirmation that the file was uploaded successfully

4. **Given** a user has completed the form and uploaded verification, **When** they click "Submit Application", **Then** the application is created with status "Pending", the user sees a success message confirming submission, and they are redirected to their dashboard where the application status is visible

5. **Given** a user has already submitted an application, **When** they attempt to access the application form again, **Then** they see a message indicating they already have a pending/under review application and cannot submit another until their current application is resolved

---

### User Story 2 - Admin Review Queue (Priority: P2)

Administrators can view, review, and make decisions on pending mentor applications through a dedicated admin interface that displays all submitted applications with filtering and sorting capabilities.

**Why this priority**: Once users can submit applications (P1), admins need the ability to review and act on them. Without this, applications would accumulate with no path to resolution. This is the second critical piece that enables the workflow to function end-to-end.

**Independent Test**: Can be fully tested by having an admin access the mentor application review queue, view application details, and verify that all submitted application data is displayed correctly with filtering/sorting options available. Verifies the read path without requiring decision-making functionality.

**Acceptance Scenarios**:

1. **Given** an admin is logged into the admin dashboard, **When** they navigate to the "Mentor Applications" section, **Then** they see a list of all applications with columns for applicant name, submission date, current status (Pending, Under Review, Approved, Rejected), years of experience, and quick preview of expertise areas

2. **Given** an admin is viewing the application list, **When** they apply filters (by status, by expertise area, by experience level, by submission date range), **Then** the list updates to show only applications matching the selected criteria

3. **Given** an admin clicks on an application row, **When** the detail view loads, **Then** they see all application fields (job title, company, experience years, LinkedIn URL as clickable link, expertise areas as badges, languages with proficiency levels, hourly rate, full bio text, and a downloadable/viewable verification document)

4. **Given** an admin is viewing an application detail, **When** they view the verification document, **Then** the document is displayed securely (PDF viewer or image preview) without exposing the file URL publicly, and they can download it for closer inspection if needed

5. **Given** multiple admins are reviewing applications simultaneously, **When** one admin opens an application for review, **Then** the status automatically changes to "Under Review" and other admins see this updated status in real-time to avoid duplicate review work

---

### User Story 3 - Application Decision & Notification (Priority: P3)

Administrators can approve or reject applications with feedback, triggering automated email notifications and account status updates that either grant mentor privileges or provide actionable feedback for improvement.

**Why this priority**: After admins can view applications (P2), they need the ability to make decisions. This completes the core workflow and provides closure for applicants. While critical for a complete experience, the first two priorities enable the submission and review pipeline to function, making this the final step.

**Independent Test**: Can be fully tested by having an admin approve or reject an application and verifying that the user receives the correct email notification, their account status is updated appropriately (mentor privileges granted or reapplication timer set), and the decision is permanently recorded in the database.

**Acceptance Scenarios**:

1. **Given** an admin is viewing an application detail in "Under Review" status, **When** they click the "Approve" button, **Then** a confirmation modal appears asking them to confirm the decision

2. **Given** an admin confirms approval, **When** the approval is processed, **Then** the applicant's user account is upgraded to mentor status (isApproved flag set to true in mentors table), an email is sent to the applicant with subject "Your Mentor Application Has Been Approved", and the application status changes to "Approved"

3. **Given** an admin is viewing an application detail, **When** they click the "Reject" button, **Then** they are prompted to provide rejection feedback (required text field, minimum 50 characters explaining the reason for rejection)

4. **Given** an admin provides rejection feedback and confirms, **When** the rejection is processed, **Then** the application status changes to "Rejected", the rejection reason is stored with the application, an email is sent to the applicant with the feedback, and a 30-day reapplication lock is set (stored as rejectedAt timestamp)

5. **Given** an admin is viewing an application detail, **When** they click "Request More Information", **Then** they can specify what additional information is needed (free text field), the applicant receives an email with the request, the application status remains "Under Review", and the applicant can update their application with the requested information

---

### User Story 4 - Application Status Dashboard (Priority: P4)

Applicants can track their application status in real-time from their user dashboard, seeing current status, any admin feedback, and next steps available to them.

**Why this priority**: While not blocking the core workflow, this provides essential transparency and reduces support burden. Users can self-service their status rather than emailing admins. This is a quality-of-life improvement that completes the user experience.

**Independent Test**: Can be fully tested by submitting an application as a user, then viewing the dashboard to confirm the application status is displayed correctly with all relevant metadata (submission date, current status, feedback if any, reapplication eligibility).

**Acceptance Scenarios**:

1. **Given** a user has submitted a mentor application, **When** they view their dashboard, **Then** they see a "Mentor Application Status" widget showing their current status (Pending, Under Review, Approved, Rejected), submission date, and last updated timestamp

2. **Given** a user's application is "Under Review", **When** they check their dashboard, **Then** they see a message indicating "Your application is currently being reviewed by our team. We typically respond within 3-5 business days."

3. **Given** a user's application was approved, **When** they check their dashboard, **Then** they see a success message with a link to access the mentor availability scheduler and profile customization features

4. **Given** a user's application was rejected, **When** they check their dashboard, **Then** they see the rejection feedback provided by the admin, the reason for rejection, and information about when they can reapply (date calculated as rejectedAt + 30 days)

5. **Given** a user's application was rejected and the 30-day period has passed, **When** they access the dashboard, **Then** they see a "Reapply Now" button that allows them to submit a new application

6. **Given** a user's application has an "Additional Information Requested" status, **When** they view their dashboard, **Then** they see the admin's request clearly displayed with an "Update Application" button that allows them to edit their submission and provide the requested information

---

### Edge Cases

- **What happens when a user tries to submit an application with a malicious file (e.g., executable disguised as PDF)?** The system must validate file types using both extension and MIME type checks, reject any executable or script files, and scan uploaded files for viruses/malware before storage.

- **What happens when an admin approves an application but the email notification fails to send?** The account upgrade should still complete successfully, the application status should be recorded as "Approved", and a background job should retry email delivery up to 3 times. The admin interface should show email delivery status so failed notifications can be manually addressed.

- **What happens when a user uploads a verification document containing unredacted sensitive information (e.g., full salary, personal ID numbers)?** While the system cannot automatically detect this, the admin review process should include guidelines for verifying that sensitive information is properly redacted, and admins should have the ability to request a new document upload if sensitive data is exposed.

- **What happens when multiple applications are submitted simultaneously from different users and admin actions create race conditions?** All database operations involving status changes must use optimistic locking or transactions to prevent data corruption, and the UI should refresh automatically to reflect the latest state.

- **What happens when a user's LinkedIn profile URL is valid but the profile doesn't exist or is private?** The system should validate URL format but cannot verify profile accessibility. Admins should manually verify LinkedIn profiles as part of the review process. Invalid or suspicious profiles should be grounds for rejection.

- **What happens when a rejected user tries to manipulate the rejectedAt timestamp to bypass the 30-day reapplication lock?** The reapplication eligibility check must be enforced server-side, not client-side. Any attempt to submit a new application before the 30-day period must be rejected with a clear error message showing the remaining wait time.

- **What happens when an admin account is compromised and mass-approves/rejects applications?** All admin actions should be audit-logged with timestamps, IP addresses, and admin user IDs. Unusual patterns (e.g., 10+ approvals in under 1 minute) should trigger alerts for review. A separate admin permission level could be introduced for senior admins to reverse fraudulent decisions.

- **What happens when the hourly rate entered is extremely high (e.g., ¥100,000/hour) or extremely low (e.g., ¥500/hour)?** The system should enforce minimum (¥3,000) and maximum (¥50,000) hourly rate limits with clear validation messages explaining the acceptable range. Rates outside this range suggest either a typo or a user who doesn't understand the platform's target market.

- **What happens when a user's account is deleted while their application is under review?** Applications should remain in the system for audit purposes even if the associated user account is soft-deleted. If the account is permanently deleted, orphaned applications should be automatically set to "Cancelled" status.

- **What happens when an application has been "Under Review" for more than 14 days with no admin action?** A background job should identify stale applications and send reminder emails to admins. If an application remains in "Under Review" for 30+ days, the system should auto-send an apology email to the applicant explaining the delay and assuring them their application is still being processed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an application form accessible only to logged-in users with regular (non-mentor) accounts
- **FR-002**: System MUST collect required fields: job title (text, 1-100 chars), company name (text, 1-100 chars), years of IT experience in Japan (integer, 0-50), LinkedIn profile URL (valid URL format), areas of expertise (multi-select from predefined list: Frontend, Backend, Mobile, DevOps, Data, Design, PM, QA), languages spoken with proficiency (Japanese: N1/N2/N3/None, English: Business/Conversational/Basic/None), preferred hourly rate (integer, ¥3,000-¥50,000), and bio (text, 200-2000 characters)
- **FR-003**: System MUST allow applicants to upload exactly one verification document (PDF, JPG, or PNG, max 5MB) proving employment
- **FR-004**: System MUST validate all form fields before submission and display actionable error messages for invalid inputs
- **FR-005**: System MUST prevent users from submitting multiple applications concurrently (one pending/under review application per user at a time)
- **FR-006**: System MUST track application status using exactly four states: "Pending" (initial), "Under Review" (admin opened), "Approved" (mentor granted), "Rejected" (denied with feedback)
- **FR-007**: System MUST provide admins with a review queue showing all applications with filtering by status, expertise area, experience level, and submission date
- **FR-008**: System MUST allow admins to view full application details including all submitted fields and downloadable verification document
- **FR-009**: System MUST allow admins to approve applications, which upgrades the user account to mentor status and sends an approval email notification
- **FR-010**: System MUST allow admins to reject applications with mandatory feedback (minimum 50 characters) and send a rejection email notification with the feedback
- **FR-011**: System MUST enforce a 30-day waiting period before rejected applicants can reapply (calculated from rejection timestamp)
- **FR-012**: System MUST allow admins to request additional information from applicants, keeping the application in "Under Review" status
- **FR-013**: System MUST display application status on the user's dashboard with relevant metadata (submission date, current status, admin feedback if any, reapplication date if rejected)
- **FR-014**: System MUST send email notifications for three events: approval (with next steps), rejection (with feedback and reapplication date), and additional information requests (with what's needed)
- **FR-015**: System MUST audit-log all admin actions on applications (approve, reject, request info) with admin user ID, timestamp, and IP address
- **FR-016**: System MUST automatically change application status from "Pending" to "Under Review" when an admin opens an application detail view
- **FR-017**: System MUST validate uploaded files by both file extension and MIME type to prevent malicious uploads
- **FR-018**: System MUST store uploaded verification documents securely with access restricted to admins only (no public URLs)
- **FR-019**: System MUST allow approved mentors to access availability scheduler and profile customization features immediately after approval
- **FR-020**: System MUST prevent approved/rejected applications from being edited or deleted (immutable audit trail)

### Key Entities

- **MentorApplication**: Represents a user's application to become a mentor. Key attributes include applicant user ID, job title, company name, years of IT experience in Japan, LinkedIn URL, areas of expertise (array), languages with proficiency levels (JSON object), preferred hourly rate, bio text, verification document storage URL, current status (Pending/Under Review/Approved/Rejected), rejection feedback (if rejected), submission timestamp (createdAt), last updated timestamp (updatedAt), rejection timestamp (rejectedAt, used to calculate reapplication eligibility).

- **MentorApplicationAuditLog**: Tracks all admin actions on applications for compliance and fraud detection. Key attributes include application ID (foreign key), admin user ID, action type (Opened, Approved, Rejected, RequestedInfo), action timestamp, IP address, optional notes/feedback. Relationships: belongs to MentorApplication, belongs to Admin User.

- **EmailNotification**: Represents outbound emails triggered by application events. Key attributes include recipient user ID, email type (ApplicationApproved, ApplicationRejected, AdditionalInfoRequested), sent timestamp, delivery status (Pending, Sent, Failed), retry count, email body snapshot. Relationships: belongs to User, optionally belongs to MentorApplication.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the mentor application form and submit it successfully in under 10 minutes (average time from form load to successful submission)
- **SC-002**: 100% of submitted applications appear in the admin review queue within 5 seconds of submission
- **SC-003**: Admins can review an application (view all details, download verification document) and make a decision in under 5 minutes per application
- **SC-004**: 95% of email notifications (approval, rejection, info request) are delivered within 1 minute of the triggering action
- **SC-005**: Zero users can bypass the 30-day reapplication lock through client-side manipulation (enforced server-side)
- **SC-006**: 100% of admin actions (approve, reject, request info) are successfully logged to the audit trail with complete metadata
- **SC-007**: Application status is reflected on the user dashboard within 3 seconds of admin action completion
- **SC-008**: File upload validation rejects 100% of non-PDF/JPG/PNG files and files exceeding 5MB
- **SC-009**: Form validation provides actionable error messages for 100% of invalid field inputs before form submission
- **SC-010**: Approved users gain access to mentor features (availability scheduler, profile customization) within 10 seconds of approval completion
- **SC-011**: The application review queue can handle and display 1,000+ applications without performance degradation (list load time < 2 seconds)
- **SC-012**: Zero data loss or corruption occurs when multiple admins review applications concurrently (verified through load testing with 5+ concurrent admin users)
