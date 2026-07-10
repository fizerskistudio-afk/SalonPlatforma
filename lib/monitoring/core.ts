import {
  createHash,
  randomUUID,
} from "node:crypto";

export type MonitoringLevel =
  | "info"
  | "warn"
  | "error";

export type MonitoringContext =
  Record<string, unknown>;

export type MonitoringRecord = {
  timestamp: string;
  level: MonitoringLevel;
  event: string;
} & Record<string, unknown>;

const REQUEST_ID_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;

const EVENT_PATTERN =
  /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;

const SAFE_CODE_PATTERN =
  /^[A-Za-z0-9_.:-]{1,128}$/;

const SENSITIVE_KEY_PATTERN =
  /(authorization|cookie|password|secret|token|email|phone|note|message|stack|payload|body|address|recipient|customer|ip)/i;

const MAX_CONTEXT_KEYS = 32;
const MAX_STRING_LENGTH = 200;

function trimString(
  value: string
): string {
  if (
    value.length <=
    MAX_STRING_LENGTH
  ) {
    return value;
  }

  return `${value.slice(
    0,
    MAX_STRING_LENGTH
  )}…`;
}

function readErrorProperty(
  error: unknown,
  key: "name" | "message" | "code"
): string {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return "";
  }

  const value =
    (error as Record<
      string,
      unknown
    >)[key];

  return typeof value === "string"
    ? value
    : "";
}

export function createRequestId(
  headers?: Pick<Headers, "get">
): string {
  const candidate =
    headers
      ?.get("x-request-id")
      ?.trim() ?? "";

  if (
    REQUEST_ID_PATTERN.test(
      candidate
    )
  ) {
    return candidate;
  }

  return randomUUID();
}

export function createSafeErrorContext(
  error: unknown
): Record<string, string | null> {
  const errorName =
    error instanceof Error
      ? error.name
      : readErrorProperty(
          error,
          "name"
        ) ||
        typeof error;

  const rawMessage =
    error instanceof Error
      ? error.message
      : readErrorProperty(
          error,
          "message"
        ) ||
        (
          typeof error === "string"
            ? error
            : ""
        );

  const rawCode =
    readErrorProperty(
      error,
      "code"
    );

  const errorCode =
    SAFE_CODE_PATTERN.test(
      rawCode
    )
      ? rawCode
      : null;

  const fingerprint =
    createHash("sha256")
      .update(
        [
          errorName,
          errorCode ?? "",
          rawMessage,
          typeof error,
        ].join("\u001f")
      )
      .digest("hex")
      .slice(0, 24);

  return {
    errorName:
      SAFE_CODE_PATTERN.test(
        errorName
      )
        ? errorName
        : "UnknownError",
    errorCode,
    errorFingerprint:
      fingerprint,
  };
}

export function sanitizeMonitoringContext(
  context: MonitoringContext
): Record<string, unknown> {
  const sanitized:
    Record<string, unknown> = {};

  const entries =
    Object.entries(context)
      .slice(
        0,
        MAX_CONTEXT_KEYS
      );

  for (
    const [key, value] of entries
  ) {
    if (
      SENSITIVE_KEY_PATTERN.test(
        key
      )
    ) {
      sanitized[key] =
        "[REDACTED]";
      continue;
    }

    if (
      value === null ||
      typeof value === "boolean"
    ) {
      sanitized[key] = value;
      continue;
    }

    if (
      typeof value === "number"
    ) {
      sanitized[key] =
        Number.isFinite(value)
          ? value
          : "[NON_FINITE_NUMBER]";
      continue;
    }

    if (
      typeof value === "string"
    ) {
      sanitized[key] =
        trimString(value);
      continue;
    }

    if (
      typeof value === "undefined"
    ) {
      continue;
    }

    sanitized[key] =
      "[UNSUPPORTED_VALUE]";
  }

  return sanitized;
}

export function createMonitoringRecord(
  level: MonitoringLevel,
  event: string,
  context:
    MonitoringContext = {},
  now = new Date()
): MonitoringRecord {
  const safeEvent =
    EVENT_PATTERN.test(event)
      ? event
      : "monitoring.invalid_event";

  return {
    ...sanitizeMonitoringContext(
      context
    ),
    timestamp:
      now.toISOString(),
    level,
    event: safeEvent,
  };
}
