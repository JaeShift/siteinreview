"use client";

import { useState } from "react";
import type { SinglesFilters, CardColor, CardType, Rarity } from "@/lib/singles-data";
import styles from "./FilterSidebar.module.css";

interface Props {
  filters: SinglesFilters;
  onChange: (filters: SinglesFilters) => void;
  totalResults: number;
}

type ManaEntry = { code: string; label: string; ms: string };

const MANA_W: ManaEntry  = { code: "W",         label: "White",     ms: "ms-w" };
const MANA_U: ManaEntry  = { code: "U",         label: "Blue",      ms: "ms-u" };
const MANA_B: ManaEntry  = { code: "B",         label: "Black",     ms: "ms-b" };
const MANA_R: ManaEntry  = { code: "R",         label: "Red",       ms: "ms-r" };
const MANA_G: ManaEntry  = { code: "G",         label: "Green",     ms: "ms-g" };
const MANA_CL: ManaEntry = { code: "Colorless", label: "Colorless", ms: "ms-c" };
const MANA_C: ManaEntry  = { code: "C",         label: "Colorless", ms: "ms-c" };

const CARD_COLORS: ManaEntry[]     = [MANA_W, MANA_U, MANA_B, MANA_R, MANA_G, MANA_CL];
const IDENTITY_COLORS: ManaEntry[] = [MANA_W, MANA_U, MANA_B, MANA_R, MANA_G, MANA_C];

const RARITIES     = ["Common", "Uncommon", "Rare", "Mythic Rare", "Land", "Special"];
const FORMATS      = ["Standard", "Modern", "Commander", "Legacy", "Pioneer", "Vintage", "Alchemy", "Historic", "Brawl", "Timeless", "Oathbreaker"];
const TYPES        = ["Creature", "Instant", "Sorcery", "Enchantment", "Artifact", "Planeswalker", "Land", "Battle", "Kindred", "Legendary"];
const AVAILABILITY = ["In Stock", "Presale"];
const EDITIONS     = [
  "Any",
  "Marvel Super Heroes",
  "Secrets of Strixhaven",
  "Teenage Mutant Ninja Turtles",
  "Lorwyn Eclipsed",
  "Avatar: The Last Airbender",
  "Marvel's Spider-Man",
  "Edge of Eternities",
  "Final Fantasy",
];

const PT_OPTIONS = ["Any", "*", ...Array.from({ length: 17 }, (_, i) => String(i))];

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

function Group({
  name, open, onToggle, children,
}: {
  name: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className={styles.group}>
      <button className={styles.groupHeader} onClick={onToggle}>
        <h3 className={styles.groupTitle}>{name}</h3>
        <span className={styles.groupChevron}>{open ? "−" : "+"}</span>
      </button>
      {open && <div className={styles.groupBody}>{children}</div>}
    </div>
  );
}

const DEFAULT_FILTERS: SinglesFilters = {
  search: "",
  sets: [],
  conditions: [],
  colors: [],
  colorIdentity: [],
  types: [],
  rarities: [],
  formats: [],
  availability: [],
  foilOnly: false,
  minPrice: 0,
  maxPrice: 0,
  power: "",
  toughness: "",
  cmc: "",
  oracle: "",
  sort: "name-asc",
};

