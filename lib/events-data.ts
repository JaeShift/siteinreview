export type EventFormat =
  | "Commander"
  | "Draft"
  | "Standard"
  | "Modern"
  | "Pioneer"
  | "Legacy"
  | "Sealed"
  | "Prerelease"
  | "RCQ"
  | "Casual";

export interface EventFaq {
  question: string;
  answer: string;
}

export interface CustomQuestion {
  id: string;
  label: string;
  required: boolean;
}

export interface EventAddOn {
  id: string;
  label: string;
  price: number;
}

export interface MtgEvent {
  slug: string;
  title: string;
  format: EventFormat;
  date: string;        // "YYYY-MM-DD"
  time: string;        // "6:00 PM"
  endTime: string;     // "10:00 PM"
  entryFee: number;    // dollars, 0 = free
  playerLimit: number;
  registeredCount: number;
  imageUrl: string;
  description: string;
  shortDescription: string;
  location: string;
  prizeSupport: string;
  tags: string[];
  faq: EventFaq[];
  recurring?: "weekly" | "biweekly" | "monthly";
  featured?: boolean;
  registrationOpen?: boolean;
  customQuestions?: CustomQuestion[];
  addOns?: EventAddOn[];
}

export interface EventRegistration {
  eventSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  submittedAt: string;
}

// ─── Mock Events ──────────────────────────────────────────────────────────────

const LOCATION = "Kitsune Brewing Co. — 3321 E Bell Rd Suite B-5, Phoenix, AZ 85032";

const DEFAULT_FAQ: EventFaq[] = [
  {
    question: "What do I need to bring?",
    answer:
      "Bring a valid photo ID, your registered deck (if applicable), and your registration confirmation email. Sleeves and dice are recommended but not required.",
  },
  {
    question: "What is the refund policy?",
    answer:
      "Refunds are available up to 48 hours before the event. After that, your seat may be transferred to another player at the event organizer's discretion.",
  },
  {
    question: "Is food available?",
    answer:
      "Kitsune Brewing Co. partners with rotating food trucks on event nights. Check the Food Trucks page for tonight's truck. Full craft beer menu is always available.",
  },
  {
    question: "Are minors allowed?",
    answer:
      "Players of all ages are welcome for MTG events. Minors must be accompanied by a parent or guardian. Alcohol service follows Arizona state law.",
  },
  {
    question: "Where do I park?",
    answer:
      "Free parking is available in the shopping center lot directly in front of the brewery. Additional street parking is available on E Bell Rd.",
  },
];

const COMMANDER_FAQ: EventFaq[] = [
  { question: "Is there an entry fee?", answer: "No entry fee — Commander Night is completely free!" },
  { question: "Do I need to register?", answer: "No registration required. Just show up between 5:30 PM and 9:00 PM and we'll get you into a pod." },
  { question: "What power level should my deck be?", answer: "We welcome all power levels from casual to cEDH. Let us know your preference and we'll match you to the right pod." },
  { question: "Are minors allowed?", answer: "Players of all ages are welcome. Minors must be accompanied by a parent or guardian. Alcohol service follows Arizona state law." },
  { question: "Where do I park?", answer: "Free parking is available in the shopping center lot directly in front of the brewery." },
];

function commanderNight(slug: string, date: string): MtgEvent {
  return {
    slug,
    title: "Commander Night",
    format: "Commander",
    date,
    time: "5:30 PM",
    endTime: "9:00 PM",
    entryFee: 0,
    playerLimit: 40,
    registeredCount: 0,
    imageUrl: "/images/commander.jpg",
    shortDescription: "Free Commander Night every Tuesday. Pods form every 30 minutes. All power levels welcome.",
    description: "Join us every Tuesday for Commander Night at Kitsune Brewing Co.! We organize players into pods of 4 and let the chaos unfold. Casual and competitive pods available — just let us know your preferred power level. New players are always welcome. Free entry, no registration required. Grab a brew and sling some spells!",
    location: LOCATION,
    prizeSupport: "Free entry. Prizes and giveaways throughout the night.",
    tags: ["Commander", "Multiplayer", "Casual", "Free", "Weekly"],
    recurring: "weekly",
    featured: false,
    faq: COMMANDER_FAQ,
  };
}

