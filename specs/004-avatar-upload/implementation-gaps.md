# SPEC 004: Avatar Upload & Profile Picture Management - Implementation Gaps

## 문서 정보
- **작성일**: 2025-12-28
- **상태**: 보완 필요
- **우선순위**: High

---

## 1. 누락된 핵심 기능 (Critical)

### 1.1 Image Cropping Interface (FR-005, FR-006)
**상태**: ❌ 미구현 - **BLOCKING UX**

**요구사항**:
- 원형 프레임으로 이미지 크롭
- 이미지 위치 조정 (드래그)
- 확대/축소 (줌 슬라이더)

**현재 상태**:
- 자동 리사이징만 가능
- 사용자가 이미지 영역 선택 불가

**구현 필요 사항**:

```typescript
// 1. Install Dependencies
// package.json
{
  "dependencies": {
    "react-easy-crop": "^5.0.0"
  }
}

// 2. Image Crop Component
// app/components/AvatarCropper.tsx
import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';

interface AvatarCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export function AvatarCropper({ imageSrc, onCropComplete, onCancel }: AvatarCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteHandler = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    const croppedBlob = await getCroppedImage(imageSrc, croppedAreaPixels);
    onCropComplete(croppedBlob);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">Adjust Your Photo</h2>

        {/* Crop Area */}
        <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Square crop for circular avatar
            cropShape="round" // Circular crop overlay
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
          />
        </div>

        {/* Zoom Slider */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zoom
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. Crop Image Utility
// app/utils/crop-image.ts
export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Set canvas size to cropped area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/jpeg', 0.95);
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}

// 4. Update Avatar Upload Component
// app/features/profile/components/AvatarUpload.tsx
export function AvatarUpload() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPG, PNG, and WebP files are supported');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Show preview for cropping
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    // Upload cropped image
    const formData = new FormData();
    formData.append('avatar', croppedBlob, 'avatar.jpg');

    await fetch('/api/profile/avatar', {
      method: 'POST',
      body: formData,
    });

    setShowCropper(false);
    // Refresh page or update UI
  };

  return (
    <>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        id="avatar-upload"
      />
      <label
        htmlFor="avatar-upload"
        className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded"
      >
        Upload Photo
      </label>

      {showCropper && selectedFile && (
        <AvatarCropper
          imageSrc={selectedFile}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </>
  );
}
```

**우선순위**: **HIGH** - UX 필수
**예상 작업량**: 1.5일

---

### 1.2 Multiple Image Sizes (FR-007)
**상태**: ❌ 미구현 - **PERFORMANCE ISSUE**

**요구사항**:
- 800x800px: 프로필 페이지
- 200x200px: 목록 및 썸네일

**현재 상태**:
- 800x800px만 생성
- 목록에서 과도한 대역폭 사용

**구현 필요 사항**:

```typescript
// app/services/image/resize-service.server.ts
import sharp from 'sharp';

export interface ResizeOptions {
  width: number;
  height: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export async function resizeImage(
  buffer: Buffer,
  options: ResizeOptions
): Promise<Buffer> {
  return sharp(buffer)
    .resize(options.width, options.height, {
      fit: 'cover',
      position: 'center',
    })
    .toFormat(options.format || 'jpeg', {
      quality: options.quality || 90,
    })
    .toBuffer();
}

export async function generateAvatarSizes(
  originalBuffer: Buffer
): Promise<{
  large: Buffer;
  thumbnail: Buffer;
}> {
  const [large, thumbnail] = await Promise.all([
    resizeImage(originalBuffer, {
      width: 800,
      height: 800,
      quality: 90,
      format: 'jpeg',
    }),
    resizeImage(originalBuffer, {
      width: 200,
      height: 200,
      quality: 85,
      format: 'jpeg',
    }),
  ]);

  return { large, thumbnail };
}

// Update Avatar Upload API
// app/routes/api.profile.avatar.tsx
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const avatar = formData.get('avatar') as File;

  // ... validation

  const buffer = Buffer.from(await avatar.arrayBuffer());

  // Generate both sizes
  const { large, thumbnail } = await generateAvatarSizes(buffer);

  // Save both files
  const filename = `${user.id}-${Date.now()}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');

  await fs.promises.mkdir(uploadDir, { recursive: true });

  await Promise.all([
    fs.promises.writeFile(
      path.join(uploadDir, `${filename}-800.jpg`),
      large
    ),
    fs.promises.writeFile(
      path.join(uploadDir, `${filename}-200.jpg`),
      thumbnail
    ),
  ]);

  // Update user record
  await db.update(users)
    .set({
      avatarUrl: `/uploads/avatars/${filename}-800.jpg`,
      avatarThumbnailUrl: `/uploads/avatars/${filename}-200.jpg`,
    })
    .where(eq(users.id, user.id));

  return json({ success: true });
}

