import type { Metadata } from "next";

import AdminMembersView from "@/components/admin/AdminMembersView";
import StaffAccessManager from "@/components/admin/StaffAccessManager";
import { getBusinessMembersPageData } from "@/lib/admin/members-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Članovi i pristup",
  description:
    "Upravljanje članovima, ulogama i pristupom salonu.",
};

export default async function AdminMembersPage() {
  const data =
    await getBusinessMembersPageData();

  return (
    <>
      <AdminMembersView data={data} />

      <StaffAccessManager
        members={data.members}
        employees={data.employees}
        canManage={
          data.currentUser.role === "owner"
        }
      />
    </>
  );
}
