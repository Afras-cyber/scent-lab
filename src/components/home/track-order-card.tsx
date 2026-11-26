import { Box, Check, Gift, Truck } from "lucide-react";

import { homeConfig, siteConfig } from "@/config";
import { waLink } from "@/lib/whatsapp/link";

import { TrackOrderForm } from "./track-order-form";

const statusIcons = [Check, Box, Truck, Gift];

/** Dark "Track Your Order" card with the Order ID + phone form. */
export function TrackOrderCard() {
  const { eyebrow, title, text, formTitle, statuses } = homeConfig.trackOrder;

  const statusList = (
    <ul className="flex justify-between gap-x-4 gap-y-2 text-[11px] text-brand-foreground/90 lg:justify-start lg:gap-x-5 lg:text-sm">
      {statuses.map((status, i) => {
        const Icon = statusIcons[i] ?? Check;
        return (
          <li
            key={status}
            className="flex flex-col items-center gap-1.5 lg:flex-row lg:gap-2"
          >
            <Icon className="size-4" aria-hidden />
            {status}
          </li>
        );
      })}
    </ul>
  );

  return (
    <section className="bg-card py-12 lg:py-[72px]">
      <div className="container-page">
        <div className="grid items-center gap-6 rounded-[20px] bg-brand-gradient p-5 pt-8 text-brand-foreground lg:grid-cols-[1fr_500px] lg:gap-12 lg:p-14">
          <div className="flex flex-col gap-4 max-lg:px-2">
            <span className="self-start rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase">
              {eyebrow}
            </span>
            <h2 className="text-[32px] text-brand-foreground lg:text-[44px] lg:leading-tight">
              {title}
            </h2>
            <p className="max-w-md text-sm text-brand-foreground/80 lg:text-base">
              {text}
            </p>
            <div className="max-lg:hidden">{statusList}</div>
          </div>

          <div className="flex flex-col gap-4 rounded-[20px] bg-card p-5 text-card-foreground lg:p-8">
            <p className="text-lg font-semibold text-heading max-lg:hidden">
              {formTitle}
            </p>
            <TrackOrderForm />
            <p className="text-center text-xs text-muted-foreground max-lg:hidden">
              Need help? WhatsApp us at{" "}
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 hover:underline"
              >
                {siteConfig.contact.whatsapp.display}
              </a>
            </p>
          </div>

          <div className="pb-2 lg:hidden">{statusList}</div>
        </div>
      </div>
    </section>
  );
}
