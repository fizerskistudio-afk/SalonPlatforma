import "server-only";

import {
  google,
} from "googleapis";
import type {
  calendar_v3,
} from "googleapis";

import {
  decryptGoogleToken,
} from "@/lib/google-calendar/crypto";
import {
  createGoogleOAuthClientWithRefreshToken,
} from "@/lib/google-calendar/oauth";
import {
  logServerError,
} from "@/lib/monitoring/server";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

type AdminClient =
  ReturnType<
    typeof createAdminClient
  >;

type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

type BookingRow = {
  id: string;
  reference_code: string;
  business_id: string;
  service_id: string;
  employee_id: string;

  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  customer_note: string | null;

  starts_at: string;
  ends_at: string;

  duration_minutes: number;
  price_amount:
    | number
    | string;

  currency: string;
  status: BookingStatus;
  source: string;

  internal_note: string | null;

  google_event_id:
    | string
    | null;

  google_sync_status:
    | string
    | null;
};

type GoogleCalendarConnectionRow = {
  business_id: string;
  calendar_id: string;
  refresh_token_encrypted: string;
  is_active: boolean;
};

type BusinessRow = {
  id: string;
  name: string;
  timezone: string;
  default_locale: string;
  address: unknown;
  city: unknown;
};

type ServiceRow = {
  id: string;
  name: unknown;
};

type EmployeeRow = {
  id: string;
  name: string;
};

type LoadedBookingContext = {
  booking: BookingRow;
  connection:
    | GoogleCalendarConnectionRow
    | null;
  business: BusinessRow | null;
  service: ServiceRow | null;
  employee: EmployeeRow | null;
};

export type GoogleCalendarSyncAction =
  | "created"
  | "updated"
  | "deleted"
  | "skipped"
  | "failed";

export type GoogleCalendarSyncResult = {
  ok: boolean;
  action: GoogleCalendarSyncAction;
  message: string;
  eventId?: string;
};

const MAX_SYNC_ERROR_LENGTH =
  1000;

const MAX_DESCRIPTION_LENGTH =
  8000;

function isRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getLocalizedText(
  value: unknown,
  preferredLocale = "en"
): string {
  if (
    typeof value === "string"
  ) {
    return value.trim();
  }

  if (!isRecord(value)) {
    return "";
  }

  const localeOrder = [
    preferredLocale,
    "en",
    "mk",
    "sq",
  ];

  for (
    const locale of
    localeOrder
  ) {
    const localizedValue =
      value[locale];

    if (
      typeof localizedValue ===
        "string" &&
      localizedValue.trim()
    ) {
      return localizedValue.trim();
    }
  }

  for (
    const localizedValue of
    Object.values(value)
  ) {
    if (
      typeof localizedValue ===
        "string" &&
      localizedValue.trim()
    ) {
      return localizedValue.trim();
    }
  }

  return "";
}

function limitText(
  value:
    | string
    | null
    | undefined,
  maxLength: number
): string {
  const normalized =
    value?.trim() ?? "";

  if (
    normalized.length <=
    maxLength
  ) {
    return normalized;
  }

  return `${normalized.slice(
    0,
    Math.max(
      0,
      maxLength - 1
    )
  )}…`;
}

function getErrorMessage(
  error: unknown
): string {
  if (
    error instanceof Error
  ) {
    return limitText(
      error.message,
      MAX_SYNC_ERROR_LENGTH
    );
  }

  if (
    isRecord(error)
  ) {
    const response =
      error.response;

    if (
      isRecord(response)
    ) {
      const responseData =
        response.data;

      if (
        isRecord(
          responseData
        )
      ) {
        const nestedError =
          responseData.error;

        if (
          isRecord(
            nestedError
          ) &&
          typeof nestedError.message ===
            "string"
        ) {
          return limitText(
            nestedError.message,
            MAX_SYNC_ERROR_LENGTH
          );
        }
      }
    }

    if (
      typeof error.message ===
        "string"
    ) {
      return limitText(
        error.message,
        MAX_SYNC_ERROR_LENGTH
      );
    }
  }

  return "Unknown Google Calendar synchronization error.";
}

function getHttpStatus(
  error: unknown
): number | null {
  if (!isRecord(error)) {
    return null;
  }

  if (
    typeof error.code ===
      "number"
  ) {
    return error.code;
  }

  if (
    typeof error.status ===
      "number"
  ) {
    return error.status;
  }

  const response =
    error.response;

  if (
    isRecord(response) &&
    typeof response.status ===
      "number"
  ) {
    return response.status;
  }

  return null;
}

