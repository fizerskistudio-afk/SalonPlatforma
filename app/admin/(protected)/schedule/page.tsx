import AdminScheduleView from "@/components/admin/AdminScheduleView";
import ScheduleManagementActions from "@/components/admin/schedule/ScheduleManagementActions";
import StaffTimeOffRequests from "@/components/admin/schedule/StaffTimeOffRequests";
import { getAdminSchedule } from "@/lib/admin/schedule";
import { getAdminStaffTimeOffRequests } from "@/lib/admin/staff-time-off-requests";

export const dynamic = "force-dynamic";

export default async function AdminSchedulePage() {
  const [
    result,
    staffRequests,
  ] = await Promise.all([
    getAdminSchedule(),
    getAdminStaffTimeOffRequests(),
  ]);

  return (
    <>
      <StaffTimeOffRequests
        timezone={
          result.business.timezone
        }
        requests={
          staffRequests.requests
        }
      />

      <ScheduleManagementActions
        data={result}
      />

      <AdminScheduleView
        data={result}
      />
    </>
  );
}
