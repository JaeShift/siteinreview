# Mobile landing-page cleanup

Implemented the approved mobile-only plan (up to 760px): compact hero, wider crop of the existing tap-wall photo, animated downward lineup arrow, separate Taplist link line, simplified weekly event rows, and removal of the requested shop controls and captions. Desktop presentation is preserved.

The weekly schedule includes the earlier requested live calendar integration, current/future-week navigation, and exclusion of ended events. The full-size mobile calendar remains removed.

## Verification

- Production build and TypeScript/lint checks passed. Two existing image warnings remain in the unrelated admin inventory page.
- All 16 calendar and homepage tests passed.
- Inspected mobile screenshots at 448x835, 390x844, and 320px width, plus desktop at 1440x900. No horizontal page overflow found.
- Hero bottom is at 812px in the 835px viewport and 710px in the 844px viewport. Both calls to action and the complete pint remain visible.
- Verified event details open/close, current-week back navigation is disabled, next week works, and return to this week works.
- Verified the carousel's End key reaches the final card and Home returns to the first. The carousel retains its horizontal scroll rail and next-card preview.
- Confirmed all four mobile-only hidden elements are still visible on desktop.
- Confirmed the Taplist link starts below the availability sentence and retains its original destination.
- Confirmed the arrow animation is present and the existing reduced-motion rules disable animations. Reduced-motion OS settings were not changed during testing.
- Final visual pass corrected landscape positioning behind the hero buttons.

## Representative screenshots

- [Mobile hero](hero-448.png)
- [Smaller mobile hero](hero-390.png)
- [Tap photo](taps-448.png)
- [Menu note](menu-note-390.png)
- [Weekly events](events-448.png)
- [Narrow weekly events](events-320.png)
- [Mobile shop](shop-448.png)
- [Desktop hero](desktop-hero.png)
- [Desktop shop](desktop-shop.png)
