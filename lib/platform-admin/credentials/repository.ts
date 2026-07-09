import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import type {
  BusinessRow,
  MembershipRow,
} from "./types";

export async function getBusinessBySlug(
  businessSlug: string
): Promise<
  BusinessRow | null
> {
  const adminClient =
    createAdminClient();

  const {
    data,
    error,
  } = await adminClient
    .from(
      "businesses"
    )
    .select(
      "id, name, slug"
    )
    .eq(
      "slug",
      businessSlug
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `BUSINESS_LOOKUP_FAILED: ${error.message}`
    );
  }

  return data
    ? data as unknown as
        BusinessRow
    : null;
}

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

export async function loadOwnerMembership(
  businessId: string,
  userId: string
): Promise<
  MembershipRow | null
> {
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
      "id, user_id, role, is_active, created_at, updated_at"
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

export async function saveOwnerMembership(
  businessId: string,
  userId: string,
  existingMembership:
    MembershipRow | null
): Promise<MembershipRow> {
  const adminClient =
    createAdminClient();

  const result =
    existingMembership
      ? await adminClient
          .from(
            "business_members"
          )
          .update({
            role:
              "owner",
            is_active:
              true,
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
            "id, user_id, role, is_active, created_at, updated_at"
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
            role:
              "owner",
            is_active:
              true,
          })
          .select(
            "id, user_id, role, is_active, created_at, updated_at"
          )
          .single();

  if (
    result.error ||
    !result.data
  ) {
    throw new Error(
      `OWNER_MEMBERSHIP_SAVE_FAILED: ${result.error?.message ?? "unknown"}`
    );
  }

  return result.data as unknown as
    MembershipRow;
}
