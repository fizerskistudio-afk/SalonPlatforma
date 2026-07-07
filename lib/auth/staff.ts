import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type MembershipRow = {
  id: string;
  business_id: string;
  employee_id: string | null;
  is_active: boolean;
};

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  currency: string;
  is_active: boolean;
};

type EmployeeRow = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  is_active: boolean;
};

export type StaffContext = {
  userId: string;
  email: string | null;

  membership: {
    id: string;
    businessId: string;
    employeeId: string | null;
  };

  business: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
    currency: string;
  };

  employee: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  } | null;
};

export const getStaffContext = cache(
  async (): Promise<StaffContext | null> => {
    const supabase = await createClient();

    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims();

    if (
      claimsError ||
      !claimsData?.claims
    ) {
      return null;
    }

    const userId =
      claimsData.claims.sub;

    if (
      typeof userId !== "string" ||
      !userId
    ) {
      return null;
    }

    const adminClient =
      createAdminClient();

    const {
      data: membershipData,
      error: membershipError,
    } = await adminClient
      .from("business_members")
      .select(
        "id, business_id, employee_id, is_active"
      )
      .eq("user_id", userId)
      .eq("role", "staff")
      .eq("is_active", true)
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

    const {
      data: businessData,
      error: businessError,
    } = await adminClient
      .from("businesses")
      .select(
        "id, name, slug, timezone, currency, is_active"
      )
      .eq("id", membership.business_id)
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

    let employee:
      StaffContext["employee"] =
        null;

    if (membership.employee_id) {
      const {
        data: employeeData,
        error: employeeError,
      } = await adminClient
        .from("employees")
        .select(
          "id, name, slug, image_url, is_active"
        )
        .eq("id", membership.employee_id)
        .eq("business_id", business.id)
        .eq("is_active", true)
        .maybeSingle();

      if (!employeeError && employeeData) {
        const employeeRow =
          employeeData as unknown as EmployeeRow;

        employee = {
          id: employeeRow.id,
          name: employeeRow.name,
          slug: employeeRow.slug,
          imageUrl: employeeRow.image_url,
        };
      }
    }

    const emailClaim =
      claimsData.claims.email;

    return {
      userId,
      email:
        typeof emailClaim === "string"
          ? emailClaim
          : null,

      membership: {
        id: membership.id,
        businessId: membership.business_id,
        employeeId: membership.employee_id,
      },

      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        timezone: business.timezone,
        currency: business.currency,
      },

      employee,
    };
  }
);

export async function requireStaff():
  Promise<StaffContext & {
    employee: NonNullable<
      StaffContext["employee"]
    >;
  }> {
  const context =
    await getStaffContext();

  if (!context) {
    redirect("/staff/login");
  }

  if (!context.employee) {
    redirect(
      "/staff/setup-required"
    );
  }

  return context as StaffContext & {
    employee: NonNullable<
      StaffContext["employee"]
    >;
  };
}
