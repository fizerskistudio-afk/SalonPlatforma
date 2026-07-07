import AdminNotificationsManager from "@/components/admin/notifications/AdminNotificationsManager";
import { getAdminNotificationManagement } from "@/lib/admin/notifications";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminNotificationsPage() {
  const data = await getAdminNotificationManagement();

  return <AdminNotificationsManager data={data} />;
}
