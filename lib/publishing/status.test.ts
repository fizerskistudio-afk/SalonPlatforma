import {
  describe,
  expect,
  it,
} from "vitest";

import {
  BUSINESS_PUBLICATION_STATUSES,
  isBusinessPublicationStatus,
  isBusinessPubliclyAvailable,
  resolveBusinessPublicationStatus,
  shouldBusinessBeOperational,
} from "./status";

describe(
  "business publication status",
  () => {
    it.each(
      BUSINESS_PUBLICATION_STATUSES
    )(
      "accepts %s",
      (
        status
      ) => {
        expect(
          isBusinessPublicationStatus(
            status
          )
        ).toBe(true);
      }
    );

    it.each([
      null,
      undefined,
      "",
      "active",
      "deleted",
      1,
    ])(
      "rejects invalid status %s",
      (
        value
      ) => {
        expect(
          isBusinessPublicationStatus(
            value
          )
        ).toBe(false);
      }
    );

    it(
      "falls back to published for legacy active tenant",
      () => {
        expect(
          resolveBusinessPublicationStatus(
            null,
            true
          )
        ).toBe(
          "published"
        );
      }
    );

    it(
      "falls back to suspended for legacy inactive tenant",
      () => {
        expect(
          resolveBusinessPublicationStatus(
            null,
            false
          )
        ).toBe(
          "suspended"
        );
      }
    );

    it(
      "only exposes active published tenant publicly",
      () => {
        expect(
          isBusinessPubliclyAvailable(
            "published",
            true
          )
        ).toBe(true);

        expect(
          isBusinessPubliclyAvailable(
            "published",
            false
          )
        ).toBe(false);

        expect(
          isBusinessPubliclyAvailable(
            "draft",
            true
          )
        ).toBe(false);
      }
    );

    it.each([
      [
        "draft",
        true,
      ],
      [
        "published",
        true,
      ],
      [
        "suspended",
        false,
      ],
      [
        "archived",
        false,
      ],
    ] as const)(
      "maps %s operational state",
      (
        status,
        expected
      ) => {
        expect(
          shouldBusinessBeOperational(
            status
          )
        ).toBe(expected);
      }
    );
  }
);
