# AYAD — Project Structure & Build Guide

> Website: **ayadscentlab.com** · Brand name: **AYAD** · Market: Sri Lanka (LKR)
> Design source: Figma file `blue-ayad-design-3` (green theme applied)
> Status: planning document, version 1.1 (adds WhatsApp notifications with PDF invoices, and separate config files)

This document is the single source of truth for building the AYAD web application. Read it top to bottom once, then use it as a checklist.

---

## 1. Product summary

AYAD is an online perfume shop (attar oils, oud, musk, amber, Arabic-inspired perfumes).

**Business rules that shape the code**

| Rule | What it means for the build |
|---|---|
| No customer accounts | No sign-up, no login, no "My Account" for customers. Checkout uses name + phone + address only. |
| Track Order instead of accounts | Customers track with **Order ID + phone number**. |
| Payments | **Cash on Delivery** and **Bank Transfer** (slip shared on WhatsApp or uploaded). |
| Delivery | Island-wide. Fee and free-delivery threshold are configurable. |
| WhatsApp is the main channel | Customers and staff talk on WhatsApp. The system also sends **automatic WhatsApp messages with a PDF** (invoice, receipt) on main events: **order placed** and **payment received**. |
| Settings live in config files | Name, description, phone, WhatsApp number and similar values are kept in `src/config/`, never hard-coded in components (section 5). |
| Prices | LKR, whole rupees, shown as `Rs 3,490`. |
| Admin only login | Only staff log in (role-based), to manage products, orders and content. |

**Logo rule:** the logo is the word **AYAD** only (bold, wide letter spacing, normal size). The logo is a temporary text component and will be replaced later, so keep it in **one file** (`components/layout/logo.tsx`).

---

## 2. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router)** | Server Components first. Use the latest stable version and pin it. |
| Language | **TypeScript** (strict) | `strict: true`, `noUncheckedIndexedAccess: true` |
| Styling | **Tailwind CSS** | Utility-first, mobile-first. Tokens defined in CSS (see section 7). |
| UI components | **shadcn/ui + Radix UI** | Accessible primitives (dialog, sheet, tabs, select). |
| Animation | **Framer Motion** | Use `LazyMotion` + `domAnimation` to keep the bundle small. |
| Server state | **TanStack Query v5** | Caching, background sync, optimistic updates. |
| Client state | **Zustand** | Cart + UI state only (see decision in section 10). |
| Backend / DB | **Supabase** | Postgres, Storage, Row Level Security, Realtime. |
| Auth | **NextAuth.js v5 (Auth.js)** | Admin-only. Role-based. |
| Forms | **React Hook Form + Zod** | Same Zod schema on client and server. |
| Theme | **next-themes** | Light and dark mode. |
| Customer ↔ admin chat | **WhatsApp** (`wa.me` links + WhatsApp Business app) | Free click-to-chat buttons; staff reply in WhatsApp. |
| Automatic messages | **WhatsApp Business Platform (Cloud API)** | Approved templates with a PDF document header. Main events only. |
| PDF files | **@react-pdf/renderer** (or `pdf-lib`) | Invoice and receipt, generated on the server (Node runtime). |
| Background jobs | **Vercel Cron** or **Supabase pg_cron + Edge Function** | Sends queued WhatsApp messages with retries. |
| System settings | **`src/config/` files + Zod validation** | Brand, contact, commerce and notification settings in one place. |
| SEO | **Next.js Metadata API** | Meta, Open Graph, JSON-LD, sitemap, robots. |
| Fonts | **Poppins** (headings, UI) + **Roboto** (body) | Loaded with `next/font/google`. |
| Hosting | Vercel (app) + Supabase (data) | Choose the Supabase region closest to Sri Lanka. |

**Recommended extras** (small, high value)

| Tool | Why |
|---|---|
| `@supabase/supabase-js` + `@supabase/ssr` | Supabase clients for server and browser |
| `server-only` | Stops secret code from being imported into client bundles |
| `@t3-oss/env-nextjs` or a Zod env file | Validate environment variables at build time |
| Upstash Redis + `@upstash/ratelimit` | Rate limiting for checkout, tracking, newsletter |
| Cloudflare Turnstile | Free bot protection without annoying captchas |
| `sonner` | Toast messages |
| `libphonenumber-js` | Safe phone parsing and +94 normalization |
| `lucide-react` | Icons (matches the Figma icon style) |
| Vitest + Testing Library | Unit and component tests |
| Playwright | End-to-end tests (checkout and track order) |
| ESLint, Prettier (+ Tailwind plugin), Husky, lint-staged | Code quality |
| Sentry (optional) | Error monitoring |

---

## 3. Architecture in one page

```
Browser
  │  (React Server Components render first, client islands add interactivity)
  ▼
Next.js (Vercel)
  ├─ Server Components ─────► Supabase (anon key + RLS, public catalog reads, cached with tags)
  ├─ Server Actions / Route Handlers
  │     ├─ create order  ───► Supabase RPC create_order (service role, server only)
  │     ├─ track order   ───► Supabase (service role, rate limited, minimal response)
  │     └─ admin writes  ───► Supabase (service role, only after NextAuth role check)
  ├─ Outbox worker (cron) ─► WhatsApp Cloud API (template + PDF)
  │                           ◄─ webhook: delivery status, customer replies
  ├─ src/config/*  (brand, contact, commerce, notification settings)
  ├─ NextAuth v5 (admin session in httpOnly cookie)
  └─ TanStack Query (client) ◄── hydrated from server prefetch
```

**Core principles**

1. **Server first.** Pages load data on the server (fast, SEO friendly). Client components only where needed (cart, filters, forms, animations).
2. **The client is never trusted.** Prices, stock, totals and delivery fees are always recalculated on the server from the database.
3. **Deny by default.** Row Level Security is on for every table. Anonymous users can only read public catalog data. Orders can only be created and read through server code.
4. **The service role key stays on the server.** It is never sent to the browser and is only imported from files that start with `import "server-only"`.
5. **One source of truth per kind of state.** Server data lives in TanStack Query. Client-only data (cart, drawers) lives in Zustand. Forms live in React Hook Form.
6. **Settings live in one place.** Brand name, description, phone and WhatsApp number come from `src/config/`. Secrets come from `.env`. Nothing is hard-coded in components.
7. **Messages are events, not side effects.** An order or payment change writes a row to a notification outbox in the same database transaction. A worker sends it later, with retries. A WhatsApp outage never blocks an order.

---

## 4. Folder structure

