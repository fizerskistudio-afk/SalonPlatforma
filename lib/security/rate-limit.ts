import "server-only";

import { createHmac } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  logServerError,
  logServerEvent,
} from "@/lib/monitoring/server";

export type RateLimitFailureMode =
  | "open"
  | "closed";

export type ConsumeRateLimitInput = {
  scope: string;
  parts: Array<string | null | undefined>;
  limit: number;
  windowSeconds: number;
  failureMode?: RateLimitFailureMode;
  requestId?: string;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: string;
  unavailable: boolean;
};

type RateLimitRpcRow = {
  allowed: boolean;
  remaining: number;
  retry_after_seconds: number;
  reset_at: string;
};

const UNKNOWN_CLIENT_ADDRESS =
  "unknown-client";

function getHashSecret(): string {
  const configured =
    process.env.PUBLIC_RATE_LIMIT_SECRET?.trim();

  if (configured) {
    return configured;
  }

  const serviceRoleFallback =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (serviceRoleFallback) {
    return serviceRoleFallback;
  }

  if (
    process.env.NODE_ENV !==
    "production"
  ) {
    return "local-development-rate-limit-secret";
  }

  throw new Error(
    "PUBLIC_RATE_LIMIT_SECRET is required in production."
  );
}

function normalizeKeyPart(
  value: string | null | undefined
): string {
  return value
    ?.trim()
    .toLowerCase() || "-";
}

export function createPrivateRateLimitKey(
  ...parts: Array<string | null | undefined>
): string {
  const value = parts
    .map(normalizeKeyPart)
    .join("\u001f");

  return createHmac(
    "sha256",
    getHashSecret()
  )
    .update(value)
    .digest("hex");
}

export function getClientAddress(
  requestHeaders: Headers
): string {
  const directHeaders = [
    "cf-connecting-ip",
    "x-real-ip",
    "x-vercel-forwarded-for",
  ];

  for (const headerName of directHeaders) {
    const value =
      requestHeaders
        .get(headerName)
        ?.trim();

    if (value) {
      return value
        .split(",")[0]
        .trim() ||
        UNKNOWN_CLIENT_ADDRESS;
    }
  }

  const forwarded =
    requestHeaders
      .get("x-forwarded-for")
      ?.split(",")[0]
      .trim();

  return forwarded ||
    UNKNOWN_CLIENT_ADDRESS;
}

function unavailableResult(
  input: ConsumeRateLimitInput
): RateLimitResult {
  const allowed =
    (input.failureMode ?? "closed") ===
    "open";

  return {
    allowed,
    limit: input.limit,
    remaining: allowed
      ? input.limit
      : 0,
    retryAfterSeconds: 60,
    resetAt:
      new Date(
        Date.now() +
          60_000
      ).toISOString(),
    unavailable: true,
  };
}

export async function consumeRateLimit(
  input: ConsumeRateLimitInput
): Promise<RateLimitResult> {
  if (
    !input.scope.trim() ||
    input.limit < 1 ||
    input.windowSeconds < 1
  ) {
    throw new Error(
      "Invalid rate-limit configuration."
    );
  }

  let keyHash: string;

  try {
    keyHash =
      createPrivateRateLimitKey(
        ...input.parts
      );
  } catch (error) {
    logServerError(
      "rate_limit.key_creation.failed",
      error,
      {
        requestId:
          input.requestId ?? null,
        scope:
          input.scope,
        failureMode:
          input.failureMode ??
          "closed",
      }
    );

    return unavailableResult(input);
  }

  const adminClient =
    createAdminClient();

  const {
    data,
    error,
  } = await adminClient.rpc(
    "consume_public_rate_limit",
    {
      p_scope:
        input.scope,
      p_key_hash:
        keyHash,
      p_limit:
        input.limit,
      p_window_seconds:
        input.windowSeconds,
    }
  );

  if (error) {
    logServerError(
      "rate_limit.storage.failed",
      error,
      {
        requestId:
          input.requestId ?? null,
        scope:
          input.scope,
        failureMode:
          input.failureMode ??
          "closed",
      }
    );

    return unavailableResult(input);
  }

  const row =
    Array.isArray(data)
      ? data[0]
      : data;

  if (!row) {
    logServerEvent(
      "error",
      "rate_limit.storage.empty_result",
      {
        requestId:
          input.requestId ?? null,
        scope:
          input.scope,
        failureMode:
          input.failureMode ??
          "closed",
      }
    );

    return unavailableResult(input);
  }

  const result =
    row as unknown as
      RateLimitRpcRow;

  return {
    allowed:
      result.allowed === true,
    limit:
      input.limit,
    remaining:
      Math.max(
        0,
        Number(
          result.remaining ?? 0
        )
      ),
    retryAfterSeconds:
      Math.max(
        0,
        Number(
          result.retry_after_seconds ?? 0
        )
      ),
    resetAt:
      result.reset_at,
    unavailable: false,
  };
}

export function getRateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  const headers: Record<
    string,
    string
  > = {
    "X-RateLimit-Limit":
      String(result.limit),
    "X-RateLimit-Remaining":
      String(result.remaining),
    "X-RateLimit-Reset":
      result.resetAt,
  };

  if (!result.allowed) {
    headers["Retry-After"] =
      String(
        Math.max(
          1,
          result.retryAfterSeconds
        )
      );
  }

  return headers;
}

export function formatRetryAfter(
  seconds: number
): string {
  if (seconds < 60) {
    return `${Math.max(1, seconds)} sekundi`;
  }

  const minutes =
    Math.ceil(seconds / 60);

  return `${minutes} ${
    minutes === 1
      ? "minut"
      : "minuta"
  }`;
}
