import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AdminRole =
  | "owner"
  | "manager";

type MembershipRow = {
  id: string;
  business_id: string;
  role:
    | "owner"
    | "manager"
    | "staff";
  is_active: boolean;
};

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

export type AdminContext = {
  userId: string;
  email: string | null;
  membershipId: string;
  role: AdminRole;
  mustChangePassword: boolean;

  business: {
    id: string;
    name: string;
    slug: string;
  };
};

type RequireAdminOptions = {
  allowPasswordChange?: boolean;
};

function isJsonRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value
    )
  );
}

function getMustChangePassword(
  claims: unknown
): boolean {
  if (
    !isJsonRecord(
      claims
    )
  ) {
    return false;
  }

  const appMetadata =
    claims.app_metadata;

  return (
    isJsonRecord(
      appMetadata
    ) &&
    appMetadata.must_change_password ===
      true
  );
}

/**
 * Vraća kontekst trenutno prijavljenog
 * vlasnika ili menadžera.
 *
 * Ako sesija ili članstvo nisu validni,
 * vraća null.
 */
export const getAdminContext = cache(
  async (): Promise<AdminContext | null> => {
    const supabase =
      await createClient();

    const {
      data: claimsData,
      error: claimsError,
    } =
      await supabase.auth.getClaims();

    /*
     * Eksplicitno proveravamo claimsData
     * pre korišćenja, kako TypeScript ne bi
     * smatrao da može biti null.
     */
    if (
      claimsError ||
      !claimsData ||
      !claimsData.claims
    ) {
      return null;
    }

    const claims =
      claimsData.claims;

    const userId =
      claims.sub;

    if (
      typeof userId !== "string" ||
      userId.length === 0
    ) {
      return null;
    }

    const {
      data: membershipData,
      error: membershipError,
    } = await supabase
      .from("business_members")
      .select(
        "id, business_id, role, is_active"
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .in("role", [
        "owner",
        "manager",
      ])
      .order("created_at", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (
      membershipError ||
      !membershipData
    ) {
      return null;
    }

    const membership =
      membershipData as unknown as MembershipRow;

    if (
      membership.role !== "owner" &&
      membership.role !== "manager"
    ) {
      return null;
    }

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
        "id",
        membership.business_id
      )
      .eq("is_active", true)
      .maybeSingle();

    if (
      businessError ||
      !businessData
    ) {
      return null;
    }

    const business =
      businessData as unknown as BusinessRow;

    const emailClaim =
      claims.email;

    return {
      userId,

      email:
        typeof emailClaim ===
        "string"
          ? emailClaim
          : null,

      membershipId:
        membership.id,

      role:
        membership.role,

      mustChangePassword:
        getMustChangePassword(
          claims
        ),

      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
      },
    };
  }
);

/**
 * Koristi se u zaštićenim admin rutama.
 * Neprijavljeni korisnik se šalje na login.
 * Nalog sa privremenom lozinkom se šalje na
 * obaveznu promenu lozinke, osim kada je ta
 * ruta eksplicitno dozvoljena.
 */
export async function requireAdmin(
  options:
    RequireAdminOptions =
      {}
): Promise<AdminContext> {
  const context =
    await getAdminContext();

  if (!context) {
    redirect("/admin/login");
  }

  if (
    context.mustChangePassword &&
    !options.allowPasswordChange
  ) {
    redirect(
      "/admin/change-password"
    );
  }

  return context;
}
