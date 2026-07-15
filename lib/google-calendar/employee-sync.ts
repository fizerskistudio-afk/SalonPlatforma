import "server-only";

import {
  google,
  type calendar_v3,
} from "googleapis";

import {
  decryptGoogleToken,
} from "@/lib/google-calendar/crypto";
import {
  createGoogleOAuthClientWithRefreshToken,
} from "@/lib/google-calendar/oauth";
import type {
  GoogleCalendarSyncResult,
} from "@/lib/google-calendar/sync";
import {
  logServerError,
} from "@/lib/monitoring/server";
import {
  resolveProductFeatureGate,
} from "@/lib/product-packages/gates";
import {
  resolveProductPackageAccess,
  type ProductPackageAssignmentRow,
} from "@/lib/product-packages/resolver";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

const MAX_ERROR_LENGTH = 1000;
const MAX_DESCRIPTION_LENGTH = 8000;

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
};

type BusinessRow =
  ProductPackageAssignmentRow & {
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

type ConnectionRow = {
  business_id: string;
  employee_id: string;
  calendar_id: string;
  refresh_token_encrypted: string;
  is_active: boolean;
};

type EventMappingRow = {
  id: string;
  booking_id: string;
  business_id: string;
  employee_id: string;
  google_event_id: string;
  sync_status: string;
  sync_error: string | null;
  synced_at: string | null;
};

type LoadedContext = {
  booking: BookingRow;
  business: BusinessRow | null;
  service: ServiceRow | null;
  employee: EmployeeRow | null;
  currentConnection:
    | ConnectionRow
    | null;
  mappings: EventMappingRow[];
};

type AdminClient =
  ReturnType<
    typeof createAdminClient
  >;

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
    typeof value ===
    "string"
  ) {
    return value.trim();
  }

  if (!isRecord(value)) {
    return "";
  }

  for (const locale of [
    preferredLocale,
    "sr-Latn",
    "en",
    "mk",
    "sq",
  ]) {
    const candidate =
      value[locale];

    if (
      typeof candidate ===
        "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  for (const candidate of
    Object.values(value)) {
    if (
      typeof candidate ===
        "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
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
      MAX_ERROR_LENGTH
    );
  }

  if (isRecord(error)) {
    const response =
      error.response;

    if (isRecord(response)) {
      const responseData =
        response.data;

      if (isRecord(responseData)) {
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
            MAX_ERROR_LENGTH
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
        MAX_ERROR_LENGTH
      );
    }
  }

  return "Unknown employee Google Calendar synchronization error.";
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

function isMissingEvent(
  error: unknown
): boolean {
  const status =
    getHttpStatus(error);

  return (
    status === 404 ||
    status === 410
  );
}

function isConflict(
  error: unknown
): boolean {
  return (
    getHttpStatus(error) ===
    409
  );
}

function createEmployeeEventId(
  bookingId: string
): string {
  const normalized =
    bookingId
      .replace(
        /[^0-9a-f]/gi,
        ""
      )
      .toLowerCase();

  return `e${normalized}`;
}

function formatPrice(
  amount:
    | number
    | string,
  currency: string
): string {
  const numericAmount =
    typeof amount ===
    "number"
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

  return location || undefined;
}

function createDescription(
  booking: BookingRow,
  business: BusinessRow,
  serviceName: string,
  employeeName: string
): string {
  const lines = [
    `Salon: ${business.name}`,
    `Rezervacija: ${booking.reference_code}`,
    "",
    `Klijent: ${booking.customer_name}`,
    booking.customer_phone
      ? `Telefon: ${booking.customer_phone}`
      : null,
    booking.customer_email
      ? `Email: ${booking.customer_email}`
      : null,
    "",
    `Usluga: ${serviceName}`,
    `Frizer: ${employeeName}`,
    `Trajanje: ${booking.duration_minutes} min`,
    `Cena: ${formatPrice(
      booking.price_amount,
      booking.currency
    )}`,
    `Izvor: ${booking.source}`,
  ];

  if (
    booking.customer_note?.trim()
  ) {
    lines.push(
      "",
      "Napomena klijenta:",
      booking.customer_note.trim()
    );
  }

  if (
    booking.internal_note?.trim()
  ) {
    lines.push(
      "",
      "Interna napomena:",
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
  context: LoadedContext
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
      "Booking relations required for employee Google Calendar synchronization were not found."
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
        employeeId:
          booking.employee_id,
        referenceCode:
          booking.reference_code,
        calendarScope:
          "employee",
      },
    },
  };
}

