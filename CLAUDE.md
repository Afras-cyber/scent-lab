# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

AYAD (ayadscentlab.com) is an online perfume shop for Sri Lanka (LKR, Cash on Delivery or bank transfer, island-wide delivery). Customers have **no accounts**: they check out with name, phone and address, and track orders with Order ID + phone. Only staff log in, at `/admin`. WhatsApp is the main channel, as **click-to-chat only**: `wa.me` links open WhatsApp Web or the app with a prefilled message. There is **no WhatsApp Business API / Cloud API** (this overrides the spec), so nothing is sent automatically. Staff WhatsApp tools (sending invoice/receipt links to customers) will be designed with the admin panel.

The full spec is `docs/AYAD_PROJECT_STRUCTURE.md`. Read the relevant section before building a feature; it covers the folder layout, database schema, RLS rules, checkout, tracking and WhatsApp flows, and the security checklist. Note that `/docs` is in `.gitignore`, so it exists only locally.

**Status:** Phase 0 (foundation) is done: tooling, theme tokens and fonts, `src/config`, env validation, the full Supabase schema with RLS, `create_order` / `record_payment`, storage buckets, seed data, pgTAP + Vitest tests and CI. Phase 1 (storefront, read-only; spec §20) is done: the site chrome, the catalog data layer, `ProductCard`, the Home page (`components/home/`, copy in `config/home.config.ts`) and `/shop` (`components/shop/`, `config/shop.config.ts`; multi-select filters as comma lists in the URL, facet counts, price slider, mobile filter/sort sheets) are done. So are `/collections`, `/collections/[slug]` and `/search` (`components/collections/`, `components/search/`; they reuse the shop listing through a `ListingScope` in `components/shop/shop-href.ts`: path, locked filters, kept filters) and the header search popup (`features/search/`: `/api/search` route, TanStack Query hook, recent searches in localStorage, open state in a Zustand store; copy in `config/search.config.ts` and `config/collections.config.ts`). So are `/product/[slug]` (`components/product/`: gallery + lightbox, `BuyBox` with size in `?size=`, delivery checker, scent profile, details accordion, reviews, related; copy in `config/product.config.ts`; scent data from the `scent_profile` migration: `product_notes.tier` and profile columns on `products`) and the quick view (`/api/products/[slug]`, `features/catalog/{hooks,keys,quick-view-store}.ts`, dialog mounted in the storefront layout). Add to Cart is a disabled stub until the Phase 2 cart; Order via WhatsApp is a prefilled wa.me link. Phase 1 is complete; next is Phase 2 (Zustand cart, cart drawer, checkout, `create_order`). The architecture below is the target; build towards it.

## Commands

```bash
npm run dev              # Next.js dev server (Turbopack)
npm run build            # production build; fails on env errors or config placeholders
npm run lint             # ESLint (flat config, next core-web-vitals + typescript)
npm run typecheck        # next typegen + tsc --noEmit
npm run format           # Prettier (+ Tailwind class sorting); format:check in CI
npm test                 # Vitest, tests/unit; one file: npx vitest run <path>
npm run check:config     # lists src/config placeholders that block a production build

npm run supabase:start   # local Supabase in Docker (Studio: http://127.0.0.1:54323, API: :54321)
npm run supabase:status  # prints the URL, publishable key and secret key for .env.local
npm run supabase:reset   # re-apply supabase/migrations + seed (then hard-refresh: a running dev server keeps serving the old "use cache" catalog)
npm run supabase:stop
npm run db:types         # regenerate src/types/database.types.ts after every migration
npm run db:lint          # plpgsql_check on SQL functions
npx supabase test db     # pgTAP tests in supabase/tests/database (RLS, create_order)
```

Local setup: copy `.env.example` to `.env.local` and fill in `PUBLISHABLE_KEY` and `SECRET_KEY` from `supabase:status`. Develop against local Supabase: the hosted project has an older, out-of-sync schema (remote-only migrations, no table grants) and must not be used until it is synced. Playwright end-to-end tests (`tests/e2e/`) are not set up yet.

Build switches: `ALLOW_CONFIG_PLACEHOLDERS=true` lets `next build` pass with `TODO`/`****` or the mock values (address, bank details; marked `// MOCK`, listed in `KNOWN_PLACEHOLDER_VALUES`) in `src/config` (CI does this until the client supplies real values); `SKIP_ENV_VALIDATION=true` skips the env check. Husky runs lint-staged on commit.

## Version-specific gotchas

