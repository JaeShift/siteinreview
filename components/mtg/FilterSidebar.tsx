"use client";

import type { SinglesFilters, Condition, CardColor, CardType, Rarity, SortOption } from "@/lib/singles-data";
import { availableSets } from "@/lib/singles-data";
import styles from "./FilterSidebar.module.css";

interface Props {
  filters: SinglesFilters;
  onChange: (filters: SinglesFilters) => void;
  totalResults: number;
}

const CONDITIONS: Condition[] = ["NM", "LP", "MP", "HP", "DMG"];
const COLORS: { code: CardColor; label: string; symbol: string }[] = [
  { code: "W", label: "White", symbol: "☀" },
  { code: "U", label: "Blue", symbol: "💧" },
  { code: "B", label: "Black", symbol: "💀" },
  { code: "R", label: "Red", symbol: "🔥" },
  { code: "G", label: "Green", symbol: "🌲" },
  { code: "Multi", label: "Multicolor", symbol: "★" },
  { code: "Colorless", label: "Colorless", symbol: "◇" },
];
const TYPES: CardType[] = ["Creature", "Instant", "Sorcery", "Enchantment", "Artifact", "Planeswalker", "Land", "Battle"];
const RARITIES: Rarity[] = ["Mythic", "Rare", "Uncommon", "Common"];
const SORTS: { value: SortOption; label: string }[] = [
  { value: "name-asc",   label: "Name: A → Z" },
  { value: "name-desc",  label: "Name: Z → A" },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "newest",     label: "Recently Added" },
];

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export default function FilterSidebar({ filters, onChange, totalResults }: Props) {
  const set = <K extends keyof SinglesFilters>(key: K, value: SinglesFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const clearAll = () =>
    onChange({
      search: filters.search,
      sets: [],
      conditions: [],
      colors: [],
      types: [],
      rarities: [],
      foilOnly: false,
      minPrice: 0,
      maxPrice: 0,
      sort: "name-asc",
    });

  const hasActiveFilters =
    filters.sets.length > 0 ||
    filters.conditions.length > 0 ||
    filters.colors.length > 0 ||
    filters.types.length > 0 ||
    filters.rarities.length > 0 ||
    filters.foilOnly ||
    filters.minPrice > 0 ||
    filters.maxPrice > 0;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Filters</h2>
        <span className={styles.resultCount}>{totalResults} results</span>
        {hasActiveFilters && (
          <button className={styles.clearAll} onClick={clearAll}>Clear All</button>
        )}
      </div>

      {/* Sort */}
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Sort By</h3>
        <select
          className={`form-input ${styles.select}`}
          value={filters.sort}
          onChange={(e) => set("sort", e.target.value as SortOption)}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Price Range</h3>
        <div className={styles.priceRow}>
          <input
            type="number"
            className={`form-input ${styles.priceInput}`}
            placeholder="Min"
            min={0}
            value={filters.minPrice || ""}
            onChange={(e) => set("minPrice", Number(e.target.value))}
          />
          <span className={styles.priceSep}>–</span>
          <input
            type="number"
            className={`form-input ${styles.priceInput}`}
            placeholder="Max"
            min={0}
            value={filters.maxPrice || ""}
            onChange={(e) => set("maxPrice", Number(e.target.value))}
          />
        </div>
      </div>

      {/* Foil */}
      <div className={styles.group}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={filters.foilOnly}
            onChange={(e) => set("foilOnly", e.target.checked)}
          />
          <span className={styles.checkboxText}>Foil Only</span>
        </label>
      </div>

      {/* Condition */}
      <FilterGroup title="Condition">
        {CONDITIONS.map((c) => (
          <FilterCheckbox
            key={c}
            checked={filters.conditions.includes(c)}
            onChange={() => set("conditions", toggle(filters.conditions, c))}
            label={c}
          />
        ))}
      </FilterGroup>

      {/* Rarity */}
      <FilterGroup title="Rarity">
        {RARITIES.map((r) => (
          <FilterCheckbox
            key={r}
            checked={filters.rarities.includes(r)}
            onChange={() => set("rarities", toggle(filters.rarities, r))}
            label={r}
          />
        ))}
      </FilterGroup>

      {/* Color */}
      <FilterGroup title="Color">
        <div className={styles.colorGrid}>
          {COLORS.map(({ code, label, symbol }) => (
            <button
              key={code}
              className={`${styles.colorBtn} ${filters.colors.includes(code) ? styles.colorBtnActive : ""}`}
              onClick={() => set("colors", toggle(filters.colors, code))}
              title={label}
              aria-pressed={filters.colors.includes(code)}
            >
              {symbol}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Type */}
      <FilterGroup title="Type">
        {TYPES.map((t) => (
          <FilterCheckbox
            key={t}
            checked={filters.types.includes(t)}
            onChange={() => set("types", toggle(filters.types, t))}
            label={t}
          />
        ))}
      </FilterGroup>

      {/* Set */}
      <FilterGroup title="Set">
        {availableSets.map((s) => (
          <FilterCheckbox
            key={s.code}
            checked={filters.sets.includes(s.code)}
            onChange={() => set("sets", toggle(filters.sets, s.code))}
            label={`${s.name} (${s.code})`}
          />
        ))}
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <div className={styles.groupItems}>{children}</div>
    </div>
  );
}

function FilterCheckbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className={styles.checkboxLabel}>
      <input type="checkbox" className={styles.checkbox} checked={checked} onChange={onChange} />
      <span className={styles.checkboxText}>{label}</span>
    </label>
  );
}
