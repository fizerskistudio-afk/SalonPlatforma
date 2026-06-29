import AdminTeamView from "@/components/admin/AdminTeamView";
import TeamManagementActions from "@/components/admin/team/TeamManagementActions";
import { getAdminTeam } from "@/lib/admin/team";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const result = await getAdminTeam();

  return (
    <>
      <TeamManagementActions
        employees={result.employees}
      />

      <AdminTeamView
        businessName={result.business.name}
        employees={result.employees}
        metrics={result.metrics}
        catalogServiceCount={
          result.catalogServices.length
        }
      />
    </>
  );
}