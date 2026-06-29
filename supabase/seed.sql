begin;

-- =========================================================
-- 002 DEMO SEED DATA
-- Lumière Studio
-- =========================================================

-- Stabilni UUID-jevi omogućavaju da seed može ponovo da se pokrene.
--
-- Business:
-- 10000000-0000-4000-8000-000000000001
--
-- Categories:
-- 20000000-0000-4000-8000-000000000001 - hair
-- 20000000-0000-4000-8000-000000000002 - coloring
-- 20000000-0000-4000-8000-000000000003 - styling
-- 20000000-0000-4000-8000-000000000004 - beauty
-- 20000000-0000-4000-8000-000000000005 - nails
--
-- Services:
-- 30000000-0000-4000-8000-000000000001 - s1
-- ...
-- 30000000-0000-4000-8000-000000000012 - s12
--
-- Employees:
-- 40000000-0000-4000-8000-000000000001 - Arben
-- 40000000-0000-4000-8000-000000000002 - Elira

-- =========================================================
-- BUSINESS
-- =========================================================

insert into public.businesses (
  id,
  slug,
  name,
  tagline,
  description,
  address,
  city,
  country,
  phone,
  email,
  instagram_handle,
  instagram_url,
  hero_image_url,
  default_locale,
  currency,
  timezone,
  is_active
)
values (
  '10000000-0000-4000-8000-000000000001',
  'lumiere-studio',
  'Lumière Studio',

  jsonb_build_object(
    'mk', 'Каде стилот среќава уметност',
    'sq', 'Ku stili takon artin',
    'en', 'Where style meets art'
  ),

  jsonb_build_object(
    'mk', 'Премиум фризерски и beauty салон во срцето на Скопје. Посветени на тоа да се чувствувате и изгледате најдобро.',
    'sq', 'Salon parës për flokë dhe bukuri në zemër të Shkupit. Të përkushtuar që të ndiheni dhe të dukeni sa më mirë.',
    'en', 'A premium hair & beauty studio in the heart of Skopje. Dedicated to making you look and feel your absolute best.'
  ),

  jsonb_build_object(
    'mk', 'ул. Македонија 25',
    'sq', 'rr. Maqedonia 25',
    'en', '25 Macedonia St.'
  ),

  jsonb_build_object(
    'mk', 'Скопје',
    'sq', 'Shkup',
    'en', 'Skopje'
  ),

  jsonb_build_object(
    'mk', 'Северна Македонија',
    'sq', 'Maqedonia e Veriut',
    'en', 'North Macedonia'
  ),

  '+389 70 123 456',
  'hello@lumiere.mk',
  '@lumiere.studio',
  'https://instagram.com/lumiere.studio',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80',
  'mk',
  'EUR',
  'Europe/Skopje',
  true
)
on conflict (id)
do update set
  slug = excluded.slug,
  name = excluded.name,
  tagline = excluded.tagline,
  description = excluded.description,
  address = excluded.address,
  city = excluded.city,
  country = excluded.country,
  phone = excluded.phone,
  email = excluded.email,
  instagram_handle = excluded.instagram_handle,
  instagram_url = excluded.instagram_url,
  hero_image_url = excluded.hero_image_url,
  default_locale = excluded.default_locale,
  currency = excluded.currency,
  timezone = excluded.timezone,
  is_active = excluded.is_active;

-- =========================================================
-- BOOKING SETTINGS
-- =========================================================

insert into public.booking_settings (
  business_id,
  slot_interval_minutes,
  booking_window_days,
  min_advance_minutes,
  allow_any_employee,
  require_email,
  require_phone,
  allow_notes,
  auto_confirm
)
values (
  '10000000-0000-4000-8000-000000000001',
  30,
  14,
  60,
  true,
  false,
  true,
  true,
  true
)
on conflict (business_id)
do update set
  slot_interval_minutes =
    excluded.slot_interval_minutes,
  booking_window_days =
    excluded.booking_window_days,
  min_advance_minutes =
    excluded.min_advance_minutes,
  allow_any_employee =
    excluded.allow_any_employee,
  require_email =
    excluded.require_email,
  require_phone =
    excluded.require_phone,
  allow_notes =
    excluded.allow_notes,
  auto_confirm =
    excluded.auto_confirm;

-- =========================================================
-- SERVICE CATEGORIES
-- =========================================================

insert into public.service_categories (
  id,
  business_id,
  slug,
  name,
  icon_key,
  sort_order,
  is_active
)
values
(
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'hair',
  jsonb_build_object(
    'mk', 'Коса',
    'sq', 'Flokë',
    'en', 'Hair'
  ),
  'scissors',
  10,
  true
),
(
  '20000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000001',
  'coloring',
  jsonb_build_object(
    'mk', 'Фарбање',
    'sq', 'Ngjyrosje',
    'en', 'Coloring'
  ),
  'palette',
  20,
  true
),
(
  '20000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000001',
  'styling',
  jsonb_build_object(
    'mk', 'Фризури',
    'sq', 'Stilim',
    'en', 'Styling'
  ),
  'sparkles',
  30,
  true
),
(
  '20000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000001',
  'beauty',
  jsonb_build_object(
    'mk', 'Убавина',
    'sq', 'Bukuri',
    'en', 'Beauty'
  ),
  'heart',
  40,
  true
),
(
  '20000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000001',
  'nails',
  jsonb_build_object(
    'mk', 'Нокти',
    'sq', 'Thonj',
    'en', 'Nails'
  ),
  'hand',
  50,
  true
)
on conflict (id)
do update set
  business_id = excluded.business_id,
  slug = excluded.slug,
  name = excluded.name,
  icon_key = excluded.icon_key,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- =========================================================
