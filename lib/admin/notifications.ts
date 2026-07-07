import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import { getNotificationEmailConfig } from "@/lib/notifications/config";
import { createAdminClient } from "@/lib/supabase/admin";

export type ManagedNotificationTemplateKey =
  | "booking_request_received"
  | "booking_confirmed"
  | "booking_rescheduled"
  | "booking_cancelled"
  | "business_new_booking";

export type ProviderDeliveryStatus =
  | "unknown"
  | "sent"
  | "delivered"
  | "delayed"
  | "bounced"
  | "complained"
  | "failed"
  | "suppressed";

export type AdminNotificationSettings = {
  deliveryMode: "platform" | "custom_domain";
  domainStatus:
    | "not_configured"
    | "pending"
    | "verified"
    | "failed";
  customDomain: string | null;
  fromName: string | null;
  fromEmail: string | null;
  replyToEmail: string | null;
  notificationEmail: string | null;
  customerNotificationsEnabled: boolean;
  businessNotificationsEnabled: boolean;
  templates: Record<ManagedNotificationTemplateKey, boolean>;
};

export type AdminNotificationDelivery = {
  id: string;
  bookingId: string | null;
  bookingReference: string | null;
  customerName: string | null;
  templateKey: string;
  audience: string;
  originalRecipient: string;
  actualRecipient: string;
  sender: string;
  subject: string;
  status: "pending" | "sent" | "failed" | "skipped";
  attemptCount: number;
  testMode: boolean;
  error: string | null;
  providerMessageId: string | null;
  providerDeliveryStatus: ProviderDeliveryStatus;
  providerEventType: string | null;
  providerEventAt: string | null;
  providerError: string | null;
  providerEventCount: number;
  deliveredAt: string | null;
  delayedAt: string | null;
  bouncedAt: string | null;
  complainedAt: string | null;
  suppressedAt: string | null;
  lastAttemptAt: string | null;
  sentAt: string | null;
  createdAt: string;
};

export type AdminNotificationManagementData = {
  business: {
    id: string;
    name: string;
    email: string | null;
  };
  canManageSettings: boolean;
  testMode: boolean;
  testRecipient: string | null;
  settings: AdminNotificationSettings;
  summary: {
    total: number;
    sent: number;
    failed: number;
    skipped: number;
    pending: number;
  };
  deliveries: AdminNotificationDelivery[];
};

type EmailSettingsRow = {
  delivery_mode: "platform" | "custom_domain";
  domain_status:
    | "not_configured"
    | "pending"
    | "verified"
    | "failed";
  custom_domain: string | null;
  from_name: string | null;
  from_email: string | null;
  reply_to_email: string | null;
  notification_email: string | null;
  customer_notifications_enabled: boolean;
  business_notifications_enabled: boolean;
  booking_request_received_enabled: boolean;
  booking_confirmed_enabled: boolean;
  booking_rescheduled_enabled: boolean;
  booking_cancelled_enabled: boolean;
  business_new_booking_enabled: boolean;
};

type DeliveryRow = {
  id: string;
  booking_id: string | null;
  template_key: string;
  audience: string;
  original_recipient: string;
  actual_recipient: string;
  sender: string;
  subject: string;
  status: "pending" | "sent" | "failed" | "skipped";
  attempt_count: number;
  test_mode: boolean;
  error: string | null;
  provider_message_id: string | null;
  provider_delivery_status: ProviderDeliveryStatus;
  provider_event_type: string | null;
  provider_event_at: string | null;
  provider_error: string | null;
  provider_event_count: number;
  delivered_at: string | null;
  delayed_at: string | null;
  bounced_at: string | null;
  complained_at: string | null;
  suppressed_at: string | null;
  last_attempt_at: string | null;
  sent_at: string | null;
  created_at: string;
};

type BookingLookupRow = {
  id: string;
  reference_code: string;
  customer_name: string;
};

function createFallbackSettings(
  businessEmail: string | null
): AdminNotificationSettings {
  return {
    deliveryMode: "platform",
    domainStatus: "not_configured",
    customDomain: null,
    fromName: null,
    fromEmail: null,
    replyToEmail: businessEmail,
    notificationEmail: businessEmail,
    customerNotificationsEnabled: true,
    businessNotificationsEnabled: true,
    templates: {
      booking_request_received: true,
      booking_confirmed: true,
      booking_rescheduled: true,
      booking_cancelled: true,
      business_new_booking: true,
    },
  };
}

function mapSettings(row: EmailSettingsRow): AdminNotificationSettings {
  return {
    deliveryMode: row.delivery_mode,
    domainStatus: row.domain_status,
    customDomain: row.custom_domain,
    fromName: row.from_name,
    fromEmail: row.from_email,
    replyToEmail: row.reply_to_email,
    notificationEmail: row.notification_email,
    customerNotificationsEnabled: row.customer_notifications_enabled,
    businessNotificationsEnabled: row.business_notifications_enabled,
    templates: {
      booking_request_received: row.booking_request_received_enabled,
      booking_confirmed: row.booking_confirmed_enabled,
      booking_rescheduled: row.booking_rescheduled_enabled,
      booking_cancelled: row.booking_cancelled_enabled,
      business_new_booking: row.business_new_booking_enabled,
    },
  };
}

