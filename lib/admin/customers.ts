import "server-only";

import type {
  BookingSource,
  BookingStatus,
} from "@/lib/admin/bookings";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LocalizedText } from "@/lib/types";

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
};

type CustomerRow = {
  id: string;
  business_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  last_booking_at: string | null;
  created_at: string;
  updated_at: string;
};

type BookingRow = {
  id: string;
  reference_code: string;
  business_id: string;
  customer_id: string | null;
  service_id: string;
  employee_id: string;
  customer_note: string | null;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  price_amount: number | string;
  currency: string;
  status: BookingStatus;
  source: BookingSource;
  internal_note: string | null;
  created_at: string;
};

type ServiceRow = {
  id: string;
  name: LocalizedText;
};

type EmployeeRow = {
  id: string;
  name: string;
};

export type AdminCustomerSpend = {
  currency: string;
  amount: number;
};

export type AdminCustomerBooking = {
  id: string;
  referenceCode: string;

  serviceId: string;
  serviceName: LocalizedText | null;

  employeeId: string;
  employeeName: string | null;

  startsAt: string;
  endsAt: string;
  durationMinutes: number;

  priceAmount: number;
  currency: string;

  status: BookingStatus;
  source: BookingSource;

  customerNote: string | null;
  internalNote: string | null;
  createdAt: string;
};

export type AdminCustomerListItem = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  notes: string | null;

  storedLastBookingAt: string | null;
  latestBookingAt: string | null;
  lastVisitAt: string | null;
  nextBookingAt: string | null;

  createdAt: string;
  updatedAt: string;

  metrics: {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    noShowBookings: number;
  };

  spending: AdminCustomerSpend[];
  bookings: AdminCustomerBooking[];
};

export type AdminCustomersResult = {
  business: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
  };

  customers: AdminCustomerListItem[];
};

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

function normalizeCurrency(
  value: string
): string {
  return value.trim().toUpperCase();
}

function mapBooking(
  booking: BookingRow,
  servicesById: Map<string, ServiceRow>,
  employeesById: Map<string, EmployeeRow>
): AdminCustomerBooking {
  const service = servicesById.get(
    booking.service_id
  );

  const employee = employeesById.get(
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
      normalizeCurrency(
        booking.currency
      ),

    status:
      booking.status,
    source:
      booking.source,

    customerNote:
      booking.customer_note,
    internalNote:
      booking.internal_note,

    createdAt:
      booking.created_at,
  };
}

