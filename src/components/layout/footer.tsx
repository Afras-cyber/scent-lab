import { Mail, MessageCircle } from "lucide-react";
import { cacheLife } from "next/cache";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import { FacebookIcon, InstagramIcon } from "@/components/common/brand-icons";
import { Logo } from "@/components/layout/logo";
import { commerceConfig, navigationConfig, siteConfig } from "@/config";
import { waLink } from "@/lib/whatsapp/link";

const paymentLabels = {
  cod: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
} as const;

function instagramHandle(url: string) {
  return url.replace(/\/+$/, "").split("/").pop();
}

export function Footer() {
  const { contact, social } = siteConfig;
  const socials: {
    label: string;
    href: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
  }[] = [
    { label: "Instagram", href: social.instagram, Icon: InstagramIcon },
    { label: "Facebook", href: social.facebook, Icon: FacebookIcon },
    { label: "WhatsApp", href: waLink(), Icon: MessageCircle },
    { label: "Email", href: `mailto:${contact.email}`, Icon: Mail },
  ].filter((s) => s.href);

  const headingClass = "text-[15px] font-semibold tracking-wide uppercase";
  const linkClass =
    "text-[15px] text-brand-foreground/70 transition-colors hover:text-brand-foreground";

  return (
    <footer className="bg-brand-deep pb-[calc(5rem+env(safe-area-inset-bottom))] text-brand-foreground lg:pb-0">
      <div className="container-page grid gap-10 pt-14 pb-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:gap-8 lg:pt-16">
        <div className="flex flex-col gap-5">
          <Logo className="text-brand-foreground" />
          <p className="max-w-xs text-[15px] leading-relaxed text-brand-foreground/70">
            {navigationConfig.footer.blurb}
          </p>
          <ul className="flex gap-2.5">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  {...(href.startsWith("http") && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                  className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <Icon className="size-[18px]" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-8 lg:contents">
          {navigationConfig.footer.groups.map((group) => (
            <nav
              key={group.title}
              aria-label={group.title}
              className="flex flex-col gap-3"
            >
              <p className={headingClass}>{group.title}</p>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <p className={headingClass}>Contact</p>
          <ul className="flex flex-col gap-2">
            <li>
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                WhatsApp: {contact.whatsapp.display}
              </a>
            </li>
            <li>
              <a href={`tel:${contact.phoneE164}`} className={linkClass}>
                Phone: {contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className={linkClass}>
                {contact.email}
              </a>
            </li>
            <li className="text-[15px] text-brand-foreground/70">
              {contact.hours}
            </li>
            {social.instagram && (
              <li>
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Instagram @{instagramHandle(social.instagram)}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="container-page">
        <div className="flex flex-col gap-4 border-t border-white/15 py-7 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-brand-foreground/70">
            © <CurrentYear /> {siteConfig.name} · {siteConfig.domain} · All
            rights reserved.
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Payment methods">
            {commerceConfig.paymentMethods.map((method) => (
              <li
                key={method}
                className="rounded-md border border-white/30 px-2.5 py-1 text-[13px]"
              >
                {paymentLabels[method]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

// Reading the clock makes a component dynamic; caching it keeps the footer in
// the static shell.
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
