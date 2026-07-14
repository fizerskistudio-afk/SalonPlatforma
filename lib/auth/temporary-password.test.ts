import {
  describe,
  expect,
  it,
} from "vitest";

import {
  completeTemporaryPasswordMetadata,
} from "./temporary-password";

describe(
  "temporary password completion",
  () => {
    it(
      "preserves credential provenance while clearing the forced-change flag",
      () => {
        expect(
          completeTemporaryPasswordMetadata(
            {
              must_change_password: true,
              credential_source:
                "platform_admin",
              credential_business_id:
                "business-id",
            },
            "2026-07-14T10:00:00.000Z"
          )
        ).toEqual({
          must_change_password: false,
          credential_source:
            "platform_admin",
          credential_business_id:
            "business-id",
          credential_completed_at:
            "2026-07-14T10:00:00.000Z",
        });
      }
    );

    it(
      "handles malformed legacy metadata without trusting it",
      () => {
        expect(
          completeTemporaryPasswordMetadata(
            "invalid",
            "2026-07-14T10:00:00.000Z"
          )
        ).toEqual({
          must_change_password: false,
          credential_completed_at:
            "2026-07-14T10:00:00.000Z",
        });
      }
    );
  }
);
