import type {
  Metadata,
} from "next";
import {
  notFound,
} from "next/navigation";

import SalonPlatform from "@/components/SalonPlatform";
import {
  loadPublicCatalog,
} from "@/lib/catalog/server";
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

function normalizeBusinessSlug(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
}

function createNotFoundMetadata():
  Metadata {
  return {
    title: {
      absolute:
        "Salon nije pronađen",
    },
    robots:
      PRIVATE_NOT_FOUND_ROBOTS,
  };
}

export async function generateMetadata({
  params,
}: PublicSalonPageProps):
  Promise<Metadata> {
  const {
    businessSlug:
      rawBusinessSlug,
  } = await params;

  const businessSlug =
    normalizeBusinessSlug(
      rawBusinessSlug
    );

  if (
    !BUSINESS_SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    return createNotFoundMetadata();
  }

  const result =
    await loadPublicCatalog(
      businessSlug
    );

  if (!result) {
    return createNotFoundMetadata();
  }

  const business =
    result.catalog.business;

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
  } = await params;

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

  const result =
    await loadPublicCatalog(
      businessSlug
    );

  if (!result) {
    notFound();
  }

  const catalog =
    result.catalog;

  const template =
    await getBusinessTemplateRuntime(
      catalog.business.slug
    );

  return (
    <SalonPlatform
      businessSlug={
        catalog.business.slug
      }
      initialCatalog={
        catalog
      }
      initialLocale={
        catalog.business
          .defaultContentLocale
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
