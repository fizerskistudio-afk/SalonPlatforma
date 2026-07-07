import "server-only";

import { requireStaff } from "@/lib/auth/staff";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  StaffApprovedTimeOff,
  StaffBooking,
  StaffBookingStatus,
  StaffDashboardData,
  StaffScheduleDay,
  StaffTimeOffRequest,
  StaffTimeOffRequestStatus,
} from "@/lib/staff/types";
import type { LocalizedText } from "@/lib/types";

type BookingRow = {
  id: string;
  reference_code: string;
  service_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  status: StaffBookingStatus;
};

type ServiceRow = {
  id: string;
  name: LocalizedText;
};

type WorkingHoursRow = {
  employee_id: string | null;
  day_of_week: number;
  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;
};

type TimeOffRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
};

type RequestRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string;
  status: StaffTimeOffRequestStatus;
  review_note: string | null;
  created_at: string;
};

const DAYS = [
  {
    value: 1,
    label: "Ponedeljak",
    shortLabel: "Pon",
  },
  {
    value: 2,
    label: "Utorak",
    shortLabel: "Uto",
  },
  {
    value: 3,
    label: "Sreda",
    shortLabel: "Sre",
  },
  {
    value: 4,
    label: "Četvrtak",
    shortLabel: "Čet",
  },
  {
    value: 5,
    label: "Petak",
    shortLabel: "Pet",
  },
  {
    value: 6,
    label: "Subota",
    shortLabel: "Sub",
  },
  {
    value: 0,
    label: "Nedelja",
    shortLabel: "Ned",
  },
] as const;

function getLocalizedText(
  value: LocalizedText | null
): string {
  if (!value) {
    return "Nepoznata usluga";
  }

  return (
    value.en ||
    value.mk ||
    value.sq ||
    "Nepoznata usluga"
  );
}

function normalizeTime(
  value: string | null
): string | null {
  return value
    ? value.slice(0, 5)
    : null;
}

