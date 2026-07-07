import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import type {
  BusinessMemberEmployeeOption,
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
  employee_id: string | null;
  created_at: string;
  updated_at: string;
};

type EmployeeRow = {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
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

  const [
    membershipResult,
    employeeResult,
  ] = await Promise.all([
    adminClient
      .from("business_members")
      .select(
        "id, user_id, role, is_active, employee_id, created_at, updated_at"
      )
      .eq("business_id", admin.business.id)
      .order("created_at", { ascending: true }),

    adminClient
      .from("employees")
      .select(
        "id, name, is_active, sort_order"
      )
      .eq("business_id", admin.business.id)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  if (membershipResult.error) {
    throw new Error(
      `Članovi salona nisu mogli da se učitaju: ${membershipResult.error.message}`
    );
  }

  if (employeeResult.error) {
    throw new Error(
      `Zaposleni nisu mogli da se učitaju: ${employeeResult.error.message}`
    );
  }

  const rows =
    (membershipResult.data ?? []) as unknown as MembershipRow[];

  const employeeRows =
    (employeeResult.data ?? []) as unknown as EmployeeRow[];

  const employeeNameById =
    new Map(
      employeeRows.map(
        (employee) => [
          employee.id,
          employee.name,
        ]
      )
    );

  const members = await Promise.all(
    rows.map(async (row): Promise<BusinessMemberItem> => {
      const {
        data: userData,
        error: userError,
      } = await adminClient.auth.admin.getUserById(
        row.user_id
      );

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

        employeeId: row.employee_id,
        employeeName: row.employee_id
          ? employeeNameById.get(row.employee_id) ?? null
          : null,

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

  const employees: BusinessMemberEmployeeOption[] =
    employeeRows.map((employee) => ({
      id: employee.id,
      name: employee.name,
      isActive: employee.is_active,
    }));

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
    employees,
  };
}
