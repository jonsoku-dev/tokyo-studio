# Admin Tasks: Search Analytics

## Backend Implementation
- [ ] **Query**: `adminGetSearchTrends(days)`
    - `SELECT query, count(*) as c FROM search_analytics WHERE created_at > NOW() - Xd GROUP BY query ORDER BY c DESC LIMIT 20`.
- [ ] **Query**: `adminGetZeroResultQueries(days)`
    - Filter: `resultCount = 0`.
    - Group and count.
- [ ] **Query**: `adminGetCategoryDistribution(days)`
    - Group by `category`, count.
- [ ] **Query**: `adminGetSearchDetails(query)`
    - Return all rows matching query.
    - Map `resultIds` to post titles.
- [ ] **Mutation**: `adminRebuildSearchIndex()`
    - Execute: `UPDATE community_posts SET search_vector = to_tsvector(...)`.
    - Run as async background job.
    - Log in `admin_audit_logs`.

## Frontend Implementation
- [ ] **Page**: `features/analytics/routes/search.tsx`.
- [ ] **Component**: `TrendingSearchesList` with time selector.
- [ ] **Component**: `ZeroResultsWidget`.
- [ ] **Component**: `CategoryPieChart`.
- [ ] **Component**: Search detail modal (drill-down).
- [ ] **Action**: "Rebuild Index" button with confirmation and progress.

## QA Verification
- [ ] **Test Case**: Perform searches on web. Check admin dashboard for updates.
- [ ] **Test Case**: Search for non-existent term. Verify it appears in zero-results.
- [ ] **Test Case**: Trigger index rebuild. Verify new content becomes searchable.
