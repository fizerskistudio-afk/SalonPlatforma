import {
  notFound,
} from "next/navigation";

import SalonPlatform from "@/components/SalonPlatform";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  getBusinessTemplateRuntime,
} from "@/lib/templates/server";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type PublicSalonPageProps = {
  params: Promise<{
    businessSlug: string;
  }>;
};

type ActiveBusinessRow = {
  id: string;
  slug: string;
  default_locale: string;
};

async function getActiveBusiness(
  businessSlug: string
): Promise<ActiveBusinessRow | null> {
  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "businesses"
    )
    .select(
      `
        id,
        slug,
        default_locale
      `
    )
    .eq(
      "slug",
      businessSlug
    )
    .eq(
      "is_active",
      true
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Failed to resolve public salon route:",
      error
    );

    throw new Error(
      "Public salon could not be loaded."
    );
  }

  if (!data) {
    return null;
  }

  return data as
    unknown as
    ActiveBusinessRow;
}

export default async function PublicSalonPage({
  params,
}: PublicSalonPageProps) {
  const {
    businessSlug:
      rawBusinessSlug,
  } =
    await params;

  const businessSlug =
    rawBusinessSlug
      .trim()
      .toLowerCase();

  if (
    !BUSINESS_SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    notFound();
  }

  const business =
    await getActiveBusiness(
      businessSlug
    );

  if (!business) {
    notFound();
  }

  const template =
    await getBusinessTemplateRuntime(
      business.slug
    );

  return (
    <SalonPlatform
      businessSlug={
        business.slug
      }
      initialLocale={
        business.default_locale
      }
      templateKey={
        template.key
      }
      templateConfig={
        template.config
      }
    />
  );
}