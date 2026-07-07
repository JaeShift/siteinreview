---
name: Ember & Ink
colors:
  surface: '#161311'
  surface-dim: '#161311'
  surface-bright: '#3d3836'
  surface-container-lowest: '#110d0c'
  surface-container-low: '#1f1b19'
  surface-container: '#231f1d'
  surface-container-high: '#2e2927'
  surface-container-highest: '#393431'
  on-surface: '#eae1dd'
  on-surface-variant: '#dbc2b0'
  inverse-surface: '#eae1dd'
  inverse-on-surface: '#342f2d'
  outline: '#a38c7c'
  outline-variant: '#554336'
  surface-tint: '#ffb77d'
  primary: '#ffb77d'
  on-primary: '#4d2600'
  primary-container: '#d97707'
  on-primary-container: '#432100'
  inverse-primary: '#904d00'
  secondary: '#c9c6c2'
  on-secondary: '#31302d'
  secondary-container: '#474743'
  on-secondary-container: '#b7b5b0'
  tertiary: '#a0d663'
  on-tertiary: '#1e3700'
  tertiary-container: '#6d9f32'
  on-tertiary-container: '#192f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcc3'
  primary-fixed-dim: '#ffb77d'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#6e3900'
  secondary-fixed: '#e5e2dd'
  secondary-fixed-dim: '#c9c6c2'
  on-secondary-fixed: '#1c1c19'
  on-secondary-fixed-variant: '#474743'
  tertiary-fixed: '#bbf37c'
  tertiary-fixed-dim: '#a0d663'
  on-tertiary-fixed: '#0f2000'
  on-tertiary-fixed-variant: '#2e4f00'
  background: '#161311'
  on-background: '#eae1dd'
  surface-variant: '#393431'
  mana-red: '#B91C1C'
  surface-charcoal: '#231F20'
  deep-ink: '#0D0C22'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 42px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter-desktop: 24px
  gutter-mobile: 16px
  margin-desktop: 48px
  margin-mobile: 20px
---

## Brand & Style

This design system establishes a **Premium Dark Fantasy Brewery** aesthetic, bridging the gap between a high-end taproom and an immersive tabletop gaming sanctuary. The brand personality is hospitable, mysterious, and deeply artisanal.

The visual style departs from flat corporate trends in favor of **Tactile Minimalism**. It utilizes rich, dark backgrounds that mimic scorched wood and leather, layered with high-fidelity typography and warm "candlelight" glows. The goal is to evoke the feeling of a dimly lit, upscale tavern where community and competition thrive. Elements should feel heavy and permanent, using subtle parchment-inspired textures and elegant micro-interactions that suggest quality and craftsmanship.

## Colors

The palette is anchored by **Warm Charcoal (#1A1614)**, serving as the "charred oak" base for all surfaces. **Amber (#D97706)** is the primary functional color, used for critical actions and to represent the warm glow of beer and magic. 

**Cream (#F5F2ED)** provides high-contrast legibility for body text, moving away from harsh pure whites to maintain the vintage, parchment-like feel. **Muted Green (#4D7C0F)** is reserved for secondary signaling, while **Subtle Red (#B91C1C)** acts as an "active" highlight for high-intensity elements like tournament status or alert states. Avoid using the secondary cream for large background blocks; keep it strictly for typography and iconography to maintain the dark, immersive atmosphere.

## Typography

The typographic hierarchy relies on the tension between the classic, editorial elegance of **Playfair Display** and the functional precision of **Inter**. 

All primary headings and "flavor text" elements use the serif face to convey authority and fantasy heritage. Display sizes should utilize tighter letter-spacing for a modern-premium feel. For functional UI elements—navigation, body text, and technical card data—Inter is used to ensure maximum legibility at small sizes. Use uppercase labels with generous letter-spacing for metadata like "Format" or "Date" to create a structured, organized feel amidst the organic serif headings.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop to maintain an intimate, centered feel akin to a physical menu or a tabletop. The spacing rhythm is strictly based on an 8px scale.

On **Desktop (1024px+)**, use a 12-column grid with 24px gutters. Elements should be grouped into cards or sections that do not necessarily span the full width of the screen, allowing the "charcoal" background to act as a negative space frame. 

On **Mobile (<768px)**, transition to a single-column layout with 20px side margins. Use vertical stacking for event and product cards, ensuring that touch targets for CTAs remain at a minimum height of 48px.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Soft Amber Glows** rather than traditional drop shadows.

- **Level 0 (Base):** The primary charcoal background (#1A1614).
- **Level 1 (Cards):** A slightly lighter surface (#231F20) with a 1px subtle border using a low-opacity cream or gold tint.
- **Level 2 (Interactive):** When hovered, cards or buttons should emit a soft "Amber Bloom"—a very diffused, low-opacity radial gradient centered behind the element, suggesting a magical aura or warm tavern light.

Avoid hard shadows. Use depth to suggest focus; an active card should feel like it is being lit by a nearby candle rather than physically lifted off the page.

## Shapes

The shape language is **Soft (0.25rem)**, moving away from aggressive rounded corners to maintain a more "carved" and structured look. This slight rounding prevents the UI from feeling too brutalist or technical while retaining the sharpness of a premium brand.

- **Buttons & Inputs:** Use the base `rounded` (4px).
- **Product/Event Cards:** Use `rounded-lg` (8px) for a more defined frame.
- **Badges/Chips:** Use `rounded-xl` (12px) for distinct classification tags like MTG formats.

## Components

### Buttons
Primary buttons use the Amber (#D97706) background with Dark Ink (#0D0C22) text for maximum visibility. Secondary buttons are outlined in Cream with a subtle 10% opacity Cream fill. Hover states should include a subtle scale-up (1.02x) and an intensified amber glow.

### Cards (Events & Products)
Cards are the core of the design. They feature a Level 1 surface with a 1px border. Event cards must prioritize the "Format Badge" in the top-right corner. Product cards should use high-contrast imagery against the dark surface, with price points in the Amber accent color.

### MTG Format Badges
Small, high-contrast chips using the `label-sm` typography. 
- **Commander:** Green border (#4D7C0F).
- **Draft:** Amber border (#D97706).
- **Standard:** Neutral Cream border.

### Input Fields
Inputs use a semi-transparent dark fill with a 1px border. On focus, the border transitions to Amber with a soft inner glow.

### Textures
Apply a very low-opacity (2-3%) noise or "paper" grain texture across the background to give the UI a physical, tactile quality. Avoid pure flat hex codes where possible.