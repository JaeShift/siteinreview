export type Condition = "NM" | "LP" | "MP" | "HP" | "DMG";
export type CardColor = "W" | "U" | "B" | "R" | "G" | "Multi" | "Colorless";
export type CardType =
  | "Creature"
  | "Instant"
  | "Sorcery"
  | "Enchantment"
  | "Artifact"
  | "Planeswalker"
  | "Land"
  | "Battle"
  | "Kindred"
  | "Legendary";
export type Rarity = "Common" | "Uncommon" | "Rare" | "Mythic Rare" | "Land" | "Special";
export type Availability = "In Stock" | "Presale";

export interface SingleCard {
  id: string;
  name: string;
  set: string;
  setCode: string;
  collectorNumber?: string;
  condition: Condition;
  foil: boolean;
  price: number;
  quantity: number;
  imageUrl: string;
  color: CardColor;
  type: CardType;
  rarity: Rarity;
  manaCost?: string;
  // Extended fields matching shop filters
  colorIdentity?: string[];
  power?: string;
  toughness?: string;
  cmc?: number;
  oracleText?: string;
  availability?: Availability;
  formats?: string[];
  hidden?: boolean;
  marketPrice?: number;
  backImageUrl?: string;
  backName?: string;
  backType?: string;
  backManaCost?: string;
  backOracleText?: string;
  backPower?: string;
  backToughness?: string;
}

export type SortOption = "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest";

export interface SinglesFilters {
  search: string;
  sets: string[];
  conditions: Condition[];
  colors: CardColor[];
  colorIdentity: string[];
  types: CardType[];
  rarities: Rarity[];
  formats: string[];
  availability: string[];
  foilOnly: boolean;
  minPrice: number;
  maxPrice: number;
  power: string;
  toughness: string;
  cmc: string;
  oracle: string;
  sort: SortOption;
}

// ─── Mock Singles Inventory ───────────────────────────────────────────────────

const IMG = (name: string, color = "1a1a2e", text = "ffffff") =>
  `https://placehold.co/223x310/${color}/${text}?text=${encodeURIComponent(name)}`;

