import {
  createHash,
} from "node:crypto";

const REVIEW_INVITATION_TOKEN_PATTERN =
  /^[A-Za-z0-9_-]{43,128}$/;

export function normalizeReviewInvitationToken(
  value: unknown
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const token =
    value.trim();

  return REVIEW_INVITATION_TOKEN_PATTERN.test(
    token
  )
    ? token
    : null;
}

export function hashReviewInvitationToken(
  token: string
): string {
  return createHash(
    "sha256"
  )
    .update(
      token,
      "utf8"
    )
    .digest(
      "hex"
    );
}
