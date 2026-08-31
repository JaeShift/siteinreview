"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import type { SingleCard, Condition, CardColor, CardType, Rarity, Availability } from "@/lib/singles-data";
import { formatCondition, formatSetDisplay, normalizeRarity, rarityBadgeLabel } from "@/lib/singles-data";
import StatsCard from "@/components/admin/StatsCard";
import BulkImportModal from "./BulkImportModal";
import styles from "./admin-inventory.module.css";

// ── Scryfall helpers ──────────────────────────────────────────────────────────
interface ScryfallCardFace {
  name?: string;
  colors?: string[];
  image_uris?: { normal: string; png: string };
  mana_cost?: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  type_line?: string;
}

interface ScryfallCard {
  id: string;
  name: string;
  set: string;
  set_name: string;
  rarity: string;
  type_line: string;
  colors?: string[];
  color_identity?: string[];
  mana_cost?: string;
  cmc?: number;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  image_uris?: { normal: string; png: string };
  card_faces?: ScryfallCardFace[];
  collector_number?: string;
  prices?: { usd?: string; usd_foil?: string };
  legalities?: Record<string, string>;
}

function scryfallCardColors(card: ScryfallCard): string[] {
  if (card.colors?.length) return card.colors;
  const fromFaces = card.card_faces?.flatMap((face) => face.colors ?? []) ?? [];
  if (fromFaces.length) return Array.from(new Set(fromFaces));
  return [];
}

function scryfallColorIdentity(card: ScryfallCard): string[] {
  if (card.color_identity?.length) return card.color_identity;
  return scryfallCardColors(card);
}

function scryfallColor(colors?: string[] | null): CardColor {
  const list = colors ?? [];
  if (list.length === 0) return "Colorless";
  if (list.length > 1) return "Multi";
  const map: Record<string, CardColor> = { W: "W", U: "U", B: "B", R: "R", G: "G" };
  return map[list[0]] ?? "Colorless";
}

function scryfallRarity(r: string): Rarity {
  const map: Record<string, Rarity> = {
    common: "Common",
    uncommon: "Uncommon",
    rare: "Rare",
    mythic: "Mythic Rare",
    "mythic rare": "Mythic Rare",
    special: "Special",
  };
  return map[r.toLowerCase()] ?? "Common";
}

function scryfallType(typeLine?: string): CardType {
  const types: CardType[] = ["Creature", "Instant", "Sorcery", "Enchantment", "Artifact", "Planeswalker", "Land", "Battle", "Kindred", "Legendary"];
  return types.find((t) => (typeLine ?? "").includes(t)) ?? "Creature";
}

const FORMATS = ["Standard", "Modern", "Commander", "Legacy", "Pioneer", "Vintage", "Alchemy", "Historic", "Brawl", "Timeless", "Oathbreaker"];

const SCRYFALL_FORMAT_MAP: Record<string, string> = {
  standard: "Standard",
  pioneer: "Pioneer",
  modern: "Modern",
  legacy: "Legacy",
  vintage: "Vintage",
  commander: "Commander",
  alchemy: "Alchemy",
  historic: "Historic",
  brawl: "Brawl",
  historicbrawl: "Brawl",
  timeless: "Timeless",
  oathbreaker: "Oathbreaker",
};

function scryfallFormats(legalities?: Record<string, string>): string[] {
  const matched = new Set<string>();
  for (const [key, status] of Object.entries(legalities ?? {})) {
    if (status !== "legal" && status !== "restricted") continue;
    const label = SCRYFALL_FORMAT_MAP[key];
    if (label) matched.add(label);
  }
  return FORMATS.filter((f) => matched.has(f));
}

function scryfallImage(card: ScryfallCard): string {
  if (card.image_uris?.png) return card.image_uris.png;
  if (card.image_uris?.normal) return card.image_uris.normal;
  const face = card.card_faces?.[0];
  return face?.image_uris?.png ?? face?.image_uris?.normal ?? "";
}

function scryfallBackImage(card: ScryfallCard): string {
  if (!card.card_faces || card.card_faces.length < 2) return "";
  const back = card.card_faces[1];
  return back.image_uris?.png ?? back.image_uris?.normal ?? "";
}

function populateFormFromScryfall(card: ScryfallCard) {
  const face = card.card_faces?.[0];
  return {
    ...BLANK_FORM,
    name: card.name,
    set: card.set_name,
    setCode: card.set.toUpperCase(),
    collectorNumber: card.collector_number ?? "",
    rarity: scryfallRarity(card.rarity),
    type: scryfallType(card.type_line ?? face?.type_line),
    color: scryfallColor(scryfallCardColors(card)),
    colorIdentity: scryfallColorIdentity(card),
    manaCost: card.mana_cost ?? face?.mana_cost ?? "",
    cmc: card.cmc !== undefined ? String(Math.round(card.cmc)) : "",
    power: card.power ?? face?.power ?? "",
    toughness: card.toughness ?? face?.toughness ?? "",
    oracleText: card.oracle_text ?? face?.oracle_text ?? "",
    imageUrl: scryfallImage(card),
    backImageUrl: scryfallBackImage(card),
    formats: scryfallFormats(card.legalities),
    price: card.prices?.usd ?? card.prices?.usd_foil ?? "",
    marketPrice: card.prices?.usd ?? card.prices?.usd_foil ?? "",
    backName: card.card_faces?.[1]?.name ?? "",
    backType: card.card_faces?.[1]?.type_line ?? "",
    backManaCost: card.card_faces?.[1]?.mana_cost ?? "",
    backOracleText: card.card_faces?.[1]?.oracle_text ?? "",
    backPower: card.card_faces?.[1]?.power ?? "",
    backToughness: card.card_faces?.[1]?.toughness ?? "",
  };
}