// Update Schema
// app/shared/db/schema.ts
export const users = sqliteTable('users', {
  // ... existing fields
  avatarUrl: text('avatar_url'),
  avatarThumbnailUrl: text('avatar_thumbnail_url'), // 추가
});

// Usage in UI
// Use thumbnail for lists
<img src={user.avatarThumbnailUrl || user.avatarUrl} alt="Avatar" />

// Use full size for profile pages
<img src={user.avatarUrl} alt="Avatar" />
```

**우선순위**: **HIGH** - 성능 필수
**예상 작업량**: 0.5일

---

## 2. 이미지 품질 및 보안

### 2.1 EXIF Metadata Stripping (FR-014)
**상태**: ⚠️ 미확인

**요구사항**:
- GPS 위치 정보 제거
- 카메라 정보 제거
- 개인정보 보호

**구현 검증 및 개선**:

```typescript
// Sharp automatically strips EXIF by default, but let's be explicit
export async function stripMetadata(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate() // Auto-rotate based on EXIF orientation
    .withMetadata({
      orientation: undefined, // Remove orientation
      exif: {}, // Remove all EXIF data
    })
    .toBuffer();
}

// Update resize function
export async function resizeImage(
  buffer: Buffer,
  options: ResizeOptions
): Promise<Buffer> {
  // First strip metadata
  const cleanBuffer = await stripMetadata(buffer);

  // Then resize
  return sharp(cleanBuffer)
    .resize(options.width, options.height, {
      fit: 'cover',
      position: 'center',
    })
    .toFormat(options.format || 'jpeg', {
      quality: options.quality || 90,
    })
    .toBuffer();
}
```

**우선순위**: Medium (보안)
**예상 작업량**: 0.25일

---

### 2.2 EXIF Orientation Normalization (FR-018)
**상태**: ⚠️ 미확인

**요구사항**:
- EXIF orientation 태그 기반 자동 회전
- 모든 브라우저에서 올바른 방향 표시

**구현**:

```typescript
// Sharp's .rotate() automatically handles EXIF orientation
export async function normalizeOrientation(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate() // Auto-rotate based on EXIF orientation
    .toBuffer();
}

// Include in resize pipeline
export async function resizeImage(
  buffer: Buffer,
  options: ResizeOptions
): Promise<Buffer> {
  return sharp(buffer)
    .rotate() // Add this line
    .resize(options.width, options.height, {
      fit: 'cover',
      position: 'center',
    })
    .toFormat(options.format || 'jpeg', {
      quality: options.quality || 90,
    })
    .toBuffer();
}
```

**우선순위**: Medium
**예상 작업량**: 이미 구현 가능 (검증 필요)

---

### 2.3 Quality Preservation (FR-009)
**상태**: ❌ 미구현

**요구사항**:
- SSIM (Structural Similarity Index) > 0.95
- 품질 저하 감지

**구현 필요 사항**:

```typescript
// Install dependency
// npm install ssim.js

// app/utils/image-quality.ts
import { ssim } from 'ssim.js';

