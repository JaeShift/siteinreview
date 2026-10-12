"use client";

import type { ReactNode } from "react";
import type { SingleCard } from "@/lib/singles-data";
import MobileFeaturedProducts from "./MobileFeaturedProducts";

export default function MobileFeaturedCards(props: {
  products: SingleCard[];
  onOpen: (card: SingleCard, control: HTMLButtonElement) => void;
  renderDetails: (card: SingleCard) => ReactNode;
}) {
  return <MobileFeaturedProducts {...props} collectionLabel="Featured Magic cards" itemLabel="card" />;
}
