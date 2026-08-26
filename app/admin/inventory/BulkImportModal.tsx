"use client";

import { useState, useRef } from "react";
import type { Condition, CardColor, CardType, Rarity } from "@/lib/singles-data";
import styles from "./admin-inventory.module.css";

// ── CSV parser ──────────────────────────────────────────────────────────────
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, ""));
  const rows = lines.slice(1).map((l) => parseCsvLine(l));
  return { headers, rows };
}

const HEADER_ALIASES: Record<string, string> = {
  // name
  name: "name", cardname: "name", card: "name",
  // set
  set: "set", edition: "set", setname: "set",
  // setCode
  setcode: "setCode", code: "setCode",
  // condition
  condition: "condition", cond: "condition", quality: "condition",
  // foil
  foil: "foil", finish: "foil",
  // price
  price: "price", listprice: "price", sellingprice: "price",
  // quantity
  quantity: "quantity", qty: "quantity", count: "quantity", stock: "quantity",
  // collectorNumber
  collectornumber: "collectorNumber", "#": "collectorNumber", number: "collectorNumber",
  // rarity
  rarity: "rarity",
};

export interface BulkRow {
  name: string;
  set: string;
  setCode: string;
  condition: Condition;
  foil: boolean;
  price: string;
  quantity: string;
  rarity: Rarity;
  color: CardColor;
  type: CardType;
  imageUrl: string;
  collectorNumber: string;
  // enrichment state
  enriched: boolean;
  enrichError?: string;
}

const BLANK_ROW: BulkRow = {
  name: "", set: "", setCode: "", condition: "NM", foil: false,
  price: "", quantity: "1", rarity: "Common", color: "Colorless",
  type: "Creature", imageUrl: "", collectorNumber: "",
  enriched: false,
};

function parseRowsFromCsv(text: string): BulkRow[] {
  const { headers, rows } = parseCsv(text);
  if (!headers.length) return [];

  const colMap: Record<string, number> = {};
  headers.forEach((h, i) => {
    const canonical = HEADER_ALIASES[h];
    if (canonical) colMap[canonical] = i;
  });

  return rows
    .filter((r) => r.some((c) => c.trim()))
    .map((r) => {
      const get = (key: string) => (colMap[key] !== undefined ? r[colMap[key]] ?? "" : "");
      const foilRaw = get("foil").toLowerCase();
      const foil = foilRaw === "true" || foilRaw === "yes" || foilRaw === "foil" || foilRaw === "1";
      const cond = (get("condition").toUpperCase() || "NM") as Condition;
      return {
        ...BLANK_ROW,
        name: get("name"),
        set: get("set"),
        setCode: get("setCode").toUpperCase() || get("set").slice(0, 3).toUpperCase(),
        condition: ["NM", "LP", "MP", "HP", "DMG"].includes(cond) ? cond : "NM",
        foil,
        price: get("price"),
        quantity: get("quantity") || "1",
        collectorNumber: get("collectorNumber"),
      };
    })
    .filter((r) => r.name);
}

