# Admin Feature Specification: SEO Management

**Feature**: `021-seo-optimization`
**Role**: Admin
**Outcome**: Admins can manage metadata, analyze traffic, and optimize discoverability.

## Current Implementation Status

### Main Spec Reference
- **File**: `specs/021-seo-optimization/spec.md`
- **User Scenarios**: 6 stories (Discovery, Social Sharing, Crawl Guidance, Performance, Structured Data, Monitoring)
- **Requirements**: FR-001 to FR-040

### Existing Code
| Path | Status |
|------|--------|
| SEO components | ❌ **Not Implemented** |

### Target Metrics (From Main Spec)
- **Meta Tags**: Title <60 chars, Description <160 chars
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- **PageSpeed**: 90+ for mobile/desktop

## 1. User Scenarios (Admin)

### 1.1 Manage Page Metadata
**As an**: Admin
**I want to**: Edit title tags, meta descriptions for key pages
**So that**: Pages rank better in search engines.

- **Keywords**: "Japan IT jobs", "Tokyo software engineer", "Korean developers in Japan" (FR-003)

### 1.2 Manage Sitemap
**As an**: Admin
**I want to**: Control what pages are included in sitemap.xml
**So that**: I can prioritize important content.

- **Updates**: Daily (FR-012)
- **Max**: 50,000 URLs per file (FR-015)

### 1.3 View SEO Analytics
**As an**: Admin
**I want to**: See search console data and traffic sources
**So that**: I can track organic search performance.

### 1.4 Manage Redirects
**As an**: Admin
**I want to**: Create 301/302 redirects
**So that**: Old URLs still work after restructuring.

### 1.5 Manage robots.txt
**As an**: Admin
**I want to**: Edit robots.txt content
**So that**: I can control crawler behavior.

- **Disallow**: /admin, /dashboard, /settings, /api (FR-019)

### 1.6 Monitor Core Web Vitals
**As an**: Admin
**I want to**: Receive alerts when performance degrades
**So that**: I can fix issues before they impact rankings.

- **Alerting**: LCP >2.5s, FID >100ms, CLS >0.1 (FR-037, FR-038, FR-039)

## 2. Requirements

### 2.1 Dependencies (From Main Spec)
- **FR-001 to FR-005**: Meta tags
- **FR-006 to FR-010**: Open Graph
- **FR-011 to FR-016**: Sitemap
- **FR-017 to FR-020**: robots.txt
- **FR-021 to FR-026**: Performance
- **FR-027 to FR-032**: Structured data
- **FR-033 to FR-040**: Monitoring

### 2.2 Admin-Specific Requirements
- **FR_ADMIN_021.01**: Page metadata editing
- **FR_ADMIN_021.02**: Sitemap configuration
- **FR_ADMIN_021.03**: SEO analytics dashboard
- **FR_ADMIN_021.04**: Redirect management
- **FR_ADMIN_021.05**: robots.txt editing
- **FR_ADMIN_021.06**: Core Web Vitals alerting

## 3. Data Model Reference (Proposed)

| Table | Access Mode | Notes |
|-------|-------------|-------|
| `seo_metadata` | **Read/Write** | Page-level SEO config |
| `redirects` | **Read/Write** | URL redirects |
| `sitemap_config` | **Read/Write** | Sitemap settings |
| `performance_metrics` | **Read** | Core Web Vitals data |
| `performance_alerts` | **Read/Write** | Threshold alerts |
| `admin_audit_logs` | **Write** | Actions |

## 4. Work Definition (Tasks)

### Phase 1: Schema
- [ ] Create `seo_metadata` table (page_id, title, description, og_image)
- [ ] Create `redirects` table (source, target, type, created_at)
- [ ] Create `sitemap_config` table (route, priority, changefreq, enabled)
- [ ] Create `performance_metrics` table (RUM data)
- [ ] Create `performance_alerts` table

### Phase 2: Backend
- [ ] `AdminSEOService.manageMetadata()`
- [ ] `AdminSEOService.manageRedirects()`
- [ ] `AdminSEOService.manageSitemap()`
- [ ] `AdminSEOService.updateRobotsTxt(content)`
- [ ] `AdminAnalyticsService.getCoreWebVitals()`
- [ ] Alert service for performance threshold monitoring
- [ ] Integration with Search Console API (optional)

### Phase 3: Frontend
- [ ] "SEO" management section in Settings
- [ ] Metadata editor with Google preview
- [ ] Redirect rules table
- [ ] Sitemap configuration list
- [ ] robots.txt editor
- [ ] Core Web Vitals dashboard with charts
