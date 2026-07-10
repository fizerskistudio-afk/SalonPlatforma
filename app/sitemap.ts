import type {
  MetadataRoute,
} from "next";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  getRequestUrlContext,
} from "@/lib/seo/request-origin";

import {
  getSiteUrl,
  toAbsoluteSiteUrl,
} from "@/lib/seo/site";

import {
  buildTenantPublicUrl,
  getConfiguredPlatformRootHostname,
  resolvePlatformHostname,
} from "@/lib/tenancy/hostname";

export const dynamic =
  "force-dynamic";

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type PublicBusinessRow = {
  slug: string;
};

function createTenantEntry(
  slug: string,
  fallbackOrigin?: string
): MetadataRoute.Sitemap[number] {
  const publicUrl =
    buildTenantPublicUrl(
      slug
    );

  const url =
    publicUrl.startsWith(
      "/"
    ) &&
    fallbackOrigin
      ? new URL(
          publicUrl,
          fallbackOrigin
        ).toString()
      : toAbsoluteSiteUrl(
          publicUrl
        );

  return {
    url,

    changeFrequency:
      "daily",

    priority:
      0.8,
  };
}

async function loadActiveBusinessSlugs():
  Promise<string[]> {
  const adminClient =
    createAdminClient();

  const {
    data,
    error,
  } = await adminClient
    .from(
      "businesses"
    )
    .select(
      "slug"
    )
    .eq(
      "is_active",
      true
    )
    .eq(
      "publication_status",
      "published"
    )
    .order(
      "slug",
      {
        ascending:
          true,
      }
    );

  if (error) {
    console.error(
      "Unable to build public tenant sitemap:",
      error
    );

    return [];
  }

  const rows =
    (data ?? []) as unknown as
      PublicBusinessRow[];

  return Array.from(
    new Set(
      rows
        .map(
          (row) =>
            row.slug
              ?.trim()
              .toLowerCase()
        )
        .filter(
          (
            slug
          ): slug is string =>
            Boolean(
              slug &&
                BUSINESS_SLUG_PATTERN.test(
                  slug
                )
            )
        )
    )
  );
}

export default async function sitemap():
  Promise<MetadataRoute.Sitemap> {
  const requestContext =
    await getRequestUrlContext();

  const rootHostname =
    getConfiguredPlatformRootHostname();

  const hostnameResolution =
    resolvePlatformHostname(
      requestContext.host,
      rootHostname
    );

  if (
    hostnameResolution.kind ===
    "tenant"
  ) {
    const adminClient =
      createAdminClient();

    const {
      data,
      error,
    } = await adminClient
      .from(
        "businesses"
      )
      .select(
        "slug"
      )
      .eq(
        "slug",
        hostnameResolution.businessSlug
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

    if (
      error ||
      !data
    ) {
      return [];
    }

    return [
      createTenantEntry(
        hostnameResolution.businessSlug,
        requestContext.origin
      ),
    ];
  }

  const entries:
    MetadataRoute.Sitemap = [
      {
        url:
          getSiteUrl().toString(),

        changeFrequency:
          "weekly",

        priority: 1,
      },
    ];

  /*
   * Dok platformski root domen nije podešen,
   * javni saloni rade kroz /salon/<slug> putanje
   * na istom hostu i mogu biti u istom sitemap-u.
   * Kada poddomeni postoje, svaki tenant dobija
   * sopstveni sitemap na svom hostu.
   */
  if (!rootHostname) {
    const slugs =
      await loadActiveBusinessSlugs();

    for (const slug of slugs) {
      entries.push(
        createTenantEntry(
          slug,
          requestContext.origin
        )
      );
    }
  }

  return entries;
}
