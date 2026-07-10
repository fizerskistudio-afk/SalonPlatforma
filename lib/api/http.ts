import {
  NextResponse,
} from "next/server";

export type ApiErrorBody = {
  ok: false;
  message: string;
  code: string;
};

export type JsonResponseOptions = {
  headers?: HeadersInit;
  cacheControl?: string;
};

function createResponseHeaders(
  options: JsonResponseOptions
): Headers {
  const headers = new Headers(
    options.headers
  );

  if (
    !headers.has(
      "Cache-Control"
    )
  ) {
    headers.set(
      "Cache-Control",
      options.cacheControl ??
        "no-store"
    );
  }

  return headers;
}

export function jsonResponse<TBody>(
  body: TBody,
  status = 200,
  options: JsonResponseOptions = {}
) {
  return NextResponse.json<TBody>(
    body,
    {
      status,
      headers:
        createResponseHeaders(
          options
        ),
    }
  );
}

export function jsonError(
  status: number,
  message: string,
  code: string,
  options: JsonResponseOptions = {}
) {
  return jsonResponse<ApiErrorBody>(
    {
      ok: false,
      message,
      code,
    },
    status,
    options
  );
}
