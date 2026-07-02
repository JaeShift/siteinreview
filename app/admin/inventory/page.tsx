"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import type { SingleCard, Condition, CardColor, CardType, Rarity, Availability } from "@/lib/singles-data";
import { formatCondition, formatSetDisplay, normalizeRarity, rarityBadgeLabel } from "@/lib/singles-data";
import styles from "./admin-inventory.module.css";

// ── Scryfall helpers ──────────────────────────────────────────────────────────
interface ScryfallCardFace {
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
  if (fromFaces.length) return [...new Set(fromFaces)];
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
    formats: scryfallFormats(card.legalities),
    price: card.prices?.usd ?? "",
    marketPrice: card.prices?.usd ?? "",
  };
}

async function fetchAllPrints(name: string): Promise<ScryfallCard[]> {
  const escaped = name.replace(/"/g, '\\"');
  let url: string | null =
    `https://api.scryfall.com/cards/search?q=${encodeURIComponent(`!"${escaped}"`)}&unique=prints&order=released&dir=desc`;
  const cards: ScryfallCard[] = [];

  while (url) {
    const res = await fetch(url);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error("Search failed");
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

export default function AdminInventoryPage() {
  const [cards, setCards] = useState<SingleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMode, setAddMode] = useState<null | "choose" | "manual" | "scryfall" | "edit">(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [editCard, setEditCard] = useState<SingleCard | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SingleCard | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [previewCard, setPreviewCard] = useState<SingleCard | null>(null);

  // ── Scryfall search ──────────────────────────────────────────────────────────
  const [sfQuery, setSfQuery] = useState("");
  const [sfSuggestions, setSfSuggestions] = useState<string[]>([]);
  const [sfPrints, setSfPrints] = useState<ScryfallCard[]>([]);
  const [sfCard, setSfCard] = useState<ScryfallCard | null>(null);
  const [sfLoading, setSfLoading] = useState(false);
  const [sfError, setSfError] = useState<string | null>(null);
  const [sfOpen, setSfOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const sfDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sfInputRef = useRef<HTMLInputElement>(null);

  function onSfQueryChange(val: string) {
    setSfQuery(val);
    setSfCard(null);
    setSfPrints([]);
    setSfError(null);
    if (sfDebounce.current) clearTimeout(sfDebounce.current);
    if (val.length < 2) { setSfSuggestions([]); setSfOpen(false); return; }
    sfDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(val)}`);
        const data = await res.json();
        setSfSuggestions(data.data?.slice(0, 8) ?? []);
        setSfOpen(true);
      } catch { setSfSuggestions([]); }
    }, 250);
  }

  function applySfCard(card: ScryfallCard) {
    setSfCard(card);
    setSfPrints([]);
    setForm(populateFormFromScryfall(card));
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
      let prints = await fetchAllPrints(trimmed);

      if (prints.length === 0) {
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

  const allSelected = cards.length > 0 && selected.size === cards.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(cards.map((c) => c.id)));
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    setBulkDeleting(true);
    await Promise.all(
      [...selected].map((id) => fetch(`/api/admin/inventory/${id}`, { method: "DELETE" }))
    );
    setCards((prev) => prev.filter((c) => !selected.has(c.id)));
    setSelected(new Set());
    setBulkDeleting(false);
  }

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/inventory");
    const data = await res.json();
    setCards(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalValue = cards.reduce((s, c) => s + c.price * c.quantity, 0);
  const totalQty = cards.reduce((s, c) => s + c.quantity, 0);
  const setsCount = EDITIONS.length;

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

  const showAddForm = addMode === "manual" || (addMode === "scryfall" && !!sfCard);
  const showImportedLayout = addMode === "scryfall" && !!sfCard;

  function setFinish(foil: boolean) {
    set("foil", foil);
    if (!sfCard) return;
    const market = foil ? sfCard.prices?.usd_foil : sfCard.prices?.usd;
    if (market) { set("price", market); set("marketPrice", market); }
  }

  function resetImportSearch() {
    setSfCard(null);
    setSfPrints([]);
    setSfQuery("");
    setForm({ ...BLANK_FORM });
    setAdvancedOpen(false);
  }

  function backToPrintPicker() {
    setSfCard(null);
    setForm({ ...BLANK_FORM });
    setAdvancedOpen(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Inventory</h1>
          <p className={styles.subtitle}>{cards.length} unique cards · {totalQty} total copies</p>
        </div>
        <div className={styles.headerActions}>
          <button className="btn btn-primary" onClick={() => setAddMode("choose")}>
            + Add Card
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Total Cards</span>
          <span className={styles.statValue}>{cards.length}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Total Copies</span>
          <span className={styles.statValue}>{totalQty}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Estimated Value</span>
          <span className={styles.statValue}>${totalValue.toFixed(2)}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Sets Represented</span>
          <span className={styles.statValue}>{setsCount}</span>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkCount}>{selected.size} card{selected.size !== 1 ? "s" : ""} selected</span>
          <div className={styles.bulkActions}>
            <button className={`btn btn-outline ${styles.bulkDeselectBtn}`} onClick={() => setSelected(new Set())} disabled={bulkDeleting}>
              Deselect All
            </button>
            {selected.size === 1 && (
              <button
                className={`btn btn-outline ${styles.editBtn}`}
                disabled={bulkDeleting}
                onClick={() => {
                  const id = [...selected][0];
                  const card = cards.find((c) => c.id === id);
                  if (card) startEdit(card);
                }}
              >
                Edit
              </button>
            )}
            <button className={`btn btn-primary ${styles.dangerBtn}`} onClick={bulkDelete} disabled={bulkDeleting}>
              {bulkDeleting ? "Deleting…" : `Delete ${selected.size}`}
            </button>
          </div>
        </div>
      )}

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
          <span>Set</span>
          <span>Condition</span>
          <span>Foil</span>
          <span>Rarity</span>
          <span>Price</span>
          <span>Qty</span>
          <span>Market $</span>
          <span>Visibility</span>
        </div>
        {loading ? (
          <div className={styles.emptyState}>Loading…</div>
        ) : cards.length === 0 ? (
          <div className={styles.emptyState}>No cards in inventory. Add one to get started.</div>
        ) : (
          cards.map((card) => (
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
              <span className={styles.thumbCell} onClick={() => setPreviewCard(card)}>
                {card.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.imageUrl} alt={card.name} className={styles.thumb} />
                ) : (
                  <span className={styles.thumbEmpty}>?</span>
                )}
              </span>
              <span className={styles.cardName}>{card.name}</span>
              <span className={styles.setCode}>
                {formatSetDisplay(card.set, card.setCode, card.collectorNumber)}
              </span>
              <span className={styles.condition}>{card.condition}</span>
              <span className={`${styles.foil} ${card.foil ? styles.foilYes : ""}`}>
                {card.foil ? "Foil" : "—"}
              </span>
              <span
                className={`${styles.rarityBadge} ${styles[`rarity_${normalizeRarity(card.rarity).replace(/\s+/g, "")}`] ?? ""}`}
                title={normalizeRarity(card.rarity)}
              >
                {rarityBadgeLabel(card.rarity)}
              </span>
              <span className={styles.price}>{formatAmount(card.price)}</span>
              <span className={`${styles.qty} ${card.quantity <= 2 ? styles.qtyLow : ""}`}>{card.quantity}</span>
              <span className={styles.total} title="Scryfall market price">
                {card.marketPrice !== undefined ? formatAmount(card.marketPrice) : "—"}
              </span>
              <button
                className={`${styles.visibilityBtn} ${card.hidden ? styles.visibilityHidden : styles.visibilityLive}`}
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
            </div>
          ))
        )}
      </div>

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
                  <label className={styles.label}>Market Price ($)</label>
                  <input className={styles.input} type="number" min="0" step="0.01" value={form.marketPrice} onChange={(e) => set("marketPrice", e.target.value)} placeholder="Scryfall market value" />
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
                onClick={() => { setForm({ ...BLANK_FORM }); setError(null); setSfQuery(""); setSfCard(null); setSfPrints([]); setSfSuggestions([]); setSfError(null); setAdvancedOpen(false); setAddMode("scryfall"); }}
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

      {/* ── Add Card Modal ─────────────────────────────────────────────────── */}
      {(addMode === "manual" || addMode === "scryfall") && (
        <div className={styles.overlay} onClick={() => setAddMode(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {addMode === "scryfall" && sfPrints.length > 0 && !sfCard
                  ? "Select Printing"
                  : addMode === "scryfall" && !sfCard
                    ? "Search Database"
                    : "Add Card to Inventory"}
              </h2>
              <button className={styles.modalClose} onClick={() => setAddMode(null)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {error && <div className={styles.formError}>{error}</div>}

              {/* ── Database Search ── */}
              {addMode === "scryfall" && !sfCard && sfPrints.length === 0 && <div className={styles.sfSection}>
                <p className={styles.sfLabel}>SEARCH TO AUTOFILL CARD DETAILS</p>
                <div className={styles.sfSearchWrap}>
                  <div className={styles.sfInputWrap}>
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
                  {sfQuery && !sfLoading && (
                    <button type="button" className={styles.sfFetchBtn} onClick={() => fetchPrintsForName(sfQuery)}>
                      Search
                    </button>
                  )}
                </div>
                {sfError && <p className={styles.sfErr}>{sfError}</p>}
              </div>}

              {/* ── Print Picker ── */}
              {addMode === "scryfall" && sfPrints.length > 0 && !sfCard && (
                <section className={styles.printPicker}>
                  <div className={styles.printPickerHeader}>
                    <div>
                      <p className={styles.sfLabel}>SELECT A PRINTING</p>
                      <p className={styles.printPickerSub}>
                        {sfPrints.length} printing{sfPrints.length !== 1 ? "s" : ""} found for <strong>{sfQuery}</strong>
                      </p>
                    </div>
                    <button type="button" className={styles.changeCardBtn} onClick={resetImportSearch}>
                      New search
                    </button>
                  </div>
                  <div className={styles.printGrid}>
                    {sfPrints.map((print) => {
                      const img = scryfallImage(print);
                      return (
                        <button
                          key={print.id}
                          type="button"
                          className={styles.printOption}
                          onClick={() => applySfCard(print)}
                        >
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={print.name} className={styles.printOptionImg} />
                          ) : (
                            <div className={styles.printOptionImgEmpty}>No image</div>
                          )}
                          <span className={styles.printOptionSet}>
                            {formatSetDisplay(print.set_name, print.set.toUpperCase(), print.collector_number)}
                          </span>
                          <span className={styles.printOptionMeta}>
                            {scryfallRarity(print.rarity)}
                            {print.prices?.usd ? ` · $${print.prices.usd}` : ""}
                          </span>
                        </button>
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
                        <input className={styles.detailInput} type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0.00" required />
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

              {showAddForm ? (
              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-outline" onClick={() => setAddMode(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Add to Inventory"}
                </button>
              </div>
              ) : addMode === "scryfall" && !sfCard && (
              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-outline" onClick={() => setAddMode(null)}>Cancel</button>
              </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ── Card Preview Modal ─────────────────────────────────────────────── */}
      {previewCard && (
        <div className={styles.overlay} onClick={() => setPreviewCard(null)}>
          <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.previewClose} onClick={() => setPreviewCard(null)}>✕</button>
            <div className={styles.previewInner}>
              {previewCard.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewCard.imageUrl} alt={previewCard.name} className={styles.previewImg} />
              ) : (
                <div className={styles.previewNoImg}>No image</div>
              )}
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