export const singles: SingleCard[] = [
  // ── Bloomburrow ──────────────────────────────────────────────────────────
  {
    id: "blb-001",
    name: "Mabel, Heir to Cragflame",
    set: "Bloomburrow",
    setCode: "BLB",
    condition: "NM",
    foil: false,
    price: 8.99,
    quantity: 3,
    imageUrl: IMG("Mabel", "4a2c0a", "ffd700"),
    color: "R",
    type: "Creature",
    rarity: "Mythic Rare",
    manaCost: "{1}{R}{W}",
  },
  {
    id: "blb-001f",
    name: "Mabel, Heir to Cragflame",
    set: "Bloomburrow",
    setCode: "BLB",
    condition: "NM",
    foil: true,
    price: 22.99,
    quantity: 1,
    imageUrl: IMG("Mabel FOIL", "ffd700", "4a2c0a"),
    color: "R",
    type: "Creature",
    rarity: "Mythic Rare",
    manaCost: "{1}{R}{W}",
  },
  {
    id: "blb-002",
    name: "Ajani, Nacatl Pariah",
    set: "Bloomburrow",
    setCode: "BLB",
    condition: "NM",
    foil: false,
    price: 14.99,
    quantity: 2,
    imageUrl: IMG("Ajani NP", "ffffff", "000000"),
    color: "W",
    type: "Planeswalker",
    rarity: "Mythic Rare",
    manaCost: "{1}{W}",
  },
  {
    id: "blb-003",
    name: "Ral, Crackling Wit",
    set: "Bloomburrow",
    setCode: "BLB",
    condition: "LP",
    foil: false,
    price: 5.99,
    quantity: 4,
    imageUrl: IMG("Ral CW", "1a3a6b", "ffffff"),
    color: "U",
    type: "Planeswalker",
    rarity: "Mythic Rare",
    manaCost: "{2}{U}{R}",
  },
  {
    id: "blb-004",
    name: "Pond Prophet",
    set: "Bloomburrow",
    setCode: "BLB",
    condition: "NM",
    foil: false,
    price: 2.49,
    quantity: 8,
    imageUrl: IMG("Pond Prophet", "1a6b4a", "ffffff"),
    color: "U",
    type: "Creature",
    rarity: "Rare",
    manaCost: "{2}{U}",
  },
  {
    id: "blb-005",
    name: "Heartfire Hero",
    set: "Bloomburrow",
    setCode: "BLB",
    condition: "NM",
    foil: false,
    price: 3.99,
    quantity: 6,
    imageUrl: IMG("Heartfire Hero", "8b0000", "ffffff"),
    color: "R",
    type: "Creature",
    rarity: "Rare",
    manaCost: "{R}",
  },
  {
    id: "blb-006",
    name: "Lórien Revealed",
    set: "Bloomburrow",
    setCode: "BLB",
    condition: "MP",
    foil: false,
    price: 1.99,
    quantity: 12,
    imageUrl: IMG("Lorien", "1a3a6b", "90ee90"),
    color: "U",
    type: "Sorcery",
    rarity: "Uncommon",
    manaCost: "{4}{U}",
  },
  {
    id: "blb-007",
    name: "Thistledown Whistler",
    set: "Bloomburrow",
    setCode: "BLB",
    condition: "NM",
    foil: false,
    price: 0.49,
    quantity: 20,
    imageUrl: IMG("Thistledown", "228b22", "ffffff"),
    color: "G",
    type: "Creature",
    rarity: "Common",
    manaCost: "{1}{G}",
  },

  // ── Duskmourn ─────────────────────────────────────────────────────────────
  {
    id: "dsk-001",
    name: "Valgavoth, Terror Eater",
    set: "Duskmourn: House of Horror",
    setCode: "DSK",
    condition: "NM",
    foil: false,
    price: 24.99,
    quantity: 2,
    imageUrl: IMG("Valgavoth", "1a0a2e", "cc44ff"),
    color: "B",
    type: "Creature",
    rarity: "Mythic Rare",
    manaCost: "{5}{B}{B}",
  },
  {
    id: "dsk-001f",
    name: "Valgavoth, Terror Eater",
    set: "Duskmourn: House of Horror",
    setCode: "DSK",
    condition: "NM",
    foil: true,
    price: 64.99,
    quantity: 1,
    imageUrl: IMG("Valgavoth FOIL", "cc44ff", "1a0a2e"),
    color: "B",
    type: "Creature",
    rarity: "Mythic Rare",
    manaCost: "{5}{B}{B}",
  },
  {
    id: "dsk-002",
    name: "Overlord of the Floodpits",
    set: "Duskmourn: House of Horror",
    setCode: "DSK",
    condition: "NM",
    foil: false,
    price: 18.99,
    quantity: 3,
    imageUrl: IMG("Overlord Flood", "003366", "66ccff"),
    color: "U",
    type: "Creature",
    rarity: "Mythic Rare",
    manaCost: "{6}{U}{U}",
  },
  {
    id: "dsk-003",
    name: "Valgavoth's Lair",
    set: "Duskmourn: House of Horror",
    setCode: "DSK",
    condition: "NM",
    foil: false,
    price: 4.99,
    quantity: 8,
    imageUrl: IMG("Valgavoth's Lair", "2d0a4a", "ffffff"),
    color: "B",
    type: "Land",
    rarity: "Rare",
    manaCost: "",
  },
  {
    id: "dsk-004",
    name: "Midnight Mayhem",
    set: "Duskmourn: House of Horror",
    setCode: "DSK",
    condition: "LP",
    foil: false,
    price: 2.99,
    quantity: 5,
    imageUrl: IMG("Midnight Mayhem", "1a0014", "ff44aa"),
    color: "B",
    type: "Sorcery",
    rarity: "Rare",
    manaCost: "{2}{B}{B}",
  },
  {
    id: "dsk-005",
    name: "Dread Fugue",
    set: "Duskmourn: House of Horror",
    setCode: "DSK",
    condition: "NM",
    foil: false,
    price: 0.99,
    quantity: 15,
    imageUrl: IMG("Dread Fugue", "1a0014", "ffffff"),
    color: "B",
    type: "Sorcery",
    rarity: "Uncommon",
    manaCost: "{B}",
  },
  {
    id: "dsk-006",
    name: "Haunted One",
    set: "Duskmourn: House of Horror",
    setCode: "DSK",
    condition: "NM",
    foil: false,
    price: 0.25,
    quantity: 30,
    imageUrl: IMG("Haunted One", "2d0a2d", "ffffff"),
    color: "B",
    type: "Enchantment",
    rarity: "Common",
    manaCost: "{1}{B}",
  },

  // ── Foundations ───────────────────────────────────────────────────────────
  {
    id: "fdn-001",
    name: "Llanowar Elves",
    set: "Foundations",
    setCode: "FDN",
    condition: "NM",
    foil: false,
    price: 0.5,
    quantity: 25,
    imageUrl: IMG("Llanowar Elves", "1a6b1a", "ffffff"),
    color: "G",
    type: "Creature",
    rarity: "Common",
    manaCost: "{G}",
  },
  {
    id: "fdn-002",
    name: "Lightning Bolt",
    set: "Foundations",
    setCode: "FDN",
    condition: "NM",
    foil: false,
    price: 1.99,
    quantity: 16,
    imageUrl: IMG("Lightning Bolt", "8b0000", "ffff00"),
    color: "R",
    type: "Instant",
    rarity: "Common",
    manaCost: "{R}",
  },
  {
    id: "fdn-002f",
    name: "Lightning Bolt",
    set: "Foundations",
    setCode: "FDN",
    condition: "NM",
    foil: true,
    price: 6.99,
    quantity: 4,
    imageUrl: IMG("Lightning Bolt FOIL", "ffff00", "8b0000"),
    color: "R",
    type: "Instant",
    rarity: "Common",
    manaCost: "{R}",
  },
  {
    id: "fdn-003",
    name: "Counterspell",
    set: "Foundations",
    setCode: "FDN",
    condition: "NM",
    foil: false,
    price: 0.99,
    quantity: 20,
    imageUrl: IMG("Counterspell", "003399", "ffffff"),
    color: "U",
    type: "Instant",
    rarity: "Common",
    manaCost: "{U}{U}",
  },
  {
    id: "fdn-004",
    name: "Serra Angel",
    set: "Foundations",
    setCode: "FDN",
    condition: "NM",
    foil: false,
    price: 0.75,
    quantity: 18,
    imageUrl: IMG("Serra Angel", "f5f5dc", "000000"),
    color: "W",
    type: "Creature",
    rarity: "Uncommon",
    manaCost: "{3}{W}{W}",
  },
  {
    id: "fdn-005",
    name: "Goblin Guide",
    set: "Foundations",
    setCode: "FDN",
    condition: "NM",
    foil: false,
    price: 3.49,
    quantity: 7,
    imageUrl: IMG("Goblin Guide", "cc2200", "ffffff"),
    color: "R",
    type: "Creature",
    rarity: "Rare",
    manaCost: "{R}",
  },
  {
    id: "fdn-006",
    name: "Thoughtseize",
    set: "Foundations",
    setCode: "FDN",
    condition: "LP",
    foil: false,
    price: 8.99,
    quantity: 5,
    imageUrl: IMG("Thoughtseize", "1a0a2e", "ffffff"),
    color: "B",
    type: "Sorcery",
    rarity: "Rare",
    manaCost: "{B}",
  },
  {
    id: "fdn-006f",
    name: "Thoughtseize",
    set: "Foundations",
    setCode: "FDN",
    condition: "NM",
    foil: true,
    price: 19.99,
    quantity: 2,
    imageUrl: IMG("Thoughtseize FOIL", "8844ff", "ffffff"),
    color: "B",
    type: "Sorcery",
    rarity: "Rare",
    manaCost: "{B}",
  },
  {
    id: "fdn-007",
    name: "Path to Exile",
    set: "Foundations",
    setCode: "FDN",
    condition: "NM",
    foil: false,
    price: 1.49,
    quantity: 14,
    imageUrl: IMG("Path to Exile", "f5f5dc", "888888"),
    color: "W",
    type: "Instant",
    rarity: "Uncommon",
    manaCost: "{W}",
  },
  {
    id: "fdn-008",
    name: "Birds of Paradise",
    set: "Foundations",
    setCode: "FDN",
    condition: "NM",
    foil: false,
    price: 4.99,
    quantity: 6,
    imageUrl: IMG("Birds of Paradise", "228b22", "ffcc00"),
    color: "G",
    type: "Creature",
    rarity: "Rare",
    manaCost: "{G}",
  },

  // ── Modern Horizons 3 ─────────────────────────────────────────────────────
  {
    id: "mh3-001",
    name: "Grief",
    set: "Modern Horizons 3",
    setCode: "MH3",
    condition: "NM",
    foil: false,
    price: 34.99,
    quantity: 2,
    imageUrl: IMG("Grief", "0d0d1a", "9966ff"),
    color: "B",
    type: "Creature",
    rarity: "Mythic Rare",
    manaCost: "{4}{B}",
  },
  {
    id: "mh3-001f",
    name: "Grief",
    set: "Modern Horizons 3",
    setCode: "MH3",
    condition: "NM",
    foil: true,
    price: 89.99,
    quantity: 1,
    imageUrl: IMG("Grief FOIL", "9966ff", "0d0d1a"),
    color: "B",
    type: "Creature",
    rarity: "Mythic Rare",
    manaCost: "{4}{B}",
  },
  {
    id: "mh3-002",
    name: "Phlage, Titan of Fire's Fury",
    set: "Modern Horizons 3",
    setCode: "MH3",
    condition: "NM",
    foil: false,
    price: 29.99,
    quantity: 3,
    imageUrl: IMG("Phlage", "cc3300", "ffcc00"),
    color: "Multi",
    type: "Creature",
    rarity: "Mythic Rare",
    manaCost: "{3}{R}{W}",
  },
  {
    id: "mh3-003",
    name: "Tamiyo, Inquisitive Student",
    set: "Modern Horizons 3",
    setCode: "MH3",
    condition: "NM",
    foil: false,
    price: 12.99,
    quantity: 4,
    imageUrl: IMG("Tamiyo IS", "003366", "99ccff"),
    color: "U",
    type: "Planeswalker",
    rarity: "Mythic Rare",
    manaCost: "{U}",
  },
  {
    id: "mh3-004",
    name: "Ocelot Pride",
    set: "Modern Horizons 3",
    setCode: "MH3",
    condition: "NM",
    foil: false,
    price: 8.49,
    quantity: 6,
    imageUrl: IMG("Ocelot Pride", "f5f5dc", "cc9900"),
    color: "W",
    type: "Creature",
    rarity: "Rare",
    manaCost: "{W}",
  },
  {
    id: "mh3-005",
    name: "Flare of Denial",
    set: "Modern Horizons 3",
    setCode: "MH3",
    condition: "LP",
    foil: false,
    price: 6.99,
    quantity: 5,
    imageUrl: IMG("Flare of Denial", "003366", "66ffff"),
    color: "U",
    type: "Instant",
    rarity: "Rare",
    manaCost: "{2}{U}{U}",
  },
  {
    id: "mh3-006",
    name: "Flare of Cultivation",
    set: "Modern Horizons 3",
    setCode: "MH3",
    condition: "NM",
    foil: false,
    price: 3.49,
    quantity: 8,
    imageUrl: IMG("Flare Cultivation", "1a6b1a", "ccff88"),
    color: "G",
    type: "Instant",
    rarity: "Rare",
    manaCost: "{3}{G}",
  },
  {
    id: "mh3-007",
    name: "Mogg Mob",
    set: "Modern Horizons 3",
    setCode: "MH3",
    condition: "NM",
    foil: false,
    price: 1.49,
    quantity: 10,
    imageUrl: IMG("Mogg Mob", "8b2222", "ffffff"),
    color: "R",
    type: "Creature",
    rarity: "Uncommon",
    manaCost: "{2}{R}",
  },

  // ── Outlaws of Thunder Junction ───────────────────────────────────────────
  {
    id: "otj-001",
    name: "Oko, the Ringleader",
    set: "Outlaws of Thunder Junction",
    setCode: "OTJ",
    condition: "NM",
    foil: false,
    price: 19.99,
    quantity: 3,
    imageUrl: IMG("Oko Ringleader", "1a6b1a", "cc9900"),
    color: "Multi",
    type: "Planeswalker",
    rarity: "Mythic Rare",
    manaCost: "{1}{G}{U}",
  },
  {
    id: "otj-002",
    name: "Vraska, the Silencer",
    set: "Outlaws of Thunder Junction",
    setCode: "OTJ",
    condition: "NM",
    foil: false,
    price: 15.99,
    quantity: 4,
    imageUrl: IMG("Vraska Silencer", "1a3d1a", "9966ff"),
    color: "Multi",
    type: "Planeswalker",
    rarity: "Mythic Rare",
    manaCost: "{3}{B}{G}",
  },
  {
    id: "otj-003",
    name: "Slickshot Show-Off",
    set: "Outlaws of Thunder Junction",
    setCode: "OTJ",
    condition: "NM",
    foil: false,
    price: 9.99,
    quantity: 7,
    imageUrl: IMG("Slickshot", "8b1a1a", "ffaa00"),
    color: "R",
    type: "Creature",
    rarity: "Rare",
    manaCost: "{1}{R}",
  },
  {
    id: "otj-004",
    name: "Requisition Raid",
    set: "Outlaws of Thunder Junction",
    setCode: "OTJ",
    condition: "LP",
    foil: false,
    price: 2.49,
    quantity: 9,
    imageUrl: IMG("Requisition Raid", "4a1a00", "ffffff"),
    color: "B",
    type: "Sorcery",
    rarity: "Rare",
    manaCost: "{1}{B}",
  },
  {
    id: "otj-005",
    name: "Tinybones Joins Up",
    set: "Outlaws of Thunder Junction",
    setCode: "OTJ",
    condition: "NM",
    foil: false,
    price: 4.99,
    quantity: 5,
    imageUrl: IMG("Tinybones JU", "2d0a2d", "ffcc44"),
    color: "B",
    type: "Enchantment",
    rarity: "Rare",
    manaCost: "{1}{B}",
  },
  {
    id: "otj-006",
    name: "Simulacrum Synthesizer",
    set: "Outlaws of Thunder Junction",
    setCode: "OTJ",
    condition: "NM",
    foil: false,
    price: 3.99,
    quantity: 6,
    imageUrl: IMG("Simulacrum", "4a4a4a", "cccccc"),
    color: "Colorless",
    type: "Artifact",
    rarity: "Rare",
    manaCost: "{3}",
  },
  {
    id: "otj-007",
    name: "Three-Step Landfall",
    set: "Outlaws of Thunder Junction",
    setCode: "OTJ",
    condition: "NM",
    foil: false,
    price: 0.75,
    quantity: 22,
    imageUrl: IMG("Three-Step", "4a2c0a", "cc9966"),
    color: "G",
    type: "Enchantment",
    rarity: "Uncommon",
    manaCost: "{2}{G}",
  },
  {
    id: "otj-008",
    name: "Bovine Intervention",
    set: "Outlaws of Thunder Junction",
    setCode: "OTJ",
    condition: "NM",
    foil: false,
    price: 0.5,
    quantity: 28,
    imageUrl: IMG("Bovine", "f5f5dc", "8b4513"),
    color: "W",
    type: "Instant",
    rarity: "Common",
    manaCost: "{1}{W}",
  },

  // ── Fetch lands / staples ─────────────────────────────────────────────────
  {
    id: "misc-001",
    name: "Scalding Tarn",
    set: "Modern Horizons 3",
    setCode: "MH3",
    condition: "NM",
    foil: false,
    price: 22.99,
    quantity: 4,
    imageUrl: IMG("Scalding Tarn", "cc3300", "66ccff"),
    color: "Colorless",
    type: "Land",
    rarity: "Rare",
    manaCost: "",
  },
  {
    id: "misc-002",
    name: "Misty Rainforest",
    set: "Modern Horizons 3",
    setCode: "MH3",
    condition: "NM",
    foil: false,
    price: 19.99,
    quantity: 3,
    imageUrl: IMG("Misty Rainforest", "004d00", "99ffcc"),
    color: "Colorless",
    type: "Land",
    rarity: "Rare",
    manaCost: "",
  },
  {
    id: "misc-003",
    name: "Bloodstained Mire",
    set: "Modern Horizons 3",
    setCode: "MH3",
    condition: "LP",
    foil: false,
    price: 17.99,
    quantity: 5,
    imageUrl: IMG("Bloodstained Mire", "4d0000", "cc9999"),
    color: "Colorless",
    type: "Land",
    rarity: "Rare",
    manaCost: "",
  },
  {
    id: "misc-004",
    name: "Windswept Heath",
    set: "Modern Horizons 3",
    setCode: "MH3",
    condition: "NM",
    foil: false,
    price: 16.99,
    quantity: 6,
    imageUrl: IMG("Windswept Heath", "006633", "ccffcc"),
    color: "Colorless",
    type: "Land",
    rarity: "Rare",
    manaCost: "",
  },
  {
    id: "misc-005",
    name: "Flooded Strand",
    set: "Modern Horizons 3",
    setCode: "MH3",
    condition: "NM",
    foil: false,
    price: 18.99,
    quantity: 4,
    imageUrl: IMG("Flooded Strand", "003399", "99ccff"),
    color: "Colorless",
    type: "Land",
    rarity: "Rare",
    manaCost: "",
  },
  {
    id: "misc-006",
    name: "Sol Ring",
    set: "Foundations",
    setCode: "FDN",
    condition: "NM",
    foil: false,
    price: 1.99,
    quantity: 20,
    imageUrl: IMG("Sol Ring", "ffcc00", "000000"),
    color: "Colorless",
    type: "Artifact",
    rarity: "Uncommon",
    manaCost: "{1}",
  },
  {
    id: "misc-006f",
    name: "Sol Ring",
    set: "Foundations",
    setCode: "FDN",
    condition: "NM",
    foil: true,
    price: 7.99,
    quantity: 3,
    imageUrl: IMG("Sol Ring FOIL", "ffd700", "1a1a1a"),
    color: "Colorless",
    type: "Artifact",
    rarity: "Uncommon",
    manaCost: "{1}",
  },
  {
    id: "misc-007",
    name: "Arcane Signet",
    set: "Foundations",
    setCode: "FDN",
    condition: "NM",
    foil: false,
    price: 0.99,
    quantity: 30,
    imageUrl: IMG("Arcane Signet", "444444", "cccccc"),
    color: "Colorless",
    type: "Artifact",
    rarity: "Common",
    manaCost: "{2}",
  },
];

