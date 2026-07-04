begin;

-- =========================================================
-- 013 BUSINESS MEDIA STORAGE
--
-- Javni bucket za:
-- - logo salona;
-- - hero/cover sliku;
-- - fotografije zaposlenih.
--
-- Upload i brisanje rade isključivo server-side kroz
-- service_role klijent. Browser dobija samo javne URL-ove.
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'business-media',
  'business-media',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif'
  ]::text[]
)
on conflict (id)
do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists
  "Public can read business media"
on storage.objects;

create policy
  "Public can read business media"
on storage.objects
for select
to public
using (
  bucket_id = 'business-media'
);

commit;
