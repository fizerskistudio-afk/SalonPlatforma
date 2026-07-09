begin;

do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select
      constraint_data.conname
    from pg_constraint as constraint_data
    join pg_class as table_data
      on table_data.oid =
        constraint_data.conrelid
    join pg_namespace as schema_data
      on schema_data.oid =
        table_data.relnamespace
    where
      schema_data.nspname =
        'public'
      and table_data.relname =
        'businesses'
      and constraint_data.contype =
        'c'
      and pg_get_constraintdef(
        constraint_data.oid
      ) ilike '%template_key%'
  loop
    execute format(
      'alter table public.businesses drop constraint %I',
      constraint_row.conname
    );
  end loop;
end
$$;

alter table public.businesses
  add constraint businesses_template_key_supported_check
  check (
    template_key in (
      'hair-luxury',
      'hair-editorial',
      'barber-heritage'
    )
  );

commit;
