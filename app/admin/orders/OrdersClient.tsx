"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "@/lib/store";
import styles from "./admin-orders.module.css";

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete order");
      router.refresh();
    } catch {
      alert("Failed to delete order. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const totalRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.amountTotal, 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.subtitle}>
            {orders.length} total order{orders.length !== 1 ? "s" : ""}
            {orders.length > 0 && (
              <> &mdash; {formatAmount(totalRevenue, orders[0]?.currency ?? "usd")} collected</>
            )}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No orders yet</p>
          <p className={styles.emptyDesc}>
            When a customer completes a purchase on your site, their order will appear here automatically.
          </p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <div className={styles.tableHeader}>
            <span>Order ID</span>
            <span>Customer</span>
            <span>Email</span>
            <span>Description</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Date</span>
            <span></span>
          </div>
          {orders.map((order) => (
            <div key={order.id} className={styles.tableRow}>
              <span className={styles.orderId} title={order.stripeSessionId}>
                {order.stripeSessionId.slice(0, 12)}…
              </span>
              <span className={styles.customerName}>{order.customerName}</span>
              <span className={styles.email}>{order.customerEmail}</span>
              <span className={styles.description}>{order.description}</span>
              <span className={styles.amount}>
                {formatAmount(order.amountTotal, order.currency)}
              </span>
              <span className={`${styles.status} ${styles[`status_${order.status}`]}`}>
                {order.status}
              </span>
              <span className={styles.date}>
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className={styles.deleteCell}>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(order.id)}
                  disabled={deletingId === order.id}
                  aria-label="Delete order"
                >
                  {deletingId === order.id ? "…" : "Delete"}
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