// ─── Sets list for filter ─────────────────────────────────────────────────────

export const availableSets = [
  { code: "BLB", name: "Bloomburrow" },
  { code: "DSK", name: "Duskmourn: House of Horror" },
  { code: "FDN", name: "Foundations" },
  { code: "MH3", name: "Modern Horizons 3" },
  { code: "OTJ", name: "Outlaws of Thunder Junction" },
];

// ─── Filter + sort helpers ────────────────────────────────────────────────────

export function filterSingles(cards: SingleCard[], filters: Partial<SinglesFilters>): SingleCard[] {
  const indexed = cards.map((card, i) => ({ card, i }));
  // Always hide cards with no stock or explicitly hidden
  let result = indexed.filter(({ card: c }) => c.quantity > 0 && !c.hidden);

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      ({ card: c }) =>
        c.name.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q) ||
        c.setCode.toLowerCase().includes(q)
    );
  }

  // Filter by set full name (matches what FilterSidebar sends)
  if (filters.sets?.length) {
    result = result.filter(({ card: c }) => filters.sets!.includes(c.set));
  }

  if (filters.conditions?.length) {
    result = result.filter(({ card: c }) => filters.conditions!.includes(c.condition));
  }

  if (filters.colors?.length) {
    result = result.filter(({ card: c }) => filters.colors!.includes(c.color));
  }

  if (filters.colorIdentity?.length) {
    result = result.filter(({ card: c }) =>
      filters.colorIdentity!.every((ci) => c.colorIdentity?.includes(ci))
    );
  }

  if (filters.types?.length) {
    result = result.filter(({ card: c }) => filters.types!.includes(c.type));
  }

  if (filters.rarities?.length) {
    result = result.filter(({ card: c }) => filters.rarities!.includes(normalizeRarity(c.rarity)));
  }

  if (filters.formats?.length) {
    result = result.filter(({ card: c }) =>
      filters.formats!.some((f) => c.formats?.includes(f))
    );
  }

  if (filters.availability?.length) {
    result = result.filter(({ card: c }) =>
      filters.availability!.includes(c.availability ?? "In Stock")
    );
  }

  if (filters.foilOnly) {
    result = result.filter(({ card: c }) => c.foil);
  }

  if (filters.minPrice !== undefined) {
    result = result.filter(({ card: c }) => c.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    result = result.filter(({ card: c }) => c.price <= filters.maxPrice!);
  }

  if (filters.power) {
    result = result.filter(({ card: c }) => c.power === filters.power);
  }

  if (filters.toughness) {
    result = result.filter(({ card: c }) => c.toughness === filters.toughness);
  }

  if (filters.cmc) {
    result = result.filter(({ card: c }) => String(c.cmc) === filters.cmc);
  }

  if (filters.oracle) {
    const q = filters.oracle.toLowerCase();
    result = result.filter(({ card: c }) => c.oracleText?.toLowerCase().includes(q));
  }

  const sort = filters.sort ?? "name-asc";
  result.sort((a, b) => {
    switch (sort) {
      case "price-asc":  return a.card.price - b.card.price;
      case "price-desc": return b.card.price - a.card.price;
      case "name-asc":   return a.card.name.localeCompare(b.card.name);
      case "name-desc":  return b.card.name.localeCompare(a.card.name);
      case "newest":     return b.i - a.i;
      default:           return 0;
    }
  });

  return result.map(({ card }) => card);
}

