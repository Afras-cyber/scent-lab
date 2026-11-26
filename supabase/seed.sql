-- Local development data. Uses the default images in /public/images until
-- real photos are uploaded to the "products" bucket.

-- Delivery zones: all 25 districts. Fees are placeholders for the client to confirm.
insert into public.delivery_zones (district, fee_lkr, estimated_days, sort_order) values
  ('Colombo', 350, '1–2 days', 1),
  ('Gampaha', 400, '1–2 days', 2),
  ('Kalutara', 400, '2–3 days', 3),
  ('Kandy', 450, '2–4 days', 4),
  ('Matale', 450, '2–4 days', 5),
  ('Nuwara Eliya', 450, '2–4 days', 6),
  ('Galle', 450, '2–4 days', 7),
  ('Matara', 450, '2–4 days', 8),
  ('Hambantota', 450, '2–4 days', 9),
  ('Jaffna', 500, '3–5 days', 10),
  ('Kilinochchi', 500, '3–5 days', 11),
  ('Mannar', 500, '3–5 days', 12),
  ('Vavuniya', 500, '3–5 days', 13),
  ('Mullaitivu', 500, '3–5 days', 14),
  ('Batticaloa', 450, '2–4 days', 15),
  ('Ampara', 450, '2–4 days', 16),
  ('Trincomalee', 450, '2–4 days', 17),
  ('Kurunegala', 450, '2–4 days', 18),
  ('Puttalam', 450, '2–4 days', 19),
  ('Anuradhapura', 450, '2–4 days', 20),
  ('Polonnaruwa', 450, '2–4 days', 21),
  ('Badulla', 450, '2–4 days', 22),
  ('Monaragala', 450, '2–4 days', 23),
  ('Ratnapura', 450, '2–4 days', 24),
  ('Kegalle', 450, '2–4 days', 25);

-- Runtime settings (override src/config defaults).
insert into public.site_settings (key, value, is_public) values
  ('free_delivery_threshold_lkr', '5000', true),
  ('bank_transfer', '{"bankName": "", "accountName": "", "accountNumber": "", "branch": ""}', true);

insert into public.collections (slug, name, description, image_path, sort_order) values
  ('oud', 'Oud Collection', 'Deep, smoky and regal — our signature ouds.', '/images/collections/Bottle.png', 1),
  ('attar-oils', 'Attar Oils', 'Alcohol-free, long-lasting concentrated oils.', '/images/collections/Bottle.png', 2),
  ('spray-perfumes', 'Spray Perfumes', 'Arabic-inspired eau de parfum sprays.', '/images/collections/Bottle.png', 3),
  ('musk-amber', 'Musk & Amber', 'Soft, warm and clean everyday scents.', '/images/collections/Bottle.png', 4),
  ('gift-sets', 'Gift Sets', 'Ready-to-gift boxes for every occasion.', '/images/collections/Bottle.png', 5),
  ('discovery-sets', 'Discovery Sets', 'Try several scents before you choose.', '/images/collections/Bottle.png', 6);

insert into public.notes (slug, name) values
  ('oud', 'Oud'), ('amber', 'Amber'), ('musk', 'Musk'), ('rose', 'Rose'), ('saffron', 'Saffron'),
  ('sandalwood', 'Sandalwood'), ('vanilla', 'Vanilla'), ('smoke', 'Smoke'), ('leather', 'Leather'),
  ('woods', 'Woods'), ('citrus', 'Citrus');

