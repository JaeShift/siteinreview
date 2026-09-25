# Current homepage hero artwork

## Active: September 25 cream hero corrections

User-approved extended-K wordmark, evenly softened complete cloud artwork, an opaque amber glass with a softer full blue-circle fox print, and a compact split mobile composition. Hero and visit strip only; no deployment.

- Desktop background: `hero-cream-clouds-v2.webp`; mobile background: `hero-cream-clouds-mobile-v2.webp`. Both are proportionally contained and displayed at 55% strength, without gradient fades.
- Original long-K vector: `kitsune-hero-lettering-flat.svg`, rendered black with its tucked live subtitle and fine rules.
- Opaque base: `hero-cream-glass-v1.webp`, using `hero-cream-glass-mask.svg` to exclude its background. Softened print: `hero-cream-glass-print-v2.webp`, restricted to the artwork by `hero-cream-print-mask.svg`. No opacity is applied to either glass image.
- Imagegen prompts, generated originals, baseline snapshots, screenshots, and review notes: `artifacts/hero-corrections/`. Original supplied references remain in `artifacts/hero-cream/references/`.
- Primary action `/calendar`; secondary `/#tap-list`. Lower homepage content is unchanged from the saved correction baseline.

## Previous: September 22 wild side refresh

The newest user reference (Screenshot 2026-09-22 212456.png) inspires the current hero: live cream/vermilion serif headline, original enlarged fox glass, and a detailed wave/hop/barley landscape. The headline is proposed creative copy for review.

- Active backdrop: public/images/home/hero-wild-side-v1.webp, generated with the built-in imagegen tool and encoded as WebP (415 KB).
- Original hero-clear-mural-v25.png, registered hero-liquid-cloud-repair-v2.png and both masks remain unchanged.
- Existing event and Magic destinations remain; a tertiary beer link targets the existing tap list. All sections following the hero are preserved exactly.
- Design brief, exact generation prompt, before snapshots, screenshots, and verification: artifacts/hero-wild-side/.
- Ready in the local preview only; not deployed.

## Previous: September 21 refresh


The September 21 reference refresh uses the user's five supplied concepts as inspiration. The current implementation is ready for review in the local preview; it has not been published.

- `hero-rock-clouds-v1.png`: active charcoal, engraved gold cloud, subdued copper sun, and photographic rock background. Created with the built-in imagegen tool using the previous backdrop and the user's fourth reference. Prompt: `artifacts/hero-reference-refresh/generation-prompt.txt`.
- `kitsune-hero-lettering-flat.svg`: unchanged flat vector lettering. The live Brewing Company subtitle now has explicit responsive font sizing and a fallback font, preventing inherited heading sizes when web fonts are unavailable.
- `hero-clear-mural-v25.png`: unchanged original glass photograph. Its fox print, foam, rim, glass contours, side highlights, and base remain the displayed source pixels outside the repair mask.
- `hero-liquid-cloud-repair-v2.png`: active imagegen repair, registered to the original 1122 x 1402 source. Removes old scenery in the open amber areas; the final revision softens gold cloud reflections.
- `hero-liquid-repair-mask-v1.svg`: transparent except for unprinted liquid. Excludes the connected fox/swirl print with a protective margin and feathers only the outer liquid perimeter.
- `hero-glass-silhouette.svg`: unchanged exterior crop of the original glass.

The repair remains a masked image layer in `app/page.tsx`. The original fox glass and registered liquid repair are unchanged. Their placement and scale now relate to the rock ledge. Mobile uses a separate background crop to keep the glass grounded.

Only the hero composition, tagline typography, small craft/welcome line, and wordmark subtitle styling changed. Existing CTA destinations and all subsequent page content remain intact.

Design rationale, source snapshots, generation prompt, responsive screenshots, and browser verification are in `artifacts/hero-reference-refresh/`. Original artwork and earlier backups remain intact.
