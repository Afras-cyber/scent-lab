-- Storage buckets (spec §8.5). Public buckets are served through the public
-- object URL and need no policies. Private buckets have no policies at all,
-- so only the server (service_role) can read or write them; customers get
-- signed, expiring links.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('products', 'products', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('banners', 'banners', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('payment-slips', 'payment-slips', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('invoices', 'invoices', false, 1048576, array['application/pdf'])
on conflict (id) do nothing;
