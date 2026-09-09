"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  MerchandiseCategory,
  MerchandiseProduct,
} from "@/lib/merchandise-data";
import styles from "./merchandise-admin.module.css";

const emptyForm = {
  name: "",
  description: "",
  category: "Apparel" as MerchandiseCategory,
  price: "",
  quantity: "",
  imageUrl: "",
  sizes: "",
  active: true,
};

export default function MerchandiseAdmin({ onBack }: { onBack: () => void }) {
  const [products, setProducts] = useState<MerchandiseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MerchandiseProduct | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/merchandise");
    if (response.ok) setProducts(await response.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openEditor(product?: MerchandiseProduct) {
    setEditing(product ?? null);
    setForm(product ? {
      name: product.name,
      description: product.description,
      category: product.category,
      price: String(product.price),
      quantity: String(product.quantity),
      imageUrl: product.imageUrl,
      sizes: product.sizes.join(", "),
      active: product.active,
    } : emptyForm);
    setError("");
    setShowForm(true);
  }

  async function uploadImage(file?: File) {
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: data });
    const result = await response.json();
    if (response.ok && result.uploaded?.[0]?.url) {
      setForm((current) => ({ ...current, imageUrl: result.uploaded[0].url }));
    } else {
      setError(result.error ?? result.errors?.[0]?.error ?? "Image upload failed.");
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity),
      sizes: form.sizes.split(",").map((size) => size.trim()).filter(Boolean),
    };
    const response = await fetch(
      editing ? `/api/admin/merchandise/${editing.id}` : "/api/admin/merchandise",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (response.ok) {
      await load();
      setShowForm(false);
      setEditing(null);
    } else {
      const result = await response.json().catch(() => ({}));
      setError(result.error ?? "Unable to save this product.");
    }
    setSaving(false);
  }

  async function remove(product: MerchandiseProduct) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    const response = await fetch(`/api/admin/merchandise/${product.id}`, { method: "DELETE" });
    if (response.ok) setProducts((current) => current.filter((item) => item.id !== product.id));
  }

  async function toggle(product: MerchandiseProduct) {
    const response = await fetch(`/api/admin/merchandise/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !product.active }),
    });
    if (response.ok) {
      const updated = await response.json();
      setProducts((current) => current.map((item) => item.id === updated.id ? updated : item));
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <button className={styles.back} onClick={onBack}>← Inventory</button>
          <h1>Merchandise</h1>
          <p>{products.length} products · {products.reduce((sum, item) => sum + item.quantity, 0)} units</p>
        </div>
        <button className="btn btn-primary" onClick={() => openEditor()}>+ Add Product</button>
      </header>

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <h2>No merchandise yet</h2>
          <p>Add your first item to publish it in the shop.</p>
          <button className="btn btn-primary" onClick={() => openEditor()}>Add Product</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <article className={`${styles.product} ${!product.active ? styles.inactive : ""}`} key={product.id}>
              <div className={styles.productImage}>
                {product.imageUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={product.imageUrl} alt="" />
                  : <span>No image</span>}
              </div>
              <div className={styles.productBody}>
                <span className={styles.category}>{product.category}</span>
                <h2>{product.name}</h2>
                <p>${product.price.toFixed(2)} · {product.quantity} in stock</p>
                {product.sizes.length > 0 && <small>Sizes: {product.sizes.join(", ")}</small>}
              </div>
              <div className={styles.actions}>
                <button onClick={() => toggle(product)}>{product.active ? "Hide" : "Publish"}</button>
                <button onClick={() => openEditor(product)}>Edit</button>
                <button className={styles.delete} onClick={() => remove(product)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showForm && (
        <div className={styles.overlay} onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowForm(false);
        }}>
          <form className={styles.modal} onSubmit={save}>
            <div className={styles.modalHeader}>
              <h2>{editing ? "Edit Product" : "Add Product"}</h2>
              <button type="button" onClick={() => setShowForm(false)}>✕</button>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.fields}>
              <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label>Category
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MerchandiseCategory })}>
                  <option>Apparel</option><option>Drinkware</option><option>Accessories</option><option>Other</option>
                </select>
              </label>
              <label>Price<input required min="0" step="0.01" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
              <label>Stock quantity<input required min="0" step="1" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></label>
              <label className={styles.wide}>Description<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
              <label className={styles.wide}>Sizes <small>Comma-separated, e.g. S, M, L, XL</small><input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} /></label>
              <label className={styles.wide}>Product image
                <input type="file" accept="image/*" onChange={(e) => void uploadImage(e.target.files?.[0])} />
                <input placeholder="/images/product.jpg or https://…" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              </label>
              <label className={`${styles.wide} ${styles.check}`}><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Publish in shop</label>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Product"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
