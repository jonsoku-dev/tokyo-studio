# Admin Feature Specification: Search Insights

**Feature**: `010-search`
**Role**: Admin
**Outcome**: Admins gain insights into user intent, identify content gaps, and manage search infrastructure.

## 1. User Scenarios

### 1.1 View Trending Keywords
**As an**: Admin
**I want to**: See a list of top search queries from `search_analytics` in the last 7/30 days
**So that**: I can create content that matches user interest.

- **Acceptance Criteria**:
    - Aggregation: `GROUP BY query, ORDER BY COUNT(*) DESC`.
    - Time range selector: 7d, 30d, 90d.
    - Display: Rank, Query, Search Count, Avg Result Count.

### 1.2 Analyze Zero-Result Searches
**As an**: Admin
**I want to**: See queries that returned zero results
**So that**: I can identify content gaps and create missing resources.

- **Acceptance Criteria**:
    - Filter: `resultCount = 0`.
    - Aggregation: Group by query, count occurrences.
    - Actionable: Link to "Create Content" workflow (future).

### 1.3 View Search by Category
**As an**: Admin
**I want to**: See which categories are most searched
**So that**: I can understand user focus areas.

- **Acceptance Criteria**:
    - Pie chart or bar chart: Category distribution.
    - Data from `search_analytics.category`.

### 1.4 Trigger Search Index Rebuild
**As an**: Admin
**I want to**: Manually trigger a rebuild of the full-text search vectors
**So that**: I can fix missing search results after schema or content changes.

- **Acceptance Criteria**:
    - "Rebuild Index" button.
    - Executes: `UPDATE community_posts SET search_vector = to_tsvector('english', title || ' ' || content)`.
    - Progress indicator (if async).
    - Log action in `admin_audit_logs`.

### 1.5 View Individual Search Sessions
**As an**: Admin
**I want to**: Drill down into specific search queries to see what results were returned
**So that**: I can debug why certain content isn't appearing.

- **Acceptance Criteria**:
    - Click on a query in the trending list.
    - View: `resultIds` (from `search_analytics`), mapped to actual post titles.

## 2. Requirements

### 2.1 Functional Requirements
- **FR_ADMIN_010.01**: Aggregation query on `search_analytics` grouping by `query` and ordering by count.
- **FR_ADMIN_010.02**: Filter for zero-result queries.
- **FR_ADMIN_010.03**: Category breakdown visualization.
- **FR_ADMIN_010.04**: Manual index rebuild capability.
- **FR_ADMIN_010.05**: Drill-down into individual search sessions.

### 2.2 Non-Functional Requirements
- **NFR_ADMIN_010.01**: Index rebuild should run in background (non-blocking).
- **NFR_ADMIN_010.02**: Analytics queries MUST use appropriate indexes for performance.

## 3. Data Model Reference

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `search_analytics` | **Read** | Source of truth for all search data. |
| `community_posts` | **Write** | Update `search_vector` on rebuild. |
| `admin_audit_logs` | **Write** | Log rebuild actions. |

## 4. Work Definition (Tasks)

- [ ] **Backend**: `AdminAnalyticsService.getSearchTrends(days)`.
- [ ] **Backend**: `AdminAnalyticsService.getZeroResultQueries(days)`.
- [ ] **Backend**: `AdminAnalyticsService.getCategoryDistribution(days)`.
- [ ] **Backend**: `AdminAnalyticsService.getSearchDetails(query)`.
- [ ] **Backend**: `AdminSearchService.rebuildIndex()` (async job).
- [ ] **Frontend**: "Search Analytics" dashboard page.
- [ ] **Frontend**: Trending widget with time selector.
- [ ] **Frontend**: Zero-results widget.
- [ ] **Frontend**: Category pie chart.
- [ ] **Frontend**: "Rebuild Index" button with confirmation.
