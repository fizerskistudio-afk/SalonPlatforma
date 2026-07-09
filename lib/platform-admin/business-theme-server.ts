import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  getTemplateManifests,
  PLANNED_TEMPLATE_PACKS,
  resolveTemplateKey,
} from "@/lib/templates/registry";

import type {
  BusinessThemeData,
} from "./business-theme";

type BusinessThemeRow = {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
  template_key:
    string | null;
  updated_at: string;
};

export async function loadBusinessThemeData(
  businessSlug: string
): Promise<
  BusinessThemeData | null
> {
  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "businesses"
      )
      .select(
        `
          id,
          slug,
          name,
          is_active,
          template_key,
          updated_at
        `
      )
      .eq(
        "slug",
        businessSlug
      )
      .maybeSingle();

  if (error) {
    console.error(
      "Unable to load business theme data:",
      error
    );

    throw new Error(
      "Business theme data could not be loaded."
    );
  }

  if (!data) {
    return null;
  }

  const row =
    data as unknown as
      BusinessThemeRow;

  return {
    business: {
      id:
        row.id,
      slug:
        row.slug,
      name:
        row.name,
      isActive:
        row.is_active,
      templateKey:
        resolveTemplateKey(
          row.template_key
        ),
      updatedAt:
        row.updated_at,
    },

    templates:
      getTemplateManifests(),

    plannedTemplates:
      [
        ...PLANNED_TEMPLATE_PACKS,
      ],
  };
}
