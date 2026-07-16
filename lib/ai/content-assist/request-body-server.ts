import "server-only";

import {
  createRequestId,
} from "@/lib/monitoring/server";

export const AI_CONTENT_ASSIST_MAX_BODY_BYTES =
  16_384 as const;

export type AiContentAssistJsonBodyFailure = {
  ok: false;
  status: 400 | 413;
  code:
    | "INVALID_JSON"
    | "INVALID_REQUEST_BODY"
    | "REQUEST_BODY_TOO_LARGE";
  message: string;
};

export type AiContentAssistJsonBodySuccess = {
  ok: true;
  value: unknown;
};

export type AiContentAssistJsonBodyResult =
  | AiContentAssistJsonBodySuccess
  | AiContentAssistJsonBodyFailure;

export type AiContentAssistBodyRequest =
  Pick<
    Request,
    | "headers"
    | "text"
  >;

function getDeclaredBodySize(
  headers:
    Pick<Headers, "get">
): number | null {
  const rawValue =
    headers
      .get(
        "content-length"
      )
      ?.trim();

  if (
    !rawValue
  ) {
    return null;
  }

  const parsed =
    Number(
      rawValue
    );

  return Number.isSafeInteger(
    parsed
  ) &&
  parsed >=
    0
    ? parsed
    : null;
}

export function getAiContentAssistRequestId(
  headers:
    Pick<Headers, "get">
): string {
  return createRequestId(
    headers
  );
}

export async function readAiContentAssistJsonBody(
  request:
    AiContentAssistBodyRequest
): Promise<AiContentAssistJsonBodyResult> {
  const declaredSize =
    getDeclaredBodySize(
      request.headers
    );

  if (
    declaredSize !==
      null &&
    declaredSize >
      AI_CONTENT_ASSIST_MAX_BODY_BYTES
  ) {
    return {
      ok: false,
      status: 413,
      code:
        "REQUEST_BODY_TOO_LARGE",
      message:
        "AI zahtev je prevelik.",
    };
  }

  let rawBody:
    string;

  try {
    rawBody =
      await request.text();
  } catch {
    return {
      ok: false,
      status: 400,
      code:
        "INVALID_REQUEST_BODY",
      message:
        "AI zahtev nije moguće pročitati.",
    };
  }

  const byteLength =
    new TextEncoder()
      .encode(
        rawBody
      )
      .byteLength;

  if (
    byteLength >
    AI_CONTENT_ASSIST_MAX_BODY_BYTES
  ) {
    return {
      ok: false,
      status: 413,
      code:
        "REQUEST_BODY_TOO_LARGE",
      message:
        "AI zahtev je prevelik.",
    };
  }

  if (
    rawBody.trim().length ===
    0
  ) {
    return {
      ok: false,
      status: 400,
      code:
        "INVALID_REQUEST_BODY",
      message:
        "AI zahtev nema sadržaj.",
    };
  }

  try {
    return {
      ok: true,
      value:
        JSON.parse(
          rawBody
        ) as unknown,
    };
  } catch {
    return {
      ok: false,
      status: 400,
      code:
        "INVALID_JSON",
      message:
        "AI zahtev nije ispravan JSON.",
    };
  }
}
