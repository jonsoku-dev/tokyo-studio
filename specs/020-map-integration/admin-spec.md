# Admin Feature Specification: Map/Location Management

**Feature**: `020-map-integration`
**Role**: Admin
**Outcome**: Admins can manage location data and map markers.

## Current Implementation Status

### Main Spec Reference
- **File**: `specs/020-map-integration/spec.md`
- **User Scenarios**: 6 stories (View Locations, Filter, Search, Directions, Favorites, Non-Tokyo Areas)
- **Requirements**: FR-001 to FR-014

### Existing Code
| Path | Status |
|------|--------|
| Map feature | ❌ **Not Implemented** |

### Schema From Main Spec
- **MapLocation**: Physical location with multilingual names (EN/JP/KR), coordinates, business hours
- **LocationCategory**: Government, Immigration, Banking, Mobile, Housing, Shopping
- **UserFavorite**: Junction for saved locations
- **CustomMarker**: User-created pins
- **LocationIssueReport**: User-reported data inaccuracies

## 1. User Scenarios (Admin)

### 1.1 Manage Location Points
**As an**: Admin
**I want to**: Add/edit/remove map points
**So that**: Users can access accurate location info.

- **Categories**: Government, Immigration, Banking, Mobile, Housing, Shopping (FR-002)

### 1.2 Geocode Address
**As an**: Admin
**I want to**: Enter an address and get coordinates
**So that**: I don't need to manually find lat/lng.

### 1.3 Manage Location Categories
**As an**: Admin
**I want to**: Define categories with icons and colors
**So that**: Users can filter the map effectively.

### 1.4 Review Issue Reports
**As an**: Admin
**I want to**: Handle user-submitted location issues
**So that**: Data stays accurate.

- **Issue Types**: Closed, WrongHours, WrongAddress, Other (from schema)

### 1.5 Manage Multi-Area Data
**As an**: Admin
**I want to**: Add locations for areas outside Tokyo
**So that**: Users in Yokohama, Chiba, Saitama are served.

## 2. Requirements

### 2.1 Dependencies (From Main Spec)
- **FR-003**: Multilingual names (EN/JP/KR)
- **FR-012**: "Last updated" timestamp and "Report Issue" button
- **FR-011**: Support for Yokohama, Chiba, Saitama

### 2.2 Admin-Specific Requirements
- **FR_ADMIN_020.01**: Location CRUD with geocoding
- **FR_ADMIN_020.02**: Category management
- **FR_ADMIN_020.03**: Issue report queue
- **FR_ADMIN_020.04**: Multi-area data management

## 3. Data Model Reference (Proposed)

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `map_locations` | **Read/Write** | Location data |
| `location_categories` | **Read/Write** | Categories |
| `location_issue_reports` | **Read/Write** | User reports |
| `admin_audit_logs` | **Write** | Actions |

## 4. Work Definition (Tasks)

### Phase 1: Schema
- [ ] Create `map_locations` table with EN/JP/KR fields
- [ ] Create `location_categories` table
- [ ] Create `location_issue_reports` table
- [ ] Create `user_location_favorites` table (if needed)
- [ ] Create `user_custom_markers` table

### Phase 2: Backend
- [ ] `AdminMapService.manageLocations()`
- [ ] `AdminMapService.geocode(address)` - External API integration
- [ ] `AdminMapService.manageCategories()`
- [ ] `AdminMapService.handleIssueReport(reportId, action)`

### Phase 3: Frontend
- [ ] "Locations" management page with map preview
- [ ] Geocoding input with auto-fill
- [ ] Issue reports queue
