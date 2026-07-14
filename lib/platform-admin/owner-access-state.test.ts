import {
  describe,
  expect,
  it,
} from "vitest";

import {
  canResendOwnerActivation,
  resolveOwnerAccessState,
} from "./owner-access-state";

const baseInput = {
  membershipActive: true,
  authUserAvailable: true,
  invitedAt: null,
  emailConfirmedAt:
    "2026-07-14T09:00:00.000Z",
  lastSignInAt:
    "2026-07-14T09:05:00.000Z",
  mustChangePassword: false,
};

describe(
  "platform-admin owner access state",
  () => {
    it(
      "distinguishes invited, password-pending, active and disabled owners",
      () => {
        expect(
          resolveOwnerAccessState({
            ...baseInput,
            emailConfirmedAt: null,
            lastSignInAt: null,
            invitedAt:
              "2026-07-14T08:00:00.000Z",
          })
        ).toBe("invited");

        expect(
          resolveOwnerAccessState({
            ...baseInput,
            mustChangePassword: true,
          })
        ).toBe(
          "password_pending"
        );

        expect(
          resolveOwnerAccessState(
            baseInput
          )
        ).toBe("active");

        expect(
          resolveOwnerAccessState({
            ...baseInput,
            membershipActive: false,
          })
        ).toBe("disabled");
      }
    );

    it(
      "marks a missing auth account as recovery-required without overriding disabled membership",
      () => {
        expect(
          resolveOwnerAccessState({
            ...baseInput,
            authUserAvailable: false,
          })
        ).toBe(
          "recovery_required"
        );

        expect(
          resolveOwnerAccessState({
            ...baseInput,
            authUserAvailable: false,
            membershipActive: false,
          })
        ).toBe("disabled");
      }
    );

    it(
      "treats a confirmed invitation without a first sign-in as password-pending",
      () => {
        expect(
          resolveOwnerAccessState({
            ...baseInput,
            invitedAt:
              "2026-07-14T08:00:00.000Z",
            lastSignInAt: null,
          })
        ).toBe(
          "password_pending"
        );
      }
    );

    it(
      "allows activation resend only for email-based pending flows",
      () => {
        expect(
          canResendOwnerActivation({
            state: "invited",
            hasEmail: true,
            mustChangePassword: false,
          })
        ).toBe(true);

        expect(
          canResendOwnerActivation({
            state:
              "password_pending",
            hasEmail: true,
            mustChangePassword: true,
          })
        ).toBe(false);

        expect(
          canResendOwnerActivation({
            state: "active",
            hasEmail: true,
            mustChangePassword: false,
          })
        ).toBe(false);
      }
    );
  }
);
