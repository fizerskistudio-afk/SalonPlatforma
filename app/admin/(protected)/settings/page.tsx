import AdminSettingsView from "@/components/admin/AdminSettingsView";
import GoogleCalendarSettingsCard from "@/components/admin/settings/GoogleCalendarSettingsCard";
import SettingsManagementActions from "@/components/admin/settings/SettingsManagementActions";
import { getAdminSettings } from "@/lib/admin/settings";

export const dynamic =
  "force-dynamic";

export default async function AdminSettingsPage() {
  const result =
    await getAdminSettings();

  return (
    <>
      <SettingsManagementActions
        data={result}
      />

      <GoogleCalendarSettingsCard
        connection={
          result.googleCalendar
        }
        timezone={
          result.business.timezone
        }
      />

      <AdminSettingsView
        data={result}
      />
    </>
  );
}