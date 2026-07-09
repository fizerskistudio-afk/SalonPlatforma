import "server-only";

import {
  randomBytes,
} from "node:crypto";

import type {
  DirectMemberRole,
  MemberCredentialAction,
} from "./types";

export const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isJsonRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value
    )
  );
}

export function getTrimmedString(
  value: unknown
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

export function isDirectMemberRole(
  value: unknown
): value is DirectMemberRole {
  return (
    value === "manager" ||
    value === "staff"
  );
}

export function isMemberCredentialAction(
  value: unknown
): value is MemberCredentialAction {
  return (
    value ===
      "create_member" ||
    value ===
      "reset_member_password"
  );
}

export function generateTemporaryPassword(): string {
  return `Tmp!${randomBytes(
    18
  ).toString(
    "base64url"
  )}9a`;
}

export function getAppMetadata(
  value: unknown
): Record<
  string,
  unknown
> {
  return isJsonRecord(
    value
  )
    ? value
    : {};
}
