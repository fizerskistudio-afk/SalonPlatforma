"use server";

import { revalidatePath } from "next/cache";

import type {
  BookingStatus,
} from "@/lib/admin/bookings";
import { requireAdmin } from "@/lib/auth/admin";
import {
  syncBookingToAllGoogleCalendars,
} from "@/lib/google-calendar/dual-sync";
import { createClient } from "@/lib/supabase/server";

export type BookingActionResult = {
  ok: boolean;
  message: string;
  bookingId?: string;
  status?: BookingStatus;
};

export type UpdateBookingStatusInput = {
  bookingId: string;
  nextStatus: BookingStatus;
  cancellationReason?: string;
};

export type UpdateBookingInternalNoteInput = {
  bookingId: string;
  internalNote: string;
};

type BookingStatusRow = {
  id: string;
  status: BookingStatus;
};

const BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

const ALLOWED_STATUS_TRANSITIONS: Record<
  BookingStatus,
  readonly BookingStatus[]
> = {
  pending: [
    "confirmed",
    "cancelled",
  ],

  confirmed: [
    "completed",
    "cancelled",
    "no_show",
  ],

  completed: [],
  cancelled: [],
  no_show: [],
};

function isUuid(
  value: string
): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isBookingStatus(
  value: string
): value is BookingStatus {
  return BOOKING_STATUSES.includes(
    value as BookingStatus
  );
}

function refreshBookingPages() {
  revalidatePath("/admin");
  revalidatePath(
    "/admin/bookings"
  );
}

