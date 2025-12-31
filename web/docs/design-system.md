# Design System (Tailwind CSS v4.0)

> **Core Philosophy**: Extend Tailwind defaults using CSS-first `@theme` directive. No `tailwind.config.js`.

## Brand Identity - Japan IT Job

| Attribute | Value | Purpose |
|-----------|-------|---------|
| **Primary** | Professional Blue (243° hue) | Trust, stability, tech industry |
| **Secondary** | Deep Indigo (270° hue) | Sophistication, premium feel |
| **Accent** | Vibrant Teal (175° hue) | Growth, fresh start, opportunities |

---

## 1. Theme Configuration

All tokens are defined in `web/app/app.css` inside `@theme {}`.

```css
@import "tailwindcss";

@theme {
  --color-primary-500: oklch(0.60 0.190 243);
  --color-secondary-500: oklch(0.55 0.175 270);
  --color-accent-500: oklch(0.55 0.180 175);
}
```

> **Extension-Only**: Standard utilities (`text-red-500`, `p-4`) remain available.

---

## 2. Color Palette

### Primary (Blue) - `bg-primary-*`, `text-primary-*`
Main CTAs, links, navigation highlights, form focus states.

### Secondary (Indigo) - `bg-secondary-*`, `text-secondary-*`
Secondary actions, subtle highlights, section headers.

### Accent (Teal) - `bg-accent-*`, `text-accent-*`
Success states, progress indicators, positive feedback, badges.

### Usage
```tsx
<button className="bg-primary-500 hover:bg-primary-600 text-white">
  Apply Now
</button>
<span className="bg-accent-100 text-accent-700 px-2 rounded">
  New
</span>
```

---

## 3. Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | Inter, system-ui | Body text |
| `--font-display` | Red Hat Display | Headings, marketing |

```tsx
<h1 className="font-display text-3xl">Welcome</h1>
<p className="font-sans text-base">Body text</p>
```

---

## 4. Dark Mode

Uses `prefers-color-scheme` media query + Tailwind's `dark:` variant.

```tsx
<div className="bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50">
  Automatic dark mode
</div>
```

---

## 5. Custom Utilities

Defined in `@layer utilities`:

| Class | Description |
|-------|-------------|
| `.focus-ring` | Accessible focus indicator |
| `.bg-brand-gradient` | Primary → Secondary gradient |
| `.text-brand-gradient` | Gradient text effect |

---

## 6. Responsive Breakpoints

Mobile-first approach (default Tailwind):

| Prefix | Min-width |
|--------|-----------|
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |

---

## 7. BiomeJS Integration

`web/biome.json` includes:
- `css.parser.tailwindDirectives: true` — Parses `@theme`, `@layer`
- `nursery.useSortedClasses: "warn"` — Auto-sorts Tailwind classes

---

## References
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [BiomeJS Configuration](https://biomejs.dev/reference/configuration/)
