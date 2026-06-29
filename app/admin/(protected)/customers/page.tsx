import AdminCustomersView from "@/components/admin/AdminCustomersView";
import { getAdminCustomers } from "@/lib/admin/customers";

export const dynamic =
  "force-dynamic";

export default async function AdminCustomersPage() {
  const result =
    await getAdminCustomers();

  return (
    <AdminCustomersView
      businessName={
        result.business.name
      }
      timezone={
        result.business.timezone
      }
      generatedAt={
        new Date().toISOString()
      }
      customers={
        result.customers
      }
    />
  );
}