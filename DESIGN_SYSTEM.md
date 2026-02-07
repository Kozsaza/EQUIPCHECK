# EquipCheck Design System

## Colors

### Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#1E3A5F` (Navy) | Headers, primary buttons, key actions, nav active state |
| `primary-foreground` | `#FFFFFF` | Text on primary backgrounds |

### Secondary & Neutral

| Token | Hex | Usage |
|-------|-----|-------|
| `secondary` | `#475569` (Slate) | Body text emphasis, secondary buttons, secondary elements |
| `secondary-foreground` | `#FFFFFF` | Text on secondary backgrounds |
| `muted` | `#F1F5F9` | Subtle backgrounds, disabled states, dividers |
| `muted-foreground` | `#94A3B8` (Gray) | Placeholders, disabled text, helper text, borders |

### Accent

| Token | Hex | Usage |
|-------|-----|-------|
| `accent` | `#0D9488` (Teal) | Links, highlights, interactive elements, focus rings |
| `accent-foreground` | `#FFFFFF` | Text on accent backgrounds |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#16A34A` (Green) | Pass status, matches, confirmations, checkmarks |
| `warning` | `#D97706` (Amber) | Review needed, partial matches, caution states |
| `destructive` | `#DC2626` (Red) | Fail status, mismatches, errors, delete actions |

### Surfaces

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#F8FAFC` (Off-white) | Page backgrounds |
| `card` / `surface` | `#FFFFFF` (White) | Cards, modals, inputs, popover backgrounds |
| `border` | `#E2E8F0` | Card borders, input borders, dividers |
| `input` | `#E2E8F0` | Input field borders |
| `ring` | `#0D9488` | Focus ring color (matches accent) |

---

## Typography

### Font Families

| Usage | Font | Fallback |
|-------|------|----------|
| UI / Headings / Body | **Inter** | system-ui, sans-serif |
| Code / Data values | **JetBrains Mono** | monospace |

### Font Sizes & Weights

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Page Title (h1) | 32px (2rem) | Semibold (600) | 1.2 | Main page headings |
| Section Title (h2) | 24px (1.5rem) | Semibold (600) | 1.3 | Section headings, card titles on landing |
| Card Title (h3) | 18px (1.125rem) | Semibold (600) | 1.4 | Card headers, subsections |
| Body | 14-16px | Regular (400) | 1.6 | General content, descriptions |
| Label | 12-14px | Medium (500) | 1.4 | Form labels, small headings, metadata |
| Caption | 12px (0.75rem) | Regular (400) | 1.4 | Helper text, timestamps |
| Code / Data | 13px (0.8125rem) | Regular (400) | 1.5 | Table data, code snippets, filenames |

### CSS Classes

```css
/* Available via Tailwind */
font-sans    /* Inter */
font-mono    /* JetBrains Mono */
```

---

## Components

### Buttons

| Property | Value |
|----------|-------|
| Border radius | 8px (`rounded-lg`) |
| Height (default) | 36px |
| Height (lg) | 40px |
| Height (sm) | 32px |
| Font weight | Medium (500) |
| Font size | 14px |

**Variants:**

| Variant | Style |
|---------|-------|
| `default` | Solid `#1E3A5F` fill, white text. Hover: darken 10% |
| `outline` | `#E2E8F0` border, transparent bg. Hover: `#F1F5F9` bg |
| `secondary` | `#475569` fill, white text. Hover: darken 10% |
| `ghost` | No border/bg. Hover: `#F1F5F9` bg |
| `destructive` | `#DC2626` fill, white text. Hover: darken 10% |
| `link` | Teal text, underline on hover |
| `accent` | `#0D9488` fill, white text. Hover: darken 10% |

### Cards

| Property | Value |
|----------|-------|
| Border radius | 12px (`rounded-xl`) |
| Background | `#FFFFFF` |
| Border | 1px solid `#E2E8F0` |
| Shadow | `shadow-sm` (0 1px 2px rgba(0,0,0,0.05)) |
| Padding | 24px (px-6 py-6) |

### Inputs

| Property | Value |
|----------|-------|
| Border radius | 8px (`rounded-lg`) |
| Border | 1px solid `#E2E8F0` |
| Height | 40px |
| Background | `#FFFFFF` |
| Focus | 2px teal ring (`#0D9488`) |
| Placeholder color | `#94A3B8` |

### Tables

| Property | Value |
|----------|-------|
| Header background | `#F8FAFC` |
| Header text | `#1E3A5F`, medium weight |
| Header position | Sticky top |
| Row borders | 1px solid `#F1F5F9` |
| Alternating rows | Even rows: `#F8FAFC` background |
| Cell padding | 8px 12px |
| Font | Body text for descriptions, `font-mono` for data/codes |

### Badges / Status Chips

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| PASS / Success | `#DCFCE7` | `#166534` | `#BBF7D0` |
| FAIL / Error | `#FEE2E2` | `#991B1B` | `#FECACA` |
| REVIEW / Warning | `#FEF3C7` | `#92400E` | `#FDE68A` |
| Default / Info | `#1E3A5F` | `#FFFFFF` | transparent |
| Secondary | `#F1F5F9` | `#475569` | transparent |

### Alerts

| Variant | Background | Border-left | Text |
|---------|-----------|-------------|------|
| Success | `#F0FDF4` | 4px `#16A34A` | `#166534` |
| Warning | `#FFFBEB` | 4px `#D97706` | `#92400E` |
| Error | `#FEF2F2` | 4px `#DC2626` | `#991B1B` |
| Info | `#EFF6FF` | 4px `#1E3A5F` | `#1E3A5F` |

---

## Spacing

| Scale | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight gaps, icon padding |
| sm | 8px | Between related elements |
| md | 16px | Section padding, card gaps |
| lg | 24px | Between sections |
| xl | 32px | Page-level spacing |
| 2xl | 48px | Major section breaks |

---

## Layout

- **Max content width:** 1152px (max-w-6xl)
- **Page padding:** 16px mobile, 24px desktop
- **Sidebar width:** 256px (w-64)
- **Card grid gaps:** 16-24px
- Generous white space between sections
- Clean, professional feel - no visual clutter

---

## Validation Status Colors

Used consistently across results, history, badges, and PDF:

| Status | Color | Icon |
|--------|-------|------|
| Exact Match | `#16A34A` (success) | CheckCircle |
| Partial Match | `#D97706` (warning) | AlertTriangle |
| Mismatch | `#DC2626` (error) | XCircle |
| Missing | `#DC2626` (error) | MinusCircle |
| Extra | `#475569` (secondary) | PlusCircle |
