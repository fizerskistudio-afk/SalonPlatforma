import "server-only";

import {
  sendNotificationEmail,
} from "@/lib/notifications/delivery";
import {
  renderBookingCancelledEmail,
  renderBookingConfirmedEmail,
  renderBookingRequestReceivedEmail,
  renderBookingRescheduledEmail,
  renderNewBookingBusinessEmail,
  type BookingNotificationTemplateContext,
} from "@/lib/notifications/templates";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

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

  starts_at: string;
  ends_at: string;
  duration_minutes: number;

  price_amount:
    | number
    | string;
  currency: string;

  status: BookingStatus;
  cancellation_reason:
    | string
    | null;

  updated_at: string;
};

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  email: string | null;
  phone: string | null;
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

type BusinessEmailSettingsRow = {
  notification_email:
    | string
    | null;
  customer_notifications_enabled: boolean;
  business_notifications_enabled: boolean;
};

type LoadedBookingNotificationContext = {
  booking: BookingRow;
  business: BusinessRow;
  service: ServiceRow;
  employee: EmployeeRow;
  settings:
    | BusinessEmailSettingsRow
    | null;
  template:
    BookingNotificationTemplateContext;
};

export type BookingNotificationResult = {
  ok: boolean;
  customerSent: boolean;
  businessSent: boolean;
};

function getLocalizedValue(
  value: unknown,
  preferredLocale: string
): string {
  if (
    typeof value === "string"
  ) {
    return value.trim();
  }

  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return "";
  }

  const record =
    value as Record<
      string,
      unknown
    >;

  const preferred =
    record[preferredLocale];

  if (
    typeof preferred ===
      "string" &&
    preferred.trim()
  ) {
    return preferred.trim();
  }

  for (
    const fallbackLocale of [
      "sr-Latn",
      "sr",
      "en",
      "mk",
      "sq",
    ]
  ) {
    const candidate =
      record[fallbackLocale];

    if (
      typeof candidate ===
        "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  for (
    const candidate of
    Object.values(record)
  ) {
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

function createBusinessAddress(
  business: BusinessRow
): string | null {
  const address =
    getLocalizedValue(
      business.address,
      business.default_locale
    );

  const city =
    getLocalizedValue(
      business.city,
      business.default_locale
    );

  const value = [
    address,
    city,
  ]
    .filter(Boolean)
    .join(", ");

  return value || null;
}

async function loadBookingNotificationContext(
  bookingId: string
): Promise<LoadedBookingNotificationContext | null> {
  const supabase =
    createAdminClient();

  const {
    data: bookingData,
    error: bookingError,
  } = await supabase
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
        starts_at,
        ends_at,
        duration_minutes,
        price_amount,
        currency,
        status,
        cancellation_reason,
        updated_at
      `
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    throw new Error(
      `Booking notification context could not be loaded: ${bookingError.message}`
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
    settingsResult,
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select(
        `
          id,
          slug,
          name,
          email,
          phone,
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

    supabase
      .from("services")
      .select("id, name")
      .eq(
        "id",
        booking.service_id
      )
      .maybeSingle(),

    supabase
      .from("employees")
      .select("id, name")
      .eq(
        "id",
        booking.employee_id
      )
      .maybeSingle(),

    supabase
      .from(
        "business_email_settings"
      )
      .select(
        `
          notification_email,
          customer_notifications_enabled,
          business_notifications_enabled
        `
      )
      .eq(
        "business_id",
        booking.business_id
      )
      .maybeSingle(),
  ]);

  if (
    businessResult.error ||
    !businessResult.data
  ) {
    throw new Error(
      `Business notification context could not be loaded: ${businessResult.error?.message ?? "business not found"}`
    );
  }

  if (
    serviceResult.error ||
    !serviceResult.data
  ) {
    throw new Error(
      `Service notification context could not be loaded: ${serviceResult.error?.message ?? "service not found"}`
    );
  }

  if (
    employeeResult.error ||
    !employeeResult.data
  ) {
    throw new Error(
      `Employee notification context could not be loaded: ${employeeResult.error?.message ?? "employee not found"}`
    );
  }

  if (settingsResult.error) {
    throw new Error(
      `Business notification settings could not be loaded: ${settingsResult.error.message}`
    );
  }

  const business =
    businessResult.data as unknown as BusinessRow;

  const service =
    serviceResult.data as unknown as ServiceRow;

  const employee =
    employeeResult.data as unknown as EmployeeRow;

  const settings =
    settingsResult.data
      ? settingsResult.data as unknown as BusinessEmailSettingsRow
      : null;

  return {
    booking,
    business,
    service,
    employee,
    settings,
    template: {
      businessName:
        business.name,
      businessPhone:
        business.phone,
      businessEmail:
        business.email,
      businessAddress:
        createBusinessAddress(
          business
        ),
      timezone:
        business.timezone,

      referenceCode:
        booking.reference_code,
      customerName:
        booking.customer_name,
      customerPhone:
        booking.customer_phone,
      customerEmail:
        booking.customer_email,

      serviceName:
        getLocalizedValue(
          service.name,
          business.default_locale
        ) || "Usluga",
      employeeName:
        employee.name,

      startsAt:
        booking.starts_at,
      endsAt:
        booking.ends_at,
      durationMinutes:
        booking.duration_minutes,

      priceAmount:
        booking.price_amount,
      currency:
        booking.currency,

      cancellationReason:
        booking.cancellation_reason,
    },
  };
}

