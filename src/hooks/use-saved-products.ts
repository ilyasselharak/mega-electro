"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Wishlist and recently viewed products, kept in the visitor's browser.
// Only product ids are stored: names, prices and stock are always re-read from the catalog
// (see /api/products), so a saved product never shows a stale price.

const MAX_WISHLIST = 50;
const MAX_RECENT = 12;

interface WishlistState {
  ids: string[];
  toggle: (id: string) => boolean;
  remove: (id: string) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const has = get().ids.includes(id);
        set({ ids: has ? get().ids.filter((x) => x !== id) : [id, ...get().ids].slice(0, MAX_WISHLIST) });
        return !has;
      },
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
    }),
    { name: "me-wishlist", version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);

interface RecentState {
  ids: string[];
  push: (id: string) => void;
}

export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set, get) => ({
      ids: [],
      push: (id) => set({ ids: [id, ...get().ids.filter((x) => x !== id)].slice(0, MAX_RECENT) }),
    }),
    { name: "me-recent", version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);

/** Drawer and search state shared by the header and the mobile bottom navigation. */
export const useStoreUi = create<{ menuOpen: boolean; setMenuOpen: (open: boolean) => void }>()((set) => ({
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}));
