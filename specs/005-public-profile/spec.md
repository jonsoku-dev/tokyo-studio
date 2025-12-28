# Feature Specification: Public Profile System

**Feature Branch**: `005-public-profile`
**Created**: 2025-12-28
**Status**: Draft
**Input**: User description: "Build a public profile system where users can showcase their career journey and platform activity. Each user gets a unique profile URL (e.g., /profile/username) that displays their avatar, bio, job family, experience level, language skills, and location. Public profiles show badges earned from completing tasks, number of mentor sessions attended, community posts written, and helpful comments. Users control privacy settings to hide specific information like email, full name, or activity history. Mentors have enhanced profiles showing their company, years of experience, hourly rate, average rating, total sessions completed, and recent reviews. Profile pages are SEO-optimized with Open Graph tags for sharing on social media."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Public Profile Access (Priority: P1)

As a platform visitor, I want to view a user's public profile through a unique URL so I can learn about their background and platform activity before engaging with them.

**Why this priority**: This is the foundational feature that enables all profile-based interactions. Without public profile access, the entire feature has no value. This delivers immediate visibility and credibility to platform members.

**Independent Test**: Can be fully tested by navigating to /profile/[username] and verifying all public information (avatar, bio, job family, experience level, language skills, location) is displayed correctly. Delivers value by providing professional identity showcase.

**Acceptance Scenarios**:

1. **Given** a registered user with username "johndoe" exists, **When** I navigate to /profile/johndoe, **Then** I see their profile page with avatar, bio, job family, experience level, language skills, and location
2. **Given** a user has not set optional profile fields, **When** I view their profile, **Then** only available information is displayed with no broken placeholders
3. **Given** an invalid username in the URL, **When** I navigate to /profile/invaliduser, **Then** I see a friendly 404 error message
4. **Given** I am viewing a profile, **When** the page loads, **Then** all content is visible within 2 seconds

---

### User Story 2 - Activity Showcase (Priority: P1)

As a platform member, I want my public profile to automatically display my platform achievements and activity so potential mentors/mentees can see my engagement level and credibility.

**Why this priority**: Activity metrics are critical social proof that differentiates active contributors from inactive accounts. This is essential for building trust and encouraging connections.

**Independent Test**: Can be tested by completing various platform activities (earning badges, attending sessions, writing posts, making comments) and verifying they appear on the profile page. Delivers value through automated credibility building.

**Acceptance Scenarios**:

1. **Given** I have earned 3 badges, **When** someone views my profile, **Then** all 3 badges are displayed with their names and icons
2. **Given** I have attended 15 mentor sessions, **When** my profile is viewed, **Then** the count "15 Mentor Sessions Attended" is displayed
3. **Given** I have written 8 community posts and made 42 helpful comments, **When** my profile loads, **Then** these counts are shown as "8 Posts • 42 Helpful Comments"
4. **Given** I have no activity yet, **When** my profile is viewed, **Then** all counters show "0" or appropriate empty state messages

---

### User Story 3 - Privacy Control (Priority: P1)

As a user, I want granular control over what information appears on my public profile so I can maintain my privacy while still showcasing my professional presence.

**Why this priority**: Privacy is a non-negotiable requirement for user trust and legal compliance (GDPR, etc.). Without privacy controls, users may refuse to use profiles or provide inaccurate information.

**Independent Test**: Can be tested by toggling various privacy settings (hide email, hide full name, hide activity history) and verifying the changes reflect immediately on the public profile view. Delivers value through user autonomy and trust.

**Acceptance Scenarios**:

1. **Given** I enable "Hide Email" in privacy settings, **When** someone views my profile, **Then** my email address is not visible anywhere
2. **Given** I enable "Hide Full Name", **When** my profile is viewed, **Then** only my username is displayed
3. **Given** I enable "Hide Activity History", **When** someone views my profile, **Then** badges, session counts, posts, and comments are all hidden
4. **Given** I change privacy settings, **When** I save them, **Then** the changes are reflected on my public profile within 1 second
5. **Given** I am viewing my own profile while logged in, **When** privacy settings are enabled, **Then** I see a visual indicator showing which fields are hidden from others

---

### User Story 4 - Enhanced Mentor Profiles (Priority: P2)

As a mentor, I want my profile to display professional credentials including company, experience, rates, ratings, and reviews so potential mentees can make informed decisions about booking sessions with me.

**Why this priority**: This differentiates mentor profiles and provides essential decision-making information for mentees. While important, the basic profile system can function without this enhancement.

**Independent Test**: Can be tested by registering as a mentor, filling out mentor-specific fields, and verifying they display on the profile. Delivers value through professional credibility and transparency.

**Acceptance Scenarios**:

