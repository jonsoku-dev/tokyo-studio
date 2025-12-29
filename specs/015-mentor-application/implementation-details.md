# SPEC 015: Mentor Application - Implementation Details

**Last Updated**: 2025-12-29
**Status**: Ready for Implementation

---

## 🎯 Implementation Priority

1. **Phase 1 (Week 1)**: Database + Application Submission
2. **Phase 2 (Week 2)**: Admin Review Queue
3. **Phase 3 (Week 3)**: Decision & Notifications
4. **Phase 4 (Week 4)**: Dashboard & Moderation

---

## 📊 Complete Database Schema

```sql
-- mentorApplications table
CREATE TABLE mentor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Professional Info
  jobTitle TEXT NOT NULL,
  company TEXT NOT NULL,
  yearsOfExperience INTEGER NOT NULL CHECK (yearsOfExperience >= 0 AND yearsOfExperience <= 50),
  linkedinUrl TEXT,
  bio TEXT NOT NULL,

  -- JSON Arrays
  expertise JSONB NOT NULL DEFAULT '[]',  -- ["Frontend", "Backend", "Mobile"]
  languages JSONB NOT NULL DEFAULT '{}',  -- {"japanese": "N1", "english": "Business"}

  -- Verification Document
  verificationFileUrl TEXT NOT NULL,  -- S3 private bucket key
  hourlyRate INTEGER NOT NULL CHECK (hourlyRate >= 3000 AND hourlyRate <= 50000),

  -- Status Tracking
  status VARCHAR NOT NULL DEFAULT 'pending',  -- pending|under_review|approved|rejected|cancelled
  rejectionReason TEXT,
  requestedInfoReason TEXT,

  -- Admin Review
  reviewedBy UUID REFERENCES users(id),
  reviewedAt TIMESTAMP,
  rejectedAt TIMESTAMP,  -- For 30-day cooldown

  -- Timestamps
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- admin_audit_logs table (already exists, reuse for application actions)
-- Structure confirms: adminId, action, targetId (application id), metadata, createdAt

-- Email Delivery Tracking (new)
CREATE TABLE mentor_application_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicationId UUID NOT NULL REFERENCES mentor_applications(id),
  userId UUID NOT NULL REFERENCES users(id),

  emailType VARCHAR NOT NULL,  -- approval|rejection|info_request
  subject TEXT NOT NULL,
  body TEXT NOT NULL,

  status VARCHAR DEFAULT 'pending',  -- pending|sent|failed
  sentAt TIMESTAMP,
  failureReason TEXT,
  retryCount INTEGER DEFAULT 0,

  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 🔐 Security & Validation

### File Upload Security

```typescript
// Allowed file types
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;  // 5MB

