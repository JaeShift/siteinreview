import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import SinglesClient from "./SinglesClient";
import { getSinglesStore } from "@/lib/store";
import styles from "./singles.module.css";

export const metadata: Metadata = {
  title: "Shop Magic",
  description:
    "Browse our MTG singles, sealed product, booster boxes, and commander decks at Kitsune Brewing Co. in Phoenix, AZ.",
};

export const dynamic = "force-dynamic";

export default function SinglesPage() {
  const cards = getSinglesStore().filter((c) => c.quantity > 0);
  return (
    <>
      <PageHero
        kicker="From the taproom"
        title="Shop Magic"
        description="Singles and sealed product, priced for the table."
      />

      <SinglesClient initialCards={cards} />
    </>
  );
}
