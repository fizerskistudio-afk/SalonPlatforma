import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export type ResendProviderDeliveryStatus =
  | "sent"
  | "delivered"
  | "delayed"
  | "bounced"
  | "complained"
  | "failed"
  | "suppressed";

type SupportedResendEventType =
  | "email.sent"
  | "email.delivered"
  | "email.delivery_delayed"
  | "email.bounced"
  | "email.complained"
  | "email.failed"
  | "email.suppressed";

type ResendWebhookEvent = {
  type: string;
  created_at?: unknown;
  data?: unknown;
};

type ReservedEvent = {
  id: string;
  finalDuplicate: boolean;
};

export type ProcessResendWebhookResult = {
  ok: true;
  duplicate: boolean;
  ignored: boolean;
  matched: boolean;
  deliveryId: string | null;
  providerMessageId: string | null;
  providerStatus:
    | ResendProviderDeliveryStatus
    | null;
};

const SUPPORTED_EVENTS =
  new Set<SupportedResendEventType>([
    "email.sent",
    "email.delivered",
    "email.delivery_delayed",
    "email.bounced",
    "email.complained",
    "email.failed",
    "email.suppressed",
  ]);

function isRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readString(
  value: unknown
): string | null {
  return typeof value ===
      "string" &&
    value.trim()
    ? value.trim()
    : null;
}

function readNestedString(
  value: unknown,
  path: readonly string[]
): string | null {
  let current =
    value;

  for (
    const key of path
  ) {
    if (!isRecord(current)) {
      return null;
    }

    current =
      current[key];
  }

  return readString(current);
}

function normalizeEventAt(
  event: ResendWebhookEvent
): string {
  const dataCreatedAt =
    isRecord(event.data)
      ? event.data.created_at
      : null;

  for (
    const candidate of [
      event.created_at,
      dataCreatedAt,
    ]
  ) {
    const value =
      readString(candidate);

    if (!value) {
      continue;
    }

    const timestamp =
      Date.parse(value);

    if (
      !Number.isNaN(
        timestamp
      )
    ) {
      return new Date(
        timestamp
      ).toISOString();
    }
  }

  return new Date()
    .toISOString();
}

function mapProviderStatus(
  eventType:
    SupportedResendEventType
): ResendProviderDeliveryStatus {
  switch (eventType) {
    case "email.sent":
      return "sent";

    case "email.delivered":
      return "delivered";

    case "email.delivery_delayed":
      return "delayed";

    case "email.bounced":
      return "bounced";

    case "email.complained":
      return "complained";

    case "email.failed":
      return "failed";

    case "email.suppressed":
      return "suppressed";
  }
}

function createProviderError(
  eventType:
    SupportedResendEventType,
  data: unknown
): string | null {
  const directMessage =
    [
      ["bounce", "message"],
      ["suppression", "reason"],
      ["suppression", "message"],
      ["delivery", "message"],
      ["error", "message"],
      ["reason"],
      ["error"],
      ["message"],
    ]
      .map(
        (path) =>
          readNestedString(
            data,
            path
          )
      )
      .find(Boolean) ??
    null;

  const bounceType =
    readNestedString(
      data,
      ["bounce", "type"]
    );

  const bounceSubType =
    readNestedString(
      data,
      ["bounce", "subType"]
    ) ??
    readNestedString(
      data,
      ["bounce", "sub_type"]
    );

  const details = [
    directMessage,
    bounceType
      ? `Tip: ${bounceType}`
      : null,
    bounceSubType
      ? `Podtip: ${bounceSubType}`
      : null,
  ].filter(
    (
      value
    ): value is string =>
      Boolean(value)
  );

  if (
    details.length > 0
  ) {
    return details
      .join(" | ")
      .slice(0, 4000);
  }

  if (
    eventType ===
      "email.complained"
  ) {
    return "Recipient marked the email as spam.";
  }

  if (
    eventType ===
      "email.delivery_delayed"
  ) {
    return "Recipient mail server temporarily delayed delivery.";
  }

  return null;
}

async function reserveEvent({
  svixId,
  eventType,
  providerMessageId,
  eventCreatedAt,
  payload,
}: {
  svixId: string;
  eventType: string;
  providerMessageId:
    | string
    | null;
  eventCreatedAt: string;
  payload:
    Record<string, unknown>;
}): Promise<ReservedEvent> {
  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "resend_webhook_events"
    )
    .insert({
      svix_id: svixId,
      event_type:
        eventType,
      provider_message_id:
        providerMessageId,
      event_created_at:
        eventCreatedAt,
      payload,
      processing_status:
        "received",
    })
    .select(
      "id, processing_status"
    )
    .single();

  if (
    !error &&
    data
  ) {
    return {
      id: data.id,
      finalDuplicate:
        false,
    };
  }

  if (
    error?.code !== "23505"
  ) {
    throw new Error(
      `Resend webhook event could not be reserved: ${error?.message ?? "unknown database error"}`
    );
  }

  const {
    data: existing,
    error:
      existingError,
  } = await supabase
    .from(
      "resend_webhook_events"
    )
    .select(
      "id, processing_status"
    )
    .eq(
      "svix_id",
      svixId
    )
    .maybeSingle();

  if (
    existingError ||
    !existing
  ) {
    throw new Error(
      `Duplicate Resend webhook event could not be loaded: ${existingError?.message ?? "event not found"}`
    );
  }

  return {
    id: existing.id,
    finalDuplicate:
      [
        "processed",
        "unmatched",
        "ignored",
      ].includes(
        existing.processing_status
      ),
  };
}