export async function validateImageQuality(
  originalBuffer: Buffer,
  resizedBuffer: Buffer
): Promise<{ ssim: number; acceptable: boolean }> {
  const originalImage = await sharp(originalBuffer)
    .resize(800, 800)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const resizedImage = await sharp(resizedBuffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const ssimValue = ssim(originalImage.data, resizedImage.data);

  return {
    ssim: ssimValue,
    acceptable: ssimValue >= 0.95,
  };
}

// Usage in upload
const resized = await resizeImage(buffer, { width: 800, height: 800 });
const quality = await validateImageQuality(buffer, resized);

if (!quality.acceptable) {
  // Increase quality and retry
  const resizedHighQuality = await resizeImage(buffer, {
    width: 800,
    height: 800,
    quality: 95,
  });
}
```

**우선순위**: Low (nice to have)
**예상 작업량**: 0.5일

---

## 3. 기본 아바타 개선

### 3.1 Color Differentiation for Default Avatars (FR-011)
**상태**: ❌ 미구현

**요구사항**:
- 사용자 ID 기반 색상 생성
- 일관된 색상 (동일 사용자는 항상 같은 색상)

**구현 필요 사항**:

```typescript
// app/utils/avatar-color.ts
const AVATAR_COLORS = [
  { bg: '#EF4444', text: '#FFFFFF' }, // Red
  { bg: '#F59E0B', text: '#FFFFFF' }, // Amber
  { bg: '#10B981', text: '#FFFFFF' }, // Green
  { bg: '#3B82F6', text: '#FFFFFF' }, // Blue
  { bg: '#8B5CF6', text: '#FFFFFF' }, // Purple
  { bg: '#EC4899', text: '#FFFFFF' }, // Pink
  { bg: '#14B8A6', text: '#FFFFFF' }, // Teal
  { bg: '#F97316', text: '#FFFFFF' }, // Orange
];

export function getAvatarColorForUser(userId: string): { bg: string; text: string } {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

// Usage in DefaultAvatar component
// app/components/DefaultAvatar.tsx
export function DefaultAvatar({ user }: { user: { id: string; displayName: string } }) {
  const initials = user.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = getAvatarColorForUser(user.id);

  return (
    <div
      className="flex items-center justify-center rounded-full w-10 h-10"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      <span className="font-semibold">{initials}</span>
    </div>
  );
}
```

**우선순위**: Medium
**예상 작업량**: 0.25일

---

### 3.2 Multi-Character Set Support (FR-025)
**상태**: ⚠️ 미확인

**요구사항**:
- 한글, 일본어, 중국어 이니셜 지원

**구현 필요 사항**:

```typescript
// app/utils/initials.ts
export function getInitials(name: string): string {
  if (!name) return '?';

  // Split by whitespace
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    // Single word: take first 2 characters
    return parts[0].slice(0, 2).toUpperCase();
  }

  // Multiple words: take first character of each word (up to 2)
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

// Test cases:
// 'John Doe' -> 'JD'
// 'Alice' -> 'AL'
// '김철수' -> '김철'
// '田中 太郎' -> '田太'
// '张三' -> '张三'
```

**우선순위**: Medium
**예상 작업량**: 0.25일

---

## 4. 사용자 경험 개선

### 4.1 Upload Progress Indicator (FR-021)
**상태**: ❌ 미구현

**요구사항**:
- 업로드 진행률 표시
- 2초 이상 걸리는 업로드에 표시

**구현 필요 사항**:

```typescript
// app/components/AvatarUpload.tsx
export function AvatarUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (croppedBlob: Blob) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('avatar', croppedBlob, 'avatar.jpg');

    try {
      const xhr = new XMLHttpRequest();

      // Upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      await new Promise((resolve, reject) => {
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = () => reject(new Error('Upload failed'));

        xhr.open('POST', '/api/profile/avatar');
        xhr.send(formData);
      });

      // Success
      window.location.reload();
    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <>
      {/* Upload button */}
      <button disabled={uploading}>Upload Photo</button>

      {/* Progress overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <p className="text-lg font-medium mb-4">Uploading...</p>
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              {Math.round(progress)}%
            </p>
          </div>
        </div>
      )}
    </>
  );
}
```

**우선순위**: Medium
**예상 작업량**: 0.5일

---

### 4.2 Upload Rate Limiting (FR-023)
**상태**: ❌ 미구현

**요구사항**:
- 시간당 최대 5회 업로드
- 남용 방지

**구현 필요 사항**:

```typescript
// app/services/rate-limit/avatar-upload-limiter.server.ts
import { db } from '~/shared/db';
import { avatarUploadAttempts } from '~/shared/db/schema';
import { and, eq, gte } from 'drizzle-orm';

const MAX_UPLOADS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function checkAvatarUploadRateLimit(userId: string): Promise<{
  allowed: boolean;
  remainingUploads: number;
  resetAt: Date | null;
}> {
  const windowStart = new Date(Date.now() - WINDOW_MS);

  const attempts = await db.query.avatarUploadAttempts.findMany({
    where: and(
      eq(avatarUploadAttempts.userId, userId),
      gte(avatarUploadAttempts.uploadedAt, windowStart)
    ),
  });

  const uploadCount = attempts.length;
  const allowed = uploadCount < MAX_UPLOADS;
  const remainingUploads = Math.max(0, MAX_UPLOADS - uploadCount);

  let resetAt: Date | null = null;
  if (!allowed && attempts[0]) {
    resetAt = new Date(attempts[0].uploadedAt.getTime() + WINDOW_MS);
  }

  return { allowed, remainingUploads, resetAt };
}

export async function recordAvatarUpload(userId: string) {
  await db.insert(avatarUploadAttempts).values({
    id: crypto.randomUUID(),
    userId,
    uploadedAt: new Date(),
  });
}

// Schema
export const avatarUploadAttempts = sqliteTable('avatar_upload_attempts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).notNull(),
});
```

**우선순위**: Low
**예상 작업량**: 0.5일

---

### 4.3 Audit Logging (FR-016)
**상태**: ❌ 미구현

**요구사항**:
- 아바타 업로드/삭제 로그
- 감사 추적

**구현 필요 사항**:

```typescript
// app/shared/db/schema.ts
export const avatarLogs = sqliteTable('avatar_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action', { enum: ['uploaded', 'deleted'] }).notNull(),
  previousUrl: text('previous_url'),
  newUrl: text('new_url'),
  fileSize: integer('file_size'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

// Usage
await db.insert(avatarLogs).values({
  id: crypto.randomUUID(),
  userId: user.id,
  action: 'uploaded',
  previousUrl: user.avatarUrl,
  newUrl: newAvatarUrl,
  fileSize: buffer.length,
  timestamp: new Date(),
});
```

**우선순위**: Low
**예상 작업량**: 0.25일

---

## 5. 구현 우선순위 요약

### Critical (즉시 구현)
1. ✅ **Image Cropping Interface (1.1)** - UX BLOCKING
2. ✅ **Multiple Image Sizes (1.2)** - PERFORMANCE CRITICAL

### High Priority
1. EXIF Metadata Stripping Verification (2.1)
2. Color Differentiation for Default Avatars (3.1)
3. Multi-Character Set Support (3.2)

### Medium Priority
1. Upload Progress Indicator (4.1)
2. EXIF Orientation Normalization (2.2)

### Low Priority
1. Quality Preservation (2.3)
2. Upload Rate Limiting (4.2)
3. Audit Logging (4.3)

---

## 6. 테스트 계획

```typescript
describe('Avatar Upload', () => {
  it('should generate both 800x800 and 200x200 versions', async () => {
    const response = await uploadAvatar(testImage);
    expect(response.avatarUrl).toContain('-800.jpg');
    expect(response.avatarThumbnailUrl).toContain('-200.jpg');
  });

  it('should strip EXIF metadata', async () => {
    const imageWithExif = await loadImageWithGPS();
    const response = await uploadAvatar(imageWithExif);

    const uploadedBuffer = await fs.readFile(response.avatarUrl);
    const metadata = await sharp(uploadedBuffer).metadata();

    expect(metadata.exif).toBeUndefined();
  });

  it('should normalize EXIF orientation', async () => {
    const rotatedImage = await loadRotatedImage();
    const response = await uploadAvatar(rotatedImage);

    const uploadedBuffer = await fs.readFile(response.avatarUrl);
    const metadata = await sharp(uploadedBuffer).metadata();

    expect(metadata.orientation).toBeUndefined();
  });

  it('should enforce rate limit', async () => {
    // Upload 5 times
    for (let i = 0; i < 5; i++) {
      await uploadAvatar(testImage);
    }

    // 6th upload should fail
    await expect(uploadAvatar(testImage)).rejects.toThrow('rate limit');
  });
});
```

---

## 7. 참고 문서

- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [React Easy Crop](https://github.com/ValentinH/react-easy-crop)
- [EXIF Orientation](https://magnushoff.com/articles/jpeg-orientation/)
