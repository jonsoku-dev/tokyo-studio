# Feature Specification: Tokyo Map Integration

**Feature Branch**: `020-map-integration`
**Created**: 2025-12-28
**Status**: Draft
**Input**: User description: "Build an interactive Tokyo map showing key locations for settlement and daily life. The map displays markers for important places including city halls (Shibuya, Shinjuku, Minato, etc.), immigration offices, major banks (SMBC, MUFG, Mizuho), mobile carriers (Docomo, Softbank, au), popular housing areas (Shibuya, Nakameguro, Ebisu, Meguro), and convenience stores for administrative tasks (7-Eleven, Family Mart with multi-copy machines). Each marker shows the location name in English, Japanese, and Korean with address, phone number, business hours, and nearest train station. Users can filter markers by category (Government, Banking, Housing, Mobile, Shopping) and search for specific locations. The map integrates with Google Maps to show walking/transit directions from the user's current location. Users can save favorite locations and add custom markers with notes. The system defaults to showing locations in central Tokyo but allows users to search other areas if they plan to live outside the city center."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Essential Settlement Locations on Interactive Map (Priority: P1)

A Korean professional who just arrived in Tokyo needs to quickly find and navigate to essential locations like the ward office for residence registration, nearby banks to open an account, and immigration office for their residence card.

**Why this priority**: This is the core value proposition. Without an interactive map showing essential locations, users must manually search each location online, which is time-consuming and error-prone. This single feature delivers immediate value for newly arrived professionals.

**Independent Test**: Can be fully tested by loading the map view with pre-populated location markers and verifying markers display correctly with multilingual labels. Delivers standalone value even without filtering or directions.

**Acceptance Scenarios**:

1. **Given** user is on the Tokyo settlement guide page, **When** they click "View Map", **Then** an interactive map centered on central Tokyo (Shibuya/Shinjuku area) is displayed with markers for all essential locations
2. **Given** the map is displayed, **When** user clicks on a city hall marker (e.g., Shibuya Ward Office), **Then** a popup shows location details including name in English/Japanese/Korean, address, phone number, business hours, and nearest train station
3. **Given** user wants to see location details, **When** they hover over any marker, **Then** a tooltip shows the location name and category
4. **Given** the map has loaded, **When** user views the default map state, **Then** markers are clustered by geographic proximity to avoid overwhelming visual clutter
5. **Given** user clicks on a marker cluster, **When** the cluster is activated, **Then** the map zooms in to reveal individual markers within that cluster

---

### User Story 2 - Filter Locations by Category (Priority: P1)

A user needs to focus on specific types of locations based on their immediate priorities, such as finding banks to open an account or identifying convenient housing areas.

**Why this priority**: Without category filtering, users face cognitive overload from seeing 50+ markers simultaneously. This feature is essential for usability and directly supports the core use case of helping users prioritize their settlement tasks.

**Independent Test**: Can be tested independently by implementing category filter checkboxes and verifying markers show/hide based on selected categories. Works without search or directions features.

**Acceptance Scenarios**:

1. **Given** the map is displayed with all markers, **When** user selects the "Banking" category filter, **Then** only bank markers (SMBC, MUFG, Mizuho) are displayed on the map
2. **Given** user has filtered to show only "Government" locations, **When** they additionally select "Immigration", **Then** both government offices and immigration offices are displayed (additive filtering)
3. **Given** multiple filters are active, **When** user clicks "Clear All Filters", **Then** all location markers are displayed again
4. **Given** user is on mobile device, **When** they open the category filter, **Then** a drawer slides up from the bottom showing filter options with touch-friendly checkboxes
5. **Given** filtering is active, **When** user deselects all categories, **Then** map displays all markers again with a hint message "Select categories to filter locations"

---

### User Story 3 - Search for Specific Locations (Priority: P2)

A user knows they need to visit a specific bank branch or ward office and wants to quickly locate it on the map without manually browsing markers.

**Why this priority**: While filtering reduces clutter, users often search for specific known locations. This improves user efficiency but is not absolutely critical for MVP since filtering provides basic discovery.

**Independent Test**: Can be tested by implementing a search input that filters markers by name/address and highlights matching results. Standalone value for power users who know what they're looking for.

**Acceptance Scenarios**:

1. **Given** user is viewing the map, **When** they type "Shibuya" in the search box, **Then** search results show matching locations (Shibuya Ward Office, Shibuya banks, housing areas) with autocomplete suggestions
2. **Given** search results are displayed, **When** user clicks on a search result, **Then** the map centers on that location and opens its information popup
3. **Given** user has typed a search query, **When** they press Enter or click search icon, **Then** map zooms to fit all matching markers in view
4. **Given** user searches in Korean (e.g., "시부야 구청"), **When** the search is executed, **Then** matching locations are found using multilingual search (searches across EN/JP/KR names)
5. **Given** no matches are found, **When** search completes, **Then** user sees "No locations found. Try different keywords or browse by category" message

---

### User Story 4 - Get Directions to Locations (Priority: P2)