export function formatCondition(condition: Condition): string {
  const map: Record<Condition, string> = {
    NM: "Near Mint",
    LP: "Lightly Played",
    MP: "Moderately Played",
    HP: "Heavily Played",
    DMG: "Damaged",
  };
  return map[condition];
}

export function normalizeRarity(rarity: string): Rarity {
  const map: Record<string, Rarity> = {
    common: "Common",
    uncommon: "Uncommon",
    rare: "Rare",
    mythic: "Mythic Rare",
    "mythic rare": "Mythic Rare",
    Mythic: "Mythic Rare",
    special: "Special",
    land: "Land",
    Common: "Common",
    Uncommon: "Uncommon",
    Rare: "Rare",
    "Mythic Rare": "Mythic Rare",
    Land: "Land",
    Special: "Special",
  };
  return map[rarity] ?? "Common";
}

export function rarityBadgeLabel(rarity: string): string {
  return normalizeRarity(rarity) === "Mythic Rare" ? "MR" : normalizeRarity(rarity)[0];
}

export function formatSetDisplay(
  set: string,
  setCode?: string,
  collectorNumber?: string
): string {
  const code = setCode ? ` · ${setCode.toUpperCase()}` : "";
  const number = collectorNumber ? ` #${collectorNumber}` : "";
  return `${set}${code}${number}`;
}

export function getConditionColor(condition: Condition): string {
  const map: Record<Condition, string> = {
    NM: "#1a1a1a",
    LP: "#3a3a3a",
    MP: "#a87c00",
    HP: "#c05000",
    DMG: "#c0302d",
  };
  return map[condition];
}
