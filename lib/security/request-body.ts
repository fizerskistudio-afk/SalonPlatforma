import "server-only";

export type ReadJsonBodyResult =
  | {
      ok: true;
      value: unknown;
    }
  | {
      ok: false;
      status: 400 | 413 | 415;
      code:
        | "INVALID_JSON"
        | "REQUEST_TOO_LARGE"
        | "UNSUPPORTED_MEDIA_TYPE";
      message: string;
    };

export async function readJsonBodyWithLimit(
  request: Request,
  maxBytes: number
): Promise<ReadJsonBodyResult> {
  const contentType =
    request.headers
      .get("content-type")
      ?.toLowerCase() ?? "";

  if (
    !contentType.includes(
      "application/json"
    )
  ) {
    return {
      ok: false,
      status: 415,
      code:
        "UNSUPPORTED_MEDIA_TYPE",
      message:
        "Content-Type mora biti application/json.",
    };
  }

  const contentLength =
    request.headers.get(
      "content-length"
    );

  if (contentLength) {
    const parsedLength =
      Number(contentLength);

    if (
      Number.isFinite(parsedLength) &&
      parsedLength > maxBytes
    ) {
      return {
        ok: false,
        status: 413,
        code:
          "REQUEST_TOO_LARGE",
        message:
          "Zahtev je prevelik.",
      };
    }
  }

  const rawBody =
    await request.text();

  const actualBytes =
    new TextEncoder()
      .encode(rawBody)
      .byteLength;

  if (actualBytes > maxBytes) {
    return {
      ok: false,
      status: 413,
      code:
        "REQUEST_TOO_LARGE",
      message:
        "Zahtev je prevelik.",
    };
  }

  try {
    return {
      ok: true,
      value:
        JSON.parse(rawBody),
    };
  } catch {
    return {
      ok: false,
      status: 400,
      code: "INVALID_JSON",
      message:
        "Zahtev nije ispravan JSON.",
    };
  }
}
