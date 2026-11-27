"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { commerceConfig, productConfig } from "@/config";
import type { DeliveryZone } from "@/features/catalog/types";
import { formatLKR } from "@/lib/format";
import { fillMessage } from "@/lib/whatsapp/link";

const copy = productConfig.delivery;

/** "Check delivery to your district": fee and estimate for one district. */
export function DeliveryChecker({
  zones,
  freeThreshold,
}: {
  zones: DeliveryZone[];
  freeThreshold: number;
}) {
  const [district, setDistrict] = useState("");
  const [checked, setChecked] = useState<DeliveryZone | null>(null);
  const { colombo, other } = commerceConfig.deliveryEstimate;

  return (
    <form
      className="flex flex-col gap-3 rounded-2xl bg-muted p-4 lg:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        setChecked(zones.find((z) => z.district === district) ?? null);
      }}
    >
      <label
        htmlFor="delivery-district"
        className="flex items-center gap-2 text-sm font-semibold text-heading"
      >
        <MapPin className="size-4" aria-hidden />
        {copy.title}
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            id="delivery-district"
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              setChecked(null);
            }}
            className="h-11 w-full appearance-none rounded-full border bg-card pr-10 pl-4 text-sm text-heading outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="" disabled>
              {copy.placeholder}
            </option>
            {zones.map((z) => (
              <option key={z.district} value={z.district}>
                {z.district}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        </div>
        <Button type="submit" disabled={!district}>
          {copy.check}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {checked ? (
          <span className="font-medium text-heading">
            {fillMessage(copy.result, {
              district: checked.district,
              fee: formatLKR(checked.fee),
              days: checked.estimatedDays,
            })}
            .{" "}
          </span>
        ) : (
          <>
            Colombo {colombo} · Other districts {other} ·{" "}
          </>
        )}
        {fillMessage(copy.free, { threshold: formatLKR(freeThreshold) })}
      </p>
    </form>
  );
}
