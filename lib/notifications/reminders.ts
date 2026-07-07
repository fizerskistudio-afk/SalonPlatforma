import "server-only";

import {
  sendNotificationEmail,
} from "@/lib/notifications/delivery";
import {
  renderBookingReminderEmail,
  type BookingReminderKind,
} from "@/lib/notifications/reminder-templates";
import type {
  BookingNotificationTemplateContext,
} from "@/lib/notifications/templates";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

const HOUR_MS = 60 * 60 * 1000;
const MAX_REMINDER_HOURS = 24;
const DEFAULT_BATCH_LIMIT = 250;

const REMINDER_TEMPLATE_KEYS = {
  "24h": "booking_reminder_24h",
  "2h": "booking_reminder_2h",
} as const;

type BookingRow = {
  id: string;
  reference_code: string;
  business_id: string;
  service_id: string;
  employee_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  price_amount: number | string;
  currency: string;
  status: string;
};

type BusinessRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  timezone: string;
  default_locale: string;
  address: unknown;
  city: unknown;
};

type ServiceRow = {
  id: string;
  name: unknown;
};

type EmployeeRow = {
  id: string;
  name: string;
};

type ReminderSettingsRow = {
  business_id: string;
  customer_notifications_enabled: boolean;
  booking_reminder_24h_enabled: boolean;
  booking_reminder_2h_enabled: boolean;
};

type ReminderDeliveryRow = {
  id: string;
  business_id: string | null;
  booking_id: string | null;
  template_key: string;
  dedupe_key: string;
  status: string;
  metadata: unknown;
};

type ReminderContext = {
  booking: BookingRow;
  business: BusinessRow;
  service: ServiceRow;
  employee: EmployeeRow;
  settings: ReminderSettingsRow | null;
  template: BookingNotificationTemplateContext;
};

export type BookingReminderRunResult = {
  ok: boolean;
  checked: number;
  eligible: number;
  sent: number;
  skipped: number;
  failed: number;
  message: string;
};

