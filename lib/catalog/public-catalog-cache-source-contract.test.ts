import {
  readFileSync,
} from "node:fs";
import {
  describe,
  expect,
  it,
} from "vitest";

const catalogServerSource =
  readFileSync(
    "lib/catalog/server.ts",
    "utf8"
  );

const catalogRouteSource =
  readFileSync(
    "app/api/catalog/route.ts",
    "utf8"
  );

describe(
  "PUBLIC-BOOKING-LOAD-01D public catalog cache contract",
  () => {
    it(
      "uses the Next data cache across public requests",
      () => {
        expect(
          catalogServerSource
        ).toMatch(
          /import\s*\{\s*unstable_cache\s*,?\s*\}\s*from\s*["']next\/cache["']/
        );

        expect(
          catalogServerSource
        ).toMatch(
          /PUBLIC_CATALOG_REVALIDATE_SECONDS\s*=\s*30/
        );

        expect(
          catalogServerSource
        ).toMatch(
          /["']public-catalog-v1["']/
        );

        expect(
          catalogServerSource
        ).toMatch(
          /tags\s*:\s*\[\s*["']public-catalog["']\s*,?\s*\]/
        );

        expect(
          catalogServerSource
        ).toMatch(
          /unstable_cache\s*\([\s\S]*?loadPublicCatalogUncached\s*\([\s\S]*?["']public["'][\s\S]*?revalidate\s*:\s*PUBLIC_CATALOG_REVALIDATE_SECONDS/
        );
      }
    );

    it(
      "keeps platform preview outside the cross-request cache",
      () => {
        const previewExportIndex =
          catalogServerSource.indexOf(
            "export const loadPlatformPreviewCatalog"
          );

        expect(
          previewExportIndex
        ).toBeGreaterThanOrEqual(
          0
        );

        const previewExportSource =
          catalogServerSource.slice(
            previewExportIndex
          );

        expect(
          previewExportSource
        ).toMatch(
          /loadPlatformPreviewCatalog\s*=\s*cache\s*\([\s\S]*?loadPublicCatalogUncached\s*\([\s\S]*?rawBusinessSlug[\s\S]*?["']platform-preview["']/
        );

        expect(
          previewExportSource
        ).not.toContain(
          "loadPublicCatalogAcrossRequests"
        );

        expect(
          catalogServerSource.match(
            /["']platform-preview["']/g
          )
        ).toHaveLength(
          1
        );
      }
    );

    it(
      "validates invalid public slugs before entering the data cache",
      () => {
        expect(
          catalogServerSource
        ).toMatch(
          /if\s*\(\s*!BUSINESS_SLUG_PATTERN\.test\s*\(\s*businessSlug\s*\)\s*\)[\s\S]*?loadPublicCatalogUncached\s*\(\s*rawBusinessSlug\s*,\s*["']public["']\s*\)/
        );

        expect(
          catalogServerSource
        ).toMatch(
          /return\s+loadPublicCatalogAcrossRequests\s*\(\s*businessSlug\s*\)/
        );
      }
    );

    it(
      "keeps HTTP responses uncached while the data cache is active",
      () => {
        expect(
          catalogRouteSource
        ).toMatch(
          /CATALOG_ERROR_OPTIONS\s*=\s*\{[\s\S]*?cacheControl\s*:\s*["']no-store,\s*max-age=0["']/
        );

        expect(
          catalogRouteSource
        ).toMatch(
          /"Cache-Control"\s*:\s*["']no-store,\s*max-age=0["']/
        );

        expect(
          catalogRouteSource
        ).not.toMatch(
          /s-maxage|stale-while-revalidate/
        );

        expect(
          catalogRouteSource
        ).not.toContain(
          "PUBLIC_CATALOG_SUCCESS_CACHE_CONTROL"
        );
      }
    );

    it(
      "exposes catalog server timing without leaking data",
      () => {
        expect(
          catalogRouteSource
        ).toMatch(
          /import\s*\{\s*performance\s*,?\s*\}\s*from\s*["']node:perf_hooks["']/
        );

        expect(
          catalogRouteSource
        ).toMatch(
          /"Server-Timing"\s*:\s*`catalog;dur=\$\{catalogDurationMs\}`/
        );

        expect(
          catalogRouteSource
        ).toMatch(
          /"X-Ordum-Catalog-Policy"\s*:\s*["']public-data-cache-30s["']/
        );

        expect(
          catalogRouteSource
        ).not.toMatch(
          /"Server-Timing"\s*:\s*`[^`]*(businessSlug|serviceId|employeeId|email|phone)[^`]*`/
        );
      }
    );
  }
);
