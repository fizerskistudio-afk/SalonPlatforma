import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildOwnerActivationEmail,
  getOwnerActivationDedupeKey,
  OWNER_ACTIVATION_RESEND_WINDOW_MS,
} from "./owner-activation";

describe(
  "platform-admin owner activation",
  () => {
    it(
      "deduplicates retries in the same domain resend window",
      () => {
        const input = {
          businessId:
            "11111111-1111-4111-8111-111111111111",
          memberId:
            "22222222-2222-4222-8222-222222222222",
          linkType:
            "invite" as const,
        };
        const startedAt =
          OWNER_ACTIVATION_RESEND_WINDOW_MS *
            50 +
          1000;

        expect(
          getOwnerActivationDedupeKey({
            ...input,
            now: startedAt,
          })
        ).toBe(
          getOwnerActivationDedupeKey({
            ...input,
            now:
              startedAt +
              30_000,
          })
        );

        expect(
          getOwnerActivationDedupeKey({
            ...input,
            now:
              startedAt +
              OWNER_ACTIVATION_RESEND_WINDOW_MS,
          })
        ).not.toBe(
          getOwnerActivationDedupeKey({
            ...input,
            now: startedAt,
          })
        );
      }
    );

    it(
      "separates invitation and recovery delivery domains",
      () => {
        const common = {
          businessId: "business",
          memberId: "member",
          now: 0,
        };

        expect(
          getOwnerActivationDedupeKey({
            ...common,
            linkType: "invite",
          })
        ).not.toBe(
          getOwnerActivationDedupeKey({
            ...common,
            linkType: "recovery",
          })
        );
      }
    );

    it(
      "escapes tenant-controlled values in activation HTML",
      () => {
        const content =
          buildOwnerActivationEmail({
            businessName:
              '<script>alert("x")</script>',
            email:
              "owner@example.com",
            actionLink:
              "https://example.com/?a=1&b=2",
            linkType: "invite",
          });

        expect(
          content.html
        ).not.toContain(
          "<script>"
        );
        expect(
          content.html
        ).toContain(
          "&lt;script&gt;"
        );
        expect(
          content.html
        ).toContain(
          "a=1&amp;b=2"
        );
      }
    );
  }
);