async function markEvent({
  eventId,
  status,
  deliveryId,
  errorMessage,
}: {
  eventId: string;
  status:
    | "processed"
    | "unmatched"
    | "ignored"
    | "failed";
  deliveryId?: string | null;
  errorMessage?: string | null;
}): Promise<void> {
  const supabase =
    createAdminClient();

  const {
    error,
  } = await supabase
    .from(
      "resend_webhook_events"
    )
    .update({
      processing_status:
        status,
      matched_delivery_id:
        deliveryId ?? null,
      processing_error:
        errorMessage ?? null,
      processed_at:
        new Date()
          .toISOString(),
    })
    .eq(
      "id",
      eventId
    );

  if (error) {
    throw new Error(
      `Resend webhook event status could not be updated: ${error.message}`
    );
  }
}

async function findDelivery(
  providerMessageId: string
): Promise<string | null> {
  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "notification_deliveries"
    )
    .select("id")
    .eq(
      "provider_message_id",
      providerMessageId
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Notification delivery could not be matched to Resend email: ${error.message}`
    );
  }

  return data?.id ??
    null;
}

async function applyDeliveryEvent({
  deliveryId,
  eventType,
  svixId,
  eventAt,
  providerStatus,
  providerError,
}: {
  deliveryId: string;
  eventType:
    SupportedResendEventType;
  svixId: string;
  eventAt: string;
  providerStatus:
    ResendProviderDeliveryStatus;
  providerError: string | null;
}): Promise<void> {
  const supabase =
    createAdminClient();

  const {
    error,
  } = await supabase.rpc(
    "apply_resend_delivery_event",
    {
      p_delivery_id:
        deliveryId,
      p_event_type:
        eventType,
      p_event_id:
        svixId,
      p_event_at:
        eventAt,
      p_provider_status:
        providerStatus,
      p_provider_error:
        providerError,
    }
  );

  if (error) {
    throw new Error(
      `Resend delivery state could not be applied: ${error.message}`
    );
  }
}

export async function processResendWebhookEvent({
  svixId,
  payload,
}: {
  svixId: string;
  payload: unknown;
}): Promise<ProcessResendWebhookResult> {
  if (!isRecord(payload)) {
    throw new Error(
      "Resend webhook payload must be a JSON object."
    );
  }

  const event =
    payload as ResendWebhookEvent;

  const eventType =
    readString(
      event.type
    );

  if (!eventType) {
    throw new Error(
      "Resend webhook event type is missing."
    );
  }

  const data =
    isRecord(event.data)
      ? event.data
      : {};

  const providerMessageId =
    readString(
      data.email_id
    );

  const eventAt =
    normalizeEventAt(
      event
    );

  const reserved =
    await reserveEvent({
      svixId,
      eventType,
      providerMessageId,
      eventCreatedAt:
        eventAt,
      payload,
    });

  if (
    reserved.finalDuplicate
  ) {
    return {
      ok: true,
      duplicate: true,
      ignored: false,
      matched: false,
      deliveryId: null,
      providerMessageId,
      providerStatus: null,
    };
  }

  try {
    if (
      !SUPPORTED_EVENTS.has(
        eventType as SupportedResendEventType
      )
    ) {
      await markEvent({
        eventId:
          reserved.id,
        status:
          "ignored",
      });

      return {
        ok: true,
        duplicate: false,
        ignored: true,
        matched: false,
        deliveryId: null,
        providerMessageId,
        providerStatus: null,
      };
    }

    if (
      !providerMessageId
    ) {
      await markEvent({
        eventId:
          reserved.id,
        status:
          "unmatched",
        errorMessage:
          "Webhook event does not contain data.email_id.",
      });

      return {
        ok: true,
        duplicate: false,
        ignored: false,
        matched: false,
        deliveryId: null,
        providerMessageId: null,
        providerStatus:
          mapProviderStatus(
            eventType as SupportedResendEventType
          ),
      };
    }

    const deliveryId =
      await findDelivery(
        providerMessageId
      );

    if (!deliveryId) {
      await markEvent({
        eventId:
          reserved.id,
        status:
          "unmatched",
        errorMessage:
          "No notification_deliveries row matches this Resend email id.",
      });

      return {
        ok: true,
        duplicate: false,
        ignored: false,
        matched: false,
        deliveryId: null,
        providerMessageId,
        providerStatus:
          mapProviderStatus(
            eventType as SupportedResendEventType
          ),
      };
    }

    const supportedType =
      eventType as SupportedResendEventType;

    const providerStatus =
      mapProviderStatus(
        supportedType
      );

    await applyDeliveryEvent({
      deliveryId,
      eventType:
        supportedType,
      svixId,
      eventAt,
      providerStatus,
      providerError:
        createProviderError(
          supportedType,
          data
        ),
    });

    await markEvent({
      eventId:
        reserved.id,
      status:
        "processed",
      deliveryId,
    });

    return {
      ok: true,
      duplicate: false,
      ignored: false,
      matched: true,
      deliveryId,
      providerMessageId,
      providerStatus,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown Resend webhook processing error.";

    try {
      await markEvent({
        eventId:
          reserved.id,
        status:
          "failed",
        errorMessage:
          message,
      });
    } catch (
      markError
    ) {
      console.error(
        "Unable to mark Resend webhook event as failed:",
        markError
      );
    }

    throw error;
  }
}