1. **Given** I am a registered mentor, **When** someone views my profile, **Then** they see my company name, years of experience, and hourly rate
2. **Given** I have completed 25 sessions with an average 4.8 rating, **When** my profile loads, **Then** it displays "25 Sessions Completed • 4.8★ Average Rating"
3. **Given** I have received 10 reviews, **When** someone views my profile, **Then** the 3 most recent reviews are displayed with reviewer names, ratings, and text
4. **Given** I have not completed any sessions yet, **When** my profile is viewed, **Then** it shows "New Mentor" badge and "No sessions yet" message
5. **Given** a mentor has disabled review visibility, **When** their profile is viewed, **Then** only the average rating and session count are shown without individual reviews

---

### User Story 5 - Social Media Sharing Optimization (Priority: P3)

As a user, I want my profile to look professional when shared on social media platforms so I can promote my professional presence and attract connections outside the platform.

**Why this priority**: While valuable for growth and marketing, this is an enhancement that doesn't affect core functionality. Users can still share profiles; they just won't have optimized previews.

**Independent Test**: Can be tested by sharing a profile URL on Twitter, LinkedIn, Facebook, and Slack, then verifying the preview card shows correct image, title, and description. Delivers value through professional brand extension.

**Acceptance Scenarios**:

1. **Given** I share my profile URL on LinkedIn, **When** the preview generates, **Then** it shows my avatar as the image, my full name as the title, and my bio as the description
2. **Given** a mentor shares their profile on Twitter, **When** the preview card appears, **Then** it includes their mentor badge, rating, and tagline
3. **Given** a profile is shared on Facebook, **When** the Open Graph tags are parsed, **Then** the preview image is at least 1200x630px and properly formatted
4. **Given** someone shares a profile URL in Slack, **When** the unfurl happens, **Then** key profile information (name, role, activity summary) is displayed

---

### User Story 6 - Profile URL Customization (Priority: P3)

As a user, I want to customize my profile URL slug (e.g., /profile/john-doe-engineer) so I can have a memorable, professional URL that's easier to share verbally.

**Why this priority**: Nice-to-have enhancement that improves user experience but isn't critical. The username-based URL (/profile/username) is sufficient for core functionality.

**Independent Test**: Can be tested by changing profile URL slug in settings and verifying the new URL works while the old one redirects. Delivers value through personalization and memorability.

**Acceptance Scenarios**:

1. **Given** I want a custom URL, **When** I enter "john-doe-engineer" as my slug, **Then** my profile becomes accessible at /profile/john-doe-engineer
2. **Given** I change my URL slug, **When** someone visits my old URL, **Then** they are automatically redirected to the new URL with a 301 redirect
3. **Given** I try to use a slug already taken by another user, **When** I submit the form, **Then** I see an error "This URL is already in use"
4. **Given** I enter invalid characters in the slug, **When** I submit, **Then** I see validation errors for allowed characters (alphanumeric and hyphens only)

---

### Edge Cases

- What happens when a user deletes their account but their profile URL is bookmarked or indexed by search engines? (Should show "Profile no longer available" page with proper 410 Gone status)
- How does the system handle usernames with special characters or non-Latin scripts (e.g., Chinese, Arabic, emoji)? (Need URL encoding and validation rules)
- What happens when a user has privacy settings that hide ALL information? (Profile should still load but show minimal "This user prefers to keep their profile private" message)
- How are profile updates reflected when someone is actively viewing the profile? (Need cache invalidation strategy - accept eventual consistency with reasonable TTL)
- What happens when a mentor's rating changes while someone is viewing old reviews? (Display cached data with timestamp, accept eventual consistency)
- How does the system handle extremely long bios or usernames that break layout? (Implement character limits: bio 500 chars, username 50 chars, truncate with "read more" if needed)
- What happens when a user has earned hundreds of badges? (Display top 10 with "View all badges" link, prevent performance degradation)
- How are orphaned profile URLs handled when a user changes their username? (Implement slug history table and permanent redirects)
- What happens when Open Graph image generation fails? (Fallback to platform default OG image)
- How does the system handle concurrent privacy setting changes? (Last-write-wins with timestamp, show conflict warning if detected)

## Requirements *(mandatory)*

### Functional Requirements

#### Profile Access & Display
- **FR-001**: System MUST provide a unique public URL for each user in the format /profile/[username] or /profile/[custom-slug]
- **FR-002**: System MUST display user avatar, bio, job family, experience level, language skills, and location on public profiles (subject to privacy settings)
- **FR-003**: System MUST render profile pages within 2 seconds on standard broadband connection (target: 1 second on average)
- **FR-004**: System MUST display a friendly 404 error page when accessing non-existent profile URLs

#### Activity & Achievements
- **FR-005**: System MUST automatically display badges earned by the user on their public profile
- **FR-006**: System MUST show counts for mentor sessions attended, community posts written, and helpful comments made
- **FR-007**: System MUST update activity counters in near real-time (acceptable delay: up to 5 minutes)
- **FR-008**: System MUST handle users with zero activity gracefully (show "0" or "Getting started" messaging, not errors)

