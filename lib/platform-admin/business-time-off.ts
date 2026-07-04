import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const BUSINESS_TIME_OFF_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type TimeOffBusinessRow = {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  is_active: boolean;
};

export type TimeOffEmployeeRow = {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
};

export type TimeOffRow = {
  id: string;
  employee_id: string | null;
  block_type: "time_off" | "break" | "blocked";
  starts_at: string;
  ends_at: string;
  reason: string | null;
  created_at: string;
  updated_at: string;
};

export type BusinessTimeOffData = {
  business: TimeOffBusinessRow;
  employees: TimeOffEmployeeRow[];
  blocks: TimeOffRow[];
  loadedAt: string;
};

export async function loadBusinessTimeOffData(
  businessSlug: string
): Promise<BusinessTimeOffData | null> {
  const supabase = createAdminClient();

  const {
    data: businessData,
    error: businessError,
  } = await supabase
    .from("businesses")
    .select(
      "id, slug, name, timezone, is_active"
    )
    .eq("slug", businessSlug)
    .maybeSingle();

  if (businessError) {
    console.error(
      "Failed to load business for time-off management:",
      businessError
    );
    throw new Error(
      "Salon nije moguće učitati iz baze."
    );
  }

  if (!businessData) {
    return null;
  }

  const business =
    businessData as unknown as TimeOffBusinessRow;
  const nowIso = new Date().toISOString();

  const [employeesResult, blocksResult] =
    await Promise.all([
      supabase
        .from("employees")
        .select("id, slug, name, is_active")
        .eq("business_id", business.id)
        .order("is_active", {
          ascending: false,
        })
        .order("sort_order", {
          ascending: true,
        })
        .order("name", {
          ascending: true,
        }),
      supabase
        .from("time_off")
        .select(
          "id, employee_id, block_type, starts_at, ends_at, reason, created_at, updated_at"
        )
        .eq("business_id", business.id)
        .gte("ends_at", nowIso)
        .order("starts_at", {
          ascending: true,
        })
        .limit(250),
    ]);

  const queryErrors = [
    employeesResult.error,
    blocksResult.error,
  ].filter(Boolean);

  if (queryErrors.length > 0) {
    console.error(
      "Failed to load time-off management data:",
      queryErrors
    );
    throw new Error(
      "Blokirani periodi nisu mogli da se učitaju."
    );
  }

  return {
    business,
    employees:
      (employeesResult.data ?? []) as unknown as
        TimeOffEmployeeRow[],
    blocks:
      (blocksResult.data ?? []) as unknown as
        TimeOffRow[],
    loadedAt: nowIso,
  };
}
