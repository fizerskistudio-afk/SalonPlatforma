import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import {
  isLocaleCode,
  normalizeLocaleList,
  type LocaleCode,
} from "@/lib/i18n/locales";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LocalizedText } from "@/lib/types";

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;

export type BookingStatus =
  (typeof BOOKING_STATUSES)[number];

export const BOOKING_SOURCES = [
  "web",
  "admin",
  "phone",
  "walk_in",
] as const;

export type BookingSource =
  (typeof BOOKING_SOURCES)[number];

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  default_locale: string;
  supported_locales: unknown;
};

type BookingRow = {
  id: string;
  reference_code: string;
  public_token: string;
  business_id: string;
  service_id: string;
  employee_id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  customer_note: string | null;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  price_amount: number | string;
  currency: string;
  status: BookingStatus;
  source: BookingSource;
  internal_note: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

type ServiceRow = {
  id: string;
  name: LocalizedText;
};

type EmployeeRow = {
  id: string;
  name: string;
};

export type AdminBookingListItem = {
  id: string;
  referenceCode: string;

  serviceId: string;
  serviceName: LocalizedText | null;

  employeeId: string;
  employeeName: string | null;

  customerId: string | null;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  customerNote: string | null;

  startsAt: string;
  endsAt: string;
  durationMinutes: number;

  priceAmount: number;
  currency: string;

  status: BookingStatus;
  source: BookingSource;

  internalNote: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;

  createdAt: string;
  updatedAt: string;
};

export type AdminBookingsResult = {
  business: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
    defaultLocale: LocaleCode;
    supportedLocales: LocaleCode[];
  };

  bookings: AdminBookingListItem[];
};

function normalizeContentLocale(
  value: string
): LocaleCode {
  return isLocaleCode(value)
    ? value
    : "en";
}

function normalizeSupportedLocales(
  value: unknown,
  fallback: LocaleCode
): LocaleCode[] {
  const values =
    Array.isArray(value)
      ? value
      : [];

  const locales =
    normalizeLocaleList(
      values,
      fallback
    );

  if (!locales.includes(fallback)) {
    locales.unshift(fallback);
  }

  return locales;
}

function parsePriceAmount(
  value: number | string
): number {
  const parsedValue =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
}

export async function getAdminBookings(): Promise<AdminBookingsResult> {
  const admin =
    await requireAdmin();

  const adminClient =
    createAdminClient();

  const {
    data: businessData,
    error: businessError,
  } = await adminClient
    .from("businesses")
    .select(
      "id, name, slug, timezone, default_locale, supported_locales"
    )
    .eq("id", admin.business.id)
    .single();

  if (
    businessError ||
    !businessData
  ) {
    throw new Error(
      `Unable to load admin business: ${
        businessError?.message ??
        "Business was not found."
      }`
    );
  }

  const business =
    businessData as unknown as BusinessRow;

  const defaultLocale =
    normalizeContentLocale(
      business.default_locale
    );

  const supportedLocales =
    normalizeSupportedLocales(
      business.supported_locales,
      defaultLocale
    );

  const {
    data: bookingData,
    error: bookingError,
  } = await adminClient
    .from("bookings")
    .select(
      [
        "id",
        "reference_code",
        "public_token",
        "business_id",
        "service_id",
        "employee_id",
        "customer_id",
        "customer_name",
        "customer_phone",
        "customer_email",
        "customer_note",
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
        "created_at",
        "updated_at",
      ].join(", ")
    )
    .eq(
      "business_id",
      admin.business.id
    )
    .order("starts_at", {
      ascending: false,
    })
    .limit(250);

  if (bookingError) {
    throw new Error(
      `Unable to load bookings: ${bookingError.message}`
    );
  }

  const bookingRows =
    (bookingData ??
      []) as unknown as BookingRow[];

  if (bookingRows.length === 0) {
    return {
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        timezone:
          business.timezone,
        defaultLocale,
        supportedLocales,
      },

      bookings: [],
    };
  }

  const serviceIds = [
    ...new Set(
      bookingRows.map(
        (booking) =>
          booking.service_id
      )
    ),
  ];

  const employeeIds = [
    ...new Set(
      bookingRows.map(
        (booking) =>
          booking.employee_id
      )
    ),
  ];

  const {
    data: serviceData,
    error: serviceError,
  } = await adminClient
    .from("services")
    .select("id, name")
    .eq(
      "business_id",
      admin.business.id
    )
    .in("id", serviceIds);

  if (serviceError) {
    throw new Error(
      `Unable to load booking services: ${serviceError.message}`
    );
  }

  const {
    data: employeeData,
    error: employeeError,
  } = await adminClient
    .from("employees")
    .select("id, name")
    .eq(
      "business_id",
      admin.business.id
    )
    .in("id", employeeIds);

  if (employeeError) {
    throw new Error(
      `Unable to load booking employees: ${employeeError.message}`
    );
  }

  const serviceRows =
    (serviceData ??
      []) as unknown as ServiceRow[];

  const employeeRows =
    (employeeData ??
      []) as unknown as EmployeeRow[];

  const servicesById =
    new Map(
      serviceRows.map(
        (service) => [
          service.id,
          service,
        ]
      )
    );

  const employeesById =
    new Map(
      employeeRows.map(
        (employee) => [
          employee.id,
          employee,
        ]
      )
    );

  const bookings =
    bookingRows.map(
      (
        booking
      ): AdminBookingListItem => {
        const service =
          servicesById.get(
            booking.service_id
          );

        const employee =
          employeesById.get(
            booking.employee_id
          );

        return {
          id: booking.id,

          referenceCode:
            booking.reference_code,

          serviceId:
            booking.service_id,

          serviceName:
            service?.name ?? null,

          employeeId:
            booking.employee_id,

          employeeName:
            employee?.name ?? null,

          customerId:
            booking.customer_id,

          customerName:
            booking.customer_name,

          customerPhone:
            booking.customer_phone,

          customerEmail:
            booking.customer_email,

          customerNote:
            booking.customer_note,

          startsAt:
            booking.starts_at,

          endsAt:
            booking.ends_at,

          durationMinutes:
            booking.duration_minutes,

          priceAmount:
            parsePriceAmount(
              booking.price_amount
            ),

          currency:
            booking.currency.trim(),

          status:
            booking.status,

          source:
            booking.source,

          internalNote:
            booking.internal_note,

          cancellationReason:
            booking.cancellation_reason,

          cancelledAt:
            booking.cancelled_at,

          createdAt:
            booking.created_at,

          updatedAt:
            booking.updated_at,
        };
      }
    );

  return {
    business: {
      id: business.id,
      name: business.name,
      slug: business.slug,
      timezone:
        business.timezone,
      defaultLocale,
      supportedLocales,
    },

    bookings,
  };
}