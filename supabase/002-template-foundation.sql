begin;

alter table public.businesses
  add column if not exists template_key text
  not null
  default 'hair-luxury';

alter table public.businesses
  add column if not exists template_config jsonb
  not null
  default '{}'::jsonb;

update public.businesses
set
  template_key = 'hair-luxury'
where
  template_key is null
  or btrim(template_key) = '';

update public.businesses
set
  template_config = '{}'::jsonb
where
  template_config is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'businesses_template_key_format_check'
  ) then
    alter table public.businesses
      add constraint
        businesses_template_key_format_check
      check (
        template_key ~
        '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname =
      'businesses_template_config_object_check'
  ) then
    alter table public.businesses
      add constraint
        businesses_template_config_object_check
      check (
        jsonb_typeof(
          template_config
        ) = 'object'
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname =
      'businesses_template_config_size_check'
  ) then
    alter table public.businesses
      add constraint
        businesses_template_config_size_check
      check (
        octet_length(
          template_config::text
        ) <= 65536
      );
  end if;
end;
$$;

commit;

select
  id,
  name,
  slug,
  template_key,
  template_config
from public.businesses
order by created_at;
