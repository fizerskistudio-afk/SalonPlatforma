/**
 * Privremeni adapter između postojećih demo ID-jeva
 * u frontendu i UUID vrednosti iz Supabase seed podataka.
 *
 * Biće uklonjen kada usluge i zaposlene počnemo
 * direktno da učitavamo iz baze.
 */

export const DEFAULT_BUSINESS_SLUG =
  "lumiere-studio";

const serviceBackendIds: Record<
  string,
  string
> = {
  s1: "30000000-0000-4000-8000-000000000001",
  s2: "30000000-0000-4000-8000-000000000002",
  s3: "30000000-0000-4000-8000-000000000003",
  s4: "30000000-0000-4000-8000-000000000004",
  s5: "30000000-0000-4000-8000-000000000005",
  s6: "30000000-0000-4000-8000-000000000006",
  s7: "30000000-0000-4000-8000-000000000007",
  s8: "30000000-0000-4000-8000-000000000008",
  s9: "30000000-0000-4000-8000-000000000009",
  s10: "30000000-0000-4000-8000-000000000010",
  s11: "30000000-0000-4000-8000-000000000011",
  s12: "30000000-0000-4000-8000-000000000012",
};

const employeeBackendIds: Record<
  string,
  string
> = {
  e1: "40000000-0000-4000-8000-000000000001",
  e2: "40000000-0000-4000-8000-000000000002",
};

export function getBackendServiceId(
  frontendServiceId: string
): string | null {
  return (
    serviceBackendIds[frontendServiceId] ??
    null
  );
}

export function getBackendEmployeeId(
  frontendEmployeeId: string
): string | null {
  return (
    employeeBackendIds[
      frontendEmployeeId
    ] ?? null
  );
}