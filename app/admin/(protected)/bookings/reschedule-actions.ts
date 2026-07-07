"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireAdmin,
} from "@/lib/auth/admin";
import {
  syncBookingToAllGoogleCalendars,
} from "@/lib/google-calendar/dual-sync";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

export type AdminRescheduleSlot = {
  employeeId: string;
  employeeName: string;
  startsAt: string;
  endsAt: string;
};

export type GetAdminRescheduleSlotsInput = {
  bookingId: string;
  date: string;
  employeeId?: string | null;
};

export type GetAdminRescheduleSlotsResult = {
  ok: boolean;
  message: string;
  timezone?: string;
  slots: AdminRescheduleSlot[];
};

export type RescheduleAdminBookingInput = {
  bookingId: string;
  employeeId: string;
  startsAt: string;
};

export type RescheduleAdminBookingResult = {
  ok: boolean;
  message: string;

  booking?: {
    id: string;
    referenceCode: string;
    status: string;

    serviceId: string;
    employeeId: string;

    startsAt: string;
    endsAt: string;

    durationMinutes: number;

    googleEventId: string | null;
    googleSyncStatus: string | null;
  };
};

type BookingContextRow = {
  id: string;
  business_id: string;
  service_id: string;
  status: string;
};

type BusinessTimezoneRow = {
  id: string;
  timezone: string;
};

type AvailableSlotRow = {
  employee_id: string;
  employee_name: string;
  starts_at: string;
  ends_at: string;
};

type RescheduledBookingRow = {
  id: string;
  reference_code: string;
  status: string;

  service_id: string;
  employee_id: string;

  starts_at: string;
  ends_at: string;

  duration_minutes: number;

  google_event_id: string | null;
  google_sync_status: string | null;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}$/;

function isUuid(
  value: string
): boolean {
  return UUID_PATTERN.test(
    value
  );
}

function isValidDateString(
  value: string
): boolean {
  if (
    !DATE_PATTERN.test(value)
  ) {
    return false;
  }

  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  const parsedDate =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  return (
    parsedDate.getUTCFullYear() ===
      year &&
    parsedDate.getUTCMonth() ===
      month - 1 &&
    parsedDate.getUTCDate() ===
      day
  );
}

function refreshBookingPages(): void {
  revalidatePath("/admin");

  revalidatePath(
    "/admin/bookings"
  );
}

function getDatabaseErrorText(
  error: {
    message?: string | null;
    details?: string | null;
    hint?: string | null;
    code?: string | null;
  }
): string {
  return [
    error.message,
    error.details,
    error.hint,
    error.code,
  ]
    .filter(
      (
        value
      ): value is string =>
        typeof value ===
          "string"
    )
    .join(" ")
    .toUpperCase();
}

function getRescheduleErrorMessage(
  error: {
    message?: string | null;
    details?: string | null;
    hint?: string | null;
    code?: string | null;
  }
): string {
  const errorText =
    getDatabaseErrorText(
      error
    );

  if (
    error.code === "23P01" ||
    errorText.includes(
      "SLOT_UNAVAILABLE"
    )
  ) {
    return "Izabrani termin više nije dostupan. Izaberi drugi termin.";
  }

  if (
    errorText.includes(
      "BOOKING_NOT_FOUND"
    )
  ) {
    return "Rezervacija nije pronađena.";
  }

  if (
    errorText.includes(
      "BOOKING_NOT_RESCHEDULABLE"
    )
  ) {
    return "Ovu rezervaciju više nije moguće pomeriti.";
  }

  if (
    errorText.includes(
      "INVALID_EMPLOYEE"
    )
  ) {
    return "Izabrani zaposleni nije ispravan.";
  }

  if (
    errorText.includes(
      "INVALID_START_TIME"
    )
  ) {
    return "Izabrano vreme nije ispravno.";
  }

  if (
    errorText.includes(
      "INVALID_BUSINESS"
    )
  ) {
    return "Aktivan salon nije pronađen.";
  }

  return "Termin rezervacije nije promenjen. Pokušaj ponovo.";
}

