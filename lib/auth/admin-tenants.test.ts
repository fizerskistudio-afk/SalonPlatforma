import { describe, expect, it } from "vitest";

import {
  resolveAdminTenantSelection,
  type AdminTenantOption,
} from "./admin-tenants";

const tenants: AdminTenantOption[] = [
  {
    membershipId: "membership-a",
    businessId: "business-a",
    businessName: "Salon A",
    businessSlug: "salon-a",
    role: "owner",
  },
  {
    membershipId: "membership-b",
    businessId: "business-b",
    businessName: "Salon B",
    businessSlug: "salon-b",
    role: "manager",
  },
];

describe("resolveAdminTenantSelection", () => {
  it("prihvata samo preferencu koja postoji u server-validiranoj listi", () => {
    expect(
      resolveAdminTenantSelection(
        tenants,
        "business-b"
      )
    ).toEqual({
      selected: tenants[1],
      requiresSelection: false,
    });
  });

  it("ne koristi izmenjen ili zastareo cookie za multi-tenant nalog", () => {
    expect(
      resolveAdminTenantSelection(
        tenants,
        "foreign-business"
      )
    ).toEqual({
      selected: null,
      requiresSelection: true,
    });
  });

  it("zahteva eksplicitan izbor kada preferenca nedostaje", () => {
    expect(
      resolveAdminTenantSelection(
        tenants,
        null
      ).requiresSelection
    ).toBe(true);
  });

  it("bezbedno bira jedini važeći tenant", () => {
    expect(
      resolveAdminTenantSelection(
        [tenants[0]],
        "foreign-business"
      )
    ).toEqual({
      selected: tenants[0],
      requiresSelection: false,
    });
  });

  it("odbija pristup kada nema važećih tenant-a", () => {
    expect(
      resolveAdminTenantSelection(
        [],
        "business-a"
      )
    ).toEqual({
      selected: null,
      requiresSelection: false,
    });
  });
});
