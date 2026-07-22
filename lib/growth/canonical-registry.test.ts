import {
  describe,
  expect,
  it,
} from "vitest";

import {
  CANONICAL_LOCATIONS,
  getCanonicalLocation,
  resolveCanonicalLocation,
} from "./canonical-locations";
import {
  normalizeCanonicalLookupValue,
} from "./canonical-normalization";
import {
  CANONICAL_SERVICES,
  getCanonicalService,
  resolveCanonicalService,
} from "./canonical-services";
import {
  approveDiscoveryServiceMapping,
  canPublishDiscoveryServiceMapping,
  suggestDiscoveryServiceMapping,
} from "./discovery-mapping-policy";

describe(
  "canonical growth registries",
  () => {
    it(
      "normalizes Serbian Latin and Cyrillic lookup values deterministically",
      () => {
        expect(
          normalizeCanonicalLookupValue(
            "  Muško šišanje  "
          )
        ).toBe(
          "musko-sisanje"
        );

        expect(
          normalizeCanonicalLookupValue(
            "Мушко шишање"
          )
        ).toBe(
          "musko-sisanje"
        );

        expect(
          normalizeCanonicalLookupValue(
            "Đurđevdan"
          )
        ).toBe(
          "djurdjevdan"
        );
      }
    );

    it(
      "ships one explicit Svilajnac canonical location seed",
      () => {
        expect(
          CANONICAL_LOCATIONS
        ).toHaveLength(1);

        expect(
          getCanonicalLocation(
            "rs:svilajnac"
          )?.citySlug
        ).toBe(
          "svilajnac"
        );

        expect(
          resolveCanonicalLocation(
            "Свилајнац"
          )?.key
        ).toBe(
          "rs:svilajnac"
        );
      }
    );

    it(
      "ships one explicit men haircut canonical service seed",
      () => {
        expect(
          CANONICAL_SERVICES
        ).toHaveLength(1);

        expect(
          getCanonicalService(
            "barber:musko-sisanje"
          )?.slug
        ).toBe(
          "musko-sisanje"
        );

        expect(
          resolveCanonicalService(
            "Šišanje za muškarce"
          )?.key
        ).toBe(
          "barber:musko-sisanje"
        );

        expect(
          resolveCanonicalService(
            "šišanje"
          )
        ).toBeNull();
      }
    );

    it(
      "keeps registry keys and slugs unique",
      () => {
        expect(
          new Set(
            CANONICAL_LOCATIONS.map(
              (location) =>
                location.key
            )
          ).size
        ).toBe(
          CANONICAL_LOCATIONS.length
        );

        expect(
          new Set(
            CANONICAL_SERVICES.map(
              (service) =>
                service.key
            )
          ).size
        ).toBe(
          CANONICAL_SERVICES.length
        );

        expect(
          new Set(
            CANONICAL_SERVICES.map(
              (service) =>
                service.slug
            )
          ).size
        ).toBe(
          CANONICAL_SERVICES.length
        );
      }
    );

    it(
      "creates suggestions without auto-approving discovery mappings",
      () => {
        const suggestion =
          suggestDiscoveryServiceMapping({
            tenantServiceId:
              "service-1",
            tenantServiceName:
              "Muško šišanje",
            tenantServiceSlug:
              "musko-sisanje",
          });

        expect(
          suggestion
        ).not.toBeNull();
        expect(
          suggestion?.canonicalServiceKey
        ).toBe(
          "barber:musko-sisanje"
        );
        expect(
          suggestion?.status
        ).toBe(
          "suggested"
        );
        expect(
          suggestion?.reviewedBy
        ).toBeNull();
      }
    );

    it(
      "requires human approval and full tenant eligibility before publication",
      () => {
        const suggestion =
          suggestDiscoveryServiceMapping({
            tenantServiceId:
              "service-1",
            tenantServiceName:
              "Muško šišanje",
            tenantServiceSlug:
              "musko-sisanje",
          });

        expect(
          suggestion
        ).not.toBeNull();

        expect(
          canPublishDiscoveryServiceMapping({
            mapping:
              suggestion!,
            tenantDiscoveryOptIn:
              true,
            tenantActive:
              true,
            tenantPublished:
              true,
            tenantServiceActive:
              true,
          })
        ).toBe(false);

        const approved =
          approveDiscoveryServiceMapping({
            mapping:
              suggestion!,
            reviewedBy:
              "platform-admin",
            reviewedAt:
              "2026-07-22T12:00:00.000Z",
          });

        expect(
          canPublishDiscoveryServiceMapping({
            mapping:
              approved,
            tenantDiscoveryOptIn:
              true,
            tenantActive:
              true,
            tenantPublished:
              true,
            tenantServiceActive:
              true,
          })
        ).toBe(true);

        expect(
          canPublishDiscoveryServiceMapping({
            mapping:
              approved,
            tenantDiscoveryOptIn:
              false,
            tenantActive:
              true,
            tenantPublished:
              true,
            tenantServiceActive:
              true,
          })
        ).toBe(false);
      }
    );

    it(
      "does not suggest broad or unknown service labels",
      () => {
        expect(
          suggestDiscoveryServiceMapping({
            tenantServiceId:
              "service-2",
            tenantServiceName:
              "Šišanje",
            tenantServiceSlug:
              "sisanje",
          })
        ).toBeNull();

        expect(
          suggestDiscoveryServiceMapping({
            tenantServiceId:
              "service-3",
            tenantServiceName:
              "Farbanje",
            tenantServiceSlug:
              "farbanje",
          })
        ).toBeNull();
      }
    );
  }
);