async function synchronizeRescheduledBookingSafely(
  bookingId: string
): Promise<boolean> {
  try {
    const syncResult =
      await syncBookingToAllGoogleCalendars(
        bookingId
      );

    if (!syncResult.ok) {
      console.error(
        "Booking was rescheduled, but Google Calendar synchronization failed:",
        {
          bookingId,

          action:
            syncResult.action,

          message:
            syncResult.message,
        }
      );

      return false;
    }

    console.info(
      "Rescheduled booking synchronized with Google Calendar:",
      {
        bookingId,

        action:
          syncResult.action,

        eventId:
          syncResult.eventId ??
          null,
      }
    );

    return true;
  } catch (error) {
    /*
     * Google greška nikada ne sme da poništi
     * uspešno pomeranje rezervacije u bazi.
     */
    console.error(
      "Unexpected Google Calendar error after booking reschedule:",
      {
        bookingId,
        error,
      }
    );

    return false;
  }
}

export async function getAdminRescheduleSlotsAction(
  input: GetAdminRescheduleSlotsInput
): Promise<GetAdminRescheduleSlotsResult> {
  const admin =
    await requireAdmin();

  const bookingId =
    input.bookingId.trim();

  const date =
    input.date.trim();

  const employeeId =
    input.employeeId?.trim() ||
    null;

  if (!isUuid(bookingId)) {
    return {
      ok: false,
      message:
        "Rezervacija nema ispravan ID.",
      slots: [],
    };
  }

  if (
    !isValidDateString(date)
  ) {
    return {
      ok: false,
      message:
        "Izabrani datum nije ispravan.",
      slots: [],
    };
  }

  if (
    employeeId &&
    !isUuid(employeeId)
  ) {
    return {
      ok: false,
      message:
        "Izabrani zaposleni nema ispravan ID.",
      slots: [],
    };
  }

  const adminClient =
    createAdminClient();

  const [
    bookingResult,
    businessResult,
  ] = await Promise.all([
    adminClient
      .from("bookings")
      .select(
        `
          id,
          business_id,
          service_id,
          status
        `
      )
      .eq(
        "id",
        bookingId
      )
      .eq(
        "business_id",
        admin.business.id
      )
      .maybeSingle(),

    adminClient
      .from("businesses")
      .select(
        "id, timezone"
      )
      .eq(
        "id",
        admin.business.id
      )
      .eq(
        "is_active",
        true
      )
      .maybeSingle(),
  ]);

  if (
    bookingResult.error
  ) {
    console.error(
      "Unable to load booking before reschedule availability query:",
      bookingResult.error
    );

    return {
      ok: false,
      message:
        "Rezervacija trenutno ne može da se učita.",
      slots: [],
    };
  }

  if (
    !bookingResult.data
  ) {
    return {
      ok: false,
      message:
        "Rezervacija nije pronađena ili nemaš dozvolu da je menjaš.",
      slots: [],
    };
  }

  if (
    businessResult.error ||
    !businessResult.data
  ) {
    console.error(
      "Unable to load business timezone before reschedule availability query:",
      businessResult.error
    );

    return {
      ok: false,
      message:
        "Podešavanja salona trenutno ne mogu da se učitaju.",
      slots: [],
    };
  }

  const booking =
    bookingResult
      .data as unknown as BookingContextRow;

  const business =
    businessResult
      .data as unknown as BusinessTimezoneRow;

  if (
    booking.status !==
      "pending" &&
    booking.status !==
      "confirmed"
  ) {
    return {
      ok: false,
      message:
        "Samo pending i confirmed rezervacije mogu da se pomeraju.",
      timezone:
        business.timezone,
      slots: [],
    };
  }

  const {
    data,
    error,
  } =
    await adminClient.rpc(
      "get_admin_available_slots",
      {
        p_business_id:
          admin.business.id,

        p_service_id:
          booking.service_id,

        p_date:
          date,

        p_employee_id:
          employeeId,

        p_exclude_booking_id:
          booking.id,
      }
    );

  if (error) {
    console.error(
      "Unable to calculate admin reschedule slots:",
      error
    );

    return {
      ok: false,
      message:
        getRescheduleErrorMessage(
          error
        ),
      timezone:
        business.timezone,
      slots: [],
    };
  }

  const rows =
    (data ??
      []) as unknown as AvailableSlotRow[];

  const slots =
    rows.map(
      (
        row
      ): AdminRescheduleSlot => ({
        employeeId:
          row.employee_id,

        employeeName:
          row.employee_name,

        startsAt:
          row.starts_at,

        endsAt:
          row.ends_at,
      })
    );

  return {
    ok: true,

    message:
      slots.length > 0
        ? "Slobodni termini su učitani."
        : "Za izabrani datum nema slobodnih termina.",

    timezone:
      business.timezone,

    slots,
  };
}

