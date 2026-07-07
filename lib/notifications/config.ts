import "server-only";

import type {
  EmailDeploymentMode,
} from "@/lib/notifications/types";

export type NotificationEmailConfig = {
  enabled: boolean;
  testMode: boolean;
  testRecipient: string | null;

  deploymentMode:
    EmailDeploymentMode;

  resendApiKey: string | null;
  resendApiBaseUrl: string;

  platformFrom: string;
  platformReplyTo: string | null;

  platformBusinessEmailAddress:
    string;

  standaloneFrom: string | null;
  standaloneReplyTo: string | null;
};

function readOptional(
  name: string
): string | null {
  const value =
    process.env[name]?.trim();

  return value
    ? value
    : null;
}

function readBoolean(
  name: string,
  fallback: boolean
): boolean {
  const value =
    readOptional(name);

  if (!value) {
    return fallback;
  }

  return [
    "1",
    "true",
    "yes",
    "on",
  ].includes(
    value.toLowerCase()
  );
}

function readDeploymentMode(): EmailDeploymentMode {
  const value =
    readOptional(
      "EMAIL_DEPLOYMENT_MODE"
    )?.toLowerCase();

  return value === "standalone"
    ? "standalone"
    : "platform";
}

export function getNotificationEmailConfig(): NotificationEmailConfig {
  const enabled =
    readBoolean(
      "EMAIL_DELIVERY_ENABLED",
      false
    );

  const testMode =
    readBoolean(
      "EMAIL_TEST_MODE",
      false
    );

  const config: NotificationEmailConfig = {
    enabled,
    testMode,

    testRecipient:
      readOptional(
        "EMAIL_TEST_RECIPIENT"
      ),

    deploymentMode:
      readDeploymentMode(),

    resendApiKey:
      readOptional(
        "RESEND_API_KEY"
      ),

    resendApiBaseUrl:
      readOptional(
        "RESEND_API_BASE_URL"
      ) ??
      "https://api.resend.com",

    platformFrom:
      readOptional(
        "PLATFORM_EMAIL_FROM"
      ) ??
      "Salon Platforma <onboarding@resend.dev>",

    platformReplyTo:
      readOptional(
        "PLATFORM_EMAIL_REPLY_TO"
      ),

    platformBusinessEmailAddress:
      readOptional(
        "PLATFORM_BUSINESS_EMAIL_ADDRESS"
      ) ??
      "onboarding@resend.dev",

    standaloneFrom:
      readOptional(
        "STANDALONE_EMAIL_FROM"
      ),

    standaloneReplyTo:
      readOptional(
        "STANDALONE_EMAIL_REPLY_TO"
      ),
  };

  if (
    config.enabled &&
    !config.resendApiKey
  ) {
    throw new Error(
      "EMAIL_DELIVERY_ENABLED is true, but RESEND_API_KEY is missing."
    );
  }

  if (
    config.enabled &&
    config.testMode &&
    !config.testRecipient
  ) {
    throw new Error(
      "EMAIL_TEST_MODE is true, but EMAIL_TEST_RECIPIENT is missing."
    );
  }

  if (
    config.enabled &&
    config.deploymentMode ===
      "standalone" &&
    !config.standaloneFrom
  ) {
    throw new Error(
      "EMAIL_DEPLOYMENT_MODE is standalone, but STANDALONE_EMAIL_FROM is missing."
    );
  }

  return config;
}
