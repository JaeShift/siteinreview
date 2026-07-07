# Kitsune Brewing Co. — Design System

## Overview

The design language mirrors the live Squarespace site at **kitsunebrewingco.com**.
The aesthetic is **minimal, editorial, and industrial** — flat geometry, zero border-radius, compressed uppercase type, high contrast black/white with a single red accent.

---

## Fonts

Loaded via Adobe Fonts kit `nkn8ouk` in `app/layout.tsx`.

| Role | Family | Weight | Usage |
|------|--------|--------|-------|
| Heading | `futura-pt` | 700 / 800 | Nav, buttons, labels, banners, section titles |
| Body | `proxima-nova` | 400 | Body copy, paragraphs, inputs, menu text |

### CSS Variables
```css
--font-heading: "futura-pt", sans-serif;
--font-body:    "proxima-nova", sans-serif;
```

### Type Scale

| Token | Size | Weight | Transform | Letter-spacing | Usage |
|-------|------|--------|-----------|----------------|-------|
| `h1` | 35px | 700 | — | -0.01em | Page titles |
| `h2` | 35px | 600 | — | -0.01em | Section headings |
| `h3` | 14px | 700 | uppercase | 0.15em | Sub-headings, card labels |
| `p` | 16px | 400 | — | 0.01em | Body copy (line-height 1.8em) |
| `.form-label` | 10px | 700 | uppercase | 0.1em | Input labels |
| `.btn` | 12px | 700 | uppercase | 0.24em | All buttons |
| Section labels | 11px | 700 | uppercase | 0.15–0.2em | "01 / THE EXPERIENCE" style callouts |

---

## Color Palette

Defined in `styles/globals.css` `:root`.

| Variable | Value | Usage |
|----------|-------|-------|
| `--color-accent` | `#ff0000` | Primary accent — buttons hover, links, focus rings, badges |
| `--color-black` | `#000000` | Primary buttons, headings, nav background, page banners |
| `--color-white` | `#ffffff` | Page background, card backgrounds, button text on dark |
| `--color-text` | `#525252` | Default body copy |
| `--color-text-light` | `#707070` | Secondary labels, meta text |
| `--color-muted` | `#999999` | Placeholders, disabled states, captions |
| `--color-border` | `#e0e0e0` | Input borders, table dividers, card edges |
| `--color-gray-light` | `#f6f6f6` | Table header backgrounds, subtle fills |
| `--color-visited` | `#008000` | Visited link color (matches live site) |

> **Note:** `--color-accent`, `--color-orange`, and `--color-green` are all mapped to red (`#ff0000`) and green (`#008000`) to match the Squarespace `custom.css` link rules.

---

## Buttons

Defined globally in `styles/globals.css`. All use `futura-pt`, uppercase, 0.24em letter-spacing.

### `.btn-primary`
- Default: black background, white text
- Hover: red (`--color-accent`) background, white text

### `.btn-outline`
- Default: transparent background, black border + text
- Hover: black background, white text

```css
/* Example usage */
<button className="btn btn-primary">Register Now</button>
<button className="btn btn-outline">Cancel</button>
```

---

## Layout

| Token | Value |
|-------|-------|
| `--max-width` | `1500px` |
| `--nav-height` | `96px` |
| `--radius` | `0px` — no rounded corners anywhere |
| `--space` | `8px` base unit |
| Container padding | `24px` left/right |
| Section padding | `64px` top/bottom |

### Grid System
- No CSS grid framework — CSS Grid and Flexbox used directly in module CSS
- Standard content max-width: `1200px` centered inside the `1500px` container
- Admin dashboard uses a fixed sidebar + scrollable content layout

---

## Forms

Inputs use `proxima-nova` body font, 14px, zero border-radius.

```css
.form-input  → 1px solid #d1d1d1 border, red focus ring
.form-label  → 10px futura-pt uppercase, 0.1em letter-spacing
```

- Focus state: `border-color: var(--color-accent)` (red)
- Error state: typically `border-color: var(--color-accent)` with an error message below

---

## Page Banners (Inner Pages)

Black full-width banner with white uppercase heading.

```css
.page-banner           → background #000, padding 80px 24px
.page-banner h1        → futura-pt, clamp(2rem, 5vw, 4rem), uppercase, 0.08em letter-spacing
```

---

## Admin Dashboard

The admin UI (`/admin/**`) uses its own layout shell with a top navigation bar.

- **Font sizes** are smaller than the public site (9–14px labels, 13px table rows)
- **Status badges** use small futura-pt uppercase pills with background color tints
- **Table rows** use a 7-column CSS grid with `border-bottom: 1px solid var(--color-border)`
- **Flash messages** slide in from the right with a colored left border
- **Modals** are full-overlay with a white card, sticky header and footer, scrollable body
- **No border-radius** anywhere in the admin either — consistent with the public site

---

## Design Principles

1. **Zero border-radius** — all elements are sharp rectangles
2. **Uppercase everything** — headings, buttons, labels, nav links, badges all use `text-transform: uppercase`
3. **One accent color** — red (`#ff0000`) is used sparingly for focus, hover, and calls-to-action only
4. **High contrast** — black on white or white on black; no grey-on-grey combinations
5. **Minimal decoration** — no shadows, gradients, or rounded cards; borders and whitespace do the work
6. **Futura for structure, Proxima for reading** — headings command attention; body text is comfortable

---

## File Structure

```
styles/
  globals.css          ← Design tokens + global reset + base component classes

app/
  layout.tsx           ← Adobe Fonts kit loaded here
  **/*.module.css      ← Page-scoped styles using CSS Modules

components/
  **/*.module.css      ← Component-scoped styles
```

All colors, fonts, and spacing should be pulled from the CSS variables defined in `styles/globals.css`. Avoid hardcoding hex values outside of that file.