export async function rescheduleAdminBookingAction(
  input: RescheduleAdminBookingInput
): Promise<RescheduleAdminBookingResult> {
  const admin =
    await requireAdmin();

  const bookingId =
    input.bookingId.trim();

  const employeeId =
    input.employeeId.trim();

  const startsAt =
    input.startsAt.trim();

  if (!isUuid(bookingId)) {
    return {
      ok: false,
      message:
        "Rezervacija nema ispravan ID.",
    };
  }

  if (!isUuid(employeeId)) {
    return {
      ok: false,
      message:
        "Izabrani zaposleni nema ispravan ID.",
    };
  }

  if (
    !startsAt ||
    Number.isNaN(
      Date.parse(startsAt)
    )
  ) {
    return {
      ok: false,
      message:
        "Izabrano vreme nije ispravno.",
    };
  }

  const adminClient =
    createAdminClient();

  const {
    data,
    error,
  } =
    await adminClient.rpc(
      "reschedule_admin_booking",
      {
        p_business_id:
          admin.business.id,

        p_booking_id:
          bookingId,

        p_employee_id:
          employeeId,

        p_starts_at:
          new Date(
            startsAt
          ).toISOString(),
      }
    );

  if (error) {
    console.error(
      "Unable to reschedule admin booking:",
      error
    );

    return {
      ok: false,
      message:
        getRescheduleErrorMessage(
          error
        ),
    };
  }

  const rows =
    (data ??
      []) as unknown as RescheduledBookingRow[];

  const updatedBooking =
    rows[0];

  if (!updatedBooking) {
    return {
      ok: false,
      message:
        "Rezervacija nije promenjena jer baza nije vratila rezultat.",
    };
  }

  let calendarSyncSucceeded =
    true;

  if (
    updatedBooking.status ===
    "confirmed"
  ) {
    calendarSyncSucceeded =
      await synchronizeRescheduledBookingSafely(
        updatedBooking.id
      );
  }

  refreshBookingPages();

  return {
    ok: true,

    message:
      calendarSyncSucceeded
        ? "Termin rezervacije je uspešno promenjen."
        : "Termin rezervacije je promenjen, ali Google Calendar trenutno nije sinhronizovan.",

    booking: {
      id:
        updatedBooking.id,

      referenceCode:
        updatedBooking.reference_code,

      status:
        updatedBooking.status,

      serviceId:
        updatedBooking.service_id,

      employeeId:
        updatedBooking.employee_id,

      startsAt:
        updatedBooking.starts_at,

      endsAt:
        updatedBooking.ends_at,

      durationMinutes:
        updatedBooking.duration_minutes,

      googleEventId:
        updatedBooking.google_event_id,

      googleSyncStatus:
        updatedBooking.google_sync_status,
    },
  };
}