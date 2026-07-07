import "server-only";

import {
  requireAdmin,
} from "@/lib/auth/admin";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

export type AdminReminderSettingsData = {
  ownerCanEdit: boolean;
  customerNotificationsEnabled: boolean;
  reminder24hEnabled: boolean;
  reminder2hEnabled: boolean;
  upcomingConfirmedWithEmail: number;
  next24HoursCount: number;
};

type ReminderSettingsRow = {
  customer_notifications_enabled: boolean;
  booking_reminder_24h_enabled: boolean;
  booking_reminder_2h_enabled: boolean;
};

export async function getAdminReminderSettings(): Promise<AdminReminderSettingsData> {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const now = new Date();
  const next24Hours = new Date(
    now.getTime() +
      24 * 60 * 60 * 1000
  );

  const [settingsResult, totalResult, next24Result] =
    await Promise.all([
      supabase
        .from("business_email_settings")
        .select(
          `
            customer_notifications_enabled,
            booking_reminder_24h_enabled,
            booking_reminder_2h_enabled
          `
        )
        .eq("business_id", admin.business.id)
        .maybeSingle(),
      supabase
        .from("bookings")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("business_id", admin.business.id)
        .eq("status", "confirmed")
        .not("customer_email", "is", null)
        .gt("starts_at", now.toISOString()),
      supabase
        .from("bookings")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("business_id", admin.business.id)
        .eq("status", "confirmed")
        .not("customer_email", "is", null)
        .gt("starts_at", now.toISOString())
        .lte(
          "starts_at",
          next24Hours.toISOString()
        ),
    ]);

  if (settingsResult.error) {
    throw new Error(
      "Nije moguće učitati podešavanja podsetnika."
    );
  }

  if (
    totalResult.error ||
    next24Result.error
  ) {
    throw new Error(
      "Nije moguće izračunati predstojeće termine za podsetnike."
    );
  }

  const settings = settingsResult.data
    ? settingsResult.data as unknown as ReminderSettingsRow
    : null;

  return {
    ownerCanEdit: admin.role === "owner",
    customerNotificationsEnabled:
      settings?.customer_notifications_enabled ??
      true,
    reminder24hEnabled:
      settings?.booking_reminder_24h_enabled ??
      true,
    reminder2hEnabled:
      settings?.booking_reminder_2h_enabled ??
      false,
    upcomingConfirmedWithEmail:
      totalResult.count ?? 0,
    next24HoursCount:
      next24Result.count ?? 0,
  };
}