-- SERVICES
-- =========================================================

insert into public.services (
  id,
  business_id,
  category_id,
  slug,
  name,
  duration_minutes,
  price_type,
  price_from,
  price_to,
  sort_order,
  is_active
)
values
(
  '30000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'mens-cut',
  jsonb_build_object(
    'mk', 'Машко стрижење',
    'sq', 'Prerje mashkullore',
    'en', 'Men''s Cut'
  ),
  30,
  'fixed',
  15,
  null,
  10,
  true
),
(
  '30000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'womens-cut',
  jsonb_build_object(
    'mk', 'Женско стрижење',
    'sq', 'Prerje femërore',
    'en', 'Women''s Cut'
  ),
  45,
  'fixed',
  25,
  null,
  20,
  true
),
(
  '30000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'kids-cut',
  jsonb_build_object(
    'mk', 'Детско стрижење',
    'sq', 'Prerje fëmijësh',
    'en', 'Kids Cut'
  ),
  20,
  'fixed',
  10,
  null,
  30,
  true
),
(
  '30000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002',
  'full-color',
  jsonb_build_object(
    'mk', 'Целосно фарбање',
    'sq', 'Ngjyrosje e plotë',
    'en', 'Full Color'
  ),
  90,
  'from',
  45,
  null,
  40,
  true
),
(
  '30000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002',
  'balayage',
  jsonb_build_object(
    'mk', 'Балајаж',
    'sq', 'Balayage',
    'en', 'Balayage'
  ),
  150,
  'range',
  85,
  150,
  50,
  true
),
(
  '30000000-0000-4000-8000-000000000006',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002',
  'highlights',
  jsonb_build_object(
    'mk', 'Истакнување',
    'sq', 'Theksim',
    'en', 'Highlights'
  ),
  120,
  'range',
  65,
  120,
  60,
  true
),
(
  '30000000-0000-4000-8000-000000000007',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000003',
  'blow-dry',
  jsonb_build_object(
    'mk', 'Фенирање',
    'sq', 'Fenim',
    'en', 'Blow Dry'
  ),
  30,
  'fixed',
  15,
  null,
  70,
  true
),
(
  '30000000-0000-4000-8000-000000000008',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000003',
  'special-occasion',
  jsonb_build_object(
    'mk', 'Свечена фризура',
    'sq', 'Fryrë feste',
    'en', 'Special Occasion'
  ),
  60,
  'from',
  40,
  null,
  80,
  true
),
(
  '30000000-0000-4000-8000-000000000009',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000004',
  'brow-shaping',
  jsonb_build_object(
    'mk', 'Обликување веѓи',
    'sq', 'Formë vetullash',
    'en', 'Brow Shaping'
  ),
  20,
  'fixed',
  10,
  null,
  90,
  true
),
(
  '30000000-0000-4000-8000-000000000010',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000004',
  'facial-treatment',
  jsonb_build_object(
    'mk', 'Третман за лице',
    'sq', 'Trajtim fytyre',
    'en', 'Facial Treatment'
  ),
  60,
  'from',
  35,
  null,
  100,
  true
),
(
  '30000000-0000-4000-8000-000000000011',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000005',
  'manicure',
  jsonb_build_object(
    'mk', 'Маникир',
    'sq', 'Manikyr',
    'en', 'Manicure'
  ),
  45,
  'fixed',
  20,
  null,
  110,
  true
),
(
  '30000000-0000-4000-8000-000000000012',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000005',
  'pedicure',
  jsonb_build_object(
    'mk', 'Педикир',
    'sq', 'Pedikyr',
    'en', 'Pedicure'
  ),
  60,
  'fixed',
  30,
  null,
  120,
  true
)
on conflict (id)
do update set
  business_id = excluded.business_id,
  category_id = excluded.category_id,
  slug = excluded.slug,
  name = excluded.name,
  duration_minutes = excluded.duration_minutes,
  price_type = excluded.price_type,
  price_from = excluded.price_from,
  price_to = excluded.price_to,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- =========================================================
-- EMPLOYEES
-- =========================================================

