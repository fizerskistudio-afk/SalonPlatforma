import "server-only";

import {
  createMonitoringRecord,
  createRequestId,
  createSafeErrorContext,
  type MonitoringContext,
  type MonitoringLevel,
} from "@/lib/monitoring/core";

export {
  createRequestId,
} from "@/lib/monitoring/core";

export function withRequestId<
  TResponse extends Response
>(
  response: TResponse,
  requestId: string
): TResponse {
  response.headers.set(
    "X-Request-ID",
    requestId
  );

  return response;
}

function writeMonitoringRecord(
  level: MonitoringLevel,
  line: string
): void {
  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export function logServerEvent(
  level: MonitoringLevel,
  event: string,
  context:
    MonitoringContext = {}
): void {
  const record =
    createMonitoringRecord(
      level,
      event,
      context
    );

  writeMonitoringRecord(
    level,
    JSON.stringify(record)
  );
}

export function logServerError(
  event: string,
  error: unknown,
  context:
    MonitoringContext = {}
): void {
  logServerEvent(
    "error",
    event,
    {
      ...context,
      ...createSafeErrorContext(
        error
      ),
    }
  );
}