async function synchronizeBookingSafely(
  bookingId: string
): Promise<boolean> {
  try {
    const syncResult =
      await syncBookingToAllGoogleCalendars(
        bookingId
      );

    if (!syncResult.ok) {
      console.error(
        "Booking update succeeded, but Google Calendar synchronization failed:",
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
      "Booking synchronized with Google Calendar after admin update:",
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
     * Google Calendar greška nikada ne sme
     * da poništi uspešnu promenu rezervacije.
     */
    console.error(
      "Unexpected Google Calendar synchronization error after admin update:",
      {
        bookingId,
        error,
      }
    );

    return false;
  }
}

export async function updateBookingStatusAction(
  input: UpdateBookingStatusInput
): Promise<BookingActionResult> {
  const admin =
    await requireAdmin();

  const bookingId =
    input.bookingId.trim();

  if (!isUuid(bookingId)) {
    return {
      ok: false,
      message:
        "Rezervacija nema ispravan ID.",
    };
  }

  if (
    !isBookingStatus(
      input.nextStatus
    )
  ) {
    return {
      ok: false,
      message:
        "Izabrani status nije dozvoljen.",
    };
  }

  const cancellationReason =
    input.cancellationReason
      ?.trim() ?? "";

  if (
    input.nextStatus ===
      "cancelled" &&
    cancellationReason.length < 3
  ) {
    return {
      ok: false,
      message:
        "Unesi razlog otkazivanja.",
    };
  }

  if (
    cancellationReason.length >
    500
  ) {
    return {
      ok: false,
      message:
        "Razlog otkazivanja može imati najviše 500 karaktera.",
    };
  }

  const supabase =
    await createClient();

  const {
    data: bookingData,
    error: bookingError,
  } = await supabase
    .from("bookings")
    .select("id, status")
    .eq("id", bookingId)
    .eq(
      "business_id",
      admin.business.id
    )
    .maybeSingle();

  if (
    bookingError ||
    !bookingData
  ) {
    return {
      ok: false,
      message:
        "Rezervacija nije pronađena ili nemaš dozvolu da je menjaš.",
    };
  }

  const currentBooking =
    bookingData as unknown as BookingStatusRow;

  if (
    currentBooking.status ===
    input.nextStatus
  ) {
    return {
      ok: true,
      bookingId,
      status:
        currentBooking.status,
      message:
        "Rezervacija već ima izabrani status.",
    };
  }

  const allowedNextStatuses =
    ALLOWED_STATUS_TRANSITIONS[
      currentBooking.status
    ];

  if (
    !allowedNextStatuses.includes(
      input.nextStatus
    )
  ) {
    return {
      ok: false,
      message:
        "Ova promena statusa nije dozvoljena.",
    };
  }

  const updatedAt =
    new Date().toISOString();

  const {
    data: updatedBookingData,
    error: updateError,
  } = await supabase
    .from("bookings")
    .update({
      status:
        input.nextStatus,

      cancellation_reason:
        input.nextStatus ===
        "cancelled"
          ? cancellationReason
          : null,

      cancelled_at:
        input.nextStatus ===
        "cancelled"
          ? updatedAt
          : null,

      updated_at: updatedAt,
    })
    .eq("id", bookingId)
    .eq(
      "business_id",
      admin.business.id
    )
    .select("id, status")
    .single();

  if (
    updateError ||
    !updatedBookingData
  ) {
    return {
      ok: false,
      message:
        "Status rezervacije nije promenjen. Pokušaj ponovo.",
    };
  }

  const updatedBooking =
    updatedBookingData as unknown as BookingStatusRow;

  let calendarSyncSucceeded =
    true;

  /*
   * pending → confirmed:
   * kreira Google događaj.
   *
   * confirmed/pending → cancelled:
   * briše događaj ili beleži da događaj nije postojao.
   */
  if (
    updatedBooking.status ===
      "confirmed" ||
    updatedBooking.status ===
      "cancelled"
  ) {
    calendarSyncSucceeded =
      await synchronizeBookingSafely(
        updatedBooking.id
      );
  }

  refreshBookingPages();

  const successMessage =
    updatedBooking.status ===
    "cancelled"
      ? "Rezervacija je otkazana."
      : "Status rezervacije je uspešno promenjen.";

  return {
    ok: true,
    bookingId:
      updatedBooking.id,
    status:
      updatedBooking.status,

    message:
      calendarSyncSucceeded
        ? successMessage
        : `${successMessage} Google Calendar trenutno nije sinhronizovan.`,
  };
}

export async function updateBookingInternalNoteAction(
  input: UpdateBookingInternalNoteInput
): Promise<BookingActionResult> {
  const admin =
    await requireAdmin();

  const bookingId =
    input.bookingId.trim();

  if (!isUuid(bookingId)) {
    return {
      ok: false,
      message:
        "Rezervacija nema ispravan ID.",
    };
  }

  const internalNote =
    input.internalNote.trim();

  if (
    internalNote.length > 2000
  ) {
    return {
      ok: false,
      message:
        "Interna napomena može imati najviše 2000 karaktera.",
    };
  }

  const supabase =
    await createClient();

  const {
    data: updatedBookingData,
    error: updateError,
  } = await supabase
    .from("bookings")
    .update({
      internal_note:
        internalNote.length > 0
          ? internalNote
          : null,

      updated_at:
        new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq(
      "business_id",
      admin.business.id
    )
    .select("id, status")
    .single();

  if (
    updateError ||
    !updatedBookingData
  ) {
    return {
      ok: false,
      message:
        "Interna napomena nije sačuvana. Proveri rezervaciju i pokušaj ponovo.",
    };
  }

  const updatedBooking =
    updatedBookingData as unknown as BookingStatusRow;

  let calendarSyncSucceeded =
    true;

  /*
   * Kod confirmed rezervacije sync servis
   * ažurira opis postojećeg Google događaja.
   */
  if (
    updatedBooking.status ===
    "confirmed"
  ) {
    calendarSyncSucceeded =
      await synchronizeBookingSafely(
        updatedBooking.id
      );
  }

  refreshBookingPages();

  return {
    ok: true,
    bookingId:
      updatedBooking.id,
    status:
      updatedBooking.status,

    message:
      calendarSyncSucceeded
        ? "Interna napomena je sačuvana."
        : "Interna napomena je sačuvana, ali Google Calendar trenutno nije sinhronizovan.",
  };
}