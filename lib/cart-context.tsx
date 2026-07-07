"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { SingleCard } from "./singles-data";

export interface CartItem {
  card: SingleCard;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  isOpen: boolean;
  hydrated: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (card: SingleCard) => void;
  removeFromCart: (cardId: string) => void;
  updateQuantity: (cardId: string, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kitsune_cart");
      if (stored) setItems(JSON.parse(stored));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("kitsune_cart", JSON.stringify(items));
  }, [items]);

  const openCart  = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addToCart = useCallback((card: SingleCard) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.card.id === card.id);
      if (existing) {
        return prev.map((i) =>
          i.card.id === card.id
            ? { ...i, quantity: Math.min(i.quantity + 1, card.quantity) }
            : i
        );
      }
      return [...prev, { card, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((cardId: string) => {
    setItems((prev) => prev.filter((i) => i.card.id !== cardId));
  }, []);

  const updateQuantity = useCallback((cardId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.card.id !== cardId)
        : prev.map((i) => (i.card.id === cardId ? { ...i, quantity: qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.card.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, totalCount, totalPrice,
      isOpen, hydrated, openCart, closeCart,
      addToCart, removeFromCart, updateQuantity, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
