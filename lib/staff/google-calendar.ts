import "server-only";

import { requireStaff } from "@/lib/auth/staff";
import { createAdminClient } from "@/lib/supabase/admin";

export type StaffGoogleCalendarConnection = {
  connected: boolean;
  isActive: boolean;
  accountEmail: string | null;
  calendarId: string | null;
  calendarName: string | null;
  connectedAt: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
};

type ConnectionRow = {
  google_account_email: string | null;
  calendar_id: string;
  calendar_name: string | null;
  is_active: boolean;
  connected_at: string;
  last_synced_at: string | null;
  last_error: string | null;
};

export async function getStaffGoogleCalendarConnection(): Promise<StaffGoogleCalendarConnection> {
  const staff =
    await requireStaff();

  const adminClient =
    createAdminClient();

  const {
    data,
    error,
  } = await adminClient
    .from(
      "employee_google_calendar_connections"
    )
    .select(
      [
        "google_account_email",
        "calendar_id",
        "calendar_name",
        "is_active",
        "connected_at",
        "last_synced_at",
        "last_error",
      ].join(", ")
    )
    .eq(
      "business_id",
      staff.business.id
    )
    .eq(
      "employee_id",
      staff.employee.id
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Lični Google Calendar nije učitan: ${error.message}`
    );
  }

  if (!data) {
    return {
      connected: false,
      isActive: false,
      accountEmail: null,
      calendarId: null,
      calendarName: null,
      connectedAt: null,
      lastSyncedAt: null,
      lastError: null,
    };
  }

  const row =
    data as unknown as ConnectionRow;

  return {
    connected: true,
    isActive:
      row.is_active,
    accountEmail:
      row.google_account_email,
    calendarId:
      row.calendar_id,
    calendarName:
      row.calendar_name,
    connectedAt:
      row.connected_at,
    lastSyncedAt:
      row.last_synced_at,
    lastError:
      row.last_error,
  };
}