function isMissingGoogleEvent(
  error: unknown
): boolean {
  const status =
    getHttpStatus(error);

  return (
    status === 404 ||
    status === 410
  );
}

function isGoogleConflict(
  error: unknown
): boolean {
  return (
    getHttpStatus(error) ===
    409
  );
}

function createGoogleEventId(
  bookingId: string
): string {
  const normalized =
    bookingId
      .replace(
        /[^0-9a-f]/gi,
        ""
      )
      .toLowerCase();

  return `b${normalized}`;
}

function createRecoveryEventId(
  bookingId: string
): string {
  return `${createGoogleEventId(
    bookingId
  )}r1`;
}

function formatPrice(
  amount:
    | number
    | string,
  currency: string
): string {
  const numericAmount =
    typeof amount === "number"
      ? amount
      : Number.parseFloat(
          amount
        );

  if (
    Number.isNaN(
      numericAmount
    )
  ) {
    return `${amount} ${currency.trim()}`;
  }

  return `${numericAmount.toFixed(
    2
  )} ${currency.trim()}`;
}

function createLocation(
  business: BusinessRow
): string | undefined {
  const locale =
    business.default_locale ||
    "en";

  const address =
    getLocalizedText(
      business.address,
      locale
    );

  const city =
    getLocalizedText(
      business.city,
      locale
    );

  const location = [
    address,
    city,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    location ||
    undefined
  );
}

function createDescription(
  booking: BookingRow,
  business: BusinessRow,
  serviceName: string,
  employeeName: string
): string {
  const lines = [
    `Salon: ${business.name}`,
    `Booking reference: ${booking.reference_code}`,
    "",
    `Customer: ${booking.customer_name}`,
    booking.customer_phone
      ? `Phone: ${booking.customer_phone}`
      : null,

    booking.customer_email
      ? `Email: ${booking.customer_email}`
      : null,

    "",
    `Service: ${serviceName}`,
    `Employee: ${employeeName}`,
    `Duration: ${booking.duration_minutes} minutes`,
    `Price: ${formatPrice(
      booking.price_amount,
      booking.currency
    )}`,
    `Source: ${booking.source}`,
  ];

  if (
    booking.customer_note?.trim()
  ) {
    lines.push(
      "",
      "Customer note:",
      booking.customer_note.trim()
    );
  }

  if (
    booking.internal_note?.trim()
  ) {
    lines.push(
      "",
      "Internal note:",
      booking.internal_note.trim()
    );
  }

  return limitText(
    lines
      .filter(
        (
          line
        ): line is string =>
          line !== null
      )
      .join("\n"),
    MAX_DESCRIPTION_LENGTH
  );
}

function createEventBody(
  context: LoadedBookingContext
): calendar_v3.Schema$Event {
  const {
    booking,
    business,
    service,
    employee,
  } = context;

  if (
    !business ||
    !service ||
    !employee
  ) {
    throw new Error(
      "Booking relations required for Google Calendar synchronization were not found."
    );
  }

  const locale =
    business.default_locale ||
    "en";

  const serviceName =
    getLocalizedText(
      service.name,
      locale
    ) ||
    "Salon service";

  const employeeName =
    employee.name.trim() ||
    "Salon employee";

  const customerName =
    booking.customer_name.trim() ||
    "Customer";

  return {
    summary: `${serviceName} — ${customerName}`,

    description:
      createDescription(
        booking,
        business,
        serviceName,
        employeeName
      ),

    location:
      createLocation(
        business
      ),

    start: {
      dateTime:
        booking.starts_at,

      timeZone:
        business.timezone,
    },

    end: {
      dateTime:
        booking.ends_at,

      timeZone:
        business.timezone,
    },

    transparency:
      "opaque",

    visibility:
      "private",

    reminders: {
      useDefault: true,
    },

    extendedProperties: {
      private: {
        bookingId:
          booking.id,

        businessId:
          booking.business_id,

        referenceCode:
          booking.reference_code,

        source:
          booking.source,
      },
    },
  };
}

async function updateBookingSyncState(
  adminClient: AdminClient,
  bookingId: string,
  values: {
    google_event_id?:
      | string
      | null;

    google_sync_status:
      | "not_required"
      | "pending"
      | "synced"
      | "failed"
      | "deleted";

    google_sync_error:
      | string
      | null;

    google_synced_at:
      | string
      | null;
  }
): Promise<void> {
  const {
    error,
  } =
    await adminClient
      .from("bookings")
      .update(values)
      .eq(
        "id",
        bookingId
      );

  if (error) {
    throw new Error(
      `Failed to update booking Google sync state: ${error.message}`
    );
  }
}

