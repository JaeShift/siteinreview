"use client";

import { useState } from "react";
import Image from "next/image";
import type { MenuItem, MenuCategory, GlassType } from "@/lib/menu-data";
import type { StoredMenu } from "@/lib/store";
import styles from "./admin-menu.module.css";

const TAPLIST_IMG = "https://newmedia.taplist.io/img/glassware";

const GLASS_OPTIONS: GlassType[] = [
  "tulip-pint", "tulip", "pilsner", "shaker-pint",
  "snifter", "cabernet", "highball", "martini", "mason-mug",
];

const CATEGORIES: MenuCategory[] = ["On Tap", "Wine", "Mixed Drinks"];

const EMPTY_ITEM: MenuItem & { category: MenuCategory } = {
  category: "On Tap",
  name: "",
  brewery: "Kitsune Brewing Co.",
  style: "",
  abv: "",
  srm: "",
  size: "",
  price: "",
  glassType: "pilsner",
  glassColor: "f9e09f",
};

interface Props {
  initialMenu: StoredMenu;
}

export default function MenuAdminClient({ initialMenu }: Props) {
  const [menu, setMenu] = useState<StoredMenu>(initialMenu);
  const [editing, setEditing] = useState<{
    category: MenuCategory;
    index: number;
    item: MenuItem & { category: MenuCategory };
  } | null>(null);
  const [adding, setAdding] = useState<(MenuItem & { category: MenuCategory }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  function showFlash(msg: string, type: "success" | "error" = "success") {
    setFlash({ msg, type });
    setTimeout(() => setFlash(null), 3000);
  }

  // ── Add ──────────────────────────────────────────────────────────────────

  function openAdd(category: MenuCategory = "On Tap") {
    setAdding({ ...EMPTY_ITEM, category });
  }

  async function handleAdd() {
    if (!adding) return;
    setSaving(true);
    try {
      const { category, ...item } = adding;
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, item }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMenu(await res.json());
      setAdding(null);
      showFlash("Item added successfully.");
    } catch {
      showFlash("Failed to add item.", "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────

  function openEdit(category: MenuCategory, index: number) {
    const item = menu[category]?.[index];
    if (item) setEditing({ category, index, item: { ...item, category } });
  }

  async function handleSaveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const { category, index, item } = editing;
      const { category: _cat, ...cleanItem } = item;
      const res = await fetch(`/api/admin/menu/${encodeURIComponent(category)}/${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanItem),
      });
      if (!res.ok) throw new Error(await res.text());
      setMenu(await res.json());
      setEditing(null);
      showFlash("Item updated.");
    } catch {
      showFlash("Failed to update item.", "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  async function handleDelete(category: MenuCategory, index: number) {
    const key = `${category}-${index}`;
    setDeletingKey(key);
    try {
      const res = await fetch(`/api/admin/menu/${encodeURIComponent(category)}/${index}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      setMenu(await res.json());
      showFlash("Item deleted.");
    } catch {
      showFlash("Failed to delete item.", "error");
    } finally {
      setDeletingKey(null);
    }
  }

  // ── Form helper ──────────────────────────────────────────────────────────

  function ItemForm({
    item,
    onChange,
    onSave,
    onCancel,
    title,
  }: {
    item: MenuItem & { category: MenuCategory };
    onChange: (field: string, value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    title: string;
  }) {
    return (
      <div className={styles.modalOverlay} onClick={onCancel}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{title}</h2>
            <button className={styles.closeBtn} onClick={onCancel} aria-label="Close">✕</button>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={item.category}
                onChange={(e) => onChange("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className="form-label">Name *</label>
              <input
                className="form-input"
                value={item.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="e.g. What the Jorts"
              />
            </div>

            <div className={styles.formGroup}>
              <label className="form-label">Brewery *</label>
              <input
                className="form-input"
                value={item.brewery}
                onChange={(e) => onChange("brewery", e.target.value)}
                placeholder="e.g. Kitsune Brewing Co."
              />
            </div>

            <div className={styles.formGroup}>
              <label className="form-label">Style</label>
              <input
                className="form-input"
                value={item.style ?? ""}
                onChange={(e) => onChange("style", e.target.value)}
                placeholder="e.g. Hazy IPA"
              />
            </div>

            <div className={styles.formGroup}>
              <label className="form-label">ABV</label>
              <input
                className="form-input"
                value={item.abv ?? ""}
                onChange={(e) => onChange("abv", e.target.value)}
                placeholder="e.g. 6.5%"
              />
            </div>

            <div className={styles.formGroup}>
              <label className="form-label">SRM (beer color number)</label>
              <input
                className="form-input"
                value={item.srm ?? ""}
                onChange={(e) => onChange("srm", e.target.value)}
                placeholder="e.g. 4"
              />
            </div>

            <div className={styles.formGroup}>
              <label className="form-label">Size *</label>
              <input
                className="form-input"
                value={item.size}
                onChange={(e) => onChange("size", e.target.value)}
                placeholder="e.g. 16 oz draft"
              />
            </div>

            <div className={styles.formGroup}>
              <label className="form-label">Price *</label>
              <input
                className="form-input"
                value={item.price}
                onChange={(e) => onChange("price", e.target.value)}
                placeholder="e.g. $7"
              />
            </div>

            <div className={styles.formGroup}>
              <label className="form-label">Glass Type</label>
              <select
                className="form-input"
                value={item.glassType}
                onChange={(e) => onChange("glassType", e.target.value)}
              >
                {GLASS_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className="form-label">Glass Color (hex, no #)</label>
              <div className={styles.colorRow}>
                <input
                  type="color"
                  className={styles.colorSwatch}
                  value={`#${item.glassColor}`}
                  onChange={(e) => onChange("glassColor", e.target.value.replace("#", ""))}
                />
                <input
                  className="form-input"
                  value={item.glassColor}
                  onChange={(e) => onChange("glassColor", e.target.value.replace("#", ""))}
                  placeholder="e.g. f9e09f"
                  maxLength={6}
                />
                {item.glassType && item.glassColor && (
                  <Image
                    src={`${TAPLIST_IMG}/${item.glassType}?color=${item.glassColor}`}
                    alt="preview"
                    width={40}
                    height={40}
                    unoptimized
                  />
                )}
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button className="btn btn-outline" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={onSave}
              disabled={saving || !item.name || !item.brewery || !item.size || !item.price}
            >
              {saving ? "Saving…" : "Save Item"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      {/* Flash */}
      {flash && (
        <div className={`${styles.flash} ${flash.type === "error" ? styles.flashError : styles.flashSuccess}`}>
          {flash.msg}
        </div>
      )}

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Menu Management</h1>
          <p className={styles.pageDesc}>
            Add, edit, or remove items from the What&rsquo;s On Tap menu. Changes reflect on the homepage immediately.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openAdd()}>
          + Add Item
        </button>
      </div>

      {/* Category sections */}
      {CATEGORIES.map((category) => {
        const items = menu[category] ?? [];
        return (
          <div key={category} className={styles.categorySection}>
            <div className={styles.categoryHeader}>
              <h2 className={styles.categoryTitle}>{category}</h2>
              <span className={styles.categoryCount}>{items.length} item{items.length !== 1 ? "s" : ""}</span>
              <button
                className="btn btn-outline"
                style={{ marginLeft: "auto", fontSize: "13px", padding: "6px 14px" }}
                onClick={() => openAdd(category)}
              >
                + Add to {category}
              </button>
            </div>

            {items.length === 0 ? (
              <p className={styles.emptyMsg}>No items in this category yet.</p>
            ) : (
              <div className={styles.itemsTable}>
                <div className={styles.tableHead}>
                  <span>Item</span>
                  <span>Style / ABV</span>
                  <span>Size</span>
                  <span>Price</span>
                  <span>Glass</span>
                  <span>Actions</span>
                </div>
                {items.map((item, idx) => (
                  <div key={`${item.name}-${idx}`} className={styles.tableRow}>
                    <div className={styles.itemName}>
                      <strong>{item.name}</strong>
                      <small>{item.brewery}</small>
                    </div>
                    <div className={styles.itemMeta}>
                      {item.style && <span>{item.style}</span>}
                      {item.abv && <span>{item.abv}</span>}
                    </div>
                    <div>{item.size}</div>
                    <div className={styles.price}>{item.price}</div>
                    <div className={styles.glassCell}>
                      <Image
                        src={`${TAPLIST_IMG}/${item.glassType}?color=${item.glassColor}`}
                        alt={item.glassType}
                        width={32}
                        height={32}
                        unoptimized
                      />
                    </div>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => openEdit(category, idx)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteBtn}
                        disabled={deletingKey === `${category}-${idx}`}
                        onClick={() => {
                          if (confirm(`Delete "${item.name}"?`)) handleDelete(category, idx);
                        }}
                      >
                        {deletingKey === `${category}-${idx}` ? "…" : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Edit Modal */}
      {editing && (
        <ItemForm
          title={`Edit: ${editing.item.name}`}
          item={editing.item}
          onChange={(field, value) =>
            setEditing((prev) => prev ? { ...prev, item: { ...prev.item, [field]: value } } : null)
          }
          onSave={handleSaveEdit}
          onCancel={() => setEditing(null)}
        />
      )}

      {/* Add Modal */}
      {adding && (
        <ItemForm
          title="Add Menu Item"
          item={adding}
          onChange={(field, value) =>
            setAdding((prev) => prev ? { ...prev, [field]: value } : null)
          }
          onSave={handleAdd}
          onCancel={() => setAdding(null)}
        />
      )}
    </div>
  );
}
