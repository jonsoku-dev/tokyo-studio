# SPEC 022: Document Integration - Detailed Tasks

## ✅ Phase 1: Foundation (Complete)
- [x] Schema: resumeId, sharedDocumentIds, portfolioDocumentId
- [x] Constants, DocumentSelector component
- [x] Service layer updates

## ✅ Phase 2: Integration (Input Side Complete)
### Pipeline
- [x] Loader/Action/Modal integration (Attach Resume)
- [ ] **[Gap]** Display attached resume on Pipeline Card

### Mentoring
- [x] Loader/Action/BookingModal integration (Share Documents)
- [ ] **[Gap]** Display shared documents in Mentor Session View
- [ ] **[Gap]** Mentor view of shared documents (API/UI)

### Profile
- [x] Loader/API/Settings integration (Select Portfolio)
- [ ] **[Gap]** Display Portfolio on Public Profile (`/profile/:username`)

## 🚧 Phase 3: Access Control & Polish (Pending)
- [ ] **[API]** `GET /api/documents/:id/shared-access` (Secure Presigned URL)
- [ ] **[Security]** Validate document access (Ownership, Mentoring relation, Public Portfolio)
- [ ] **[UI]** PDF Viewer integration for shared documents

## ✅ Bug Fixes (Complete)
- [x] Route: mentoring/mentors/:mentorId
- [x] Route: /profile alias

## ✅ Verification
- [x] Typecheck: 0 errors
- [x] Biome: 0 errors
- [x] Build: SUCCESS