async function updateConnectionSuccess(
  adminClient: AdminClient,
  businessId: string,
  syncedAt: string
): Promise<void> {
  const {
    error,
  } =
    await adminClient
      .from(
        "google_calendar_connections"
      )
      .update({
        last_synced_at:
          syncedAt,

        last_error: null,
      })
      .eq(
        "business_id",
        businessId
      );

  if (error) {
    logServerError(
      "calendar.salon.connection_success_state.failed",
      error,
      {
        businessId,
      }
    );
  }
}

async function updateConnectionFailure(
  adminClient: AdminClient,
  businessId: string,
  errorMessage: string
): Promise<void> {
  const {
    error,
  } =
    await adminClient
      .from(
        "google_calendar_connections"
      )
      .update({
        last_error:
          errorMessage,
      })
      .eq(
        "business_id",
        businessId
      );

  if (error) {
    logServerError(
      "calendar.salon.connection_failure_state.failed",
      error,
      {
        businessId,
      }
    );
  }
}

async function recordSyncFailure(
  adminClient: AdminClient,
  booking: BookingRow,
  error: unknown
): Promise<GoogleCalendarSyncResult> {
  const errorMessage =
    getErrorMessage(error);

  logServerError(
    "calendar.salon.sync.failed",
    error,
    {
      bookingId:
        booking.id,
      businessId:
        booking.business_id,
    }
  );

  try {
    await updateBookingSyncState(
      adminClient,
      booking.id,
      {
        google_sync_status:
          "failed",

        google_sync_error:
          errorMessage,

        google_synced_at:
          null,
      }
    );
  } catch (stateError) {
    logServerError(
      "calendar.salon.sync_state_record.failed",
      stateError,
      {
        bookingId:
          booking.id,
        businessId:
          booking.business_id,
      }
    );
  }

  await updateConnectionFailure(
    adminClient,
    booking.business_id,
    errorMessage
  );

  return {
    ok: false,
    action: "failed",
    message:
      errorMessage,
  };
}

async function loadBookingContext(
  adminClient: AdminClient,
  bookingId: string
): Promise<LoadedBookingContext | null> {
  const {
    data: bookingData,
    error: bookingError,
  } =
    await adminClient
      .from("bookings")
      .select(
        `
          id,
          reference_code,
          business_id,
          service_id,
          employee_id,
          customer_name,
          customer_phone,
          customer_email,
          customer_note,
          starts_at,
          ends_at,
          duration_minutes,
          price_amount,
          currency,
          status,
          source,
          internal_note,
          google_event_id,
          google_sync_status
        `
      )
      .eq(
        "id",
        bookingId
      )
      .maybeSingle();

  if (bookingError) {
    throw new Error(
      `Failed to load booking for Google Calendar synchronization: ${bookingError.message}`
    );
  }

  if (!bookingData) {
    return null;
  }

  const booking =
    bookingData as unknown as BookingRow;

  const [
    connectionResult,
    businessResult,
    serviceResult,
    employeeResult,
  ] =
    await Promise.all([
      adminClient
        .from(
          "google_calendar_connections"
        )
        .select(
          `
            business_id,
            calendar_id,
            refresh_token_encrypted,
            is_active
          `
        )
        .eq(
          "business_id",
          booking.business_id
        )
        .eq(
          "is_active",
          true
        )
        .maybeSingle(),

      adminClient
        .from("businesses")
        .select(
          `
            id,
            name,
            timezone,
            default_locale,
            address,
            city
          `
        )
        .eq(
          "id",
          booking.business_id
        )
        .maybeSingle(),

      adminClient
        .from("services")
        .select(
          "id, name"
        )
        .eq(
          "id",
          booking.service_id
        )
        .eq(
          "business_id",
          booking.business_id
        )
        .maybeSingle(),

      adminClient
        .from("employees")
        .select(
          "id, name"
        )
        .eq(
          "id",
          booking.employee_id
        )
        .eq(
          "business_id",
          booking.business_id
        )
        .maybeSingle(),
    ]);

  const queryError =
    connectionResult.error ??
    businessResult.error ??
    serviceResult.error ??
    employeeResult.error;

  if (queryError) {
    throw new Error(
      `Failed to load Google Calendar booking context: ${queryError.message}`
    );
  }

  return {
    booking,

    connection:
      connectionResult.data
        ? connectionResult.data as unknown as GoogleCalendarConnectionRow
        : null,

    business:
      businessResult.data
        ? businessResult.data as unknown as BusinessRow
        : null,

    service:
      serviceResult.data
        ? serviceResult.data as unknown as ServiceRow
        : null,

    employee:
      employeeResult.data
        ? employeeResult.data as unknown as EmployeeRow
        : null,
  };
}

