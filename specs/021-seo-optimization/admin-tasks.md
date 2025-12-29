# Admin Tasks: SEO Optimization

## Schema
- [ ] Create `seo_metadata` table (page_id, title, description, og_image).
- [ ] Create `redirects` table (source, target, type, created_at).
- [ ] Create `sitemap_config` table (route, priority, changefreq, enabled).

## Backend Implementation
- [ ] **CRUD**: `adminManageMetadata()`.
- [ ] **CRUD**: `adminManageRedirects()`.
- [ ] **CRUD**: `adminManageSitemap()`.
- [ ] **Mutation**: `adminUpdateRobotsTxt(content)`.
- [ ] **Integration**: Connect to Search Console API (optional).

## Frontend Implementation
- [ ] **Page**: `features/settings/routes/seo.tsx`.
- [ ] **Component**: Metadata editor with Google preview.
- [ ] **Component**: Redirect rules table.
- [ ] **Component**: Sitemap configuration list.
- [ ] **Component**: robots.txt editor.

## QA Verification
- [ ] **Test**: Edit page metadata, verify in page source.
- [ ] **Test**: Create redirect, verify 301 response.
- [ ] **Test**: Update robots.txt, verify at /robots.txt.