// Server-side validation
1. Check file extension (blacklist executable types)
2. Check MIME type (don't trust client-provided)
3. Check file size
4. Optional: Scan for malware (ClamAV, VirusTotal API)
5. Store in private S3 bucket (NO public URL)

// Admin access pattern:
- Generate signed S3 URL (expires in 1 hour)
- Only for authenticated admins
- Log all document downloads
```

### Input Validation

```typescript
// Use Zod schema
const mentorApplicationSchema = z.object({
  jobTitle: z.string().min(1).max(100),
  company: z.string().min(1).max(100),
  yearsOfExperience: z.number().min(0).max(50),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().min(200).max(2000),
  expertise: z.array(z.string()).min(1).max(5),
  languages: z.object({
    japanese: z.enum(['N1', 'N2', 'N3', 'None']),
    english: z.enum(['Business', 'Conversational', 'Basic', 'None']),
  }),
  hourlyRate: z.number().min(3000).max(50000),
});
```

### Rate Limiting

```typescript
// 1 application per user per 30 days (if rejected)
const canApply = async (userId: string) => {
  const lastRejection = await db
    .select()
    .from(mentorApplications)
    .where(eq(mentorApplications.userId, userId))
    .where(eq(mentorApplications.status, 'rejected'))
    .orderBy(desc(mentorApplications.rejectedAt))
    .limit(1);

  if (!lastRejection) return true;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return new Date(lastRejection[0].rejectedAt) < thirtyDaysAgo;
};

// Return error if not allowed
if (!canApply) {
  return {
    error: "You can reapply on: " + formatDate(rejectionDate + 30 days)
  };
}
```

---

## 📋 API Endpoints

### 1. User-Facing Routes

**GET /mentoring/apply**
- Check user eligibility
- Show form or "already applied" message
- Show reapplication date if rejected

**POST /mentoring/apply**
- Validate all fields (Zod)
- Upload document to S3 (private bucket)
- Create application record (status: pending)
- Send confirmation email to applicant
- Redirect to dashboard

**GET /dashboard/application**
- Show application status
- Show rejection reason if rejected
- Show "Reapply Now" button if eligible

**PATCH /mentoring/apply/update**
- Update pending application with more info
- Only if status is "under_review" (info requested)
- Same validation as POST

---

### 2. Admin Routes

**GET /admin/applications**
- List all applications
- Filters: status, expertise, experience level, date range
- Columns: applicant name, submission date, status, experience

**GET /admin/applications/:id**
- Full application details
- Auto-change status: pending → under_review
- Document viewer (signed S3 URL)
- Timeline of all actions

**POST /admin/applications/:id/approve**
```json
{
  "action": "approve"
}
```
**Actions**:
1. Begin transaction
2. Update app status: under_review → approved
3. Create mentor profile (isApproved: true)
4. Create availability template (empty slots)
5. Audit log: admin_id, action, timestamp
6. Send approval email
7. Commit transaction

**POST /admin/applications/:id/reject**
```json
{
  "action": "reject",
  "reason": "LinkedIn profile could not be verified"
}
```
**Actions**:
1. Validate reason length (min 50 chars)
2. Update app: rejectionReason, rejectedAt
3. Audit log with reason
4. Send rejection email with feedback

**POST /admin/applications/:id/request-info**
```json
{
  "action": "request_info",
  "message": "Please provide GitHub profile or portfolio link"
}
```
**Actions**:
1. Status stays "under_review"
2. Store requestedInfoReason
3. Send "Additional Info Requested" email
4. Allow applicant to PATCH /mentoring/apply/update

---

## 📧 Email Templates

### Submission Confirmation
```
Subject: "We received your mentor application"

Hi {name},

Thank you for applying! We've received your application and
our team is reviewing it.

Application Details:
- Job Title: {jobTitle}
- Company: {company}
- Experience: {years} years
- Expertise: {expertise.join(', ')}

We typically respond within 3-5 business days.
You can track your application status in your dashboard.

[TRACK STATUS BUTTON]
```

### Approved Email
```
Subject: "Welcome! Your mentor application has been approved 🎉"

Hi {name},

Congratulations! Your application to become a platform mentor
has been approved!

Next Steps:
1. Complete your mentor profile: {profileEditUrl}
2. Set your availability schedule: {availabilityUrl}
3. You can now receive booking requests!

Your hourly rate: ¥{rate}
Areas of expertise: {expertise}

Questions? Check our mentor FAQ or contact support.

[EDIT PROFILE] [SET SCHEDULE]
```

### Rejected Email
```
Subject: "Mentor application update"

Hi {name},

Thank you for applying to become a mentor. After careful review,
we've decided not to proceed with your application at this time.

Reason:
{rejectionReason}

You can reapply on: {reapplyDate}

We encourage you to address the feedback and try again.

Questions? Contact support@itcom.com

[REAPPLY AFTER {DATE}]
```

### Additional Info Requested
```
Subject: "More information needed for your mentor application"

Hi {name},

We're interested in your mentor application! To proceed, we need
some additional information:

{requestedInfoReason}

Please update your application by: {deadline}

[UPDATE APPLICATION]

Questions? Contact us.
```

---

## 🧪 Admin Dashboard Features

### Application List View
- Table: Name | Submitted | Status | Experience | Expertise
- Filters (left sidebar):
  - Status (Pending, Under Review, Approved, Rejected)
  - Expertise areas (multi-select)
  - Years experience (slider: 0-50)
  - Date range (from/to)
- Sort options: Newest, Oldest, Experience (high to low)
- Pagination: 20 per page

### Application Detail View
- Applicant avatar + name
- Timeline:
  - Submitted: {date}
  - Under Review: {date, adminName}
  - [Approved/Rejected]: {date, adminName}
- Full details:
  - Job Title, Company
  - Experience: {X} years
  - LinkedIn: {clickable link}
  - Expertise: {badges}
  - Languages: Japanese {level}, English {level}
  - Rate: ¥{hourlyRate}/hour
  - Bio: {full text}
- Document:
  - [DOWNLOAD] [PREVIEW IN VIEWER]
- Actions (if status not yet decided):
  - [APPROVE]
  - [REJECT]
  - [REQUEST MORE INFO]

---

## 📋 Implementation Checklist

**Phase 1: Database & Submission**
- [ ] Create mentorApplications table migration
- [ ] Create mentorApplicationEmails table
- [ ] Build /mentoring/apply form component
- [ ] Implement file upload to S3 (private bucket)
- [ ] Add Zod validation schema
- [ ] Create POST /mentoring/apply endpoint
- [ ] Send submission confirmation email

**Phase 2: Admin Interface**
- [ ] Create /admin/applications list route
- [ ] Add filtering + sorting
- [ ] Create /admin/applications/:id detail route
- [ ] Build document preview viewer
- [ ] Auto-update status to "under_review"

**Phase 3: Decision Logic**
- [ ] Create POST approve endpoint
- [ ] Create POST reject endpoint with reason validation
- [ ] Create POST request-info endpoint
- [ ] Implement transaction logic (atomicity)
- [ ] Send appropriate emails
- [ ] Log all admin actions to audit_logs

**Phase 4: User Dashboard**
- [ ] Show application status widget on dashboard
- [ ] Show rejection reason if rejected
- [ ] Show reapplication eligibility date
- [ ] Allow PATCH to update if info requested
- [ ] Show "Reapply Now" button if eligible

**Quality Assurance**
- [ ] Test file upload validation (type, size, malware)
- [ ] Test 30-day reapplication lock (server-side)
- [ ] Test concurrent admin reviews (transaction safety)
- [ ] Test email delivery retry logic
- [ ] Test role-based access control (non-admin blocked)
- [ ] Load test with 1000+ applications

---

## 🔍 Monitoring & Alerts

**Key Metrics to Track**:
- Applications submitted per day
- Average review time
- Approval rate (approved / total)
- Email delivery success rate
- Reapplication rate after rejection

**Alert Conditions**:
- Applications stuck "under_review" > 14 days
- Email delivery failure rate > 5%
- Malicious file upload attempts
- Unusual approval patterns (admin bulk-approving)
