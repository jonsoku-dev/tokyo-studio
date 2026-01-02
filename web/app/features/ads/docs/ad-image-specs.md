# House Ads Image Specifications

> **Single Source of Truth for Ad Image Dimensions**  
> This document defines all accepted image specifications for house advertisements.  
> Admin panel should enforce these specifications when uploading ad images.

---

## Image Specifications by Placement

### 1. Feed Placement (`feed-top`, `feed-middle`, `feed-bottom`)

**Recommended Size:** `1280 × 720px` (16:9 ratio)

- **Aspect Ratio:** 16:9 (Horizontal)
- **Min Width:** 1280px
- **Min Height:** 720px
- **Max File Size:** 500KB
- **Format:** PNG, JPG, WebP
- **Display Height:** Max 280px (CSS controlled)

**Usage:**
- Main feed advertisements
- High visibility placements
- Desktop and mobile responsive

**CSS Variables:**
```css
--ad-feed-aspect-ratio: 16 / 9;
--ad-feed-max-height: 280px;
--ad-feed-recommended-width: 1280px;
--ad-feed-recommended-height: 720px;
```

---

### 2. Sidebar Placement (`sidebar`)

**Recommended Size:** `500 × 500px` (1:1 ratio)

- **Aspect Ratio:** 1:1 (Square)
- **Min Width:** 500px
- **Min Height:** 500px
- **Max File Size:** 300KB
- **Format:** PNG, JPG, WebP
- **Display Height:** Max 500px (CSS controlled)

**Usage:**
- Sidebar advertisements
- Secondary placements
- Visible on desktop primarily

**CSS Variables:**
```css
--ad-sidebar-aspect-ratio: 1 / 1;
--ad-sidebar-max-height: 500px;
--ad-sidebar-recommended-width: 500px;
--ad-sidebar-recommended-height: 500px;
```

---

### 3. Inline Placement (`inline`)

**Recommended Size:** `800 × 450px` (16:9 ratio)

- **Aspect Ratio:** 16:9 (Horizontal)
- **Min Width:** 800px
- **Min Height:** 450px
- **Max File Size:** 300KB
- **Format:** PNG, JPG, WebP
- **Display Height:** Max 160px (CSS controlled)

**Usage:**
- Inline content advertisements
- Between paragraphs or sections
- Smaller footprint than feed ads

**CSS Variables:**
```css
--ad-inline-aspect-ratio: 16 / 9;
--ad-inline-max-height: 160px;
--ad-inline-recommended-width: 800px;
--ad-inline-recommended-height: 450px;
```

---

### 4. Square Placement (Optional)

**Recommended Size:** `600 × 600px` (1:1 ratio)

- **Aspect Ratio:** 1:1 (Square)
- **Min Width:** 600px
- **Min Height:** 600px
- **Max File Size:** 300KB
- **Format:** PNG, JPG, WebP

**Usage:**
- Special promotions
- Mobile-optimized squares
- Social media compatible

**CSS Variables:**
```css
--ad-square-aspect-ratio: 1 / 1;
--ad-square-recommended-size: 600px;
```

---

## Quick Reference Table

| Placement | Dimensions | Aspect Ratio | Max Display Height | Max File Size |
|-----------|------------|--------------|-------------------|---------------|
| **Feed**  | 1280×720   | 16:9         | 280px             | 500KB         |
| **Sidebar** | 500×500  | 1:1          | 500px             | 300KB         |
| **Inline** | 800×450   | 16:9         | 160px             | 300KB         |
| **Square** | 600×600   | 1:1          | Auto              | 300KB         |

---

## Admin Panel Integration

### Upload Validation

The admin panel **MUST** validate images against these specifications:

```typescript
// Example validation rules
const AD_IMAGE_SPECS = {
  'feed-top': { width: 1280, height: 720, maxSize: 500 * 1024 },
  'feed-middle': { width: 1280, height: 720, maxSize: 500 * 1024 },
  'feed-bottom': { width: 1280, height: 720, maxSize: 500 * 1024 },
  'sidebar': { width: 500, height: 500, maxSize: 300 * 1024 },
  'inline': { width: 800, height: 450, maxSize: 300 * 1024 },
} as const;

function validateAdImage(
  placement: string, 
  file: File
): { valid: boolean; error?: string } {
  const spec = AD_IMAGE_SPECS[placement];
  if (!spec) return { valid: false, error: 'Invalid placement' };
  
  // Validate file size
  if (file.size > spec.maxSize) {
    return { 
      valid: false, 
      error: `File too large. Max ${spec.maxSize / 1024}KB` 
    };
  }
  
  // Validate dimensions (requires image load)
  // Implementation details in admin panel
  
  return { valid: true };
}
```

### Image Upload UI

Provide clear guidance in the upload form:

```
┌─────────────────────────────────────┐
│ Upload Ad Image                     │
├─────────────────────────────────────┤
│ Placement: [Feed Middle ▼]          │
│                                     │
│ Required: 1280×720px (16:9)         │
│ Max Size: 500KB                     │
│ Formats: PNG, JPG, WebP             │
│                                     │
│ ┌─────────────────────────────┐    │
│ │  Drop image here or click   │    │
│ │  to browse                   │    │
│ └─────────────────────────────┘    │
│                                     │
│ [Preview]                           │
│ ┌─────────────────────────────┐    │
│ │     Image Preview           │    │
│ │     (280px max height)       │    │
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## Design Guidelines

### Image Composition

1. **Safe Area:** Keep important content within 90% of the frame center
2. **Text Readability:** Minimum 16px font size in images
3. **CTA Placement:** Call-to-action buttons should be in bottom-right quadrant
4. **Branding:** Logo placement in top-left or bottom-right

### Responsive Considerations

- Images will be displayed at various viewport sizes
- Use `object-fit: cover` for consistent framing
- Critical content should be centered
- Test on mobile (320px width minimum)

### Accessibility

- Provide descriptive `alt` text for all ad images
- Ensure minimum 4.5:1 contrast ratio for text on images
- Don't rely solely on color to convey information

---

## File Naming Convention

```
{placement}-{advertiser}-{variation}.{ext}

Examples:
- feed-mentor-v1.png
- sidebar-mercari-hiring.jpg
- inline-settlement-guide.webp
```

---

## Storage Structure

```
/public/images/ads/
├── feed/
│   ├── mentor.png         (1280×720)
│   ├── settlement.png     (1280×720)
│   └── community.png      (1280×720)
├── sidebar/
│   ├── mentor.png         (500×500)
│   ├── japanese.png       (500×500)
│   └── mercari.png        (500×500)
├── inline/
│   └── [future use]
└── square/
    └── [original uploads]
```

---

## Version History

- **v1.1** (2026-01-02): Updated sidebar specification
  - Changed sidebar from 4:5 (400×500) to 1:1 (500×500)
- **v1.0** (2026-01-02): Initial specification
  - Defined feed (16:9), sidebar (4:5), inline (16:9)
  - Established file size limits
  - Created admin validation guidelines
