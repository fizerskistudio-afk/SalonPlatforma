import AdminScheduleView from "@/components/admin/AdminScheduleView";
import ScheduleManagementActions from "@/components/admin/schedule/ScheduleManagementActions";
import { getAdminSchedule } from "@/lib/admin/schedule";

export const dynamic =
  "force-dynamic";

export default async function AdminSchedulePage() {
  const result =
    await getAdminSchedule();

  return (
    <>
      <ScheduleManagementActions
        data={result}
      />

      <AdminScheduleView
        data={result}
      />
    </>
  );
}