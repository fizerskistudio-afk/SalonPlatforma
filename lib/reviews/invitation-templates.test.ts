import {
  describe,
  expect,
  it,
} from "vitest";

import {
  REVIEW_INVITATION_EMAIL_LOCALES,
  renderReviewInvitationEmail,
} from "./invitation-templates";

function context(
  locale: string
) {
  return {
    locale,
    businessName:
      "Studio Test",
    customerName:
      "Petar",
    serviceName:
      "Šišanje",
    employeeName:
      "Ana",
    startsAt:
      "2026-07-12T10:00:00+02:00",
    timezone:
      "Europe/Belgrade",
    reviewUrl:
      "https://example.com/reviews/invitation/test-token",
    expiresAt:
      "2026-08-11T10:00:00+02:00",
  };
}

describe(
  "review invitation email templates",
  () => {
    it.each(
      REVIEW_INVITATION_EMAIL_LOCALES
    )(
      "renders locale %s",
      (
        locale
      ) => {
        const result =
          renderReviewInvitationEmail(
            context(
              locale
            )
          );

        expect(
          result.subject
        ).toContain(
          "Studio Test"
        );

        expect(
          result.html
        ).toContain(
          "https://example.com/reviews/invitation/test-token"
        );

        expect(
          result.text
        ).toContain(
          "https://example.com/reviews/invitation/test-token"
        );

        expect(
          result.html
        ).toContain(
          "Šišanje"
        );
      }
    );

    it(
      "falls back to Serbian Latin",
      () => {
        const result =
          renderReviewInvitationEmail(
            context(
              "unsupported"
            )
          );

        expect(
          result.subject
        ).toContain(
          "Kako je prošla poseta"
        );
      }
    );
  }
);