```
ayad/
├── .env.example
├── .github/
│   └── workflows/ci.yml                 # lint + typecheck + test + build
├── docs/
│   ├── AYAD_PROJECT_STRUCTURE.md        # this file
│   └── adr/                             # short decision records
├── public/
│   ├── images/                          # static brand images
│   ├── icons/                           # favicon, apple-touch, pwa icons
│   └── og/                              # default Open Graph images
├── supabase/
│   ├── config.toml
│   ├── migrations/                      # SQL migrations (source of truth for schema)
│   ├── seed.sql                         # sample products and districts
│   └── tests/                           # RLS tests (optional)
├── tests/
│   ├── unit/
│   └── e2e/                             # Playwright: checkout.spec.ts, track-order.spec.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # fonts, providers, metadata base
│   │   ├── globals.css                  # Tailwind + theme tokens
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── manifest.ts
│   │   │
│   │   ├── (storefront)/                # public website
│   │   │   ├── layout.tsx               # top bar, header, footer, mobile bottom nav, WhatsApp float
│   │   │   ├── page.tsx                 # Home
│   │   │   ├── shop/page.tsx            # All products + filters
│   │   │   ├── collections/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx      # Oud, Attar Oils, Spray Perfumes, Musk & Amber, Gift Sets
│   │   │   ├── product/[slug]/page.tsx  # Product page (sticky Add to Cart on mobile)
│   │   │   ├── search/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/page.tsx        # No account needed
│   │   │   ├── order-success/[code]/page.tsx
│   │   │   ├── track-order/page.tsx     # Order ID + phone
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── faq/page.tsx
│   │   │   ├── delivery-returns/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   └── terms/page.tsx
│   │   │
│   │   ├── (admin)/admin/               # staff area (role = admin)
│   │   │   ├── layout.tsx               # server-side role guard
│   │   │   ├── login/page.tsx
│   │   │   ├── page.tsx                 # dashboard
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx             # list + filters + realtime updates
│   │   │   │   └── [id]/page.tsx        # detail, status timeline, record payment, WhatsApp message log, resend
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── collections/page.tsx
│   │   │   ├── reviews/page.tsx         # moderation
│   │   │   ├── banners/page.tsx         # hero + promo content
│   │   │   ├── notifications/page.tsx   # outbox: status, retry, send manually
│   │   │   └── settings/page.tsx        # runtime overrides: delivery fees, bank details, WhatsApp event toggles
│   │   │
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── track/route.ts           # POST: order lookup (rate limited)
│   │       ├── revalidate/route.ts      # secured webhook to refresh cached pages
│   │       ├── webhooks/whatsapp/route.ts   # GET verify + POST events (signature verified)
│   │       ├── cron/notifications/route.ts  # outbox worker (secured by CRON_SECRET)
│   │       ├── invoices/[token]/route.ts    # secure PDF download for customers
│   │       └── health/route.ts
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn/ui (generated, lightly customized)
│   │   ├── layout/                      # logo, top-bar, header, mega-menu, mobile-menu, footer, bottom-nav, whatsapp-float
│   │   ├── home/                        # hero, collection-bento, trending, promo-row, budget-tiles,
│   │   │                                # featured-collection, why-ayad, order-steps, track-order-card,
│   │   │                                # reviews, guides, newsletter
│   │   ├── product/                     # product-card, quick-view, gallery, variant-picker, rating, price
│   │   ├── cart/                        # cart-drawer, cart-line, free-delivery-bar
│   │   ├── checkout/                    # checkout-form, payment-options, order-summary, whatsapp-opt-in
│   │   ├── track/                       # track-form, status-timeline
│   │   ├── admin/                       # data-table, order-status-select, product-form, stat-card, message-log, resend-button
│   │   ├── motion/                      # motion-provider (LazyMotion), fade-in, stagger, page-transition
│   │   └── common/                      # section-heading, empty-state, skeletons, json-ld
│   │
│   ├── features/                        # feature modules: data access + hooks + schemas together
│   │   ├── products/
│   │   │   ├── queries.ts               # server-side fetchers (used by RSC and prefetch)
│   │   │   ├── hooks.ts                 # useProducts, useProduct (TanStack Query)
│   │   │   ├── keys.ts                  # query key factory
│   │   │   ├── schemas.ts               # Zod
│   │   │   └── types.ts
│   │   ├── cart/                        # cart-store.ts, selectors.ts, price-check (server action)
│   │   ├── checkout/                    # actions.ts (server action), schemas.ts
│   │   ├── orders/                      # track action, admin actions, hooks, realtime
│   │   ├── notifications/               # outbox.ts, dispatcher.ts, events.ts, actions.ts, hooks.ts
│   │   ├── invoices/                    # create-invoice.ts, signed-links.ts
│   │   ├── reviews/
│   │   ├── newsletter/
│   │   └── settings/
│   │
│   ├── config/                          # ALL brand and system settings (no secrets)
│   │   ├── index.ts                     # re-exports every config
│   │   ├── site.config.ts               # name, description, URL, phone, WhatsApp, email, hours, social
│   │   ├── commerce.config.ts           # currency, delivery, payment methods, bank details, limits
│   │   ├── notifications.config.ts      # WhatsApp events, template names, retry rules, PDF options
│   │   ├── navigation.config.ts         # header, footer, mega menu links
│   │   ├── seo.config.ts                # default metadata, Open Graph, JSON-LD defaults
│   │   ├── features.config.ts           # feature flags (dark mode, reviews, newsletter)
│   │   └── schema.ts                    # Zod schema that validates every config at build time
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── browser.ts               # anon client (browser)
│   │   │   ├── server.ts                # anon client for RSC with cookies
│   │   │   └── admin.ts                 # service role client  (import "server-only")
│   │   ├── auth/
│   │   │   ├── auth.ts                  # NextAuth config
│   │   │   ├── guards.ts                # requireAdmin()
│   │   │   └── password.ts
│   │   ├── env.ts                       # Zod-validated env
│   │   ├── format.ts                    # formatLKR(), formatPhone()
│   │   ├── phone.ts                     # normalize to +94 (E.164)
│   │   ├── whatsapp/
│   │   │   ├── client.ts                # Graph API fetch wrapper (server only)
│   │   │   ├── media.ts                 # upload PDF, get media id
│   │   │   ├── send.ts                  # sendTemplate(), sendText()
│   │   │   ├── templates.ts             # build template payloads from config
│   │   │   ├── webhook.ts               # signature check, status + inbound handling
│   │   │   └── link.ts                  # wa.me click-to-chat links (reads config)
│   │   ├── pdf/
│   │   │   ├── invoice.tsx              # invoice layout
│   │   │   ├── receipt.tsx              # payment receipt layout
│   │   │   └── render.ts                # render to bytes, store, hash
│   │   ├── rate-limit.ts
│   │   ├── seo.ts                       # metadata + JSON-LD helpers
│   │   ├── fonts.ts                     # Poppins + Roboto
│   │   ├── constants.ts
│   │   └── utils.ts                     # cn() and small helpers
│   │
│   ├── providers/
│   │   ├── query-provider.tsx
│   │   ├── theme-provider.tsx
│   │   └── app-providers.tsx
│   ├── stores/
│   │   ├── cart-store.ts                # Zustand (persisted)
│   │   └── ui-store.ts                  # drawers, menus
│   ├── hooks/                           # use-media-query, use-debounce, use-lock-scroll
│   ├── types/
│   │   └── database.types.ts            # generated by Supabase CLI
│   └── middleware.ts                    # protects /admin, sets security headers
│
├── components.json                      # shadcn config
├── next.config.ts                       # images, security headers
├── tsconfig.json
├── eslint.config.mjs
├── prettier.config.mjs
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

**Rules for this structure**

- **Routes stay thin.** A `page.tsx` fetches data and composes components. Logic lives in `features/`.
- **`components/`** holds visual pieces. **`features/`** holds data rules. A component may import from a feature, never the other way around.
- Add `"use client"` only to the smallest component that needs it (cart button, form, animation wrapper).
- Import with the alias `@/` (example: `@/features/products/queries`).
- Anything that touches secrets starts with `import "server-only"`.

---

## 5. System configuration (separate config files)

All brand and business settings live in **`src/config/`**. Components never hard-code the app name, description, phone number, WhatsApp number, address, social links, currency or delivery rules. They import from `@/config`.

### 5.1 Three layers of settings

| Layer | Where | What it holds | Who changes it |
|---|---|---|---|
| **Config files** | `src/config/*.ts` (in git) | Brand, contact details, navigation, defaults, notification events and template names, feature flags | Developer (code change + deploy) |
| **Runtime settings** | `site_settings` table (Supabase) | Values staff change without a deploy: delivery fees, free-delivery threshold, bank details, banner text, WhatsApp event on/off | Admin dashboard |
| **Secrets** | `.env` (never in git) | API keys, tokens, webhook secrets | Developer / DevOps |

**Precedence:** runtime setting → config default. Secrets are never placed in config files.

### 5.2 What goes where

| Value | File |
|---|---|
| Web application name, tagline, description | `site.config.ts` |
| Website URL, domain, language, timezone | `site.config.ts` |
| Phone number, **WhatsApp number**, email, address, opening hours | `site.config.ts` |
| Social links (Instagram and others) | `site.config.ts` |
| Logo text and letter spacing (logo can change later) | `site.config.ts` |
| Currency, order code prefix, quantity limits, payment methods, bank details | `commerce.config.ts` |
| Free-delivery threshold, delivery time text | `commerce.config.ts` (admin can override) |
| WhatsApp events, template names, retry rules, PDF options | `notifications.config.ts` |
| Header, footer and mega menu links | `navigation.config.ts` |
| Default SEO title template, Open Graph image | `seo.config.ts` |
| Feature flags | `features.config.ts` |
| WhatsApp access token, Supabase keys, webhook secrets | `.env` only |

### 5.3 `site.config.ts` (example)

```ts
import type { SiteConfig } from "./schema";

export const siteConfig = {
  name: "AYAD",
  legalName: "AYAD Scent Lab",                       // TODO: confirm legal business name
  tagline: "Smell Expensive. Feel Confident.",
  description:
    "Long-lasting oud, musk and amber attars and Arabic-inspired perfumes in Sri Lanka. Cash on Delivery and island-wide delivery.",
  url: "https://ayadscentlab.com",
  domain: "ayadscentlab.com",
  language: "en",
  locale: "en-LK",
  timezone: "Asia/Colombo",
  currency: { code: "LKR", symbol: "Rs", decimals: 0 },

  brand: {
    logoText: "AYAD",            // temporary text logo, replace with final logo later
    logoLetterSpacing: "0.42em",
    themeColor: "#081B1A",
  },

  contact: {
    phoneDisplay: "+94 76 776 ****",     // TODO: full number
    phoneE164: "+94767760000",           // TODO: replace placeholder
    whatsapp: {
      display: "+94 76 776 ****",        // TODO: full number
      number: "94767760000",             // digits only, country code first, no "+"
      defaultMessage: "Hello AYAD, I need help choosing a scent.",
    },
    email: "hello@ayadscentlab.com",     // TODO: confirm
    hours: "Daily 10am – 10pm",          // TODO: confirm
    address: { line1: "", city: "", district: "", country: "Sri Lanka" }, // used on invoices
  },

  social: {
    instagram: "https://instagram.com/ayadscentlab",
    facebook: "",
    tiktok: "",
  },
} as const satisfies SiteConfig;
```

### 5.4 `commerce.config.ts` and `notifications.config.ts` (examples)

```ts
export const commerceConfig = {
  orderCodePrefix: "AYD",          // AYD-10482
  invoicePrefix: "INV",
  receiptPrefix: "RCT",
  maxQtyPerLine: 20,
  maxLinesPerOrder: 30,
  freeDeliveryThresholdLkr: 5000,  // admin can override in site_settings
  paymentMethods: ["cod", "bank_transfer"],
  bankTransfer: { bankName: "", accountName: "", accountNumber: "", branch: "" }, // TODO: client
  deliveryEstimate: { colombo: "1–2 days", other: "2–4 days" },
} as const;

export const notificationsConfig = {
  provider: "whatsapp-cloud",
  graphApiVersion: "v26.0",        // use the current supported version
  language: "en",
  events: {
    order_placed:     { enabled: true,  template: "order_placed_invoice",     attach: "invoice" },
    payment_received: { enabled: true,  template: "payment_received_receipt", attach: "receipt" },
    order_dispatched: { enabled: false, template: "order_dispatched",         attach: null },
    order_delivered:  { enabled: false, template: "order_delivered",          attach: null },
    order_cancelled:  { enabled: false, template: "order_cancelled",          attach: null },
  },
  retry: { maxAttempts: 5, backoffSeconds: [30, 120, 600, 1800, 7200] },
  optIn: { required: true, checkboxDefaultChecked: false },
  pdf: { paper: "A4", showTaxLine: false },
} as const;
```

### 5.5 Rules

- Usage: `import { siteConfig } from "@/config"`. Example: `whatsappLink(siteConfig.contact.whatsapp.number)`.
- **Validate at build time.** `config/schema.ts` (Zod) checks every config. The production build **fails** if a placeholder (`****`, `TODO`, empty WhatsApp number) is still present.
- Config files are plain TypeScript with `as const satisfies`, so autocomplete works and typos are caught.
- Add a test (`tests/unit/config.test.ts`) that runs the schema against all configs.
- Changing the **logo**, **phone number** or **WhatsApp number** later means editing one file. No component changes.

---

## 6. Pages and the Figma design

| Route | Figma frame / area | Main components |
|---|---|---|
| `/` | AYAD Home — Desktop 1440 / Mobile 390 | hero, collection-bento, trending, promo-row, budget-tiles, featured-collection, why-ayad, order-steps, track-order-card, reviews, guides, newsletter |
| (header, all pages) | Header, Top bar, Bottom nav | top-bar, header, search, cart badge, bottom-nav |
| Mega menu | Mega menu — Shop All (desktop) | mega-menu |
| Mobile menu | Mobile menu drawer | mobile-menu (Radix Sheet) |
| Cart | Cart drawer — quick checkout (no account) | cart-drawer, checkout-form |
| `/track-order` | Track Order section | track-form, status-timeline |

**Reusable component:** `Product Card` in Figma maps to `components/product/product-card.tsx`. Build it once, use it everywhere (home, shop, collections, search, related products).

---

## 7. Design tokens (theme)

Colors come from the reference palette. Define them once as CSS variables, then map them to Tailwind and shadcn tokens.

### 7.1 Palette

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `#F6F4EE` | `#081B1A` | Page |
| `--foreground` | `#3A3A38` | `#F6F4EE` | Body text |
| `--heading` | `#153431` | `#F6F4EE` | Headings, brand text |
| `--card` | `#FFFFFF` | `#0A2320` | Cards |
| `--muted` | `#F4F0E9` | `#0D2523` | Soft surfaces |
| `--muted-foreground` | `#6A6A66` | `#A9BAB6` | Small text (passes contrast) |
| `--primary` | `#243533` | `#BDA23D` | Main buttons |
| `--primary-foreground` | `#FFFFFF` | `#081B1A` | Text on primary |
| `--secondary` | `#E3E9E7` | `#153431` | Soft buttons, pills |
| `--accent` | `#BDA23D` | `#BDA23D` | Gold badges, stars |
| `--accent-foreground` | `#081B1A` | `#081B1A` | Text on gold |
| `--border` | `#E4E1D8` | `#1C3835` | Borders, dividers |
| `--input` | `#D6D2C6` | `#243533` | Input borders |
| `--ring` | `#BDA23D` | `#BDA23D` | Focus ring |
| `--brand-deep` | `#081B1A` | `#081B1A` | Header, footer, hero |
| `--brand-darkest` | `#041210` | `#041210` | Top bar |
| `--whatsapp` | `#16A34A` | `#16A34A` | WhatsApp buttons |
| `--destructive` | `#B42318` | `#F97066` | Errors |

> The header and footer stay dark green (`--brand-deep`) in **both** modes, as in the reference site.
> Dark mode values are a starting proposal. Review them once with the client.

### 7.2 `globals.css` (Tailwind v4 style)

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

:root {
  --background: #f6f4ee;
  --foreground: #3a3a38;
  --heading: #153431;
  --card: #ffffff;
  --card-foreground: #3a3a38;
  --muted: #f4f0e9;
  --muted-foreground: #6a6a66;
  --primary: #243533;
  --primary-foreground: #ffffff;
  --secondary: #e3e9e7;
  --secondary-foreground: #153431;
  --accent: #bda23d;
  --accent-foreground: #081b1a;
  --border: #e4e1d8;
  --input: #d6d2c6;
  --ring: #bda23d;
  --brand-deep: #081b1a;
  --brand-darkest: #041210;
  --whatsapp: #16a34a;
  --destructive: #b42318;
  --radius: 1rem;
}

.dark {
  --background: #081b1a;
  --foreground: #f6f4ee;
  --heading: #f6f4ee;
  --card: #0a2320;
  --card-foreground: #f6f4ee;
  --muted: #0d2523;
  --muted-foreground: #a9bab6;
  --primary: #bda23d;
  --primary-foreground: #081b1a;
  --secondary: #153431;
  --secondary-foreground: #f6f4ee;
  --border: #1c3835;
  --input: #243533;
  --destructive: #f97066;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-heading: var(--heading);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-brand-deep: var(--brand-deep);
  --color-brand-darkest: var(--brand-darkest);
  --color-whatsapp: var(--whatsapp);
  --color-destructive: var(--destructive);
  --font-sans: var(--font-roboto), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-poppins), ui-sans-serif, system-ui, sans-serif;
  --radius-lg: var(--radius);
}

body { background: var(--background); color: var(--foreground); font-family: var(--font-sans); }
h1, h2, h3, h4 { font-family: var(--font-display); color: var(--heading); }
```

If the project uses Tailwind v3, put the same values in `tailwind.config.ts` under `theme.extend.colors`.

### 7.3 Fonts (`src/lib/fonts.ts`)

```ts
import { Poppins, Roboto } from "next/font/google";

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});
```

Apply both variables on `<html className={`${poppins.variable} ${roboto.variable}`}>`.

> **Design note:** the current Figma file uses Playfair Display + Inter. Update the Figma text styles to Poppins + Roboto so design and code match.

### 7.4 Type scale and spacing

- Headings: Poppins 600. Body: Roboto 400/500. Prices and badges: Poppins 600.
- Spacing on an 8px grid. Container max width 1312px, side padding 64px desktop / 20px mobile.
- Card radius 16–20px, buttons fully rounded, touch targets at least 44px.

---

## 8. Database (Supabase / Postgres)

### 8.1 Tables

| Table | Purpose |
|---|---|
| `products` | Name, slug, descriptions, gender, active flag, featured flag, rating summary |
| `product_variants` | Size/type (for example `12ml attar`, `50ml spray`), SKU, price, compare-at price, stock |
| `product_images` | Image path, alt text, sort order |
| `collections` | Oud, Attar Oils, Spray Perfumes, Musk & Amber, Gift Sets |
| `product_collections` | Many-to-many link |
| `notes` and `product_notes` | Scent notes (oud, amber, musk...) for filters |
| `orders` | One row per order |
| `order_items` | Snapshot of name, variant, price and quantity at purchase time |
| `order_events` | Status history shown on the Track Order timeline |
| `payments` | Each payment received (bank transfer verified, or COD cash collected) |
| `invoices` | Generated invoice and receipt PDFs (number, private file path, hash) |
| `notification_outbox` | Queue of WhatsApp messages to send, with status and retries |
| `whatsapp_messages` | Log of messages sent and received (status, template, order link) |
| `reviews` | Rating, text, verified flag, moderation status |
| `newsletter_subscribers` | Email only, unique |
| `banners` | Hero and promo content managed by admin |
| `delivery_zones` | Sri Lanka districts, fee, estimated days |
| `site_settings` | Runtime overrides edited by admin (delivery fees, free-delivery threshold, bank details, WhatsApp event toggles). Brand and contact values live in `src/config`. |
| `admin_users` | Email, password hash, role (admin, staff) — used by NextAuth |

### 8.2 Core SQL (starting point)

```sql
create type order_status   as enum ('pending','confirmed','packed','dispatched','delivered','cancelled','returned');
create type payment_method as enum ('cod','bank_transfer');
create type payment_status as enum ('unpaid','awaiting_verification','paid','refunded');

create sequence order_code_seq start 10001;

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_description text,
  description text,
  gender text check (gender in ('men','women','unisex')),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  rating_avg numeric(2,1) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  label text not null,
  sku text unique,
  price_lkr integer not null check (price_lkr >= 0),
  compare_at_lkr integer check (compare_at_lkr is null or compare_at_lkr >= price_lkr),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default ('AYD-' || nextval('order_code_seq')),
  customer_name text not null,
  phone_e164 text not null,             -- normalized, example +94767760000
  email text,
  address_line text not null,
  city text not null,
  district text not null,
  notes text,
  whatsapp_opt_in boolean not null default false,   -- consent to receive WhatsApp messages
  whatsapp_opt_in_at timestamptz,
  payment_method payment_method not null,
  payment_status payment_status not null default 'unpaid',
  status order_status not null default 'pending',
  subtotal_lkr integer not null,
  delivery_fee_lkr integer not null,
  total_lkr integer not null,
  idempotency_key text unique,          -- prevents double orders on retry
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on orders (phone_e164);
create index on orders (status, created_at desc);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  variant_id uuid references product_variants(id),
  product_name text not null,
  variant_label text not null,
  unit_price_lkr integer not null,
  quantity integer not null check (quantity between 1 and 20)
);

create table order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status order_status not null,
  note text,
  created_at timestamptz not null default now()
);
```

**Payments, invoices and notifications**

```sql
create type notification_event  as enum ('order_placed','payment_received','order_dispatched','order_delivered','order_cancelled');
create type notification_status as enum ('pending','processing','sent','delivered','read','failed','skipped');

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  method payment_method not null,
  amount_lkr integer not null check (amount_lkr > 0),
  reference text,                          -- bank slip reference or COD receipt number
  slip_path text,                          -- private storage path (bank transfer)
  received_at timestamptz not null default now(),
  recorded_by uuid                         -- admin user id
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  kind text not null check (kind in ('invoice','receipt')),
  number text unique not null,             -- INV-10482 / RCT-10482
  pdf_path text not null,                  -- private bucket "invoices"
  sha256 text not null,
  created_at timestamptz not null default now(),
  unique (order_id, kind)
);

create table notification_outbox (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  event notification_event not null,
  channel text not null default 'whatsapp',
  status notification_status not null default 'pending',
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  provider_message_id text,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (order_id, event, channel)        -- the same message can never be queued twice
);
create index on notification_outbox (status, next_attempt_at);

create table whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete set null,
  direction text not null check (direction in ('out','in')),
  provider_message_id text unique,
  phone_e164 text not null,
  template_name text,
  body_preview text,                       -- short preview, no sensitive data
  status text,                             -- sent | delivered | read | failed
  created_at timestamptz not null default now()
);
```

Prices are stored as whole rupees (`integer`). If you ever need cents, switch to minor units (`bigint`) from day one.

### 8.3 `create_order` function (outline)

A Postgres function does the whole checkout in **one transaction**, so stock and totals can never go out of sync.

1. Check the idempotency key. If the order exists, return it.
2. Load each variant by ID. Reject inactive or unknown variants.
3. Lock the variant rows (`for update`). Reject if stock is too low.
4. Recalculate subtotal from database prices (never from the browser).
5. Look up the delivery fee for the district. Apply the free-delivery rule.
6. Insert `orders`, `order_items` (price snapshot), and the first `order_events` row.
7. Reduce stock.
8. If the customer opted in to WhatsApp, insert an `order_placed` row in `notification_outbox` (same transaction).
9. Return `code` and totals.

Marking a payment as received (admin action) works the same way: **one transaction** inserts the `payments` row, sets the order to paid, and inserts a `payment_received` outbox row.

Declare it `security definer` with `set search_path = ''`, then **revoke execute from `anon` and `authenticated`**. Only the server (service role) calls it.

### 8.4 Row Level Security

| Table | Anonymous (browser) | Server (service role) |
|---|---|---|
| `products`, `product_variants`, `product_images`, `collections`, `notes`, `banners` | Read **active** rows only | Full access |
| `reviews` | Read **approved** rows only | Full access |
| `delivery_zones`, `site_settings` (public fields only, via a view) | Read | Full access |
| `orders`, `order_items`, `order_events`, `payments`, `invoices`, `notification_outbox`, `whatsapp_messages` | **No access** | Full access |
| `newsletter_subscribers` | **No access** (insert through a server action) | Full access |
| `admin_users` | **No access** | Full access |

Turn on RLS for **every** table, even those with no anonymous policy. No policy means no access.

### 8.5 Storage

| Bucket | Visibility | Content |
|---|---|---|
| `products` | Public read | Product images (WebP/AVIF, max 1600px) |
| `banners` | Public read | Hero and promo images |
| `payment-slips` | **Private** | Bank transfer slips, signed URLs only, admin viewing |
| `invoices` | **Private** | Invoice and receipt PDFs. Customers get them through a signed, expiring link. |

Allow `next/image` to load from the Supabase host through `images.remotePatterns` in `next.config.ts`.

### 8.6 Types

Generate types after every migration:

```bash
npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts
```

---

## 9. Authentication (admin only)

- **NextAuth v5** with the **Credentials** provider (email + password) against `admin_users`, hashed with Argon2 or bcrypt. Google sign-in with an email allowlist is a good alternative (see open questions).
- Session strategy: **JWT in an httpOnly, secure, sameSite=lax cookie**.
- Add `role` to the token and session in the `jwt` and `session` callbacks.
- Protect `/admin/**` in **two places**:
  1. `middleware.ts` (fast redirect for visitors without a session)
  2. `requireAdmin()` called inside the admin layout and **inside every admin Server Action** (the real security check)
- Admin writes use the service role client **after** the role check. Admin pages never call Supabase from the browser with powerful keys.
- Login protection: rate limit the login route and lock after repeated failures.

**Why not Supabase Auth too?** NextAuth is the chosen session layer. Using both adds two login systems for no benefit, because only staff sign in and their writes go through the server. Supabase RLS stays deny-by-default for everyone else.

> Customers have **no** account, so there is no customer auth state. The Zustand store does **not** hold auth. Admin UI reads the session with `useSession()`.

---

## 10. State management

| State | Where | Why |
|---|---|---|
| Products, collections, reviews, orders (server data) | **TanStack Query v5** | Caching, refetch, sync |
| Cart lines, cart drawer open/close, mobile menu, search overlay | **Zustand** | Client-only, shared across components |
| Form values and errors | **React Hook Form + Zod** | Local to the form |
| Theme (light/dark) | **next-themes** | Built-in persistence |
| URL filters (sort, notes, price) | **URL search params** | Shareable, back button works |

### 10.1 Cart store (`stores/cart-store.ts`)

Store **only** `variantId` and `quantity`. Never store prices as truth. Fetch prices from the server and re-check them at checkout.

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type CartLine = { variantId: string; quantity: number };

type CartState = {
  lines: CartLine[];
  add: (variantId: string, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (variantId, qty = 1) =>
        set((s) => {
          const found = s.lines.find((l) => l.variantId === variantId);
          const lines = found
            ? s.lines.map((l) =>
                l.variantId === variantId ? { ...l, quantity: Math.min(20, l.quantity + qty) } : l,
              )
            : [...s.lines, { variantId, quantity: qty }];
          return { lines };
        }),
      setQty: (variantId, qty) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.variantId === variantId ? { ...l, quantity: Math.max(0, Math.min(20, qty)) } : l))
            .filter((l) => l.quantity > 0),
        })),
      remove: (variantId) => set((s) => ({ lines: s.lines.filter((l) => l.variantId !== variantId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "ayad-cart", version: 1, storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);
```

Call `useCartStore.persist.rehydrate()` once in a client effect to avoid hydration mismatch. The cart drawer then loads line details with a TanStack Query call: `useQuery({ queryKey: keys.cart(variantIds), queryFn: ... })`.

### 10.2 TanStack Query v5 conventions

- **One provider**, created once per browser session. On the server, create a new client per request.
- **Query key factory** per feature, never raw string arrays in components.
- **Prefetch on the server, hydrate on the client** using `HydrationBoundary` so pages render instantly and stay in sync.
- Defaults: `staleTime` 60s for catalog, 5 min for settings, `gcTime` 10 min, `refetchOnWindowFocus` on for admin only, retry 1.
- Use `placeholderData: keepPreviousData` for filters and pagination so the grid does not flash.
- Mutations: use `onMutate` + rollback for admin edits (optimistic UI). Always `invalidateQueries` on success.
- Order tracking: `refetchInterval: 30_000` while the order is not delivered. Stop polling when delivered or cancelled.
- Admin orders: subscribe to **Supabase Realtime** and call `queryClient.invalidateQueries({ queryKey: keys.orders.all })` when a change arrives.

```ts
// features/products/keys.ts
export const productKeys = {
  all: ["products"] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.all, "list", filters] as const,
  detail: (slug: string) => [...productKeys.all, "detail", slug] as const,
};
```

```tsx
// providers/query-provider.tsx
"use client";
import { QueryClient, QueryClientProvider, isServer } from "@tanstack/react-query";

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, gcTime: 10 * 60_000, retry: 1 } },
  });
}
let browserClient: QueryClient | undefined;
const getClient = () => (isServer ? makeClient() : (browserClient ??= makeClient()));

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={getClient()}>{children}</QueryClientProvider>;
}
```

### 10.3 Caching layers (summary)

| Layer | What | How it refreshes |
|---|---|---|
| Next.js data cache | Catalog reads in Server Components | Tagged (`products`, `collections`); admin changes call `revalidateTag` |
| TanStack Query | Client interactions (filters, quick view, cart details) | `staleTime`, background refetch, invalidation |
| Browser | Images, fonts, static files | Long cache headers from Next/Vercel |
| Supabase Realtime | Admin order list | Push events trigger invalidation |

---

## 11. Checkout flow (no account)

1. Customer adds items (Zustand, instant, optimistic).
2. Cart drawer shows lines (prices fetched from the server) and a **free delivery progress bar**.
3. Checkout form (React Hook Form + Zod): name, phone, address, city, district, notes, payment method, and a **WhatsApp consent checkbox** ("Send my invoice and order updates on WhatsApp"). Not pre-ticked. Short privacy note under it.
4. Submit a **Server Action**:
   - Validate with the same Zod schema.
   - Verify Turnstile token and rate limit.
   - Normalize phone to `+94...`.
   - Call `create_order` (server price check, stock lock, totals).
5. On success: clear cart, redirect to `/order-success/[code]`.
6. The order transaction also queues an **`order_placed`** WhatsApp message (if the customer opted in). The worker sends the template with the **invoice PDF** within about a minute.
7. Success page shows the Order ID, total, bank details (if bank transfer), a **Track Order** button, **Download invoice**, a **Chat on WhatsApp** button, and the line "We sent your invoice to your WhatsApp" when it applies.
8. Admin sees the new order (Realtime). When payment is received (bank transfer verified, or COD cash collected), admin clicks **Record payment**. This queues **`payment_received`** with a **receipt PDF**. Each status change adds an `order_events` row.

**Idempotency:** generate a UUID when the checkout page opens and send it with the order. Double-clicks and retries create one order only.

---

## 12. Track Order flow

- Form fields: **Order ID** (`AYD-10482`) + **Phone** (`07X XXX XXXX`).
- `POST /api/track` (or a Server Action):
  1. Rate limit by IP (example: 5 tries per minute) and show Turnstile after failures.
  2. Normalize the phone number.
  3. Look up `code` + `phone_e164` with the service role.
  4. Return **only**: status, payment status, timeline events, item names and quantities, city. **No address, no full phone, no email.**
  5. If nothing matches, return one generic message: *"We could not find an order with those details."* Do not say which field was wrong.
- UI: status timeline (Confirmed → Packed → Dispatched → Delivered), polling every 30 seconds until final. Show **Download invoice** and **Download receipt** buttons when those PDFs exist (signed link).

---

## 13. WhatsApp communication and notifications

WhatsApp is the main way customers and admin talk. It does three jobs:

| Job | How | Cost |
|---|---|---|
| **Customer → shop** (questions, help choosing) | Click-to-chat buttons that open `wa.me` | Free |
| **Admin ↔ customer** conversation | Staff reply in the **WhatsApp Business app** (or a shared inbox) | Free for normal chats |
| **System → customer** (automatic messages with PDF) | **WhatsApp Business Platform (Cloud API)** with approved templates | Charged per message (see 13.9) |

### 13.1 Main events only

| Event | Trigger | Message | PDF attached | Default |
|---|---|---|---|---|
| `order_placed` | Order created | Order received: order ID, total, payment method (bank details if bank transfer), Track Order button | **Invoice** (INV-…) | **ON** |
| `payment_received` | Admin records payment (bank transfer verified, or COD cash collected) | Payment received: amount, order ID, Track Order button | **Receipt** (RCT-…, marked PAID) | **ON** |
| `order_dispatched` | Status becomes dispatched | Short update + Track Order button | None | OFF |
| `order_delivered` | Status becomes delivered | Short thank-you | None | OFF |
| `order_cancelled` | Status becomes cancelled | Short notice | None | OFF |

Turn events on or off in `notifications.config.ts`, or at runtime in admin Settings. Keep the list short: every automatic message costs money and adds noise.

### 13.2 What you need from Meta (start in Phase 0)

Approvals take time, so begin before development finishes.

1. Meta Business portfolio (the client's business account).
2. **Business verification** (recommended, raises sending limits).
3. WhatsApp Business Account (WABA) and a Meta developer app with the WhatsApp product added.
4. A phone number for the API (see 13.3) and an approved display name.
5. A **system user** with a permanent access token (messaging and management permissions).
6. A payment method on the WABA for billing.
7. Webhook subscription pointing to `/api/webhooks/whatsapp`.
8. **Message templates submitted and approved** (see 13.4).

### 13.3 Which phone number?

| Option | What it means | Notes |
|---|---|---|
| **A. Same number in the app and the API (coexistence)** | Staff keep chatting in the WhatsApp Business app, and the system sends automatic messages from the same number | Best fit for "both sides communicate comfortably". Check that Meta supports it for your number and region, and read its current limits. |
| **B. Separate number for the API** | Automatic messages come from a different number than the one staff chat on | Simple and reliable, but customers see two numbers. |
| **C. Third-party WhatsApp provider with a shared inbox** | A paid tool provides inbox + API | More features, extra monthly cost. |

Default in this document: **A**, with **B** as the fallback.

### 13.4 Templates (all category: Utility)

Business-initiated messages must use **pre-approved templates**. A template can have a **document header** (PDF). Use named variables.

**`order_placed_invoice`**

| Part | Content |
|---|---|
| Header | Document (PDF), filename `Invoice-AYD-xxxxx.pdf` |
| Body | `Hi {{customer_name}}, thank you for shopping with AYAD! Your order {{order_code}} is placed. Total: {{total}}. Payment: {{payment_method}}. Your invoice is attached.` |
| Footer | `AYAD · ayadscentlab.com` |
| Button | URL: `https://ayadscentlab.com/track-order?code={{1}}` (label "Track order") |

**`payment_received_receipt`**

| Part | Content |
|---|---|
| Header | Document (PDF), filename `Receipt-AYD-xxxxx.pdf` |
| Body | `Hi {{customer_name}}, we received your payment of {{amount}} for order {{order_code}}. Thank you! Your receipt is attached.` |
| Footer | `AYAD · ayadscentlab.com` |
| Button | URL: Track order |

**Rules**
- Keep wording **transactional**. Do not add offers or promotion. Meta may re-categorize such templates as Marketing, which costs more.
- Provide sample values when you create a template. The sample PDF is reviewed too.
- Handle the `message_template_status_update` webhook. Alert admin if a template is rejected or paused.
- Template names and language live in `notifications.config.ts`.

### 13.5 End-to-end flow

1. **Event happens.** `create_order` or `record_payment` writes the business change **and** a `notification_outbox` row in one transaction. The unique key `(order_id, event, channel)` prevents duplicates.
2. **Worker runs** every minute (`/api/cron/notifications`, protected by `CRON_SECRET`). It claims pending rows with `for update skip locked`.
3. **Checks:** event enabled, customer opted in, phone valid, retry limit not reached.
4. **PDF:** generate the invoice or receipt on the server, save to the private `invoices` bucket, store number + SHA-256 in `invoices`.
5. **Upload** the PDF to the WhatsApp media endpoint and get a media ID.
6. **Send** the template with the document header, body variables and button value.
7. **Save** the provider message ID. Status becomes `sent`.
8. **Webhook** updates status to `delivered`, `read` or `failed`, and logs customer replies.
9. **Failures** retry with backoff (`retry.backoffSeconds`). After the last attempt the row is `failed`. Admin sees a red badge with **Retry** and **Send manually** (opens `wa.me` with a prefilled message and a secure invoice link).

### 13.6 Sending code (server only)

```ts
// lib/whatsapp/media.ts and send.ts  (server only)
import "server-only";
import { notificationsConfig as cfg } from "@/config";
import { env } from "@/lib/env";

const base = `https://graph.facebook.com/${cfg.graphApiVersion}/${env.WHATSAPP_PHONE_NUMBER_ID}`;
const auth = { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}` };

export async function uploadPdf(pdf: Uint8Array, filename: string) {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "application/pdf");
  form.append("file", new Blob([pdf], { type: "application/pdf" }), filename);
  const res = await fetch(`${base}/media`, { method: "POST", headers: auth, body: form });
  if (!res.ok) throw new Error(`WhatsApp media upload failed (${res.status})`);
  return ((await res.json()) as { id: string }).id;
}

export async function sendInvoiceTemplate(args: {
  toDigits: string;                       // 94767760000
  template: string;                       // from config
  mediaId: string;
  filename: string;
  params: Record<string, string>;         // customer_name, order_code, total, payment_method
  trackCode: string;                      // button variable
}) {
  const res = await fetch(`${base}/messages`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: args.toDigits,
      type: "template",
      template: {
        name: args.template,
        language: { code: cfg.language },
        components: [
          { type: "header", parameters: [{ type: "document", document: { id: args.mediaId, filename: args.filename } }] },
          {
            type: "body",
            parameters: Object.entries(args.params).map(([k, v]) => ({ type: "text", parameter_name: k, text: v })),
          },
          { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: args.trackCode }] },
        ],
      },
    }),
  });
  if (!res.ok) throw new Error(`WhatsApp send failed (${res.status})`);
  return ((await res.json()) as { messages: { id: string }[] }).messages[0]!.id;
}
```

Never log the access token, phone numbers or message bodies.

### 13.7 Webhook (`/api/webhooks/whatsapp`)

- **GET:** answer Meta's verification (`hub.mode`, `hub.verify_token`, `hub.challenge`).
- **POST:** read the **raw body**, verify the `X-Hub-Signature-256` header with `WHATSAPP_APP_SECRET`, return `200` quickly, then process.
- Process **idempotently** (the same event can arrive twice).
- Handle: message status (`sent`, `delivered`, `read`, `failed`), inbound customer messages (log only), template status changes.
- If a customer sends **STOP** (or similar), set `whatsapp_opt_in = false` and stop automatic messages.
- If the number is **not on WhatsApp**, mark the outbox row `skipped`. Fall back to the on-site invoice download (and email, if one was given).

### 13.8 Consent and privacy

- Checkout has an explicit, **unticked** consent checkbox with a clear benefit ("Get your invoice and order updates on WhatsApp").
- Store `whatsapp_opt_in`, the time and the source.
- Send **transactional** messages only. Marketing messages need separate consent and are out of scope.
- Honor opt-out immediately.
- Keep `body_preview` short and free of sensitive data. Do not log phone numbers.
- Confirm the final wording of the consent text and the Privacy Policy with a lawyer (Sri Lanka PDPA).

### 13.9 Cost notes

- Business-initiated templates are charged **per delivered message**. Based on recent Meta pricing announcements, since **1 October 2026** utility templates are charged even inside the 24-hour customer service window, and free-form service replies are charged after a monthly free allowance per number.
- Rates depend on the destination country. **Check Meta's current rate card for Sri Lanka** before launch.
- One order with two main events means about two messages. Estimate: `orders per month × events per order × rate`.
- Keep costs down: only main events, strictly utility wording, no repeated reminders.
- Show a monthly message count in the admin Notifications page.

### 13.10 Admin ↔ customer chat

- Every order page has a **Chat on WhatsApp** button (`wa.me` with a prefilled message containing the order code).
- The order page shows the **message log** (what the system sent, plus delivery status).
- Staff reply in the WhatsApp Business app. With coexistence they see system messages and customer replies in one thread.
- Click-to-chat entry points for customers: header icon, floating button, product page ("Ask on WhatsApp"), order success page, Track Order page, footer, 404 page.

```ts
// lib/whatsapp/link.ts
import { siteConfig } from "@/config";

export const whatsappLink = (message?: string, number = siteConfig.contact.whatsapp.number) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message ?? siteConfig.contact.whatsapp.defaultMessage)}`;

export const orderHelpLink = (code: string) =>
  whatsappLink(`Hello AYAD, I need help with order ${code}.`);
```

Note: a `wa.me` link opens a chat but **cannot attach a file or send automatically**. Automatic messages with PDFs use the Cloud API only.

### 13.11 Invoice and receipt PDF

**Contents**
- Header: logo text **AYAD**, business name, address, phone, email, website (all from `siteConfig`).
- Invoice number and date, order code.
- Customer name, phone, delivery address.
- Items table: product, variant, quantity, unit price, line total.
- Subtotal, delivery fee, **total in LKR**.
- Payment method and status. The **receipt** shows "PAID", the amount and the date.
- Footer: thank-you line and Track Order link.

**Build rules**
- Render on the server in the **Node runtime** (not Edge). Register Roboto/Poppins fonts for the PDF.
- A4, target under 100 KB, deterministic output.
- Numbers: `INV-` / `RCT-` + order number. Store number, path and SHA-256 in `invoices`.
- Customers download through `/api/invoices/[token]`, a **signed token with expiry**. They can always get a fresh link from Track Order (Order ID + phone).

### 13.12 Monitoring

- Admin **Notifications** page: filter by status (pending, sent, delivered, read, failed), retry, send manually, monthly counts.
- Alert (email or Sentry) when failures pass a threshold or a template is rejected.
---

## 14. Motion (Framer Motion)

- Wrap the storefront in one `MotionProvider` using `LazyMotion` + `domAnimation` and use `m.div` instead of `motion.div`.
- Reusable wrappers in `components/motion/`: `FadeIn`, `Stagger`, `PageTransition`, `Pressable` (button tap scale).
- Where to use it: hero entrance, product card hover lift, cart drawer slide, mega menu fade, add-to-cart confirmation, status timeline steps.
- Keep durations short (150–350ms). Use `ease: [0.22, 1, 0.36, 1]`.
- **Respect `prefers-reduced-motion`** (`useReducedMotion`) and disable large movement.
- Do not animate layout-heavy lists on every render. Animate once on enter.

---

## 15. Security checklist

**Data and access**
- [ ] RLS enabled on every table. Policies tested.
- [ ] Service role key only in server code with `import "server-only"`.
- [ ] `create_order` and admin functions not executable by `anon` / `authenticated`.
- [ ] Private bucket for payment slips, signed URLs with short expiry.

**Input and abuse**
- [ ] Zod validation on **both** client and server for every form.
- [ ] Server recalculates all prices, totals and stock. Quantity limits per line and per order.
- [ ] Rate limiting: checkout, track order, newsletter, login, review submit.
- [ ] Cloudflare Turnstile on checkout, track order, newsletter.
- [ ] Idempotency key on orders.
- [ ] Review text sanitized (render as plain text), moderated before showing.
- [ ] Upload limits: type allowlist (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`), max size, random file names.

**Sessions and headers**
- [ ] Admin cookies: httpOnly, secure, sameSite.
- [ ] `AUTH_SECRET` strong and different per environment.
- [ ] Security headers in `next.config.ts`: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `X-Frame-Options: DENY`.
- [ ] CSP allows only: self, Supabase host, Turnstile, Vercel analytics (if used).

**WhatsApp and PDFs**
- [ ] WhatsApp access token and app secret only in server code (`server-only`), never in `NEXT_PUBLIC_*`.
- [ ] Webhook verifies `X-Hub-Signature-256` on the raw body and the verify token on GET.
- [ ] Cron route requires `CRON_SECRET`.
- [ ] Messages are sent only when the customer opted in. STOP is honored.
- [ ] Invoice and receipt PDFs live in a **private** bucket. Downloads use signed, expiring links.
- [ ] Outbox is idempotent (unique key) so customers never get duplicate messages.
- [ ] Template names and event toggles validated by the config schema.

**Privacy and operations**
- [ ] Collect the minimum personal data. Do not log phone numbers, addresses or full request bodies.
- [ ] Privacy Policy and Terms pages (Sri Lanka's Personal Data Protection Act, No. 9 of 2022, may apply. Confirm with a lawyer).
- [ ] `.env.example` committed, real `.env` never committed.
- [ ] Dependabot or `npm audit` in CI.
- [ ] Supabase backups on. Test a restore once.
- [ ] Error monitoring (Sentry) without personal data.

---

## 16. Performance and UX targets

| Target | Goal |
|---|---|
| Lighthouse (mobile) | Performance 90+, Accessibility 95+, SEO 100 |
| LCP | Under 2.5s on 4G |
| CLS | Under 0.1 (set image width and height, reserve space for banners) |
| JS on home | Keep client components small. Check with `@next/bundle-analyzer`. |

**Practices**
- `next/image` with `sizes`, AVIF/WebP, `priority` only for the hero image.
- Suspense boundaries and **skeletons** for product grids, so the layout never jumps.
- Optimistic Add to Cart, instant drawer open, toast confirmation.
- Sticky header and **sticky Add to Cart on mobile product pages**.
- Mobile bottom nav: Home, Shop, Cart, WhatsApp, Track.
- Keyboard accessible menus and dialogs (Radix handles most of it). Visible focus ring in gold.
- Color contrast checked for all text. Do not use `--muted-foreground` below 14px on dark surfaces.

---

## 17. SEO

- `generateMetadata` on product and collection pages (title, description, canonical, Open Graph image).
- JSON-LD: `Organization`, `WebSite` (with search action), `Product` (price in LKR, availability, rating), `BreadcrumbList`.
- `sitemap.ts` built from products and collections. `robots.ts` blocks `/admin`, `/api`, `/checkout`, `/cart`.
- Clean URLs: `/product/oud-royale`, `/collections/oud`.
- Set `metadataBase` to `https://ayadscentlab.com`.

---

## 18. Environment variables (`.env.example`)

```bash
# App
NEXT_PUBLIC_SITE_URL=https://ayadscentlab.com
# Brand and contact values (name, phone, WhatsApp number) live in src/config, not here.

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=            # server only, never NEXT_PUBLIC

# NextAuth (Auth.js v5)
AUTH_SECRET=                          # generate with: npx auth secret
AUTH_URL=http://localhost:3000

# Abuse protection
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# WhatsApp Business Platform (Cloud API), server only
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_ACCESS_TOKEN=                # system user token
WHATSAPP_APP_SECRET=                  # verifies webhook signatures
WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# Background worker and invoice links
CRON_SECRET=
INVOICE_LINK_SECRET=

# Cache revalidation webhook
REVALIDATE_SECRET=
```

Validate all of these in `src/lib/env.ts` with Zod. The app should **fail to build** if a required variable is missing.

---

## 19. Quality, testing and CI

**Scripts**

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "e2e": "playwright test",
  "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/database.types.ts"
}
```

**CI (GitHub Actions):** install → lint → typecheck → unit tests → build → (on main) Playwright smoke test.

**Must-have tests**
- Unit: `formatLKR`, phone normalization, cart store, Zod schemas, WhatsApp link builder.
- E2E: add to cart → checkout (COD) → success page → track order with Order ID + phone.
- E2E: wrong phone on track order shows the generic message.
- E2E: `/admin` redirects to login without a session.
- Database: RLS tests proving anonymous users cannot read `orders`.

**Conventions**
- Files: `kebab-case.tsx`. Components: `PascalCase`. Hooks: `useThing`.
- Commits: conventional style (`feat:`, `fix:`, `chore:`).
- Branches: `main` (production), `develop` (staging), `feat/*`.
- No `any`. No unused exports. Handle loading, empty and error states on every data view.

---

## 20. Build roadmap

**Phase 0 — Foundation**
- [ ] Create Next.js + TypeScript project, Tailwind, shadcn/ui, ESLint, Prettier, Husky
- [ ] Fonts, theme tokens, next-themes, base layout
- [ ] Supabase project, migrations, RLS, seed data, generated types
- [ ] Env validation, CI pipeline
- [ ] `src/config/` files and schema validation
- [ ] **Start Meta setup now** (business verification, WABA, phone number, templates). Approvals take time.

**Phase 1 — Storefront (read-only)**
- [ ] Header, top bar, mega menu, mobile menu, bottom nav, footer, WhatsApp float
- [ ] Home page sections from Figma
- [ ] Shop, collection, search, product pages
- [ ] Product Card, quick view, filters (URL params)

**Phase 2 — Cart and checkout**
- [ ] Zustand cart, cart drawer, free delivery bar
- [ ] Checkout form, `create_order`, success page, WhatsApp confirm
- [ ] Rate limit, Turnstile, idempotency

**Phase 3 — Track Order**
- [ ] `/track-order`, API, status timeline, polling

**Phase 3B — WhatsApp notifications**
- [ ] Consent checkbox at checkout, opt-in fields
- [ ] Outbox table, worker route, retries
- [ ] Invoice and receipt PDFs, private bucket, signed download links
- [ ] Cloud API client (media upload + template send)
- [ ] Webhook (status, replies, template status, STOP)
- [ ] Admin: record payment, message log, resend, Notifications page
- [ ] Test with Meta test number, then production number

**Phase 4 — Admin**
- [ ] NextAuth admin login, role guard
- [ ] Orders (Realtime), status updates, print slip
- [ ] Products, variants, images, collections, banners, settings
- [ ] Review moderation

**Phase 5 — Polish and launch**
- [ ] Motion pass, accessibility pass, SEO and JSON-LD
- [ ] Performance budget check, Lighthouse
- [ ] Security checklist sign-off, backups, monitoring
- [ ] Domain, DNS, production env, launch checklist

**Later (optional)**
- More notification events (dispatched, delivered) and review requests
- SMS notifications (a local SMS gateway)
- Online card payments (a Sri Lankan payment gateway)
- Sinhala and Tamil languages
- Discount codes, gift cards, loyalty

---

## 21. Open questions (defaults used until answered)

| # | Question | Default used in this document |
|---|---|---|
| 1 | Admin login method: email + password, or Google with an allowlist? | Email + password (Credentials) |
| 2 | Is Next.js confirmed as the framework? (NextAuth, Metadata API and `next-themes` suggest yes.) | Next.js App Router |
| 3 | Delivery fees: flat, or per district? Free-delivery threshold? | Per district table, free over Rs 5,000 (editable) |
| 4 | Bank transfer: upload a slip on the site, or send it on WhatsApp? | Slip upload to a private bucket, plus WhatsApp option |
| 5 | Should customers be able to write reviews? | Yes, only for delivered orders, moderated |
| 6 | Order notifications: is WhatsApp enough, or also SMS or email? | WhatsApp only (invoice + receipt). Email as a fallback if provided |
| 7 | Languages: English only, or also Sinhala and Tamil? | English only for launch |
| 8 | Product catalog size and photo source? | Add through admin, WebP images |
| 9 | Who owns Supabase, Vercel and domain accounts? | Client-owned accounts, developer invited |
| 10 | Dark mode: required at launch? | Included. Palette needs client review |
| 11 | WhatsApp number setup: same number in the app and API (coexistence), or a separate API number? | Same number (coexistence), separate number as fallback |
| 12 | Which events send a WhatsApp message? | Only **order placed** and **payment received**. Others off |
| 13 | Invoice details: legal business name, address, tax or VAT number, logo? | Taken from `siteConfig`. Tax line hidden |
| 14 | Who confirms bank transfers and clicks "Record payment"? | Admin or staff role |
| 15 | WhatsApp consent: explicit unticked checkbox, or a required notice on the phone field? | Unticked checkbox, with a fallback (invoice download) |
| 16 | Message language: English only, or also Sinhala and Tamil templates? | English only |

---

*End of document.*
