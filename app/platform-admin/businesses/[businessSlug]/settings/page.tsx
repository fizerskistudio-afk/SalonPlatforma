import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  CalendarClock,
} from "lucide-react";

import BusinessOperationalSettingsEditor from "@/components/platform-admin/BusinessOperationalSettingsEditor";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type BusinessSettingsPageProps = {
  params: Promise<{
    businessSlug: string;
  }>;
};

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
};

type BookingSettingsRow = {
  slot_interval_minutes: number;
  booking_window_days: number;
  min_advance_minutes: number;
  allow_any_employee: boolean;
  require_email: boolean;
  require_phone: boolean;
  allow_notes: boolean;
  auto_confirm: boolean;
};

type WorkingHoursRow = {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

function normalizeDatabaseTime(
  value: string | null,
  fallback: string
): string {
  if (!value) {
    return fallback;
  }

  const match =
    /^((?:[01]\d|2[0-3]):[0-5]\d)(?::[0-5]\d(?:\.\d+)?)?$/.exec(
      value.trim()
    );

  return match
    ? match[1]
    : fallback;
}

const DEFAULT_HOURS = [
  {
    dayOfWeek: 0,
    isClosed: true,
    openTime: "09:00",
    closeTime: "17:00",
  },
  {
    dayOfWeek: 1,
    isClosed: false,
    openTime: "09:00",
    closeTime: "17:00",
  },
  {
    dayOfWeek: 2,
    isClosed: false,
    openTime: "09:00",
    closeTime: "17:00",
  },
  {
    dayOfWeek: 3,
    isClosed: false,
    openTime: "09:00",
    closeTime: "17:00",
  },
  {
    dayOfWeek: 4,
    isClosed: false,
    openTime: "09:00",
    closeTime: "17:00",
  },
  {
    dayOfWeek: 5,
    isClosed: false,
    openTime: "09:00",
    closeTime: "17:00",
  },
  {
    dayOfWeek: 6,
    isClosed: false,
    openTime: "09:00",
    closeTime: "14:00",
  },
] as const;

async function loadBusinessSettings(
  businessSlug: string
) {
  const supabase =
    createAdminClient();

  const {
    data: businessData,
    error: businessError,
  } = await supabase
    .from("businesses")
    .select(
      "id, slug, name"
    )
    .eq(
      "slug",
      businessSlug
    )
    .maybeSingle();

  if (businessError) {
    console.error(
      "Failed to load business settings page:",
      businessError
    );

    throw new Error(
      "Salon nije moguće učitati za uređivanje podešavanja."
    );
  }

  if (!businessData) {
    return null;
  }

  const business =
    businessData as
      unknown as
      BusinessRow;

  const [
    settingsResult,
    hoursResult,
  ] = await Promise.all([
    supabase
      .from(
        "booking_settings"
      )
      .select(
        `
          slot_interval_minutes,
          booking_window_days,
          min_advance_minutes,
          allow_any_employee,
          require_email,
          require_phone,
          allow_notes,
          auto_confirm
        `
      )
      .eq(
        "business_id",
        business.id
      )
      .maybeSingle(),

    supabase
      .from(
        "working_hours"
      )
      .select(
        `
          day_of_week,
          open_time,
          close_time,
          is_closed
        `
      )
      .eq(
        "business_id",
        business.id
      )
      .is(
        "employee_id",
        null
      )
      .order(
        "day_of_week",
        {
          ascending: true,
        }
      ),
  ]);

  if (
    settingsResult.error ||
    hoursResult.error
  ) {
    console.error(
      "Failed to load operational settings:",
      [
        settingsResult.error,
        hoursResult.error,
      ].filter(Boolean)
    );

    throw new Error(
      "Booking pravila i radno vreme nisu mogli da se učitaju."
    );
  }

  const settings =
    settingsResult.data
      ? settingsResult.data as
          unknown as
          BookingSettingsRow
      : null;

  const hourRows =
    (hoursResult.data ??
      []) as unknown as
      WorkingHoursRow[];

  const hourByDay =
    new Map(
      hourRows.map(
        (hour) => [
          hour.day_of_week,
          hour,
        ] as const
      )
    );

  return {
    business,

    settings: {
      slotIntervalMinutes:
        settings?.slot_interval_minutes ??
        30,

      bookingWindowDays:
        settings?.booking_window_days ??
        14,

      minimumAdvanceMinutes:
        settings?.min_advance_minutes ??
        60,

      allowAnyEmployee:
        settings?.allow_any_employee ??
        true,

      requireEmail:
        settings?.require_email ??
        false,

      requirePhone:
        settings?.require_phone ??
        true,

      allowNotes:
        settings?.allow_notes ??
        true,

      autoConfirm:
        settings?.auto_confirm ??
        true,
    },

    workingHours:
      DEFAULT_HOURS.map(
        (defaultHour) => {
          const row =
            hourByDay.get(
              defaultHour.dayOfWeek
            );

          return {
            dayOfWeek:
              defaultHour.dayOfWeek,

            isClosed:
              row?.is_closed ??
              defaultHour.isClosed,

            openTime:
              normalizeDatabaseTime(
                row?.open_time ??
                  null,
                defaultHour.openTime
              ),

            closeTime:
              normalizeDatabaseTime(
                row?.close_time ??
                  null,
                defaultHour.closeTime
              ),
          };
        }
      ),
  };
}

export default async function BusinessSettingsPage({
  params,
}: BusinessSettingsPageProps) {
  const {
    businessSlug:
      rawBusinessSlug,
  } = await params;

  const businessSlug =
    rawBusinessSlug
      .trim()
      .toLowerCase();

  if (
    !BUSINESS_SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    notFound();
  }

  const data =
    await loadBusinessSettings(
      businessSlug
    );

  if (!data) {
    notFound();
  }

  return (
    <div
      className="mx-auto max-w-6xl"
    >
      <Link
        href={
          `/platform-admin/businesses/${data.business.slug}`
        }
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft
          size={17}
        />

        Nazad na pregled salona
      </Link>

      <div
        className="mt-6"
      >
        <div
          className="flex items-center gap-2 text-sm font-semibold text-amber-300"
        >
          <CalendarClock
            size={17}
          />

          Operativna podešavanja
        </div>

        <h2
          className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Booking i radno vreme
        </h2>

        <p
          className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base"
        >
          Podešavanja za salon {" "}
          <span
            className="font-semibold text-zinc-200"
          >
            {data.business.name}
          </span>
          . Izmene odmah utiču na javnu dostupnost termina.
        </p>
      </div>

      <div
        className="mt-8"
      >
        <BusinessOperationalSettingsEditor
          businessSlug={
            data.business.slug
          }
          initialSettings={
            data.settings
          }
          initialWorkingHours={
            data.workingHours
          }
        />
      </div>
    </div>
  );
}
