import "server-only";

import {
  UI_LOCALE_CODES,
  type UiLocaleCode,
} from "@/lib/i18n/locales";
import {
  logServerError,
} from "@/lib/monitoring/server";
import {
  type PublicReviewPageContext,
} from "@/lib/reviews/public-page-types";
import {
  hashReviewInvitationToken,
  normalizeReviewInvitationToken,
} from "@/lib/reviews/token";
import {
  t,
} from "@/lib/translations";
import type {
  LocalizedText,
} from "@/lib/types";
import {
  createAdminClient,
} from "@/lib/supabase/admin";
import {
  buildTenantPublicUrl,
} from "@/lib/tenancy/hostname";

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  default_locale: string;
  timezone: string;
};

type ReviewSettingsRow = {
  reviews_enabled: boolean;
  direct_reviews_enabled: boolean;
  moderation_required: boolean;
};

type JsonRecord = Record<
  string,
  unknown
>;

function isRecord(
  value: unknown
): value is JsonRecord {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function resolveUiLocale(
  value: string
): UiLocaleCode {
  return (
    UI_LOCALE_CODES as readonly string[]
  ).includes(value)
    ? value as UiLocaleCode
    : "sr-Latn";
}

function getLocalizedName(
  value: unknown,
  locale: UiLocaleCode
): string {
  if (
    typeof value ===
      "string"
  ) {
    return value.trim();
  }

  if (
    !isRecord(
      value
    )
  ) {
    return "";
  }

  return t(
    value as LocalizedText,
    locale,
    "sr-Latn"
  );
}

function errorMessage(
  error: {
    message?: string | null;
    details?: string | null;
    hint?: string | null;
  }
): string {
  return [
    error.message,
    error.details,
    error.hint,
  ]
    .filter(
      (
        value
      ): value is string =>
        typeof value ===
          "string"
    )
    .join(" ")
    .toUpperCase();
}

export async function loadDirectReviewPageContext(
  rawBusinessSlug: string
): Promise<
  PublicReviewPageContext | null
> {
  const businessSlug =
    rawBusinessSlug
      .trim()
      .toLowerCase();

  if (
    !BUSINESS_SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    return null;
  }

  const supabase =
    createAdminClient();

  const {
    data: businessData,
    error: businessError,
  } =
    await supabase
      .from(
        "businesses"
      )
      .select(
        "id, slug, name, default_locale, timezone"
      )
      .eq(
        "slug",
        businessSlug
      )
      .eq(
        "is_active",
        true
      )
      .eq(
        "publication_status",
        "published"
      )
      .maybeSingle();

  if (businessError) {
    logServerError(
      "review.public_page.direct_business.failed",
      businessError,
      {
        businessSlug,
      }
    );

    throw new Error(
      "Direct review business could not be loaded."
    );
  }

  if (!businessData) {
    return null;
  }

  const business =
    businessData as unknown as
      BusinessRow;

  const {
    data: settingsData,
    error: settingsError,
  } =
    await supabase
      .from(
        "review_settings"
      )
      .select(
        "reviews_enabled, direct_reviews_enabled, moderation_required"
      )
      .eq(
        "business_id",
        business.id
      )
      .maybeSingle();

  if (settingsError) {
    logServerError(
      "review.public_page.direct_settings.failed",
      settingsError,
      {
        businessId:
          business.id,
        businessSlug:
          business.slug,
      }
    );

    throw new Error(
      "Direct review settings could not be loaded."
    );
  }

  if (!settingsData) {
    return null;
  }

  const settings =
    settingsData as unknown as
      ReviewSettingsRow;

  if (
    !settings.reviews_enabled ||
    !settings.direct_reviews_enabled
  ) {
    return null;
  }

  return {
    businessSlug:
      business.slug,
    businessName:
      business.name,
    defaultLocale:
      resolveUiLocale(
        business.default_locale
      ),
    salonUrl:
      buildTenantPublicUrl(
        business.slug
      ),
    moderationRequired:
      settings.moderation_required,
    timezone:
      business.timezone,
    serviceName:
      null,
    employeeName:
      null,
    bookingStartsAt:
      null,
    expiresAt:
      null,
  };
}

export async function loadVerifiedReviewPageContext(
  rawToken: string
): Promise<
  PublicReviewPageContext | null
> {
  const token =
    normalizeReviewInvitationToken(
      rawToken
    );

  if (!token) {
    return null;
  }

  const tokenHash =
    hashReviewInvitationToken(
      token
    );

  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_review_invitation_context",
      {
        p_token_hash:
          tokenHash,
      }
    );

  if (error) {
    if (
      errorMessage(
        error
      ).includes(
        "REVIEW_LINK_INVALID"
      )
    ) {
      return null;
    }

    logServerError(
      "review.public_page.verified_context.failed",
      error,
      {
        operation:
          "get_review_invitation_context",
      }
    );

    throw new Error(
      "Verified review context could not be loaded."
    );
  }

  if (
    !isRecord(
      data
    ) ||
    typeof data.businessSlug !==
      "string" ||
    typeof data.businessName !==
      "string" ||
    typeof data.defaultLocale !==
      "string" ||
    typeof data.bookingStartsAt !==
      "string" ||
    typeof data.employeeName !==
      "string" ||
    typeof data.expiresAt !==
      "string"
  ) {
    return null;
  }

  const locale =
    resolveUiLocale(
      data.defaultLocale
    );

  const {
    data: businessData,
    error: businessError,
  } =
    await supabase
      .from(
        "businesses"
      )
      .select(
        "timezone"
      )
      .eq(
        "slug",
        data.businessSlug
      )
      .eq(
        "is_active",
        true
      )
      .eq(
        "publication_status",
        "published"
      )
      .maybeSingle();

  if (businessError) {
    logServerError(
      "review.public_page.verified_business.failed",
      businessError,
      {
        businessSlug:
          data.businessSlug,
      }
    );

    throw new Error(
      "Verified review business could not be loaded."
    );
  }

  if (
    !businessData ||
    typeof businessData.timezone !==
      "string"
  ) {
    return null;
  }

  return {
    businessSlug:
      data.businessSlug,
    businessName:
      data.businessName,
    defaultLocale:
      locale,
    salonUrl:
      buildTenantPublicUrl(
        data.businessSlug
      ),
    moderationRequired:
      true,
    timezone:
      businessData.timezone,
    serviceName:
      getLocalizedName(
        data.serviceName,
        locale
      ) ||
      null,
    employeeName:
      data.employeeName,
    bookingStartsAt:
      data.bookingStartsAt,
    expiresAt:
      data.expiresAt,
  };
}
