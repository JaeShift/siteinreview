import type { Metadata } from "next";
import PageSection from "@/components/PageSection";
import EventCard from "@/components/EventCard";
import { mtgProducts } from "@/lib/mtg-products";
import styles from "./mtg.module.css";

export const metadata: Metadata = {
  title: "Pre Release",
  description:
    "Magic: The Gathering prereleases, events, and more at Kitsune Brewing Co. in Phoenix, AZ.",
};

export default function PreReleasePage() {
  return (
    <>
      <div className="page-banner">
        <h1>Pre-Release</h1>
      </div>

      <PageSection background="light">
        {mtgProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No upcoming events right now. Check back soon!</p>
          </div>
        ) : (
          <div className={styles.eventsGrid}>
            {mtgProducts.map((product) => (
              <EventCard
                key={product.slug}
                title={product.title}
                price={product.price}
                imageUrl={product.imageUrl}
                imageAlt={product.imageAlt}
                href={`/pre-release/${product.slug}`}
                description={product.description}
              />
            ))}
          </div>
        )}
      </PageSection>
    </>
  );
}
