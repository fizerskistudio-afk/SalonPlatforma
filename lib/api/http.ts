import {
  NextResponse,
} from "next/server";

export type ApiErrorBody = {
  ok: false;
  message: string;
  code: string;
};

type JsonErrorOptions = {
  headers?: HeadersInit;
  cacheControl?: string;
};

export function jsonError(
  status: number,
  message: string,
  code: string,
  options: JsonErrorOptions = {}
) {
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

  return NextResponse.json<ApiErrorBody>(
    {
      ok: false,
      message,
      code,
    },
    {
      status,
      headers,
    }
  );
}
