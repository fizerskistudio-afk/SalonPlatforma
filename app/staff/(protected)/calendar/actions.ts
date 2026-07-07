"use server";

import {
  revalidatePath,
} from "next/cache";

import { requireStaff } from "@/lib/auth/staff";
import { createAdminClient } from "@/lib/supabase/admin";

export type StaffCalendarActionResult = {
  ok: boolean;
  message: string;
};

export async function disconnectStaffGoogleCalendarAction(): Promise<StaffCalendarActionResult> {
  const staff =
    await requireStaff();

  const adminClient =
    createAdminClient();

  const {
    error,
  } = await adminClient
    .from(
      "employee_google_calendar_connections"
    )
    .delete()
    .eq(
      "business_id",
      staff.business.id
    )
    .eq(
      "employee_id",
      staff.employee.id
    );

  if (error) {
    console.error(
      "Unable to disconnect staff Google Calendar:",
      error
    );

    return {
      ok: false,
      message:
        "Lični Google Calendar nije odspojen. Pokušaj ponovo.",
    };
  }

  revalidatePath(
    "/staff/calendar"
  );
  revalidatePath(
    "/staff"
  );

  return {
    ok: true,
    message:
      "Lični Google Calendar je odspojen. Postojeći događaji nisu obrisani.",
  };
}

export async function syncUpcomingStaffBookingsAction(): Promise<StaffCalendarActionResult> {
  const staff =
    await requireStaff();

  const adminClient =
    createAdminClient();

  const {
    data,
    error,
  } = await adminClient
    .from("bookings")
    .select("id")
    .eq(
      "business_id",
      staff.business.id
    )
    .eq(
      "employee_id",
      staff.employee.id
    )
    .eq(
      "status",
      "confirmed"
    )
    .gte(
      "ends_at",
      new Date().toISOString()
    )
    .order(
      "starts_at",
      {
        ascending: true,
      }
    )
    .limit(100);

  if (error) {
    console.error(
      "Unable to load upcoming staff bookings for Google Calendar sync:",
      error
    );

    return {
      ok: false,
      message:
        "Predstojeći termini trenutno ne mogu da se učitaju.",
    };
  }

  const {
    syncBookingToEmployeeGoogleCalendar,
  } = await import(
    "@/lib/google-calendar/employee-sync"
  );

  let synced = 0;
  let failed = 0;

  for (const row of data ?? []) {
    const result =
      await syncBookingToEmployeeGoogleCalendar(
        row.id
      );

    if (result.ok) {
      synced += 1;
    } else {
      failed += 1;
    }
  }

  revalidatePath(
    "/staff/calendar"
  );

  if (failed > 0) {
    return {
      ok: false,
      message:
        `${synced} termina je sinhronizovano, a ${failed} nije. Proveri poslednju sync grešku.`,
    };
  }

  return {
    ok: true,
    message:
      synced > 0
        ? `${synced} predstojećih termina je sinhronizovano.`
        : "Nema predstojećih potvrđenih termina za sinhronizaciju.",
  };
}
