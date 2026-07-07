import "server-only";

import {
  createHash,
} from "node:crypto";

import {
  getNotificationEmailConfig,
} from "@/lib/notifications/config";
import {
  sendResendEmail,
} from "@/lib/notifications/resend";
import {
  resolveEmailSender,
} from "@/lib/notifications/sender";
import type {
  EmailDeliveryStatus,
  SendNotificationEmailInput,
  SendNotificationEmailResult,
} from "@/lib/notifications/types";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

type DeliveryRow = {
  id: string;
  status: EmailDeliveryStatus;
  attempt_count: number;
};

function getErrorMessage(
  error: unknown
): string {
  return error instanceof Error
    ? error.message
    : "Unknown email delivery error.";
}

function normalizeEmail(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
}

function createProviderIdempotencyKey(
  dedupeKey: string
): string {
  return `salon-${createHash("sha256")
    .update(dedupeKey, "utf8")
    .digest("hex")}`;
}

function createTestSubject(
  originalRecipient: string,
  subject: string
): string {
  return `[TEST → ${originalRecipient}] ${subject}`;
}

function createTestHtml(
  originalRecipient: string,
  templateKey: string,
  html: string
): string {
  return `
    <div style="margin:0 0 20px;padding:14px 16px;border:1px solid #f59e0b;border-radius:12px;background:#fffbeb;color:#92400e;font-family:Arial,sans-serif;font-size:13px;line-height:1.5;">
      <strong>TEST REŽIM</strong><br />
      Originalni primalac: ${escapeHtml(originalRecipient)}<br />
      Template: ${escapeHtml(templateKey)}
    </div>
    ${html}
  `;
}

function createTestText(
  originalRecipient: string,
  templateKey: string,
  text: string
): string {
  return [
    "TEST REŽIM",
    `Originalni primalac: ${originalRecipient}`,
    `Template: ${templateKey}`,
    "",
    text,
  ].join("\n");
}

function escapeHtml(
  value: string
): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeTagValue(
  value: string
): string {
  return value
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 256) || "unknown";
}

