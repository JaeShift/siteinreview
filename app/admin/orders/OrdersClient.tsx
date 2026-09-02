"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Layers, Package, Sparkles } from "lucide-react";
import type { Order } from "@/lib/store";
import styles from "./admin-orders.module.css";

const STORAGE_LAST_VISITED = "kitsune_orders_last_visited";
const STORAGE_KNOWN = "kitsune_orders_known_count";

type Category = "events" | "prerelease" | "cards" | "merchandise";

const CATEGORIES: { id: Category; label: string; Icon: React.ElementType; desc: string }[] = [
  { id: "events",      label: "Ticketed Events", Icon: CalendarDays,  desc: "Commander Nights, Tournaments" },
  { id: "prerelease",  label: "Pre-Release", Icon: Sparkles,      desc: "Set Prereleases, Launch Parties" },
  { id: "cards",       label: "Card Orders", Icon: Layers,        desc: "Singles, Boosters, Sealed Product" },
  { id: "merchandise", label: "Merchandise", Icon: Package,       desc: "Apparel, Accessories, Other" },
];

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Category | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [bulkMoving, setBulkMoving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [lastVisited, setLastVisited] = useState<Date | null>(null);

  // On mount: capture the previous last-visited time so we can highlight new rows,
  // then update it to now so the next visit starts fresh.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_LAST_VISITED);
    if (stored) setLastVisited(new Date(stored));
    // Mark as seen now
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_LAST_VISITED, now);
    // Also sync the known count so the sidebar badge clears
    localStorage.setItem(STORAGE_KNOWN, String(orders.length));
  }, [orders.length]);

  function isNewOrder(order: Order): boolean {
    if (!lastVisited) return false;
    return new Date(order.createdAt) > lastVisited;
  }

  function toggleCheck(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll(ids: string[]) {
    setCheckedIds((prev) =>
      prev.size === ids.length ? new Set() : new Set(ids)
    );
  }

  async function handleBulkMove(category: string) {
    if (!checkedIds.size) return;
    setBulkMoving(true);
    try {
      await Promise.all(
        Array.from(checkedIds).map((id) =>
          fetch("/api/admin/orders/update", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, category }),
          })
        )
      );
      setCheckedIds(new Set());
      router.refresh();
    } catch {
      alert("Failed to move some orders. Please try again.");
    } finally {
      setBulkMoving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      alert("Failed to delete order. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRefund(order: Order) {
    const amount = formatAmount(order.amountTotal, order.currency);
    const approved = confirm(
      `REFUND DISCLAIMER\n\nYou are about to refund ${amount} to ${order.customerName} for:\n${order.description}\n\nThis action cannot be undone. The refund will be returned to the original payment method and may take 5–10 business days to appear.\n\nAre you sure you want to issue this refund?`
    );
    if (!approved) return;

    setRefundingId(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/refund`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to issue refund");

      if (data.emailSent === false) {
        alert(data.warning);
      }
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to issue refund. Please try again.");
    } finally {
      setRefundingId(null);
    }
  }

  const filtered = selected
    ? orders.filter((o) => (o.metadata?.category ?? "merchandise") === selected)
    : [];

  const totalRevenue = filtered
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.amountTotal, 0);

  const countFor = (cat: Category) =>
    orders.filter((o) => (o.metadata?.category ?? "merchandise") === cat).length;

  const revenueFor = (cat: Category) =>
    orders
      .filter((o) => (o.metadata?.category ?? "merchandise") === cat && o.status === "paid")
      .reduce((sum, o) => sum + o.amountTotal, 0);

  const grandTotal = orders.filter((o) => o.status === "paid").reduce((sum, o) => sum + o.amountTotal, 0);

  // ── Category picker ──────────────────────────────────────────────────────
  if (!selected) {
    return (
      <div className={styles.page}>
        <div className={styles.pickerHero}>
          <div className={styles.pickerHeroLeft}>
            <p className={styles.pickerEyebrow}>Order Management</p>
            <h1 className={styles.pickerTitle}>Orders</h1>
            <p className={styles.pickerSub}>
              {orders.length} total orders
            </p>
          </div>
        </div>

        <div className={styles.pickerDivider} />

        <div className={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const newForCat = orders.filter(
              (o) => (o.metadata?.category ?? "merchandise") === cat.id && isNewOrder(o)
            ).length;
            return (
              <button
                key={cat.id}
                className={styles.categoryCard}
                onClick={() => setSelected(cat.id)}
              >
                <div className={styles.categoryCardTop}>
                  <cat.Icon size={36} strokeWidth={1.25} className={styles.categoryIcon} />
                  {newForCat > 0 && (
                    <span className={styles.categoryNewBadge}>{newForCat} new</span>
                  )}
                </div>
                <span className={styles.categoryLabel}>{cat.label}</span>
                <span className={styles.categoryDesc}>{cat.desc}</span>
                <div className={styles.categoryStats}>
                  <span className={styles.categoryBigNum}>{countFor(cat.id)}</span>
                  <span className={styles.categoryStatLabel}>orders</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Orders table ─────────────────────────────────────────────────────────
  const activeCat = CATEGORIES.find((c) => c.id === selected)!;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <button className={styles.backBtn} onClick={() => setSelected(null)}>
            ← All Categories
          </button>
          <h1 className={styles.title}>{activeCat.id === "cards" ? activeCat.label : `${activeCat.label} Orders`}</h1>
          <p className={styles.subtitle}>
            {filtered.length} order{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No {activeCat.id === "cards" ? activeCat.label.toLowerCase() : `${activeCat.label.toLowerCase()} orders`} yet</p>
          <p className={styles.emptyDesc}>
            No orders have been placed in this category yet.
          </p>
        </div>
      ) : (
        <>
          {checkedIds.size > 0 && (
            <div className={styles.bulkBar}>
              <span className={styles.bulkCount}>{checkedIds.size} selected</span>
              <span className={styles.bulkLabel}>Move to:</span>
              {CATEGORIES.filter((c) => c.id !== selected).map((c) => (
                <button
                  key={c.id}
                  className={styles.bulkMoveBtn}
                  onClick={() => handleBulkMove(c.id)}
                  disabled={bulkMoving}
                >
                  {c.label}
                </button>
              ))}
              <button className={styles.bulkClearBtn} onClick={() => setCheckedIds(new Set())}>
                Clear
              </button>
            </div>
          )}
          <div className={styles.tableWrap}>
            <div className={styles.tableHeader}>
              <span>
                <input
                  type="checkbox"
                  checked={checkedIds.size === filtered.length && filtered.length > 0}
                  onChange={() => toggleAll(filtered.map((o) => o.id))}
                />
              </span>
              <span>Order ID</span>
              <span>Customer</span>
              <span>Email</span>
              <span>Description</span>
              <span>Qty</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Date</span>
              <span></span>
            </div>
            {filtered.map((order) => (
              <div key={order.id} className={`${styles.tableRow} ${checkedIds.has(order.id) ? styles.tableRowChecked : ""} ${isNewOrder(order) ? styles.tableRowNew : ""}`}>
                <span>
                  <input
                    type="checkbox"
                    checked={checkedIds.has(order.id)}
                    onChange={() => toggleCheck(order.id)}
                  />
                </span>
                <span data-label="Order ID" className={styles.orderId} title={order.stripeSessionId ?? order.id}>
                  {order.metadata?.squarespaceOrderId
                    ?? (order.id.startsWith("sq_")
                      ? order.id.replace("sq_", "")
                      : `#${order.id.slice(-8).toUpperCase()}`)}
                  {isNewOrder(order) && <span className={styles.newPill}>NEW</span>}
                </span>
                <span data-label="Customer" className={styles.customerName}>{order.customerName}</span>
                <span data-label="Email" className={styles.email}>{order.customerEmail}</span>
                <span data-label="Description" className={styles.description}>{order.description}</span>
                <span data-label="Qty" className={styles.qty}>{order.metadata?.quantity ?? "1"}</span>
                <span data-label="Amount" className={styles.amount}>
                  {formatAmount(order.amountTotal, order.currency)}
                </span>
                <span data-label="Status" className={`${styles.status} ${styles[`status_${order.status}`]}`}>
                  {order.status}
                </span>
                <span data-label="Date" className={styles.date}>
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className={styles.deleteCell}>
                  {order.status === "paid" && order.stripeSessionId?.startsWith("cs_") && (
                    <button
                      className={styles.refundBtn}
                      onClick={() => handleRefund(order)}
                      disabled={refundingId === order.id || deletingId === order.id}
                    >
                      {refundingId === order.id ? "Refunding…" : "Refund"}
                    </button>
                  )}
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(order.id)}
                    disabled={deletingId === order.id || refundingId === order.id}
                    aria-label="Delete order"
                  >
                    {deletingId === order.id ? "…" : "Delete"}
                  </button>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
