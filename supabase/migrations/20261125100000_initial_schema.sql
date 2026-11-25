-- AYAD initial schema (spec §8). Prices are whole rupees (integer).
-- RLS, grants and policies live in the next migration.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type public.order_status as enum ('pending', 'confirmed', 'packed', 'dispatched', 'delivered', 'cancelled', 'returned');
create type public.payment_method as enum ('cod', 'bank_transfer');
create type public.payment_status as enum ('unpaid', 'awaiting_verification', 'paid', 'refunded');
create type public.review_status as enum ('pending', 'approved', 'rejected');
create type public.admin_role as enum ('admin', 'staff');

-- Order codes look like AYD-10001. The prefix mirrors commerceConfig.orderCodePrefix.
create sequence public.order_code_seq start 10001;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Staff
-- ---------------------------------------------------------------------------

create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  password_hash text not null,
  role public.admin_role not null default 'staff',
  is_active boolean not null default true,
  failed_login_count integer not null default 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_users_email_lowercase check (email = lower(email))
);
create unique index admin_users_email_key on public.admin_users (email);
create trigger admin_users_updated_at before update on public.admin_users
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  short_description text,
  description text,
  gender text check (gender in ('men', 'women', 'unisex')),
  occasions text[] not null default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  rating_avg numeric(2, 1) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_active_featured_idx on public.products (is_active, is_featured);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label text not null,
  sku text unique,
  price_lkr integer not null check (price_lkr >= 0),
  compare_at_lkr integer check (compare_at_lkr is null or compare_at_lkr >= price_lkr),
  stock integer not null default 0 check (stock >= 0),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index product_variants_product_idx on public.product_variants (product_id, sort_order);
create trigger product_variants_updated_at before update on public.product_variants
  for each row execute function public.set_updated_at();

-- `path` starting with "/" is a file in /public (default images); anything
-- else is an object path in the public "products" storage bucket.
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  path text not null,
  alt text not null,
  width integer check (width > 0),
  height integer check (height > 0),
  sort_order integer not null default 0
);
create index product_images_product_idx on public.product_images (product_id, sort_order);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text,
  image_path text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.product_collections (
  product_id uuid not null references public.products (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, product_id)
);
create index product_collections_product_idx on public.product_collections (product_id);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null
);

create table public.product_notes (
  product_id uuid not null references public.products (id) on delete cascade,
  note_id uuid not null references public.notes (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (product_id, note_id)
);
create index product_notes_note_idx on public.product_notes (note_id);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  order_id uuid, -- FK added after orders exists
  customer_name text not null check (char_length(customer_name) between 1 and 80),
  location text check (char_length(location) <= 80),
  rating smallint not null check (rating between 1 and 5),
  title text check (char_length(title) <= 120),
  body text not null check (char_length(body) between 1 and 2000),
  is_verified boolean not null default false,
  status public.review_status not null default 'pending',
  approved_at timestamptz,
  created_at timestamptz not null default now()
);
create index reviews_product_status_idx on public.reviews (product_id, status, created_at desc);

-- Keeps products.rating_avg / rating_count in sync with approved reviews.
create function public.refresh_product_rating()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target uuid;
begin
  for target in
    select distinct pid from (values (case when tg_op <> 'INSERT' then old.product_id end),
                                     (case when tg_op <> 'DELETE' then new.product_id end)) as t (pid)
    where pid is not null
  loop
    update public.products p
    set rating_avg = coalesce(s.avg, 0),
        rating_count = coalesce(s.cnt, 0)
    from (
      select round(avg(r.rating)::numeric, 1) as avg, count(*)::integer as cnt
      from public.reviews r
      where r.product_id = target and r.status = 'approved'
    ) s
    where p.id = target;
  end loop;
  return null;
end;
$$;
create trigger reviews_refresh_rating after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();

-- ---------------------------------------------------------------------------
-- Content and settings
-- ---------------------------------------------------------------------------

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  placement text not null check (placement in ('hero', 'promo')),
  title text not null,
  subtitle text,
  cta_label text,
  cta_href text check (cta_href is null or cta_href ~ '^/'),
  image_desktop_path text not null,
  image_mobile_path text,
  alt text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  district text not null unique,
  fee_lkr integer not null check (fee_lkr >= 0),
  estimated_days text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

-- Runtime overrides edited in admin. Rows with is_public = true are readable
-- by the browser (for example the free-delivery threshold, bank details).
create table public.site_settings (
  key text primary key check (key ~ '^[a-z0-9_]+$'),
  value jsonb not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_users (id) on delete set null
);
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and char_length(email) <= 254),
  source text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('AYD-' || nextval('public.order_code_seq')),
  customer_name text not null,
  phone_e164 text not null check (phone_e164 ~ '^\+94\d{9}$'),
  email text,
  address_line text not null,
  city text not null,
  district text not null,
  notes text,
  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'unpaid',
  status public.order_status not null default 'pending',
  subtotal_lkr integer not null check (subtotal_lkr >= 0),
  delivery_fee_lkr integer not null check (delivery_fee_lkr >= 0),
  total_lkr integer not null check (total_lkr = subtotal_lkr + delivery_fee_lkr),
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_phone_idx on public.orders (phone_e164);
create index orders_status_created_idx on public.orders (status, created_at desc);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.reviews
  add constraint reviews_order_id_fkey foreign key (order_id) references public.orders (id) on delete set null;

-- Snapshot of what was bought, at the price paid.
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  variant_label text not null,
  sku text,
  unit_price_lkr integer not null check (unit_price_lkr >= 0),
  quantity integer not null check (quantity between 1 and 20),
  line_total_lkr integer generated always as (unit_price_lkr * quantity) stored
);
create index order_items_order_idx on public.order_items (order_id);

-- Status history for the Track Order timeline.
create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status public.order_status not null,
  note text,
  created_by uuid references public.admin_users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index order_events_order_idx on public.order_events (order_id, created_at);

-- ---------------------------------------------------------------------------
-- Payments and invoices
-- ---------------------------------------------------------------------------

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  method public.payment_method not null,
  amount_lkr integer not null check (amount_lkr > 0),
  reference text,
  slip_path text, -- object path in the private "payment-slips" bucket
  received_at timestamptz not null default now(),
  recorded_by uuid references public.admin_users (id) on delete set null
);
create index payments_order_idx on public.payments (order_id);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  kind text not null check (kind in ('invoice', 'receipt')),
  number text not null unique, -- INV-10482 / RCT-10482
  pdf_path text not null, -- object path in the private "invoices" bucket
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (order_id, kind)
);