export async function getAdminNotificationManagement(): Promise<AdminNotificationManagementData> {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const [businessResult, settingsResult, deliveriesResult] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, name, email")
      .eq("id", admin.business.id)
      .maybeSingle(),

    supabase
      .from("business_email_settings")
      .select(
        `
          delivery_mode,
          domain_status,
          custom_domain,
          from_name,
          from_email,
          reply_to_email,
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
      .eq("business_id", admin.business.id)
      .maybeSingle(),

    supabase
      .from("notification_deliveries")
      .select(
        `
          id,
          booking_id,
          template_key,
          audience,
          original_recipient,
          actual_recipient,
          sender,
          subject,
          status,
          attempt_count,
          test_mode,
          error,
          provider_message_id,
          provider_delivery_status,
          provider_event_type,
          provider_event_at,
          provider_error,
          provider_event_count,
          delivered_at,
          delayed_at,
          bounced_at,
          complained_at,
          suppressed_at,
          last_attempt_at,
          sent_at,
          created_at
        `
      )
      .eq("business_id", admin.business.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (businessResult.error || !businessResult.data) {
    throw new Error(
      `Salon nije moguće učitati za email notifikacije: ${businessResult.error?.message ?? "salon nije pronađen"}`
    );
  }

  if (settingsResult.error) {
    throw new Error(
      `Podešavanja email notifikacija nije moguće učitati: ${settingsResult.error.message}`
    );
  }

  if (deliveriesResult.error) {
    throw new Error(
      `Istoriju email notifikacija nije moguće učitati: ${deliveriesResult.error.message}`
    );
  }

  const deliveryRows =
    (deliveriesResult.data ?? []) as unknown as DeliveryRow[];

  const bookingIds = Array.from(
    new Set(
      deliveryRows
        .map((row) => row.booking_id)
        .filter((value): value is string => Boolean(value))
    )
  );

  const bookingMap = new Map<string, BookingLookupRow>();

  if (bookingIds.length > 0) {
    const { data, error } = await supabase
      .from("bookings")
      .select("id, reference_code, customer_name")
      .in("id", bookingIds);

    if (error) {
      throw new Error(
        `Rezervacije povezane sa notifikacijama nije moguće učitati: ${error.message}`
      );
    }

    for (const booking of (data ?? []) as unknown as BookingLookupRow[]) {
      bookingMap.set(booking.id, booking);
    }
  }

  const business = businessResult.data as unknown as {
    id: string;
    name: string;
    email: string | null;
  };

  const settings = settingsResult.data
    ? mapSettings(settingsResult.data as unknown as EmailSettingsRow)
    : createFallbackSettings(business.email);

  const deliveries = deliveryRows.map(
    (row): AdminNotificationDelivery => {
      const booking = row.booking_id
        ? bookingMap.get(row.booking_id)
        : undefined;

      return {
        id: row.id,
        bookingId: row.booking_id,
        bookingReference: booking?.reference_code ?? null,
        customerName: booking?.customer_name ?? null,
        templateKey: row.template_key,
        audience: row.audience,
        originalRecipient: row.original_recipient,
        actualRecipient: row.actual_recipient,
        sender: row.sender,
        subject: row.subject,
        status: row.status,
        attemptCount: row.attempt_count,
        testMode: row.test_mode,
        error: row.error,
        providerMessageId: row.provider_message_id,
        providerDeliveryStatus: row.provider_delivery_status,
        providerEventType: row.provider_event_type,
        providerEventAt: row.provider_event_at,
        providerError: row.provider_error,
        providerEventCount: row.provider_event_count,
        deliveredAt: row.delivered_at,
        delayedAt: row.delayed_at,
        bouncedAt: row.bounced_at,
        complainedAt: row.complained_at,
        suppressedAt: row.suppressed_at,
        lastAttemptAt: row.last_attempt_at,
        sentAt: row.sent_at,
        createdAt: row.created_at,
      };
    }
  );

  const config = getNotificationEmailConfig();

  return {
    business: {
      id: business.id,
      name: business.name,
      email: business.email,
    },
    canManageSettings: admin.role === "owner",
    testMode: config.testMode,
    testRecipient: config.testRecipient,
    settings,
    summary: {
      total: deliveries.length,
      sent: deliveries.filter((row) => row.status === "sent").length,
      failed: deliveries.filter((row) => row.status === "failed").length,
      skipped: deliveries.filter((row) => row.status === "skipped").length,
      pending: deliveries.filter((row) => row.status === "pending").length,
    },
    deliveries,
  };
}
