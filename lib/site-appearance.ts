export const THEME_TRANSITIONS = [
  {
    id: "none",
    label: "None",
    desc: "Instant switch between cream and MTG pages",
  },
  {
    id: "dusk",
    label: "Dusk Wipe",
    desc: "Darkness falls from the header with a gold dusk line",
  },
  {
    id: "iris",
    label: "Iris",
    desc: "A circle opens from the fox wordmark or the link you click",
  },
  {
    id: "card-flip",
    label: "Card Flip",
    desc: "A sleeved card turns cream-to-ink in the center of the screen",
  },
  {
    id: "ink-bloom",
    label: "Ink Bloom",
    desc: "An ink blot spreads from the click until it fills the page",
  },
  {
    id: "mana-seam",
    label: "Mana Seam",
    desc: "A gold-blue-copper line draws down, then the halves part",
  },
  {
    id: "threshold",
    label: "Threshold Band",
    desc: "Cream header and footer stay; dusk and dawn strips meet the dark hall",
  },
] as const;

export type ThemeTransitionId = (typeof THEME_TRANSITIONS)[number]["id"];
export type ThemeTransitionSpeed = "slow" | "medium" | "fast";

export interface SiteAppearance {
  transition: ThemeTransitionId;
  speed: ThemeTransitionSpeed;
}

export const DEFAULT_SITE_APPEARANCE: SiteAppearance = {
  transition: "none",
  speed: "medium",
};

export const THEME_SPEEDS: { id: ThemeTransitionSpeed; label: string }[] = [
  { id: "slow", label: "Slow" },
  { id: "medium", label: "Medium" },
  { id: "fast", label: "Fast" },
];

export const THEME_SPEED_FACTOR: Record<ThemeTransitionSpeed, number> = {
  slow: 1.55,
  medium: 1,
  fast: 0.58,
};

export const OVERLAY_TRANSITIONS = [
  "dusk",
  "iris",
  "card-flip",
  "ink-bloom",
  "mana-seam",
] as const;

export function isThemeTransitionId(value: unknown): value is ThemeTransitionId {
  return THEME_TRANSITIONS.some((item) => item.id === value);
}

export function isThemeTransitionSpeed(value: unknown): value is ThemeTransitionSpeed {
  return THEME_SPEEDS.some((item) => item.id === value);
}

export function isOverlayTransition(
  id: ThemeTransitionId
): id is (typeof OVERLAY_TRANSITIONS)[number] {
  return (OVERLAY_TRANSITIONS as readonly string[]).includes(id);
}