async function fetchAllPrints(name: string, setCode?: string): Promise<ScryfallCard[]> {
  const escaped = name.replace(/"/g, '\\"');
  const setClause = setCode ? `+e:${setCode.toLowerCase()}` : "";
  let url: string | null =
    `https://api.scryfall.com/cards/search?q=${encodeURIComponent(`!"${escaped}"${setClause}`)}&unique=prints&order=released&dir=desc`;
  const cards: ScryfallCard[] = [];

  while (url) {
    const res: Response = await fetch(url);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error("Search failed");
    const data = await res.json();
    cards.push(...(data.data ?? []));
    url = data.has_more ? data.next_page : null;
  }

  return cards;
}

async function fetchCardsInSet(setCode: string): Promise<ScryfallCard[]> {
  let url: string | null =
    `https://api.scryfall.com/cards/search?q=${encodeURIComponent(`e:${setCode.toLowerCase()}`)}&order=name&unique=prints`;
  const cards: ScryfallCard[] = [];

  while (url) {
    const res: Response = await fetch(url);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error("Set search failed");
    const data = await res.json();
    cards.push(...(data.data ?? []));
    url = data.has_more ? data.next_page : null;
  }

  return cards;
}

// ── Constants matching the shop filter sidebar ────────────────────────────────
const CONDITIONS: Condition[] = ["NM", "LP", "MP", "HP", "DMG"];
const CARD_COLORS: { code: CardColor; label: string }[] = [
  { code: "W", label: "White" },
  { code: "U", label: "Blue" },
  { code: "B", label: "Black" },
  { code: "R", label: "Red" },
  { code: "G", label: "Green" },
  { code: "Multi", label: "Multicolor" },
  { code: "Colorless", label: "Colorless" },
];
const IDENTITY_OPTIONS = [
  { code: "W", ms: "ms-w" },
  { code: "U", ms: "ms-u" },
  { code: "B", ms: "ms-b" },
  { code: "R", ms: "ms-r" },
  { code: "G", ms: "ms-g" },
  { code: "C", ms: "ms-c" },
];
const RARITIES: Rarity[] = ["Common", "Uncommon", "Rare", "Mythic Rare", "Land", "Special"];
const TYPES: CardType[] = ["Creature", "Instant", "Sorcery", "Enchantment", "Artifact", "Planeswalker", "Land", "Battle", "Kindred", "Legendary"];
const EDITIONS = [
  "Final Fantasy",
  "Edge of Eternities",
  "Marvel's Spider-Man",
  "Avatar: The Last Airbender",
  "Lorwyn Eclipsed",
  "Teenage Mutant Ninja Turtles",
  "Secrets of Strixhaven",
  "Marvel Super Heroes",
  "Bloomburrow",
  "Duskmourn",
  "Foundations",
];
const PT_OPTIONS = ["", "*", ...Array.from({ length: 17 }, (_, i) => String(i))];
const CMC_OPTIONS = Array.from({ length: 17 }, (_, i) => i);
const AVAILABILITY_OPTIONS: Availability[] = ["In Stock", "Presale"];

const BLANK_FORM = {
  name: "",
  set: "",
  setCode: "",
  collectorNumber: "",
  condition: "NM" as Condition,
  foil: false,
  price: "",
  marketPrice: "",
  quantity: "1",
  imageUrl: "",
  backImageUrl: "",
  color: "Colorless" as CardColor,
  colorIdentity: [] as string[],
  type: "Creature" as CardType,
  rarity: "Common" as Rarity,
  manaCost: "",
  power: "",
  toughness: "",
  cmc: "",
  oracleText: "",
  availability: "In Stock" as Availability,
  formats: [] as string[],
  backName: "",
  backType: "",
  backManaCost: "",
  backOracleText: "",
  backPower: "",
  backToughness: "",
};

function formatAmount(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

function toggleArr<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

function colorLabel(code: CardColor): string {
  return CARD_COLORS.find((c) => c.code === code)?.label ?? code;
}

function PrintOption({ print, frontImg, backImg, isDFC, onSelect, isSelected, onShowDetails, onOpenDetails }: {
  print: ScryfallCard;
  frontImg: string;
  backImg: string;
  isDFC: boolean;
  onSelect: () => void;
  isSelected?: boolean;
  onShowDetails?: (e: React.MouseEvent) => void;
  onOpenDetails?: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const img = flipped ? backImg : frontImg;
  return (
    <div className={`${styles.printOption} ${isSelected ? styles.printOptionSelected : ""}`}>
      <div className={styles.printOptionImgWrap}>
        {isSelected && <div className={styles.printOptionCheck}>✓</div>}
        <button type="button" className={styles.printOptionImgBtn} onClick={onSelect} onContextMenu={onShowDetails}>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={print.name} className={styles.printOptionImg} />
          ) : (
            <div className={styles.printOptionImgEmpty}>No image</div>
          )}
        </button>
        {isDFC && (
          <button
            type="button"
            className={styles.printFlipBtn}
            onClick={(e) => { e.stopPropagation(); setFlipped((v) => !v); }}
            title={flipped ? "Show front face" : "Show back face"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v6h6" />
              <path d="M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
          </button>
        )}
        {onOpenDetails && (
          <button
            type="button"
            className={styles.printDetailsBtn}
            onClick={(e) => { e.stopPropagation(); onOpenDetails(); }}
            aria-label={`Show details for ${print.name}`}
            title="Show details"
          >
            ⋯
          </button>
        )}
      </div>
      <span className={styles.printOptionSet}>
        {formatSetDisplay(print.set_name, print.set.toUpperCase(), print.collector_number)}
      </span>
      <span className={styles.printOptionMeta}>
        {scryfallRarity(print.rarity)}
        {print.prices?.usd ? ` · $${print.prices.usd}` : ""}
      </span>
    </div>
  );
}

export default function AdminInventoryPage() {
  const [inventoryView, setInventoryView] = useState<null | "cards" | "merchandise">(null);
  const [cards, setCards] = useState<SingleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMode, setAddMode] = useState<null | "choose" | "manual" | "scryfall" | "edit" | "bulk" | "pick" | "details">(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [editCard, setEditCard] = useState<SingleCard | null>(null);
  const [saving, setSaving] = useState(false);
  const [cardQueue, setCardQueue] = useState<typeof BLANK_FORM[]>([]);
  const [savingAll, setSavingAll] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SingleCard | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [bulkPriceEdits, setBulkPriceEdits] = useState<Record<string, string>>({});
  const [previewCard, setPreviewCard] = useState<SingleCard | null>(null);
  const [previewFlipped, setPreviewFlipped] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState<{ updated: number; failed: number } | null>(null);
  const [autoDiscount, setAutoDiscount] = useState(true);
  const [pickContextMenu, setPickContextMenu] = useState<{ x: number; y: number; card: ScryfallCard } | null>(null);
  const [pickDetailCard, setPickDetailCard] = useState<ScryfallCard | null>(null);
  const [sfCollectorNumber, setSfCollectorNumber] = useState("");
  const [setNumLoading, setSetNumLoading] = useState(false);
  const [setNumError, setSetNumError] = useState<string | null>(null);
  const sfCollectorRef = useRef<HTMLInputElement>(null);

  // ── Pick-then-Details flow ──────────────────────────────────────────────────
  const [pickQueue, setPickQueue] = useState<ScryfallCard[]>([]);
  const [pickQueueQty, setPickQueueQty] = useState<Record<string, number>>({});
  type DetailForm = typeof BLANK_FORM & { _sfCard: ScryfallCard; _autoDiscount: boolean };
  const [detailForms, setDetailForms] = useState<DetailForm[]>([]);

  // ── Scryfall search ──────────────────────────────────────────────────────────
  const [sfQuery, setSfQuery] = useState("");
  const [sfSetFilter, setSfSetFilter] = useState("");
  const [showSetPicker, setShowSetPicker] = useState(false);
  const [allSets, setAllSets] = useState<{ code: string; name: string; set_type: string }[]>([]);
  const [setPickerSearch, setSetPickerSearch] = useState("");
  const [setsLoading, setSetsLoading] = useState(false);
  const [starredSets, setStarredSets] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("kitsune_starred_sets") ?? "[]"); } catch { return []; }
  });
  const [sfSuggestions, setSfSuggestions] = useState<string[]>([]);
  const [sfPrints, setSfPrints] = useState<ScryfallCard[]>([]);
  const [sfCard, setSfCard] = useState<ScryfallCard | null>(null);
  const [sfLoading, setSfLoading] = useState(false);
  const [sfError, setSfError] = useState<string | null>(null);
  const [sfOpen, setSfOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const sfDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addMode === "scryfall") {
      setTimeout(() => sfInputRef.current?.focus(), 50);
    }
  }, [addMode]);

  function onSfQueryChange(val: string, isPickMode = false) {
    setSfQuery(val);
    setSfCard(null);
    setSfError(null);
    if (sfDebounce.current) clearTimeout(sfDebounce.current);
    if (val.length < 2) {
      setSfSuggestions([]);
      setSfOpen(false);
      if (isPickMode) setSfPrints([]);
      return;
    }
    sfDebounce.current = setTimeout(async () => {
      if (isPickMode) {
        setSfLoading(true);
        try {
          const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(val)}&unique=cards&order=name`);
          if (res.ok) {
            const data = await res.json();
            setSfPrints(data.data ?? []);
          } else {
            setSfPrints([]);
          }
        } catch { setSfPrints([]); }
        setSfLoading(false);
      } else {
        try {
          const res = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(val)}`);
          const data = await res.json();
          setSfSuggestions(data.data?.slice(0, 8) ?? []);
          setSfOpen(true);
        } catch { setSfSuggestions([]); }
      }
    }, 300);
  }

  function applySfCard(card: ScryfallCard) {
    setSfCard(card);
    setSfPrints([]);
    setForm(populateFormFromScryfall(card));
  }

  async function openSetPicker() {
    setShowSetPicker(true);
    setSetPickerSearch("");
    if (allSets.length > 0) return;
    setSetsLoading(true);
    try {
      const res = await fetch("https://api.scryfall.com/sets");
      const data = await res.json();
      setAllSets(data.data ?? []);
    } catch { /* ignore */ }
    setSetsLoading(false);
  }

  function toggleStarSet(code: string) {
    setStarredSets((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
      localStorage.setItem("kitsune_starred_sets", JSON.stringify(next));
      return next;
    });
  }

  async function fetchPrintsForSet() {
    const setCode = sfSetFilter.trim();
    if (!setCode) return;
    setSfSuggestions([]);
    setSfOpen(false);
    setSfLoading(true);
    setSfError(null);
    setSfCard(null);
    setSfPrints([]);
    try {
      const cards = await fetchCardsInSet(setCode);
      if (cards.length === 0) { setSfError(`No cards found for set "${setCode}".`); return; }
      setSfPrints(cards);
    } catch {
      setSfError("Failed to fetch set. Check the set code and try again.");
    } finally {
      setSfLoading(false);
    }
  }

  async function fetchPrintsForName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    setSfQuery(trimmed);
    setSfSuggestions([]);
    setSfOpen(false);
    setSfLoading(true);
    setSfError(null);
    setSfCard(null);
    setSfPrints([]);

    try {
      const setCode = sfSetFilter.trim() || undefined;
      let prints = await fetchAllPrints(trimmed, setCode);

      if (prints.length === 0 && !setCode) {
        const res = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(trimmed)}`);
        if (res.ok) prints = [await res.json()];
      }

      if (prints.length === 0) {
        setSfError("No printings found for that card.");
        return;
      }

      if (prints.length === 1) {
        applySfCard(prints[0]);
      } else {
        setSfPrints(prints);
      }
    } catch {
      setSfError("Failed to fetch printings from Scryfall.");
    } finally {
      setSfLoading(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const visibleIds = displayCards.map((c) => c.id);
    const allVisible = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
    if (allVisible) {
      setSelected((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => new Set(Array.from(prev).concat(visibleIds)));
    }
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    setBulkDeleting(true);
    await Promise.all(
      Array.from(selected).map((id) => fetch(`/api/admin/inventory/${id}`, { method: "DELETE" }))
    );
    setCards((prev) => prev.filter((c) => !selected.has(c.id)));
    setSelected(new Set());
    setBulkDeleting(false);
  }

  async function bulkSetVisibility(hidden: boolean) {
    if (selected.size === 0) return;
    setBulkUpdating(true);
    await Promise.all(
      Array.from(selected).map((id) =>
        fetch(`/api/admin/inventory/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hidden }),
        })
      )
    );
    setCards((prev) => prev.map((c) => selected.has(c.id) ? { ...c, hidden } : c));
    setBulkUpdating(false);
  }

  function openBulkPriceModal() {
    const edits: Record<string, string> = {};
    cards.forEach((c) => {
      if (selected.has(c.id)) edits[c.id] = String(c.price);
    });
    setBulkPriceEdits(edits);
    setShowBulkPriceModal(true);
  }

  async function saveAllPrices() {
    setBulkUpdating(true);
    const updates = Object.entries(bulkPriceEdits).map(([id, val]) => {
      const price = parseFloat(val);
      if (isNaN(price) || price < 0) return null;
      return fetch(`/api/admin/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      }).then((r) => r.ok ? { id, price } : null);
    }).filter(Boolean) as Promise<{ id: string; price: number } | null>[];
    const results = await Promise.all(updates);
    setCards((prev) => prev.map((c) => {
      const result = results.find((r) => r?.id === c.id);
      return result ? { ...c, price: result.price } : c;
    }));
    setShowBulkPriceModal(false);
    setBulkPriceEdits({});
    setBulkUpdating(false);
  }

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/inventory");
    const data = await res.json();
    setCards(data);
    setLoading(false);
  }, []);

  // Load full inventory when entering the cards view; also load once on mount
  // so the hub card can show the correct count without opening the section.
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (inventoryView === "cards") load(); }, [load, inventoryView]);

  // ── Inventory filter/sort state ──────────────────────────────────────────────
  const [invSearch, setInvSearch] = useState("");
  const [invRarity, setInvRarity] = useState("");
  const [invCondition, setInvCondition] = useState("");
  const [invFoil, setInvFoil] = useState<"" | "foil" | "nonfoil">("");
  const [invVisibility, setInvVisibility] = useState<"" | "live" | "hidden" | "out-of-stock" | "overpriced" | "underpriced">("");
  const [invSort, setInvSort] = useState<"name-asc" | "name-desc" | "price-asc" | "price-desc" | "market-asc" | "market-desc" | "qty-asc" | "qty-desc" | "rarity">("name-asc");

  const displayCards = useMemo(() => {
    let list = [...cards];
    if (invSearch) {
      const q = invSearch.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.set.toLowerCase().includes(q) || c.setCode.toLowerCase().includes(q));
    }
    if (invRarity) list = list.filter((c) => normalizeRarity(c.rarity) === invRarity);
    if (invCondition) list = list.filter((c) => c.condition === invCondition);
    if (invFoil === "foil") list = list.filter((c) => c.foil);
    if (invFoil === "nonfoil") list = list.filter((c) => !c.foil);
    if (invVisibility === "live") list = list.filter((c) => !c.hidden && c.quantity > 0);
    if (invVisibility === "hidden") list = list.filter((c) => !!c.hidden);
    if (invVisibility === "out-of-stock") list = list.filter((c) => c.quantity === 0);
    if (invVisibility === "overpriced") list = list.filter((c) => c.marketPrice !== undefined && c.marketPrice < c.price);
    if (invVisibility === "underpriced") list = list.filter((c) => c.marketPrice !== undefined && c.marketPrice > c.price);
    if (invSort === "market-desc") list = list.filter((c) => c.marketPrice !== undefined && c.marketPrice < c.price);
    if (invSort === "market-asc") list = list.filter((c) => c.marketPrice !== undefined && c.marketPrice > c.price);
    list.sort((a, b) => {
      switch (invSort) {
        case "name-asc":    return a.name.localeCompare(b.name);
        case "name-desc":   return b.name.localeCompare(a.name);
        case "price-asc":   return a.price - b.price;
        case "price-desc":  return b.price - a.price;
        case "market-asc":  return (b.marketPrice! - b.price) - (a.marketPrice! - a.price);
        case "market-desc": return (b.price - b.marketPrice!) - (a.price - a.marketPrice!);
        case "qty-asc":     return a.quantity - b.quantity;
        case "qty-desc":    return b.quantity - a.quantity;
        case "rarity": {
          const order = ["Common","Uncommon","Rare","Mythic Rare","Land","Special"];
          return order.indexOf(normalizeRarity(a.rarity)) - order.indexOf(normalizeRarity(b.rarity));
        }
        default: return 0;
      }
    });
    return list;
  }, [cards, invSearch, invRarity, invCondition, invFoil, invVisibility, invSort]);

  const totalValue = cards.reduce((s, c) => s + c.price * c.quantity, 0);
  const totalQty = cards.reduce((s, c) => s + c.quantity, 0);
  const setsCount = EDITIONS.length;

  const allSelected = displayCards.length > 0 && displayCards.every((c) => selected.has(c.id));
  const someSelected = displayCards.some((c) => selected.has(c.id)) && !allSelected;

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/inventory/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setCards((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  // ── Edit Card ────────────────────────────────────────────────────────────────
  function startEdit(card: SingleCard) {
    setForm({
      name: card.name,
      set: card.set,
      setCode: card.setCode ?? "",
      collectorNumber: card.collectorNumber ?? "",
      condition: card.condition,
      foil: card.foil,
      price: String(card.price),
      marketPrice: card.marketPrice !== undefined ? String(card.marketPrice) : "",
      quantity: String(card.quantity),
      imageUrl: card.imageUrl ?? "",
      backImageUrl: card.backImageUrl ?? "",
      color: card.color,
      colorIdentity: card.colorIdentity ?? [],
      type: card.type,
      rarity: card.rarity,
      manaCost: card.manaCost ?? "",
      power: card.power ?? "",
      toughness: card.toughness ?? "",
      cmc: card.cmc !== undefined ? String(card.cmc) : "",
      oracleText: card.oracleText ?? "",
      availability: card.availability ?? "In Stock",
      formats: card.formats ?? [],
      backName: card.backName ?? "",
      backType: card.backType ?? "",
      backManaCost: card.backManaCost ?? "",
      backOracleText: card.backOracleText ?? "",
      backPower: card.backPower ?? "",
      backToughness: card.backToughness ?? "",
    });
    setEditCard(card);
    setError(null);
    setAddMode("edit");
  }

  // ── Add Card ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.set.trim() || !form.price || !form.quantity) {
      setError("Name, Edition, Price and Quantity are required.");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price),
      marketPrice: form.marketPrice !== "" ? parseFloat(form.marketPrice) : undefined,
      quantity: parseInt(form.quantity, 10),
      cmc: form.cmc !== "" ? parseInt(form.cmc, 10) : undefined,
      setCode: form.setCode || form.set.slice(0, 3).toUpperCase(),
      formats: form.formats,
      backName: form.backName || undefined,
      backType: form.backType || undefined,
      backManaCost: form.backManaCost || undefined,
      backOracleText: form.backOracleText || undefined,
      backPower: form.backPower || undefined,
      backToughness: form.backToughness || undefined,
    };

    if (addMode === "edit" && editCard) {
      const res = await fetch(`/api/admin/inventory/${editCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setCards((prev) => prev.map((c) => c.id === editCard.id ? updated : c));
        setAddMode(null);
        setEditCard(null);
        setForm({ ...BLANK_FORM });
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to update card.");
      }
      setSaving(false);
      return;
    }

    const res = await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const newCard = await res.json();
      setCards((prev) => [...prev, newCard]);
      setAddMode(null);
      setForm({ ...BLANK_FORM });
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to save card.");
    }
    setSaving(false);
  }

  function set<K extends keyof typeof BLANK_FORM>(key: K, value: (typeof BLANK_FORM)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addToQueue() {
    setError(null);
    if (!form.name.trim() || !form.set.trim() || !form.price || !form.quantity) {
      setError("Name, Edition, Price and Quantity are required before queuing.");
      return;
    }
    setCardQueue((prev) => [...prev, { ...form }]);
    // Reset form but keep condition/foil/availability for convenience
    setForm({ ...BLANK_FORM, condition: form.condition, foil: form.foil, availability: form.availability });
    setSfCard(null);
    setSfPrints([]);
    setSfQuery("");
    setSfSetFilter("");
    setAdvancedOpen(false);
    setAutoDiscount(true);
  }

  function removeFromQueue(index: number) {
    setCardQueue((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveAllQueued() {
    if (cardQueue.length === 0) return;
    setSavingAll(true);
    setError(null);
    try {
      const results = await Promise.all(
        cardQueue.map((entry) => {
          const payload = {
            ...entry,
            price: parseFloat(entry.price),
            marketPrice: entry.marketPrice !== "" ? parseFloat(entry.marketPrice) : undefined,
            quantity: parseInt(entry.quantity, 10),
            cmc: entry.cmc !== "" ? parseInt(entry.cmc, 10) : undefined,
            setCode: entry.setCode || entry.set.slice(0, 3).toUpperCase(),
          };
          return fetch("/api/admin/inventory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then((r) => r.ok ? r.json() : null);
        })
      );
      const saved = results.filter(Boolean);
      setCards((prev) => [...prev, ...saved]);
      setCardQueue([]);
      setAddMode(null);
      setForm({ ...BLANK_FORM });
    } catch {
      setError("Failed to save some cards. Please try again.");
    }
    setSavingAll(false);
  }

  const showAddForm = addMode === "manual" || (addMode === "scryfall" && !!sfCard);
  const showImportedLayout = addMode === "scryfall" && !!sfCard;

  function applyDiscountedPrice(marketStr: string, discount: boolean) {
    const market = parseFloat(marketStr);
    if (isNaN(market)) return;
    const listing = discount ? (market * 0.85).toFixed(2) : marketStr;
    set("price", listing);
  }

  function setFinish(foil: boolean) {
    set("foil", foil);
    if (!sfCard) return;
    const market = foil
      ? (sfCard.prices?.usd_foil ?? sfCard.prices?.usd)
      : (sfCard.prices?.usd ?? sfCard.prices?.usd_foil);
    if (market) {
      set("marketPrice", market);
      applyDiscountedPrice(market, autoDiscount);
    }
  }

  function toggleAutoDiscount(on: boolean) {
    setAutoDiscount(on);
    if (form.marketPrice) applyDiscountedPrice(form.marketPrice, on);
  }

  function resetImportSearch() {
    setSfCard(null);
    setSfPrints([]);
    setSfQuery("");
    setSfSetFilter("");
    setForm({ ...BLANK_FORM });
    setAdvancedOpen(false);
    setAutoDiscount(false);
  }

  function backToPrintPicker() {
    setSfCard(null);
    setForm({ ...BLANK_FORM });
    setAdvancedOpen(false);
    setAutoDiscount(false);
  }

  // ── Pick-then-Details helpers ────────────────────────────────────────────────
  function toggleSfCardInPick(card: ScryfallCard) {
    setPickQueue((prev) => {
      const idx = prev.findIndex((c) => c.id === card.id);
      if (idx >= 0) {
        setPickQueueQty((q) => { const next = { ...q }; delete next[card.id]; return next; });
        return prev.filter((_, i) => i !== idx);
      }
      setPickQueueQty((q) => ({ ...q, [card.id]: 1 }));
      return [...prev, card];
    });
  }

  function removeFromPickQueue(index: number) {
    setPickQueue((prev) => {
      const card = prev[index];
      if (card) setPickQueueQty((q) => { const next = { ...q }; delete next[card.id]; return next; });
      return prev.filter((_, i) => i !== index);
    });
  }

  async function fetchBySetAndNumber() {
    const set = sfSetFilter.trim().toLowerCase();
    const num = sfCollectorNumber.trim();
    if (!set || !num) { setSetNumError("Enter both a set code and collector number."); return; }
    setSetNumLoading(true);
    setSetNumError(null);
    try {
      const res = await fetch(`https://api.scryfall.com/cards/${encodeURIComponent(set)}/${encodeURIComponent(num)}`);
      if (!res.ok) { setSetNumError(`Card not found: ${set.toUpperCase()} #${num}`); return; }
      const card: ScryfallCard = await res.json();
      setPickQueue((prev) => {
        if (prev.some((c) => c.id === card.id)) return prev;
        setPickQueueQty((q) => ({ ...q, [card.id]: 1 }));
        return [...prev, card];
      });
      setSfCollectorNumber("");
      sfCollectorRef.current?.focus();
    } catch {
      setSetNumError("Failed to fetch card. Check set code and collector number.");
    } finally {
      setSetNumLoading(false);
    }
  }

  function startDetails() {
    const forms: DetailForm[] = pickQueue.map((card) => {
      const base = populateFormFromScryfall(card);
      const market = base.marketPrice ? parseFloat(base.marketPrice) : NaN;
      const price = !isNaN(market) ? (market * 0.85).toFixed(2) : base.price;
      const quantity = String(pickQueueQty[card.id] ?? 1);
      return { ...base, price, quantity, _sfCard: card, _autoDiscount: !isNaN(market) };
    });
    setDetailForms(forms);
    setAddMode("details");
  }

  function updateDetailForm(index: number, key: keyof typeof BLANK_FORM, value: (typeof BLANK_FORM)[keyof typeof BLANK_FORM]) {
    setDetailForms((prev) => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
    if (key === "price") setError(null);
  }

  function removeDetailForm(index: number) {
    const removed = detailForms[index];
    if (!removed) return;

    setDetailForms((prev) => prev.filter((_, i) => i !== index));
    setPickQueue((prev) => prev.filter((card) => card.id !== removed._sfCard.id));
    setPickQueueQty((prev) => {
      const next = { ...prev };
      delete next[removed._sfCard.id];
      return next;
    });
    setError(null);

    if (detailForms.length === 1) {
      setAddMode("pick");
    }
  }

  function setDetailFinish(index: number, foil: boolean) {
    setDetailForms((prev) => prev.map((f, i) => {
      if (i !== index) return f;
      const card = f._sfCard;
      const marketStr = foil
        ? (card.prices?.usd_foil ?? card.prices?.usd)
        : (card.prices?.usd ?? card.prices?.usd_foil);
      const updated: DetailForm = { ...f, foil };
      if (marketStr) {
        updated.marketPrice = marketStr;
        if (f._autoDiscount) updated.price = (parseFloat(marketStr) * 0.85).toFixed(2);
      }
      return updated;
    }));
  }

  async function saveAllDetails() {
    setError(null);
    const missingPrice = detailForms.find(
      (entry) =>
        entry.price.trim() === "" ||
        !Number.isFinite(Number(entry.price)) ||
        Number(entry.price) < 0
    );
    if (missingPrice) {
      setError(`Price is required for ${missingPrice.name}.`);
      return;
    }
    if (detailForms.length === 0) return;

    setSavingAll(true);
    try {
      const results = await Promise.all(
        detailForms.map((entry) => {
          const payload = {
            name: entry.name, set: entry.set, setCode: entry.setCode || entry.set.slice(0, 3).toUpperCase(),
            collectorNumber: entry.collectorNumber, condition: entry.condition, foil: entry.foil,
            price: parseFloat(entry.price),
            marketPrice: entry.marketPrice !== "" ? parseFloat(entry.marketPrice) : undefined,
            quantity: parseInt(entry.quantity, 10),
            imageUrl: entry.imageUrl, backImageUrl: entry.backImageUrl, color: entry.color,
            colorIdentity: entry.colorIdentity, type: entry.type, rarity: entry.rarity,
            manaCost: entry.manaCost, cmc: entry.cmc !== "" ? parseInt(entry.cmc, 10) : undefined,
            power: entry.power, toughness: entry.toughness, oracleText: entry.oracleText,
            availability: entry.availability, formats: entry.formats,
            backName: entry.backName || undefined, backType: entry.backType || undefined,
            backManaCost: entry.backManaCost || undefined, backOracleText: entry.backOracleText || undefined,
            backPower: entry.backPower || undefined, backToughness: entry.backToughness || undefined,
          };
          return fetch("/api/admin/inventory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then((r) => r.ok ? r.json() : null);
        })
      );
      const saved = results.filter(Boolean);
      setCards((prev) => [...prev, ...saved]);
      setPickQueue([]);
      setPickQueueQty({});
      setDetailForms([]);
      setAddMode(null);
      setForm({ ...BLANK_FORM });
    } catch {
      setError("Failed to save some cards. Please try again.");
    }
    setSavingAll(false);
  }

  // ── Inventory hub picker ────────────────────────────────────────────────────
  if (inventoryView === null) {
    return (
      <div className={styles.page}>
        <div className={styles.hubHeader}>
          <h1 className={styles.title}>Inventory</h1>
          <p className={styles.subtitle}>Select a section to manage</p>
        </div>
        <div className={styles.hubGrid}>
          {/* Card Inventory */}
          <button className={styles.hubCard} onClick={() => setInventoryView("cards")}>
            <div className={styles.hubCardTop}>
              <div className={styles.hubCardIcon}>
                <svg width="24" height="24" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <rect x="5" y="6" width="22" height="30" rx="2" stroke="currentColor" strokeWidth="2" />
                  <rect x="13" y="4" width="22" height="30" rx="2" stroke="currentColor" strokeWidth="2" fill="var(--color-white,#fff)" />
                  <line x1="18" y1="13" x2="30" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="18" y1="18" x2="30" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="18" y1="23" x2="26" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className={styles.hubCardBody}>
              <span className={styles.hubCardLabel}>Card Inventory</span>
              <span className={styles.hubCardDesc}>Add singles via Scryfall search, manage prices, conditions, and stock quantities for the online shop.</span>
            </div>
            <div className={styles.hubCardFooter}>
              <div className={styles.hubCardMeta}>
                <span className={styles.hubCardStatNum}>{totalQty > 0 ? totalQty.toLocaleString() : cards.length > 0 ? cards.length : "0"}</span>
                <span className={styles.hubCardStatLabel}>cards in stock</span>
              </div>
              <span className={styles.hubCardCta}>Open →</span>
            </div>
          </button>

          {/* Merchandise — coming soon */}
          <div className={styles.hubCardDisabled}>
            <div className={styles.hubCardTop}>
              <div className={styles.hubCardIcon}>
                <svg width="24" height="24" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <rect x="4" y="18" width="32" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 18v-4a8 8 0 0 1 16 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="4" y1="26" x2="36" y2="26" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </div>
            </div>
            <div className={styles.hubCardBody}>
              <span className={styles.hubCardLabel}>Merchandise</span>
              <span className={styles.hubCardDesc}>List apparel, accessories, and other store goods for sale on the site.</span>
            </div>
            <div className={styles.hubCardFooter}>
              <div className={styles.hubCardMeta}>
                <span className={styles.hubCardStatNum}>—</span>
                <span className={styles.hubCardStatLabel}>items listed</span>
              </div>
              <span className={styles.hubComingSoonBadge}>Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Merchandise placeholder ─────────────────────────────────────────────────
  if (inventoryView === "merchandise") {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <button className={styles.backBtn} onClick={() => setInventoryView(null)}>← Inventory</button>
            <h1 className={styles.title}>Merchandise</h1>
            <p className={styles.subtitle}>Apparel, accessories, and store goods</p>
          </div>
        </div>
        <div className={styles.merchandisePlaceholder}>
          <div className={styles.merchandisePlaceholderIcon}>
            <svg width="56" height="56" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <rect x="4" y="18" width="32" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M12 18v-4a8 8 0 0 1 16 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4" y1="26" x2="36" y2="26" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </div>
          <h2 className={styles.merchandisePlaceholderTitle}>Merchandise Inventory</h2>
          <p className={styles.merchandisePlaceholderDesc}>
            This section is coming soon. You&apos;ll be able to list merchandise items for sale on the site — apparel, accessories, and other store goods.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <button className={styles.backBtn} onClick={() => setInventoryView(null)}>← Inventory</button>
          <h1 className={styles.title}>Card Inventory</h1>
          <p className={styles.subtitle}>{cards.length} unique cards · {totalQty} total copies</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.refreshWrap}>
            <button
              className={`btn btn-outline ${styles.refreshBtn}`}
              disabled={refreshing}
              title="Fetch latest Scryfall market prices for all cards"
              onClick={async () => {
                setRefreshing(true);
                setRefreshResult(null);
                const res = await fetch("/api/admin/inventory/refresh-prices", { method: "POST" });
                if (res.ok) {
                  const data = await res.json();
                  setRefreshResult(data);
                  await load();
                }
                setRefreshing(false);
              }}
            >
              {refreshing ? (
                <><span className={styles.spinIcon}>⟳</span> Refreshing…</>
              ) : "↻ Refresh Prices"}
            </button>
            {refreshResult && (
              <span className={styles.refreshResult}>
                Updated {refreshResult.updated} · {refreshResult.failed} failed
              </span>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => setAddMode("choose")}>
            + Add Cards
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatsCard label="Unique Cards" value={cards.length} subtext="individual listings" accent />
        <StatsCard label="Total Copies" value={totalQty} subtext="cards in stock" />
        <StatsCard label="Estimated Value" value={`$${totalValue.toFixed(2)}`} subtext="at listed prices" />
        <StatsCard label="Sets Represented" value={setsCount} subtext="across inventory" />
      </div>

      <section className={styles.inventoryPanel}>
        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className={styles.bulkBar}>
            <span className={styles.bulkCount}>{selected.size} card{selected.size !== 1 ? "s" : ""} selected</span>
            <div className={styles.bulkActions}>
              <button className={`btn btn-outline ${styles.bulkDeselectBtn}`} onClick={() => setSelected(new Set())} disabled={bulkDeleting || bulkUpdating}>
                Deselect All
              </button>
              {selected.size === 1 && (
                <button
                  className={`btn btn-outline ${styles.editBtn}`}
                  disabled={bulkDeleting || bulkUpdating}
                  onClick={() => {
                    const id = Array.from(selected)[0];
                    const card = cards.find((c) => c.id === id);
                    if (card) startEdit(card);
                  }}
                >
                  Edit
                </button>
              )}
              <button
                className={`btn btn-outline ${styles.bulkVisBtn}`}
                disabled={bulkDeleting || bulkUpdating}
                onClick={() => bulkSetVisibility(false)}
              >
                {bulkUpdating ? "…" : "Mark Live"}
              </button>
              <button
                className={`btn btn-outline ${styles.bulkVisBtn}`}
                disabled={bulkDeleting || bulkUpdating}
                onClick={() => bulkSetVisibility(true)}
              >
                {bulkUpdating ? "…" : "Mark Hidden"}
              </button>
              <button
                className={`btn btn-outline ${styles.bulkVisBtn}`}
                disabled={bulkDeleting || bulkUpdating}
                onClick={openBulkPriceModal}
              >
                Edit Prices
              </button>
              <button className={`btn btn-primary ${styles.dangerBtn}`} onClick={bulkDelete} disabled={bulkDeleting || bulkUpdating}>
                {bulkDeleting ? "Deleting…" : `Delete ${selected.size}`}
              </button>
            </div>
          </div>
        )}

        {/* Filter / Sort Bar */}
        <div className={styles.invFilterBar}>
          <input
            className={styles.invSearch}
            placeholder="Search cards by name or set…"
            value={invSearch}
            onChange={(e) => setInvSearch(e.target.value)}
          />
          <select className={styles.invSelect} value={invCondition} onChange={(e) => setInvCondition(e.target.value)}>
            <option value="">All Conditions</option>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className={styles.invSelect} value={invFoil} onChange={(e) => setInvFoil(e.target.value as "" | "foil" | "nonfoil")}>
            <option value="">Foil + Non-foil</option>
            <option value="foil">Foil Only</option>
            <option value="nonfoil">Non-foil Only</option>
          </select>
          <select className={styles.invSelect} value={invVisibility} onChange={(e) => setInvVisibility(e.target.value as "" | "live" | "hidden" | "out-of-stock" | "overpriced" | "underpriced")}>
            <option value="">All Visibility</option>
            <option value="live">Live</option>
            <option value="hidden">Hidden</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
          <select className={styles.invSelect} value={invSort} onChange={(e) => setInvSort(e.target.value as typeof invSort)}>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="market-asc">Market ↑</option>
            <option value="market-desc">Market ↓</option>
            <option value="qty-asc">Qty ↑</option>
            <option value="qty-desc">Qty ↓</option>
            <option value="rarity">Rarity</option>
          </select>
          <button
            className={`btn btn-outline ${styles.invClearBtn}`}
            onClick={() => { setInvSearch(""); setInvRarity(""); setInvCondition(""); setInvFoil(""); setInvVisibility(""); setInvSort("name-asc"); }}
          >
            Clear
          </button>
          <span className={styles.invCount}>Showing {displayCards.length} of {cards.length}</span>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <span className={styles.checkCell}>
            <input
              type="checkbox"
              className={styles.rowCheck}
              checked={allSelected}
              ref={(el) => { if (el) el.indeterminate = someSelected; }}
              onChange={toggleSelectAll}
              aria-label="Select all"
            />
          </span>
          <span></span>{/* thumbnail */}
          <span>Card Name</span>
          <span className={styles.colCenter}>Set</span>
          <span className={styles.colCenter}>Condition</span>
          <span className={styles.colCenter}>Foil</span>
          <span className={styles.colCenter}>Rarity</span>
          <span className={styles.colCenter}>Listed</span>
          <span className={styles.colCenter}>−15% Market</span>
          <span className={styles.colCenter}>Market</span>
          <span className={styles.colCenter}>Qty</span>
          <span className={styles.colCenter}>Visibility</span>
        </div>
        {loading ? (
          <div className={styles.emptyState}>Loading…</div>
        ) : displayCards.length === 0 ? (
          <div className={styles.emptyState}>{cards.length === 0 ? "No cards in inventory. Add one to get started." : "No cards match your filters."}</div>
        ) : (
          displayCards.map((card) => (
            <div
              key={card.id}
              className={`${styles.tableRow} ${selected.has(card.id) ? styles.tableRowSelected : ""}`}
            >
              <span className={styles.checkCell}>
                <input
                  type="checkbox"
                  className={styles.rowCheck}
                  checked={selected.has(card.id)}
                  onChange={() => toggleSelect(card.id)}
                  aria-label={`Select ${card.name}`}
                />
              </span>
              <span className={styles.thumbCell} onClick={() => { setPreviewCard(card); setPreviewFlipped(false); }}>
                {card.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.imageUrl} alt={card.name} className={styles.thumb} />
                ) : (
                  <span className={styles.thumbEmpty}>?</span>
                )}
              </span>
              <span className={styles.cardName} data-label="Card">{card.name}</span>
              <span className={styles.setCode} data-label="Set">
                {formatSetDisplay(card.set, card.setCode, card.collectorNumber)}
              </span>
              <span className={styles.condition} data-label="Condition">{card.condition}</span>
              <span className={styles.foil} data-label="Finish">
                {card.foil && <span className={styles.foilYes}>Foil</span>}
              </span>
              <span className={styles.rarityCell} data-label="Rarity">
                <span
                  className={`${styles.rarityBadge} ${styles[`rarity_${normalizeRarity(card.rarity).replace(/\s+/g, "")}`] ?? ""}`}
                  title={normalizeRarity(card.rarity)}
                >
                  {rarityBadgeLabel(card.rarity)}
                </span>
              </span>
              <span className={styles.price} data-label="Listed Price">{formatAmount(card.price)}</span>
              <span className={styles.total} data-label="15% Below Market" title="15% below Scryfall market price">
                {card.marketPrice !== undefined ? formatAmount(card.marketPrice * 0.85) : "—"}
              </span>
              <span className={styles.total} data-label="Market Price" title="Scryfall market price">
                {card.marketPrice !== undefined ? formatAmount(card.marketPrice) : "—"}
              </span>
              <span className={`${styles.qty} ${card.quantity <= 2 ? styles.qtyLow : ""}`} data-label="Quantity">{card.quantity}</span>
              {card.quantity === 0 ? (
                <button
                  className={`${styles.visibilityBtn} ${styles.visibilityOutOfStock}`}
                  data-label="Visibility"
                  title="Add inventory quantity"
                  onClick={() => startEdit(card)}
                >
                  + Add Qty
                </button>
              ) : (
                <button
                  className={`${styles.visibilityBtn} ${card.hidden ? styles.visibilityHidden : styles.visibilityLive}`}
                  data-label="Visibility"
                  onClick={async () => {
                    const res = await fetch(`/api/admin/inventory/${card.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ hidden: !card.hidden }),
                    });
                    if (res.ok) {
                      const updated = await res.json();
                      setCards((prev) => prev.map((c) => c.id === card.id ? updated : c));
                    }
                  }}
                  title={card.hidden ? "Hidden from shop — click to make live" : "Live in shop — click to hide"}
                >
                  {card.hidden ? "Hidden" : "Live"}
                </button>
              )}
            </div>
          ))
        )}
        </div>
      </section>

      {/* ── Delete Confirm ─────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Remove Card?</h3>
            <p className={styles.confirmText}>
              This will permanently remove <strong>{deleteTarget.name}</strong> from inventory.
            </p>
            <div className={styles.confirmBtns}>
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className={`btn btn-primary ${styles.dangerBtn}`} onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Card Modal ────────────────────────────────────────────────── */}
      {addMode === "edit" && editCard && (
        <div className={styles.overlay} onClick={() => { setAddMode(null); setEditCard(null); setForm({ ...BLANK_FORM }); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit — {editCard.name}</h2>
              <button className={styles.modalClose} onClick={() => { setAddMode(null); setEditCard(null); setForm({ ...BLANK_FORM }); }}>✕</button>
            </div>
            <form className={styles.modalBody} onSubmit={handleSubmit}>
              {error && <p className={styles.formError}>{error}</p>}
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>Card Name *</label>
                  <input className={styles.input} value={form.name} onChange={(e) => set("name", e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Edition *</label>
                  <select className={styles.select} value={EDITIONS.includes(form.set) ? form.set : "__other__"} onChange={(e) => set("set", e.target.value === "__other__" ? form.set : e.target.value)} required>
                    <option value="">Select edition…</option>
                    {EDITIONS.map((ed) => <option key={ed} value={ed}>{ed}</option>)}
                    {form.set && !EDITIONS.includes(form.set) && <option value="__other__">{form.set}</option>}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Set Code</label>
                  <input className={styles.input} value={form.setCode} onChange={(e) => set("setCode", e.target.value.toUpperCase())} maxLength={6} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Card Number</label>
                  <input className={styles.input} value={form.collectorNumber} onChange={(e) => set("collectorNumber", e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Rarity *</label>
                  <select className={styles.select} value={form.rarity} onChange={(e) => set("rarity", e.target.value as Rarity)}>
                    {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Type *</label>
                  <select className={styles.select} value={form.type} onChange={(e) => set("type", e.target.value as CardType)}>
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Card Color *</label>
                  <select className={styles.select} value={form.color} onChange={(e) => set("color", e.target.value as CardColor)}>
                    {CARD_COLORS.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Color Identity</label>
                  <div className={styles.manaRow}>
                    {IDENTITY_OPTIONS.map(({ code, ms }) => (
                      <button key={code} type="button" className={`${styles.manaPip} ${form.colorIdentity.includes(code) ? styles.manaPipActive : ""}`} onClick={() => set("colorIdentity", toggleArr(form.colorIdentity, code))} aria-label={code}>
                        <i className={`ms ms-cost ${ms} ms-2x`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Condition *</label>
                  <select className={styles.select} value={form.condition} onChange={(e) => set("condition", e.target.value as Condition)}>
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c} ({formatCondition(c)})</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Availability</label>
                  <select className={styles.select} value={form.availability} onChange={(e) => set("availability", e.target.value as Availability)}>
                    <option value="In Stock">In Stock</option>
                    <option value="Presale">Presale</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Price ($) *</label>
                  <input className={styles.input} type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Quantity *</label>
                  <input className={styles.input} type="number" min="0" step="1" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} required />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <div className={styles.checkRow}>
                    <label className={`${styles.checkChip} ${form.foil ? styles.checkChipOn : ""}`}>
                      <input type="checkbox" className={styles.checkboxToggle} checked={form.foil} onChange={(e) => set("foil", e.target.checked)} /> Foil
                    </label>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Mana Cost</label>
                  <input className={styles.input} value={form.manaCost} onChange={(e) => set("manaCost", e.target.value)} placeholder="{1}{G}{G}" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Converted Cost</label>
                  <select className={styles.select} value={form.cmc} onChange={(e) => set("cmc", e.target.value)}>
                    <option value="">Any</option>
                    {CMC_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Power</label>
                  <select className={styles.select} value={form.power} onChange={(e) => set("power", e.target.value)}>
                    {PT_OPTIONS.map((v) => <option key={v} value={v}>{v === "" ? "Any" : v}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Toughness</label>
                  <select className={styles.select} value={form.toughness} onChange={(e) => set("toughness", e.target.value)}>
                    {PT_OPTIONS.map((v) => <option key={v} value={v}>{v === "" ? "Any" : v}</option>)}
                  </select>
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>Formats</label>
                  <div className={styles.checkRow}>
                    {FORMATS.map((f) => (
                      <label key={f} className={`${styles.checkChip} ${form.formats.includes(f) ? styles.checkChipOn : ""}`}>
                        <input type="checkbox" className={styles.checkboxToggle} checked={form.formats.includes(f)} onChange={() => set("formats", toggleArr(form.formats, f))} /> {f}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>Oracle Text</label>
                  <textarea className={styles.textarea} rows={3} value={form.oracleText} onChange={(e) => set("oracleText", e.target.value)} />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>Image URL</label>
                  <input className={styles.input} value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-outline" onClick={() => { setAddMode(null); setEditCard(null); setForm({ ...BLANK_FORM }); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Card Modal ─────────────────────────────────────────────────── */}
      {/* ── Mode Chooser ────────────────────────────────────────────────────── */}
      {addMode === "choose" && (
        <div className={styles.overlay} onClick={() => setAddMode(null)}>
          <div className={styles.chooser} onClick={(e) => e.stopPropagation()}>
            <div className={styles.chooserHeader}>
              <h2 className={styles.modalTitle}>Add Card</h2>
              <button className={styles.modalClose} onClick={() => setAddMode(null)}>✕</button>
            </div>
            <div className={styles.chooserOptions}>
              <button
                className={styles.chooserOption}
                onClick={() => { setPickQueue([]); setForm({ ...BLANK_FORM }); setError(null); setSfQuery(""); setSfCard(null); setSfPrints([]); setSfSuggestions([]); setSfError(null); setAdvancedOpen(false); setAddMode("pick"); }}
              >
                <span className={styles.chooserIcon}>⬡</span>
                <span className={styles.chooserOptionTitle}>Database Search</span>
                <span className={styles.chooserOptionDesc}>Search to auto-fill card details and image</span>
              </button>
              <button
                className={styles.chooserOption}
                onClick={() => { setForm({ ...BLANK_FORM }); setError(null); setAddMode("manual"); }}
              >
                <span className={styles.chooserIcon}>✎</span>
                <span className={styles.chooserOptionTitle}>Manual Entry</span>
                <span className={styles.chooserOptionDesc}>Enter all card details by hand</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Phase 1: Pick Cards ────────────────────────────────────────────── */}
      {addMode === "pick" && (
        <div className={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) { setAddMode(null); setPickQueue([]); } }}>
          <div className={styles.modal} style={{ maxWidth: 1400, width: "95vw", ...(sfPrints.length === 0 && pickQueue.length === 0 ? { height: "auto", maxHeight: "420px" } : {}) }} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {sfPrints.length > 0 && !sfCard ? `${sfQuery ? `Printings of "${sfQuery}"` : `Set ${sfSetFilter}`}` : "Select Cards"}
              </h2>
              <button className={styles.modalClose} onClick={() => { setAddMode(null); setPickQueue([]); }}>✕</button>
            </div>

            <div className={styles.pickModalLayout}>
              {/* ── Left: Search + Grid ── */}
              <div className={styles.pickModalMain}>
                {/* Search bar */}
                <div className={styles.sfSection}>
                    <p className={styles.sfLabel}>SEARCH CARDS TO ADD</p>
                    <div className={styles.sfSearchWrap}>
                      <div className={styles.sfInputWrap} style={{ flex: 1 }}>
                        <input
                          ref={sfInputRef}
                          className={styles.sfInput}
                          value={sfQuery}
                          onChange={(e) => onSfQueryChange(e.target.value, true)}
                          placeholder="Start typing a card name…"
                          autoComplete="off"
                        />
                        {sfLoading && <span className={styles.sfSpinner}>⟳</span>}
                      </div>
                      <span className={styles.sfOrDivider}>OR</span>
                      <div className={styles.sfSetWrap}>
                        <input
                          className={styles.sfSetInput}
                          value={sfSetFilter}
                          onChange={(e) => setSfSetFilter(e.target.value.toUpperCase())}
                          placeholder="Set code…"
                          maxLength={8}
                          autoComplete="off"
                          onKeyDown={(e) => { if (e.key === "Enter" && sfSetFilter && !sfQuery) fetchPrintsForSet(); }}
                        />
                        <button type="button" className={styles.setPickerBtn} onClick={openSetPicker} title="Browse all set codes">⋯</button>
                      </div>
                      {!sfLoading && sfSetFilter && !sfQuery && (
                        <button type="button" className={styles.sfFetchBtn} onClick={fetchPrintsForSet}>Browse Set</button>
                      )}
                    </div>

                    {/* Set code + collector number quick-add */}
                    <div className={styles.setNumRow}>
                      <span className={styles.setNumDividerLabel}>OR — add by set code + card number</span>
                      <div className={styles.setNumInputs}>
                        <input
                          className={styles.sfSetInput}
                          value={sfSetFilter}
                          onChange={(e) => { setSfSetFilter(e.target.value.toUpperCase()); setSetNumError(null); }}
                          placeholder="Set code…"
                          maxLength={8}
                          autoComplete="off"
                          style={{ width: 90 }}
                          onKeyDown={(e) => { if (e.key === "Enter" && sfSetFilter.trim()) { e.preventDefault(); sfCollectorRef.current?.focus(); sfCollectorRef.current?.select(); } }}
                        />
                        <span className={styles.setNumHash}>#</span>
                        <input
                          ref={sfCollectorRef}
                          className={styles.setNumInput}
                          value={sfCollectorNumber}
                          onChange={(e) => { setSfCollectorNumber(e.target.value); setSetNumError(null); }}
                          placeholder="Card number…"
                          autoComplete="off"
                          onKeyDown={(e) => { if (e.key === "Enter") fetchBySetAndNumber(); }}
                        />
                        <button
                          type="button"
                          className={styles.sfFetchBtn}
                          onClick={fetchBySetAndNumber}
                          disabled={setNumLoading || !sfSetFilter.trim() || !sfCollectorNumber.trim()}
                        >
                          {setNumLoading ? "⟳" : "Add →"}
                        </button>
                      </div>
                      {setNumError && <p className={styles.sfErr}>{setNumError}</p>}
                    </div>

                    {sfError && <p className={styles.sfErr}>{sfError}</p>}
                </div>

                {/* Set Picker Popup */}
                {showSetPicker && typeof document !== "undefined" && createPortal(
                  <div className={styles.setPickerOverlay} onClick={() => setShowSetPicker(false)}>
                    <div className={styles.setPickerPopup} onClick={(e) => e.stopPropagation()}>
                      <div className={styles.setPickerHeader}>
                        <span className={styles.setPickerTitle}>All Sets</span>
                        <button className={styles.setPickerClose} onClick={() => setShowSetPicker(false)}>✕</button>
                      </div>
                      <input
                        className={styles.setPickerSearch}
                        placeholder="Search sets…"
                        value={setPickerSearch}
                        onChange={(e) => setSetPickerSearch(e.target.value)}
                        autoFocus
                      />
                      <div className={styles.setPickerList}>
                        {setsLoading ? (
                          <p className={styles.setPickerLoading}>Loading sets…</p>
                        ) : (
                          Array.from(allSets)
                            .filter((s) =>
                              !setPickerSearch ||
                              s.code.toLowerCase().includes(setPickerSearch.toLowerCase()) ||
                              s.name.toLowerCase().includes(setPickerSearch.toLowerCase())
                            )
                            .sort((a, b) => {
                              const aS = starredSets.includes(a.code);
                              const bS = starredSets.includes(b.code);
                              if (aS && !bS) return -1;
                              if (!aS && bS) return 1;
                              return 0;
                            })
                            .map((s) => {
                              const starred = starredSets.includes(s.code);
                              return (
                                <div key={s.code} className={`${styles.setPickerRow} ${starred ? styles.setPickerRowStarred : ""}`}>
                                  <button className={styles.setStarBtn} onClick={(e) => { e.stopPropagation(); toggleStarSet(s.code); }} title={starred ? "Unpin" : "Pin to top"}>
                                    {starred ? "★" : "☆"}
                                  </button>
                                  <button className={styles.setPickerRowInner} onClick={() => { setSfSetFilter(s.code.toUpperCase()); setShowSetPicker(false); }}>
                                    <span className={styles.setPickerCode}>{s.code.toUpperCase()}</span>
                                    <span className={styles.setPickerName}>{s.name}</span>
                                  </button>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>
                  </div>,
                  document.body
                )}

                {/* Print Grid */}
                {sfPrints.length > 0 && !sfCard && (
                  <section className={styles.printPicker}>
                    <div className={styles.printPickerHeader}>
                      <p className={styles.sfLabel}>
                        {sfQuery
                          ? <>{sfPrints.length} result{sfPrints.length !== 1 ? "s" : ""} for <strong>{sfQuery}</strong>{sfSetFilter ? <> in <strong>{sfSetFilter}</strong></> : ""} — click to select</>
                          : <>{sfPrints.length} card{sfPrints.length !== 1 ? "s" : ""} in <strong>{sfSetFilter}</strong> — click to select</>
                        }
                      </p>
                      {!sfQuery && (
                        <button type="button" className={styles.changeCardBtn} onClick={() => { setSfPrints([]); setSfSetFilter(""); setSfError(null); }}>
                          Clear
                        </button>
                      )}
                    </div>
                    <div className={styles.printGrid}>
                      {sfPrints.map((print) => {
                        const frontImg = scryfallImage(print);
                        const backImg = scryfallBackImage(print);
                        const isDFC = !!backImg;
                        const isSelected = pickQueue.some((c) => c.id === print.id);
                        return (
                        <PrintOption
                          key={print.id}
                          print={print}
                          frontImg={frontImg}
                          backImg={backImg}
                          isDFC={isDFC}
                          isSelected={isSelected}
                          onSelect={() => toggleSfCardInPick(print)}
                          onShowDetails={(e) => { e.preventDefault(); setPickContextMenu({ x: e.clientX, y: e.clientY, card: print }); }}
                          onOpenDetails={() => setPickDetailCard(print)}
                        />
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              {/* ── Right: Selected Sidebar ── */}
              <div className={styles.pickModalSidebar}>
                <p className={styles.sfLabel}>SELECTED ({pickQueue.length})</p>
                {pickQueue.length === 0 ? (
                  <p className={styles.pickSidebarEmpty}>No cards selected yet.<br />Click a card to add it.</p>
                ) : (
                  <div className={styles.pickQueueGrid}>
                    {pickQueue.map((card, i) => {
                      const img = scryfallImage(card);
                      return (
                        <div key={i} className={styles.pickQueueCard}>
                          <button type="button" className={styles.pickQueueCardRemove} onClick={() => removeFromPickQueue(i)} aria-label="Remove">✕</button>
                          {img
                            ? <img src={img} alt={card.name} className={styles.pickQueueCardImg} />
                            : <div className={styles.pickQueueCardImgEmpty} />
                          }
                          <span className={styles.pickQueueCardName}>{card.name}</span>
                          <div className={styles.pickQueueQtyWrap}>
                            <span className={styles.pickQueueQtyLabel}>Qty</span>
                            <input
                              className={styles.pickQueueQtyInput}
                              type="number"
                              min="1"
                              step="1"
                              value={pickQueueQty[card.id] ?? 1}
                              onChange={(e) => setPickQueueQty((q) => ({ ...q, [card.id]: parseInt(e.target.value) || 1 }))}
                              onFocus={(e) => { e.target.value = ""; }}
                              onBlur={(e) => { if (!e.target.value || parseInt(e.target.value) < 1) setPickQueueQty((q) => ({ ...q, [card.id]: 1 })); }}
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className="btn btn-outline" onClick={() => { setAddMode(null); setPickQueue([]); }}>Cancel</button>
              {pickQueue.length > 0 && (
                <button type="button" className="btn btn-primary" onClick={startDetails}>
                  Continue to Details ({pickQueue.length} card{pickQueue.length !== 1 ? "s" : ""}) →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Pick Context Menu ──────────────────────────────────────────────── */}
      {pickContextMenu && typeof document !== "undefined" && createPortal(
        <div className={styles.ctxOverlay} onClick={() => setPickContextMenu(null)} onContextMenu={(e) => e.preventDefault()}>
          <ul
            className={styles.ctxMenu}
            style={{ top: pickContextMenu.y, left: pickContextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <li className={styles.ctxItem} onClick={() => { setPickDetailCard(pickContextMenu.card); setPickContextMenu(null); }}>
              🔍 Show Details
            </li>
            <li className={styles.ctxItem} onClick={() => { toggleSfCardInPick(pickContextMenu.card); setPickContextMenu(null); }}>
              {pickQueue.some((c) => c.id === pickContextMenu.card.id) ? "✕ Remove from Selection" : "✓ Add to Selection"}
            </li>
          </ul>
        </div>,
        document.body
      )}

      {/* ── Pick Card Detail Popup ─────────────────────────────────────────── */}
      {pickDetailCard && typeof document !== "undefined" && createPortal(
        <div className={styles.cardDetailOverlay} onClick={() => setPickDetailCard(null)}>
          <div className={styles.cardDetailPopup} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <button className={styles.cardDetailClose} onClick={() => setPickDetailCard(null)}>✕</button>
            <div className={styles.cardDetailLayout}>
              <div className={styles.cardDetailImgCol}>
                {scryfallImage(pickDetailCard) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={scryfallImage(pickDetailCard)} alt={pickDetailCard.name} className={styles.cardDetailImg} />
                ) : (
                  <div className={styles.cardDetailImgEmpty}>No image</div>
                )}
              </div>
              <div className={styles.cardDetailInfo}>
                <h3 className={styles.cardDetailName}>{pickDetailCard.name}</h3>
                {pickDetailCard.mana_cost && (
                  <p className={styles.cardDetailMana}>{pickDetailCard.mana_cost}</p>
                )}
                <p className={styles.cardDetailType}>
                  {pickDetailCard.type_line ?? pickDetailCard.card_faces?.[0]?.type_line ?? ""}
                </p>
                <p className={styles.cardDetailSet}>
                  {formatSetDisplay(pickDetailCard.set_name, pickDetailCard.set.toUpperCase(), pickDetailCard.collector_number)}
                  {" · "}{scryfallRarity(pickDetailCard.rarity)}
                </p>
                {(pickDetailCard.oracle_text ?? pickDetailCard.card_faces?.[0]?.oracle_text) && (
                  <p className={styles.cardDetailOracle}>
                    {pickDetailCard.oracle_text ?? pickDetailCard.card_faces?.[0]?.oracle_text}
                  </p>
                )}
                {(pickDetailCard.power || pickDetailCard.toughness) && (
                  <p className={styles.cardDetailPT}>
                    {pickDetailCard.power ?? "—"} / {pickDetailCard.toughness ?? "—"}
                  </p>
                )}
                <div className={styles.cardDetailPrices}>
                  {pickDetailCard.prices?.usd && <span>Nonfoil <strong>${pickDetailCard.prices.usd}</strong></span>}
                  {pickDetailCard.prices?.usd_foil && <span>Foil <strong>${pickDetailCard.prices.usd_foil}</strong></span>}
                </div>
                <button
                  className={`btn ${pickQueue.some((c) => c.id === pickDetailCard.id) ? "btn-outline" : "btn-primary"} ${styles.cardDetailAddBtn}`}
                  onClick={() => { toggleSfCardInPick(pickDetailCard); setPickDetailCard(null); }}
                >
                  {pickQueue.some((c) => c.id === pickDetailCard.id) ? "✕ Remove from Selection" : "✓ Add to Selection"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Phase 2: Inventory Details ─────────────────────────────────────── */}
      {addMode === "details" && (
        <div className={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) { setAddMode(null); setPickQueue([]); setDetailForms([]); } }}>
          <div className={styles.modal} style={{ maxWidth: 900 }} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Inventory Details — {detailForms.length} card{detailForms.length !== 1 ? "s" : ""}</h2>
              <button className={styles.modalClose} onClick={() => { setAddMode(null); setPickQueue([]); setDetailForms([]); }}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {error && <div className={styles.formError}>{error}</div>}
              <div className={styles.detailFormsList}>
                {detailForms.map((entry, i) => {
                  const priceIsMissing =
                    entry.price.trim() === "" ||
                    !Number.isFinite(Number(entry.price)) ||
                    Number(entry.price) < 0;

                  return (
                  <div key={entry._sfCard.id} className={styles.detailFormsRow}>
                    {entry.imageUrl
                      ? <img src={entry.imageUrl} alt={entry.name} className={styles.detailFormsThumb} />
                      : <div className={styles.detailFormsThumbEmpty} />
                    }
                    <div className={styles.detailFormsCardInfo}>
                      <span className={styles.detailFormsCardName}>{entry.name}</span>
                      <span className={styles.detailFormsCardMeta}>{formatSetDisplay(entry.set, entry.setCode, entry.collectorNumber)}</span>
                    </div>
                    <div className={styles.detailFormsFields}>
                      <div className={styles.detailFormsField}>
                        <span className={styles.detailFormsLabel}>Condition</span>
                        <select
                          className={styles.detailFormsSelect}
                          value={entry.condition}
                          onChange={(e) => updateDetailForm(i, "condition", e.target.value as Condition)}
                        >
                          {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className={styles.detailFormsField}>
                        <span className={styles.detailFormsLabel}>Finish</span>
                        <div className={styles.finishToggle}>
                          <button type="button" className={`${styles.finishBtn} ${!entry.foil ? styles.finishBtnActive : ""}`} onClick={() => setDetailFinish(i, false)}>Non</button>
                          <button type="button" className={`${styles.finishBtn} ${entry.foil ? styles.finishBtnActive : ""}`} onClick={() => setDetailFinish(i, true)}>Foil</button>
                        </div>
                      </div>
                      <div className={styles.detailFormsField}>
                        <span className={styles.detailFormsLabel}>Qty</span>
                        <input
                          className={styles.detailFormsInput}
                          type="number"
                          min="1"
                          step="1"
                          value={entry.quantity}
                          onChange={(e) => updateDetailForm(i, "quantity", e.target.value)}
                        />
                      </div>
                      <div className={styles.detailFormsField}>
                        <span className={styles.detailFormsLabel}>Price *</span>
                        <div className={`${styles.detailFormsInputWrap} ${priceIsMissing ? styles.detailFormsInputError : ""}`}>
                          <span className={styles.bulkPriceDollarSign}>$</span>
                          <input
                            className={styles.bulkPriceFieldInput}
                            type="number"
                            min="0"
                            step="0.01"
                            value={entry.price}
                            onChange={(e) => updateDetailForm(i, "price", e.target.value)}
                            required
                            aria-invalid={priceIsMissing}
                          />
                        </div>
                        {priceIsMissing && (
                          <span className={styles.detailFormsRequired}>Required</span>
                        )}
                        {entry.marketPrice && (
                          <span className={styles.detailFormsMkt}>Mkt ${parseFloat(entry.marketPrice).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.detailFormsDelete}
                      onClick={() => removeDetailForm(i)}
                      aria-label={`Delete ${entry.name} from selection`}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                  );
                })}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className="btn btn-outline" onClick={() => setAddMode("pick")}>← Back</button>
              <button type="button" className="btn btn-primary" onClick={saveAllDetails} disabled={savingAll}>
                {savingAll ? "Saving…" : `Save All (${detailForms.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Card Modal ─────────────────────────────────────────────────── */}
      {(addMode === "manual" || addMode === "scryfall") && (
        <div className={styles.overlay} onClick={() => { setAddMode(null); setCardQueue([]); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {addMode === "scryfall" && sfPrints.length > 0 && !sfCard
                  ? "Select Printing"
                  : addMode === "scryfall" && !sfCard
                    ? "Search Database"
                    : "Add Card to Inventory"}
              </h2>
              <button className={styles.modalClose} onClick={() => { setAddMode(null); setCardQueue([]); }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {error && <div className={styles.formError}>{error}</div>}

              {/* ── Database Search ── */}
              {addMode === "scryfall" && !sfCard && sfPrints.length === 0 && <div className={styles.sfSection}>
                <p className={styles.sfLabel}>SEARCH TO AUTOFILL CARD DETAILS</p>
                <div className={styles.sfSearchWrap}>
                  <div className={styles.sfInputWrap} style={{ flex: 1 }}>
                    <input
                      ref={sfInputRef}
                      className={styles.sfInput}
                      value={sfQuery}
                      onChange={(e) => onSfQueryChange(e.target.value)}
                      onBlur={() => setTimeout(() => setSfOpen(false), 150)}
                      placeholder="Start typing a card name to auto generate details.."
                      autoComplete="off"
                    />
                    {sfLoading && <span className={styles.sfSpinner}>⟳</span>}
                    {sfOpen && sfSuggestions.length > 0 && typeof document !== "undefined" && createPortal(
                      <ul
                        className={styles.sfDropdown}
                        style={(() => {
                          const r = sfInputRef.current?.getBoundingClientRect();
                          return r ? { position: "fixed", top: r.bottom, left: r.left, width: r.width, zIndex: 9999 } : {};
                        })()}
                      >
                        {sfSuggestions.map((name) => (
                          <li key={name} className={styles.sfOption} onMouseDown={() => fetchPrintsForName(name)}>
                            {name}
                          </li>
                        ))}
                      </ul>,
                      document.body
                    )}
                  </div>
                  <span className={styles.sfOrDivider}>OR</span>
                  <div className={styles.sfSetWrap}>
                    <input
                      className={styles.sfSetInput}
                      value={sfSetFilter}
                      onChange={(e) => setSfSetFilter(e.target.value.toUpperCase())}
                      placeholder="Set code…"
                      maxLength={8}
                      title="Optional: filter by set code (e.g. MSH, BLB)"
                      autoComplete="off"
                      onKeyDown={(e) => { if (e.key === "Enter" && sfSetFilter && !sfQuery) fetchPrintsForSet(); }}
                    />
                    <button type="button" className={styles.setPickerBtn} onClick={openSetPicker} title="Browse all set codes">
                      ⋯
                    </button>
                  </div>
                  {!sfLoading && sfSetFilter && !sfQuery && (
                    <button type="button" className={styles.sfFetchBtn} onClick={fetchPrintsForSet}>
                      Browse Set
                    </button>
                  )}
                  {sfQuery && !sfLoading && (
                    <button type="button" className={styles.sfFetchBtn} onClick={() => fetchPrintsForName(sfQuery)}>
                      Search
                    </button>
                  )}
                </div>
                {sfError && <p className={styles.sfErr}>{sfError}</p>}
              </div>}

              {/* ── Set Picker Popup ── */}
              {showSetPicker && typeof document !== "undefined" && createPortal(
                <div className={styles.setPickerOverlay} onClick={() => setShowSetPicker(false)}>
                  <div className={styles.setPickerPopup} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.setPickerHeader}>
                      <span className={styles.setPickerTitle}>All Sets</span>
                      <button className={styles.setPickerClose} onClick={() => setShowSetPicker(false)}>✕</button>
                    </div>
                    <input
                      className={styles.setPickerSearch}
                      placeholder="Search sets…"
                      value={setPickerSearch}
                      onChange={(e) => setSetPickerSearch(e.target.value)}
                      autoFocus
                    />
                    <div className={styles.setPickerList}>
                      {setsLoading ? (
                        <p className={styles.setPickerLoading}>Loading sets…</p>
                      ) : (
                        Array.from(allSets)
                          .filter((s) =>
                            !setPickerSearch ||
                            s.code.toLowerCase().includes(setPickerSearch.toLowerCase()) ||
                            s.name.toLowerCase().includes(setPickerSearch.toLowerCase())
                          )
                          .sort((a, b) => {
                            const aS = starredSets.includes(a.code);
                            const bS = starredSets.includes(b.code);
                            if (aS && !bS) return -1;
                            if (!aS && bS) return 1;
                            return 0;
                          })
                          .map((s) => {
                            const starred = starredSets.includes(s.code);
                            return (
                              <div key={s.code} className={`${styles.setPickerRow} ${starred ? styles.setPickerRowStarred : ""}`}>
                                <button
                                  className={styles.setStarBtn}
                                  onClick={(e) => { e.stopPropagation(); toggleStarSet(s.code); }}
                                  title={starred ? "Unpin" : "Pin to top"}
                                >
                                  {starred ? "★" : "☆"}
                                </button>
                                <button
                                  className={styles.setPickerRowInner}
                                  onClick={() => { setSfSetFilter(s.code.toUpperCase()); setShowSetPicker(false); }}
                                >
                                  <span className={styles.setPickerCode}>{s.code.toUpperCase()}</span>
                                  <span className={styles.setPickerName}>{s.name}</span>
                                </button>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>,
                document.body
              )}

              {/* ── Print Picker ── */}
              {addMode === "scryfall" && sfPrints.length > 0 && !sfCard && (
                <section className={styles.printPicker}>
                  <div className={styles.printPickerHeader}>
                    <div>
                      <p className={styles.sfLabel}>SELECT A PRINTING</p>
                      <p className={styles.printPickerSub}>
                        {sfQuery
                          ? <>{sfPrints.length} printing{sfPrints.length !== 1 ? "s" : ""} found for <strong>{sfQuery}</strong>{sfSetFilter ? <> in <strong>{sfSetFilter}</strong></> : ""}</>
                          : <>{sfPrints.length} card{sfPrints.length !== 1 ? "s" : ""} in set <strong>{sfSetFilter}</strong></>
                        }
                      </p>
                    </div>
                    <button type="button" className={styles.changeCardBtn} onClick={resetImportSearch}>
                      New search
                    </button>
                  </div>
                  <div className={styles.printGrid}>
                    {sfPrints.map((print) => {
                      const frontImg = scryfallImage(print);
                      const backImg = scryfallBackImage(print);
                      const isDFC = !!backImg;
                      return (
                        <PrintOption
                          key={print.id}
                          print={print}
                          frontImg={frontImg}
                          backImg={backImg}
                          isDFC={isDFC}
                          onSelect={() => applySfCard(print)}
                        />
                      );
                    })}
                  </div>
                </section>
              )}

              {showImportedLayout && sfCard && (
                <>
                  <section className={styles.importSection}>
                    <div className={styles.importSectionHeader}>
                      <h3 className={styles.importSectionTitle}>Imported Card</h3>
                      <button
                        type="button"
                        className={styles.changeCardBtn}
                        onClick={backToPrintPicker}
                      >
                        {sfPrints.length > 0 ? "Change printing" : "Change card"}
                      </button>
                    </div>
                    <div className={styles.importCardRow}>
                      {form.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.imageUrl} alt={form.name} className={styles.importCardImg} />
                      ) : (
                        <div className={styles.importCardImgEmpty}>No image</div>
                      )}
                      <div className={styles.importCardInfo}>
                        <p className={styles.importCardName}>{form.name}</p>
                        <p className={styles.importCardMeta}>
                          {formatSetDisplay(form.set, form.setCode, form.collectorNumber)}
                        </p>
                        <p className={styles.importCardMeta}>
                          {form.rarity} · {sfCard.type_line ?? sfCard.card_faces?.[0]?.type_line ?? form.type}
                        </p>
                        <p className={styles.importCardMeta}>
                          {colorLabel(form.color)}
                          {form.cmc !== "" ? ` · Mana Value ${form.cmc}` : sfCard.cmc !== undefined ? ` · Mana Value ${Math.round(sfCard.cmc)}` : ""}
                          {(form.power || form.toughness) ? ` · ${form.power || "—"}/${form.toughness || "—"}` : ""}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className={styles.importSection}>
                    <h3 className={styles.importSectionTitle}>Inventory Details</h3>
                    <div className={styles.detailRows}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Condition</span>
                        <select className={styles.detailSelect} value={form.condition} onChange={(e) => set("condition", e.target.value as Condition)}>
                          {CONDITIONS.map((c) => <option key={c} value={c}>{c} ({formatCondition(c)})</option>)}
                        </select>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Finish</span>
                        <div className={styles.finishToggle}>
                          <button type="button" className={`${styles.finishBtn} ${!form.foil ? styles.finishBtnActive : ""}`} onClick={() => setFinish(false)}>
                            Nonfoil
                          </button>
                          <button type="button" className={`${styles.finishBtn} ${form.foil ? styles.finishBtnActive : ""}`} onClick={() => setFinish(true)}>
                            Foil
                          </button>
                        </div>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Quantity</span>
                        <input className={styles.detailInput} type="number" min="0" step="1" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} required />
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Price</span>
                        <div className={styles.priceDiscountWrap}>
                          <input
                            className={styles.detailInput}
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.price}
                            onChange={(e) => { setAutoDiscount(false); set("price", e.target.value); }}
                            placeholder="0.00"
                            required
                          />
                          <button
                            type="button"
                            className={`${styles.discountToggle} ${autoDiscount ? styles.discountToggleOn : ""}`}
                            onClick={() => toggleAutoDiscount(!autoDiscount)}
                            title={autoDiscount ? "Listing at 15% below market — click to disable" : "Click to list at 15% below market price"}
                          >
                            {autoDiscount ? "−15% ✓" : "−15%"}
                          </button>
                          {form.marketPrice && (
                            <span className={styles.discountHint}>
                              Market: ${parseFloat(form.marketPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Availability</span>
                        <select className={styles.detailSelect} value={form.availability} onChange={(e) => set("availability", e.target.value as Availability)}>
                          {AVAILABILITY_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                      <div className={`${styles.detailRow} ${styles.detailRowFormats}`}>
                        <span className={styles.detailLabel}>Formats</span>
                        <div className={styles.checkRow}>
                          {FORMATS.map((f) => (
                            <label key={f} className={styles.checkChip}>
                              <input
                                type="checkbox"
                                checked={form.formats.includes(f)}
                                onChange={() => set("formats", toggleArr(form.formats, f))}
                              />
                              {f}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className={styles.importSection}>
                    <button type="button" className={styles.collapseHeader} onClick={() => setAdvancedOpen((v) => !v)} aria-expanded={advancedOpen}>
                      <span className={styles.importSectionTitle}>Advanced Imported Data</span>
                      <span className={styles.collapseChevron}>{advancedOpen ? "−" : "+"}</span>
                    </button>
                    {advancedOpen && (
                      <div className={styles.formGrid}>
                        <div className={`${styles.field} ${styles.fieldFull}`}>
                          <label className={styles.label}>Card Name *</label>
                          <input className={styles.input} value={form.name} onChange={(e) => set("name", e.target.value)} required />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Edition *</label>
                          <select className={styles.select} value={EDITIONS.includes(form.set) ? form.set : "__other__"} onChange={(e) => set("set", e.target.value === "__other__" ? form.set : e.target.value)} required>
                            <option value="">Select edition…</option>
                            {EDITIONS.map((ed) => <option key={ed} value={ed}>{ed}</option>)}
                            {form.set && !EDITIONS.includes(form.set) && <option value="__other__">{form.set}</option>}
                          </select>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Set Code</label>
                          <input className={styles.input} value={form.setCode} onChange={(e) => set("setCode", e.target.value.toUpperCase())} maxLength={6} />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Card Number</label>
                          <input className={styles.input} value={form.collectorNumber} onChange={(e) => set("collectorNumber", e.target.value)} placeholder="e.g. 0034" />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Rarity *</label>
                          <select className={styles.select} value={form.rarity} onChange={(e) => set("rarity", e.target.value as Rarity)}>
                            {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Type *</label>
                          <select className={styles.select} value={form.type} onChange={(e) => set("type", e.target.value as CardType)}>
                            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Card Color *</label>
                          <select className={styles.select} value={form.color} onChange={(e) => set("color", e.target.value as CardColor)}>
                            {CARD_COLORS.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
                          </select>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Color Identity</label>
                          <div className={styles.manaRow}>
                            {IDENTITY_OPTIONS.map(({ code, ms }) => (
                              <button key={code} type="button" className={`${styles.manaPip} ${form.colorIdentity.includes(code) ? styles.manaPipActive : ""}`} onClick={() => set("colorIdentity", toggleArr(form.colorIdentity, code))} aria-label={code}>
                                <i className={`ms ms-cost ${ms} ms-2x`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Mana Cost</label>
                          <input className={styles.input} value={form.manaCost} onChange={(e) => set("manaCost", e.target.value)} />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Converted Cost</label>
                          <select className={styles.select} value={form.cmc} onChange={(e) => set("cmc", e.target.value)}>
                            <option value="">Any</option>
                            {CMC_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Power</label>
                          <select className={styles.select} value={form.power} onChange={(e) => set("power", e.target.value)}>
                            {PT_OPTIONS.map((v) => <option key={v} value={v}>{v === "" ? "Any" : v}</option>)}
                          </select>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Toughness</label>
                          <select className={styles.select} value={form.toughness} onChange={(e) => set("toughness", e.target.value)}>
                            {PT_OPTIONS.map((v) => <option key={v} value={v}>{v === "" ? "Any" : v}</option>)}
                          </select>
                        </div>
                        <div className={`${styles.field} ${styles.fieldFull}`}>
                          <label className={styles.label}>Oracle Text</label>
                          <textarea className={styles.textarea} rows={3} value={form.oracleText} onChange={(e) => set("oracleText", e.target.value)} />
                        </div>
                        <div className={`${styles.field} ${styles.fieldFull}`}>
                          <label className={styles.label}>Image URL</label>
                          <input className={styles.input} value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} />
                        </div>
                      </div>
                    )}
                  </section>
                </>
              )}

              {showAddForm && addMode === "manual" && (
              <div className={styles.formGrid}>
                {/* Card Name */}
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>Card Name *</label>
                  <input className={styles.input} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Black Lotus" required />
                </div>

                {/* Edition */}
                <div className={styles.field}>
                  <label className={styles.label}>Edition *</label>
                  <select
                    className={styles.select}
                    value={EDITIONS.includes(form.set) ? form.set : "__other__"}
                    onChange={(e) => set("set", e.target.value === "__other__" ? form.set : e.target.value)}
                    required
                  >
                    <option value="">Select edition…</option>
                    {EDITIONS.map((ed) => <option key={ed} value={ed}>{ed}</option>)}
                    {form.set && !EDITIONS.includes(form.set) && (
                      <option value="__other__">{form.set}</option>
                    )}
                  </select>
                </div>

                {/* Set Code */}
                <div className={styles.field}>
                  <label className={styles.label}>Set Code</label>
                  <input className={styles.input} value={form.setCode} onChange={(e) => set("setCode", e.target.value.toUpperCase())} placeholder="e.g. BLB" maxLength={6} />
                </div>

                {/* Card Number */}
                <div className={styles.field}>
                  <label className={styles.label}>Card Number</label>
                  <input className={styles.input} value={form.collectorNumber} onChange={(e) => set("collectorNumber", e.target.value)} placeholder="e.g. 0034" />
                </div>

                {/* Rarity */}
                <div className={styles.field}>
                  <label className={styles.label}>Rarity *</label>
                  <select className={styles.select} value={form.rarity} onChange={(e) => set("rarity", e.target.value as Rarity)}>
                    {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Type */}
                <div className={styles.field}>
                  <label className={styles.label}>Type *</label>
                  <select className={styles.select} value={form.type} onChange={(e) => set("type", e.target.value as CardType)}>
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Card Color */}
                <div className={styles.field}>
                  <label className={styles.label}>Card Color *</label>
                  <select className={styles.select} value={form.color} onChange={(e) => set("color", e.target.value as CardColor)}>
                    {CARD_COLORS.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
                  </select>
                </div>

                {/* Color Identity */}
                <div className={styles.field}>
                  <label className={styles.label}>Color Identity</label>
                  <div className={styles.manaRow}>
                    {IDENTITY_OPTIONS.map(({ code, ms }) => (
                      <button
                        key={code}
                        type="button"
                        className={`${styles.manaPip} ${form.colorIdentity.includes(code) ? styles.manaPipActive : ""}`}
                        onClick={() => set("colorIdentity", toggleArr(form.colorIdentity, code))}
                        aria-label={code}
                        aria-pressed={form.colorIdentity.includes(code)}
                      >
                        <i className={`ms ms-cost ${ms} ms-2x`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition */}
                <div className={styles.field}>
                  <label className={styles.label}>Condition *</label>
                  <select className={styles.select} value={form.condition} onChange={(e) => set("condition", e.target.value as Condition)}>
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c} ({formatCondition(c)})</option>)}
                  </select>
                </div>

                {/* Availability */}
                <div className={styles.field}>
                  <label className={styles.label}>Availability</label>
                  <select className={styles.select} value={form.availability} onChange={(e) => set("availability", e.target.value as Availability)}>
                    {AVAILABILITY_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                {/* Foil */}
                <div className={styles.field}>
                  <label className={styles.label}>Foil</label>
                  <label className={styles.checkboxToggle}>
                    <input type="checkbox" checked={form.foil} onChange={(e) => set("foil", e.target.checked)} />
                    <span>Foil printing</span>
                  </label>
                </div>

                {/* Mana Cost */}
                <div className={styles.field}>
                  <label className={styles.label}>Mana Cost</label>
                  <input className={styles.input} value={form.manaCost} onChange={(e) => set("manaCost", e.target.value)} placeholder="{1}{G}{G}" />
                </div>

                {/* CMC */}
                <div className={styles.field}>
                  <label className={styles.label}>Converted Cost</label>
                  <select className={styles.select} value={form.cmc} onChange={(e) => set("cmc", e.target.value)}>
                    <option value="">Any</option>
                    {CMC_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                {/* Power */}
                <div className={styles.field}>
                  <label className={styles.label}>Power</label>
                  <select className={styles.select} value={form.power} onChange={(e) => set("power", e.target.value)}>
                    {PT_OPTIONS.map((v) => <option key={v} value={v}>{v === "" ? "Any" : v}</option>)}
                  </select>
                </div>

                {/* Toughness */}
                <div className={styles.field}>
                  <label className={styles.label}>Toughness</label>
                  <select className={styles.select} value={form.toughness} onChange={(e) => set("toughness", e.target.value)}>
                    {PT_OPTIONS.map((v) => <option key={v} value={v}>{v === "" ? "Any" : v}</option>)}
                  </select>
                </div>

                {/* Price */}
                <div className={styles.field}>
                  <label className={styles.label}>Price ($) *</label>
                  <input className={styles.input} type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0.00" required />
                </div>

                {/* Quantity */}
                <div className={styles.field}>
                  <label className={styles.label}>Quantity *</label>
                  <input className={styles.input} type="number" min="0" step="1" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} placeholder="1" required />
                </div>

                {/* Formats */}
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>Formats</label>
                  <div className={styles.checkRow}>
                    {FORMATS.map((f) => (
                      <label key={f} className={styles.checkChip}>
                        <input
                          type="checkbox"
                          checked={form.formats.includes(f)}
                          onChange={() => set("formats", toggleArr(form.formats, f))}
                        />
                        {f}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Oracle Text */}
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>Oracle Text</label>
                  <textarea className={styles.textarea} rows={3} value={form.oracleText} onChange={(e) => set("oracleText", e.target.value)} placeholder="Card rules text…" />
                </div>

                {/* Image URL */}
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>Image URL</label>
                  <input className={styles.input} value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" />
                </div>
              </div>
              )}

              {/* ── Queue list ── */}
              {cardQueue.length > 0 && (
                <div className={styles.queuePanel}>
                  <p className={styles.queueTitle}>Queue — {cardQueue.length} card{cardQueue.length !== 1 ? "s" : ""} ready to save</p>
                  <div className={styles.queueList}>
                    {cardQueue.map((entry, i) => (
                      <div key={i} className={styles.queueItem}>
                        <span className={styles.queueItemName}>{entry.name}</span>
                        <span className={styles.queueItemMeta}>{entry.condition}{entry.foil ? " · Foil" : ""} · ${parseFloat(entry.price).toFixed(2)} · Qty {entry.quantity}</span>
                        <button type="button" className={styles.queueRemoveBtn} onClick={() => removeFromQueue(i)} aria-label="Remove">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showAddForm ? (
              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-outline" onClick={() => { setAddMode(null); setCardQueue([]); }}>Cancel</button>
                <button type="button" className={`btn btn-outline ${styles.queueBtn}`} onClick={addToQueue} disabled={saving || savingAll}>
                  + Add to Queue
                </button>
                {cardQueue.length > 0 && (
                  <button type="button" className="btn btn-primary" onClick={saveAllQueued} disabled={savingAll}>
                    {savingAll ? "Saving…" : `Save All (${cardQueue.length})`}
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={saving || savingAll}>
                  {saving ? "Saving…" : "Save This Card"}
                </button>
              </div>
              ) : addMode === "scryfall" && !sfCard && (
              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-outline" onClick={() => { setAddMode(null); setCardQueue([]); }}>Cancel</button>
              </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ── Bulk Price Editor Modal ────────────────────────────────────────── */}
      {showBulkPriceModal && (() => {
        const selectedCards = cards.filter((c) => selected.has(c.id));
        const hasAnyMarket = selectedCards.some((c) => c.marketPrice !== undefined);
        function applyRecommended(card: typeof selectedCards[0]) {
          if (card.marketPrice === undefined) return;
          const rec = (card.marketPrice * 0.85).toFixed(2);
          setBulkPriceEdits((prev) => ({ ...prev, [card.id]: rec }));
        }
        function applyAllRecommended() {
          const edits: Record<string, string> = { ...bulkPriceEdits };
          selectedCards.forEach((card) => {
            if (card.marketPrice !== undefined) edits[card.id] = (card.marketPrice * 0.85).toFixed(2);
          });
          setBulkPriceEdits(edits);
        }
        return (
          <div className={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) setShowBulkPriceModal(false); }}>
            <div className={styles.modal} style={{ maxWidth: 780 }} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Edit Prices — {selectedCards.length} cards</h2>
                <button className={styles.modalClose} onClick={() => setShowBulkPriceModal(false)}>✕</button>
              </div>
              {hasAnyMarket && (
                <div className={styles.bulkPriceTopBar}>
                  <span className={styles.bulkPriceTopBarHint}>Recommended price is −15% below Scryfall market price</span>
                  <button className={styles.bulkPriceSetAllBtn} type="button" onClick={applyAllRecommended}>
                    Set All to Recommended
                  </button>
                </div>
              )}
              <div className={styles.bulkPriceList}>
                {selectedCards.map((card) => {
                  const recommended = card.marketPrice !== undefined ? (card.marketPrice * 0.85) : null;
                  return (
                    <div key={card.id} className={styles.bulkPriceRow}>
                      {card.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={card.imageUrl} alt={card.name} className={styles.bulkPriceThumb} />
                      ) : (
                        <div className={styles.bulkPriceThumbEmpty} />
                      )}
                      <div className={styles.bulkPriceInfo}>
                        <span className={styles.bulkPriceCardName}>{card.name}</span>
                        <span className={styles.bulkPriceCardMeta}>{card.condition}{card.foil ? " · Foil" : ""} · {card.set}</span>
                        {recommended !== null && (
                          <span className={styles.bulkPriceRec}>
                            Recommended: <strong>${recommended.toFixed(2)}</strong>
                            {card.marketPrice !== undefined && <> · Market: ${card.marketPrice.toFixed(2)}</>}
                          </span>
                        )}
                      </div>
                      <div className={styles.bulkPriceControls}>
                        {recommended !== null && (
                          <button
                            type="button"
                            className={styles.bulkPriceUseBtn}
                            onClick={() => applyRecommended(card)}
                            title="Apply −15% recommended price"
                          >
                            Use
                          </button>
                        )}
                        <div className={styles.bulkPriceInputWrap}>
                          <span className={styles.bulkPriceDollarSign}>$</span>
                          <input
                            className={styles.bulkPriceFieldInput}
                            type="number"
                            min="0"
                            step="0.01"
                            data-price-index={selectedCards.indexOf(card)}
                            value={bulkPriceEdits[card.id] ?? String(card.price)}
                            onChange={(e) => setBulkPriceEdits((prev) => ({ ...prev, [card.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === "ArrowDown") {
                                e.preventDefault();
                                const next = document.querySelector<HTMLInputElement>(`[data-price-index="${selectedCards.indexOf(card) + 1}"]`);
                                next?.focus();
                              } else if (e.key === "ArrowUp") {
                                e.preventDefault();
                                const prev = document.querySelector<HTMLInputElement>(`[data-price-index="${selectedCards.indexOf(card) - 1}"]`);
                                prev?.focus();
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className={styles.modalFooter}>
                <button className="btn btn-outline" onClick={() => setShowBulkPriceModal(false)} disabled={bulkUpdating}>Cancel</button>
                <button className="btn btn-primary" onClick={saveAllPrices} disabled={bulkUpdating}>
                  {bulkUpdating ? "Saving…" : "Save All Prices"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Bulk Import Modal ──────────────────────────────────────────────── */}
      {addMode === "bulk" && (
        <BulkImportModal
          onClose={() => setAddMode(null)}
          onImported={async (count) => {
            setAddMode(null);
            await load();
          }}
        />
      )}

      {/* ── Card Preview Modal ─────────────────────────────────────────────── */}
      {previewCard && (
        <div className={styles.overlay} onClick={() => setPreviewCard(null)}>
          <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.previewClose} onClick={() => setPreviewCard(null)}>✕</button>
            <div className={styles.previewInner}>
              <div className={styles.previewImgCol}>
                <div className={styles.previewImgWrap}>
                  {(() => {
                    const previewDisplayImg = previewFlipped && previewCard.backImageUrl ? previewCard.backImageUrl : previewCard.imageUrl;
                    return previewDisplayImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewDisplayImg} alt={previewCard.name} className={styles.previewImg} />
                    ) : (
                      <div className={styles.previewNoImg}>No image</div>
                    );
                  })()}
                  {previewCard.backImageUrl && (
                    <button
                      className={styles.previewFlipBtn}
                      onClick={() => setPreviewFlipped((v) => !v)}
                      aria-label={previewFlipped ? "Show front face" : "Show back face"}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.previewDetails}>
                <h2 className={styles.previewName}>{previewCard.name}</h2>
                {previewCard.manaCost && <p className={styles.previewMana}>{previewCard.manaCost}</p>}
                <p className={styles.previewType}>{previewCard.type}</p>
                {previewCard.oracleText && <p className={styles.previewOracle}>{previewCard.oracleText}</p>}
                {(previewCard.power || previewCard.toughness) && (
                  <p className={styles.previewPT}>{previewCard.power}/{previewCard.toughness}</p>
                )}
                <div className={styles.previewMeta}>
                  <span className={styles.previewMetaRow}><b>Set</b> {formatSetDisplay(previewCard.set, previewCard.setCode, previewCard.collectorNumber)}</span>
                  <span className={styles.previewMetaRow}><b>Rarity</b> {normalizeRarity(previewCard.rarity)}</span>
                  <span className={styles.previewMetaRow}><b>Condition</b> {previewCard.condition}{previewCard.foil ? " · Foil" : ""}</span>
                  <span className={styles.previewMetaRow}><b>Color</b> {previewCard.color}</span>
                  {previewCard.cmc !== undefined && <span className={styles.previewMetaRow}><b>CMC</b> {previewCard.cmc}</span>}
                  {previewCard.availability && <span className={styles.previewMetaRow}><b>Availability</b> {previewCard.availability}</span>}
                </div>
                <div className={styles.previewPricing}>
                  <div className={styles.previewPrice}>{formatAmount(previewCard.price)}</div>
                  <div className={styles.previewQty}>{previewCard.quantity} in stock</div>
                </div>
                {previewCard.formats && previewCard.formats.length > 0 && (
                  <div className={styles.previewFormats}>
                    {previewCard.formats.map((f) => <span key={f} className={styles.previewFormatTag}>{f}</span>)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
