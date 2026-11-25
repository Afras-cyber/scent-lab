"use client";

import { Moon, Sun } from "lucide-react";

import { THEME_STORAGE_KEY } from "@/lib/theme";
import { cn } from "@/lib/utils";

// Both icons are rendered and CSS picks one, so the button needs no state
// and never mismatches during hydration.
export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // Storage blocked: the choice lasts for this page view only.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white/10",
        className,
      )}
    >
      <Sun className="hidden size-5 dark:block" aria-hidden />
      <Moon className="size-5 dark:hidden" aria-hidden />
    </button>
  );
}
