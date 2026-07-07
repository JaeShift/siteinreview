---
name: Kitsune Authentic
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#594138'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#8d7166'
  outline-variant: '#e1bfb3'
  surface-tint: '#a63b00'
  primary: '#a63b00'
  on-primary: '#ffffff'
  primary-container: '#f26522'
  on-primary-container: '#4f1800'
  inverse-primary: '#ffb599'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e2'
  on-secondary-container: '#646464'
  tertiary: '#005ac1'
  on-tertiary: '#ffffff'
  tertiary-container: '#4e8fff'
  on-tertiary-container: '#00285e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb599'
  on-primary-fixed: '#370e00'
  on-primary-fixed-variant: '#7f2b00'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a41'
  on-tertiary-fixed-variant: '#004494'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  brand-orange: '#F26522'
  pure-black: '#000000'
  pure-white: '#FFFFFF'
  utility-blue: '#4285F4'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 42px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: 0.1em
  headline-sm:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '700'
    lineHeight: '1.4'
    letterSpacing: 0.1em
  body-lg:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.02em
  body-md:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.15em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
spacing:
  container-max: 1200px
  gutter: 24px
  section-padding: 80px
  stack-sm: 16px
  stack-md: 32px
  stack-lg: 64px
---

## Brand & Style

The brand identity is built on a "Modern Industrial Craft" aesthetic, blending the raw, bold nature of brewery culture with a clean, high-end editorial structure. It is designed to feel established yet accessible, utilizing high-contrast visuals to command attention.

The design system follows a **Minimalist / Bold** style. It relies on extreme clarity, heavy use of white space to isolate content, and high-impact typography. The personality is confident and straightforward, avoiding unnecessary flourishes in favor of structural integrity and functional hierarchy. The visual mood is balanced between the starkness of a gallery and the energy of a modern taproom.

## Colors

This design system utilizes a high-contrast palette to drive user focus. 

- **Primary (Brand Orange):** Used exclusively for high-priority calls-to-action and critical interactive states. It provides a warm, energetic contrast against the monochrome base.
- **Secondary (Pure Black):** Reserved for core branding elements, headers, footers, and primary typography. It grounds the design and provides a sense of authority.
- **Neutral (Pure White):** The foundation of the content area. Large expanses of white are used to create "breathing room" and ensure readability.
- **Utility Blue:** A secondary accent used sparingly for links or information-heavy interactions (e.g., map pins or tooltips).

The default interface is **Light Mode**, characterized by black text on white surfaces.

## Typography

The typography system uses **Montserrat** across all levels to maintain a clean, modern, and versatile appearance that mirrors the geometric qualities of the brand's primary fonts. 

- **Headlines:** Use heavy weights (700-800) and are often presented in all-caps for sections titles (e.g., "WHATS ON TAP?"). Increased letter spacing is applied to uppercase headings to improve legibility and provide a premium "spaced" feel.
- **Body:** Set with generous line height to maintain the "airy" feel of the overall layout.
- **Navigation & Labels:** Utilize the `label-caps` style for a structured, utilitarian look in menus and small metadata.

## Layout & Spacing

This design system uses a **Fixed Grid** philosophy for desktop, transitioning to a fluid model for mobile devices.

- **Grid Model:** A 12-column grid with a maximum container width of 1200px.
- **Section Spacing:** Generous vertical padding (`section-padding`) is required between major content blocks to prevent visual clutter.
- **Responsive Behavior:** 
  - **Desktop (1024px+):** 12 columns, 80px vertical section spacing.
  - **Tablet (768px - 1023px):** 6 columns, 64px vertical section spacing, 32px side margins.
  - **Mobile (< 768px):** 2 columns, 48px vertical section spacing, 16px side margins.
- **Alignment:** Primary navigation links are centered, while the logo remains anchored to the far left to establish a clear point of origin.

## Elevation & Depth

To maintain the flat, minimalist aesthetic of the inspiration, depth is conveyed through **Tonal Layers** rather than shadows.

- **Base Layer:** Pure white (#FFFFFF) for all content-heavy sections.
- **Contrast Layers:** Pure black (#000000) for global structural elements like the header (when overlapping hero imagery) and the footer.
- **Outlines:** Use thin, low-contrast borders (1px, light grey) only when necessary to define functional boundaries like form inputs or map containers.
- **No Shadows:** Shadows are avoided. Depth is created by the physical separation of elements through whitespace.

## Shapes

The shape language is strictly **Sharp (0)**. 

Every UI element—including buttons, input fields, image containers, and cards—must feature 90-degree corners. This reinforces the industrial, precise nature of the brand. Rounded corners or "pills" should be avoided entirely to maintain consistency with the established architectural style of the interface.

## Components

- **Buttons:** Rectangular with sharp corners. The Primary Button uses a `brand-orange` background with white text. The Secondary Button uses a `pure-black` background with white text or a black outline.
- **Navigation Bar:** Transparent or white background with black text. Logo is positioned left, primary links are centered in uppercase `label-caps` style.
- **Input Fields:** 1px black or dark grey border, sharp corners, and `body-md` placeholder text. No inner shadows.
- **Cards:** Defined by whitespace and typography rather than boxes. If a container is required, use a 1px border with no shadow and no corner radius.
- **Footer:** Full-width `pure-black` background with centered `pure-white` text. Use `label-caps` for contact info and social links.
- **Chips/Badges:** Small rectangular blocks with `pure-black` background and white text, used for categories or status indicators.