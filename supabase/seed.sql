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
  ('woods', 'Woods'), ('citrus', 'Citrus'), ('jasmine', 'Jasmine'), ('cedar', 'Cedar'),
  ('iris', 'Iris'), ('honey', 'Honey');

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
      '[["5 × 3ml", "AYD-DS-05", 4500, null, 15]]'::jsonb),
    -- Extra catalog for the shop page (filters, sizes, sale, sold out, pagination).
    ('sandal-silk', 'Sandal Silk', 'Creamy sandalwood with vanilla and soft musk.', 'unisex',
      array['everyday', 'office'], false, array['sandalwood', 'vanilla', 'musk'], array['attar-oils'],
      '[["6ml attar", "AYD-SS-06", 1590, 1890, 35], ["12ml attar", "AYD-SS-12", 2790, null, 20]]'::jsonb),
    ('saffron-noir', 'Saffron Noir', 'Dark saffron, amber and smoky woods.', 'men',
      array['party', 'date-night'], false, array['saffron', 'amber', 'woods'], array['attar-oils', 'oud'],
      '[["12ml attar", "AYD-SN-12", 2190, 2590, 22]]'::jsonb),
    ('velvet-musk', 'Velvet Musk', 'Powdery musk with iris and a clean finish.', 'women',
      array['office', 'everyday'], false, array['musk', 'iris'], array['musk-amber', 'attar-oils'],
      '[["6ml attar", "AYD-VM-06", 1290, 1590, 40]]'::jsonb),
    ('golden-amber', 'Golden Amber', 'Honeyed amber over warm oud.', 'unisex',
      array['festive', 'wedding'], false, array['amber', 'honey', 'oud'], array['musk-amber', 'spray-perfumes'],
      '[["50ml spray", "AYD-GA-50", 2890, null, 0]]'::jsonb),
    ('arabian-rose', 'Arabian Rose', 'Taif rose with saffron and oud.', 'women',
      array['wedding', 'festive'], true, array['rose', 'saffron', 'oud'], array['oud', 'attar-oils'],
      '[["12ml attar", "AYD-AR-12", 3290, 3790, 15]]'::jsonb),
    ('cedar-mist', 'Cedar Mist', 'Fresh citrus over dry cedar.', 'men',
      array['office', 'everyday'], false, array['citrus', 'cedar'], array['spray-perfumes'],
      '[["50ml spray", "AYD-CM-50", 2490, null, 30], ["100ml spray", "AYD-CM-100", 3990, 4490, 12]]'::jsonb),
    ('jasmine-night', 'Jasmine Night', 'Night-blooming jasmine with soft vanilla.', 'women',
      array['date-night', 'party'], false, array['jasmine', 'vanilla'], array['attar-oils'],
      '[["3ml attar", "AYD-JN-03", 690, null, 50], ["12ml attar", "AYD-JN-12", 1990, null, 25]]'::jsonb),
    ('royal-musk', 'Royal Musk', 'White musk lifted with rose.', 'unisex',
      array['everyday', 'office'], false, array['musk', 'rose'], array['musk-amber', 'attar-oils'],
      '[["6ml attar", "AYD-RM-06", 890, null, 70], ["12ml attar", "AYD-RM-12", 1590, null, 45]]'::jsonb),
    ('oud-al-layl', 'Oud Al Layl', 'Deep night oud with leather and smoke.', 'men',
      array['wedding', 'party'], true, array['oud', 'leather', 'smoke'], array['oud', 'spray-perfumes'],
      '[["100ml spray", "AYD-OL-100", 6490, 7490, 8]]'::jsonb),
    ('amber-oud-gold', 'Amber Oud Gold', 'Rich amber and oud in a gold-capped spray.', 'unisex',
      array['festive', 'wedding'], false, array['amber', 'oud', 'vanilla'], array['oud', 'spray-perfumes'],
      '[["50ml spray", "AYD-AG-50", 4290, null, 14], ["100ml spray", "AYD-AG-100", 6990, null, 6]]'::jsonb),
    ('white-oud', 'White Oud', 'Soft, clean oud with musk and woods.', 'unisex',
      array['office', 'everyday'], false, array['oud', 'musk', 'woods'], array['oud', 'attar-oils'],
      '[["12ml attar", "AYD-WO-12", 2690, null, 18]]'::jsonb),
    ('musk-tahara', 'Musk Tahara', 'Pure, sweet white musk.', 'women',
      array['everyday'], false, array['musk', 'vanilla'], array['musk-amber', 'attar-oils'],
      '[["3ml attar", "AYD-MT-03", 550, null, 80], ["6ml attar", "AYD-MT-06", 950, null, 60]]'::jsonb),
    ('citrus-oud', 'Citrus Oud', 'Bright bergamot over smooth oud.', 'men',
      array['office', 'everyday'], false, array['citrus', 'oud'], array['oud', 'spray-perfumes'],
      '[["50ml spray", "AYD-CO-50", 3190, 3590, 16]]'::jsonb),
    ('rose-vanilla', 'Rose Vanilla', 'Sweet rose wrapped in vanilla.', 'women',
      array['date-night', 'everyday'], false, array['rose', 'vanilla'], array['spray-perfumes'],
      '[["50ml spray", "AYD-RV-50", 2790, null, 20]]'::jsonb),
    ('leather-smoke', 'Leather & Smoke', 'Smoky birch leather with woods.', 'men',
      array['party'], false, array['leather', 'smoke', 'woods'], array['spray-perfumes'],
      '[["100ml spray", "AYD-LS-100", 4590, 5290, 0]]'::jsonb),
    ('honey-oud', 'Honey Oud', 'Golden honey drizzled over oud.', 'unisex',
      array['festive', 'date-night'], false, array['honey', 'oud', 'amber'], array['oud', 'attar-oils'],
      '[["6ml attar", "AYD-HO-06", 1890, null, 24], ["12ml attar", "AYD-HO-12", 3390, null, 10]]'::jsonb),
    ('iris-powder', 'Iris Powder', 'Elegant powdery iris and musk.', 'women',
      array['office', 'wedding'], false, array['iris', 'musk'], array['spray-perfumes'],
      '[["50ml spray", "AYD-IP-50", 3490, null, 11]]'::jsonb),
    ('sandal-cedar', 'Sandal Cedar', 'Dry cedar and creamy sandalwood.', 'men',
      array['office', 'everyday'], false, array['sandalwood', 'cedar', 'woods'], array['attar-oils'],
      '[["12ml attar", "AYD-SC-12", 2290, null, 28]]'::jsonb),
    ('saffron-rose', 'Saffron Rose', 'Saffron threads on rose petals.', 'unisex',
      array['wedding', 'festive'], false, array['saffron', 'rose'], array['attar-oils'],
      '[["3ml attar", "AYD-SR-03", 790, null, 45], ["12ml attar", "AYD-SR-12", 2390, 2790, 19]]'::jsonb),
    ('amber-musk', 'Amber Musk', 'Warm amber softened with musk.', 'unisex',
      array['everyday', 'date-night'], false, array['amber', 'musk'], array['musk-amber', 'attar-oils'],
      '[["6ml attar", "AYD-AM-06", 1190, null, 55]]'::jsonb),
    ('oud-imperial', 'Oud Imperial', 'Our richest aged oud blend.', 'men',
      array['wedding', 'festive'], true, array['oud', 'saffron', 'leather'], array['oud', 'attar-oils'],
      '[["12ml attar", "AYD-OI-12", 7490, 8490, 5]]'::jsonb),
    ('vanilla-woods', 'Vanilla Woods', 'Smooth vanilla over cedar and sandalwood.', 'unisex',
      array['everyday', 'date-night'], false, array['vanilla', 'woods', 'cedar'], array['spray-perfumes'],
      '[["50ml spray", "AYD-VW-50", 2590, null, 0]]'::jsonb),
    ('jasmine-oud', 'Jasmine Oud', 'Jasmine petals over dark oud.', 'women',
      array['party', 'wedding'], false, array['jasmine', 'oud'], array['oud', 'attar-oils'],
      '[["12ml attar", "AYD-JO-12", 2990, null, 13]]'::jsonb),
    ('fresh-citrus', 'Fresh Citrus', 'Zesty citrus for hot, humid days.', 'unisex',
      array['office', 'everyday'], false, array['citrus', 'musk'], array['spray-perfumes'],
      '[["50ml spray", "AYD-FC-50", 1990, 2290, 40], ["100ml spray", "AYD-FC-100", 3290, null, 22]]'::jsonb),
    ('oud-gift-box', 'Oud Gift Box', 'Two 12ml oud attars in a gift box.', 'men',
      array['wedding', 'festive'], false, array['oud', 'leather'], array['gift-sets', 'oud'],
      '[["2 × 12ml", "AYD-GB-OUD", 5490, 5990, 10]]'::jsonb),
    ('rose-gift-box', 'Rose Gift Box', 'Rose attar and spray, gift wrapped.', 'women',
      array['wedding', 'festive'], false, array['rose', 'vanilla'], array['gift-sets'],
      '[["12ml + 50ml", "AYD-GB-ROSE", 5990, null, 7]]'::jsonb),
    ('musk-trio', 'Musk Trio', 'Three 6ml musk attars.', 'unisex',
      array['everyday', 'festive'], false, array['musk', 'amber', 'vanilla'], array['gift-sets', 'musk-amber'],
      '[["3 × 6ml", "AYD-GB-MUSK", 3490, 3990, 12]]'::jsonb),
    ('royal-collection', 'Royal Collection Set', 'Four signature sprays, our luxury gift.', 'unisex',
      array['wedding', 'festive'], false, array['oud', 'amber', 'rose'], array['gift-sets', 'spray-perfumes'],
      '[["4 × 50ml", "AYD-GB-ROYAL", 7990, 8990, 4]]'::jsonb),
    ('amber-saffron', 'Amber Saffron', 'Saffron spice on golden amber.', 'men',
      array['party', 'festive'], false, array['amber', 'saffron'], array['musk-amber', 'attar-oils'],
      '[["12ml attar", "AYD-AS-12", 2590, null, 17]]'::jsonb),
    ('pink-musk', 'Pink Musk', 'Sweet, fruity musk.', 'women',
      array['everyday', 'party'], false, array['musk', 'rose'], array['musk-amber', 'spray-perfumes'],
      '[["50ml spray", "AYD-PM-50", 1790, null, 26]]'::jsonb)
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