async function enrichFromScryfall(row: BulkRow): Promise<BulkRow> {
  try {
    const q = row.setCode
      ? `!"${row.name.replace(/"/g, '\\"')}" e:${row.setCode.toLowerCase()}`
      : `!"${row.name.replace(/"/g, '\\"')}"`;
    const res = await fetch(
      `https://api.scryfall.com/cards/search?q=${encodeURIComponent(q)}&unique=prints&order=released&dir=desc`
    );
    if (!res.ok) {
      const fuzzy = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(row.name)}`);
      if (!fuzzy.ok) return { ...row, enrichError: "Not found on Scryfall" };
      const card = await fuzzy.json();
      return applyScryfall(row, card);
    }
    const data = await res.json();
    const card = data.data?.[0];
    if (!card) return { ...row, enrichError: "No results" };
    return applyScryfall(row, card);
  } catch {
    return { ...row, enrichError: "Scryfall error" };
  }
}

function applyScryfall(row: BulkRow, card: {
  set_name: string; set: string; collector_number?: string; rarity: string;
  type_line?: string; colors?: string[]; color_identity?: string[];
  image_uris?: { normal: string }; card_faces?: { image_uris?: { normal: string }; colors?: string[] }[];
  prices?: { usd?: string };
}): BulkRow {
  const colors = card.colors?.length ? card.colors
    : card.card_faces?.flatMap((f) => f.colors ?? []) ?? [];
  const colorMap: Record<string, CardColor> = { W: "W", U: "U", B: "B", R: "R", G: "G" };
  const color: CardColor = colors.length === 0 ? "Colorless" : colors.length > 1 ? "Multi" : colorMap[colors[0]] ?? "Colorless";
  const rarityMap: Record<string, Rarity> = { common: "Common", uncommon: "Uncommon", rare: "Rare", mythic: "Mythic Rare" };
  const rarity: Rarity = rarityMap[card.rarity?.toLowerCase()] ?? "Common";
  const types: CardType[] = ["Creature", "Instant", "Sorcery", "Enchantment", "Artifact", "Planeswalker", "Land", "Battle", "Kindred", "Legendary"];
  const type: CardType = types.find((t) => (card.type_line ?? "").includes(t)) ?? "Creature";
  const imageUrl = card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal ?? "";
  const price = row.price || card.prices?.usd || "";
  return {
    ...row, set: card.set_name, setCode: card.set.toUpperCase(),
    collectorNumber: row.collectorNumber || card.collector_number || "",
    color, rarity, type, imageUrl, price: String(price), enriched: true, enrichError: undefined,
  };
}

interface Props {
  onClose: () => void;
  onImported: (count: number) => void;
}

const TEMPLATE = `name,set,setCode,condition,foil,price,quantity
Lightning Bolt,Magic 2011,M11,NM,false,2.50,4
Counterspell,Masters 25,A25,LP,false,1.25,2
Black Lotus,Alpha,LEA,NM,false,1000.00,1
`;

export default function BulkImportModal({ onClose, onImported }: Props) {
  const [step, setStep] = useState<"input" | "preview" | "result">("input");
  const [csvText, setCsvText] = useState("");
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [enriching, setEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: { index: number; name: string; error: string }[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleParse() {
    const parsed = parseRowsFromCsv(csvText);
    if (!parsed.length) return;
    setRows(parsed);
    setStep("preview");
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCsvText(String(ev.target?.result ?? "")); };
    reader.readAsText(file);
  }

  async function handleEnrich() {
    setEnriching(true);
    setEnrichProgress(0);
    const enriched = [...rows];
    for (let i = 0; i < enriched.length; i++) {
      if (!enriched[i].enriched) {
        enriched[i] = await enrichFromScryfall(enriched[i]);
        // Small delay to avoid rate-limiting Scryfall
        await new Promise((r) => setTimeout(r, 100));
      }
      setEnrichProgress(i + 1);
      setRows([...enriched]);
    }
    setEnriching(false);
  }

  async function handleImport() {
    setImporting(true);
    const payload = rows.map((r) => ({
      name: r.name, set: r.set, setCode: r.setCode,
      collectorNumber: r.collectorNumber || undefined,
      condition: r.condition, foil: r.foil,
      price: parseFloat(r.price) || 0,
      quantity: parseInt(r.quantity) || 1,
      imageUrl: r.imageUrl, color: r.color,
      type: r.type, rarity: r.rarity,
    }));
    const res = await fetch("/api/admin/inventory/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setResult(data);
    setStep("result");
    setImporting(false);
    if (data.created > 0) onImported(data.created);
  }

  function updateRow(i: number, patch: Partial<BulkRow>) {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }

  const hasErrors = rows.some((r) => !r.name || !r.set || !r.price);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.bulkModal}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {step === "input" ? "Bulk Import Cards" : step === "preview" ? `Preview — ${rows.length} cards` : "Import Complete"}
          </h2>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          {/* ── Step 1: CSV Input ── */}
          {step === "input" && (
            <div className={styles.bulkInputStep}>
              <p className={styles.bulkDesc}>
                Paste a CSV or upload a file. Required columns: <code>name</code>, <code>set</code>, <code>price</code>.
                Optional: <code>setCode</code>, <code>condition</code>, <code>foil</code>, <code>quantity</code>, <code>collectorNumber</code>.
              </p>
              <div className={styles.bulkTemplateRow}>
                <span className={styles.bulkTemplateLabel}>Example format:</span>
                <button
                  className={styles.bulkTemplateBtn}
                  onClick={() => setCsvText(TEMPLATE)}
                  type="button"
                >
                  Load template
                </button>
              </div>
              <textarea
                className={styles.bulkTextarea}
                placeholder={TEMPLATE}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                spellCheck={false}
              />
              <div className={styles.bulkFileRow}>
                <span className={styles.bulkFileLabel}>Or upload a .csv file:</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className={styles.bulkFileInput}
                  onChange={handleFile}
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Preview table ── */}
          {step === "preview" && (
            <div className={styles.bulkPreviewStep}>
              <div className={styles.bulkPreviewActions}>
                <button
                  className={`btn btn-outline ${styles.bulkEnrichBtn}`}
                  onClick={handleEnrich}
                  disabled={enriching}
                  type="button"
                >
                  {enriching
                    ? `Enriching… ${enrichProgress}/${rows.length}`
                    : `✦ Enrich from Scryfall (${rows.filter(r => !r.enriched).length} pending)`}
                </button>
                <span className={styles.bulkPreviewHint}>
                  Enrichment auto-fills image, rarity, type & color from Scryfall.
                </span>
              </div>

              <div className={styles.bulkTableWrap}>
                <table className={styles.bulkTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name *</th>
                      <th>Set *</th>
                      <th>Code</th>
                      <th>Cond</th>
                      <th>Foil</th>
                      <th>Price *</th>
                      <th>Qty</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => {
                      const rowError = !row.name || !row.set || !row.price;
                      return (
                        <tr key={i} className={rowError ? styles.bulkRowError : row.enriched ? styles.bulkRowEnriched : ""}>
                          <td className={styles.bulkNumCell}>{i + 1}</td>
                          <td>
                            <input
                              className={styles.bulkCellInput}
                              value={row.name}
                              onChange={(e) => updateRow(i, { name: e.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              className={styles.bulkCellInput}
                              value={row.set}
                              onChange={(e) => updateRow(i, { set: e.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              className={`${styles.bulkCellInput} ${styles.bulkCellInputSm}`}
                              value={row.setCode}
                              onChange={(e) => updateRow(i, { setCode: e.target.value.toUpperCase() })}
                              maxLength={6}
                            />
                          </td>
                          <td>
                            <select
                              className={styles.bulkCellSelect}
                              value={row.condition}
                              onChange={(e) => updateRow(i, { condition: e.target.value as Condition })}
                            >
                              {(["NM","LP","MP","HP","DMG"] as Condition[]).map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </td>
                          <td className={styles.bulkCellCenter}>
                            <input
                              type="checkbox"
                              checked={row.foil}
                              onChange={(e) => updateRow(i, { foil: e.target.checked })}
                            />
                          </td>
                          <td>
                            <input
                              className={`${styles.bulkCellInput} ${styles.bulkCellInputSm}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={row.price}
                              onChange={(e) => updateRow(i, { price: e.target.value })}
                              placeholder="0.00"
                            />
                          </td>
                          <td>
                            <input
                              className={`${styles.bulkCellInput} ${styles.bulkCellInputSm}`}
                              type="number"
                              min="1"
                              step="1"
                              value={row.quantity}
                              onChange={(e) => updateRow(i, { quantity: e.target.value })}
                            />
                          </td>
                          <td className={styles.bulkStatusCell}>
                            {row.enrichError ? (
                              <span className={styles.bulkStatusErr} title={row.enrichError}>⚠ {row.enrichError}</span>
                            ) : row.enriched ? (
                              <span className={styles.bulkStatusOk}>✓ Enriched</span>
                            ) : rowError ? (
                              <span className={styles.bulkStatusErr}>Missing fields</span>
                            ) : (
                              <span className={styles.bulkStatusPending}>Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Step 3: Result ── */}
          {step === "result" && result && (
            <div className={styles.bulkResultStep}>
              <div className={styles.bulkResultSummary}>
                <div className={styles.bulkResultStat}>
                  <span className={styles.bulkResultNum}>{result.created}</span>
                  <span className={styles.bulkResultLabel}>Cards Imported</span>
                </div>
                {result.errors.length > 0 && (
                  <div className={styles.bulkResultStat}>
                    <span className={`${styles.bulkResultNum} ${styles.bulkResultNumErr}`}>{result.errors.length}</span>
                    <span className={styles.bulkResultLabel}>Errors</span>
                  </div>
                )}
              </div>
              {result.errors.length > 0 && (
                <div className={styles.bulkErrorList}>
                  <p className={styles.bulkErrorListTitle}>Errors:</p>
                  {result.errors.map((e, i) => (
                    <p key={i} className={styles.bulkErrorItem}>Row {e.index + 1} — {e.name}: {e.error}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          {step === "input" && (
            <>
              <button className="btn btn-outline" onClick={onClose} type="button">Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleParse}
                disabled={!csvText.trim()}
                type="button"
              >
                Preview →
              </button>
            </>
          )}
          {step === "preview" && (
            <>
              <button
                className="btn btn-outline"
                onClick={() => setStep("input")}
                disabled={enriching || importing}
                type="button"
              >
                ← Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleImport}
                disabled={importing || enriching || hasErrors}
                type="button"
              >
                {importing ? "Importing…" : `Import ${rows.length} Cards`}
              </button>
            </>
          )}
          {step === "result" && (
            <button className="btn btn-primary" onClick={onClose} type="button">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