-- Products: slug, name, short description, gender, occasions, featured,
-- notes (slugs), collections (slugs), variants [label, sku, price, compare_at, stock].
with data (slug, name, short_description, gender, occasions, is_featured, note_slugs, collection_slugs, variants) as (
  values
    ('oud-royale', 'Oud Royale', 'Smoky oud wrapped in leather and warm amber.', 'unisex',
      array['party', 'wedding', 'date-night'], true, array['oud', 'smoke', 'leather'], array['oud', 'attar-oils'],
      '[["6ml attar", "AYD-OR-06", 1490, null, 40], ["12ml attar", "AYD-OR-12", 2490, 2990, 25]]'::jsonb),
    ('midnight-saffron', 'Midnight Saffron', 'Saffron and rose over a dark oud base.', 'unisex',
      array['party', 'date-night'], true, array['saffron', 'rose', 'oud'], array['oud', 'attar-oils'],
      '[["12ml attar", "AYD-MS-12", 2990, null, 18]]'::jsonb),
    ('white-musk-attar', 'White Musk Attar', 'Clean, soft musk for every day.', 'unisex',
      array['office', 'everyday'], true, array['musk', 'vanilla'], array['musk-amber', 'attar-oils'],
      '[["6ml attar", "AYD-WM-06", 990, null, 60], ["12ml attar", "AYD-WM-12", 1990, null, 50]]'::jsonb),
    ('amber-nights', 'Amber Nights', 'Golden amber, vanilla and soft woods.', 'women',
      array['date-night', 'festive'], true, array['amber', 'vanilla', 'woods'], array['musk-amber', 'attar-oils'],
      '[["12ml attar", "AYD-AN-12", 2490, null, 30]]'::jsonb),
    ('oud-noir-attar', 'Oud Noir Attar', 'Intense black oud for evenings.', 'men',
      array['party', 'wedding'], false, array['oud', 'leather'], array['oud', 'attar-oils'],
      '[["12ml attar", "AYD-ON-12", 3980, null, 12]]'::jsonb),
    ('royal-oud-spray', 'Royal Oud Spray', 'Oud and sandalwood eau de parfum.', 'men',
      array['office', 'wedding'], false, array['oud', 'sandalwood'], array['oud', 'spray-perfumes'],
      '[["50ml spray", "AYD-RS-50", 3290, 3790, 20]]'::jsonb),
    ('oud-rose-attar', 'Oud Rose Attar', 'Rose petals over smooth oud and musk.', 'women',
      array['wedding', 'festive'], false, array['rose', 'oud', 'musk'], array['oud', 'attar-oils'],
      '[["12ml attar", "AYD-RO-12", 2790, null, 0]]'::jsonb),
    ('attar-discovery-set', 'Attar Discovery Set', 'Five 3ml attars to find your signature scent.', 'unisex',
      array['everyday'], false, array['oud', 'musk', 'amber'], array['discovery-sets', 'gift-sets'],
      '[["5 × 3ml", "AYD-DS-05", 4500, null, 15]]'::jsonb)
),
inserted as (
  insert into public.products (slug, name, short_description, description, gender, occasions, is_featured)
  select slug, name, short_description, short_description, gender, occasions, is_featured from data
  returning id, slug
),
variants as (
  insert into public.product_variants (product_id, label, sku, price_lkr, compare_at_lkr, stock, sort_order)
  select i.id, v.value ->> 0, v.value ->> 1, (v.value ->> 2)::integer, (v.value ->> 3)::integer, (v.value ->> 4)::integer,
         v.ordinality::integer
  from data d
  join inserted i using (slug)
  cross join lateral jsonb_array_elements(d.variants) with ordinality as v (value, ordinality)
),
images as (
  insert into public.product_images (product_id, path, alt, width, height)
  select i.id, '/images/products/product_image.png', d.name || ' bottle', 280, 232
  from data d join inserted i using (slug)
),
notes_link as (
  insert into public.product_notes (product_id, note_id, sort_order)
  select i.id, n.id, ns.ordinality::integer
  from data d
  join inserted i using (slug)
  cross join lateral unnest(d.note_slugs) with ordinality as ns (slug, ordinality)
  join public.notes n on n.slug = ns.slug
)
insert into public.product_collections (product_id, collection_id)
select i.id, c.id
from data d
join inserted i using (slug)
cross join lateral unnest(d.collection_slugs) as cs (slug)
join public.collections c on c.slug = cs.slug;

insert into public.reviews (product_id, customer_name, location, rating, body, is_verified, status, approved_at)
select p.id, r.customer_name, r.location, r.rating, r.body, true, 'approved', now()
from (values
  ('oud-royale', 'Nimesh P.', 'Colombo', 5, 'Oud Royale lasts all day. Smells far more expensive than the price!'),
  ('white-musk-attar', 'Fathima R.', 'Kandy', 5, 'The white musk attar is pure and gentle. Already ordered again.'),
  ('amber-nights', 'Ruwani S.', 'Galle', 4, 'Fast islandwide delivery and COD made ordering effortless.')
) as r (slug, customer_name, location, rating, body)
join public.products p on p.slug = r.slug;

insert into public.banners (placement, title, subtitle, cta_label, cta_href, image_desktop_path, image_mobile_path, alt, sort_order)
values ('hero', '11.11 Scent Rush', 'Flash deals · Discount · Free perfume', 'Shop now', '/shop?sale=true',
        '/images/banners/home_banner_desktop.png', '/images/banners/home_banner_mobile.png',
        '11.11 Scent Rush sale banner', 1);
