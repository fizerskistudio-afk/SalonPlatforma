import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import type {
  DirectMemberRole,
  EmployeeRow,
  MembershipRow,
} from "./types";

export async function findAuthUserByEmail(
  email: string
) {
  const adminClient =
    createAdminClient();

  const perPage =
    200;

  for (
    let page = 1;
    page <= 25;
    page += 1
  ) {
    const {
      data,
      error,
    } = await adminClient
      .auth
      .admin
      .listUsers({
        page,
        perPage,
      });

    if (error) {
      throw new Error(
        `AUTH_USER_LOOKUP_FAILED: ${error.message}`
      );
    }

    const matchingUser =
      data.users.find(
        (user) =>
          user.email
            ?.trim()
            .toLowerCase() ===
          email
      );

    if (matchingUser) {
      return matchingUser;
    }

    if (
      data.users.length <
      perPage
    ) {
      return null;
    }
  }

  throw new Error(
    "AUTH_USER_LOOKUP_LIMIT_REACHED"
  );
}

export async function loadMembershipByUser(
  businessId: string,
  userId: string
): Promise<MembershipRow | null> {
  const adminClient =
    createAdminClient();

  const {
    data,
    error,
  } = await adminClient
    .from(
      "business_members"
    )
    .select(
      "id, user_id, role, is_active, employee_id, created_at, updated_at"
    )
    .eq(
      "business_id",
      businessId
    )
    .eq(
      "user_id",
      userId
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `MEMBERSHIP_LOOKUP_FAILED: ${error.message}`
    );
  }

  return data
    ? data as unknown as
        MembershipRow
    : null;
}

export async function loadExactDirectMember(
  businessId: string,
  memberId: string
): Promise<MembershipRow | null> {
  const adminClient =
    createAdminClient();

  const {
    data,
    error,
  } = await adminClient
    .from(
      "business_members"
    )
    .select(
      "id, user_id, role, is_active, employee_id, created_at, updated_at"
    )
    .eq(
      "id",
      memberId
    )
    .eq(
      "business_id",
      businessId
    )
    .in(
      "role",
      [
        "manager",
        "staff",
      ]
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `MEMBERSHIP_LOOKUP_FAILED: ${error.message}`
    );
  }

  return data
    ? data as unknown as
        MembershipRow
    : null;
}

export async function loadActiveEmployee(
  businessId: string,
  employeeId: string
): Promise<EmployeeRow | null> {
  const adminClient =
    createAdminClient();

  const {
    data,
    error,
  } = await adminClient
    .from(
      "employees"
    )
    .select(
      "id, name, is_active"
    )
    .eq(
      "id",
      employeeId
    )
    .eq(
      "business_id",
      businessId
    )
    .eq(
      "is_active",
      true
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `EMPLOYEE_LOOKUP_FAILED: ${error.message}`
    );
  }

  return data
    ? data as unknown as
        EmployeeRow
    : null;
}

export async function saveDirectMembership({
  businessId,
  userId,
  role,
  employeeId,
  existingMembership,
}: {
  businessId: string;
  userId: string;
  role: DirectMemberRole;
  employeeId: string | null;
  existingMembership: MembershipRow | null;
}): Promise<MembershipRow> {
  const adminClient =
    createAdminClient();

  const result =
    existingMembership
      ? await adminClient
          .from(
            "business_members"
          )
          .update({
            role,
            is_active:
              true,
            employee_id:
              role === "staff"
                ? employeeId
                : null,
          })
          .eq(
            "id",
            existingMembership.id
          )
          .eq(
            "business_id",
            businessId
          )
          .select(
            "id, user_id, role, is_active, employee_id, created_at, updated_at"
          )
          .single()
      : await adminClient
          .from(
            "business_members"
          )
          .insert({
            business_id:
              businessId,
            user_id:
              userId,
            role,
            is_active:
              true,
            employee_id:
              role === "staff"
                ? employeeId
                : null,
          })
          .select(
            "id, user_id, role, is_active, employee_id, created_at, updated_at"
          )
          .single();

  if (
    result.error ||
    !result.data
  ) {
    throw new Error(
      `MEMBERSHIP_SAVE_FAILED: ${result.error?.message ?? "missing membership"}`
    );
  }

  return result.data as unknown as
    MembershipRow;
}

export async function hasOtherActiveMembership(
  businessId: string,
  userId: string
): Promise<boolean> {
  const adminClient =
    createAdminClient();

  const {
    data,
    error,
  } = await adminClient
    .from(
      "business_members"
    )
    .select(
      "id"
    )
    .eq(
      "user_id",
      userId
    )
    .eq(
      "is_active",
      true
    )
    .neq(
      "business_id",
      businessId
    )
    .limit(
      1
    );

  if (error) {
    throw new Error(
      `OTHER_MEMBERSHIP_LOOKUP_FAILED: ${error.message}`
    );
  }

  return Boolean(
    data?.length
  );
}