export type BookingReminderRetryResult = {
  ok: boolean;
  message: string;
};

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function getLocalizedValue(
  value: unknown,
  preferredLocale: string
): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return "";
  }

  const record = value as Record<string, unknown>;
  const preferred = record[preferredLocale];

  if (
    typeof preferred === "string" &&
    preferred.trim()
  ) {
    return preferred.trim();
  }

  for (const locale of [
    "sr-Latn",
    "sr",
    "en",
    "mk",
    "sq",
  ]) {
    const candidate = record[locale];

    if (
      typeof candidate === "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  for (const candidate of Object.values(record)) {
    if (
      typeof candidate === "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  return "";
}

function createBusinessAddress(
  business: BusinessRow
): string | null {
  const address = getLocalizedValue(
    business.address,
    business.default_locale
  );
  const city = getLocalizedValue(
    business.city,
    business.default_locale
  );

  return [address, city]
    .filter(Boolean)
    .join(", ") || null;
}

function createTemplateContext({
  booking,
  business,
  service,
  employee,
}: {
  booking: BookingRow;
  business: BusinessRow;
  service: ServiceRow;
  employee: EmployeeRow;
}): BookingNotificationTemplateContext {
  return {
    businessName: business.name,
    businessPhone: business.phone,
    businessEmail: business.email,
    businessAddress:
      createBusinessAddress(business),
    timezone: business.timezone,

    referenceCode: booking.reference_code,
    customerName: booking.customer_name,
    customerPhone: booking.customer_phone,
    customerEmail: booking.customer_email,

    serviceName:
      getLocalizedValue(
        service.name,
        business.default_locale
      ) || "Usluga",
    employeeName: employee.name,

    startsAt: booking.starts_at,
    endsAt: booking.ends_at,
    durationMinutes:
      booking.duration_minutes,
    priceAmount: booking.price_amount,
    currency: booking.currency,
    cancellationReason: null,
  };
}

function chooseReminderKind(
  startsAt: string,
  now: Date,
  settings: ReminderSettingsRow | null
): BookingReminderKind | null {
  const startsAtMs = Date.parse(startsAt);

  if (Number.isNaN(startsAtMs)) {
    return null;
  }

  const differenceMs =
    startsAtMs - now.getTime();

  if (differenceMs <= 0) {
    return null;
  }

  const customerEnabled =
    settings?.customer_notifications_enabled ??
    true;

  if (!customerEnabled) {
    return null;
  }

  if (differenceMs <= 2 * HOUR_MS) {
    return settings
      ?.booking_reminder_2h_enabled
      ? "2h"
      : null;
  }

  if (
    differenceMs <=
    MAX_REMINDER_HOURS * HOUR_MS
  ) {
    return (
      settings
        ?.booking_reminder_24h_enabled ??
      true
    )
      ? "24h"
      : null;
  }

  return null;
}

function createReminderDedupeKey(
  booking: BookingRow,
  kind: BookingReminderKind
): string {
  return `booking:${booking.id}:customer:reminder:${kind}:${booking.starts_at}`;
}

async function sendReminder(
  context: ReminderContext,
  kind: BookingReminderKind,
  dedupeKey = createReminderDedupeKey(
    context.booking,
    kind
  )
) {
  const recipient =
    context.booking.customer_email?.trim();

  if (!recipient) {
    return {
      ok: true,
      status: "skipped" as const,
      message:
        "Booking has no customer email.",
    };
  }

  if (
    context.booking.status !==
    "confirmed"
  ) {
    return {
      ok: true,
      status: "skipped" as const,
      message:
        "Only confirmed bookings receive reminders.",
    };
  }

  const content =
    renderBookingReminderEmail(
      context.template,
      kind
    );

  return sendNotificationEmail({
    scope: "business",
    audience: "customer",
    templateKey:
      REMINDER_TEMPLATE_KEYS[kind],
    dedupeKey,
    recipient,
    businessId: context.business.id,
    bookingId: context.booking.id,
    ...content,
    metadata: {
      reminderKind: kind,
      scheduledStartsAt:
        context.booking.starts_at,
      referenceCode:
        context.booking.reference_code,
    },
  });
}

async function loadSingleReminderContext(
  bookingId: string
): Promise<ReminderContext | null> {
  const supabase = createAdminClient();
  const bookingResult = await supabase
    .from("bookings")
    .select(
      `
        id,
        reference_code,
        business_id,
        service_id,
        employee_id,
        customer_name,
        customer_phone,
        customer_email,
        starts_at,
        ends_at,
        duration_minutes,
        price_amount,
        currency,
        status
      `
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingResult.error) {
    throw new Error(
      `Reminder booking could not be loaded: ${bookingResult.error.message}`
    );
  }

  if (!bookingResult.data) {
    return null;
  }

  const booking =
    bookingResult.data as unknown as BookingRow;

  const [
    businessResult,
    serviceResult,
    employeeResult,
    settingsResult,
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select(
        "id, name, email, phone, timezone, default_locale, address, city"
      )
      .eq("id", booking.business_id)
      .maybeSingle(),
    supabase
      .from("services")
      .select("id, name")
      .eq("id", booking.service_id)
      .maybeSingle(),
    supabase
      .from("employees")
      .select("id, name")
      .eq("id", booking.employee_id)
      .maybeSingle(),
    supabase
      .from("business_email_settings")
      .select(
        `
          business_id,
          customer_notifications_enabled,
          booking_reminder_24h_enabled,
          booking_reminder_2h_enabled
        `
      )
      .eq("business_id", booking.business_id)
      .maybeSingle(),
  ]);

  if (
    businessResult.error ||
    !businessResult.data
  ) {
    throw new Error(
      `Reminder business could not be loaded: ${businessResult.error?.message ?? "not found"}`
    );
  }

  if (
    serviceResult.error ||
    !serviceResult.data
  ) {
    throw new Error(
      `Reminder service could not be loaded: ${serviceResult.error?.message ?? "not found"}`
    );
  }

  if (
    employeeResult.error ||
    !employeeResult.data
  ) {
    throw new Error(
      `Reminder employee could not be loaded: ${employeeResult.error?.message ?? "not found"}`
    );
  }

  if (settingsResult.error) {
    throw new Error(
      `Reminder settings could not be loaded: ${settingsResult.error.message}`
    );
  }

  const business =
    businessResult.data as unknown as BusinessRow;
  const service =
    serviceResult.data as unknown as ServiceRow;
  const employee =
    employeeResult.data as unknown as EmployeeRow;
  const settings = settingsResult.data
    ? settingsResult.data as unknown as ReminderSettingsRow
    : null;

  return {
    booking,
    business,
    service,
    employee,
    settings,
    template: createTemplateContext({
      booking,
      business,
      service,
      employee,
    }),
  };
}

export async function processBookingReminders({
  businessId,
  now = new Date(),
  limit = DEFAULT_BATCH_LIMIT,
}: {
  businessId?: string;
  now?: Date;
  limit?: number;
} = {}): Promise<BookingReminderRunResult> {
  const supabase = createAdminClient();
  const safeLimit = Math.min(
    Math.max(Math.trunc(limit), 1),
    1000
  );
  const horizon = new Date(
    now.getTime() +
      MAX_REMINDER_HOURS * HOUR_MS
  );

  let query = supabase
    .from("bookings")
    .select(
      `
        id,
        reference_code,
        business_id,
        service_id,
        employee_id,
        customer_name,
        customer_phone,
        customer_email,
        starts_at,
        ends_at,
        duration_minutes,
        price_amount,
        currency,
        status
      `
    )
    .eq("status", "confirmed")
    .not("customer_email", "is", null)
    .gt("starts_at", now.toISOString())
    .lte("starts_at", horizon.toISOString())
    .order("starts_at", {
      ascending: true,
    })
    .limit(safeLimit);

  if (businessId) {
    query = query.eq(
      "business_id",
      businessId
    );
  }

  const bookingResult = await query;

  if (bookingResult.error) {
    return {
      ok: false,
      checked: 0,
      eligible: 0,
      sent: 0,
      skipped: 0,
      failed: 1,
      message:
        `Reminder scan failed: ${bookingResult.error.message}`,
    };
  }

  const bookings =
    (bookingResult.data ?? []) as unknown as BookingRow[];

  if (bookings.length === 0) {
    return {
      ok: true,
      checked: 0,
      eligible: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      message:
        "Nema potvrđenih termina za slanje podsetnika.",
    };
  }

  const businessIds = unique(
    bookings.map(
      (booking) => booking.business_id
    )
  );
  const serviceIds = unique(
    bookings.map(
      (booking) => booking.service_id
    )
  );
  const employeeIds = unique(
    bookings.map(
      (booking) => booking.employee_id
    )
  );

  const [
    businessesResult,
    servicesResult,
    employeesResult,
    settingsResult,
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select(
        "id, name, email, phone, timezone, default_locale, address, city"
      )
      .in("id", businessIds),
    supabase
      .from("services")
      .select("id, name")
      .in("id", serviceIds),
    supabase
      .from("employees")
      .select("id, name")
      .in("id", employeeIds),
    supabase
      .from("business_email_settings")
      .select(
        `
          business_id,
          customer_notifications_enabled,
          booking_reminder_24h_enabled,
          booking_reminder_2h_enabled
        `
      )
      .in("business_id", businessIds),
  ]);

  const loadError =
    businessesResult.error ??
    servicesResult.error ??
    employeesResult.error ??
    settingsResult.error;

  if (loadError) {
    return {
      ok: false,
      checked: bookings.length,
      eligible: 0,
      sent: 0,
      skipped: 0,
      failed: 1,
      message:
        `Reminder context failed: ${loadError.message}`,
    };
  }

  const businesses = new Map(
    ((businessesResult.data ?? []) as unknown as BusinessRow[])
      .map((row) => [row.id, row])
  );
  const services = new Map(
    ((servicesResult.data ?? []) as unknown as ServiceRow[])
      .map((row) => [row.id, row])
  );
  const employees = new Map(
    ((employeesResult.data ?? []) as unknown as EmployeeRow[])
      .map((row) => [row.id, row])
  );
  const settings = new Map(
    ((settingsResult.data ?? []) as unknown as ReminderSettingsRow[])
      .map((row) => [row.business_id, row])
  );

  let eligible = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const booking of bookings) {
    const business = businesses.get(
      booking.business_id
    );
    const service = services.get(
      booking.service_id
    );
    const employee = employees.get(
      booking.employee_id
    );
    const reminderSettings =
      settings.get(booking.business_id) ??
      null;

    if (
      !business ||
      !service ||
      !employee
    ) {
      failed += 1;
      continue;
    }

    const kind = chooseReminderKind(
      booking.starts_at,
      now,
      reminderSettings
    );

    if (!kind) {
      skipped += 1;
      continue;
    }

    eligible += 1;

    const result = await sendReminder(
      {
        booking,
        business,
        service,
        employee,
        settings: reminderSettings,
        template: createTemplateContext({
          booking,
          business,
          service,
          employee,
        }),
      },
      kind
    );

    const alreadySent =
      "skippedBecauseAlreadySent" in result &&
      result.skippedBecauseAlreadySent === true;

    if (
      result.ok &&
      result.status === "sent" &&
      !alreadySent
    ) {
      sent += 1;
    } else if (result.ok) {
      skipped += 1;
    } else {
      failed += 1;
    }
  }

  return {
    ok: failed === 0,
    checked: bookings.length,
    eligible,
    sent,
    skipped,
    failed,
    message:
      `Provereno: ${bookings.length}. Poslato: ${sent}. Preskočeno: ${skipped}. Greške: ${failed}.`,
  };
}

