-- Scent profile for the product page: note tiers (pyramid) and performance.
-- Anon already has a table-level select grant on products and product_notes,
-- so the new columns are readable under the existing RLS policies.

-- Untiered notes (null) still show as chips, just not in the pyramid.
alter table public.product_notes
  add column tier text check (tier in ('top', 'heart', 'base'));

alter table public.products
  -- "Eau de Parfum", "Attar oil", …
  add column concentration text,
  -- Free text, e.g. "8–12 hours".
  add column longevity text,
  -- Performance levels, 1 (lowest) to 5 (highest); null hides the bar.
  add column projection smallint check (projection between 1 and 5),
  add column sweetness smallint check (sweetness between 1 and 5),
  add column freshness smallint check (freshness between 1 and 5),
  add column seasons text[] not null default '{}'
    check (seasons <@ array['spring', 'summer', 'autumn', 'winter']),
  -- The paragraph under the notes pyramid.
  add column scent_story text;
