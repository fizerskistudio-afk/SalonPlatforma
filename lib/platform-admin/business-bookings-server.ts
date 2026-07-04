import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  BusinessBookingEmployeeOption,
  BusinessBookingListItem,
  BusinessBookingManagementData,
  BusinessBookingSource,
  BusinessBookingStatus,
} from "@/lib/platform-admin/business-bookings";

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  default_locale: string;
};

type BookingRow = {
  id: string;
  reference_code: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  customer_note: string | null;
  service_id: string;
  employee_id: string;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  price_amount: number | string;
  currency: string;
  status: BusinessBookingStatus;
  source: BusinessBookingSource;
  internal_note: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  google_event_id: string | null;
  google_sync_status: string | null;
  google_sync_error: string | null;
  created_at: string;
  updated_at: string;
};

type ServiceRow = {
  id: string;
  name: unknown;
};

type EmployeeRow = {
  id: string;
  name: string;
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getLocalizedValue(
  value: unknown,
  preferredLocale: string
): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (!isRecord(value)) {
    return "";
  }

  const localeOrder = [
    preferredLocale,
    "sr-Latn",
    "sr-Cyrl",
    "en",
    "mk",
    "sq",
    "de",
  ];

  for (const locale of localeOrder) {
    const candidate = value[locale];

    if (
      typeof candidate === "string" &&
      candidate.trim().length > 0
    ) {
      return candidate.trim();
    }
  }

  for (const candidate of Object.values(value)) {
    if (
      typeof candidate === "string" &&
      candidate.trim().length > 0
    ) {
      return candidate.trim();
    }
  }

  return "";
}

function toNumber(value: number | string): number {
  const parsed =
    typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

export async function loadBusinessBookingManagementData(
  rawBusinessSlug: string
): Promise<BusinessBookingManagementData | null> {
  const businessSlug = rawBusinessSlug
    .trim()
    .toLowerCase();

  if (!BUSINESS_SLUG_PATTERN.test(businessSlug)) {
    return null;
  }

  const supabase = createAdminClient();
  const generatedAt = new Date().toISOString();

  const {
    data: businessData,
    error: businessError,
  } = await supabase
    .from("businesses")
    .select("id, slug, name, timezone, default_locale")
    .eq("slug", businessSlug)
    .maybeSingle();

  if (businessError) {
    console.error(
      "Failed to load business for platform booking management:",
      businessError
    );
    throw new Error("Salon nije moguće učitati iz baze.");
  }

  if (!businessData) {
    return null;
  }

  const business = businessData as unknown as BusinessRow;

  const [bookingsResult, employeesResult] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        [
          "id",
          "reference_code",
          "customer_name",
          "customer_phone",
          "customer_email",
          "customer_note",
          "service_id",
          "employee_id",
          "starts_at",
          "ends_at",
          "duration_minutes",
          "price_amount",
          "currency",
          "status",
          "source",
          "internal_note",
          "cancellation_reason",
          "cancelled_at",
          "google_event_id",
          "google_sync_status",
          "google_sync_error",
          "created_at",
          "updated_at",
        ].join(", ")
      )
      .eq("business_id", business.id)
      .order("starts_at", { ascending: false })
      .limit(500),
    supabase
      .from("employees")
      .select("id, name")
      .eq("business_id", business.id)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  if (bookingsResult.error || employeesResult.error) {
    console.error(
      "Failed to load platform booking management data:",
      bookingsResult.error,
      employeesResult.error
    );
    throw new Error("Rezervacije trenutno nije moguće učitati.");
  }

  const bookingRows =
    (bookingsResult.data ?? []) as unknown as BookingRow[];
  const employeeRows =
    (employeesResult.data ?? []) as unknown as EmployeeRow[];

  const serviceIds = [
    ...new Set(bookingRows.map((booking) => booking.service_id)),
  ];

  let serviceRows: ServiceRow[] = [];

  if (serviceIds.length > 0) {
    const { data, error } = await supabase
      .from("services")
      .select("id, name")
      .eq("business_id", business.id)
      .in("id", serviceIds);

    if (error) {
      console.error(
        "Failed to load services for platform booking management:",
        error
      );
      throw new Error("Nazivi usluga trenutno nisu dostupni.");
    }

    serviceRows = (data ?? []) as unknown as ServiceRow[];
  }

  const servicesById = new Map(
    serviceRows.map((service) => [service.id, service] as const)
  );
  const employeesById = new Map(
    employeeRows.map((employee) => [employee.id, employee] as const)
  );

  const bookings: BusinessBookingListItem[] = bookingRows.map(
    (booking) => ({
      id: booking.id,
      referenceCode: booking.reference_code,
      customerName: booking.customer_name,
      customerPhone: booking.customer_phone,
      customerEmail: booking.customer_email,
      customerNote: booking.customer_note,
      serviceId: booking.service_id,
      serviceName:
        getLocalizedValue(
          servicesById.get(booking.service_id)?.name,
          business.default_locale
        ) || "Nepoznata usluga",
      employeeId: booking.employee_id,
      employeeName:
        employeesById.get(booking.employee_id)?.name ??
        "Nepoznati zaposleni",
      startsAt: booking.starts_at,
      endsAt: booking.ends_at,
      durationMinutes: booking.duration_minutes,
      priceAmount: toNumber(booking.price_amount),
      currency: booking.currency.trim(),
      status: booking.status,
      source: booking.source,
      internalNote: booking.internal_note,
      cancellationReason: booking.cancellation_reason,
      cancelledAt: booking.cancelled_at,
      googleEventId: booking.google_event_id,
      googleSyncStatus: booking.google_sync_status,
      googleSyncError: booking.google_sync_error,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
    })
  );

  const employees: BusinessBookingEmployeeOption[] =
    employeeRows.map((employee) => ({
      id: employee.id,
      name: employee.name,
    }));

  return {
    business: {
      id: business.id,
      slug: business.slug,
      name: business.name,
      timezone: business.timezone,
      defaultLocale: business.default_locale,
    },
    generatedAt,
    employees,
    bookings,
  };
}