export const mtgEvents: MtgEvent[] = [
  // ── July Commander Nights ──
  commanderNight("commander-night-jul-7",  "2026-07-07"),
  commanderNight("commander-night-jul-14", "2026-07-14"),
  commanderNight("commander-night-jul-21", "2026-07-21"),
  commanderNight("commander-night-jul-28", "2026-07-28"),
  // ── Hobbit Prerelease ──
  {
    slug: "hobbit-prerelease",
    title: "Hobbit Prerelease",
    format: "Prerelease",
    date: "2026-07-20",
    time: "2:00 PM",
    endTime: "6:00 PM",
    entryFee: 44.99,
    playerLimit: 32,
    registeredCount: 0,
    imageUrl: "/images/hobbitprerelease.webp",
    shortDescription: "Be the first to play The Hobbit! Sealed prerelease packs, prizes, and more.",
    description: "Don't miss the Hobbit Prerelease at Kitsune Brewing Co.! Be among the first players in Phoenix to crack open Hobbit packs before the official release. Each player receives a Prerelease Kit, builds a 40-card sealed deck, and competes in 4 rounds of Swiss. Keep everything you open, earn prizes based on your record, and celebrate the launch of one of Magic's most exciting new sets!",
    location: LOCATION,
    prizeSupport: "Stamped promo card for all participants. Bonus packs for top finishers.",
    tags: ["Prerelease", "Sealed", "Hobbit", "New Set", "All Levels"],
    featured: true,
    faq: [
      { question: "What is included in the Prerelease Kit?", answer: "Each kit includes Hobbit booster packs, a stamped foil promo rare, and a deckbuilding guide." },
      { question: "How long does it run?", answer: "Approximately 4 hours. Doors open at 2:00 PM and play typically wraps up around 6:00 PM." },
      { question: "Do I need to register in advance?", answer: "Yes — we recommend registering ahead of time as space is limited." },
      { question: "Are minors allowed?", answer: "Players of all ages are welcome. Minors must be accompanied by a parent or guardian. Alcohol service follows Arizona state law." },
      { question: "Where do I park?", answer: "Free parking is available in the shopping center lot directly in front of the brewery." },
    ],
  },
  // ── August Commander Nights ──
  commanderNight("commander-night-aug-4",  "2026-08-04"),
  commanderNight("commander-night-aug-11", "2026-08-11"),
  commanderNight("commander-night-aug-18", "2026-08-18"),
  commanderNight("commander-night-aug-25", "2026-08-25"),
];

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getEventBySlug(slug: string, events?: MtgEvent[]): MtgEvent | undefined {
  return (events ?? mtgEvents).find((e) => e.slug === slug);
}

export function getEventsByFormat(format: EventFormat, events?: MtgEvent[]): MtgEvent[] {
  return (events ?? mtgEvents).filter((e) => e.format === format);
}

export function getFeaturedEvents(events?: MtgEvent[]): MtgEvent[] {
  return (events ?? mtgEvents).filter((e) => e.featured);
}

export function getUpcomingEvents(limit?: number, events?: MtgEvent[]): MtgEvent[] {
  const today = new Date().toISOString().split("T")[0];
  const upcoming = (events ?? mtgEvents)
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  return limit ? upcoming.slice(0, limit) : upcoming;
}

export function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getSeatsRemaining(event: MtgEvent): number {
  return event.playerLimit - event.registeredCount;
}

export function isEventSoldOut(event: MtgEvent): boolean {
  return event.registeredCount >= event.playerLimit;
}
