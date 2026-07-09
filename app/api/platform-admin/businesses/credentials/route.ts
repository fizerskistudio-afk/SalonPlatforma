import {
  type NextRequest,
} from "next/server";

import {
  authorizePlatformAdmin,
  jsonError,
} from "@/lib/platform-admin/credentials/http";

import {
  createOwnerCredentials,
  resetOwnerPassword,
} from "@/lib/platform-admin/credentials/service";

import type {
  CredentialRequestBody,
} from "@/lib/platform-admin/credentials/types";

import {
  isCredentialAction,
  isJsonRecord,
} from "@/lib/platform-admin/credentials/validation";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export async function POST(
  request: NextRequest
) {
  const authorization =
    await authorizePlatformAdmin();

  if (
    "error" in
    authorization
  ) {
    return authorization.error;
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
      CredentialRequestBody;

  if (
    !isCredentialAction(
      body.action
    )
  ) {
    return jsonError(
      400,
      "Credential akcija nije podržana.",
      "INVALID_CREDENTIAL_ACTION"
    );
  }

  if (
    body.action ===
    "create_owner"
  ) {
    return createOwnerCredentials(
      body
    );
  }

  return resetOwnerPassword(
    body
  );
}
