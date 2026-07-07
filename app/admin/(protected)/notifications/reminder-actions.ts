"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireAdmin,
} from "@/lib/auth/admin";
import {
  processBookingReminders,
} from "@/lib/notifications/reminders";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

export type ReminderActionResult = {
  ok: boolean;
  message: string;
};

export async function updateReminderSettingsAction(input: {
  reminder24hEnabled: boolean;
  reminder2hEnabled: boolean;
}): Promise<ReminderActionResult> {
  const admin = await requireAdmin();

  if (admin.role !== "owner") {
    return {
      ok: false,
      message:
        "Samo vlasnik može menjati podešavanja podsetnika.",
    };
  }

  if (
    typeof input.reminder24hEnabled !==
      "boolean" ||
    typeof input.reminder2hEnabled !==
      "boolean"
  ) {
    return {
      ok: false,
      message:
        "Podešavanja podsetnika nisu ispravna.",
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("business_email_settings")
    .upsert(
      {
        business_id: admin.business.id,
        booking_reminder_24h_enabled:
          input.reminder24hEnabled,
        booking_reminder_2h_enabled:
          input.reminder2hEnabled,
      },
      {
        onConflict: "business_id",
      }
    );

  if (error) {
    console.error(
      "Unable to update booking reminder settings:",
      error
    );

    return {
      ok: false,
      message:
        "Podešavanja podsetnika nisu sačuvana.",
    };
  }

  revalidatePath("/admin/notifications");

  return {
    ok: true,
    message:
      "Podešavanja podsetnika su sačuvana.",
  };
}

export async function runReminderScanAction(): Promise<ReminderActionResult> {
  const admin = await requireAdmin();
  const result = await processBookingReminders({
    businessId: admin.business.id,
    limit: 250,
  });

  revalidatePath("/admin/notifications");

  return {
    ok: result.ok,
    message: result.message,
  };
}
