import "server-only";

import {
  syncBookingToEmployeeGoogleCalendar,
} from "@/lib/google-calendar/employee-sync";
import {
  syncBookingToGoogleCalendar,
  type GoogleCalendarSyncAction,
  type GoogleCalendarSyncResult,
} from "@/lib/google-calendar/sync";
import {
  logServerError,
} from "@/lib/monitoring/server";

export type DualGoogleCalendarSyncResult =
  GoogleCalendarSyncResult & {
    salon:
      GoogleCalendarSyncResult;
    employee:
      GoogleCalendarSyncResult;
  };

function getErrorMessage(
  error: unknown
): string {
  return error instanceof Error
    ? error.message
    : "Unknown Google Calendar synchronization error.";
}

async function runSafely(
  scope: "salon" | "employee",
  bookingId: string,
  runner:
    () =>
      Promise<GoogleCalendarSyncResult>
): Promise<GoogleCalendarSyncResult> {
  try {
    return await runner();
  } catch (error) {
    const message =
      getErrorMessage(error);

    logServerError(
      `calendar.${scope}.unexpected`,
      error,
      {
        bookingId,
        calendarScope:
          scope,
      }
    );

    return {
      ok: false,
      action: "failed",
      message,
    };
  }
}

function resolveAction(
  salon:
    GoogleCalendarSyncResult,
  employee:
    GoogleCalendarSyncResult
): GoogleCalendarSyncAction {
  const actions = [
    salon.action,
    employee.action,
  ];

  if (
    actions.includes(
      "failed"
    )
  ) {
    return "failed";
  }

  if (
    actions.includes(
      "deleted"
    )
  ) {
    return "deleted";
  }

  if (
    actions.includes(
      "created"
    )
  ) {
    return "created";
  }

  if (
    actions.includes(
      "updated"
    )
  ) {
    return "updated";
  }

  return "skipped";
}

export async function syncBookingToAllGoogleCalendars(
  bookingId: string
): Promise<DualGoogleCalendarSyncResult> {
  const [
    salon,
    employee,
  ] = await Promise.all([
    runSafely(
      "salon",
      bookingId,
      () =>
        syncBookingToGoogleCalendar(
          bookingId
        )
    ),
    runSafely(
      "employee",
      bookingId,
      () =>
        syncBookingToEmployeeGoogleCalendar(
          bookingId
        )
    ),
  ]);

  const ok =
    salon.ok &&
    employee.ok;

  return {
    ok,
    action:
      resolveAction(
        salon,
        employee
      ),
    message: [
      `Salon: ${salon.message}`,
      `Frizer: ${employee.message}`,
    ].join(" | "),
    eventId:
      salon.eventId ??
      employee.eventId,
    salon,
    employee,
  };
}
