-- create_order and record_payment run as the server (service_role).
begin;
select plan(18);

set local role service_role;

create temporary table t_variants as
select v.id, v.price_lkr, v.stock, p.slug
from public.product_variants v
join public.products p on p.id = v.product_id
where v.sku in ('AYD-OR-12', 'AYD-WM-06', 'AYD-RO-12', 'AYD-DS-05');

create temporary table t_result (name text primary key, body jsonb);

-- Happy path: 2 × Oud Royale 12ml (2,490) + 1 × White Musk 6ml (990), Kandy (fee 450).
insert into t_result
select 'first', public.create_order(
  p_idempotency_key => 'test-key-0000000001',
  p_customer_name => 'Test Customer',
  p_phone_e164 => '+94771234567',
  p_address_line => '12 Temple Road',
  p_city => 'Kandy',
  p_district => 'Kandy',
  p_payment_method => 'cod',
  p_items => jsonb_build_array(
    jsonb_build_object('variant_id', (select id from t_variants where slug = 'oud-royale'), 'quantity', 1),
    jsonb_build_object('variant_id', (select id from t_variants where slug = 'white-musk-attar'), 'quantity', 1),
    jsonb_build_object('variant_id', (select id from t_variants where slug = 'oud-royale'), 'quantity', 1)
  )
);

select is((select (body ->> 'subtotal_lkr')::int from t_result where name = 'first'), 2 * 2490 + 990, 'subtotal uses database prices');
select is((select (body ->> 'delivery_fee_lkr')::int from t_result where name = 'first'), 0, 'free delivery at or over the threshold');
select is((select (body ->> 'total_lkr')::int from t_result where name = 'first'), 5970, 'total = subtotal + fee');
select ok((select body ->> 'code' from t_result where name = 'first') ~ '^AYD-\d+$', 'order code looks like AYD-10001');
select is((select (body ->> 'created')::boolean from t_result where name = 'first'), true, 'first call creates the order');

select is(
  (select count(*) from public.order_items where order_id = (select (body ->> 'order_id')::uuid from t_result where name = 'first')),
  2::bigint,
  'duplicate variant lines are merged'
);
select is(
  (select stock from public.product_variants where sku = 'AYD-OR-12'),
  (select stock - 2 from t_variants where slug = 'oud-royale'),
  'stock is reduced'
);
select is(
  (select status::text from public.order_events where order_id = (select (body ->> 'order_id')::uuid from t_result where name = 'first')),
  'pending',
  'first timeline event is pending'
);

-- Idempotent replay returns the same order without creating another.
insert into t_result
select 'replay', public.create_order(
  p_idempotency_key => 'test-key-0000000001',
  p_customer_name => 'Test Customer',
  p_phone_e164 => '+94771234567',
  p_address_line => '12 Temple Road',
  p_city => 'Kandy',
  p_district => 'Kandy',
  p_payment_method => 'cod',
  p_items => jsonb_build_array(jsonb_build_object('variant_id', (select id from t_variants where slug = 'oud-royale'), 'quantity', 1))
);
select is((select body ->> 'code' from t_result where name = 'replay'), (select body ->> 'code' from t_result where name = 'first'), 'replay returns the same order code');
select is((select (body ->> 'created')::boolean from t_result where name = 'replay'), false, 'replay reports created = false');

-- Below the threshold the district fee applies.
insert into t_result
select 'small', public.create_order(
  p_idempotency_key => 'test-key-0000000002',
  p_customer_name => 'Small Order',
  p_phone_e164 => '+94771234568',
  p_address_line => '1 Galle Road',
  p_city => 'Colombo 03',
  p_district => 'Colombo',
  p_payment_method => 'bank_transfer',
  p_items => jsonb_build_array(jsonb_build_object('variant_id', (select id from t_variants where slug = 'white-musk-attar'), 'quantity', 1))
);
select is((select (body ->> 'delivery_fee_lkr')::int from t_result where name = 'small'), 350, 'Colombo fee applies under the threshold');
select is(
  (select payment_status::text from public.orders where id = (select (body ->> 'order_id')::uuid from t_result where name = 'small')),
  'awaiting_verification',
  'bank transfer orders await verification'
);

-- Rejections.
select throws_ok(
  format(
    $$select public.create_order('test-key-0000000003', 'No Stock', '+94771234569', '1 Main Street', 'Galle', 'Galle', 'cod', '[{"variant_id": "%s", "quantity": 1}]')$$,
    (select id from t_variants where slug = 'oud-rose-attar')
  ),
  'P0001', 'INSUFFICIENT_STOCK', 'out-of-stock variant is rejected'
);
select throws_ok(
  format(
    $$select public.create_order('test-key-0000000004', 'Far Away', '+94771234569', '1 Main Street', 'Atlantis', 'Atlantis', 'cod', '[{"variant_id": "%s", "quantity": 1}]')$$,
    (select id from t_variants where slug = 'white-musk-attar')
  ),
  'P0001', 'UNKNOWN_DISTRICT', 'unknown district is rejected'
);
select throws_ok(
  $$select public.create_order('test-key-0000000005', 'Bad Input', '+94771234569', '1 Main Street', 'Galle', 'Galle', 'cod', '[{"variant_id": "not-a-uuid", "quantity": 1}]')$$,
  'P0001', 'INVALID_INPUT', 'malformed variant id is rejected'
);
select throws_ok(
  format(
    $$select public.create_order('test-key-0000000006', 'Too Many', '+94771234569', '1 Main Street', 'Galle', 'Galle', 'cod', '[{"variant_id": "%s", "quantity": 21}]')$$,
    (select id from t_variants where slug = 'white-musk-attar')
  ),
  'P0001', 'INVALID_INPUT', 'quantity over the per-line limit is rejected'
);

-- record_payment: full payment marks the order paid.
insert into t_result
select 'payment', public.record_payment(
  p_order_id => (select (body ->> 'order_id')::uuid from t_result where name = 'first'),
  p_amount_lkr => 5970,
  p_method => 'cod',
  p_recorded_by => null
);
select is((select body ->> 'payment_status' from t_result where name = 'payment'), 'paid', 'full payment marks the order paid');
select is((select (body ->> 'paid_lkr')::int from t_result where name = 'payment'), 5970, 'paid amount is summed');

reset role;
select * from finish();
rollback;