function isCustomerNotificationEnabled(
  context:
    LoadedBookingNotificationContext
): boolean {
  return context.settings
    ?.customer_notifications_enabled ??
    true;
}

function isBusinessNotificationEnabled(
  context:
    LoadedBookingNotificationContext
): boolean {
  return context.settings
    ?.business_notifications_enabled ??
    true;
}

async function sendCustomerCreatedNotification(
  context:
    LoadedBookingNotificationContext
): Promise<boolean> {
  const recipient =
    context.booking
      .customer_email
      ?.trim();

  if (
    !recipient ||
    !isCustomerNotificationEnabled(
      context
    )
  ) {
    return false;
  }

  const confirmed =
    context.booking.status ===
      "confirmed";

  const content =
    confirmed
      ? renderBookingConfirmedEmail(
          context.template
        )
      : renderBookingRequestReceivedEmail(
          context.template
        );

  const result =
    await sendNotificationEmail({
      scope: "business",
      audience: "customer",
      templateKey:
        confirmed
          ? "booking_confirmed"
          : "booking_request_received",
      dedupeKey:
        confirmed
          ? `booking:${context.booking.id}:customer:confirmed`
          : `booking:${context.booking.id}:customer:request_received`,
      recipient,
      businessId:
        context.business.id,
      bookingId:
        context.booking.id,
      ...content,
      metadata: {
        bookingStatus:
          context.booking.status,
        referenceCode:
          context.booking.reference_code,
      },
    });

  return result.ok &&
    result.status === "sent";
}

async function sendBusinessNewBookingNotification(
  context:
    LoadedBookingNotificationContext
): Promise<boolean> {
  const recipient =
    context.settings
      ?.notification_email
      ?.trim() ??
    context.business.email?.trim();

  if (
    !recipient ||
    !isBusinessNotificationEnabled(
      context
    )
  ) {
    return false;
  }

  const content =
    renderNewBookingBusinessEmail(
      context.template
    );

  const result =
    await sendNotificationEmail({
      scope: "business",
      audience: "business",
      templateKey:
        "business_new_booking",
      dedupeKey:
        `booking:${context.booking.id}:business:new_booking`,
      recipient,
      businessId:
        context.business.id,
      bookingId:
        context.booking.id,
      ...content,
      metadata: {
        bookingStatus:
          context.booking.status,
        referenceCode:
          context.booking.reference_code,
      },
    });

  return result.ok &&
    result.status === "sent";
}

