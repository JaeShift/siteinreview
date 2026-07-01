import type { Metadata } from "next";
import { getOrdersStore } from "@/lib/store";
import styles from "./admin-orders.module.css";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function AdminOrdersPage() {
  const orders = getOrdersStore();

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