- **Next.js 16.4 / React 19.3.** Check `node_modules/next/dist/docs/` before using any Next API. Key differences:
  - `middleware.ts` is now **`src/proxy.ts`**. Use it only for optimistic redirects and headers, never as the real auth check.
  - `next.config.ts` enables **`cacheComponents`** and `partialPrefetching`. Data caching uses the `"use cache"` directive with `cacheTag` and `cacheLife`, and revalidation uses `revalidateTag` (see `01-app/01-getting-started/08-caching.md` and `09-revalidating.md`). Do not use the old `unstable_cache` or `fetch` revalidate patterns.
  - Layouts are typed with the global `LayoutProps<"/route">` / `PageProps<"/route">` helpers.
- **Tailwind v4** runs through `@tailwindcss/turbopack`. There is no `tailwind.config`; theme tokens live as CSS variables plus `@theme inline` in `src/app/globals.css` (palette in spec §7).
- **Supabase uses the new API keys.** The variables are `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`, not `ANON_KEY` / `SERVICE_ROLE_KEY` as the spec says. Clients in `src/lib/supabase/`:
  - `client.ts` → `getSupabaseBrowserClient()` (browser, publishable key);
  - `server.ts` → `createSupabaseServerClient()` (publishable key, RLS applies, no cookies, so it works inside `"use cache"`);
  - `admin.ts` → `createSupabaseAdminClient()` (secret key, bypasses RLS; only after validating the caller).
  - There is no `@supabase/ssr`: customers have no Supabase session and staff use NextAuth.
- **Env:** schemas in `src/lib/env-schema.ts`. Server code imports `env` from `@/lib/env` (`server-only`); client code imports `publicEnv` from `@/lib/public-env`. Variables for later phases are `.optional()` until their feature ships; make them required then. Empty values (`KEY=`) count as unset.
- **Theme:** no `next-themes`. An inline script in `app/layout.tsx` (`lib/theme.ts`) adds `.dark` to `<html>` from `localStorage` before paint, following Next's "preventing flash before hydration" guide; `ThemeToggle` flips the class. Light is the default.
- **shadcn/ui:** `components.json` is set up (new-york, `radix-ui` package). After `npx shadcn add <x>`, check the `cn` import: the CLI once wrote `from "cn"` and installed an unrelated npm package. Restyle to brand (`rounded-full` buttons; `accent` is gold, so don't use it for hover backgrounds).
- **Database:** migrations in `supabase/migrations/` (schema → RLS → order functions → storage). RLS revokes Supabase's default grants, so a new table gets **no** anon access until you add an explicit `grant` + policy. `reviews` and `site_settings` use column grants: anon queries must list columns (no `select("*")`). RPC errors are raised as stable codes (`INVALID_INPUT`, `VARIANT_UNAVAILABLE`, `INSUFFICIENT_STOCK`, `UNKNOWN_DISTRICT`, …). `product_images.path` starting with `/` is a file in `public/`, otherwise an object in the `products` bucket.
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
- **RLS is deny by default** on every table. The anonymous role can read only active catalog rows, approved reviews and public settings. Orders, payments and invoices are reachable only through server code using the service role.
- **Admin auth:** NextAuth v5 with the Credentials provider against `admin_users`, using JWT sessions with a role claim. `requireAdmin()` must run in the admin layout **and in every admin server action**.
- **WhatsApp is links, not a pipeline.** There is no outbox, cron worker, webhook or opt-in. Customer-to-shop links use the texts in `config/whatsapp.config.ts` and the number in `site.config.ts`. Invoice/receipt PDFs (`@react-pdf/renderer`, Node runtime) will be shared as signed links (`INVOICE_LINK_SECRET`) inside wa.me messages.
- **Config vs runtime vs secrets:**
  - Brand, contact, WhatsApp number and message texts, navigation and feature flags live in `src/config/*.ts` (`as const satisfies`, validated by `config/schema.ts`). Never hard-code these values in components.
  - Staff-editable overrides (delivery fees, bank details) live in the `site_settings` table, which takes precedence over config.
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
- Headings and product names use a serif (Playfair Display, `font-serif`), as in the design. UI and body text use Inter (`font-sans`). This follows the Figma exports, not spec §7.3 (Poppins/Roboto).
- Theme utilities: `bg-brand-gradient`, `container-page` (1312px content, 20/64px gutters), colors `brand-deep`, `brand-darkest`, `brand-foreground`, `gold`, `whatsapp`, `heading`. Shared bits so far: `components/ui/button.tsx` (variants `gold`, `light`, `whatsapp`, …) and `components/common/section-heading.tsx` (pill label + serif heading).
- Default images in `public/images/`: `banners/home_banner_{desktop,mobile}.png`, `products/product_image.png` and `collections/Bottle.png`. Use these until real photos are added.

## Conventions

- Files are `kebab-case.tsx` and components are `PascalCase`.
- Prices are whole rupees (`integer`), displayed as `Rs 3,490`.
- Phones are normalized to E.164 `+94…`.
- Never log phone numbers, addresses or message bodies.
- Track Order responses return no address, full phone or email, and give one generic "not found" message.
