# Kitsune Brewing Co. — Warm & Earthy Website Design System

## 1. Purpose

This document defines the visual direction, interaction patterns, page structure, and implementation guidance for the Kitsune Brewing Co. website. It is intended to be practical enough to hand directly to Google Stitch, a designer, or a developer.

The redesign should use the current website's content and functionality as a foundation while improving composition, hierarchy, spacing, typography, responsive behavior, and brand expression. Do not treat this as a simple color swap or force every existing section into the new site unchanged.

## 2. Brand Concept

Kitsune Brewing Co. is a craft brewery with a refined Japanese influence. The website should evoke a welcoming neighborhood taproom shaped by brewing craft, natural materials, paper, wood, lantern light, and understated storytelling.

### Brand attributes

- Warm and welcoming
- Handcrafted and tactile
- Atmospheric and slightly mysterious
- Traditional without feeling old-fashioned
- Premium without feeling exclusive
- Community-focused
- Distinctive, calm, and confident

### Creative direction

Use Japanese influence through restraint, rhythm, material, and composition—not decoration alone. Favor asymmetry, negative space, fine-line motifs, subtle framing, and natural textures. The experience should feel like a modern craft brewery with Japanese sensibility, not a themed restaurant.

### Avoid

- Anime, gaming, neon, or cyberpunk aesthetics
- Sushi-restaurant clichés or excessive Japanese characters
- Unverified or decorative Japanese copy
- Generic SaaS layouts and bright white technology styling
- Excessive glassmorphism, gradients, drop shadows, or pill-shaped UI
- Overly rounded cards and playful bubble typography
- Applying all palette colors with equal visual weight

## 3. Color System

Use the following exact palette. Brown, cream, and rust should dominate; tea green and soft gold are supporting accents.

| Token | Color | Hex | Primary use |
| --- | --- | --- | --- |
| `--color-roasted-brown` | Roasted Brown | `#2E221D` | Main dark background, header, footer, hero overlay |
| `--color-cedar-wood` | Cedar Wood | `#5A4032` | Alternate sections, dark cards, layered surfaces |
| `--color-cream-paper` | Cream Paper | `#F4E8D2` | Light surfaces and primary text on dark backgrounds |
| `--color-rust-red` | Rust Red | `#A84634` | Primary CTA, active state, key brand accent |
| `--color-tea-green` | Tea Green | `#6E7A5E` | Botanical detail, category accents, supporting UI |
| `--color-soft-gold` | Soft Gold | `#C29B5B` | Rules, icons, premium details, restrained highlights |

### Recommended distribution

- 45% Roasted Brown
- 30% Cream Paper
- 15% Cedar Wood
- 7% Rust Red
- 2% Tea Green
- 1% Soft Gold

These percentages are directional, not strict quotas. They are intended to prevent the accent colors from overpowering the core brown-and-cream atmosphere.

### Usage rules

- Use Roasted Brown for the global header, footer, major atmospheric sections, and dark overlays.
- Use Cream Paper for primary copy on dark backgrounds and for editorial light sections.
- Use Cedar Wood to distinguish dark surfaces without introducing a new neutral.
- Reserve Rust Red for primary actions, active navigation, important links, and occasional graphic anchors.
- Use Tea Green for supporting labels, botanical cues, beer-style distinctions, and low-priority accents.
- Use Soft Gold sparingly for fine borders, separators, small icons, and premium detail—not large backgrounds or body copy.
- Prefer solid colors and subtle texture over gradients. If an image overlay is needed, use transparent Roasted Brown rather than a multicolor gradient.
- Never place low-contrast accent text on similarly dark backgrounds. Confirm all final foreground/background pairs with a WCAG contrast checker.

### Suggested semantic tokens

```css
:root {
  --color-roasted-brown: #2E221D;
  --color-cedar-wood: #5A4032;
  --color-cream-paper: #F4E8D2;
  --color-rust-red: #A84634;
  --color-tea-green: #6E7A5E;
  --color-soft-gold: #C29B5B;

  --color-bg-primary: var(--color-roasted-brown);
  --color-bg-secondary: var(--color-cedar-wood);
  --color-surface-light: var(--color-cream-paper);
  --color-text-on-dark: var(--color-cream-paper);
  --color-text-on-light: var(--color-roasted-brown);
  --color-action: var(--color-rust-red);
  --color-accent-supporting: var(--color-tea-green);
  --color-detail: var(--color-soft-gold);
}
```

