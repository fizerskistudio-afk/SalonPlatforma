begin;

set local transaction read only;

do $$
declare
  constraint_definition text;
  constraint_is_validated boolean;
  required_template_key text;
begin
  select
    pg_get_constraintdef(pg_constraint.oid),
    pg_constraint.convalidated
  into
    constraint_definition,
    constraint_is_validated
  from pg_constraint
  where pg_constraint.conname =
      'businesses_template_key_supported_check'
    and pg_constraint.conrelid =
      'public.businesses'::regclass
    and pg_constraint.contype =
      'c';

  if constraint_definition is null then
    raise exception
      'NAILS_THEME_TEMPLATE_CONSTRAINT_MISSING';
  end if;

  if constraint_is_validated is not true then
    raise exception
      'NAILS_THEME_TEMPLATE_CONSTRAINT_NOT_VALIDATED';
  end if;

  foreach required_template_key in array array[
    'hair-luxury',
    'hair-editorial',
    'barber-heritage',
    'nails-soft'
  ]
  loop
    if position(
      quote_literal(required_template_key)
      in constraint_definition
    ) = 0 then
      raise exception
        'NAILS_THEME_TEMPLATE_KEY_MISSING: %',
        required_template_key;
    end if;
  end loop;

  if exists (
    select 1
    from public.businesses
    where template_key is not null
      and template_key not in (
        'hair-luxury',
        'hair-editorial',
        'barber-heritage',
        'nails-soft'
      )
  ) then
    raise exception
      'NAILS_THEME_UNSUPPORTED_TEMPLATE_KEY_PRESENT';
  end if;
end;
$$;

select
  count(*) filter (
    where template_key =
      'nails-soft'
  ) as nails_soft_businesses,
  'PASS' as nails_theme_pack_status
from public.businesses;

rollback;
