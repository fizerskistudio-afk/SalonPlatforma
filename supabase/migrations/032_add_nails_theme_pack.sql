begin;

alter table public.businesses
  drop constraint if exists businesses_template_key_supported_check;

alter table public.businesses
  add constraint businesses_template_key_supported_check
  check (
    template_key in (
      'hair-luxury',
      'hair-editorial',
      'barber-heritage',
      'nails-soft'
    )
  );

comment on constraint businesses_template_key_supported_check
on public.businesses is
  'Public template keys supported by the application registry.';

commit;
