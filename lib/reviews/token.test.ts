import {
  describe,
  expect,
  it,
} from "vitest";

import {
  hashReviewInvitationToken,
  normalizeReviewInvitationToken,
} from "./token";

const VALID_TOKEN =
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

describe(
  "review invitation token",
  () => {
    it(
      "normalizes a valid base64url bearer token",
      () => {
        expect(
          normalizeReviewInvitationToken(
            `  ${VALID_TOKEN}  `
          )
        ).toBe(
          VALID_TOKEN
        );
      }
    );

    it.each([
      "",
      "short",
      "a".repeat(42),
      "a".repeat(129),
      `${"a".repeat(42)}+`,
      null,
    ])(
      "rejects malformed token",
      (
        value
      ) => {
        expect(
          normalizeReviewInvitationToken(
            value
          )
        ).toBeNull();
      }
    );

    it(
      "creates a stable SHA-256 hash without retaining the raw token",
      () => {
        const hash =
          hashReviewInvitationToken(
            VALID_TOKEN
          );

        expect(hash).toMatch(
          /^[0-9a-f]{64}$/
        );

        expect(
          hashReviewInvitationToken(
            VALID_TOKEN
          )
        ).toBe(hash);

        expect(hash).not.toContain(
          VALID_TOKEN
        );
      }
    );
  }
);
