-- Checkout and payment transactions (spec §8.3). Both functions are
-- security definer with an empty search_path, and only service_role may
-- execute them. Server code calls them after validating input with Zod;
-- the checks here are the last line of defence and never trust the client.
--
-- Errors are raised with errcode P0001 and a stable code in the message:
--   INVALID_INPUT, VARIANT_UNAVAILABLE, INSUFFICIENT_STOCK, UNKNOWN_DISTRICT,
--   ORDER_NOT_FOUND, ORDER_CANCELLED

-- ---------------------------------------------------------------------------
-- create_order
-- ---------------------------------------------------------------------------
-- p_items: [{"variant_id": "<uuid>", "quantity": 2}, ...]
-- Returns: {"order_id", "code", "subtotal_lkr", "delivery_fee_lkr",
--           "total_lkr", "created"}  (created = false on an idempotent replay)

create function public.create_order(
  p_idempotency_key text,
  p_customer_name text,
  p_phone_e164 text,
  p_address_line text,
  p_city text,
  p_district text,
  p_payment_method public.payment_method,
  p_items jsonb,
  p_email text default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  max_lines constant integer := 30; -- commerceConfig.maxLinesPerOrder
  max_qty constant integer := 20;   -- commerceConfig.maxQtyPerLine
  existing public.orders;
  new_order public.orders;
  v_ids uuid[];
  v_qtys integer[];
  bad_variant uuid;
  v_subtotal integer;
  v_fee integer;
  v_threshold integer;
begin
  -- 0. Input shape
  if p_idempotency_key is null or char_length(p_idempotency_key) not between 16 and 100
     or coalesce(char_length(trim(p_customer_name)), 0) not between 2 and 100
     or p_phone_e164 is null or p_phone_e164 !~ '^\+94\d{9}$'
     or (p_email is not null and char_length(p_email) > 254)
     or coalesce(char_length(trim(p_address_line)), 0) not between 5 and 300
     or coalesce(char_length(trim(p_city)), 0) not between 2 and 100
     or (p_notes is not null and char_length(p_notes) > 500)
     or p_payment_method is null
     or p_items is null or jsonb_typeof(p_items) <> 'array'
  then
    raise exception 'INVALID_INPUT';
  end if;

  -- 1. Idempotency: the same key always returns the same order. The advisory
  -- lock serialises concurrent retries of one key.
  perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key, 0));

  select * into existing from public.orders where idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object(
      'order_id', existing.id,
      'code', existing.code,
      'subtotal_lkr', existing.subtotal_lkr,
      'delivery_fee_lkr', existing.delivery_fee_lkr,
      'total_lkr', existing.total_lkr,
      'created', false
    );
  end if;

  -- Parse lines into parallel arrays (sorted by id), merging duplicates.
  begin
    select coalesce(array_agg(variant_id order by variant_id), '{}'),
           coalesce(array_agg(quantity order by variant_id), '{}')
    into v_ids, v_qtys
    from (
      select (item ->> 'variant_id')::uuid as variant_id,
             sum((item ->> 'quantity')::integer)::integer as quantity
      from jsonb_array_elements(p_items) as item
      group by 1
    ) merged;
  exception
    when invalid_text_representation or numeric_value_out_of_range or invalid_parameter_value then
      raise exception 'INVALID_INPUT';
  end;

  if cardinality(v_ids) = 0 or cardinality(v_ids) > max_lines
     or exists (select 1 from unnest(v_ids, v_qtys) as l (id, qty)
                where l.id is null or l.qty is null or l.qty not between 1 and max_qty)
  then
    raise exception 'INVALID_INPUT';
  end if;

  -- 2 + 3. Lock the variant rows (in id order, to avoid deadlocks), then check them.
  perform 1 from public.product_variants where id = any (v_ids) order by id for update;

  select l.id into bad_variant
  from unnest(v_ids) as l (id)
  left join public.product_variants v on v.id = l.id
  left join public.products p on p.id = v.product_id
  where v.id is null or not v.is_active or not p.is_active
  limit 1;
  if found then
    raise exception 'VARIANT_UNAVAILABLE' using detail = bad_variant::text;
  end if;

  select l.id into bad_variant
  from unnest(v_ids, v_qtys) as l (id, qty)
  join public.product_variants v on v.id = l.id
  where v.stock < l.qty
  limit 1;
  if found then
    raise exception 'INSUFFICIENT_STOCK' using detail = bad_variant::text;
  end if;

  -- 4. Subtotal from database prices only.
  select sum(v.price_lkr * l.qty)::integer into v_subtotal
  from unnest(v_ids, v_qtys) as l (id, qty)
  join public.product_variants v on v.id = l.id;

  -- 5. Delivery fee for the district, free over the threshold.
  select fee_lkr into v_fee from public.delivery_zones where district = p_district and is_active;
  if not found then
    raise exception 'UNKNOWN_DISTRICT';
  end if;

  select (value #>> '{}')::integer into v_threshold
  from public.site_settings where key = 'free_delivery_threshold_lkr';
  if v_threshold is not null and v_subtotal >= v_threshold then
    v_fee := 0;
  end if;

  -- 6. Order, item snapshots and first timeline event.
  insert into public.orders (
    customer_name, phone_e164, email, address_line, city, district, notes,
    payment_method, payment_status, subtotal_lkr, delivery_fee_lkr, total_lkr, idempotency_key
  ) values (
    trim(p_customer_name), p_phone_e164, nullif(lower(trim(p_email)), ''), trim(p_address_line), trim(p_city),
    p_district, nullif(trim(p_notes), ''),
    p_payment_method,
    case when p_payment_method = 'bank_transfer' then 'awaiting_verification' else 'unpaid' end::public.payment_status,
    v_subtotal, v_fee, v_subtotal + v_fee, p_idempotency_key
  )
  returning * into new_order;

  insert into public.order_items (order_id, variant_id, product_name, variant_label, sku, unit_price_lkr, quantity)
  select new_order.id, v.id, p.name, v.label, v.sku, v.price_lkr, l.qty
  from unnest(v_ids, v_qtys) as l (id, qty)
  join public.product_variants v on v.id = l.id
  join public.products p on p.id = v.product_id
  order by p.name, v.label;

  insert into public.order_events (order_id, status, note)
  values (new_order.id, 'pending', 'Order placed');

  -- 7. Reduce stock (rows are already locked).
  update public.product_variants v
  set stock = v.stock - l.qty
  from unnest(v_ids, v_qtys) as l (id, qty)
  where v.id = l.id;

  -- 8. Result
  return jsonb_build_object(
    'order_id', new_order.id,
    'code', new_order.code,
    'subtotal_lkr', new_order.subtotal_lkr,
    'delivery_fee_lkr', new_order.delivery_fee_lkr,
    'total_lkr', new_order.total_lkr,
    'created', true
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- record_payment
-- ---------------------------------------------------------------------------
-- Called by an admin server action after requireAdmin(). Inserts the payment,
-- and marks the order paid once payments cover the total. Returns {"payment_id", "payment_status", "paid_lkr"}.

create function public.record_payment(
  p_order_id uuid,
  p_amount_lkr integer,
  p_method public.payment_method,
  p_recorded_by uuid,
  p_reference text default null,
  p_slip_path text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.orders;
  v_payment_id uuid;
  v_paid integer;
  v_status public.payment_status;
begin
  if p_order_id is null or p_amount_lkr is null or p_amount_lkr <= 0 or p_method is null
     or (p_reference is not null and char_length(p_reference) > 100)
  then
    raise exception 'INVALID_INPUT';
  end if;

  select * into target from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;
  if target.status = 'cancelled' then
    raise exception 'ORDER_CANCELLED';
  end if;

  insert into public.payments (order_id, method, amount_lkr, reference, slip_path, recorded_by)
  values (p_order_id, p_method, p_amount_lkr, nullif(trim(p_reference), ''), p_slip_path, p_recorded_by)
  returning id into v_payment_id;

  select coalesce(sum(amount_lkr), 0)::integer into v_paid from public.payments where order_id = p_order_id;

  v_status := case when v_paid >= target.total_lkr then 'paid' else target.payment_status end;

  if v_status is distinct from target.payment_status then
    update public.orders set payment_status = v_status where id = p_order_id;
  end if;

  return jsonb_build_object('payment_id', v_payment_id, 'payment_status', v_status, 'paid_lkr', v_paid);
end;
$$;

-- Only the server (service_role) may call these.
revoke all on function public.create_order(text, text, text, text, text, text, public.payment_method, jsonb, text, text)
  from public, anon, authenticated;
revoke all on function public.record_payment(uuid, integer, public.payment_method, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.create_order(text, text, text, text, text, text, public.payment_method, jsonb, text, text)
  to service_role;
grant execute on function public.record_payment(uuid, integer, public.payment_method, uuid, text, text)
  to service_role;
