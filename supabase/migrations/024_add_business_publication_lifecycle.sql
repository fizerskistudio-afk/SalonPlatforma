begin;

alter table public.businesses
  add column if not exists publication_status text;

update public.businesses
set publication_status =
  case
    when is_active then 'published'
    else 'suspended'
  end
where publication_status is null;

alter table public.businesses
  alter column publication_status set default 'draft';

alter table public.businesses
  alter column publication_status set not null;

alter table public.businesses
  drop constraint if exists businesses_publication_status_check;

alter table public.businesses
  add constraint businesses_publication_status_check
  check (
    publication_status in (
      'draft',
      'published',
      'suspended',
      'archived'
    )
  );

create index if not exists businesses_publication_status_idx
  on public.businesses (
    publication_status,
    is_active
  );

comment on column public.businesses.publication_status is
  'Public lifecycle: draft, published, suspended or archived. Only active published tenants are public and bookable.';

commit;
