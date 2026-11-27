"use client";

import { create } from "zustand";

type QuickViewStore = {
  open: boolean;
  /** Product shown in the quick view. Kept after closing so the close animation still has content. */
  slug: string | null;
  openQuickView: (slug: string) => void;
  setOpen: (open: boolean) => void;
};

/** Open state of the quick view, shared by every product card. */
export const useQuickViewStore = create<QuickViewStore>()((set) => ({
  open: false,
  slug: null,
  openQuickView: (slug) => set({ open: true, slug }),
  setOpen: (open) => set({ open }),
}));
