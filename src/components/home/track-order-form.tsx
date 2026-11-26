"use client";

import { Box } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { commerceConfig } from "@/config";

const inputClass =
  "h-12 w-full rounded-xl border border-gold/50 bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:border-gold focus-visible:outline-none";

/**
 * Order ID + phone form on the home page. It hands both to /track-order in the
 * URL fragment, which is never sent to the server, so the phone number stays
 * out of request logs. The track page (Phase 3) reads it and runs the lookup.
 */
export function TrackOrderForm() {
  const router = useRouter();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fragment = new URLSearchParams({
      order: String(data.get("order") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
    });
    router.push(`/track-order#${fragment}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="sr-only" htmlFor="home-track-order">
        Order ID
      </label>
      <input
        id="home-track-order"
        name="order"
        required
        autoComplete="off"
        placeholder={`Order ID (e.g. ${commerceConfig.orderCodePrefix}-10482)`}
        className={inputClass}
      />
      <label className="sr-only" htmlFor="home-track-phone">
        Phone number
      </label>
      <input
        id="home-track-phone"
        name="phone"
        type="tel"
        required
        autoComplete="tel"
        inputMode="tel"
        placeholder="Phone Number (07X XXX XXXX)"
        className={inputClass}
      />
      <Button type="submit" size="lg" className="mt-1 w-full">
        <Box aria-hidden />
        Track My Order
      </Button>
    </form>
  );
}
