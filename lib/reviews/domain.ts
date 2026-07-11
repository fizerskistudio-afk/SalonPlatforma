export const REVIEW_SOURCES = [
  "platform",
  "google",
  "manual-testimonial",
  "demo",
] as const;

export type ReviewSource =
  (typeof REVIEW_SOURCES)[number];

export const REVIEW_STATUSES = [
  "pending",
  "published",
  "rejected",
  "flagged",
  "archived",
] as const;

export type ReviewStatus =
  (typeof REVIEW_STATUSES)[number];

export type ReviewEnvironment =
  | "preview"
  | "production";

export type ReviewSubmissionMode =
  | "platform-form"
  | "provider-link"
  | "admin-entry"
  | "preview-generator";

export type ReviewOwnerReplyMode =
  | "platform"
  | "provider"
  | "none";

export type ReviewSourceCapabilities = {
  submissionMode:
    ReviewSubmissionMode;
  externallyManaged: boolean;
  salonCanEditBody: boolean;
  salonCanModerateVisibility: boolean;
  canBeVerifiedVisit: boolean;
  synthetic: boolean;
  ownerReplyMode:
    ReviewOwnerReplyMode;
};

export const REVIEW_SOURCE_CAPABILITIES:
  Record<
    ReviewSource,
    ReviewSourceCapabilities
  > = {
  platform: {
    submissionMode:
      "platform-form",
    externallyManaged:
      false,
    salonCanEditBody:
      false,
    salonCanModerateVisibility:
      true,
    canBeVerifiedVisit:
      true,
    synthetic:
      false,
    ownerReplyMode:
      "platform",
  },
  google: {
    submissionMode:
      "provider-link",
    externallyManaged:
      true,
    salonCanEditBody:
      false,
    salonCanModerateVisibility:
      true,
    canBeVerifiedVisit:
      false,
    synthetic:
      false,
    ownerReplyMode:
      "provider",
  },
  "manual-testimonial": {
    submissionMode:
      "admin-entry",
    externallyManaged:
      false,
    salonCanEditBody:
      true,
    salonCanModerateVisibility:
      true,
    canBeVerifiedVisit:
      false,
    synthetic:
      false,
    ownerReplyMode:
      "none",
  },
  demo: {
    submissionMode:
      "preview-generator",
    externallyManaged:
      false,
    salonCanEditBody:
      true,
    salonCanModerateVisibility:
      true,
    canBeVerifiedVisit:
      false,
    synthetic:
      true,
    ownerReplyMode:
      "none",
  },
};

export type ReviewBadgeKind =
  | "platform"
  | "verified-visit"
  | "google"
  | "testimonial"
  | "demo";

export type ReviewValidationCode =
  | "RATING_REQUIRED"
  | "INVALID_RATING"
  | "VERIFIED_VISIT_REQUIRES_PLATFORM"
  | "VERIFIED_VISIT_REQUIRES_BOOKING"
  | "BOOKING_LINK_REQUIRES_PLATFORM"
  | "BOOKING_LINK_REQUIRES_VERIFIED_VISIT"
  | "GOOGLE_REQUIRES_EXTERNAL_ID"
  | "EXTERNAL_ID_REQUIRES_GOOGLE"
  | "DEMO_NOT_ALLOWED_IN_PRODUCTION";

export type ReviewValidationInput = {
  source: ReviewSource;
  rating: number | null;
  bookingId: string | null;
  isVerifiedVisit: boolean;
  externalId: string | null;
  environment:
    ReviewEnvironment;
};

export function getReviewSourceCapabilities(
  source: ReviewSource
): ReviewSourceCapabilities {
  return REVIEW_SOURCE_CAPABILITIES[
    source
  ];
}

export function isReviewPublic(
  status: ReviewStatus
): boolean {
  return status === "published";
}

export function resolveReviewBadgeKind(
  source: ReviewSource,
  isVerifiedVisit: boolean
): ReviewBadgeKind {
  if (
    source === "platform" &&
    isVerifiedVisit
  ) {
    return "verified-visit";
  }

  switch (source) {
    case "google":
      return "google";

    case "manual-testimonial":
      return "testimonial";

    case "demo":
      return "demo";

    case "platform":
      return "platform";
  }
}

function requiresRating(
  source: ReviewSource
): boolean {
  return (
    source === "platform" ||
    source === "google" ||
    source === "demo"
  );
}

function isValidRating(
  rating: number
): boolean {
  return (
    Number.isInteger(rating) &&
    rating >= 1 &&
    rating <= 5
  );
}

function hasValue(
  value: string | null
): boolean {
  return Boolean(
    value?.trim()
  );
}

export function validateReviewInvariant(
  input: ReviewValidationInput
): ReviewValidationCode[] {
  const errors:
    ReviewValidationCode[] = [];

  if (
    input.rating === null
  ) {
    if (
      requiresRating(
        input.source
      )
    ) {
      errors.push(
        "RATING_REQUIRED"
      );
    }
  } else if (
    !isValidRating(
      input.rating
    )
  ) {
    errors.push(
      "INVALID_RATING"
    );
  }

  const hasBooking =
    hasValue(
      input.bookingId
    );

  if (
    input.isVerifiedVisit &&
    input.source !== "platform"
  ) {
    errors.push(
      "VERIFIED_VISIT_REQUIRES_PLATFORM"
    );
  }

  if (
    input.isVerifiedVisit &&
    !hasBooking
  ) {
    errors.push(
      "VERIFIED_VISIT_REQUIRES_BOOKING"
    );
  }

  if (
    hasBooking &&
    input.source !== "platform"
  ) {
    errors.push(
      "BOOKING_LINK_REQUIRES_PLATFORM"
    );
  }

  if (
    hasBooking &&
    input.source === "platform" &&
    !input.isVerifiedVisit
  ) {
    errors.push(
      "BOOKING_LINK_REQUIRES_VERIFIED_VISIT"
    );
  }

  const hasExternalId =
    hasValue(
      input.externalId
    );

  if (
    input.source === "google" &&
    !hasExternalId
  ) {
    errors.push(
      "GOOGLE_REQUIRES_EXTERNAL_ID"
    );
  }

  if (
    input.source !== "google" &&
    hasExternalId
  ) {
    errors.push(
      "EXTERNAL_ID_REQUIRES_GOOGLE"
    );
  }

  if (
    input.source === "demo" &&
    input.environment ===
      "production"
  ) {
    errors.push(
      "DEMO_NOT_ALLOWED_IN_PRODUCTION"
    );
  }

  return errors;
}

export function isValidReviewInvariant(
  input: ReviewValidationInput
): boolean {
  return (
    validateReviewInvariant(
      input
    ).length === 0
  );
}