## 4. Typography

Use typography to balance editorial character with practical readability.

### Recommended pairing

- **Display and headings:** a warm, expressive serif with sturdy forms and restrained contrast. Suggested options: Fraunces, Cormorant Garamond, or Source Serif 4.
- **Body and interface:** a clean humanist sans serif. Suggested options: Inter, Manrope, or Source Sans 3.
- **Labels and metadata:** the body sans in uppercase with modest tracking; do not introduce a third typeface.
- **Japanese text, if verified and genuinely needed:** use a complementary family such as Noto Serif JP or Noto Sans JP.

Use no more than two primary font families. Prefer self-hosted variable fonts when licensing permits, and define robust fallbacks.

### Type scale

Use fluid sizing with `clamp()` rather than fixed desktop-only values.

| Role | Suggested size | Weight | Notes |
| --- | --- | --- | --- |
| Hero display | `clamp(3rem, 8vw, 7rem)` | 500–600 | Tight leading, short line length |
| H1 | `clamp(2.5rem, 6vw, 5rem)` | 500–600 | One per page |
| H2 | `clamp(2rem, 4vw, 3.5rem)` | 500–600 | Editorial section heading |
| H3 | `clamp(1.4rem, 2vw, 2rem)` | 600 | Card or subsection heading |
| Body large | `1.125rem–1.25rem` | 400 | Introductory and story copy |
| Body | `1rem` | 400 | Minimum default size |
| Small/meta | `0.8125rem–0.875rem` | 500–600 | Labels, dates, beer details |

### Typography rules

- Keep body line length around 55–72 characters.
- Use body line-height between 1.55 and 1.75.
- Use heading line-height between 0.95 and 1.15.
- Use sentence case for navigation and buttons; reserve uppercase for short labels.
- Do not use faux brush fonts or distressed novelty type.
- Limit centered copy to short introductions; left-align longer passages.

## 5. Spacing and Sizing

