import {
  getReviewSourceCapabilities,
  type ReviewSource,
  type ReviewStatus,
} from "@/lib/reviews/domain";

export const REVIEW_STATUS_TRANSITIONS:
  Record<
    ReviewStatus,
    readonly ReviewStatus[]
  > = {
  pending: [
    "published",
    "rejected",
    "flagged",
    "archived",
  ],
  published: [
    "flagged",
    "archived",
  ],
  rejected: [
    "pending",
    "archived",
  ],
  flagged: [
    "published",
    "rejected",
    "archived",
  ],
  archived: [
    "pending",
  ],
};

export function getAllowedReviewStatusTransitions(
  status: ReviewStatus
): readonly ReviewStatus[] {
  return REVIEW_STATUS_TRANSITIONS[
    status
  ];
}

export function canTransitionReviewStatus(
  currentStatus: ReviewStatus,
  nextStatus: ReviewStatus
): boolean {
  return (
    currentStatus === nextStatus ||
    getAllowedReviewStatusTransitions(
      currentStatus
    ).includes(nextStatus)
  );
}

export function isModerationReasonRequired(
  nextStatus: ReviewStatus
): boolean {
  return (
    nextStatus === "rejected" ||
    nextStatus === "flagged" ||
    nextStatus === "archived"
  );
}

export function canUsePlatformOwnerReply(
  source: ReviewSource,
  status: ReviewStatus
): boolean {
  const capabilities =
    getReviewSourceCapabilities(source);

  return (
    capabilities.ownerReplyMode ===
      "platform" &&
    status === "published"
  );
}
