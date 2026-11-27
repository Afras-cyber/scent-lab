"use client";

import { useSyncExternalStore } from "react";

// Recent searches are a per-browser convenience in localStorage. Storage can
// be missing or throw (private mode, blocked site data), so every access is
// guarded and the popup works without it.

const STORAGE_KEY = "ayad:recent-searches";
export const MAX_RECENT = 6;

/** `q` first, without case-insensitive duplicates, at most `MAX_RECENT`. */
export function addRecent(list: readonly string[], q: string): string[] {
  const query = q.trim().replace(/\s+/g, " ");
  if (!query) return [...list];
  const key = query.toLowerCase();
  return [query, ...list.filter((item) => item.toLowerCase() !== key)].slice(
    0,
    MAX_RECENT,
  );
}

export function removeRecent(list: readonly string[], q: string): string[] {
  return list.filter((item) => item !== q);
}

const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let cache: { raw: string | null; list: string[] } = { raw: null, list: EMPTY };

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }
  // Same string, same array: useSyncExternalStore needs a stable snapshot.
  if (raw === cache.raw) return cache.list;
  let list: string[] = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      list = parsed
        .filter((v): v is string => typeof v === "string")
        .slice(0, MAX_RECENT);
    }
  } catch {
    // Corrupt value: start over.
  }
  cache = { raw, list };
  return list;
}

function write(list: string[]) {
  try {
    if (list.length === 0) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage unavailable; the list just isn't remembered.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

export function useRecentSearches() {
  const recent = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    recent,
    add: (q: string) => write(addRecent(read(), q)),
    remove: (q: string) => write(removeRecent(read(), q)),
    clear: () => write([]),
  };
}