#### Privacy Controls
- **FR-009**: Users MUST be able to hide their email address from public view
- **FR-010**: Users MUST be able to hide their full name, showing only username
- **FR-011**: Users MUST be able to hide their entire activity history (badges, sessions, posts, comments)
- **FR-012**: System MUST apply privacy setting changes to public profiles immediately (within 1 second)
- **FR-013**: Users MUST be able to see which fields are hidden when viewing their own profile while logged in
- **FR-014**: System MUST provide default privacy settings for new users [NEEDS CLARIFICATION: What should the defaults be? All public, all private, or selective?]

#### Enhanced Mentor Profiles
- **FR-015**: Mentor profiles MUST display company name, years of experience, hourly rate, average rating, and total sessions completed
- **FR-016**: Mentor profiles MUST show the 3 most recent reviews with reviewer name, rating, and review text
- **FR-017**: Mentors MUST be able to hide individual reviews while keeping average rating visible
- **FR-018**: System MUST calculate and update mentor ratings within 1 hour of receiving new review
- **FR-019**: System MUST display "New Mentor" badge for mentors with fewer than 5 completed sessions

#### SEO & Social Sharing
- **FR-020**: System MUST generate Open Graph meta tags for all public profile pages
- **FR-021**: Open Graph tags MUST include profile image (avatar), user name, bio, and platform name
- **FR-022**: System MUST generate Twitter Card meta tags compatible with Twitter's summary_large_image format
- **FR-023**: Open Graph images MUST be at least 1200x630px for optimal social media display
- **FR-024**: Profile pages MUST include canonical URLs to prevent duplicate content SEO issues

#### URL Customization
- **FR-025**: Users MUST be able to customize their profile URL slug (optional enhancement)
- **FR-026**: System MUST validate URL slugs to contain only alphanumeric characters and hyphens
- **FR-027**: System MUST enforce unique URL slugs across all users
- **FR-028**: System MUST implement 301 permanent redirects when users change their URL slug
- **FR-029**: System MUST maintain slug history to prevent URL recycling for at least 6 months [NEEDS CLARIFICATION: Confirm retention period]

### Key Entities *(include if feature involves data)*

- **UserProfile**: Represents the public-facing profile of a user, including bio, avatar URL, job family, experience level, language skills, location, and privacy preferences. Links to User entity. Tracks creation and last updated timestamps.

- **MentorProfile**: Extension of UserProfile for users with mentor role, including company name, years of experience, hourly rate, average rating, total sessions completed, and review visibility preference. One-to-one relationship with UserProfile.

- **ProfilePrivacySettings**: Stores user privacy preferences with boolean flags for hiding email, full name, and activity history. One-to-one relationship with UserProfile. Includes timestamp for audit trail.

- **Badge**: Represents achievements earned by users, including badge name, description, icon URL, and earning criteria. Many-to-many relationship with UserProfile through UserBadge junction table.

- **UserBadge**: Junction entity linking UserProfile to Badge, storing the date earned and any badge-specific metadata.

- **Review**: Represents mentor reviews written by mentees, including rating (1-5 stars), review text, reviewer UserProfile reference, reviewed MentorProfile reference, session reference, and timestamps. Includes visibility flag for mentor privacy control.

- **ProfileSlug**: Stores current and historical URL slugs for profiles, including slug value, associated UserProfile, created timestamp, and active status. Enables URL change history and permanent redirects.

- **ActivityCounter**: Aggregated counts of user activities (sessions attended, posts written, helpful comments), updated periodically. One-to-one relationship with UserProfile. Includes last_updated timestamp for cache validation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view any public profile by navigating to /profile/[username] with page load completing in under 2 seconds (target: 1 second average)
- **SC-002**: 90% of users successfully find and understand privacy controls on first attempt (measured through user testing or analytics)
- **SC-003**: Profile pages shared on social media platforms (LinkedIn, Twitter, Facebook, Slack) display correct Open Graph preview cards 95% of the time
- **SC-004**: Mentor profiles display accurate rating calculations within 1 hour of receiving new reviews 100% of the time
- **SC-005**: Privacy setting changes reflect on public profiles within 1 second for 99% of updates
- **SC-006**: System handles at least 1000 concurrent profile page views without performance degradation (sub-2-second load times maintained)
- **SC-007**: Profile URLs remain accessible via old slugs after users change custom URLs, with 301 redirects working 100% of the time
- **SC-008**: Zero data leaks of hidden fields - privacy settings must be honored 100% of the time with no exceptions (critical security requirement)
- **SC-009**: Profile pages achieve Lighthouse SEO score of 90+ for better search engine discoverability
- **SC-010**: User engagement metrics show that profiles with complete information (all fields filled) receive 3x more profile views than incomplete profiles (measured after 3 months)
