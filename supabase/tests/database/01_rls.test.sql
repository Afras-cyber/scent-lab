-- RLS: the browser (anon) can read the active catalog and nothing else.
begin;
select plan(22);

select is(
  (select count(*) from pg_tables where schemaname = 'public' and not rowsecurity),
  0::bigint,
  'RLS is enabled on every public table'
);

-- Fixtures the anon role must not see.
insert into public.products (slug, name, is_active) values ('hidden-product', 'Hidden', false);
insert into public.site_settings (key, value, is_public) values ('private_test', '1', false);
insert into public.reviews (product_id, customer_name, rating, body, status)
select id, 'Pending Person', 3, 'Not yet moderated', 'pending' from public.products where slug = 'oud-royale';

set local role anon;

-- Private tables: no access at all.
select throws_ok('select 1 from public.orders', '42501', null, 'anon cannot read orders');
select throws_ok('select 1 from public.order_items', '42501', null, 'anon cannot read order_items');
select throws_ok('select 1 from public.order_events', '42501', null, 'anon cannot read order_events');
select throws_ok('select 1 from public.payments', '42501', null, 'anon cannot read payments');
select throws_ok('select 1 from public.invoices', '42501', null, 'anon cannot read invoices');
select throws_ok('select 1 from public.newsletter_subscribers', '42501', null, 'anon cannot read subscribers');
select throws_ok('select 1 from public.admin_users', '42501', null, 'anon cannot read admin users');
select throws_ok(
  $$insert into public.newsletter_subscribers (email) values ('a@b.co')$$,
  '42501', null, 'anon cannot insert subscribers directly'
);

-- Catalog: read only, active rows only.
select ok((select count(*) from public.products) > 0, 'anon can read active products');
select is((select count(*) from public.products where not is_active), 0::bigint, 'inactive products are hidden');
select ok((select count(*) from public.product_variants) > 0, 'anon can read variants');
select ok((select count(*) from public.delivery_zones) = 25, 'anon can read delivery zones');
select throws_ok(
  $$update public.products set name = 'x' where slug = 'oud-royale'$$,
  '42501', null, 'anon cannot update products'
);
select throws_ok(
  $$insert into public.products (slug, name) values ('evil', 'Evil')$$,
  '42501', null, 'anon cannot insert products'
);

-- Reviews: approved only, and the order link is not exposed.
select is(
  (select count(*) from public.reviews where customer_name = 'Pending Person'),
  0::bigint,
  'pending reviews are hidden'
);
select ok((select count(*) from public.reviews) > 0, 'approved reviews are visible');
select throws_ok('select order_id from public.reviews', '42501', null, 'review order_id column is not exposed');

-- Settings: public rows only.
select is(
  (select count(*) from public.site_settings where key = 'private_test'),
  0::bigint,
  'private settings are hidden'
);
select is(
  (select value from public.site_settings where key = 'free_delivery_threshold_lkr'),
  '5000'::jsonb,
  'public settings are readable'
);

-- Server-only functions.
select throws_ok(
  $$select public.create_order('k', 'n', '+94771234567', 'a', 'c', 'Colombo', 'cod', '[]')$$,
  '42501', null, 'anon cannot call create_order'
);
select throws_ok(
  $$select public.record_payment(gen_random_uuid(), 100, 'cod', null)$$,
  '42501', null, 'anon cannot call record_payment'
);

reset role;
select * from finish();
rollback;
