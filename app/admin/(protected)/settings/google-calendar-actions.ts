"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireAdmin,
} from "@/lib/auth/admin";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

export type DisconnectGoogleCalendarResult = {
  ok: boolean;
  message: string;
};

function refreshSettingsPages(): void {
  revalidatePath("/admin");
  revalidatePath(
    "/admin/settings"
  );
}

export async function disconnectGoogleCalendarAction(): Promise<DisconnectGoogleCalendarResult> {
  const admin =
    await requireAdmin();

  const adminClient =
    createAdminClient();

  const {
    data: connection,
    error: connectionError,
  } =
    await adminClient
      .from(
        "google_calendar_connections"
      )
      .select("id")
      .eq(
        "business_id",
        admin.business.id
      )
      .maybeSingle();

  if (connectionError) {
    console.error(
      "Unable to load Google Calendar connection before disconnect:",
      connectionError
    );

    return {
      ok: false,
      message:
        "Google Calendar konekcija trenutno ne može da se učita.",
    };
  }

  if (!connection) {
    refreshSettingsPages();

    return {
      ok: true,
      message:
        "Google Calendar već nije povezan.",
    };
  }

  const {
    error: deleteError,
  } =
    await adminClient
      .from(
        "google_calendar_connections"
      )
      .delete()
      .eq(
        "business_id",
        admin.business.id
      );

  if (deleteError) {
    console.error(
      "Unable to disconnect Google Calendar:",
      deleteError
    );

    return {
      ok: false,
      message:
        "Google Calendar nije odspojen. Pokušaj ponovo.",
    };
  }

  refreshSettingsPages();

  return {
    ok: true,
    message:
      "Google Calendar je uspešno odspojen.",
  };
}