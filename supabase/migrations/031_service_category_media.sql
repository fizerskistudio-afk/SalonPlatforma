begin;

alter table public.service_categories
  add column if not exists image_url text,
  add column if not exists image_position text not null default 'center center';

comment on column public.service_categories.image_url is
  'Optional public image URL used as category-level visual media.';
comment on column public.service_categories.image_position is
  'CSS object-position used to crop the category image.';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'service_categories_image_url_length_check'
      and conrelid = 'public.service_categories'::regclass
  ) then
    alter table public.service_categories
      add constraint service_categories_image_url_length_check
      check (image_url is null or char_length(image_url) <= 2048);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'service_categories_image_url_protocol_check'
      and conrelid = 'public.service_categories'::regclass
  ) then
    alter table public.service_categories
      add constraint service_categories_image_url_protocol_check
      check (image_url is null or image_url ~* '^https?://');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'service_categories_image_position_length_check'
      and conrelid = 'public.service_categories'::regclass
  ) then
    alter table public.service_categories
      add constraint service_categories_image_position_length_check
      check (char_length(image_position) between 1 and 80);
  end if;
end
$$;

commit;
