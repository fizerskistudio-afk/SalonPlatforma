import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getWorkspaceIdentityOrder,
  normalizeWorkspaceContextIntent,
} from "./context";

describe(
  "ORDUM-WORKSPACE-APPSHELL-01B context",
  () => {
    it(
      "normalizuje samo postojeće admin i staff intent vrednosti",
      () => {
        expect(
          normalizeWorkspaceContextIntent(
            "admin"
          )
        ).toBe(
          "admin"
        );

        expect(
          normalizeWorkspaceContextIntent(
            [
              "staff",
              "admin",
            ]
          )
        ).toBe(
          "staff"
        );

        expect(
          normalizeWorkspaceContextIntent(
            "platform-admin"
          )
        ).toBeNull();

        expect(
          normalizeWorkspaceContextIntent(
            undefined
          )
        ).toBeNull();
      }
    );

    it(
      "eksplicitni shell intent ne prelazi u drugi membership kontekst",
      () => {
        expect(
          getWorkspaceIdentityOrder(
            "admin"
          )
        ).toEqual([
          "admin",
        ]);

        expect(
          getWorkspaceIdentityOrder(
            "staff"
          )
        ).toEqual([
          "staff",
        ]);
      }
    );

    it(
      "direktni Workspace ulaz proverava admin pa staff bez Platform Admin konteksta",
      () => {
        expect(
          getWorkspaceIdentityOrder(
            null
          )
        ).toEqual([
          "admin",
          "staff",
        ]);

        expect(
          getWorkspaceIdentityOrder(
            null
          )
        ).not.toContain(
          "platform-admin"
        );
      }
    );
  }
);