insert into public.employees (
  id,
  business_id,
  slug,
  name,
  title,
  bio,
  image_url,
  sort_order,
  is_active
)
values
(
  '40000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'arben',
  'Arben',

  jsonb_build_object(
    'mk', 'Сениор фризер',
    'sq', 'Stilist senior flokësh',
    'en', 'Senior Hair Stylist'
  ),

  jsonb_build_object(
    'mk', '15 години искуство. Специјалист за модерно машко и женско стрижење и фризури.',
    'sq', '15 vite përvojë. Specialist për prerje moderne mashkullore e femërore.',
    'en', '15 years of experience. Specialist in modern men''s and women''s cuts.'
  ),

  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
  10,
  true
),
(
  '40000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000001',
  'elira',
  'Elira',

  jsonb_build_object(
    'mk', 'Специјалист за боја и убавина',
    'sq', 'Specialiste ngjyrash & bukurie',
    'en', 'Color & Beauty Specialist'
  ),

  jsonb_build_object(
    'mk', 'Експерт за балајаж, фарбање и третмани за лице.',
    'sq', 'Experte e balayage, ngjyrosjes dhe trajtimeve të fytyrës.',
    'en', 'Expert in balayage, coloring, and facial treatments.'
  ),

  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80',
  20,
  true
)
on conflict (id)
do update set
  business_id = excluded.business_id,
  slug = excluded.slug,
  name = excluded.name,
  title = excluded.title,
  bio = excluded.bio,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- =========================================================
-- EMPLOYEE ↔ SERVICE RELATIONS
-- =========================================================

-- Seed treba da bude izvor istine za demo mapiranje.
delete from public.employee_services
where business_id =
  '10000000-0000-4000-8000-000000000001';

-- Arben: s1, s2, s3, s7, s8
insert into public.employee_services (
  business_id,
  employee_id,
  service_id,
  is_active
)
values
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  true
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000002',
  true
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000003',
  true
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000007',
  true
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000008',
  true
),

-- Elira: s2, s4, s5, s6, s9, s10, s11, s12
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000002',
  true
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000004',
  true
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000005',
  true
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000006',
  true
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000009',
  true
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000010',
  true
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000011',
  true
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000012',
  true
);

-- =========================================================
-- WORKING HOURS
-- =========================================================

-- Brišemo samo demo radno vreme i ponovo ga unosimo.
-- Time seed može bezbedno da se izvrši više puta.
delete from public.working_hours
where business_id =
  '10000000-0000-4000-8000-000000000001';

-- Business hours
insert into public.working_hours (
  business_id,
  employee_id,
  day_of_week,
  is_closed,
  open_time,
  close_time
)
values
(
  '10000000-0000-4000-8000-000000000001',
  null,
  0,
  true,
  null,
  null
),
(
  '10000000-0000-4000-8000-000000000001',
  null,
  1,
  false,
  '09:00',
  '18:00'
),
(
  '10000000-0000-4000-8000-000000000001',
  null,
  2,
  false,
  '09:00',
  '18:00'
),
(
  '10000000-0000-4000-8000-000000000001',
  null,
  3,
  false,
  '09:00',
  '18:00'
),
(
  '10000000-0000-4000-8000-000000000001',
  null,
  4,
  false,
  '09:00',
  '18:00'
),
(
  '10000000-0000-4000-8000-000000000001',
  null,
  5,
  false,
  '09:00',
  '20:00'
),
(
  '10000000-0000-4000-8000-000000000001',
  null,
  6,
  false,
  '10:00',
  '16:00'
),

-- Arben hours
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  0,
  true,
  null,
  null
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  1,
  false,
  '09:00',
  '18:00'
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  2,
  false,
  '09:00',
  '18:00'
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  3,
  false,
  '09:00',
  '18:00'
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  4,
  false,
  '09:00',
  '18:00'
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  5,
  false,
  '09:00',
  '20:00'
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  6,
  false,
  '10:00',
  '14:00'
),

-- Elira hours
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  0,
  true,
  null,
  null
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  1,
  true,
  null,
  null
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  2,
  false,
  '10:00',
  '18:00'
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  3,
  false,
  '10:00',
  '18:00'
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  4,
  false,
  '10:00',
  '18:00'
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  5,
  false,
  '10:00',
  '18:00'
),
(
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  6,
  false,
  '10:00',
  '16:00'
);

commit;

-- =========================================================
-- VERIFICATION
-- =========================================================

select
  (
    select count(*)
    from public.businesses
    where id =
      '10000000-0000-4000-8000-000000000001'
  ) as businesses,

  (
    select count(*)
    from public.booking_settings
    where business_id =
      '10000000-0000-4000-8000-000000000001'
  ) as booking_settings,

  (
    select count(*)
    from public.service_categories
    where business_id =
      '10000000-0000-4000-8000-000000000001'
  ) as categories,

  (
    select count(*)
    from public.services
    where business_id =
      '10000000-0000-4000-8000-000000000001'
  ) as services,

  (
    select count(*)
    from public.employees
    where business_id =
      '10000000-0000-4000-8000-000000000001'
  ) as employees,

  (
    select count(*)
    from public.employee_services
    where business_id =
      '10000000-0000-4000-8000-000000000001'
  ) as employee_services,

  (
    select count(*)
    from public.working_hours
    where business_id =
      '10000000-0000-4000-8000-000000000001'
  ) as working_hours;