async function createCalendarEvent(
  calendar:
    calendar_v3.Calendar,
  calendarId: string,
  eventId: string,
  eventBody:
    calendar_v3.Schema$Event
): Promise<string> {
  try {
    const {
      data,
    } =
      await calendar.events.insert(
        {
          calendarId,

          requestBody: {
            ...eventBody,
            id: eventId,
          },
        }
      );

    return (
      data.id ??
      eventId
    );
  } catch (error) {
    if (
      !isGoogleConflict(
        error
      )
    ) {
      throw error;
    }

    const {
      data,
    } =
      await calendar.events.update(
        {
          calendarId,
          eventId,
          requestBody:
            eventBody,
        }
      );

    return (
      data.id ??
      eventId
    );
  }
}

async function updateCalendarEvent(
  calendar:
    calendar_v3.Calendar,
  calendarId: string,
  eventId: string,
  recoveryEventId: string,
  eventBody:
    calendar_v3.Schema$Event
): Promise<{
  eventId: string;
  action:
    | "created"
    | "updated";
}> {
  try {
    const {
      data,
    } =
      await calendar.events.update(
        {
          calendarId,
          eventId,
          requestBody:
            eventBody,
        }
      );

    return {
      eventId:
        data.id ??
        eventId,

      action:
        "updated",
    };
  } catch (error) {
    if (
      !isMissingGoogleEvent(
        error
      )
    ) {
      throw error;
    }

    const recreatedEventId =
      await createCalendarEvent(
        calendar,
        calendarId,
        recoveryEventId,
        eventBody
      );

    return {
      eventId:
        recreatedEventId,

      action:
        "created",
    };
  }
}

async function syncConfirmedBooking(
  adminClient: AdminClient,
  context: LoadedBookingContext
): Promise<GoogleCalendarSyncResult> {
  const {
    booking,
    connection,
  } = context;

  if (!connection) {
    await updateBookingSyncState(
      adminClient,
      booking.id,
      {
        google_sync_status:
          "not_required",

        google_sync_error:
          null,

        google_synced_at:
          null,
      }
    );

    return {
      ok: true,
      action: "skipped",
      message:
        "The salon does not have an active Google Calendar connection.",
    };
  }

  await updateBookingSyncState(
    adminClient,
    booking.id,
    {
      google_sync_status:
        "pending",

      google_sync_error:
        null,

      google_synced_at:
        null,
    }
  );

  try {
    const refreshToken =
      decryptGoogleToken(
        connection.refresh_token_encrypted
      );

    const oauthClient =
      createGoogleOAuthClientWithRefreshToken(
        refreshToken
      );

    const calendar =
      google.calendar({
        version: "v3",
        auth: oauthClient,
      });

    const eventBody =
      createEventBody(
        context
      );

    const defaultEventId =
      createGoogleEventId(
        booking.id
      );

    let finalEventId: string;
    let action:
      | "created"
      | "updated";

    if (
      booking.google_event_id
    ) {
      const updateResult =
        await updateCalendarEvent(
          calendar,
          connection.calendar_id,
          booking.google_event_id,
          createRecoveryEventId(
            booking.id
          ),
          eventBody
        );

      finalEventId =
        updateResult.eventId;

      action =
        updateResult.action;
    } else {
      finalEventId =
        await createCalendarEvent(
          calendar,
          connection.calendar_id,
          defaultEventId,
          eventBody
        );

      action =
        "created";
    }

    const syncedAt =
      new Date().toISOString();

    await updateBookingSyncState(
      adminClient,
      booking.id,
      {
        google_event_id:
          finalEventId,

        google_sync_status:
          "synced",

        google_sync_error:
          null,

        google_synced_at:
          syncedAt,
      }
    );

    await updateConnectionSuccess(
      adminClient,
      booking.business_id,
      syncedAt
    );

    return {
      ok: true,
      action,
      eventId:
        finalEventId,

      message:
        action === "created"
          ? "Google Calendar event was created."
          : "Google Calendar event was updated.",
    };
  } catch (error) {
    return recordSyncFailure(
      adminClient,
      booking,
      error
    );
  }
}

