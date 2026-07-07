import "server-only";

import {
  getNotificationEmailConfig,
} from "@/lib/notifications/config";
import type {
  EmailDeliveryScope,
  ResolvedEmailSender,
} from "@/lib/notifications/types";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

type BusinessRow = {
  id: string;
  name: string;
  email: string | null;
};

type BusinessEmailSettingsRow = {
  delivery_mode:
    | "platform"
    | "custom_domain";
  from_name: string | null;
  from_email: string | null;
  reply_to_email: string | null;
  custom_domain: string | null;
  domain_status:
    | "not_configured"
    | "pending"
    | "verified"
    | "failed";
};

function sanitizeDisplayName(
  value: string
): string {
  return value
    .replace(/[<>\r\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function formatMailbox(
  displayName: string,
  emailAddress: string
): string {
  const safeName =
    sanitizeDisplayName(
      displayName
    ) || "Salon";

  return `${safeName} <${emailAddress.trim()}>`;
}

function getEmailDomain(
  emailAddress: string
): string | null {
  const separatorIndex =
    emailAddress.lastIndexOf("@");

  if (
    separatorIndex <= 0 ||
    separatorIndex ===
      emailAddress.length - 1
  ) {
    return null;
  }

  return emailAddress
    .slice(separatorIndex + 1)
    .trim()
    .toLowerCase();
}

function customDomainMatches(
  emailAddress: string,
  customDomain: string | null
): boolean {
  if (!customDomain?.trim()) {
    return true;
  }

  const emailDomain =
    getEmailDomain(
      emailAddress
    );

  const normalizedDomain =
    customDomain
      .trim()
      .toLowerCase()
      .replace(/^\.+|\.+$/g, "");

  return (
    emailDomain ===
      normalizedDomain ||
    Boolean(
      emailDomain?.endsWith(
        `.${normalizedDomain}`
      )
    )
  );
}

async function loadBusinessSenderData(
  businessId: string
): Promise<{
  business: BusinessRow;
  settings:
    | BusinessEmailSettingsRow
    | null;
}> {
  const supabase =
    createAdminClient();

  const [
    businessResult,
    settingsResult,
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, name, email")
      .eq("id", businessId)
      .maybeSingle(),

    supabase
      .from(
        "business_email_settings"
      )
      .select(
        `
          delivery_mode,
          from_name,
          from_email,
          reply_to_email,
          custom_domain,
          domain_status
        `
      )
      .eq(
        "business_id",
        businessId
      )
      .maybeSingle(),
  ]);

  if (
    businessResult.error ||
    !businessResult.data
  ) {
    throw new Error(
      "Business email sender context could not be loaded."
    );
  }

  if (settingsResult.error) {
    throw new Error(
      `Business email settings could not be loaded: ${settingsResult.error.message}`
    );
  }

  return {
    business:
      businessResult.data as BusinessRow,

    settings:
      settingsResult.data
        ? settingsResult.data as BusinessEmailSettingsRow
        : null,
  };
}

export async function resolveEmailSender(
  scope: EmailDeliveryScope,
  businessId?: string | null
): Promise<ResolvedEmailSender> {
  const config =
    getNotificationEmailConfig();

  if (scope === "platform") {
    return {
      from:
        config.platformFrom,
      replyTo:
        config.platformReplyTo,
      mode:
        "platform_system",
    };
  }

  if (!businessId) {
    throw new Error(
      "Business email requires a business ID."
    );
  }

  const {
    business,
    settings,
  } =
    await loadBusinessSenderData(
      businessId
    );

  if (
    config.deploymentMode ===
      "standalone"
  ) {
    if (!config.standaloneFrom) {
      throw new Error(
        "Standalone sender is not configured."
      );
    }

    return {
      from:
        config.standaloneFrom,
      replyTo:
        config.standaloneReplyTo ??
        settings?.reply_to_email ??
        business.email,
      mode:
        "standalone",
    };
  }

  const customFromEmail =
    settings?.from_email?.trim() ??
    "";

  const canUseCustomDomain =
    settings?.delivery_mode ===
      "custom_domain" &&
    settings.domain_status ===
      "verified" &&
    customFromEmail.length > 0 &&
    customDomainMatches(
      customFromEmail,
      settings.custom_domain
    );

  if (canUseCustomDomain) {
    return {
      from: formatMailbox(
        settings?.from_name ??
          business.name,
        customFromEmail
      ),
      replyTo:
        settings?.reply_to_email ??
        business.email,
      mode:
        "business_custom_domain",
    };
  }

  return {
    from: formatMailbox(
      settings?.from_name ??
        business.name,
      config.platformBusinessEmailAddress
    ),
    replyTo:
      settings?.reply_to_email ??
      business.email ??
      config.platformReplyTo,
    mode:
      "platform_business",
  };
}