export async function getAdminCustomers(): Promise<AdminCustomersResult> {
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
      "id, name, slug, timezone"
    )
    .eq(
      "id",
      admin.business.id
    )
    .single();

  if (
    businessError ||
    !businessData
  ) {
    throw new Error(
      `Unable to load CRM business: ${
        businessError?.message ??
        "Business was not found."
      }`
    );
  }

  const business =
    businessData as unknown as BusinessRow;

  const {
    data: customerData,
    error: customerError,
  } = await adminClient
    .from("customers")
    .select(
      [
        "id",
        "business_id",
        "full_name",
        "phone",
        "email",
        "notes",
        "last_booking_at",
        "created_at",
        "updated_at",
      ].join(", ")
    )
    .eq(
      "business_id",
      admin.business.id
    )
    .order("full_name", {
      ascending: true,
    })
    .limit(500);

  if (customerError) {
    throw new Error(
      `Unable to load customers: ${customerError.message}`
    );
  }

  const customerRows =
    (customerData ??
      []) as unknown as CustomerRow[];

  if (
    customerRows.length === 0
  ) {
    return {
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        timezone:
          business.timezone,
      },

      customers: [],
    };
  }

  const customerIds =
    customerRows.map(
      (customer) =>
        customer.id
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
        "business_id",
        "customer_id",
        "service_id",
        "employee_id",
        "customer_note",
        "starts_at",
        "ends_at",
        "duration_minutes",
        "price_amount",
        "currency",
        "status",
        "source",
        "internal_note",
        "created_at",
      ].join(", ")
    )
    .eq(
      "business_id",
      admin.business.id
    )
    .in(
      "customer_id",
      customerIds
    )
    .order("starts_at", {
      ascending: false,
    })
    .limit(5000);

  if (bookingError) {
    throw new Error(
      `Unable to load customer bookings: ${bookingError.message}`
    );
  }

  const bookingRows =
    (bookingData ??
      []) as unknown as BookingRow[];

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

  let serviceRows: ServiceRow[] = [];

  if (
    serviceIds.length > 0
  ) {
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
      .in(
        "id",
        serviceIds
      );

    if (serviceError) {
      throw new Error(
        `Unable to load CRM services: ${serviceError.message}`
      );
    }

    serviceRows =
      (serviceData ??
        []) as unknown as ServiceRow[];
  }

  let employeeRows: EmployeeRow[] =
    [];

  if (
    employeeIds.length > 0
  ) {
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
      .in(
        "id",
        employeeIds
      );

    if (employeeError) {
      throw new Error(
        `Unable to load CRM employees: ${employeeError.message}`
      );
    }

    employeeRows =
      (employeeData ??
        []) as unknown as EmployeeRow[];
  }

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

  const bookingsByCustomerId =
    new Map<
      string,
      AdminCustomerBooking[]
    >();

  bookingRows.forEach(
    (booking) => {
      if (!booking.customer_id) {
        return;
      }

      const mappedBooking =
        mapBooking(
          booking,
          servicesById,
          employeesById
        );

      const existingBookings =
        bookingsByCustomerId.get(
          booking.customer_id
        ) ?? [];

      existingBookings.push(
        mappedBooking
      );

      bookingsByCustomerId.set(
        booking.customer_id,
        existingBookings
      );
    }
  );

  const nowTimestamp =
    Date.now();

  const customers =
    customerRows.map(
      (
        customer
      ): AdminCustomerListItem => {
        const customerBookings = [
          ...(bookingsByCustomerId.get(
            customer.id
          ) ?? []),
        ].sort(
          (
            first,
            second
          ) =>
            new Date(
              second.startsAt
            ).getTime() -
            new Date(
              first.startsAt
            ).getTime()
        );

        const metrics = {
          totalBookings:
            customerBookings.length,

          pendingBookings:
            customerBookings.filter(
              (booking) =>
                booking.status ===
                "pending"
            ).length,

          confirmedBookings:
            customerBookings.filter(
              (booking) =>
                booking.status ===
                "confirmed"
            ).length,

          completedBookings:
            customerBookings.filter(
              (booking) =>
                booking.status ===
                "completed"
            ).length,

          cancelledBookings:
            customerBookings.filter(
              (booking) =>
                booking.status ===
                "cancelled"
            ).length,

          noShowBookings:
            customerBookings.filter(
              (booking) =>
                booking.status ===
                "no_show"
            ).length,
        };

        const lastVisit =
          customerBookings.find(
            (booking) =>
              booking.status ===
                "completed" &&
              new Date(
                booking.startsAt
              ).getTime() <=
                nowTimestamp
          );

        const nextBooking =
          [...customerBookings]
            .filter(
              (booking) =>
                new Date(
                  booking.startsAt
                ).getTime() >=
                  nowTimestamp &&
                (booking.status ===
                  "pending" ||
                  booking.status ===
                    "confirmed")
            )
            .sort(
              (
                first,
                second
              ) =>
                new Date(
                  first.startsAt
                ).getTime() -
                new Date(
                  second.startsAt
                ).getTime()
            )[0];

        const spendingByCurrency =
          new Map<
            string,
            number
          >();

        customerBookings
          .filter(
            (booking) =>
              booking.status ===
              "completed"
          )
          .forEach(
            (booking) => {
              const currentAmount =
                spendingByCurrency.get(
                  booking.currency
                ) ?? 0;

              spendingByCurrency.set(
                booking.currency,
                currentAmount +
                  booking.priceAmount
              );
            }
          );

        const spending =
          Array.from(
            spendingByCurrency.entries()
          )
            .map(
              ([
                currency,
                amount,
              ]) => ({
                currency,
                amount,
              })
            )
            .sort(
              (
                first,
                second
              ) =>
                second.amount -
                first.amount
            );

        return {
          id: customer.id,

          fullName:
            customer.full_name,
          phone:
            customer.phone,
          email:
            customer.email,
          notes:
            customer.notes,

          storedLastBookingAt:
            customer.last_booking_at,

          latestBookingAt:
            customerBookings[0]
              ?.startsAt ?? null,

          lastVisitAt:
            lastVisit?.startsAt ??
            null,

          nextBookingAt:
            nextBooking?.startsAt ??
            null,

          createdAt:
            customer.created_at,

          updatedAt:
            customer.updated_at,

          metrics,
          spending,
          bookings:
            customerBookings,
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
    },

    customers,
  };
}