async function deleteCancelledBooking(
  adminClient: AdminClient,
  context: LoadedBookingContext
): Promise<GoogleCalendarSyncResult> {
  const {
    booking,
    connection,
  } = context;

  if (
    !booking.google_event_id
  ) {
    const syncedAt =
      new Date().toISOString();

    await updateBookingSyncState(
      adminClient,
      booking.id,
      {
        google_sync_status:
          "deleted",

        google_sync_error:
          null,

        google_synced_at:
          syncedAt,
      }
    );

    return {
      ok: true,
      action: "deleted",
      message:
        "The cancelled booking did not have a Google Calendar event.",
    };
  }

  if (!connection) {
    return recordSyncFailure(
      adminClient,
      booking,
      new Error(
        "The booking has a Google event ID, but the salon does not have an active Google Calendar connection."
      )
    );
  }

  await updateBookingSyncState(
    adminClient,
    booking.id,
    {
      google_sync_status:
        "pending",

      google_sync_error:
        null,

      google_synced_at:
        null,
    }
  );

  try {
    const refreshToken =
      decryptGoogleToken(
        connection.refresh_token_encrypted
      );

    const oauthClient =
      createGoogleOAuthClientWithRefreshToken(
        refreshToken
      );

    const calendar =
      google.calendar({
        version: "v3",
        auth: oauthClient,
      });

    try {
      await calendar.events.delete(
        {
          calendarId:
            connection.calendar_id,

          eventId:
            booking.google_event_id,
        }
      );
    } catch (error) {
      if (
        !isMissingGoogleEvent(
          error
        )
      ) {
        throw error;
      }
    }

    const syncedAt =
      new Date().toISOString();

    await updateBookingSyncState(
      adminClient,
      booking.id,
      {
        google_sync_status:
          "deleted",

        google_sync_error:
          null,

        google_synced_at:
          syncedAt,
      }
    );

    await updateConnectionSuccess(
      adminClient,
      booking.business_id,
      syncedAt
    );

    return {
      ok: true,
      action: "deleted",
      eventId:
        booking.google_event_id,

      message:
        "Google Calendar event was deleted.",
    };
  } catch (error) {
    return recordSyncFailure(
      adminClient,
      booking,
      error
    );
  }
}

export async function syncBookingToGoogleCalendar(
  bookingId: string
): Promise<GoogleCalendarSyncResult> {
  const normalizedBookingId =
    bookingId.trim();

  if (!normalizedBookingId) {
    return {
      ok: false,
      action: "failed",
      message:
        "Missing booking ID.",
    };
  }

  const adminClient =
    createAdminClient();

  let context:
    | LoadedBookingContext
    | null;

  try {
    context =
      await loadBookingContext(
        adminClient,
        normalizedBookingId
      );
  } catch (error) {
    logServerError(
      "calendar.salon.context_load.failed",
      error,
      {
        bookingId:
          normalizedBookingId,
      }
    );

    return {
      ok: false,
      action: "failed",
      message:
        getErrorMessage(
          error
        ),
    };
  }

  if (!context) {
    return {
      ok: false,
      action: "failed",
      message:
        "Booking was not found.",
    };
  }

  const {
    booking,
  } = context;

  if (
    booking.status ===
    "confirmed"
  ) {
    return syncConfirmedBooking(
      adminClient,
      context
    );
  }

  if (
    booking.status ===
    "cancelled"
  ) {
    return deleteCancelledBooking(
      adminClient,
      context
    );
  }

  if (
    booking.status ===
    "pending"
  ) {
    try {
      await updateBookingSyncState(
        adminClient,
        booking.id,
        {
          google_sync_status:
            "not_required",

          google_sync_error:
            null,

          google_synced_at:
            null,
        }
      );
    } catch (error) {
      return recordSyncFailure(
        adminClient,
        booking,
        error
      );
    }

    return {
      ok: true,
      action: "skipped",
      message:
        "Pending bookings are not synchronized until they are confirmed.",
    };
  }

  return {
    ok: true,
    action: "skipped",
    eventId:
      booking.google_event_id ??
      undefined,

    message:
      `Booking status "${booking.status}" does not require a Google Calendar change.`,
  };
}