async function sendCustomerStatusNotification(
  context:
    LoadedBookingNotificationContext,
  status: BookingStatus
): Promise<boolean> {
  const recipient =
    context.booking
      .customer_email
      ?.trim();

  if (
    !recipient ||
    !isCustomerNotificationEnabled(
      context
    )
  ) {
    return false;
  }

  if (status === "confirmed") {
    const content =
      renderBookingConfirmedEmail(
        context.template
      );

    const result =
      await sendNotificationEmail({
        scope: "business",
        audience: "customer",
        templateKey:
          "booking_confirmed",
        dedupeKey:
          `booking:${context.booking.id}:customer:confirmed`,
        recipient,
        businessId:
          context.business.id,
        bookingId:
          context.booking.id,
        ...content,
        metadata: {
          referenceCode:
            context.booking.reference_code,
        },
      });

    return result.ok &&
      result.status === "sent";
  }

  if (status === "cancelled") {
    const content =
      renderBookingCancelledEmail(
        context.template
      );

    const result =
      await sendNotificationEmail({
        scope: "business",
        audience: "customer",
        templateKey:
          "booking_cancelled",
        dedupeKey:
          `booking:${context.booking.id}:customer:cancelled`,
        recipient,
        businessId:
          context.business.id,
        bookingId:
          context.booking.id,
        ...content,
        metadata: {
          referenceCode:
            context.booking.reference_code,
        },
      });

    return result.ok &&
      result.status === "sent";
  }

  return false;
}

export async function notifyBookingCreatedSafely(
  bookingId: string
): Promise<BookingNotificationResult> {
  try {
    const context =
      await loadBookingNotificationContext(
        bookingId
      );

    if (!context) {
      return {
        ok: false,
        customerSent: false,
        businessSent: false,
      };
    }

    const [
      customerSent,
      businessSent,
    ] = await Promise.all([
      sendCustomerCreatedNotification(
        context
      ),
      sendBusinessNewBookingNotification(
        context
      ),
    ]);

    return {
      ok: true,
      customerSent,
      businessSent,
    };
  } catch (error) {
    console.error(
      "Booking creation notifications failed:",
      {
        bookingId,
        error,
      }
    );

    return {
      ok: false,
      customerSent: false,
      businessSent: false,
    };
  }
}

export async function notifyBookingStatusChangedSafely(
  bookingId: string,
  status: string
): Promise<BookingNotificationResult> {
  if (
    status !== "confirmed" &&
    status !== "cancelled"
  ) {
    return {
      ok: true,
      customerSent: false,
      businessSent: false,
    };
  }

  try {
    const context =
      await loadBookingNotificationContext(
        bookingId
      );

    if (!context) {
      return {
        ok: false,
        customerSent: false,
        businessSent: false,
      };
    }

    const customerSent =
      await sendCustomerStatusNotification(
        context,
        status
      );

    return {
      ok: true,
      customerSent,
      businessSent: false,
    };
  } catch (error) {
    console.error(
      "Booking status notification failed:",
      {
        bookingId,
        status,
        error,
      }
    );

    return {
      ok: false,
      customerSent: false,
      businessSent: false,
    };
  }
}

export async function notifyBookingRescheduledSafely(
  bookingId: string
): Promise<BookingNotificationResult> {
  try {
    const context =
      await loadBookingNotificationContext(
        bookingId
      );

    if (!context) {
      return {
        ok: false,
        customerSent: false,
        businessSent: false,
      };
    }

    const recipient =
      context.booking
        .customer_email
        ?.trim();

    if (
      !recipient ||
      !isCustomerNotificationEnabled(
        context
      )
    ) {
      return {
        ok: true,
        customerSent: false,
        businessSent: false,
      };
    }

    const content =
      renderBookingRescheduledEmail(
        context.template
      );

    const result =
      await sendNotificationEmail({
        scope: "business",
        audience: "customer",
        templateKey:
          "booking_rescheduled",
        dedupeKey:
          `booking:${context.booking.id}:customer:rescheduled:${context.booking.updated_at}`,
        recipient,
        businessId:
          context.business.id,
        bookingId:
          context.booking.id,
        ...content,
        metadata: {
          referenceCode:
            context.booking.reference_code,
          startsAt:
            context.booking.starts_at,
        },
      });

    return {
      ok: result.ok,
      customerSent:
        result.ok &&
        result.status === "sent",
      businessSent: false,
    };
  } catch (error) {
    console.error(
      "Booking reschedule notification failed:",
      {
        bookingId,
        error,
      }
    );

    return {
      ok: false,
      customerSent: false,
      businessSent: false,
    };
  }
}
