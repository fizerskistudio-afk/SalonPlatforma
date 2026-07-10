import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import {
  getTemplateManifest,
  normalizeTemplateConfig,
  resolveTemplateKey,
  type TemplateConfig,
  type TemplateKey,
  type TemplateManifest,
} from "./registry";

export type BusinessTemplateRuntime = {
  key: TemplateKey;
  config: TemplateConfig;
  manifest: TemplateManifest;
  usedFallback: boolean;
};

type BusinessTemplateRow = {
  template_key: string | null;
  template_config: unknown;
};

type BusinessTemplateRuntimeOptions = {
  includeInactive?: boolean;
};

function createFallbackRuntime(): BusinessTemplateRuntime {
  const key =
    resolveTemplateKey(null);

  return {
    key,
    config:
      normalizeTemplateConfig(
        null
      ),
    manifest:
      getTemplateManifest(
        key
      ),
    usedFallback: true,
  };
}

/**
 * Server-side izbor template-a.
 *
 * Greška baze ili nepoznat template_key ne ruše javni
 * sajt. U tim slučajevima koristi se stabilni default.
 */
export async function getBusinessTemplateRuntime(
  businessSlug: string,
  options:
    BusinessTemplateRuntimeOptions = {}
): Promise<BusinessTemplateRuntime> {
  const normalizedSlug =
    businessSlug.trim();

  if (!normalizedSlug) {
    return createFallbackRuntime();
  }

  try {
    const supabase =
      createAdminClient();

    const businessQuery =
      supabase
        .from(
          "businesses"
        )
        .select(
          `
            template_key,
            template_config
          `
        )
        .eq(
          "slug",
          normalizedSlug
        );

    if (
      !options.includeInactive
    ) {
      businessQuery.eq(
        "is_active",
        true
      );
    }

    const {
      data,
      error,
    } =
      await businessQuery
        .maybeSingle();

    if (
      error ||
      !data
    ) {
      console.warn(
        "Template runtime fallback:",
        error?.message ??
          "Business was not found."
      );

      return createFallbackRuntime();
    }

    const row =
      data as unknown as BusinessTemplateRow;

    const key =
      resolveTemplateKey(
        row.template_key
      );

    return {
      key,

      config:
        normalizeTemplateConfig(
          row.template_config
        ),

      manifest:
        getTemplateManifest(
          key
        ),

      usedFallback:
        row.template_key !==
        key,
    };
  } catch (error) {
    console.error(
      "Unexpected template runtime error:",
      error
    );

    return createFallbackRuntime();
  }
}
