-- Row Level Security (spec §8.4). Deny by default:
--   * RLS is on for every table, and no table grants anything to anon or
--     authenticated unless listed below.
--   * The browser (anon) can read only active catalog rows, approved reviews,
--     active delivery zones and public settings.
--   * Orders, payments, invoices, the outbox, WhatsApp logs, newsletter and
--     admin users are reachable only by server code using the secret key
--     (service_role, which bypasses RLS).
-- `authenticated` is never used (staff log in through NextAuth), so it gets
-- the same read access as anon and nothing more.

-- Remove Supabase's default broad grants, now and for future objects.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated, public;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated, public;

-- Enable RLS everywhere.
alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.collections enable row level security;
alter table public.product_collections enable row level security;
alter table public.notes enable row level security;
alter table public.product_notes enable row level security;
alter table public.reviews enable row level security;
alter table public.banners enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.site_settings enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.payments enable row level security;
alter table public.invoices enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.whatsapp_messages enable row level security;

-- ---------------------------------------------------------------------------
-- Public catalog (read only)
-- ---------------------------------------------------------------------------

grant select on
  public.products,
  public.product_variants,
  public.product_images,
  public.collections,
  public.product_collections,
  public.notes,
  public.product_notes,
  public.banners,
  public.delivery_zones
to anon, authenticated;

create policy "Active products are public" on public.products
  for select to anon, authenticated
  using (is_active);

create policy "Active variants of active products are public" on public.product_variants
  for select to anon, authenticated
  using (
    is_active
    and exists (select 1 from public.products p where p.id = product_id and p.is_active)
  );

create policy "Images of active products are public" on public.product_images
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.is_active));

create policy "Active collections are public" on public.collections
  for select to anon, authenticated
  using (is_active);

create policy "Links between active products and collections are public" on public.product_collections
  for select to anon, authenticated
  using (
    exists (select 1 from public.products p where p.id = product_id and p.is_active)
    and exists (select 1 from public.collections c where c.id = collection_id and c.is_active)
  );

create policy "Notes are public" on public.notes
  for select to anon, authenticated
  using (true);

create policy "Notes of active products are public" on public.product_notes
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.is_active));

create policy "Live banners are public" on public.banners
  for select to anon, authenticated
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
  );

create policy "Active delivery zones are public" on public.delivery_zones
  for select to anon, authenticated
  using (is_active);

-- Reviews: approved only, and never the order link. Column grants mean
-- queries must list columns (select("*") is refused for anon).
grant select (id, product_id, customer_name, location, rating, title, body, is_verified, created_at)
  on public.reviews to anon, authenticated;

create policy "Approved reviews are public" on public.reviews
  for select to anon, authenticated
  using (status = 'approved');

-- Settings: only rows flagged public.
grant select (key, value) on public.site_settings to anon, authenticated;

create policy "Public settings are readable" on public.site_settings
  for select to anon, authenticated
  using (is_public);

-- Everything else (orders, order_items, order_events, payments, invoices,
-- notification_outbox, whatsapp_messages, newsletter_subscribers,
-- admin_users) has RLS on, no grants and no policies: no access.