function readMetadataString(
  metadata: unknown,
  key: string
): string | null {
  if (
    typeof metadata !== "object" ||
    metadata === null ||
    Array.isArray(metadata)
  ) {
    return null;
  }

  const value =
    (metadata as Record<string, unknown>)[key];

  return typeof value === "string"
    ? value
    : null;
}

function getKindFromTemplate(
  templateKey: string
): BookingReminderKind | null {
  if (
    templateKey ===
    REMINDER_TEMPLATE_KEYS["24h"]
  ) {
    return "24h";
  }

  if (
    templateKey ===
    REMINDER_TEMPLATE_KEYS["2h"]
  ) {
    return "2h";
  }

  return null;
}

export async function retryReminderNotificationDeliverySafely(
  deliveryId: string,
  businessId: string
): Promise<BookingReminderRetryResult> {
  try {
    const supabase = createAdminClient();
    const deliveryResult = await supabase
      .from("notification_deliveries")
      .select(
        "id, business_id, booking_id, template_key, dedupe_key, status, metadata"
      )
      .eq("id", deliveryId)
      .eq("business_id", businessId)
      .maybeSingle();

    if (deliveryResult.error) {
      return {
        ok: false,
        message:
          "Notifikacija trenutno ne može da se učita.",
      };
    }

    if (!deliveryResult.data) {
      return {
        ok: false,
        message:
          "Notifikacija nije pronađena.",
      };
    }

    const delivery =
      deliveryResult.data as unknown as ReminderDeliveryRow;
    const kind = getKindFromTemplate(
      delivery.template_key
    );

    if (!kind) {
      return {
        ok: false,
        message:
          "Izabrana notifikacija nije podsetnik.",
      };
    }

    if (
      delivery.status !== "failed" &&
      delivery.status !== "skipped"
    ) {
      return {
        ok: false,
        message:
          "Samo neuspešno ili preskočeno slanje može biti ponovljeno.",
      };
    }

    if (!delivery.booking_id) {
      return {
        ok: false,
        message:
          "Podsetnik više nije povezan sa rezervacijom.",
      };
    }

    const context =
      await loadSingleReminderContext(
        delivery.booking_id
      );

    if (!context) {
      return {
        ok: false,
        message:
          "Rezervacija više ne postoji.",
      };
    }

    const scheduledStartsAt =
      readMetadataString(
        delivery.metadata,
        "scheduledStartsAt"
      );

    if (
      scheduledStartsAt &&
      scheduledStartsAt !==
        context.booking.starts_at
    ) {
      return {
        ok: false,
        message:
          "Termin je u međuvremenu pomeren. Stari podsetnik nije ponovo poslat.",
      };
    }

    const result = await sendReminder(
      context,
      kind,
      delivery.dedupe_key
    );

    return {
      ok:
        result.ok &&
        result.status === "sent",
      message:
        result.ok &&
        result.status === "sent"
          ? "Podsetnik je uspešno poslat."
          : result.message,
    };
  } catch (error) {
    console.error(
      "Reminder delivery retry failed:",
      {
        deliveryId,
        businessId,
        error,
      }
    );

    return {
      ok: false,
      message:
        "Podsetnik trenutno nije moguće ponovo poslati.",
    };
  }
}

export function isReminderTemplateKey(
  templateKey: string
): boolean {
  return (
    templateKey ===
      REMINDER_TEMPLATE_KEYS["24h"] ||
    templateKey ===
      REMINDER_TEMPLATE_KEYS["2h"]
  );
}
