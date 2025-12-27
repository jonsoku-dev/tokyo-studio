# TailwindCSS v4 규칙

## 핵심 원칙: CSS-First Configuration
TailwindCSS v4는 **JavaScript 설정 파일(`tailwind.config.ts`)을 사용하지 않습니다**. 모든 설정은 CSS 파일 내에서 직접 정의합니다.

> ⛔ **금지**: `tailwind.config.ts` 또는 `tailwind.config.js` 파일을 생성하지 마세요.

## 설정 방법 (@theme)
모든 커스터마이징은 CSS 파일에서 `@theme` 블록을 사용합니다:

```css
/* app/styles/global.css */
@import "tailwindcss";

@theme {
  /* 폰트 */
  --font-sans: "Pretendard", sans-serif;
  
  /* 커스텀 색상 */
  --color-primary-50: oklch(0.97 0.02 250);
  --color-primary-500: oklch(0.55 0.15 250);
  --color-primary-900: oklch(0.25 0.10 250);
  
  /* 커스텀 중단점 */
  --breakpoint-3xl: 1920px;
  
  /* 커스텀 이징 */
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## CSS 변수 자동 생성
`@theme`에 정의된 모든 값은 `:root`에 CSS 변수로 자동 추가됩니다:
```css
:root {
  --font-sans: "Pretendard", sans-serif;
  --color-primary-500: oklch(0.55 0.15 250);
  /* ... */
}
```

## Vite 플러그인 설정
TailwindCSS v4는 공식 Vite 플러그인을 사용합니다:
```typescript
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";

export default {
  plugins: [tailwindcss()],
};
```

## 공식 문서 (Must Research)
*   **설치**: https://tailwindcss.com/docs/installation/vite
*   **CSS-first 설정**: https://tailwindcss.com/blog/tailwindcss-v4#css-first-configuration
*   **테마 변수**: https://tailwindcss.com/docs/theme
