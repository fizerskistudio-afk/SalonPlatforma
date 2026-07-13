import AdminTeamView from "@/components/admin/AdminTeamView";
import EmployeeServiceManagement from "@/components/admin/team/EmployeeServiceManagement";
import TeamManagementActions from "@/components/admin/team/TeamManagementActions";
import { getAdminTeam } from "@/lib/admin/team";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const result = await getAdminTeam();

  return (
    <>
      <TeamManagementActions
        employees={result.employees}
        defaultLocale={
          result.business.defaultLocale
        }
        supportedLocales={
          result.business.supportedLocales
        }
      />

      <EmployeeServiceManagement
        employees={result.employees}
        catalogServices={
          result.catalogServices
        }
        defaultLocale={
          result.business.defaultLocale
        }
        supportedLocales={
          result.business.supportedLocales
        }
      />

      <AdminTeamView
        businessName={result.business.name}
        employees={result.employees}
        metrics={result.metrics}
        catalogServiceCount={
          result.catalogServices.length
        }
        defaultLocale={
          result.business.defaultLocale
        }
        supportedLocales={
          result.business.supportedLocales
        }
      />
    </>
  );
}