A user wants to navigate from their current location to a city hall or bank using public transit or walking directions.

**Why this priority**: Directions are valuable but not critical for MVP. Users can manually copy the address into Google Maps if needed. This priority allows us to ship the core map viewing experience faster and add directions as enhancement.

**Independent Test**: Can be tested by implementing a "Get Directions" button that opens Google Maps with destination pre-filled. Delivers value independently of other features.

**Acceptance Scenarios**:

1. **Given** user has clicked on a location marker, **When** they click "Get Directions" in the popup, **Then** browser requests location permission (if not granted) and opens Google Maps with walking/transit route from user's current location
2. **Given** location permission is denied, **When** user clicks "Get Directions", **Then** Google Maps opens with destination pre-filled but prompts user to enter starting location manually
3. **Given** user is on mobile device, **When** they click "Get Directions", **Then** the native Google Maps app opens (if installed) instead of web browser
4. **Given** user views directions, **When** they select "Transit" mode, **Then** Google Maps shows train/subway routes with nearest station transfers
5. **Given** user is viewing location details, **When** they click the address text, **Then** address is copied to clipboard with confirmation toast

---

### User Story 5 - Save Favorite Locations and Add Custom Markers (Priority: P3)

A user wants to bookmark frequently visited locations (e.g., their apartment, preferred bank branch) and add custom markers for places they discover (e.g., recommended ramen shop, job interview location).

**Why this priority**: Nice-to-have personalization feature that enhances user experience but is not essential for initial settlement tasks. Can be added after core mapping features are validated with users.

**Independent Test**: Can be tested by implementing a favorites system with local storage and verifying users can save/remove favorites and add custom pins with notes.

**Acceptance Scenarios**:

1. **Given** user has clicked on a location marker, **When** they click the "Save to Favorites" star icon, **Then** location is saved to their favorites list and star icon turns gold
2. **Given** user has saved favorites, **When** they navigate to "My Saved Locations" view, **Then** all favorited locations are listed with option to view on map or remove
3. **Given** user wants to add a custom location, **When** they long-press on the map (or right-click on desktop), **Then** a "Add Custom Marker" dialog appears with fields for name, category, and notes
4. **Given** custom marker is created, **When** user saves it, **Then** marker appears on map with a different icon color (purple) to distinguish from pre-populated markers
5. **Given** user has multiple custom markers, **When** they click on a custom marker, **Then** popup shows their notes and option to edit or delete the marker
6. **Given** user's favorites are stored, **When** they clear browser data, **Then** favorites are persisted to their user account (if logged in) or lost (if not logged in) with warning message

---

### User Story 6 - Browse Locations Outside Central Tokyo (Priority: P3)

A user planning to live in areas like Chiba, Yokohama, or Saitama wants to view settlement locations relevant to their chosen residential area.

**Why this priority**: Most users settle in central Tokyo (23 wards), so this is lower priority. Can be added later to support edge cases without blocking core functionality for majority users.

**Independent Test**: Can be tested by implementing area search/selection that loads different marker sets based on selected prefecture or city.

**Acceptance Scenarios**:

1. **Given** user is viewing the Tokyo map, **When** they click "Change Area" and select "Yokohama", **Then** map re-centers to Yokohama and displays relevant ward offices, banks, and immigration offices for that area
2. **Given** user has changed area to outside Tokyo, **When** they view the map, **Then** location markers reflect the selected area's specific offices (e.g., Yokohama Ward Offices instead of Tokyo Ward Offices)
3. **Given** user searches for a location, **When** the location is outside the current map area, **Then** system prompts "Location found in [Area Name]. Switch to this area?" with confirmation button
4. **Given** user has selected a non-Tokyo area, **When** they view location details, **Then** train station information shows relevant local lines (e.g., Yokohama Municipal Subway instead of Tokyo Metro)

---

### Edge Cases

- **What happens when Google Maps API fails to load?** Display fallback static map with markers using OpenStreetMap or Mapbox, with degraded functionality (no directions, basic pan/zoom only) and error message explaining limited features.
- **What happens when user denies location permission?** Directions feature shows message "Enable location permission for navigation" with manual address input as fallback. All other features work normally.
- **What happens when marker data is outdated (e.g., bank branch closed)?** Display "Last updated: [date]" on each marker popup and provide "Report Issue" button that opens feedback form. Admin dashboard allows updating location data.
- **What happens when user is on slow network?** Show skeleton loading state for map container, load markers progressively as data arrives, implement retry logic for failed API calls, and display offline notice if network unavailable.
- **What happens when user has saved 50+ favorites?** Implement pagination or infinite scroll in favorites list, categorize favorites by type, and warn user at 40 favorites "Consider organizing with custom categories".
- **What happens when multiple locations share the same address?** Stack markers vertically with slight offset, show count badge on marker (e.g., "3"), and clicking marker opens list view of all locations at that address.
- **What happens when user's browser blocks third-party cookies (Google Maps API)?** Detect cookie blocking, show warning with instructions to enable cookies for maps.google.com, and provide fallback static map option.
- **What happens when user language preference is not EN/JP/KR?** Default to English labels, detect browser language, and show message "Currently supporting English, Japanese, and Korean. More languages coming soon."

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display an interactive map centered on central Tokyo (Shibuya/Shinjuku area, coordinates approximately 35.6762°N, 139.6503°E) as the default view
- **FR-002**: System MUST render markers for the following location categories with distinct icon colors/shapes:
  - Government (city halls, ward offices) - Blue building icon
  - Immigration (immigration offices) - Red passport icon
  - Banking (SMBC, MUFG, Mizuho, Japan Post Bank) - Green bank icon
  - Mobile (Docomo, Softbank, au) - Purple phone icon
  - Housing (popular residential areas) - Orange house icon
  - Shopping (convenience stores with multi-copy machines) - Yellow shopping cart icon
