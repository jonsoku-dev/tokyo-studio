# House Ads Image Specifications

## 📐 Quick Reference

| Placement | Dimensions | Ratio | Display Max | File Max |
|-----------|------------|-------|-------------|----------|
| Feed      | 1280×720   | 16:9  | 280px       | 500KB    |
| Sidebar   | 500×500    | 1:1   | 500px       | 300KB    |
| Inline    | 800×450    | 16:9  | 160px       | 300KB    |

## 📚 Documentation

- **[Full Specification](./ad-image-specs.md)** - Complete image requirements and guidelines
- **[TypeScript Config](../config/image-specs.ts)** - Type definitions and validation utilities
- **[CSS Variables](../components/core/AdCardCore.css)** - Shared CSS custom properties

## 🔧 Usage

### In Admin Panel

```typescript
import { AD_IMAGE_SPECS, validateAdImageFile } from '@/features/ads/config/image-specs';

// Validate upload
const result = validateAdImageFile('feed-middle', imageFile);
if (!result.valid) {
  showError(result.error);
}

// Show specs to user
const spec = AD_IMAGE_SPECS['feed-middle'];
console.log(`Required: ${spec.width}×${spec.height}px`);
```

### In CSS

```css
/* Use predefined variables */
.my-ad-image {
  max-height: var(--ad-feed-max-height);
  aspect-ratio: var(--ad-feed-aspect-ratio);
}
```

## ⚠️ Important

These specifications are the **single source of truth**. Any changes must be synchronized across:
1. Documentation (ad-image-specs.md)
2. TypeScript (config/image-specs.ts)
3. CSS Variables (AdCardCore.css)

## 🎨 Design Guidelines

- Keep critical content within 90% center frame
- Minimum 16px text in images
- Test at 320px viewport width minimum
- Use `object-fit: cover` for responsive display
