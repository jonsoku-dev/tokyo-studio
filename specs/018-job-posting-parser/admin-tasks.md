# Admin Tasks: Job Posting Parser

## Schema
- [ ] Define `job_postings` table.
- [ ] Define `job_sources` table (source configurations).
- [ ] Define `parse_logs` table.

## Backend Implementation
- [ ] **Query**: `adminListJobs(filters)`.
- [ ] **Mutation**: `adminUpdateJob(jobId, data)`.
- [ ] **Mutation**: `adminFlagJob(jobId, reason)` / `adminHideJob()`.
- [ ] **Mutation**: `adminTriggerParse(sourceId)`.
- [ ] **Query**: `adminGetParserHealth()`.

## Frontend Implementation
- [ ] **Page**: `features/jobs/routes/admin.tsx`.
- [ ] **Component**: Job table with inline edit.
- [ ] **Component**: Parser health widget.

## QA Verification
- [ ] **Test**: Edit a job posting, verify changes persist.
- [ ] **Test**: Flag a job, verify it appears flagged.