- **FR-003**: System MUST display multilingual information for each location in English, Japanese (日本語), and Korean (한국어) including:
  - Location name
  - Full address
  - Phone number (if available)
  - Business hours (if applicable)
  - Nearest train station with line information
- **FR-004**: Users MUST be able to filter visible markers by selecting one or more categories with real-time map updates
- **FR-005**: Users MUST be able to search locations by name, address, or category in any supported language (EN/JP/KR) with autocomplete suggestions
- **FR-006**: System MUST provide "Get Directions" functionality that integrates with Google Maps to show walking/transit routes from user's current location
- **FR-007**: Users MUST be able to save locations to a personal favorites list (requires authentication)
- **FR-008**: Users MUST be able to create custom markers with name, category, and notes (requires authentication)
- **FR-009**: System MUST cluster markers when zoomed out to prevent visual clutter (e.g., show "5" badge when 5 markers are within close proximity)
- **FR-010**: System MUST persist user favorites and custom markers to their account across devices
- **FR-011**: System MUST support area switching to display locations for regions outside Tokyo (Yokohama, Chiba, Saitama) with appropriate marker sets
- **FR-012**: System MUST display location markers with "Last updated: [date]" timestamp and "Report Issue" button for data accuracy
- **FR-013**: System MUST handle Google Maps API failures gracefully with fallback to alternative mapping provider or static map
- **FR-014**: System MUST be mobile-responsive with touch-friendly controls (pinch to zoom, pan gestures, bottom drawer for filters)

### Key Entities *(include if feature involves data)*

- **MapLocation**: Represents a physical location on the map
  - Attributes: id, category (enum: Government, Immigration, Banking, Mobile, Housing, Shopping), names (EN/JP/KR), address (structured: prefecture, city, street), coordinates (latitude/longitude), phone, businessHours (structured: dayOfWeek, openTime, closeTime), nearestStation (name, lines), lastUpdated, isVerified
  - Relationships: Can be favorited by multiple Users, can have multiple IssueReports

- **LocationCategory**: Categorizes locations for filtering
  - Attributes: id, name (EN/JP/KR), iconType, iconColor, displayOrder
  - Relationships: Has many MapLocations

- **UserFavorite**: Junction table linking users to favorited locations
  - Attributes: id, userId, locationId, notes (optional personal notes), createdAt
  - Relationships: Belongs to User, belongs to MapLocation

- **CustomMarker**: User-created custom locations
  - Attributes: id, userId, name, category, coordinates, notes, color, icon, createdAt
  - Relationships: Belongs to User

- **LocationIssueReport**: User-reported data inaccuracies
  - Attributes: id, locationId, userId, issueType (enum: Closed, WrongHours, WrongAddress, Other), description, status (Pending, Resolved, Dismissed), createdAt
  - Relationships: Belongs to MapLocation, belongs to User

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can locate and view details for any essential settlement location (city hall, bank, immigration office) within 30 seconds of opening the map
- **SC-002**: Map loads and displays initial markers within 2 seconds on 4G connection, within 5 seconds on 3G connection
- **SC-003**: 80% of users successfully filter locations by category on first attempt without tutorial or help documentation
- **SC-004**: 90% of "Get Directions" clicks successfully open Google Maps with correct destination pre-filled
- **SC-005**: Map supports simultaneous viewing of 100+ location markers without performance degradation (60 FPS pan/zoom on modern mobile devices)
- **SC-006**: Marker clustering reduces visible markers by at least 70% when zoomed out to Tokyo-wide view, improving visual clarity
- **SC-007**: Search autocomplete returns relevant suggestions within 300ms of user keystroke for queries with 3+ characters
- **SC-008**: 95% of location data is accurate and up-to-date (verified through user issue reports and periodic audits)
- **SC-009**: Mobile users can complete core tasks (view map, filter, get directions) using touch gestures without needing to zoom excessively or struggle with small tap targets
- **SC-010**: Users who save favorites report 50% reduction in time spent re-locating frequently visited places (measured via user survey)
- **SC-011**: Custom markers feature has 20%+ adoption rate among authenticated users within first month of launch
- **SC-012**: System maintains 99.5% uptime with graceful degradation (fallback map) when Google Maps API is unavailable
