# Kitsune Brewing Co. — Design System

> Reference this file when building new pages, components, or prompting another AI agent.
> Source of truth: `styles/globals.css` and component-level `*.module.css` files.

---

## Brand Vibe

Clean, modern, slightly upscale-casual — like a well-designed taproom menu board. Geometric and sharp, not rustic or distressed. The typography does most of the heavy lifting. No gradients, no shadows (except one subtle dropdown), no rounded corners anywhere.

---

## Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#ffffff` | Page background |
| `--color-white` | `#ffffff` | White text on dark backgrounds |
| `--color-black` | `#000000` | Page banners, primary buttons, nav bars |
| `--color-text` | `#525252` | Default body/heading text |
| `--color-text-light` | `#707070` | Secondary text, nav hover |
| `--color-muted` | `#999999` | Placeholders, meta text |
| `--color-border` | `#e0e0e0` | Dividers, input borders |
| `--color-gray-light` | `#f6f6f6` | Subtle section backgrounds |
| `--color-gray-mid` | `#888888` | De-emphasized labels |
| `--color-accent` | `#ff0000` | **Primary accent — red.** Links, button hovers, focus rings, active nav |
| `--color-visited` | `#008000` | Visited links — green |
| `--color-orange` | `#ff0000` | Alias for `--color-accent` (legacy name) |
| `--color-green` | `#008000` | Alias for `--color-visited` (used for underline decorations) |

### Named Raw Values (not in tokens)
- `#333333` — nav link text
- `#fafafa` — address bar background, dropdown hover background, mobile sub-menu
- `#e8e8e8` — nav border, dropdown border
- `rgba(255,255,255,0.75)` — footer body text on dark background
- `rgba(255,255,255,0.5)` — footer section headings
- `rgba(255,255,255,0.4)` — footer copyright / muted

---

## Typography

### Font Families
- **`futura-pt`** — Headings, nav, buttons, labels, footer headings, form labels
- **`proxima-nova`** — Body text, paragraphs, inputs, footer body, address bar

Both loaded via Adobe Fonts kit `nkn8ouk` in `<head>` (not self-hosted).

### Type Scale

| Element | Font | Size | Weight | Transform | Letter-spacing | Line-height |
|---|---|---|---|---|---|---|
| `h1` | futura-pt | 35px | 700 | — | -0.01em | 1em |
| `h2` | futura-pt | 35px | 600 | — | -0.01em | 1em |
| `h3` | futura-pt | 14px | 700 | uppercase | 0.15em | 2em |
| `h4–h6` | futura-pt | — | 700 | — | 0.02em | 1.2em |
| `p` | proxima-nova | 16px | 400 | — | 0.01em | 1.8em |
| `body` | proxima-nova | 14px | 400 | — | 0em | 1.6em |
| `.btn` | futura-pt | 12px | 700 | uppercase | 0.24em | — |
| `.form-label` | futura-pt | 10px | 700 | uppercase | 0.1em | 1.5em |
| Nav links | proxima-nova | 14px | 400 | uppercase | 0.08em | — |
| Footer headings | futura-pt | 10px | 700 | uppercase | 0.18em | 1.8em |
| Footer tagline / nav | futura-pt / proxima-nova | 10px | 600–700 | uppercase | 0.18em | 1.8em |
| Page banner `h1` | futura-pt | clamp(2rem, 5vw, 4rem) | 700 | uppercase | 0.08em | 1em |

---

## Spacing & Layout

| Token | Value |
|---|---|
| `--radius` | `0px` — no rounded corners anywhere |
| `--space` | `8px` base unit |
| `--nav-height` | `96px` |
| `--max-width` | `1500px` |
| `.container` padding | `24px` horizontal |
| `.section` padding | `64px` top and bottom |

---

## Buttons

All buttons use `futura-pt`, `12px`, `700`, all-caps, letter-spacing `0.24em`, `2px solid border`, `0px` border-radius.

```css
/* Filled — black → red on hover */
.btn-primary {
  background: #000000;
  color: #ffffff;
  border: 2px solid #000000;
}
.btn-primary:hover {
  background: #ff0000;
  border-color: #ff0000;
}

/* Outline — transparent with black border → fills black on hover */
.btn-outline {
  background: transparent;
  color: #000000;
  border: 2px solid #000000;
}
.btn-outline:hover {
  background: #000000;
  color: #ffffff;
}
```

Transition: `background-color 0.17s ease-in-out, color 0.17s ease-in-out, border-color 0.17s ease-in-out`

---

## Form Elements

- **Inputs:** proxima-nova, 14px, weight 400, `border: 1px solid #d1d1d1`, `border-radius: 0`, padding `10px 14px`
- **Focus state:** `border-color: #ff0000` (accent red)
- **Labels:** futura-pt, 10px, weight 700, all-caps, letter-spacing 0.1em

---

## Components

### Header
- White background (`#ffffff`), static position
- Logo left, nav links right
- Nav links: proxima-nova, 14px, all-caps, letter-spacing 0.08em, color `#333333` → hover `#707070`
- Dropdown: white card, `border: 1px solid #e8e8e8`, `box-shadow: 0 8px 24px rgba(0,0,0,0.08)`, link hover → red `#ff0000`
- Hamburger menu on mobile (breakpoint: 900px), mobile links have `border-bottom: 1px solid #f0f0f0`, active/hover → red
- Breakpoints: `≤900px` → hamburger, `≤600px` → full-width inner

### Page Banner
Full-width black bar used at the top of all inner pages:
```css
background: #000000;
padding: 80px 24px;
text-align: center;
color: #ffffff;
/* h1 inside: futura-pt, clamp(2rem,5vw,4rem), 700, uppercase, letter-spacing 0.08em */
```

### Address Bar
Displayed at the bottom of most pages in place of the footer. Centered content on `#fafafa` background, full viewport width.
- Breaks out of container using `width: 100vw; margin-left: calc(50% - 50vw)`
- Text: futura-pt, 14px, weight 600, all-caps, letter-spacing 0.1em, color `#000000`
- Phone link: futura-pt, 16px, weight 700, color `#ff0000`, underlined in green `#008000`

### Footer
Full-width black background (`#000000`), white text at various opacity levels. 4-column grid (→ 2-col at 900px → 1-col at 600px).
- Section headings: futura-pt, 10px, all-caps, `rgba(255,255,255,0.5)`
- Body text: proxima-nova, 14px, `rgba(255,255,255,0.75)`
- Nav links: futura-pt, 10px, all-caps, `rgba(255,255,255,0.75)` → white on hover
- Bottom bar: futura-pt, 10px, all-caps, `rgba(255,255,255,0.4)`, separated by `border-top: 1px solid rgba(255,255,255,0.1)`

> **Note:** The footer is hidden on `/casino-night`, `/contact`, and `/calendar` pages. Those pages use the Address Bar instead.

---

## Links (Global)

```css
a:link    { color: #ff0000; }  /* red */
a:visited { color: #008000; }  /* green */
```

Social icon links override this with `color: #000000` → hover `#888888`.

---

## Transitions

Standard: `170ms ease-in-out` on color, background-color, border-color  
Images / opacity: `0.2s ease`

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** CSS Modules (`*.module.css`) + a single `styles/globals.css` for tokens and utilities
- **No Tailwind in use** (imported but not actively used for component styles)
- **Border radius:** `0` everywhere — enforce this on all new components
- **No gradients, no box-shadows** except the nav dropdown (`0 8px 24px rgba(0,0,0,0.08)`)
