import AdminNotificationsManager from "@/components/admin/notifications/AdminNotificationsManager";
import AdminReminderSettings from "@/components/admin/notifications/AdminReminderSettings";
import { getAdminNotificationManagement } from "@/lib/admin/notifications";
import { getAdminReminderSettings } from "@/lib/admin/reminders";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminNotificationsPage() {
  const [data, reminderData] =
    await Promise.all([
      getAdminNotificationManagement(),
      getAdminReminderSettings(),
    ]);

  return (
    <div className="space-y-8">
      <AdminReminderSettings
        data={reminderData}
      />
      <AdminNotificationsManager
        data={data}
      />
    </div>
  );
}