async function loadExistingDelivery(
  dedupeKey: string
): Promise<DeliveryRow | null> {
  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "notification_deliveries"
    )
    .select(
      "id, status, attempt_count"
    )
    .eq(
      "dedupe_key",
      dedupeKey
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Notification delivery lookup failed: ${error.message}`
    );
  }

  return data
    ? data as DeliveryRow
    : null;
}

async function prepareDeliveryRow({
  input,
  actualRecipient,
  sender,
  subject,
  testMode,
}: {
  input:
    SendNotificationEmailInput;
  actualRecipient: string;
  sender: {
    from: string;
    replyTo: string | null;
    mode: string;
  };
  subject: string;
  testMode: boolean;
}): Promise<{
  deliveryId: string;
  attemptCount: number;
  alreadySent: boolean;
}> {
  const supabase =
    createAdminClient();

  const existing =
    await loadExistingDelivery(
      input.dedupeKey
    );

  if (
    existing?.status === "sent"
  ) {
    return {
      deliveryId: existing.id,
      attemptCount:
        existing.attempt_count,
      alreadySent: true,
    };
  }

  const now =
    new Date().toISOString();

  if (existing) {
    const attemptCount =
      existing.attempt_count + 1;

    const {
      error,
    } = await supabase
      .from(
        "notification_deliveries"
      )
      .update({
        scope: input.scope,
        audience: input.audience,
        template_key:
          input.templateKey,
        business_id:
          input.businessId ?? null,
        booking_id:
          input.bookingId ?? null,
        original_recipient:
          normalizeEmail(
            input.recipient
          ),
        actual_recipient:
          normalizeEmail(
            actualRecipient
          ),
        sender: sender.from,
        reply_to:
          sender.replyTo,
        subject,
        status: "pending",
        attempt_count:
          attemptCount,
        test_mode: testMode,
        error: null,
        metadata: {
          ...(input.metadata ?? {}),
          senderMode:
            sender.mode,
        },
        last_attempt_at: now,
      })
      .eq("id", existing.id);

    if (error) {
      throw new Error(
        `Notification delivery row could not be updated: ${error.message}`
      );
    }

    return {
      deliveryId:
        existing.id,
      attemptCount,
      alreadySent: false,
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "notification_deliveries"
    )
    .insert({
      business_id:
        input.businessId ?? null,
      booking_id:
        input.bookingId ?? null,
      scope: input.scope,
      audience: input.audience,
      template_key:
        input.templateKey,
      dedupe_key:
        input.dedupeKey,
      original_recipient:
        normalizeEmail(
          input.recipient
        ),
      actual_recipient:
        normalizeEmail(
          actualRecipient
        ),
      sender: sender.from,
      reply_to:
        sender.replyTo,
      subject,
      provider: "resend",
      status: "pending",
      attempt_count: 1,
      test_mode: testMode,
      metadata: {
        ...(input.metadata ?? {}),
        senderMode:
          sender.mode,
      },
      last_attempt_at: now,
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      const racedDelivery =
        await loadExistingDelivery(
          input.dedupeKey
        );

      if (racedDelivery) {
        return {
          deliveryId:
            racedDelivery.id,
          attemptCount:
            racedDelivery.attempt_count,
          alreadySent:
            racedDelivery.status ===
              "sent",
        };
      }
    }

    throw new Error(
      `Notification delivery row could not be created: ${error?.message ?? "unknown database error"}`
    );
  }

  return {
    deliveryId: data.id,
    attemptCount: 1,
    alreadySent: false,
  };
}

async function updateDeliveryStatus({
  deliveryId,
  status,
  providerMessageId,
  errorMessage,
}: {
  deliveryId: string;
  status: EmailDeliveryStatus;
  providerMessageId?: string | null;
  errorMessage?: string | null;
}): Promise<void> {
  const supabase =
    createAdminClient();

  const now =
    new Date().toISOString();

  const {
    error,
  } = await supabase
    .from(
      "notification_deliveries"
    )
    .update({
      status,
      provider_message_id:
        providerMessageId ?? null,
      error:
        errorMessage ?? null,
      sent_at:
        status === "sent"
          ? now
          : null,
    })
    .eq("id", deliveryId);

  if (error) {
    console.error(
      "Unable to update notification delivery status:",
      {
        deliveryId,
        status,
        error,
      }
    );
  }
}

export async function sendNotificationEmail(
  input: SendNotificationEmailInput
): Promise<SendNotificationEmailResult> {
  const originalRecipient =
    normalizeEmail(
      input.recipient
    );

  if (!originalRecipient) {
    return {
      ok: true,
      status: "skipped",
      message:
        "Email recipient is empty.",
    };
  }

  let deliveryId:
    | string
    | undefined;

  try {
    const config =
      getNotificationEmailConfig();

    const sender =
      await resolveEmailSender(
        input.scope,
        input.businessId
      );

    const actualRecipient =
      config.testMode
        ? config.testRecipient ??
          originalRecipient
        : originalRecipient;

    const subject =
      config.testMode
        ? createTestSubject(
            originalRecipient,
            input.subject
          )
        : input.subject;

    const html =
      config.testMode
        ? createTestHtml(
            originalRecipient,
            input.templateKey,
            input.html
          )
        : input.html;

    const text =
      config.testMode
        ? createTestText(
            originalRecipient,
            input.templateKey,
            input.text
          )
        : input.text;

    const prepared =
      await prepareDeliveryRow({
        input,
        actualRecipient,
        sender,
        subject,
        testMode:
          config.testMode,
      });

    deliveryId =
      prepared.deliveryId;

    if (prepared.alreadySent) {
      return {
        ok: true,
        status: "sent",
        message:
          "Notification was already sent.",
        deliveryId,
        skippedBecauseAlreadySent:
          true,
      };
    }

    if (!config.enabled) {
      await updateDeliveryStatus({
        deliveryId,
        status: "skipped",
        errorMessage:
          "EMAIL_DELIVERY_ENABLED is false.",
      });

      return {
        ok: true,
        status: "skipped",
        message:
          "Email delivery is disabled.",
        deliveryId,
      };
    }

    const providerResult =
      await sendResendEmail({
        from: sender.from,
        to: actualRecipient,
        subject,
        html,
        text,
        replyTo:
          sender.replyTo,
        idempotencyKey:
          createProviderIdempotencyKey(
            input.dedupeKey
          ),
        tags: [
          {
            name: "scope",
            value:
              sanitizeTagValue(
                input.scope
              ),
          },
          {
            name: "template",
            value:
              sanitizeTagValue(
                input.templateKey
              ),
          },
          ...(input.businessId
            ? [
                {
                  name: "business",
                  value:
                    sanitizeTagValue(
                      input.businessId
                    ),
                },
              ]
            : []),
        ],
      });

    await updateDeliveryStatus({
      deliveryId,
      status: "sent",
      providerMessageId:
        providerResult.id,
    });

    return {
      ok: true,
      status: "sent",
      message:
        config.testMode
          ? "Test email was sent."
          : "Email was sent.",
      deliveryId,
      providerMessageId:
        providerResult.id,
    };
  } catch (error) {
    const errorMessage =
      getErrorMessage(error);

    if (deliveryId) {
      await updateDeliveryStatus({
        deliveryId,
        status: "failed",
        errorMessage,
      });
    }

    console.error(
      "Notification email delivery failed:",
      {
        templateKey:
          input.templateKey,
        businessId:
          input.businessId ?? null,
        bookingId:
          input.bookingId ?? null,
        recipient:
          originalRecipient,
        error:
          errorMessage,
      }
    );

    return {
      ok: false,
      status: "failed",
      message: errorMessage,
      deliveryId,
    };
  }
}
