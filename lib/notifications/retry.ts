import "server-only";

import {
  retryBookingNotificationDeliverySafely,
} from "@/lib/notifications/booking";
import {
  isReminderTemplateKey,
  retryReminderNotificationDeliverySafely,
} from "@/lib/notifications/reminders";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

export type NotificationRetryResult = {
  ok: boolean;
  message: string;
};

export async function retryNotificationDeliverySafely(
  deliveryId: string,
  businessId: string
): Promise<NotificationRetryResult> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("notification_deliveries")
      .select("template_key")
      .eq("id", deliveryId)
      .eq("business_id", businessId)
      .maybeSingle();

    if (error) {
      return {
        ok: false,
        message:
          "Notifikacija trenutno ne može da se učita.",
      };
    }

    if (!data) {
      return {
        ok: false,
        message:
          "Notifikacija nije pronađena.",
      };
    }

    const templateKey =
      (data as { template_key: string })
        .template_key;

    if (isReminderTemplateKey(templateKey)) {
      return retryReminderNotificationDeliverySafely(
        deliveryId,
        businessId
      );
    }

    return retryBookingNotificationDeliverySafely(
      deliveryId,
      businessId
    );
  } catch (error) {
    console.error(
      "Notification retry dispatcher failed:",
      {
        deliveryId,
        businessId,
        error,
      }
    );

    return {
      ok: false,
      message:
        "Notifikaciju trenutno nije moguće ponovo poslati.",
    };
  }
}
