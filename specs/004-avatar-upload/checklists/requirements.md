# Requirements Checklist

## Feature 004: Avatar Upload

- [x] **Functional Requirements**
  - [x] `FR-001` Upload via File Picker
  - [x] `FR-002` Drag-and-Drop Support
  - [x] `FR-003` Validate Files (JPG/PNG/WebP, Server & Client)
  - [x] `FR-004` Max File Size 5MB
  - [x] `FR-005` Cropping Interface (Circular)
  - [x] `FR-006` Reposition/Adjust Image
  - [x] `FR-012` Delete Avatar
  - [x] `FR-013` Magic Number Validation (via Sharp)
  - [x] `FR-019` Replace Old Avatar on New Upload
  - [x] `FR-020` Consistent Display (User Schema Updated)

## Validation Steps

- [x] Pass `pnpm biome check .`
- [x] Pass `pnpm typecheck`
- [x] Pass `pnpm build`
- [x] Manual Verification of Upload Flow
