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
  booking_request_received_enabled: boolean;
  booking_confirmed_enabled: boolean;
  booking_rescheduled_enabled: boolean;
  booking_cancelled_enabled: boolean;
  business_new_booking_enabled: boolean;
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
          business_notifications_enabled,
          booking_request_received_enabled,
          booking_confirmed_enabled,
          booking_rescheduled_enabled,
          booking_cancelled_enabled,
          business_new_booking_enabled
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

type CustomerBookingNotificationTemplateKey =
  | "booking_request_received"
  | "booking_confirmed"
  | "booking_rescheduled"
  | "booking_cancelled";

function resolveCustomerTemplateKey(
  context: LoadedBookingNotificationContext,
  templateKey?: CustomerBookingNotificationTemplateKey
): CustomerBookingNotificationTemplateKey {
  if (templateKey) {
    return templateKey;
  }

  if (context.booking.status === "confirmed") {
    return "booking_confirmed";
  }

  if (context.booking.status === "cancelled") {
    return "booking_cancelled";
  }

  return "booking_request_received";
}

function isCustomerNotificationEnabled(
  context: LoadedBookingNotificationContext,
  templateKey?: CustomerBookingNotificationTemplateKey
): boolean {
  const settings = context.settings;

  if (settings?.customer_notifications_enabled === false) {
    return false;
  }

  if (!settings) {
    return true;
  }

  switch (resolveCustomerTemplateKey(context, templateKey)) {
    case "booking_request_received":
      return settings.booking_request_received_enabled;
    case "booking_confirmed":
      return settings.booking_confirmed_enabled;
    case "booking_rescheduled":
      return settings.booking_rescheduled_enabled;
    case "booking_cancelled":
      return settings.booking_cancelled_enabled;
  }
}

function isBusinessNotificationEnabled(
  context: LoadedBookingNotificationContext
): boolean {
  const settings = context.settings;

  return (
    (settings?.business_notifications_enabled ?? true) &&
    (settings?.business_new_booking_enabled ?? true)
  );
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
        context,
        "booking_rescheduled"
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

type RetryableBookingNotificationTemplateKey =
  | "booking_request_received"
  | "booking_confirmed"
  | "booking_rescheduled"
  | "booking_cancelled"
  | "business_new_booking";

type RetryDeliveryRow = {
  id: string;
  business_id: string | null;
  booking_id: string | null;
  template_key: string;
  dedupe_key: string;
  original_recipient: string;
  status: string;
};

export type RetryBookingNotificationResult = {
  ok: boolean;
  message: string;
};

function isRetryableBookingTemplate(
  value: string
): value is RetryableBookingNotificationTemplateKey {
  return [
    "booking_request_received",
    "booking_confirmed",
    "booking_rescheduled",
    "booking_cancelled",
    "business_new_booking",
  ].includes(value);
}

export async function retryBookingNotificationDeliverySafely(
  deliveryId: string,
  expectedBusinessId: string
): Promise<RetryBookingNotificationResult> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("notification_deliveries")
      .select(
        `
          id,
          business_id,
          booking_id,
          template_key,
          dedupe_key,
          original_recipient,
          status
        `
      )
      .eq("id", deliveryId)
      .eq("business_id", expectedBusinessId)
      .maybeSingle();

    if (error) {
      return {
        ok: false,
        message: `Notifikaciju nije moguće učitati: ${error.message}`,
      };
    }

    if (!data) {
      return {
        ok: false,
        message: "Notifikacija nije pronađena ili ne pripada ovom salonu.",
      };
    }

    const delivery = data as unknown as RetryDeliveryRow;

    if (delivery.status === "sent") {
      return {
        ok: false,
        message: "Već poslata notifikacija ne može ponovo da se šalje.",
      };
    }

    if (delivery.status !== "failed" && delivery.status !== "skipped") {
      return {
        ok: false,
        message: "Samo neuspešna ili preskočena notifikacija može da se ponovi.",
      };
    }

    const templateKey = delivery.template_key;

    if (!delivery.booking_id || !isRetryableBookingTemplate(templateKey)) {
      return {
        ok: false,
        message: "Ovaj tip notifikacije trenutno ne podržava ručni retry.",
      };
    }

    const context = await loadBookingNotificationContext(delivery.booking_id);

    if (!context || context.business.id !== expectedBusinessId) {
      return {
        ok: false,
        message: "Rezervacija povezana sa notifikacijom nije pronađena.",
      };
    }

    let audience: "customer" | "business" = "customer";
    let content: { subject: string; html: string; text: string } | null = null;

    switch (templateKey) {
      case "booking_request_received":
        content = renderBookingRequestReceivedEmail(context.template);
        break;
      case "booking_confirmed":
        content = renderBookingConfirmedEmail(context.template);
        break;
      case "booking_rescheduled":
        content = renderBookingRescheduledEmail(context.template);
        break;
      case "booking_cancelled":
        content = renderBookingCancelledEmail(context.template);
        break;
      case "business_new_booking":
        audience = "business";
        content = renderNewBookingBusinessEmail(context.template);
        break;
    }

    if (!content) {
      return {
        ok: false,
        message: "Email sadržaj za retry nije moguće pripremiti.",
      };
    }

    const result = await sendNotificationEmail({
      scope: "business",
      audience,
      templateKey,
      dedupeKey: delivery.dedupe_key,
      recipient: delivery.original_recipient,
      businessId: context.business.id,
      bookingId: context.booking.id,
      ...content,
      metadata: {
        manualRetry: true,
        referenceCode: context.booking.reference_code,
      },
    });

    return {
      ok: result.ok && result.status === "sent",
      message:
        result.ok && result.status === "sent"
          ? "Notifikacija je uspešno poslata."
          : result.message,
    };
  } catch (error) {
    console.error("Manual booking notification retry failed:", {
      deliveryId,
      expectedBusinessId,
      error,
    });

    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Notifikacija trenutno ne može ponovo da se pošalje.",
    };
  }
}
