# Design System (Tailwind CSS v4.0)

> **Core Philosophy**: CSS-first configuration using the `@theme` directive. No `tailwind.config.js` needed.

## Brand Identity - Japan IT Job

| Attribute | Color | OKLCH Hue | Purpose |
|-----------|-------|-----------|---------|
| **Primary** | Professional Blue | 243° | Trust, stability, tech industry |
| **Secondary** | Deep Indigo | 270° | Sophistication, premium feel |
| **Accent** | Vibrant Teal | 175° | Growth, fresh start, opportunities |

---

## 1. File Structure

The design system is split into modular CSS files:

```
app/
├── app.css              # Main entry, @theme tokens, base utilities
├── styles/
│   ├── fonts.css        # @font-face definitions (LINE Seed)
│   ├── typography.css   # Headings, body text, prose
│   └── layout.css       # Containers, grids, stacks
```

### Theme Configuration (`@theme`)
Design tokens are defined in `app.css`:

```css
@import "tailwindcss";
@import "./styles/typography.css";
@import "./styles/layout.css";

@theme {
  --font-display: "Manrope", "Inter", system-ui, sans-serif;
  --color-primary-500: oklch(0.60 0.190 243);
}
```

> **Extension-Only**: Standard utilities (`text-red-500`, `p-4`, `rounded-lg`) remain available.

---

## 2. Color Palette

All colors use OKLCH for perceptually uniform lightness across hues.

### Primary (Blue 243°)
**Usage**: Main CTAs, links, navigation highlights, form focus states

| Token | L | C | Preview |
|-------|---|---|---------|
| `--color-primary-50` | 0.97 | 0.014 | Backgrounds |
| `--color-primary-100` | 0.93 | 0.032 | Hover backgrounds |
| `--color-primary-200` | 0.87 | 0.065 | Borders |
| `--color-primary-300` | 0.79 | 0.107 | Disabled text |
| `--color-primary-400` | 0.70 | 0.155 | Placeholder |
| `--color-primary-500` | 0.60 | 0.190 | **Default** |
| `--color-primary-600` | 0.52 | 0.190 | Hover |
| `--color-primary-700` | 0.45 | 0.170 | Active |
| `--color-primary-800` | 0.38 | 0.140 | Text on light |
| `--color-primary-900` | 0.32 | 0.110 | Headings |
| `--color-primary-950` | 0.24 | 0.080 | Dark backgrounds |

### Secondary (Indigo 270°)
**Usage**: Secondary actions, subtle highlights, section headers

### Accent (Teal 175°)
**Usage**: Success states, progress indicators, positive feedback, badges

### Semantic Colors
| Token | Purpose |
|-------|---------|
| `--color-surface` | Card/modal backgrounds |
| `--color-border` | Default borders |
| `--color-muted` | Secondary text |

---

## 3. Typography

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | Inter, **LINE Seed**, system-ui | Body text, UI elements |
| `--font-display` | Manrope, **LINE Seed**, system-ui | Headings, titles |
| `--font-mono` | ui-monospace, monospace | Code blocks |

**Local Fonts** (defined in `styles/fonts.css`):
- `LINE Seed` - English/Latin
- `LINE Seed KR` - 한국어
- `LINE Seed JP` - 日本語

### Font Sizes (using Tailwind defaults)
`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`

### Font Weights
`font-normal` (400), `font-medium` (500), `font-semibold` (600), `font-bold` (700)

### Usage Example
```tsx
<h1 className="font-display text-3xl font-bold">Welcome</h1>
<p className="font-sans text-base text-gray-600">Body text</p>
<code className="font-mono text-sm">code</code>
```

---

## 4. Spacing & Layout

### Radius Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 0.25rem | Small elements |
| `--radius-md` | 0.375rem | Buttons, inputs |
| `--radius-lg` | 0.5rem | Cards |
| `--radius-xl` | 0.75rem | Modals |
| `--radius-2xl` | 1rem | Large containers |
| `--radius-3xl` | 1.5rem | Hero sections |

### Shadow Tokens
| Token | Usage |
|-------|-------|
| `--shadow-sm` | Subtle elevation |
| `--shadow-md` | Cards, dropdowns |
| `--shadow-lg` | Modals, popovers |
| `--shadow-xl` | Dialogs |

---

## 5. Dark Mode

Uses `prefers-color-scheme` media query with `dark:` variant:

```tsx
<div className="bg-white text-gray-950 dark:bg-gray-950 dark:text-gray-50">
  Automatic dark mode
</div>
```

### Using `@variant` in CSS
```css
.my-element {
  background: white;
  
  @variant dark {
    background: var(--color-gray-950);
  }
}
```

---

## 6. Custom Utilities

### `@utility` Directive
Define custom utilities that work with all variants (hover, dark, responsive):

```css
@utility focus-ring {
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary-500);
  }
}

@utility scrollbar-hidden {
  &::-webkit-scrollbar {
    display: none;
  }
}
```

### Available Custom Utilities
| Class | Description |
|-------|-------------|
| `.focus-ring` | Accessible focus indicator with primary color |
| `.bg-brand-gradient` | Primary → Secondary gradient background |
| `.text-brand-gradient` | Gradient text from Primary → Accent |
| `.scrollbar-hidden` | Hide scrollbars while allowing scroll |

---

## 7. Layer Structure

### `@layer base`
Document-level defaults, element resets:
```css
@layer base {
  html {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
}
```

### `@layer components`
Reusable component classes (can be overridden by utilities):
```css
@layer components {
  .card {
    background-color: var(--color-white);
    border-radius: var(--radius-lg);
    padding: --spacing(6);
    box-shadow: var(--shadow-md);
  }
}
```

### `@layer utilities`
Custom one-off utilities.

---

## 8. Functions

Tailwind CSS v4 provides special functions for use in custom CSS:

### `--spacing()`
Generate spacing values based on your theme:
```css
.my-element {
  margin: --spacing(4);
  padding: --spacing(2) --spacing(4);
}
```

### `--alpha()`
Adjust the opacity of a color:
```css
.my-element {
  background: --alpha(var(--color-primary-500) / 50%);
}
```

---

## 9. Animation

### Easing Functions
| Token | Value | Usage |
|-------|-------|-------|
| `--ease-in` | cubic-bezier(0.4, 0, 1, 1) | Exit animations |
| `--ease-out` | cubic-bezier(0, 0, 0.2, 1) | Enter animations |
| `--ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | Transitions |

### Transition Presets
```tsx
<button className="transition-colors duration-150 ease-out">
  Hover me
</button>
```

---

## 10. Responsive Breakpoints

Mobile-first approach (Tailwind defaults):

| Prefix | Min-width | Typical devices |
|--------|-----------|-----------------|
| (none) | 0px | Mobile portrait |
| `sm:` | 640px | Mobile landscape |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Large desktop |

---

## 11. BiomeJS Integration

`web/biome.json` configuration:
```json
{
  "css": {
    "parser": {
      "tailwindDirectives": true,
      "allowWrongLineComments": true
    }
  }
}
```

- `tailwindDirectives: true` — Parses `@theme`, `@utility`, `@layer`, `@variant`
- `allowWrongLineComments: true` — Allows `//` comments in CSS

---

## References
- [Tailwind CSS v4 Theme](https://tailwindcss.com/docs/theme)
- [Tailwind CSS v4 Adding Custom Styles](https://tailwindcss.com/docs/adding-custom-styles)
- [Tailwind CSS v4 Colors](https://tailwindcss.com/docs/colors)
- [BiomeJS CSS Configuration](https://biomejs.dev/reference/configuration/#css)
