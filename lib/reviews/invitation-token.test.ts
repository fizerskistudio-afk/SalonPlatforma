import {
  describe,
  expect,
  it,
} from "vitest";

import {
  generateReviewInvitationToken,
} from "./invitation-token";
import {
  hashReviewInvitationToken,
  normalizeReviewInvitationToken,
} from "./token";

describe(
  "review invitation token generation",
  () => {
    it(
      "creates a valid 256-bit base64url bearer",
      () => {
        const token =
          generateReviewInvitationToken();

        expect(token).toMatch(
          /^[A-Za-z0-9_-]{43}$/
        );

        expect(
          normalizeReviewInvitationToken(
            token
          )
        ).toBe(token);

        expect(
          hashReviewInvitationToken(
            token
          )
        ).toMatch(
          /^[0-9a-f]{64}$/
        );
      }
    );

    it(
      "does not repeat tokens in a representative sample",
      () => {
        const tokens =
          new Set(
            Array.from(
              {
                length:
                  128,
              },
              () =>
                generateReviewInvitationToken()
            )
          );

        expect(
          tokens.size
        ).toBe(128);
      }
    );
  }
);
