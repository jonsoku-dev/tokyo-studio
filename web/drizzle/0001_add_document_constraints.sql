-- Migration: Add Database Constraints and Indexes for Documents
-- Task: TASK-SEC-005
-- Date: 2026-01-01

-- ============================================================
-- DOCUMENTS TABLE CONSTRAINTS
-- ============================================================

-- Add NOT NULL constraints
ALTER TABLE "documents"
  ALTER COLUMN "status" SET NOT NULL,
  ALTER COLUMN "user_id" SET NOT NULL,
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "updated_at" SET NOT NULL;

-- Add CHECK constraints for enum values
ALTER TABLE "documents"
  ADD CONSTRAINT "documents_status_check"
  CHECK (status IN ('draft', 'final', 'pending', 'uploaded', 'deleted'));

ALTER TABLE "documents"
  ADD CONSTRAINT "documents_type_check"
  CHECK (type IN ('Resume', 'CV', 'Portfolio', 'Cover Letter'));

-- Add composite indexes for query performance
CREATE INDEX IF NOT EXISTS "documents_user_uploaded_at_idx"
  ON "documents" ("user_id", "uploaded_at" DESC);

CREATE INDEX IF NOT EXISTS "documents_user_status_idx"
  ON "documents" ("user_id", "status");

-- ============================================================
-- DOCUMENT VERSIONS TABLE CONSTRAINTS
-- ============================================================

-- Add NOT NULL constraint
ALTER TABLE "document_versions"
  ALTER COLUMN "created_at" SET NOT NULL;

-- Add CHECK constraint for changeType enum
ALTER TABLE "document_versions"
  ADD CONSTRAINT "document_versions_change_type_check"
  CHECK (change_type IN ('upload', 'rename', 'status_change'));

-- Add index for version history queries
CREATE INDEX IF NOT EXISTS "document_versions_document_created_at_idx"
  ON "document_versions" ("document_id", "created_at" DESC);

-- ============================================================
-- NOTES
-- ============================================================
-- 1. Foreign key CASCADE DELETE already exists in schema
-- 2. File size constraint not added as size is stored as text
-- 3. All changes are backward compatible with existing data
-- 4. Indexes will improve query performance for common patterns:
--    - Listing user documents by upload date
--    - Filtering documents by status
--    - Retrieving version history
