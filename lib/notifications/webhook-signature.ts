import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

export class ResendWebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name =
      "ResendWebhookVerificationError";
  }
}

type VerifyResendWebhookInput = {
  payload: string;
  svixId: string | null;
  svixTimestamp: string | null;
  svixSignature: string | null;
  secret: string;
  toleranceSeconds?: number;
};

function decodeWebhookSecret(
  secret: string
): Buffer {
  const normalized =
    secret.trim();

  const encoded =
    normalized.startsWith(
      "whsec_"
    )
      ? normalized.slice(
          "whsec_".length
        )
      : normalized;

  if (!encoded) {
    throw new ResendWebhookVerificationError(
      "Resend webhook signing secret is empty."
    );
  }

  const key =
    Buffer.from(
      encoded,
      "base64"
    );

  if (key.length === 0) {
    throw new ResendWebhookVerificationError(
      "Resend webhook signing secret is invalid."
    );
  }

  return key;
}

function signaturesMatch(
  expectedBase64: string,
  candidateBase64: string
): boolean {
  try {
    const expected =
      Buffer.from(
        expectedBase64,
        "base64"
      );

    const candidate =
      Buffer.from(
        candidateBase64,
        "base64"
      );

    if (
      expected.length === 0 ||
      candidate.length === 0 ||
      expected.length !==
        candidate.length
    ) {
      return false;
    }

    return timingSafeEqual(
      expected,
      candidate
    );
  } catch {
    return false;
  }
}

export function verifyResendWebhookSignature({
  payload,
  svixId,
  svixTimestamp,
  svixSignature,
  secret,
  toleranceSeconds = 5 * 60,
}: VerifyResendWebhookInput): void {
  if (
    !svixId ||
    !svixTimestamp ||
    !svixSignature
  ) {
    throw new ResendWebhookVerificationError(
      "Required Svix signature headers are missing."
    );
  }

  const timestamp =
    Number.parseInt(
      svixTimestamp,
      10
    );

  if (
    !Number.isFinite(timestamp)
  ) {
    throw new ResendWebhookVerificationError(
      "Svix timestamp is invalid."
    );
  }

  const nowSeconds =
    Math.floor(
      Date.now() / 1000
    );

  if (
    Math.abs(
      nowSeconds - timestamp
    ) > toleranceSeconds
  ) {
    throw new ResendWebhookVerificationError(
      "Svix timestamp is outside the accepted tolerance."
    );
  }

  const signedContent =
    `${svixId}.${svixTimestamp}.${payload}`;

  const expected =
    createHmac(
      "sha256",
      decodeWebhookSecret(
        secret
      )
    )
      .update(
        signedContent,
        "utf8"
      )
      .digest(
        "base64"
      );

  const valid =
    svixSignature
      .trim()
      .split(/\s+/)
      .some(
        (item) => {
          const separatorIndex =
            item.indexOf(",");

          if (
            separatorIndex <= 0
          ) {
            return false;
          }

          const version =
            item.slice(
              0,
              separatorIndex
            );

          const signature =
            item.slice(
              separatorIndex + 1
            );

          return (
            version === "v1" &&
            signaturesMatch(
              expected,
              signature
            )
          );
        }
      );

  if (!valid) {
    throw new ResendWebhookVerificationError(
      "Resend webhook signature is invalid."
    );
  }
}