async function loadConnection(
  adminClient: AdminClient,
  businessId: string,
  employeeId: string
): Promise<ConnectionRow | null> {
  const {
    data,
    error,
  } = await adminClient
    .from(
      "employee_google_calendar_connections"
    )
    .select(
      "business_id, employee_id, calendar_id, refresh_token_encrypted, is_active"
    )
    .eq(
      "business_id",
      businessId
    )
    .eq(
      "employee_id",
      employeeId
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load employee Google Calendar connection: ${error.message}`
    );
  }

  return data as
    | ConnectionRow
    | null;
}

async function loadContext(
  adminClient: AdminClient,
  bookingId: string
): Promise<LoadedContext | null> {
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
        "service_id",
        "employee_id",
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
      ].join(", ")
    )
    .eq(
      "id",
      bookingId
    )
    .maybeSingle();

  if (bookingError) {
    throw new Error(
      `Failed to load booking for employee Google Calendar synchronization: ${bookingError.message}`
    );
  }

  if (!bookingData) {
    return null;
  }

  const booking =
    bookingData as unknown as BookingRow;

  const [
    businessResult,
    serviceResult,
    employeeResult,
    mappingResult,
    currentConnection,
  ] = await Promise.all([
    adminClient
      .from("businesses")
      .select(
        "id, name, timezone, default_locale, address, city, package_key, package_contract_version, package_assigned_at, package_assigned_by_user_id"
      )
      .eq(
        "id",
        booking.business_id
      )
      .maybeSingle(),
    adminClient
      .from("services")
      .select("id, name")
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
      .select("id, name")
      .eq(
        "id",
        booking.employee_id
      )
      .eq(
        "business_id",
        booking.business_id
      )
      .maybeSingle(),
    adminClient
      .from(
        "employee_google_calendar_events"
      )
      .select(
        "id, booking_id, business_id, employee_id, google_event_id, sync_status, sync_error, synced_at"
      )
      .eq(
        "booking_id",
        booking.id
      ),
    loadConnection(
      adminClient,
      booking.business_id,
      booking.employee_id
    ),
  ]);

  if (businessResult.error) {
    throw new Error(
      `Failed to load business for employee Google Calendar synchronization: ${businessResult.error.message}`
    );
  }

  if (serviceResult.error) {
    throw new Error(
      `Failed to load service for employee Google Calendar synchronization: ${serviceResult.error.message}`
    );
  }

  if (employeeResult.error) {
    throw new Error(
      `Failed to load employee for Google Calendar synchronization: ${employeeResult.error.message}`
    );
  }

  if (mappingResult.error) {
    throw new Error(
      `Failed to load employee Google event mappings: ${mappingResult.error.message}`
    );
  }

  return {
    booking,
    business:
      businessResult.data as
        | BusinessRow
        | null,
    service:
      serviceResult.data as
        | ServiceRow
        | null,
    employee:
      employeeResult.data as
        | EmployeeRow
        | null,
    currentConnection,
    mappings:
      (mappingResult.data ??
        []) as EventMappingRow[],
  };
}

async function updateConnectionSuccess(
  adminClient: AdminClient,
  businessId: string,
  employeeId: string,
  syncedAt: string
): Promise<void> {
  const {
    error,
  } = await adminClient
    .from(
      "employee_google_calendar_connections"
    )
    .update({
      last_synced_at:
        syncedAt,
      last_error: null,
    })
    .eq(
      "business_id",
      businessId
    )
    .eq(
      "employee_id",
      employeeId
    );

  if (error) {
    logServerError(
      "calendar.employee.connection_success_state.failed",
      error,
      {
        businessId,
        employeeId,
      }
    );
  }
}

async function updateConnectionFailure(
  adminClient: AdminClient,
  businessId: string,
  employeeId: string,
  errorMessage: string
): Promise<void> {
  const {
    error,
  } = await adminClient
    .from(
      "employee_google_calendar_connections"
    )
    .update({
      last_error:
        errorMessage,
    })
    .eq(
      "business_id",
      businessId
    )
    .eq(
      "employee_id",
      employeeId
    );

  if (error) {
    logServerError(
      "calendar.employee.connection_failure_state.failed",
      error,
      {
        businessId,
        employeeId,
      }
    );
  }
}

async function upsertMapping(
  adminClient: AdminClient,
  input: {
    bookingId: string;
    businessId: string;
    employeeId: string;
    eventId: string;
    status:
      | "pending"
      | "synced"
      | "failed"
      | "deleted";
    error: string | null;
    syncedAt: string | null;
  }
): Promise<void> {
  const {
    error,
  } = await adminClient
    .from(
      "employee_google_calendar_events"
    )
    .upsert(
      {
        booking_id:
          input.bookingId,
        business_id:
          input.businessId,
        employee_id:
          input.employeeId,
        google_event_id:
          input.eventId,
        sync_status:
          input.status,
        sync_error:
          input.error,
        synced_at:
          input.syncedAt,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "booking_id,employee_id",
      }
    );

  if (error) {
    throw new Error(
      `Failed to save employee Google event mapping: ${error.message}`
    );
  }
}

async function deleteMapping(
  adminClient: AdminClient,
  mappingId: string
): Promise<void> {
  const {
    error,
  } = await adminClient
    .from(
      "employee_google_calendar_events"
    )
    .delete()
    .eq(
      "id",
      mappingId
    );

  if (error) {
    throw new Error(
      `Failed to delete employee Google event mapping: ${error.message}`
    );
  }
}

function createCalendarClient(
  connection: ConnectionRow
) {
  const refreshToken =
    decryptGoogleToken(
      connection.refresh_token_encrypted
    );

  const oauthClient =
    createGoogleOAuthClientWithRefreshToken(
      refreshToken
    );

  return google.calendar({
    version: "v3",
    auth: oauthClient,
  });
}

async function deleteMappedEvent(
  adminClient: AdminClient,
  mapping: EventMappingRow
): Promise<{
  ok: boolean;
  message: string;
}> {
  const connection =
    await loadConnection(
      adminClient,
      mapping.business_id,
      mapping.employee_id
    );

  if (
    !connection ||
    !connection.is_active
  ) {
    const message =
      "Employee Google Calendar connection required to delete an old event is missing.";

    await upsertMapping(
      adminClient,
      {
        bookingId:
          mapping.booking_id,
        businessId:
          mapping.business_id,
        employeeId:
          mapping.employee_id,
        eventId:
          mapping.google_event_id,
        status:
          "failed",
        error:
          message,
        syncedAt:
          null,
      }
    );

    return {
      ok: false,
      message,
    };
  }

  try {
    const calendar =
      createCalendarClient(
        connection
      );

    try {
      await calendar.events.delete({
        calendarId:
          connection.calendar_id,
        eventId:
          mapping.google_event_id,
      });
    } catch (error) {
      if (!isMissingEvent(error)) {
        throw error;
      }
    }

    await deleteMapping(
      adminClient,
      mapping.id
    );

    await updateConnectionSuccess(
      adminClient,
      mapping.business_id,
      mapping.employee_id,
      new Date().toISOString()
    );

    return {
      ok: true,
      message:
        "Old employee Google event was deleted.",
    };
  } catch (error) {
    const message =
      getErrorMessage(error);

    logServerError(
      "calendar.employee.delete.failed",
      error,
      {
        bookingId:
          mapping.booking_id,
        businessId:
          mapping.business_id,
        employeeId:
          mapping.employee_id,
      }
    );

    await upsertMapping(
      adminClient,
      {
        bookingId:
          mapping.booking_id,
        businessId:
          mapping.business_id,
        employeeId:
          mapping.employee_id,
        eventId:
          mapping.google_event_id,
        status:
          "failed",
        error:
          message,
        syncedAt:
          null,
      }
    );

    await updateConnectionFailure(
      adminClient,
      mapping.business_id,
      mapping.employee_id,
      message
    );

    return {
      ok: false,
      message,
    };
  }
}

async function synchronizeCurrentEmployeeEvent(
  adminClient: AdminClient,
  context: LoadedContext
): Promise<GoogleCalendarSyncResult> {
  const {
    booking,
    currentConnection,
    mappings,
  } = context;

  if (
    !currentConnection ||
    !currentConnection.is_active
  ) {
    return {
      ok: true,
      action: "skipped",
      message:
        "Employee Google Calendar is not connected.",
    };
  }

  const existingMapping =
    mappings.find(
      (mapping) =>
        mapping.employee_id ===
        booking.employee_id
    ) ?? null;

  const eventId =
    existingMapping
      ?.google_event_id ??
    createEmployeeEventId(
      booking.id
    );

  try {
    await upsertMapping(
      adminClient,
      {
        bookingId:
          booking.id,
        businessId:
          booking.business_id,
        employeeId:
          booking.employee_id,
        eventId,
        status:
          "pending",
        error: null,
        syncedAt: null,
      }
    );

    const calendar =
      createCalendarClient(
        currentConnection
      );

    const requestBody =
      createEventBody(
        context
      );

    let action:
      | "created"
      | "updated" =
      existingMapping
        ? "updated"
        : "created";

    if (existingMapping) {
      try {
        await calendar.events.update({
          calendarId:
            currentConnection.calendar_id,
          eventId,
          requestBody,
        });
      } catch (error) {
        if (!isMissingEvent(error)) {
          throw error;
        }

        await calendar.events.insert({
          calendarId:
            currentConnection.calendar_id,
          requestBody: {
            ...requestBody,
            id: eventId,
          },
        });
        action = "created";
      }
    } else {
      try {
        await calendar.events.insert({
          calendarId:
            currentConnection.calendar_id,
          requestBody: {
            ...requestBody,
            id: eventId,
          },
        });
      } catch (error) {
        if (!isConflict(error)) {
          throw error;
        }

        await calendar.events.update({
          calendarId:
            currentConnection.calendar_id,
          eventId,
          requestBody,
        });
        action = "updated";
      }
    }

    const syncedAt =
      new Date().toISOString();

    await upsertMapping(
      adminClient,
      {
        bookingId:
          booking.id,
        businessId:
          booking.business_id,
        employeeId:
          booking.employee_id,
        eventId,
        status:
          "synced",
        error: null,
        syncedAt,
      }
    );

    await updateConnectionSuccess(
      adminClient,
      booking.business_id,
      booking.employee_id,
      syncedAt
    );

    return {
      ok: true,
      action,
      message:
        action === "created"
          ? "Employee Google Calendar event was created."
          : "Employee Google Calendar event was updated.",
      eventId,
    };
  } catch (error) {
    const message =
      getErrorMessage(error);

    logServerError(
      "calendar.employee.sync.failed",
      error,
      {
        bookingId:
          booking.id,
        businessId:
          booking.business_id,
        employeeId:
          booking.employee_id,
      }
    );

    try {
      await upsertMapping(
        adminClient,
        {
          bookingId:
            booking.id,
          businessId:
            booking.business_id,
          employeeId:
            booking.employee_id,
          eventId,
          status:
            "failed",
          error:
            message,
          syncedAt:
            null,
        }
      );
    } catch (mappingError) {
      logServerError(
        "calendar.employee.mapping_failure_record.failed",
        mappingError,
        {
          bookingId:
            booking.id,
          businessId:
            booking.business_id,
          employeeId:
            booking.employee_id,
        }
      );
    }

    await updateConnectionFailure(
      adminClient,
      booking.business_id,
      booking.employee_id,
      message
    );

    return {
      ok: false,
      action: "failed",
      message,
      eventId,
    };
  }
}

export async function syncBookingToEmployeeGoogleCalendar(
  bookingId: string
): Promise<GoogleCalendarSyncResult> {
  const adminClient =
    createAdminClient();

  let context: LoadedContext | null;

  try {
    context =
      await loadContext(
        adminClient,
        bookingId
      );
  } catch (error) {
    logServerError(
      "calendar.employee.context_load.failed",
      error,
      {
        bookingId,
      }
    );

    return {
      ok: false,
      action: "failed",
      message:
        getErrorMessage(error),
    };
  }

  if (!context) {
    return {
      ok: false,
      action: "failed",
      message:
        "Booking was not found for employee Google Calendar synchronization.",
    };
  }

  const {
    booking,
    mappings,
  } = context;

  const packageDecision =
    context.business
      ? resolveProductFeatureGate({
          access:
            resolveProductPackageAccess(
              context.business
            ),
          featureKey:
            "staff.employee_calendar_sync",
          permissionGranted:
            true,
          integrationConnected:
            true,
        })
      : null;

  if (
    packageDecision &&
    !packageDecision
      .entitled
  ) {
    return {
      ok: true,
      action:
        "skipped",
      message:
        `Employee Google Calendar sync requires ${
          packageDecision
            .minimumPackage
            ?.name ??
          "Operations Pro"
        }.`,
    };
  }

  if (
    booking.status ===
    "cancelled"
  ) {
    if (
      mappings.length === 0
    ) {
      return {
        ok: true,
        action: "skipped",
        message:
          "No employee Google Calendar events existed for the cancelled booking.",
      };
    }

    const deletionResults =
      await Promise.all(
        mappings.map(
          (mapping) =>
            deleteMappedEvent(
              adminClient,
              mapping
            )
        )
      );

    const failed =
      deletionResults.filter(
        (result) =>
          !result.ok
      );

    if (failed.length > 0) {
      return {
        ok: false,
        action: "failed",
        message:
          failed
            .map(
              (result) =>
                result.message
            )
            .join(" | "),
      };
    }

    return {
      ok: true,
      action: "deleted",
      message:
        "Employee Google Calendar events were deleted.",
    };
  }

  if (
    booking.status !==
    "confirmed"
  ) {
    return {
      ok: true,
      action: "skipped",
      message:
        "Employee Google Calendar synchronization is not required for this booking status.",
    };
  }

  const staleMappings =
    mappings.filter(
      (mapping) =>
        mapping.employee_id !==
        booking.employee_id
    );

  const staleResults =
    await Promise.all(
      staleMappings.map(
        (mapping) =>
          deleteMappedEvent(
            adminClient,
            mapping
          )
      )
    );

  const currentResult =
    await synchronizeCurrentEmployeeEvent(
      adminClient,
      context
    );

  const staleFailures =
    staleResults.filter(
      (result) =>
        !result.ok
    );

  if (
    staleFailures.length > 0
  ) {
    return {
      ok: false,
      action: "failed",
      message: [
        currentResult.message,
        ...staleFailures.map(
          (result) =>
            result.message
        ),
      ].join(" | "),
      eventId:
        currentResult.eventId,
    };
  }

  return currentResult;
}
