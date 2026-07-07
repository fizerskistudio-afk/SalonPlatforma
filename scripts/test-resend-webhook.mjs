import {
  createHmac,
  randomBytes,
  randomUUID,
} from "node:crypto";
import {
  existsSync,
  readFileSync,
} from "node:fs";
import {
  resolve,
} from "node:path";

function loadDotEnvFile(
  filename
) {
  const path =
    resolve(
      process.cwd(),
      filename
    );

  if (!existsSync(path)) {
    return;
  }

  const content =
    readFileSync(
      path,
      "utf8"
    );

  for (
    const rawLine of
    content.split(/\r?\n/)
  ) {
    const line =
      rawLine.trim();

    if (
      !line ||
      line.startsWith("#")
    ) {
      continue;
    }

    const separator =
      line.indexOf("=");

    if (separator <= 0) {
      continue;
    }

    const key =
      line.slice(
        0,
        separator
      ).trim();

    let value =
      line.slice(
        separator + 1
      ).trim();

    if (
      (value.startsWith('"') &&
        value.endsWith('"')) ||
      (value.startsWith("'") &&
        value.endsWith("'"))
    ) {
      value =
        value.slice(1, -1);
    }

    if (
      key &&
      process.env[key] ===
        undefined
    ) {
      process.env[key] =
        value;
    }
  }
}

function usage() {
  console.log(`
Usage:
  node scripts/test-resend-webhook.mjs <status> <provider_message_id> [endpoint]

Statuses:
  sent
  delivered
  delayed
  bounced
  complained
  failed
  suppressed

Example:
  node scripts/test-resend-webhook.mjs delivered 12345678-1234-1234-1234-123456789abc
`);
}

const EVENT_TYPES = {
  sent:
    "email.sent",
  delivered:
    "email.delivered",
  delayed:
    "email.delivery_delayed",
  bounced:
    "email.bounced",
  complained:
    "email.complained",
  failed:
    "email.failed",
  suppressed:
    "email.suppressed",
};

loadDotEnvFile(
  ".env.local"
);

const [
  status,
  providerMessageId,
  endpointArgument,
] = process.argv.slice(2);

if (
  !status ||
  !(status in EVENT_TYPES) ||
  !providerMessageId
) {
  usage();
  process.exitCode =
    1;
} else {
  const secret =
    process.env
      .RESEND_WEBHOOK_SECRET
      ?.trim();

  if (!secret) {
    throw new Error(
      "RESEND_WEBHOOK_SECRET is missing from process.env or .env.local."
    );
  }

  const endpoint =
    endpointArgument ??
    process.env
      .RESEND_WEBHOOK_TEST_URL ??
    "http://localhost:3000/api/webhooks/resend";

  const createdAt =
    new Date()
      .toISOString();

  const data = {
    email_id:
      providerMessageId,
    created_at:
      createdAt,
    from:
      "Salon Platforma <onboarding@resend.dev>",
    to: [
      "test@example.com",
    ],
    subject:
      "NOTIFICATIONS-04 webhook test",
  };

  if (
    status ===
      "bounced"
  ) {
    data.bounce = {
      message:
        "Simulated permanent bounce for local webhook testing.",
      type:
        "Permanent",
      subType:
        "General",
    };
  }

  if (
    status ===
      "delayed"
  ) {
    data.message =
      "Simulated temporary delivery delay.";
  }

  if (
    status ===
      "failed"
  ) {
    data.error =
      "Simulated Resend provider failure.";
  }

  if (
    status ===
      "suppressed"
  ) {
    data.suppression = {
      reason:
        "Simulated suppression list match.",
    };
  }

  const payload =
    JSON.stringify({
      type:
        EVENT_TYPES[status],
      created_at:
        createdAt,
      data,
    });

  const svixId =
    `msg_test_${randomUUID()}`;

  const svixTimestamp =
    Math.floor(
      Date.now() / 1000
    ).toString();

  const encodedSecret =
    secret.startsWith(
      "whsec_"
    )
      ? secret.slice(
          "whsec_".length
        )
      : secret;

  const key =
    Buffer.from(
      encodedSecret,
      "base64"
    );

  if (
    key.length === 0
  ) {
    throw new Error(
      "RESEND_WEBHOOK_SECRET is not valid base64."
    );
  }

  const signature =
    createHmac(
      "sha256",
      key
    )
      .update(
        `${svixId}.${svixTimestamp}.${payload}`,
        "utf8"
      )
      .digest(
        "base64"
      );

  console.log(
    `Sending ${EVENT_TYPES[status]} to ${endpoint}`
  );

  const response =
    await fetch(
      endpoint,
      {
        method:
          "POST",
        headers: {
          "content-type":
            "application/json",
          "svix-id":
            svixId,
          "svix-timestamp":
            svixTimestamp,
          "svix-signature":
            `v1,${signature}`,
        },
        body:
          payload,
      }
    );

  const responseText =
    await response.text();

  console.log(
    `HTTP ${response.status}`
  );

  console.log(
    responseText
  );

  if (!response.ok) {
    process.exitCode =
      1;
  }
}
