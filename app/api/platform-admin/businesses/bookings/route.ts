import {
  type NextRequest,
  NextResponse,
} from "next/server";
import { revalidatePath } from "next/cache";

import { getPlatformAdminAccess } from "@/lib/auth/platform-admin";
import { syncBookingToAllGoogleCalendars } from "@/lib/google-calendar/dual-sync";
import {
  notifyBookingRescheduledSafely,
  notifyBookingStatusChangedSafely,
} from "@/lib/notifications/booking";
import {
  BUSINESS_BOOKING_STATUSES,
  getAllowedBusinessBookingStatuses,
  type BusinessBookingStatus,
} from "@/lib/platform-admin/business-bookings";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type RequestBody = {
  action?: unknown;
  businessSlug?: unknown;
  bookingId?: unknown;
  expectedUpdatedAt?: unknown;
  nextStatus?: unknown;
  cancellationReason?: unknown;
  internalNote?: unknown;
  date?: unknown;
  employeeId?: unknown;
  startsAt?: unknown;
};

type BookingContextRow = {
  id: string;
  business_id: string;
  service_id: string;
  employee_id: string;
  status: BusinessBookingStatus;
  updated_at: string;
};

type AvailableSlotRow = {
  employee_id: string;
  employee_name: string;
  starts_at: string;
  ends_at: string;
};

