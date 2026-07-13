import AdminServicesView from "@/components/admin/AdminServicesView";
import ServiceCatalogActions from "@/components/admin/services/ServiceCatalogActions";
import { getAdminServices } from "@/lib/admin/services";

export const dynamic =
  "force-dynamic";

export default async function AdminServicesPage() {
  const result =
    await getAdminServices();

  return (
    <>
      <ServiceCatalogActions
        categories={
          result.categories
        }
        defaultLocale={
          result.business.defaultLocale
        }
        supportedLocales={
          result.business.supportedLocales
        }
      />

      <AdminServicesView
        businessName={
          result.business.name
        }
        categories={
          result.categories
        }
        uncategorizedServices={
          result.uncategorizedServices
        }
        metrics={
          result.metrics
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