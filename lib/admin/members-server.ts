import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import type {
  BusinessMemberItem,
  BusinessMemberRole,
  BusinessMembersPageData,
} from "@/lib/admin/member-types";
import { createAdminClient } from "@/lib/supabase/admin";

type MembershipRow = {
  id: string;
  user_id: string;
  role: BusinessMemberRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const roleOrder: Record<BusinessMemberRole, number> = {
  owner: 0,
  manager: 1,
  staff: 2,
};

export async function getBusinessMembersPageData():
  Promise<BusinessMembersPageData> {
  const admin = await requireAdmin();
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("business_members")
    .select(
      "id, user_id, role, is_active, created_at, updated_at"
    )
    .eq("business_id", admin.business.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(
      `Članovi salona nisu mogli da se učitaju: ${error.message}`
    );
  }

  const rows = (data ?? []) as unknown as MembershipRow[];

  const members = await Promise.all(
    rows.map(async (row): Promise<BusinessMemberItem> => {
      const { data: userData, error: userError } =
        await adminClient.auth.admin.getUserById(row.user_id);

      if (userError) {
        console.error(
          "Unable to load auth user for business member:",
          {
            memberId: row.id,
            userId: row.user_id,
            error: userError,
          }
        );
      }

      const user = userData?.user ?? null;

      return {
        id: row.id,
        userId: row.user_id,
        email: user?.email ?? null,
        role: row.role,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        invitedAt: user?.invited_at ?? null,
        emailConfirmedAt: user?.email_confirmed_at ?? null,
        lastSignInAt: user?.last_sign_in_at ?? null,
      };
    })
  );

  members.sort((first, second) => {
    const roleDifference =
      roleOrder[first.role] - roleOrder[second.role];

    if (roleDifference !== 0) {
      return roleDifference;
    }

    return (first.email ?? first.userId).localeCompare(
      second.email ?? second.userId
    );
  });

  return {
    business: {
      id: admin.business.id,
      name: admin.business.name,
      slug: admin.business.slug,
    },
    currentUser: {
      id: admin.userId,
      role: admin.role,
    },
    members,
  };
}