export async function getStaffDashboardData():
  Promise<StaffDashboardData> {
  const staff =
    await requireStaff();

  const adminClient =
    createAdminClient();

  const now = new Date();

  const bookingStart =
    new Date(
      now.getTime() -
        7 * 24 * 60 * 60 * 1000
    ).toISOString();

  const bookingEnd =
    new Date(
      now.getTime() +
        60 * 24 * 60 * 60 * 1000
    ).toISOString();

  const [
    bookingResult,
    hoursResult,
    timeOffResult,
    requestResult,
  ] = await Promise.all([
    adminClient
      .from("bookings")
      .select(
        [
          "id",
          "reference_code",
          "service_id",
          "customer_name",
          "customer_phone",
          "customer_email",
          "starts_at",
          "ends_at",
          "duration_minutes",
          "status",
        ].join(", ")
      )
      .eq(
        "business_id",
        staff.business.id
      )
      .eq(
        "employee_id",
        staff.employee.id
      )
      .gte(
        "starts_at",
        bookingStart
      )
      .lte(
        "starts_at",
        bookingEnd
      )
      .order(
        "starts_at",
        {
          ascending: true,
        }
      ),

    adminClient
      .from("working_hours")
      .select(
        "employee_id, day_of_week, is_closed, open_time, close_time"
      )
      .eq(
        "business_id",
        staff.business.id
      )
      .or(
        `employee_id.is.null,employee_id.eq.${staff.employee.id}`
      ),

    adminClient
      .from("time_off")
      .select(
        "id, starts_at, ends_at, reason"
      )
      .eq(
        "business_id",
        staff.business.id
      )
      .eq(
        "employee_id",
        staff.employee.id
      )
      .gte(
        "ends_at",
        now.toISOString()
      )
      .order(
        "starts_at",
        {
          ascending: true,
        }
      )
      .limit(20),

    adminClient
      .from(
        "staff_time_off_requests"
      )
      .select(
        "id, starts_at, ends_at, reason, status, review_note, created_at"
      )
      .eq(
        "business_id",
        staff.business.id
      )
      .eq(
        "member_id",
        staff.membership.id
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(20),
  ]);

  if (bookingResult.error) {
    throw new Error(
      `Staff rezervacije nisu učitane: ${bookingResult.error.message}`
    );
  }

  if (hoursResult.error) {
    throw new Error(
      `Staff raspored nije učitan: ${hoursResult.error.message}`
    );
  }

  if (timeOffResult.error) {
    throw new Error(
      `Odsustva nisu učitana: ${timeOffResult.error.message}`
    );
  }

  if (requestResult.error) {
    throw new Error(
      `Zahtevi za odsustvo nisu učitani: ${requestResult.error.message}`
    );
  }

  const bookingRows =
    (bookingResult.data ??
      []) as unknown as BookingRow[];

  const serviceIds = [
    ...new Set(
      bookingRows.map(
        (booking) =>
          booking.service_id
      )
    ),
  ];

  const serviceNameById =
    new Map<string, string>();

  if (serviceIds.length > 0) {
    const {
      data: serviceData,
      error: serviceError,
    } = await adminClient
      .from("services")
      .select("id, name")
      .eq(
        "business_id",
        staff.business.id
      )
      .in("id", serviceIds);

    if (serviceError) {
      throw new Error(
        `Usluge nisu učitane: ${serviceError.message}`
      );
    }

    const serviceRows =
      (serviceData ??
        []) as unknown as ServiceRow[];

    for (const service of serviceRows) {
      serviceNameById.set(
        service.id,
        getLocalizedText(service.name)
      );
    }
  }

  const bookings: StaffBooking[] =
    bookingRows.map((booking) => ({
      id: booking.id,
      referenceCode:
        booking.reference_code,
      customerName:
        booking.customer_name,
      customerPhone:
        booking.customer_phone,
      customerEmail:
        booking.customer_email,
      serviceName:
        serviceNameById.get(
          booking.service_id
        ) ?? "Nepoznata usluga",
      startsAt:
        booking.starts_at,
      endsAt:
        booking.ends_at,
      durationMinutes:
        booking.duration_minutes,
      status:
        booking.status,
    }));

  const hoursRows =
    (hoursResult.data ??
      []) as unknown as WorkingHoursRow[];

  const businessHours =
    new Map<number, WorkingHoursRow>();

  const employeeHours =
    new Map<number, WorkingHoursRow>();

  for (const row of hoursRows) {
    if (row.employee_id) {
      employeeHours.set(
        row.day_of_week,
        row
      );
    } else {
      businessHours.set(
        row.day_of_week,
        row
      );
    }
  }

  const schedule: StaffScheduleDay[] =
    DAYS.map((day) => {
      const employeeRule =
        employeeHours.get(
          day.value
        );

      const businessRule =
        businessHours.get(
          day.value
        );

      const rule =
        employeeRule ??
        businessRule ??
        null;

      return {
        dayOfWeek:
          day.value,
        label:
          day.label,
        shortLabel:
          day.shortLabel,

        isClosed:
          rule?.is_closed ??
          true,

        openTime:
          normalizeTime(
            rule?.open_time ??
              null
          ),

        closeTime:
          normalizeTime(
            rule?.close_time ??
              null
          ),

        source:
          employeeRule
            ? "employee"
            : businessRule
              ? "business"
              : "missing",
      };
    });

  const approvedTimeOff: StaffApprovedTimeOff[] =
    (
      (timeOffResult.data ??
        []) as unknown as TimeOffRow[]
    ).map((item) => ({
      id: item.id,
      startsAt:
        item.starts_at,
      endsAt:
        item.ends_at,
      reason:
        item.reason,
    }));

  const timeOffRequests: StaffTimeOffRequest[] =
    (
      (requestResult.data ??
        []) as unknown as RequestRow[]
    ).map((request) => ({
      id: request.id,
      startsAt:
        request.starts_at,
      endsAt:
        request.ends_at,
      reason:
        request.reason,
      status:
        request.status,
      reviewNote:
        request.review_note,
      createdAt:
        request.created_at,
    }));

  return {
    business:
      staff.business,

    employee:
      staff.employee,

    bookings,
    schedule,
    approvedTimeOff,
    timeOffRequests,
  };
}
