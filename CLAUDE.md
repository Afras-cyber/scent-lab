# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

AYAD (ayadscentlab.com) is an online perfume shop for Sri Lanka (LKR, Cash on Delivery or bank transfer, island-wide delivery). Customers have **no accounts**: they check out with name, phone and address, and track orders with Order ID + phone. Only staff log in, at `/admin`. WhatsApp is the main channel: click-to-chat `wa.me` links, plus automatic Cloud API template messages with a PDF invoice or receipt on **order placed** and **payment received**.

The full spec is `docs/AYAD_PROJECT_STRUCTURE.md`. Read the relevant section before building a feature; it covers the folder layout, database schema, RLS rules, checkout, tracking and WhatsApp flows, and the security checklist. Note that `/docs` is in `.gitignore`, so it exists only locally.

**Status:** only the Next.js starter exists so far. The architecture below is the target; build towards it.

## Commands

```bash
npm run dev              # Next.js dev server (Turbopack)
npm run build            # production build
npm run lint             # ESLint (flat config, next core-web-vitals + typescript)
npx tsc --noEmit         # typecheck (no script yet)

npm run supabase:start   # local Supabase in Docker (Studio: http://127.0.0.1:54323, API: :54321)
npm run supabase:status  # prints the URL and publishable key for .env.local
npm run supabase:reset   # re-apply supabase/migrations + seed
npm run supabase:stop
```

Local setup: copy `.env.example` to `.env.local` and fill in the values from `supabase:status`. Tests are not set up yet. The plan is Vitest for unit tests (`tests/unit/`, run one with `npx vitest run <path>`) and Playwright for end-to-end tests (`tests/e2e/`).

## Version-specific gotchas

- **Next.js 16.4 / React 19.3.** Check `node_modules/next/dist/docs/` before using any Next API. Key differences:
  - `middleware.ts` is now **`src/proxy.ts`**. Use it only for optimistic redirects and headers, never as the real auth check.
  - `next.config.ts` enables **`cacheComponents`** and `partialPrefetching`. Data caching uses the `"use cache"` directive with `cacheTag` and `cacheLife`, and revalidation uses `revalidateTag` (see `01-app/01-getting-started/08-caching.md` and `09-revalidating.md`). Do not use the old `unstable_cache` or `fetch` revalidate patterns.
  - Layouts are typed with the global `LayoutProps<"/route">` / `PageProps<"/route">` helpers.
- **Tailwind v4** runs through `@tailwindcss/turbopack`. There is no `tailwind.config`; theme tokens live as CSS variables plus `@theme inline` in `src/app/globals.css` (palette in spec §7).
- **Supabase uses the new publishable key.** The variable is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, not `ANON_KEY` as the spec says. The browser client already exists at `src/lib/supabase/client.ts` (`getSupabaseBrowserClient`). Server-only clients go in `src/lib/supabase/server.ts` and `admin.ts`, behind `import "server-only"`.
- Path alias: `@/*` → `src/*`.

## Architecture (target)

- **Server first.** Pages are Server Components that read the public catalog from Supabase. Client components are kept small: cart, filters, forms and animations.
- **Layers:**
  - `app/` routes stay thin. They are split into `(storefront)` and `(admin)/admin` route groups.
  - `components/` holds visual pieces.
  - `features/<domain>/` holds data access, server actions, Zod schemas, TanStack Query hooks and query-key factories.
  - Components may import from features, never the other way around.
- **State ownership:**
  - Server data lives in TanStack Query v5 (prefetched on the server and hydrated on the client).
  - The cart and UI drawers live in Zustand. The cart stores only `{variantId, quantity}`, persisted with `skipHydration`.
  - Forms use React Hook Form with the same Zod schema on client and server.
  - Filters live in URL search params.
- **The client is never trusted.** Prices, stock, delivery fees and totals are always recomputed in the Postgres `create_order` RPC. It is `security definer` and only the service role may call it. The RPC locks variant rows and uses an idempotency key.
- **RLS is deny by default** on every table. The anonymous role can read only active catalog rows, approved reviews and public settings. Orders, payments, invoices, the outbox and WhatsApp logs are reachable only through server code using the service role.
- **Admin auth:** NextAuth v5 with the Credentials provider against `admin_users`, using JWT sessions with a role claim. `requireAdmin()` must run in the admin layout **and in every admin server action**.
- **Notifications are an outbox.**
  - The order and payment transactions insert a `notification_outbox` row, keyed uniquely on `(order_id, event, channel)`.
  - A cron worker (`/api/cron/notifications`, protected by `CRON_SECRET`) renders the PDF with `@react-pdf/renderer` on the Node runtime, uploads it to WhatsApp media, then sends the template and retries with backoff.
  - The webhook verifies `X-Hub-Signature-256` on the raw body.
  - Messages go only to customers who opted in.
- **Config vs runtime vs secrets:**
  - Brand, contact, WhatsApp number, navigation, notification events and feature flags live in `src/config/*.ts` (`as const satisfies`, validated by `config/schema.ts`). Never hard-code these values in components.
  - Staff-editable overrides (delivery fees, bank details, event toggles) live in the `site_settings` table, which takes precedence over config.
  - Secrets live only in `.env`, validated by `src/lib/env.ts`.
  - The production build must fail while placeholders (`TODO`, `****`) remain in config.
- The logo is temporary text ("AYAD", wide letter-spacing) and lives in one file: `components/layout/logo.tsx`.

## Design

- **No Figma access** (the MCP cannot open the file). The design source is the PNG exports in `docs/figma/`:
  - the Home and Product pages (desktop 1440 / mobile 390);
  - the cart drawer, mega menu, mobile menu, "Order via WhatsApp" sheet, product card, lightbox and out-of-stock state.
- The PNGs are 4× scale and very large; downscale and slice them (for example with `sips`) before viewing.
- Every other page (shop, collections, search, checkout, track order, information pages, admin) must be designed to match the existing style:
  - cream background (`#F6F4EE`);
  - dark green gradient cards (`#081B1A` → `#243533`);
  - white rounded cards (16–20px radius);
  - gold accents (`#BDA23D`);
  - small uppercase pill labels above serif section headings;
  - fully rounded buttons.
- The header and footer stay dark green in both themes.
- Headings and product names use a serif (Playfair Display, as in the design). UI and body text use a sans-serif.
- Default images in `public/images/`: `banners/home_banner_{desktop,mobile}.png`, `products/product_image.png` and `collections/Bottle.png`. Use these until real photos are added.

## Conventions

- Files are `kebab-case.tsx` and components are `PascalCase`.
- Prices are whole rupees (`integer`), displayed as `Rs 3,490`.
- Phones are normalized to E.164 `+94…`.
- Never log phone numbers, addresses or message bodies.
- Track Order responses return no address, full phone or email, and give one generic "not found" message.
