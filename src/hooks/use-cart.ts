"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  /** Centimes — display only; the server re-prices everything at checkout */
  price: number;
  imageKey: string | null;
  quantity: number;
  maxQuantity: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  open: () => void;
  setOpen: (open: boolean) => void;
  sync: (updates: { productId: string; price: number; maxQuantity: number; name: string }[], removedIds: string[]) => void;
}

const MAX_PER_LINE = 20;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (line, quantity = 1) =>
        set((s) => {
          const cap = Math.min(MAX_PER_LINE, line.maxQuantity);
          const existing = s.lines.find((l) => l.productId === line.productId);
          const lines = existing
            ? s.lines.map((l) => (l.productId === line.productId ? { ...l, ...line, quantity: Math.min(cap, l.quantity + quantity) } : l))
            : [...s.lines, { ...line, quantity: Math.min(cap, quantity) }];
          return { lines, isOpen: true };
        }),
      setQuantity: (productId, quantity) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.productId === productId ? { ...l, quantity: Math.max(0, Math.min(quantity, l.maxQuantity, MAX_PER_LINE)) } : l))
            .filter((l) => l.quantity > 0),
        })),
      remove: (productId) => set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      setOpen: (isOpen) => set({ isOpen }),
      sync: (updates, removedIds) =>
        set((s) => ({
          lines: s.lines
            .filter((l) => !removedIds.includes(l.productId))
            .map((l) => {
              const u = updates.find((x) => x.productId === l.productId);
              return u ? { ...l, price: u.price, name: u.name, maxQuantity: u.maxQuantity, quantity: Math.min(l.quantity, Math.max(u.maxQuantity, 0)) } : l;
            })
            .filter((l) => l.quantity > 0),
        })),
    }),
    {
      name: "dz-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity * l.price, 0);
