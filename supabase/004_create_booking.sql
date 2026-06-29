begin;

-- =========================================================
-- 004 CREATE PUBLIC BOOKING
-- =========================================================
--
-- Atomski:
-- 1. validira kupca
-- 2. proverava stvarnu dostupnost termina
-- 3. pronalazi ili kreira kupca
-- 4. upisuje rezervaciju
-- 5. oslanja se na exclusion constraint kao finalnu
--    zaštitu od istovremenog duplog zakazivanja
-- =========================================================

create or replace function public.create_public_booking(
  p_business_id uuid,
  p_service_id uuid,
  p_employee_id uuid,
  p_starts_at timestamptz,
  p_customer_name text,
  p_customer_phone text default null,
  p_customer_email text default null,
  p_customer_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_timezone text;
  v_booking_date date;
  v_slot_available boolean;

  v_customer_name text;
  v_customer_phone text;
  v_customer_phone_digits text;
  v_customer_email text;
  v_customer_note text;

  v_customer_id uuid;
  v_booking public.bookings%rowtype;
begin
  -- -------------------------------------------------------
  -- Osnovna validacija salona
  -- -------------------------------------------------------

  select businesses.timezone
  into v_timezone
  from public.businesses
  where businesses.id = p_business_id
    and businesses.is_active = true;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_BUSINESS';
  end if;

  if p_service_id is null then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_SERVICE';
  end if;

  if p_employee_id is null then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_EMPLOYEE';
  end if;

  if p_starts_at is null then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_START_TIME';
  end if;

  -- -------------------------------------------------------
  -- Normalizacija podataka kupca
  -- -------------------------------------------------------

  v_customer_name :=
    nullif(
      trim(
        coalesce(
          p_customer_name,
          ''
        )
      ),
      ''
    );

  v_customer_phone :=
    nullif(
      trim(
        coalesce(
          p_customer_phone,
          ''
        )
      ),
      ''
    );

  v_customer_phone_digits :=
    nullif(
      regexp_replace(
        coalesce(
          v_customer_phone,
          ''
        ),
        '[^0-9]',
        '',
        'g'
      ),
      ''
    );

  v_customer_email :=
    nullif(
      lower(
        trim(
          coalesce(
            p_customer_email,
            ''
          )
        )
      ),
      ''
    );

  v_customer_note :=
    nullif(
      trim(
        coalesce(
          p_customer_note,
          ''
        )
      ),
      ''
    );

  if v_customer_name is null
    or char_length(v_customer_name) < 2
    or char_length(v_customer_name) > 120
  then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_CUSTOMER_NAME';
  end if;

  if v_customer_phone is null
    and v_customer_email is null
  then
    raise exception using
      errcode = 'P0001',
      message = 'CUSTOMER_CONTACT_REQUIRED';
  end if;

  if v_customer_phone is not null
    and (
      v_customer_phone_digits is null
      or char_length(
        v_customer_phone_digits
      ) < 6
      or char_length(
        v_customer_phone
      ) > 40
    )
  then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_CUSTOMER_PHONE';
  end if;

  if v_customer_email is not null
    and (
      char_length(v_customer_email) > 254
      or v_customer_email !~
        '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
  then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_CUSTOMER_EMAIL';
  end if;

  if v_customer_note is not null
    and char_length(v_customer_note) > 2000
  then
    raise exception using
      errcode = 'P0001',
      message = 'CUSTOMER_NOTE_TOO_LONG';
  end if;

  -- -------------------------------------------------------
  -- Provera da je izabrani početak i dalje dostupan
  -- -------------------------------------------------------

  v_booking_date :=
    (
      p_starts_at
      at time zone v_timezone
    )::date;

  select exists (
    select 1
    from public.get_available_slots(
      p_business_id,
      p_service_id,
      v_booking_date,
      p_employee_id
    ) as available_slots
    where available_slots.starts_at =
      p_starts_at
  )
  into v_slot_available;

  if not v_slot_available then
    raise exception using
      errcode = 'P0001',
      message = 'SLOT_UNAVAILABLE';
  end if;

  -- -------------------------------------------------------
  -- Pronalaženje postojećeg kupca
  -- -------------------------------------------------------

  select customers.id
  into v_customer_id
  from public.customers
  where customers.business_id =
      p_business_id

    and (
      (
        v_customer_email is not null
        and lower(customers.email) =
          v_customer_email
      )

      or

      (
        v_customer_phone_digits
          is not null

        and regexp_replace(
          coalesce(
            customers.phone,
            ''
          ),
          '[^0-9]',
          '',
          'g'
        ) = v_customer_phone_digits
      )
    )

  order by
    case
      when v_customer_email is not null
        and lower(customers.email) =
          v_customer_email
      then 0
      else 1
    end,

    customers.updated_at desc

  limit 1

  for update;

  -- -------------------------------------------------------
  -- Kreiranje ili ažuriranje kupca
  -- -------------------------------------------------------

  if v_customer_id is null then
    insert into public.customers (
      business_id,
      full_name,
      phone,
      email,
      notes
    )
    values (
      p_business_id,
      v_customer_name,
      v_customer_phone,
      v_customer_email,
      v_customer_note
    )
    returning id
    into v_customer_id;

  else
    update public.customers
    set
      full_name = v_customer_name,

      phone = coalesce(
        v_customer_phone,
        customers.phone
      ),

      email = coalesce(
        v_customer_email,
        customers.email
      ),

      notes = coalesce(
        v_customer_note,
        customers.notes
      )

    where customers.id =
        v_customer_id

      and customers.business_id =
        p_business_id;
  end if;

  -- -------------------------------------------------------
  -- Kreiranje rezervacije
  --
  -- prepare_booking trigger automatski popunjava:
  -- - ends_at
  -- - duration_minutes
  -- - price_amount
  -- - currency
  -- -------------------------------------------------------

  insert into public.bookings (
    business_id,
    service_id,
    employee_id,
    customer_id,
    customer_name,
    customer_phone,
    customer_email,
    customer_note,
    starts_at,
    status,
    source
  )
  values (
    p_business_id,
    p_service_id,
    p_employee_id,
    v_customer_id,
    v_customer_name,
    v_customer_phone,
    v_customer_email,
    v_customer_note,
    p_starts_at,
    'confirmed'::public.booking_status,
    'web'::public.booking_source
  )
  returning *
  into v_booking;

  update public.customers
  set last_booking_at =
    case
      when last_booking_at is null
        or v_booking.starts_at >
          last_booking_at
      then v_booking.starts_at
      else last_booking_at
    end
  where id = v_customer_id
    and business_id = p_business_id;

  return jsonb_build_object(
    'id',
    v_booking.id,

    'referenceCode',
    v_booking.reference_code,

    'status',
    v_booking.status,

    'businessId',
    v_booking.business_id,

    'serviceId',
    v_booking.service_id,

    'employeeId',
    v_booking.employee_id,

    'customerId',
    v_booking.customer_id,

    'startsAt',
    v_booking.starts_at,

    'endsAt',
    v_booking.ends_at,

    'durationMinutes',
    v_booking.duration_minutes,

    'priceAmount',
    v_booking.price_amount,

    'currency',
    trim(v_booking.currency)
  );

exception
  when exclusion_violation then
    raise exception using
      errcode = 'P0001',
      message = 'SLOT_UNAVAILABLE';
end;
$$;

revoke all
on function public.create_public_booking(
  uuid,
  uuid,
  uuid,
  timestamptz,
  text,
  text,
  text,
  text
)
from public, anon, authenticated;

grant execute
on function public.create_public_booking(
  uuid,
  uuid,
  uuid,
  timestamptz,
  text,
  text,
  text,
  text
)
to service_role;

commit;