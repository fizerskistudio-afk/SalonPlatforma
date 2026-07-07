import "server-only";

import {
  getNotificationEmailConfig,
} from "@/lib/notifications/config";

type SendResendEmailInput = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
  idempotencyKey: string;
  tags?: Array<{
    name: string;
    value: string;
  }>;
};

type ResendSuccessPayload = {
  id?: unknown;
};

type ResendErrorPayload = {
  message?: unknown;
  name?: unknown;
  statusCode?: unknown;
};

export type SendResendEmailResult = {
  id: string;
};

function getErrorMessage(
  payload: unknown,
  fallback: string
): string {
  if (
    typeof payload === "object" &&
    payload !== null
  ) {
    const errorPayload =
      payload as ResendErrorPayload;

    if (
      typeof errorPayload.message ===
        "string" &&
      errorPayload.message.trim()
    ) {
      return errorPayload.message.trim();
    }
  }

  return fallback;
}

export async function sendResendEmail({
  from,
  to,
  subject,
  html,
  text,
  replyTo,
  idempotencyKey,
  tags,
}: SendResendEmailInput): Promise<SendResendEmailResult> {
  const config =
    getNotificationEmailConfig();

  if (!config.resendApiKey) {
    throw new Error(
      "RESEND_API_KEY is missing."
    );
  }

  const payload: Record<
    string,
    unknown
  > = {
    from,
    to: [to],
    subject,
    html,
    text,
  };

  if (replyTo?.trim()) {
    payload.reply_to =
      replyTo.trim();
  }

  if (
    tags &&
    tags.length > 0
  ) {
    payload.tags = tags;
  }

  const response = await fetch(
    `${config.resendApiBaseUrl.replace(/\/$/, "")}/emails`,
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${config.resendApiKey}`,
        "Content-Type":
          "application/json",
        "Idempotency-Key":
          idempotencyKey,
      },
      body: JSON.stringify(
        payload
      ),
      cache: "no-store",
    }
  );

  let responsePayload: unknown =
    null;

  try {
    responsePayload =
      await response.json();
  } catch {
    responsePayload = null;
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        responsePayload,
        `Resend request failed with HTTP ${response.status}.`
      )
    );
  }

  const successPayload =
    responsePayload as ResendSuccessPayload;

  if (
    typeof successPayload?.id !==
      "string" ||
    !successPayload.id.trim()
  ) {
    throw new Error(
      "Resend did not return an email ID."
    );
  }

  return {
    id: successPayload.id,
  };
}