export default function FilterSidebar({ filters, onChange, totalResults }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    "Card Name": true,
    "Edition": true,
    "Card Color": true,
    "Rarity": true,
    "Price": true,
  });

  const set = <K extends keyof SinglesFilters>(key: K, value: SinglesFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const tog = (name: string) =>
    setOpen((prev) => ({ ...prev, [name]: !prev[name] }));

  const clearAll = () => onChange({ ...DEFAULT_FILTERS, sort: filters.sort });

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>FILTERS</h2>
        <span className={styles.resultCount}>{totalResults} results</span>
      </div>

      {/* 1. Card Name */}
      <Group name="Card Name" open={!!open["Card Name"]} onToggle={() => tog("Card Name")}>
        <input
          type="text"
          className={styles.textInput}
          placeholder="Search by name…"
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
        />
      </Group>

      {/* 2. Edition */}
      <Group name="Edition" open={!!open["Edition"]} onToggle={() => tog("Edition")}>
        <div className={styles.groupItems}>
          {EDITIONS.map((ed) => (
            <label key={ed} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={filters.sets.includes(ed)}
                onChange={() => set("sets", toggle(filters.sets, ed))}
              />
              <span className={styles.checkboxText}>{ed}</span>
            </label>
          ))}
        </div>
      </Group>

      {/* 3. Format */}
      <Group name="Format" open={!!open["Format"]} onToggle={() => tog("Format")}>
        <div className={styles.groupItems}>
          {FORMATS.map((f) => (
            <label key={f} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={filters.formats.includes(f)}
                onChange={() => set("formats", toggle(filters.formats, f))}
              />
              <span className={styles.checkboxText}>{f}</span>
            </label>
          ))}
        </div>
      </Group>

      {/* 4. Availability */}
      <Group name="Availability" open={!!open["Availability"]} onToggle={() => tog("Availability")}>
        <div className={styles.groupItems}>
          {AVAILABILITY.map((a) => (
            <label key={a} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={filters.availability.includes(a)}
                onChange={() => set("availability", toggle(filters.availability, a))}
              />
              <span className={styles.checkboxText}>{a}</span>
            </label>
          ))}
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={filters.foilOnly}
              onChange={(e) => set("foilOnly", e.target.checked)}
            />
            <span className={styles.checkboxText}>✦ Foil Only</span>
          </label>
        </div>
      </Group>

      {/* 5. Card Color */}
      <Group name="Card Color" open={!!open["Card Color"]} onToggle={() => tog("Card Color")}>
        <div className={styles.colorRow}>
          {CARD_COLORS.map(({ code, label, ms }) => (
            <button
              key={code}
              className={`${styles.manaPip} ${filters.colors.includes(code as CardColor) ? styles.manaPipActive : ""}`}
              onClick={() => set("colors", toggle(filters.colors, code as CardColor))}
              title={label}
              aria-pressed={filters.colors.includes(code as CardColor)}
              aria-label={label}
            >
              <i className={`ms ms-cost ${ms} ms-2x`} />
            </button>
          ))}
        </div>
      </Group>

      {/* 6. Color Identity */}
      <Group name="Color Identity" open={!!open["Color Identity"]} onToggle={() => tog("Color Identity")}>
        <div className={styles.colorRow}>
          {IDENTITY_COLORS.map(({ code, label, ms }) => (
            <button
              key={code}
              className={`${styles.manaPip} ${filters.colorIdentity.includes(code) ? styles.manaPipActive : ""}`}
              onClick={() => set("colorIdentity", toggle(filters.colorIdentity, code))}
              title={label}
              aria-label={label}
            >
              <i className={`ms ms-cost ${ms} ms-2x`} />
            </button>
          ))}
        </div>
      </Group>

      {/* 7. Rarity */}
      <Group name="Rarity" open={!!open["Rarity"]} onToggle={() => tog("Rarity")}>
        <div className={styles.rarityGrid}>
          {RARITIES.map((r) => (
            <button
              key={r}
              className={`${styles.rarityBtn} ${filters.rarities.includes(r as Rarity) ? styles.rarityBtnActive : ""}`}
              onClick={() => set("rarities", toggle(filters.rarities, r as Rarity))}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </Group>

      {/* 8. Type */}
      <Group name="Type" open={!!open["Type"]} onToggle={() => tog("Type")}>
        <div className={styles.groupItems}>
          {TYPES.map((t) => (
            <label key={t} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={filters.types.includes(t as CardType)}
                onChange={() => set("types", toggle(filters.types, t as CardType))}
              />
              <span className={styles.checkboxText}>{t}</span>
            </label>
          ))}
        </div>
      </Group>

      {/* 9. Power / Toughness */}
      <Group name="Power/Toughness" open={!!open["Power/Toughness"]} onToggle={() => tog("Power/Toughness")}>
        <div className={styles.ptRow}>
          <div className={styles.ptField}>
            <label className={styles.ptLabel}>Power</label>
            <select className={styles.ptInput} value={filters.power} onChange={(e) => set("power", e.target.value)}>
              {PT_OPTIONS.map((v) => <option key={v} value={v === "Any" ? "" : v}>{v}</option>)}
            </select>
          </div>
          <span className={styles.ptSep}>/</span>
          <div className={styles.ptField}>
            <label className={styles.ptLabel}>Toughness</label>
            <select className={styles.ptInput} value={filters.toughness} onChange={(e) => set("toughness", e.target.value)}>
              {PT_OPTIONS.map((v) => <option key={v} value={v === "Any" ? "" : v}>{v}</option>)}
            </select>
          </div>
        </div>
      </Group>

      {/* 10. Converted Cost */}
      <Group name="Converted Cost" open={!!open["Converted Cost"]} onToggle={() => tog("Converted Cost")}>
        <select className={styles.select} value={filters.cmc} onChange={(e) => set("cmc", e.target.value)}>
          <option value="">Any</option>
          {Array.from({ length: 17 }, (_, i) => (
            <option key={i} value={String(i)}>{i}</option>
          ))}
        </select>
      </Group>

      {/* 11. Price */}
      <Group name="Price" open={!!open["Price"]} onToggle={() => tog("Price")}>
        <div className={styles.priceSliderWrap}>
          <input
            type="range"
            className={styles.priceSlider}
            min={0}
            max={1000}
            step={5}
            value={filters.maxPrice || 1000}
            onChange={(e) => set("maxPrice", Number(e.target.value))}
          />
          <div className={styles.priceLabels}>
            <span>$0</span>
            <span>{filters.maxPrice && filters.maxPrice < 1000 ? `$${filters.maxPrice}` : "$1000+"}</span>
          </div>
        </div>
      </Group>

      {/* 12. Oracle Text */}
      <Group name="Oracle Text" open={!!open["Oracle Text"]} onToggle={() => tog("Oracle Text")}>
        <input
          type="text"
          className={styles.textInput}
          placeholder="Search card text…"
          value={filters.oracle}
          onChange={(e) => set("oracle", e.target.value)}
        />
      </Group>

      <div className={styles.filterBtns}>
        <button className={styles.clearBtn} onClick={clearAll}>
          CLEAR ALL
        </button>
      </div>
    </aside>
  );
}