type RescheduledBookingRow = {
  id: string;
  status: BusinessBookingStatus;
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

function getString(value: unknown): string | null {
  return typeof value === "string" ? value.trim() : null;
}

function errorResponse(
  status: number,
  message: string,
  code: string
) {
  return NextResponse.json(
    { ok: false, message, code },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isBookingStatus(
  value: string
): value is BusinessBookingStatus {
  return BUSINESS_BOOKING_STATUSES.includes(
    value as BusinessBookingStatus
  );
}

function refreshBookingPages(businessSlug: string): void {
  revalidatePath(
    `/platform-admin/businesses/${businessSlug}`
  );
  revalidatePath(
    `/platform-admin/businesses/${businessSlug}/bookings`
  );
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
}

async function syncBookingSafely(
  bookingId: string
): Promise<boolean> {
  try {
    const result = await syncBookingToAllGoogleCalendars(bookingId);

    if (!result.ok) {
      console.error(
        "Platform booking update succeeded, but Google Calendar sync failed:",
        {
          bookingId,
          action: result.action,
          message: result.message,
        }
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "Unexpected Google Calendar sync error after platform booking update:",
      { bookingId, error }
    );
    return false;
  }
}

function getDatabaseErrorText(error: {
  message?: string | null;
  details?: string | null;
  hint?: string | null;
  code?: string | null;
}): string {
  return [error.message, error.details, error.hint, error.code]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toUpperCase();
}

function getRescheduleErrorMessage(error: {
  message?: string | null;
  details?: string | null;
  hint?: string | null;
  code?: string | null;
}): string {
  const text = getDatabaseErrorText(error);

  if (error.code === "23P01" || text.includes("SLOT_UNAVAILABLE")) {
    return "Izabrani termin više nije dostupan. Izaberi drugi termin.";
  }
  if (text.includes("BOOKING_NOT_FOUND")) {
    return "Rezervacija nije pronađena.";
  }
  if (text.includes("BOOKING_NOT_RESCHEDULABLE")) {
    return "Ovu rezervaciju više nije moguće pomeriti.";
  }
  if (text.includes("INVALID_EMPLOYEE")) {
    return "Izabrani zaposleni nije ispravan.";
  }
  if (text.includes("INVALID_START_TIME")) {
    return "Izabrano vreme nije ispravno.";
  }
  if (text.includes("INVALID_BUSINESS")) {
    return "Aktivan salon nije pronađen.";
  }

  return "Termin rezervacije nije promenjen. Pokušaj ponovo.";
}

async function authorizeRequest() {
  const access = await getPlatformAdminAccess(
    "tenant.bookings.write"
  );

  if (!("context" in access)) {
    return access.status === "unauthenticated"
      ? errorResponse(
          401,
          "Platform admin sesija nije aktivna.",
          "PLATFORM_ADMIN_UNAUTHENTICATED"
        )
      : errorResponse(
          403,
          "Nemaš dozvolu za upravljanje rezervacijama.",
          "PLATFORM_ADMIN_FORBIDDEN"
        );
  }

  return null;
}

async function parseRequest(request: NextRequest) {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return {
      error: errorResponse(
        400,
        "Request body nije validan JSON.",
        "INVALID_JSON"
      ),
    } as const;
  }

  if (!isRecord(rawBody)) {
    return {
      error: errorResponse(
        400,
        "Request body mora biti JSON objekat.",
        "INVALID_REQUEST_BODY"
      ),
    } as const;
  }

  const body = rawBody as RequestBody;
  const businessSlug = getString(body.businessSlug);
  const bookingId = getString(body.bookingId);
  const action = getString(body.action);

  if (
    !businessSlug ||
    businessSlug.length > 80 ||
    !SLUG_PATTERN.test(businessSlug)
  ) {
    return {
      error: errorResponse(
        400,
        "Slug salona nije ispravan.",
        "INVALID_BUSINESS_SLUG"
      ),
    } as const;
  }

  if (!bookingId || !UUID_PATTERN.test(bookingId)) {
    return {
      error: errorResponse(
        400,
        "ID rezervacije nije ispravan.",
        "INVALID_BOOKING_ID"
      ),
    } as const;
  }

  return {
    body,
    action,
    businessSlug,
    bookingId,
  } as const;
}

async function loadContext(
  businessSlug: string,
  bookingId: string
) {
  const supabase = createAdminClient();

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, slug, timezone, is_active")
    .eq("slug", businessSlug)
    .maybeSingle();

  if (businessError) {
    console.error(
      "Failed to load business for platform booking action:",
      businessError
    );
    return {
      error: errorResponse(
        500,
        "Salon trenutno nije moguće učitati.",
        "BUSINESS_LOAD_FAILED"
      ),
    } as const;
  }

  if (!business) {
    return {
      error: errorResponse(
        404,
        "Salon nije pronađen.",
        "BUSINESS_NOT_FOUND"
      ),
    } as const;
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(
      "id, business_id, service_id, employee_id, status, updated_at"
    )
    .eq("id", bookingId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (bookingError) {
    console.error(
      "Failed to load booking for platform booking action:",
      bookingError
    );
    return {
      error: errorResponse(
        500,
        "Rezervacija trenutno nije dostupna.",
        "BOOKING_LOAD_FAILED"
      ),
    } as const;
  }

  if (!booking) {
    return {
      error: errorResponse(
        404,
        "Rezervacija nije pronađena.",
        "BOOKING_NOT_FOUND"
      ),
    } as const;
  }

  return {
    supabase,
    business: business as {
      id: string;
      slug: string;
      timezone: string;
      is_active: boolean;
    },
    booking: booking as unknown as BookingContextRow,
  } as const;
}

export async function POST(request: NextRequest) {
  const authError = await authorizeRequest();
  if (authError) {
    return authError;
  }

  const parsed = await parseRequest(request);
  if ("error" in parsed) {
    return parsed.error;
  }

  if (parsed.action !== "slots") {
    return errorResponse(
      400,
      "Booking akcija nije podržana.",
      "INVALID_BOOKING_ACTION"
    );
  }

  const context = await loadContext(
    parsed.businessSlug,
    parsed.bookingId
  );
  if ("error" in context) {
    return context.error;
  }

  if (!context.business.is_active) {
    return errorResponse(
      409,
      "Salon nije aktivan.",
      "BUSINESS_INACTIVE"
    );
  }

  if (
    context.booking.status !== "pending" &&
    context.booking.status !== "confirmed"
  ) {
    return errorResponse(
      409,
      "Samo pending i confirmed rezervacije mogu da se pomeraju.",
      "BOOKING_NOT_RESCHEDULABLE"
    );
  }

  const date = getString(parsed.body.date);
  const employeeId = getString(parsed.body.employeeId);

  if (!date || !isValidDate(date)) {
    return errorResponse(
      400,
      "Izabrani datum nije ispravan.",
      "INVALID_DATE"
    );
  }

  if (employeeId && !UUID_PATTERN.test(employeeId)) {
    return errorResponse(
      400,
      "Izabrani zaposleni nema ispravan ID.",
      "INVALID_EMPLOYEE_ID"
    );
  }

  const { data, error } = await context.supabase.rpc(
    "get_admin_available_slots",
    {
      p_business_id: context.business.id,
      p_service_id: context.booking.service_id,
      p_date: date,
      p_employee_id: employeeId || null,
      p_exclude_booking_id: context.booking.id,
    }
  );

  if (error) {
    console.error(
      "Failed to calculate platform booking reschedule slots:",
      error
    );
    return errorResponse(
      409,
      getRescheduleErrorMessage(error),
      "RESCHEDULE_SLOTS_FAILED"
    );
  }

  const rows = (data ?? []) as unknown as AvailableSlotRow[];

  return NextResponse.json(
    {
      ok: true,
      message:
        rows.length > 0
          ? "Slobodni termini su učitani."
          : "Za izabrani datum nema slobodnih termina.",
      slots: rows.map((row) => ({
        employeeId: row.employee_id,
        employeeName: row.employee_name,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
      })),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(request: NextRequest) {
  const authError = await authorizeRequest();
  if (authError) {
    return authError;
  }

  const parsed = await parseRequest(request);
  if ("error" in parsed) {
    return parsed.error;
  }

  if (!parsed.action) {
    return errorResponse(
      400,
      "Booking akcija nije poslata.",
      "INVALID_BOOKING_ACTION"
    );
  }

  const context = await loadContext(
    parsed.businessSlug,
    parsed.bookingId
  );
  if ("error" in context) {
    return context.error;
  }

  if (parsed.action === "status") {
    const nextStatus = getString(parsed.body.nextStatus);
    const cancellationReason =
      getString(parsed.body.cancellationReason) ?? "";
    const expectedUpdatedAt =
      getString(parsed.body.expectedUpdatedAt);

    if (!nextStatus || !isBookingStatus(nextStatus)) {
      return errorResponse(
        400,
        "Izabrani status nije dozvoljen.",
        "INVALID_BOOKING_STATUS"
      );
    }

    if (
      expectedUpdatedAt &&
      context.booking.updated_at !== expectedUpdatedAt
    ) {
      return errorResponse(
        409,
        "Rezervacija je promenjena u drugom tabu. Osveži stranicu.",
        "BOOKING_CONFLICT"
      );
    }

    if (context.booking.status === nextStatus) {
      return NextResponse.json({
        ok: true,
        message: "Rezervacija već ima izabrani status.",
        status: nextStatus,
      });
    }

    if (
      !getAllowedBusinessBookingStatuses(
        context.booking.status
      ).includes(nextStatus)
    ) {
      return errorResponse(
        409,
        "Ova promena statusa nije dozvoljena.",
        "BOOKING_STATUS_TRANSITION_NOT_ALLOWED"
      );
    }

    if (
      nextStatus === "cancelled" &&
      cancellationReason.length < 3
    ) {
      return errorResponse(
        400,
        "Unesi razlog otkazivanja.",
        "CANCELLATION_REASON_REQUIRED"
      );
    }

    if (cancellationReason.length > 500) {
      return errorResponse(
        400,
        "Razlog otkazivanja može imati najviše 500 karaktera.",
        "CANCELLATION_REASON_TOO_LONG"
      );
    }

    const updatedAt = new Date().toISOString();
    let updateQuery = context.supabase
      .from("bookings")
      .update({
        status: nextStatus,
        cancellation_reason:
          nextStatus === "cancelled" ? cancellationReason : null,
        cancelled_at:
          nextStatus === "cancelled" ? updatedAt : null,
        updated_at: updatedAt,
      })
      .eq("id", context.booking.id)
      .eq("business_id", context.business.id);

    if (expectedUpdatedAt) {
      updateQuery = updateQuery.eq(
        "updated_at",
        expectedUpdatedAt
      );
    }

    const { data, error } = await updateQuery
      .select("id, status, updated_at")
      .maybeSingle();

    if (error) {
      console.error("Failed to update platform booking status:", error);
      return errorResponse(
        500,
        "Status rezervacije nije promenjen.",
        "BOOKING_STATUS_UPDATE_FAILED"
      );
    }

    if (!data) {
      return errorResponse(
        409,
        "Rezervacija je promenjena u drugom tabu. Osveži stranicu.",
        "BOOKING_CONFLICT"
      );
    }

    const syncSucceeded =
      nextStatus === "confirmed" || nextStatus === "cancelled"
        ? await syncBookingSafely(context.booking.id)
        : true;

    await notifyBookingStatusChangedSafely(
      context.booking.id,
      nextStatus
    );

    refreshBookingPages(parsed.businessSlug);

    return NextResponse.json({
      ok: true,
      message: syncSucceeded
        ? "Status rezervacije je uspešno promenjen."
        : "Status je promenjen, ali Google Calendar trenutno nije sinhronizovan.",
      status: nextStatus,
      updatedAt: data.updated_at,
    });
  }

  if (parsed.action === "note") {
    const internalNote =
      getString(parsed.body.internalNote) ?? "";
    const expectedUpdatedAt =
      getString(parsed.body.expectedUpdatedAt);

    if (internalNote.length > 2000) {
      return errorResponse(
        400,
        "Interna napomena može imati najviše 2000 karaktera.",
        "INTERNAL_NOTE_TOO_LONG"
      );
    }

    if (
      expectedUpdatedAt &&
      context.booking.updated_at !== expectedUpdatedAt
    ) {
      return errorResponse(
        409,
        "Rezervacija je promenjena u drugom tabu. Osveži stranicu.",
        "BOOKING_CONFLICT"
      );
    }

    const updatedAt = new Date().toISOString();
    let updateQuery = context.supabase
      .from("bookings")
      .update({
        internal_note: internalNote || null,
        updated_at: updatedAt,
      })
      .eq("id", context.booking.id)
      .eq("business_id", context.business.id);

    if (expectedUpdatedAt) {
      updateQuery = updateQuery.eq(
        "updated_at",
        expectedUpdatedAt
      );
    }

    const { data, error } = await updateQuery
      .select("id, updated_at")
      .maybeSingle();

    if (error) {
      console.error("Failed to update platform booking note:", error);
      return errorResponse(
        500,
        "Interna napomena nije sačuvana.",
        "BOOKING_NOTE_UPDATE_FAILED"
      );
    }

    if (!data) {
      return errorResponse(
        409,
        "Rezervacija je promenjena u drugom tabu. Osveži stranicu.",
        "BOOKING_CONFLICT"
      );
    }

    const syncSucceeded =
      context.booking.status === "confirmed"
        ? await syncBookingSafely(context.booking.id)
        : true;

    refreshBookingPages(parsed.businessSlug);

    return NextResponse.json({
      ok: true,
      message: syncSucceeded
        ? "Interna napomena je sačuvana."
        : "Napomena je sačuvana, ali Google Calendar trenutno nije sinhronizovan.",
      updatedAt: data.updated_at,
    });
  }

  if (parsed.action === "reschedule") {
    const employeeId = getString(parsed.body.employeeId);
    const startsAt = getString(parsed.body.startsAt);

    if (!employeeId || !UUID_PATTERN.test(employeeId)) {
      return errorResponse(
        400,
        "Izabrani zaposleni nema ispravan ID.",
        "INVALID_EMPLOYEE_ID"
      );
    }

    if (!startsAt || Number.isNaN(Date.parse(startsAt))) {
      return errorResponse(
        400,
        "Izabrano vreme nije ispravno.",
        "INVALID_START_TIME"
      );
    }

    const { data, error } = await context.supabase.rpc(
      "reschedule_admin_booking",
      {
        p_business_id: context.business.id,
        p_booking_id: context.booking.id,
        p_employee_id: employeeId,
        p_starts_at: new Date(startsAt).toISOString(),
      }
    );

    if (error) {
      console.error("Failed to reschedule platform booking:", error);
      return errorResponse(
        409,
        getRescheduleErrorMessage(error),
        "BOOKING_RESCHEDULE_FAILED"
      );
    }

    const rows = (data ?? []) as unknown as RescheduledBookingRow[];
    const updatedBooking = rows[0];

    if (!updatedBooking) {
      return errorResponse(
        500,
        "Baza nije vratila izmenjenu rezervaciju.",
        "BOOKING_RESCHEDULE_EMPTY_RESULT"
      );
    }

    const syncSucceeded =
      updatedBooking.status === "confirmed"
        ? await syncBookingSafely(updatedBooking.id)
        : true;

    await notifyBookingRescheduledSafely(
      updatedBooking.id
    );

    refreshBookingPages(parsed.businessSlug);

    return NextResponse.json({
      ok: true,
      message: syncSucceeded
        ? "Termin rezervacije je uspešno promenjen."
        : "Termin je promenjen, ali Google Calendar trenutno nije sinhronizovan.",
    });
  }

  return errorResponse(
    400,
    "Booking akcija nije podržana.",
    "INVALID_BOOKING_ACTION"
  );
}
