"use client";

import { create } from "zustand";

type SearchStore = {
  open: boolean;
  /** Text to start with, e.g. the character typed into the header field. */
  initialQuery: string;
  /** Collection picked in the header's "All Scents" select. */
  collection?: string;
  openSearch: (options?: { query?: string; collection?: string }) => void;
  setOpen: (open: boolean) => void;
};

/** Open state of the search popup, shared by every search trigger. */
export const useSearchStore = create<SearchStore>()((set) => ({
  open: false,
  initialQuery: "",
  collection: undefined,
  openSearch: ({ query = "", collection } = {}) =>
    set({
      open: true,
      initialQuery: query,
      collection: collection || undefined,
    }),
  setOpen: (open) => set({ open }),
}));
