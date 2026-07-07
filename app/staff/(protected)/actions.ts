"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStaff } from "@/lib/auth/staff";
import { syncBookingToAllGoogleCalendars } from "@/lib/google-calendar/dual-sync";
import { createClient } from "@/lib/supabase/server";

export type StaffActionResult = {
  ok: boolean;
  message: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type StaffBookingNextStatus =
  | "confirmed"
  | "completed"
  | "no_show";

function getErrorText(
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
        typeof value === "string"
    )
    .join(" ")
    .toUpperCase();
}

export async function updateStaffBookingStatusAction(
  input: {
    bookingId: string;
    nextStatus: StaffBookingNextStatus;
  }
): Promise<StaffActionResult> {
  await requireStaff();

  const bookingId =
    input.bookingId.trim();

  if (!UUID_PATTERN.test(bookingId)) {
    return {
      ok: false,
      message:
        "Rezervacija nema ispravan ID.",
    };
  }

  if (
    ![
      "confirmed",
      "completed",
      "no_show",
    ].includes(input.nextStatus)
  ) {
    return {
      ok: false,
      message:
        "Izabrani status nije dozvoljen.",
    };
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase.rpc(
    "staff_update_own_booking_status",
    {
      p_booking_id:
        bookingId,
      p_next_status:
        input.nextStatus,
    }
  );

  if (error) {
    const errorText =
      getErrorText(error);

    if (
      errorText.includes(
        "STAFF_BOOKING_TRANSITION_NOT_ALLOWED"
      )
    ) {
      return {
        ok: false,
        message:
          "Ova promena statusa nije dozvoljena.",
      };
    }

    if (
      errorText.includes(
        "STAFF_BOOKING_FORBIDDEN"
      )
    ) {
      return {
        ok: false,
        message:
          "Nemaš dozvolu za ovu rezervaciju.",
      };
    }

    console.error(
      "Unable to update staff booking status:",
      error
    );

    return {
      ok: false,
      message:
        "Status rezervacije nije promenjen.",
    };
  }

  const updatedRow =
    Array.isArray(data)
      ? data[0]
      : data;

  if (!updatedRow) {
    return {
      ok: false,
      message:
        "Rezervacija nije pronađena.",
    };
  }

  let calendarSynced =
    true;

  if (
    input.nextStatus ===
    "confirmed"
  ) {
    try {
      const syncResult =
        await syncBookingToAllGoogleCalendars(
          bookingId
        );

      calendarSynced =
        syncResult.ok;
    } catch (error) {
      calendarSynced =
        false;

      console.error(
        "Staff booking was confirmed, but Google Calendar sync failed:",
        error
      );
    }
  }

  revalidatePath("/staff");
  revalidatePath("/admin");
  revalidatePath(
    "/admin/bookings"
  );

  return {
    ok: true,
    message:
      calendarSynced
        ? "Status rezervacije je promenjen."
        : "Status je promenjen, ali Google Calendar trenutno nije sinhronizovan.",
  };
}

export async function createStaffTimeOffRequestAction(
  input: {
    startsAt: string;
    endsAt: string;
    reason: string;
  }
): Promise<StaffActionResult> {
  const staff =
    await requireStaff();

  const startsAt =
    new Date(input.startsAt);

  const endsAt =
    new Date(input.endsAt);

  const reason =
    input.reason.trim();

  if (
    Number.isNaN(
      startsAt.getTime()
    ) ||
    Number.isNaN(
      endsAt.getTime()
    )
  ) {
    return {
      ok: false,
      message:
        "Datum i vreme nisu ispravni.",
    };
  }

  if (
    endsAt.getTime() <=
    startsAt.getTime()
  ) {
    return {
      ok: false,
      message:
        "Kraj odsustva mora biti posle početka.",
    };
  }

  if (
    startsAt.getTime() <
    Date.now() - 5 * 60 * 1000
  ) {
    return {
      ok: false,
      message:
        "Zahtev za odsustvo mora početi u budućnosti.",
    };
  }

  const duration =
    endsAt.getTime() -
    startsAt.getTime();

  if (
    duration >
    90 *
      24 *
      60 *
      60 *
      1000
  ) {
    return {
      ok: false,
      message:
        "Jedan zahtev može trajati najviše 90 dana.",
    };
  }

  if (
    reason.length < 3 ||
    reason.length > 500
  ) {
    return {
      ok: false,
      message:
        "Razlog mora imati između 3 i 500 karaktera.",
    };
  }

  const supabase =
    await createClient();

  const {
    error,
  } = await supabase
    .from(
      "staff_time_off_requests"
    )
    .insert({
      business_id:
        staff.business.id,
      employee_id:
        staff.employee.id,
      member_id:
        staff.membership.id,
      starts_at:
        startsAt.toISOString(),
      ends_at:
        endsAt.toISOString(),
      reason,
      status:
        "pending",
    });

  if (error) {
    console.error(
      "Unable to create staff time off request:",
      error
    );

    return {
      ok: false,
      message:
        "Zahtev za odsustvo nije poslat.",
    };
  }

  revalidatePath("/staff");
  revalidatePath(
    "/admin/schedule"
  );

  return {
    ok: true,
    message:
      "Zahtev za odsustvo je poslat.",
  };
}

export async function cancelStaffTimeOffRequestAction(
  input: {
    requestId: string;
  }
): Promise<StaffActionResult> {
  await requireStaff();

  const requestId =
    input.requestId.trim();

  if (
    !UUID_PATTERN.test(
      requestId
    )
  ) {
    return {
      ok: false,
      message:
        "Zahtev nema ispravan ID.",
    };
  }

  const supabase =
    await createClient();

  const {
    error,
  } = await supabase.rpc(
    "cancel_staff_time_off_request",
    {
      p_request_id:
        requestId,
    }
  );

  if (error) {
    const errorText =
      getErrorText(error);

    if (
      errorText.includes(
        "TIME_OFF_REQUEST_NOT_PENDING"
      )
    ) {
      return {
        ok: false,
        message:
          "Samo zahtev na čekanju može biti otkazan.",
      };
    }

    console.error(
      "Unable to cancel staff time off request:",
      error
    );

    return {
      ok: false,
      message:
        "Zahtev nije otkazan.",
    };
  }

  revalidatePath("/staff");
  revalidatePath(
    "/admin/schedule"
  );

  return {
    ok: true,
    message:
      "Zahtev je otkazan.",
  };
}

export async function staffSignOutAction() {
  const supabase =
    await createClient();

  await supabase.auth.signOut();

  redirect(
    "/staff/login"
  );
}
