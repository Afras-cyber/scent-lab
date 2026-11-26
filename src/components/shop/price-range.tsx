"use client";

import { Slider } from "radix-ui";
import { useState } from "react";

import { shopConfig } from "@/config";

import { FilterPill } from "./filter-controls";
import { useShopNavigation } from "./shop-navigation";

const STEP = 100;

type Bounds = { min: number; max: number };

/** Price presets, a two-thumb slider and Min/Max inputs. */
export function PriceRange({ bounds }: { bounds: Bounds }) {
  const { filters, update } = useShopNavigation();
  const { minPrice, maxPrice } = filters;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {shopConfig.pricePresets.map((preset) => {
          const presetMin = "minPrice" in preset ? preset.minPrice : undefined;
          const presetMax = "maxPrice" in preset ? preset.maxPrice : undefined;
          const active = minPrice === presetMin && maxPrice === presetMax;
          return (
            <FilterPill
              key={preset.label}
              active={active}
              onClick={() =>
                update(
                  active
                    ? { minPrice: undefined, maxPrice: undefined }
                    : { minPrice: presetMin, maxPrice: presetMax },
                )
              }
            >
              {preset.label}
            </FilterPill>
          );
        })}
      </div>
      {bounds.max > bounds.min && (
        <RangeInputs
          bounds={bounds}
          initial={[minPrice ?? bounds.min, maxPrice ?? bounds.max]}
          onCommit={([lo, hi]) =>
            update({
              minPrice: lo > bounds.min ? lo : undefined,
              maxPrice: hi < bounds.max ? hi : undefined,
            })
          }
        />
      )}
    </div>
  );
}

function RangeInputs({
  bounds,
  initial,
  onCommit,
}: {
  bounds: Bounds;
  initial: [number, number];
  onCommit: (range: [number, number]) => void;
}) {
  const clamp = (n: number) => Math.min(Math.max(n, bounds.min), bounds.max);
  const fromProps = (): [number, number] => [
    clamp(initial[0]),
    clamp(initial[1]),
  ];
  const [range, setRange] = useState(fromProps);
  // Bumped to reset a field after invalid input.
  const [resetCount, setResetCount] = useState(0);

  // Follow URL changes (presets, chips, Clear all) without remounting, so the
  // slider keeps keyboard focus between steps.
  const initialKey = `${initial[0]}-${initial[1]}`;
  const [syncedKey, setSyncedKey] = useState(initialKey);
  if (syncedKey !== initialKey) {
    setSyncedKey(initialKey);
    setRange(fromProps());
  }
  const [lo, hi] = range;

  function commitInput(which: 0 | 1, raw: string) {
    const value = Number(raw.replace(/[^\d]/g, ""));
    if (raw.trim() === "" || !Number.isFinite(value)) {
      setResetCount((n) => n + 1);
      return;
    }
    const next: [number, number] = [...range];
    next[which] = clamp(value);
    if (next[0] > next[1]) next.reverse();
    setRange(next);
    if (next[0] !== initial[0] || next[1] !== initial[1]) onCommit(next);
  }

  const inputClass =
    "h-11 w-full rounded-xl border bg-card pr-3 pl-10 text-sm text-heading focus-visible:border-gold focus-visible:outline-none";

  return (
    <div className="flex flex-col gap-4">
      <Slider.Root
        min={bounds.min}
        max={bounds.max}
        step={STEP}
        minStepsBetweenThumbs={1}
        value={range}
        onValueChange={(v) => setRange([v[0]!, v[1]!])}
        onValueCommit={(v) => onCommit([v[0]!, v[1]!])}
        className="relative flex h-6 touch-none items-center select-none"
      >
        <Slider.Track className="relative h-1 grow rounded-full bg-muted">
          <Slider.Range className="absolute h-full rounded-full bg-primary" />
        </Slider.Track>
        {(["Minimum price", "Maximum price"] as const).map((label) => (
          <Slider.Thumb
            key={label}
            aria-label={label}
            className="block size-6 rounded-full border-2 border-primary bg-card shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          />
        ))}
      </Slider.Root>
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            ["Min", lo, 0],
            ["Max", hi, 1],
          ] as const
        ).map(([label, value, which]) => (
          <label key={label} className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                Rs
              </span>
              <input
                inputMode="numeric"
                defaultValue={value}
                // Re-key on slider moves so the field shows the new value.
                key={`${value}-${resetCount}`}
                onBlur={(e) => commitInput(which, e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                aria-label={`${label}imum price in rupees`}
                className={inputClass}
              />
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
