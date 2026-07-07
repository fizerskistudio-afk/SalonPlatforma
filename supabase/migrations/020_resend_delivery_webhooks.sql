begin;

-- =========================================================
-- RESEND DELIVERY WEBHOOK STATE
--
-- notification_deliveries.status continues to describe the
-- application -> Resend handoff:
--   pending / sent / failed / skipped
--
-- provider_delivery_status describes what happened after
-- Resend accepted the email:
--   sent / delivered / delayed / bounced / complained /
--   failed / suppressed
-- =========================================================

alter table public.notification_deliveries
  add column if not exists provider_delivery_status text
    not null default 'unknown',
  add column if not exists provider_event_type text,
  add column if not exists provider_event_id text,
  add column if not exists provider_event_at timestamptz,
  add column if not exists provider_error text,
  add column if not exists provider_event_count integer
    not null default 0,
  add column if not exists delivered_at timestamptz,
  add column if not exists delayed_at timestamptz,
  add column if not exists bounced_at timestamptz,
  add column if not exists complained_at timestamptz,
  add column if not exists suppressed_at timestamptz;

alter table public.notification_deliveries
  drop constraint if exists notification_deliveries_provider_delivery_status_check;

alter table public.notification_deliveries
  add constraint notification_deliveries_provider_delivery_status_check
    check (
      provider_delivery_status in (
        'unknown',
        'sent',
        'delivered',
        'delayed',
        'bounced',
        'complained',
        'failed',
        'suppressed'
      )
    );

alter table public.notification_deliveries
  drop constraint if exists notification_deliveries_provider_event_count_check;

alter table public.notification_deliveries
  add constraint notification_deliveries_provider_event_count_check
    check (provider_event_count >= 0);

update public.notification_deliveries
set provider_delivery_status = 'sent'
where
  provider_delivery_status = 'unknown'
  and status = 'sent'
  and provider_message_id is not null;

create index if not exists notification_deliveries_provider_message_idx
  on public.notification_deliveries (provider_message_id)
  where provider_message_id is not null;

create index if not exists notification_deliveries_provider_status_created_idx
  on public.notification_deliveries (
    business_id,
    provider_delivery_status,
    created_at desc
  );

-- =========================================================
-- RAW WEBHOOK EVENT LOG
--
-- Resend/Svix guarantees at-least-once delivery, therefore
-- svix_id is unique and provides webhook idempotency.
-- Payloads are retained for debugging and future reporting.
-- =========================================================

create table if not exists public.resend_webhook_events (
  id uuid primary key default gen_random_uuid(),

  svix_id text not null,
  event_type text not null,
  provider_message_id text,

  event_created_at timestamptz,
  payload jsonb not null,

  matched_delivery_id uuid
    references public.notification_deliveries(id)
    on delete set null,

  processing_status text not null default 'received',
  processing_error text,

  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint resend_webhook_events_svix_id_unique
    unique (svix_id),

  constraint resend_webhook_events_processing_status_check
    check (
      processing_status in (
        'received',
        'processed',
        'unmatched',
        'ignored',
        'failed'
      )
    )
);

create index if not exists resend_webhook_events_message_idx
  on public.resend_webhook_events (
    provider_message_id,
    event_created_at desc
  )
  where provider_message_id is not null;

create index if not exists resend_webhook_events_status_created_idx
  on public.resend_webhook_events (
    processing_status,
    created_at desc
  );

drop trigger if exists resend_webhook_events_set_updated_at
  on public.resend_webhook_events;

create trigger resend_webhook_events_set_updated_at
before update on public.resend_webhook_events
for each row
execute function public.set_updated_at();

-- =========================================================
-- ATOMIC DELIVERY STATE UPDATE
--
-- Events may arrive more than once and are not guaranteed to
-- arrive in order. provider_event_at controls the current
-- visible state, while terminal timestamps are retained even
-- when an older event arrives after a newer event.
-- =========================================================

create or replace function public.apply_resend_delivery_event(
  p_delivery_id uuid,
  p_event_type text,
  p_event_id text,
  p_event_at timestamptz,
  p_provider_status text,
  p_provider_error text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_provider_status not in (
    'sent',
    'delivered',
    'delayed',
    'bounced',
    'complained',
    'failed',
    'suppressed'
  ) then
    raise exception 'INVALID_RESEND_PROVIDER_STATUS';
  end if;

  update public.notification_deliveries
  set
    provider_event_count = provider_event_count + 1,

    provider_delivery_status =
      case
        when provider_event_at is null
          or p_event_at >= provider_event_at
        then p_provider_status
        else provider_delivery_status
      end,

    provider_event_type =
      case
        when provider_event_at is null
          or p_event_at >= provider_event_at
        then p_event_type
        else provider_event_type
      end,

    provider_event_id =
      case
        when provider_event_at is null
          or p_event_at >= provider_event_at
        then p_event_id
        else provider_event_id
      end,

    provider_event_at =
      case
        when provider_event_at is null
          or p_event_at >= provider_event_at
        then p_event_at
        else provider_event_at
      end,

    provider_error =
      case
        when provider_event_at is null
          or p_event_at >= provider_event_at
        then p_provider_error
        else provider_error
      end,

    delivered_at =
      case
        when p_provider_status = 'delivered'
        then coalesce(delivered_at, p_event_at)
        else delivered_at
      end,

    delayed_at =
      case
        when p_provider_status = 'delayed'
        then coalesce(delayed_at, p_event_at)
        else delayed_at
      end,

    bounced_at =
      case
        when p_provider_status = 'bounced'
        then coalesce(bounced_at, p_event_at)
        else bounced_at
      end,

    complained_at =
      case
        when p_provider_status = 'complained'
        then coalesce(complained_at, p_event_at)
        else complained_at
      end,

    suppressed_at =
      case
        when p_provider_status = 'suppressed'
        then coalesce(suppressed_at, p_event_at)
        else suppressed_at
      end
  where id = p_delivery_id;
end;
$$;

revoke all
on function public.apply_resend_delivery_event(
  uuid,
  text,
  text,
  timestamptz,
  text,
  text
)
from public, anon, authenticated;

alter table public.resend_webhook_events
  enable row level security;

revoke all
on public.resend_webhook_events
from anon, authenticated;

commit;
