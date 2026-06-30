export type MtgProduct = {
  slug: string;
  title: string;
  price: string;
  priceNumeric: number;
  imageUrl: string;
  imageAlt: string;
  description: string;
  availability: "in-stock" | "sold-out" | "coming-soon";
};

export const mtgProducts: MtgProduct[] = [
  {
    slug: "marvel-mtg-prerelease-620",
    title: "Marvel MTG Prerelease 6/20",
    price: "$44.99",
    priceNumeric: 44.99,
    imageUrl: "/images/marvel-mtg-prerelease.png",
    imageAlt: "Marvel MTG Prerelease 6/20",
    description:
      "Get ready to save the world with Magic the Gathering's upcoming set, Marvel Super Heroes. We'll be hosting our Prerelease events for this set on June 20 at 2:00 PM. The event usually runs for 4 hours.",
    availability: "sold-out",
  },
];

export function getProductBySlug(slug: string): MtgProduct | undefined {
  return mtgProducts.find((p) => p.slug === slug);
}
