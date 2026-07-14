import {
  type NextRequest,
} from "next/server";

import {
  getAdminContext,
} from "@/lib/auth/admin";

import {
  jsonError,
} from "@/lib/admin/member-credentials/http";

import {
  createMemberCredentials,
  resetMemberPassword,
} from "@/lib/admin/member-credentials/service";

import type {
  MemberCredentialRequestBody,
} from "@/lib/admin/member-credentials/types";

import {
  isJsonRecord,
  isMemberCredentialAction,
} from "@/lib/admin/member-credentials/validation";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export async function POST(
  request: NextRequest
) {
  const admin =
    await getAdminContext();

  if (!admin) {
    return jsonError(
      401,
      "Administratorska sesija nije aktivna.",
      "UNAUTHENTICATED"
    );
  }

  if (admin.requiresTenantSelection) {
    return jsonError(
      409,
      "Pre nastavka izaberi aktivni salon.",
      "TENANT_SELECTION_REQUIRED"
    );
  }

  if (
    admin.role !== "owner"
  ) {
    return jsonError(
      403,
      "Samo vlasnik salona može da kreira ili resetuje direktne kredencijale članova.",
      "OWNER_REQUIRED"
    );
  }

  let bodyValue:
    unknown;

  try {
    bodyValue =
      await request.json();
  } catch {
    return jsonError(
      400,
      "Zahtev nije ispravan JSON.",
      "INVALID_JSON"
    );
  }

  if (
    !isJsonRecord(
      bodyValue
    )
  ) {
    return jsonError(
      400,
      "Zahtev mora biti JSON objekat.",
      "INVALID_REQUEST_BODY"
    );
  }

  const body =
    bodyValue as
      MemberCredentialRequestBody;

  if (
    !isMemberCredentialAction(
      body.action
    )
  ) {
    return jsonError(
      400,
      "Credential akcija nije ispravna.",
      "INVALID_ACTION"
    );
  }

  return body.action ===
    "create_member"
    ? createMemberCredentials(
        admin,
        body
      )
    : resetMemberPassword(
        admin,
        body
      );
}
