# SPEC 013: Video Links - Implementation Details

**Last Updated**: 2025-12-29
**Status**: Ready for Implementation

---

## 🔧 Technical Implementation Plan

### 1. Video Provider Architecture

```typescript
// Types
enum VideoProvider {
  JITSI = "jitsi",
  GOOGLE = "google",
  ZOOM = "zoom",
  MANUAL = "manual",
}

interface VideoProviderConfig {
  type: VideoProvider;
  manualUrl?: string; // For manual provider
}

interface MeetingLink {
  provider: VideoProvider;
  url: string;
  expiresAt?: Date;
}
```

### 2. Jitsi Configuration

**Default Jitsi Setup**:
- **Base URL**: `https://meet.jit.si`
- **Room Name Format**: `itcom-session-{sessionId}` (lowercase, alphanumeric + hyphen)
- **Example**: `https://meet.jit.si/itcom-session-abc123def456`

**Features Enabled** (via URL params):
```
- requireDisplayName=true
- startAudioMuted=false
- startVideoMuted=false
- prejoinPageEnabled=true
```

### 3. Database Schema Updates

```sql
-- mentor_profiles table additions
ALTER TABLE mentor_profiles ADD COLUMN preferredVideoProvider VARCHAR DEFAULT 'jitsi';
ALTER TABLE mentor_profiles ADD COLUMN manualMeetingUrl TEXT;

-- mentoring_sessions table (already has meetingUrl)
-- Verify: meetingUrl column exists
```

### 4. API Endpoints

**GET /api/mentoring/session/:sessionId/join**
- Validates user is session participant
- Validates session is confirmed and not cancelled
- Returns redirect URL (not exposed to frontend)
- Logs attendance event

**POST /api/mentoring/session/:sessionId/generate-link** (Internal)
- Called during session booking
- Generates appropriate link based on mentor's provider preference
- Stores in database
- Returns link URL

### 5. Security Implementation

**Join Proxy Pattern**:
```
User clicks "Join" button
  ↓
GET /api/mentoring/session/:id/join?token=xxx
  ↓
Server validates:
  - User authentication ✅
  - Session exists and is confirmed ✅
  - User is mentor or mentee ✅
  - Session time not passed ❌ → Show "Session ended"
  - Session not cancelled ✅
  ↓
Redirect to actual meeting URL
```

**Token Generation** (Optional enhancement):
- JWT with `sessionId`, `userId`, `exp` (5 min)
- Used to prevent direct URL sharing

### 6. Integration Points

**Mentor Profile Settings**:
- Add UI to select video provider
- If MANUAL: show input for personal meeting URL
- Show preview of generated Jitsi URL

**Session Booking**:
1. When mentor is selected, fetch their `preferredVideoProvider`
2. Generate meeting link based on provider
3. Store `meetingUrl` in database
4. Include link in confirmation email

**Session Reminders** (Existing):
- Include meeting link in reminder emails
- Use secure `/join` proxy link, not raw URL

### 7. Error Handling

```typescript
// Meeting link generation failures
- Jitsi: Always succeeds (deterministic URL)
- Google: Mock token generation (current MVP)
- Zoom: Mock token generation (current MVP)
- Manual: Validate URL format, handle missing URL

// Join endpoint failures
- User not authenticated → 401 Unauthorized
- Session not found → 404 Not Found
- User not participant → 403 Forbidden
- Session cancelled → 410 Gone
- Session time passed → 410 Gone
```

---

## 📋 Implementation Checklist

- [ ] Add `videoProvider` and `manualMeetingUrl` to mentor_profiles table
- [ ] Create `/api/mentoring/session/:id/generate-link` endpoint
- [ ] Create `/api/mentoring/session/:id/join` proxy endpoint
- [ ] Update booking flow to generate meeting link
- [ ] Add mentor preference UI in settings
- [ ] Update confirmation email template with `/join` link
- [ ] Add validation tests for provider selection
- [ ] Update session cancellation logic to revoke access

---

## 🧪 Test Scenarios

1. **Jitsi Default Flow**:
   - Mentor has no provider preference
   - Session booking auto-generates Jitsi URL
   - User clicks "Join" → redirects to Jitsi

2. **Manual Provider Flow**:
   - Mentor sets provider to "Manual" with personal Zoom URL
   - Session uses mentor's custom URL
   - User clicks "Join" → redirects to custom URL

3. **Google/Zoom (Mocked)**:
   - Mock token generation
   - System treats same as Jitsi for MVP

4. **Security**:
   - Unauthenticated user tries to join → 401
   - Wrong mentor tries to join as mentee → 403
   - User joins after session ends → 410
