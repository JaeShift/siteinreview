export type MerchandiseCategory = "Apparel" | "Drinkware" | "Accessories" | "Other";

export interface MerchandiseProduct {
  id: string;
  name: string;
  description: string;
  category: MerchandiseCategory;
  price: number;
  quantity: number;
  imageUrl: string;
  sizes: string[];
  active: boolean;
}

export const merchandise: MerchandiseProduct[] = [];
