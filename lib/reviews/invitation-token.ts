import {
  randomBytes,
} from "node:crypto";

const TOKEN_BYTES = 32;

export function generateReviewInvitationToken(): string {
  return randomBytes(
    TOKEN_BYTES
  ).toString(
    "base64url"
  );
}
