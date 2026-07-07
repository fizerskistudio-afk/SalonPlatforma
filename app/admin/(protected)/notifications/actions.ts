"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import {
  retryNotificationDeliverySafely,
} from "@/lib/notifications/retry";
import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationManagementActionResult = {
  ok: boolean;
  message: string;
};

export type UpdateNotificationPreferencesInput = {
  notificationEmail: string;
  replyToEmail: string;
  customerNotificationsEnabled: boolean;
  businessNotificationsEnabled: boolean;
  bookingRequestReceivedEnabled: boolean;
  bookingConfirmedEnabled: boolean;
  bookingRescheduledEnabled: boolean;
  bookingCancelledEnabled: boolean;
  businessNewBookingEnabled: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeOptionalEmail(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

function isValidOptionalEmail(value: string | null): boolean {
  return value === null || EMAIL_PATTERN.test(value);
}

function areBooleanPreferencesValid(
  input: UpdateNotificationPreferencesInput
): boolean {
  return [
    input.customerNotificationsEnabled,
    input.businessNotificationsEnabled,
    input.bookingRequestReceivedEnabled,
    input.bookingConfirmedEnabled,
    input.bookingRescheduledEnabled,
    input.bookingCancelledEnabled,
    input.businessNewBookingEnabled,
  ].every((value) => typeof value === "boolean");
}

export async function updateNotificationPreferencesAction(
  input: UpdateNotificationPreferencesInput
): Promise<NotificationManagementActionResult> {
  const admin = await requireAdmin();

  if (admin.role !== "owner") {
    return {
      ok: false,
      message: "Samo vlasnik može menjati podešavanja notifikacija.",
    };
  }

  if (!areBooleanPreferencesValid(input)) {
    return {
      ok: false,
      message: "Podešavanja notifikacija nisu ispravna.",
    };
  }

  const notificationEmail = normalizeOptionalEmail(input.notificationEmail);
  const replyToEmail = normalizeOptionalEmail(input.replyToEmail);

  if (!isValidOptionalEmail(notificationEmail)) {
    return {
      ok: false,
      message: "Email salona za prijem obaveštenja nije ispravan.",
    };
  }

  if (!isValidOptionalEmail(replyToEmail)) {
    return {
      ok: false,
      message: "Reply-to email nije ispravan.",
    };
  }

  if (input.businessNotificationsEnabled && !notificationEmail) {
    return {
      ok: false,
      message: "Unesi email na koji salon prima nove rezervacije.",
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("business_email_settings")
    .upsert(
      {
        business_id: admin.business.id,
        notification_email: notificationEmail,
        reply_to_email: replyToEmail,
        customer_notifications_enabled:
          input.customerNotificationsEnabled,
        business_notifications_enabled:
          input.businessNotificationsEnabled,
        booking_request_received_enabled:
          input.bookingRequestReceivedEnabled,
        booking_confirmed_enabled:
          input.bookingConfirmedEnabled,
        booking_rescheduled_enabled:
          input.bookingRescheduledEnabled,
        booking_cancelled_enabled:
          input.bookingCancelledEnabled,
        business_new_booking_enabled:
          input.businessNewBookingEnabled,
      },
      {
        onConflict: "business_id",
      }
    );

  if (error) {
    console.error("Unable to update notification preferences:", error);

    return {
      ok: false,
      message: "Podešavanja notifikacija nisu sačuvana.",
    };
  }

  revalidatePath("/admin/notifications");

  return {
    ok: true,
    message: "Podešavanja notifikacija su sačuvana.",
  };
}

export async function retryNotificationDeliveryAction(input: {
  deliveryId: string;
}): Promise<NotificationManagementActionResult> {
  const admin = await requireAdmin();
  const deliveryId = input.deliveryId.trim();

  if (!UUID_PATTERN.test(deliveryId)) {
    return {
      ok: false,
      message: "Notifikacija nema ispravan ID.",
    };
  }

  const result = await retryNotificationDeliverySafely(
    deliveryId,
    admin.business.id
  );

  revalidatePath("/admin/notifications");

  return {
    ok: result.ok,
    message: result.message,
  };
}