Use an 8px base rhythm with a small 4px step for fine adjustments.

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.5rem;   /* 24px */
--space-6: 2rem;     /* 32px */
--space-7: 3rem;     /* 48px */
--space-8: 4rem;     /* 64px */
--space-9: 6rem;     /* 96px */
--space-10: 8rem;    /* 128px */
```

- Desktop section padding: 96–128px vertically.
- Tablet section padding: 72–96px vertically.
- Mobile section padding: 56–72px vertically.
- Default card padding: 24–32px.
- Compact UI padding: 12–16px.
- Avoid crowding. Generous negative space is a core part of the Japanese-inspired direction.

## 6. Layout System

- Use a centered content container with a maximum width of 1280–1440px.
- Use page gutters of `clamp(1rem, 4vw, 4rem)`.
- Build desktop layouts on a 12-column grid with 24–32px gutters.
- Use 6 columns on tablet and 4 columns on mobile.
- Favor asymmetric editorial compositions such as 5/7 or 7/5 splits.
- Alternate dark atmospheric sections with Cream Paper editorial sections to create pacing.
- Avoid stacking many identical full-width bands. Vary image position, text width, and section depth while keeping the system coherent.
- Use fine 1px rules, framed image crops, and occasional offset elements instead of heavy shadows.
- Use border radii sparingly: 0–4px by default, up to 8px for cards where needed.

## 7. Navigation Bar

### Desktop

- Use a 72–88px-tall navbar over Roasted Brown or a dark hero image.
- Place the Kitsune Brewing Co. wordmark or fox mark at left.
- Place primary links at center or right: Beers, Our Story, Taproom, Events, Merch.
- Use a Rust Red primary CTA such as **Visit the Taproom** or **Find Our Beer**.
- Keep Soft Gold limited to a fine bottom rule or small logo detail.
- Make the header transparent over the top of the hero if legibility is strong; transition to an opaque Roasted Brown surface after scrolling.

### Mobile

- Use a compact wordmark and a clearly labeled menu trigger with at least a 44×44px target.
- Open a full-height or near-full-height Roasted Brown menu with large Cream Paper links.
- Keep the primary CTA visible within the menu.
- Trap keyboard focus while open, support Escape to close, and restore focus to the trigger.

## 8. Hero

The hero should establish place, product, and atmosphere immediately.

- Use a full-bleed brewery, taproom, pouring, or product image with a restrained Roasted Brown overlay.
- Compose the content asymmetrically; avoid a generic centered headline over a stock image.
- Include one strong headline, one short supporting paragraph, and no more than two actions.
- Primary CTA: Rust Red filled button.
- Secondary CTA: Cream Paper or Soft Gold text link with a visible underline or arrow.
- Add a subtle fine-line kitsune tail, moon, or seigaiha-inspired detail as a framing device—not as a dominant illustration.
- Optional content: taproom open status or location in a compact metadata row.
- On mobile, preserve the focal subject using art-directed crops and keep essential copy above the fold where practical.

## 9. Featured Beers

- Present 3–4 featured beers on the homepage; link to the full beer list.
- Use product-led cards with can/bottle photography, beer name, style, ABV, short tasting note, and availability.
- Alternate between a clean card grid and one larger editorial feature to avoid a catalog-only feel.
- Use Cream Paper cards on Roasted Brown or Cedar Wood cards with Cream Paper type.
- Assign Rust Red, Tea Green, or Soft Gold only as small category markers or graphic details.
- Treat unavailable or seasonal beers clearly in text; do not communicate status by color alone.
- Hover may gently lift the product image or reveal tasting notes, but all critical content must remain available without hover.

## 10. Our Story

- Use an editorial split layout with a historic or process image paired with concise brand copy.
- Focus the story on people, place, brewing craft, and the meaning behind Kitsune Brewing Co.
- Use Cream Paper as the primary background for a tactile, printed-page feel.
- Add a large pull quote, founding year, or process detail as a visual anchor.
- A vertical Soft Gold rule or small kitsune motif may connect text and image.
- Avoid long undifferentiated paragraphs; use a strong introduction and 2–3 short supporting blocks.

## 11. Taproom

- Make location, hours, directions, and taproom expectations immediately scannable.
- Use a strong atmosphere image plus a practical information panel.
- Include address, current hours, accessibility information, parking/transit notes, family/pet policy if relevant, and a map link.
- Use Rust Red for the main **Get Directions** or **Plan Your Visit** action.
- If hours are dynamic, display the timezone and maintain a reliable content source.
- Do not rely on an embedded map as the only way to access the address or directions.

## 12. Events

- Show upcoming events as a short chronological list rather than an oversized grid.
- Each item should include date, time, title, event type, short description, price or free status, and reservation/ticket status.
- Use a large date block, fine divider, and Cream Paper/Roasted Brown contrast for an editorial calendar feel.
- Provide clear states for sold out, canceled, postponed, and recurring events.
- Use semantic time markup and unambiguous dates, including the year where needed.
- Include **View All Events** and, when relevant, **Host an Event** actions.

## 13. Merch

- Feature a restrained 3–4 item selection rather than reproducing the full storefront on the homepage.
- Use neutral, consistent product photography on warm Cream Paper or natural wood backgrounds.
- Show item name, price, color/size availability, and sold-out state.
- Keep commerce controls familiar and direct; brand expression should not reduce purchase clarity.
- Use the Rust Red primary action and a simple text link for **Shop All Merch**.
- Avoid excessive badges. Use Soft Gold only for a genuinely limited or special release.

## 14. Footer

- Use a deep Roasted Brown background with Cream Paper text.
- Include the logo, concise brand statement, address, hours, navigation, social links, newsletter signup, and legal links.
- Use a thin Soft Gold divider or small fox-tail motif.
- Keep the newsletter form simple: one labeled email field and one clear action.
- Include responsible-drinking language and age/legal information where appropriate.
- Ensure links have clear hover and keyboard-focus states, not color changes alone.

## 15. Buttons and Links

### Primary button

- Rust Red background
- Cream Paper text
- 48–52px minimum height
- 16–24px horizontal padding
- 0–4px corner radius
- Medium or semibold sans-serif label
- Hover: slightly darker or deeper Rust Red plus subtle movement
- Focus: high-contrast 2–3px outline with offset

### Secondary button

- Transparent or Cream Paper background depending on context
- 1px border in Cream Paper, Roasted Brown, or Soft Gold when contrast permits
- Clear filled or underlined hover state

### Text links

- Use an underline, directional arrow, or other non-color cue.
- Keep inline links visibly distinct from body text.
- Do not use Soft Gold for small link text unless contrast passes on the selected background.

### Interaction rules

- Minimum touch target: 44×44px.
- Disabled states must remain legible and use more than opacity alone where possible.
- Loading states should preserve button width to avoid layout shift.

## 16. Cards and Surfaces

- Prefer flat, tactile surfaces with thin borders over floating white cards.
- Use Cream Paper on dark sections or Cedar Wood on Roasted Brown.
- Default radius: 0–4px; maximum: 8px.
- Default border: 1px with a low-key tone derived from the palette.
- Use shadows only when they explain layering; keep them broad, dark, and subtle.
- Keep card structure consistent: eyebrow, heading, supporting information, then action.
- Use image aspect ratios consistently within each component family.
- On mobile, allow cards to stack naturally; do not force cramped horizontal carousels for core content.

## 17. Japanese-Inspired Motifs

Motifs should add cultural and visual depth without becoming costume.

### Appropriate motifs

- Abstract fox tail or ear geometry
- Minimal kitsune mask linework
- Seigaiha-inspired wave rhythm
- Asanoha-inspired geometric pattern used at very low contrast
- Noren-like framing or vertical fabric rhythm
- Enso-like circular brush form, used sparingly and abstractly
- Moon, rice paper, ink, wood grain, and lantern-light cues
- Vertical rules, seals, and offset editorial composition

### Rules

- Use no more than one primary motif per section.
- Keep patterns tonal and low contrast, typically below 8–12% visual opacity.
- Do not place decorative motifs behind dense body copy.
- Do not use Japanese words or characters unless their meaning, spelling, and cultural fit have been verified.
- Avoid sacred, ceremonial, or historically specific symbols as decoration without appropriate context.

## 18. Imagery Treatment

### Subject matter

- Candid taproom community
- Brewing process and hands at work
- Ingredient details such as grain, hops, water, citrus, tea, or botanicals
- Beer pours, foam, glassware, cans, and packaging
- Warm architectural details, natural wood, metal, and paper
- Evening light and quiet atmospheric moments

### Art direction

- Favor warm, low-saturation, editorial photography with deep browns and natural highlights.
- Use real brewery and taproom photography whenever possible; avoid generic stock imagery.
- Preserve skin tones and beer color—do not apply a heavy brown filter to every image.
- Use consistent grain, contrast, and white balance across the library.
- Mix wide environmental shots, mid-range human moments, and tight process details.
- Use subtle Roasted Brown overlays only when text legibility requires them.
- Supply responsive image sizes, modern formats, descriptive alt text, and explicit dimensions to prevent layout shift.

## 19. Motion and Animation

Motion should feel calm, tactile, and deliberate.

- Use 180–280ms for most interface transitions.
- Use 400–700ms for restrained editorial reveals.
- Favor opacity, small vertical translation, masked image reveal, and line-drawing accents.
- Allow gentle image scale on hover, capped around 1.02–1.04.
- Avoid parallax that impairs readability, looping decorative motion, bouncy easing, or scroll hijacking.
- Animate groups with subtle stagger, not long sequences.
- Support `prefers-reduced-motion`; remove nonessential movement and use immediate or simple opacity changes.
- Never delay access to content until an animation completes.

## 20. Responsive Behavior

Design mobile-first and treat each breakpoint as a deliberate composition, not a scaled desktop page.

### Suggested breakpoints

- Small mobile: below 480px
- Mobile/large mobile: 480–767px
- Tablet: 768–1023px
- Desktop: 1024–1439px
- Wide desktop: 1440px and above

### Rules

- Collapse multi-column sections to one column below tablet unless two columns remain genuinely readable.
- Change alternating image/text sections to a consistent content-first reading order on mobile.
- Keep navigation, CTAs, form controls, and event information comfortably tappable.
- Avoid horizontal page scrolling at 320px viewport width.
- Use art-directed crops rather than shrinking full desktop hero images.
- Scale section spacing and type fluidly.
- Preserve meaningful asymmetry on larger screens, but prioritize clear reading order on smaller screens.
- Use horizontal scrolling only for optional, supplemental content and expose a clear cue that more content exists.

## 21. Accessibility

Target WCAG 2.2 AA as the minimum standard.

- Maintain at least 4.5:1 contrast for normal text and 3:1 for large text and essential UI graphics.
- Test every palette pairing in its actual font size and weight; do not assume brand colors automatically pass.
- Use semantic landmarks, a logical heading hierarchy, and meaningful HTML elements.
- Provide a visible **Skip to content** link.
- Ensure the entire site works with keyboard-only navigation.
- Use strong, consistent focus indicators that remain visible on both light and dark surfaces.
- Do not use color alone for status, availability, selection, errors, or links.
- Provide descriptive alt text for informative images and empty alt text for purely decorative images.
- Label every form field persistently; placeholders are not labels.
- Announce validation errors clearly and associate them with the relevant fields.
- Respect text resizing to 200%, browser zoom, reduced motion, and user contrast preferences where feasible.
- Ensure tap targets are at least 44×44px and have sufficient spacing.
- Provide captions or transcripts for meaningful video and audio.
- Avoid autoplay audio and rapidly flashing content.

## 22. Implementation Notes

### Architecture

- Build reusable components and shared design tokens rather than styling each section independently.
- Keep content separate from presentation so beer releases, events, hours, and products can be updated without layout changes.
- Use semantic HTML first; add ARIA only where native semantics are insufficient.
- Implement component states for default, hover, focus-visible, active, disabled, loading, empty, error, sold out, and unavailable where relevant.

### Suggested component inventory

- `SiteHeader`
- `MobileMenu`
- `Hero`
- `SectionIntro`
- `BeerCard`
- `FeaturedBeer`
- `StorySplit`
- `TaproomDetails`
- `EventRow`
- `ProductCard`
- `NewsletterForm`
- `SiteFooter`
- `PrimaryButton`
- `SecondaryButton`
- `TextLink`
- `MotifDivider`

### Performance

- Optimize images and use responsive `srcset`/`sizes` or the framework equivalent.
- Preload only the critical hero asset and primary font subset.
- Lazy-load below-the-fold imagery.
- Prevent cumulative layout shift by reserving media dimensions.
- Keep decorative textures compressed and lightweight; prefer CSS or SVG for repeatable line motifs.
- Limit font weights and third-party scripts.
- Aim for strong Core Web Vitals on mid-range mobile devices and typical cellular connections.

### Content and data

- Use a CMS or structured data source for beers, events, taproom hours, and merch when frequent updates are expected.
- Model beer availability and event status explicitly instead of embedding those states in prose.
- Add structured data where appropriate, such as `Organization`, `LocalBusiness` or a relevant subtype, `Event`, `Product`, and `BreadcrumbList`.
- Keep address, hours, contact details, and social links centralized to prevent inconsistencies.

### Quality assurance

- Test at 320px, 375px, 768px, 1024px, 1440px, and a wide desktop size.
- Test keyboard flow, screen-reader landmarks, focus order, form errors, reduced motion, and zoom.
- Check the main flows: finding a beer, planning a taproom visit, viewing an event, and opening merch.
- Validate color contrast in context.
- Review all Japanese-inspired copy and motifs for accuracy and cultural appropriateness.
- Verify imagery licenses and secure consent for identifiable people.

## 23. Page Rhythm and Homepage Order

A recommended homepage sequence is:

1. Navbar
2. Atmospheric hero with primary visit/shop action
3. Featured beers
4. Short brand story
5. Taproom information and atmosphere
6. Upcoming events
7. Featured merch
8. Newsletter invitation
9. Footer

The sequence may change based on business priority, but the homepage should always answer four questions quickly: what Kitsune Brewing Co. is, what it makes, where to experience it, and what the visitor should do next.

## 24. Final Design Standard

The finished site should feel brown, cream, tactile, calm, and atmospheric. Rust should guide action; green should support; gold should reward attention. Every section should combine brand character with a practical visitor need. If a visual flourish competes with readability, navigation, product information, or accessibility, simplify the flourish.
