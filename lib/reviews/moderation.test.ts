import {
  describe,
  expect,
  it,
} from "vitest";

import {
  canTransitionReviewStatus,
  canUsePlatformOwnerReply,
  getAllowedReviewStatusTransitions,
  isModerationReasonRequired,
} from "./moderation";

describe(
  "review moderation contract",
  () => {
    it(
      "allows the locked pending lifecycle",
      () => {
        expect(
          getAllowedReviewStatusTransitions(
            "pending"
          )
        ).toEqual([
          "published",
          "rejected",
          "flagged",
          "archived",
        ]);
      }
    );

    it(
      "requires investigation before rejecting a published review",
      () => {
        expect(
          canTransitionReviewStatus(
            "published",
            "rejected"
          )
        ).toBe(false);

        expect(
          canTransitionReviewStatus(
            "published",
            "flagged"
          )
        ).toBe(true);
      }
    );

    it.each([
      "rejected",
      "flagged",
      "archived",
    ] as const)(
      "requires a reason for %s",
      (status) => {
        expect(
          isModerationReasonRequired(
            status
          )
        ).toBe(true);
      }
    );

    it(
      "allows local reply only for published platform reviews",
      () => {
        expect(
          canUsePlatformOwnerReply(
            "platform",
            "published"
          )
        ).toBe(true);

        expect(
          canUsePlatformOwnerReply(
            "google",
            "published"
          )
        ).toBe(false);

        expect(
          canUsePlatformOwnerReply(
            "manual-testimonial",
            "published"
          )
        ).toBe(false);

        expect(
          canUsePlatformOwnerReply(
            "platform",
            "pending"
          )
        ).toBe(false);
      }
    );
  }
);
