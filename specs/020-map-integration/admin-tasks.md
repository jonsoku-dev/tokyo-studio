# Admin Tasks: Map Integration

## Schema
- [ ] Create `map_locations` table.
- [ ] Create `location_categories` table.

## Backend Implementation
- [ ] **CRUD**: `adminManageLocations()`.
- [ ] **Service**: `adminGeocode(address)` using external API.
- [ ] **CRUD**: `adminManageLocationCategories()`.

## Frontend Implementation
- [ ] **Page**: `features/map/routes/admin.tsx`.
- [ ] **Component**: Location form with map picker.
- [ ] **Component**: Category manager.

## QA Verification
- [ ] **Test**: Add location, verify appears on public map.
- [ ] **Test**: Geocode an address, verify coordinates correct.
