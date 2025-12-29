# Admin Tasks: Email Verification

## Backend Implementation
- [ ] **Mutation**: `adminVerifyEmail(userId)`
    - Update `users.emailVerified = new Date()`.
    - Insert into `admin_audit_logs` (`action: "manual_email_verify"`).
- [ ] **Mutation**: `adminResendVerificationEmail(userId)`
    - Check if user exists.
    - Generate token -> Insert `verification_tokens`.
    - Trigger Email Worker.

## Frontend Implementation
- [ ] **Component**: `ValidationStatusBadge`
    - Tooltip: "Verified at [Date]" or "Pending".
- [ ] **Integration**: Connect "Mark as Verified" button to mutation.

## QA Verification
- [ ] **Test Case**: Create unverified user. Admin clicks "Mark as Verified". Check DB for `emailVerified` timestamp.
- [ ] **Test Case**: Check `admin_audit_logs` for the action record.
