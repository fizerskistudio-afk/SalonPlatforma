export const GROWTH_SEO_CONTRACT_VERSION =
  1 as const;

export const GROWTH_SEO_INDEX_POLICIES = [
  "always",
  "conditional_inventory",
  "never",
] as const;

export type GrowthSeoIndexPolicy =
  (typeof GROWTH_SEO_INDEX_POLICIES)[number];

export const GROWTH_SITEMAP_GROUPS = [
  "platform",
  "blog",
  "guides",
  "locations",
  "services",
] as const;

export type GrowthSitemapGroup =
  (typeof GROWTH_SITEMAP_GROUPS)[number];

export type GrowthSeoRouteDefinition = {
  key: string;
  pattern: string;
  indexPolicy: GrowthSeoIndexPolicy;
  sitemapGroup:
    GrowthSitemapGroup | null;
  requiresCuratedContent: boolean;
  minEligibleBusinesses: number;
  minMappedServices: number;
};

export const GROWTH_SEO_ROUTES = [
  {
    key: "platform_home",
    pattern: "/",
    indexPolicy: "always",
    sitemapGroup: "platform",
    requiresCuratedContent: true,
    minEligibleBusinesses: 0,
    minMappedServices: 0,
  },
  {
    key: "blog_index",
    pattern: "/blog",
    indexPolicy: "always",
    sitemapGroup: "blog",
    requiresCuratedContent: true,
    minEligibleBusinesses: 0,
    minMappedServices: 0,
  },
  {
    key: "blog_article",
    pattern: "/blog/[articleSlug]",
    indexPolicy: "always",
    sitemapGroup: "blog",
    requiresCuratedContent: true,
    minEligibleBusinesses: 0,
    minMappedServices: 0,
  },
  {
    key: "service_guide",
    pattern: "/vodici/[serviceSlug]",
    indexPolicy: "always",
    sitemapGroup: "guides",
    requiresCuratedContent: true,
    minEligibleBusinesses: 0,
    minMappedServices: 0,
  },
  {
    key: "city_directory",
    pattern: "/frizeri/[citySlug]",
    indexPolicy:
      "conditional_inventory",
    sitemapGroup: "locations",
    requiresCuratedContent: true,
    minEligibleBusinesses: 1,
    minMappedServices: 0,
  },
  {
    key: "city_service_directory",
    pattern:
      "/frizeri/[citySlug]/[serviceSlug]",
    indexPolicy:
      "conditional_inventory",
    sitemapGroup: "services",
    requiresCuratedContent: true,
    minEligibleBusinesses: 1,
    minMappedServices: 1,
  },
  {
    key: "discovery_search",
    pattern: "/pronadji-termin",
    indexPolicy: "always",
    sitemapGroup: "platform",
    requiresCuratedContent: true,
    minEligibleBusinesses: 0,
    minMappedServices: 0,
  },
  {
    key: "attribution_redirect",
    pattern: "/go/[attributionId]",
    indexPolicy: "never",
    sitemapGroup: null,
    requiresCuratedContent: false,
    minEligibleBusinesses: 0,
    minMappedServices: 0,
  },
] as const satisfies
  readonly GrowthSeoRouteDefinition[];

export const GROWTH_RUNTIME_FILTER_KEYS = [
  "date",
  "time",
  "employee",
  "price",
  "sort",
] as const;

export type GrowthSeoInventoryState = {
  hasCuratedContent: boolean;
  eligibleBusinesses: number;
  mappedServices: number;
};

export function isGrowthSeoRouteIndexable({
  route,
  inventory,
}: {
  route: GrowthSeoRouteDefinition;
  inventory: GrowthSeoInventoryState;
}): boolean {
  if (route.indexPolicy === "never") {
    return false;
  }

  if (
    route.requiresCuratedContent &&
    !inventory.hasCuratedContent
  ) {
    return false;
  }

  if (route.indexPolicy === "always") {
    return true;
  }

  return (
    inventory.eligibleBusinesses >=
      route.minEligibleBusinesses &&
    inventory.mappedServices >=
      route.minMappedServices
  );
}

export function hasRuntimeGrowthFilters(
  searchParams:
    Readonly<Record<string, string | undefined>>
): boolean {
  return GROWTH_RUNTIME_FILTER_KEYS.some(
    (key) =>
      typeof searchParams[key] ===
        "string" &&
      searchParams[key]?.trim() !==
        ""
  );
}
