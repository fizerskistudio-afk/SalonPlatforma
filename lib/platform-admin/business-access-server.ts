import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import type {
  BusinessAccessPageData,
  BusinessOwnerAccessItem,
} from "@/lib/platform-admin/business-access";
import {
  resolveOwnerAccessState,
} from "@/lib/platform-admin/owner-access-state";

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

type MembershipRow = {
  id: string;
  user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function isJsonRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getMetadataString(
  metadata: Record<string, unknown>,
  key: string
): string | null {
  const value = metadata[key];

  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : null;
}

export async function getBusinessAccessPageData(
  businessSlug: string
): Promise<BusinessAccessPageData | null> {
  const adminClient =
    createAdminClient();

  const {
    data: businessData,
    error: businessError,
  } = await adminClient
    .from("businesses")
    .select(
      "id, name, slug, is_active"
    )
    .eq(
      "slug",
      businessSlug
    )
    .maybeSingle();

  if (businessError) {
    throw new Error(
      `Pristup salonu nije moguće učitati: ${businessError.message}`
    );
  }

  if (!businessData) {
    return null;
  }

  const business =
    businessData as unknown as
      BusinessRow;

  const {
    data: membershipData,
    error: membershipError,
  } = await adminClient
    .from("business_members")
    .select(
      "id, user_id, is_active, created_at, updated_at"
    )
    .eq(
      "business_id",
      business.id
    )
    .eq(
      "role",
      "owner"
    )
    .order(
      "created_at",
      {
        ascending: true,
      }
    );

  if (membershipError) {
    throw new Error(
      `Owner članstva nije moguće učitati: ${membershipError.message}`
    );
  }

  const membershipRows =
    (
      membershipData ??
      []
    ) as unknown as
      MembershipRow[];

  const owners =
    await Promise.all(
      membershipRows.map(
        async (
          membership
        ): Promise<BusinessOwnerAccessItem> => {
          const {
            data: userData,
            error: userError,
          } =
            await adminClient
              .auth
              .admin
              .getUserById(
                membership.user_id
              );

          if (userError) {
            console.error(
              "Unable to load owner auth user:",
              {
                businessId:
                  business.id,
                membershipId:
                  membership.id,
                userId:
                  membership.user_id,
                error:
                  userError,
              }
            );
          }

          const user =
            userData?.user ??
            null;

          const appMetadata =
            isJsonRecord(
              user?.app_metadata
            )
              ? user.app_metadata
              : {};

          const mustChangePassword =
            appMetadata.must_change_password ===
            true;

          const invitedAt =
            user?.invited_at ??
            null;

          const emailConfirmedAt =
            user?.email_confirmed_at ??
            null;

          const lastSignInAt =
            user?.last_sign_in_at ??
            null;

          return {
            id:
              membership.id,

            userId:
              membership.user_id,

            email:
              user?.email ??
              null,

            isActive:
              membership.is_active,

            createdAt:
              membership.created_at,

            updatedAt:
              membership.updated_at,

            invitedAt,

            emailConfirmedAt,

            lastSignInAt,

            mustChangePassword,

            credentialSource:
              getMetadataString(
                appMetadata,
                "credential_source"
              ),

            credentialIssuedAt:
              getMetadataString(
                appMetadata,
                "credential_issued_at"
              ),

            credentialCompletedAt:
              getMetadataString(
                appMetadata,
                "credential_completed_at"
              ),

            state:
              resolveOwnerAccessState({
                membershipActive:
                  membership.is_active,
                authUserAvailable:
                  Boolean(user),
                invitedAt,
                emailConfirmedAt,
                lastSignInAt,
                mustChangePassword,
              }),
          };
        }
      )
    );

  owners.sort(
    (
      firstOwner,
      secondOwner
    ) => {
      if (
        firstOwner.isActive !==
        secondOwner.isActive
      ) {
        return firstOwner.isActive
          ? -1
          : 1;
      }

      return (
        firstOwner.email ??
        firstOwner.userId
      ).localeCompare(
        secondOwner.email ??
        secondOwner.userId
      );
    }
  );

  return {
    business: {
      id:
        business.id,

      name:
        business.name,

      slug:
        business.slug,

      isActive:
        business.is_active,
    },

    owners,

    activeOwnerCount:
      owners.filter(
        (owner) =>
          owner.isActive
      ).length,
  };
}
