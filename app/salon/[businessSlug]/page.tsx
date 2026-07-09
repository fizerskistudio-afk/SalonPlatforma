import type {
  Metadata,
} from "next";

import {
  cache,
} from "react";

import {
  notFound,
} from "next/navigation";

import SalonPlatform from "@/components/SalonPlatform";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  toAbsoluteSiteUrl,
} from "@/lib/seo/site";

import {
  buildTenantPublicUrl,
} from "@/lib/tenancy/hostname";

import {
  getBusinessTemplateRuntime,
} from "@/lib/templates/server";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const PRIVATE_NOT_FOUND_ROBOTS:
  Metadata["robots"] = {
    index: false,
    follow: false,
  };

type PublicSalonPageProps = {
  params: Promise<{
    businessSlug: string;
  }>;
};

type ActiveBusinessRow = {
  id: string;
  name: string;
  slug: string;
  default_locale: string;
};

function normalizeBusinessSlug(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
}

const getActiveBusiness = cache(
  async (
    businessSlug: string
  ): Promise<ActiveBusinessRow | null> => {
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
          name,
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
);

export async function generateMetadata({
  params,
}: PublicSalonPageProps): Promise<Metadata> {
  const {
    businessSlug:
      rawBusinessSlug,
  } =
    await params;

  const businessSlug =
    normalizeBusinessSlug(
      rawBusinessSlug
    );

  if (
    !BUSINESS_SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    return {
      title: {
        absolute:
          "Salon nije pronađen",
      },

      robots:
        PRIVATE_NOT_FOUND_ROBOTS,
    };
  }

  const business =
    await getActiveBusiness(
      businessSlug
    );

  if (!business) {
    return {
      title: {
        absolute:
          "Salon nije pronađen",
      },

      robots:
        PRIVATE_NOT_FOUND_ROBOTS,
    };
  }

  const title =
    `${business.name} | Online zakazivanje`;

  const description =
    `Pogledaj usluge, zaposlene i slobodne termine za ${business.name}. Zakaži termin online.`;

  const canonicalUrl =
    toAbsoluteSiteUrl(
      buildTenantPublicUrl(
        business.slug
      )
    );

  return {
    title: {
      absolute:
        title,
    },

    description,

    alternates: {
      canonical:
        canonicalUrl,
    },

    openGraph: {
      type:
        "website",

      title,
      description,

      url:
        canonicalUrl,

      siteName:
        business.name,

      locale:
        "sr_RS",
    },

    twitter: {
      card:
        "summary",

      title,
      description,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
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
    normalizeBusinessSlug(
      rawBusinessSlug
    );

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
