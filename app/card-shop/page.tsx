import type { Metadata } from "next";
import SinglesClient from "./SinglesClient";

export const metadata: Metadata = {
  title: "Card Shop",
  description:
    "Browse our MTG singles inventory at Kitsune Brewing Co. in Phoenix, AZ. Search by set, condition, color, type, and price.",
};

export default function SinglesPage() {
  return (
    <>
      <div className="page-banner">
        <h1>Kitsune Card Shop</h1>
      </div>

      <SinglesClient />
    </>
  );
}
