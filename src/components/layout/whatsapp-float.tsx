import { MessageCircle } from "lucide-react";

import { navigationConfig } from "@/config";
import { waLink } from "@/lib/whatsapp/link";

/** Desktop floating chat button. On mobile the bottom nav has WhatsApp. */
export function WhatsappFloat() {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed right-6 bottom-6 z-30 hidden items-center gap-3 lg:flex"
    >
      <span className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-brand-deep shadow-md transition-transform group-hover:-translate-x-1">
        {navigationConfig.whatsappCta.float}
      </span>
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform group-hover:scale-105">
        <MessageCircle className="size-6" aria-hidden />
      </span>
    </a>
  );
}
