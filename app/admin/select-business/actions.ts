"use server";

import { redirect } from "next/navigation";

import { setPreferredAdminBusinessId } from "@/lib/auth/admin-active-business";
import { requireAdmin } from "@/lib/auth/admin";

export type SelectBusinessActionState = {
  error: string | null;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function selectBusinessAction(
  _previousState: SelectBusinessActionState,
  formData: FormData
): Promise<SelectBusinessActionState> {
  const businessId = String(
    formData.get("businessId") ?? ""
  ).trim();

  if (!UUID_PATTERN.test(businessId)) {
    return {
      error:
        "Izbor salona nije ispravan. Osveži stranicu i pokušaj ponovo.",
    };
  }

  const admin = await requireAdmin({
    allowTenantSelection: true,
  });

  const selectedTenant =
    admin.tenants.find(
      (tenant) =>
        tenant.businessId === businessId
    );

  if (!selectedTenant) {
    return {
      error:
        "Nemaš aktivan administratorski pristup izabranom salonu.",
    };
  }

  await setPreferredAdminBusinessId(
    selectedTenant.businessId
  );

  redirect("/admin");
}
