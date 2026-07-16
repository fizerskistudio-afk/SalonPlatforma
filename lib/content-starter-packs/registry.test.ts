import {
  describe,
  expect,
  it,
} from "vitest";

import {
  STARTER_PACK_VERTICALS,
} from "./domain";
import {
  STARTER_PACK_MANIFESTS,
} from "./vertical-manifests";
import {
  STARTER_PACK_REGISTRY,
  listStarterPackSummaries,
} from "./registry";

describe(
  "content starter pack registry",
  () => {
    it(
      "ships one pack for every supported vertical",
      () => {
        expect(
          STARTER_PACK_MANIFESTS
        ).toHaveLength(
          10
        );

        expect(
          STARTER_PACK_MANIFESTS.map(
            (
              pack
            ) =>
              pack.id
          )
        ).toEqual(
          STARTER_PACK_VERTICALS
        );

        expect(
          Object.keys(
            STARTER_PACK_REGISTRY
          )
        ).toHaveLength(
          10
        );
      }
    );

    it(
      "ships the complete initial service catalog",
      () => {
        const totalServices =
          STARTER_PACK_MANIFESTS.reduce(
            (
              sum,
              pack
            ) =>
              sum +
              pack
                .services
                .length,
            0
          );

        expect(
          totalServices
        ).toBe(
          106
        );

        for (
          const pack of
          STARTER_PACK_MANIFESTS
        ) {
          expect(
            pack
              .services
              .length
          ).toBeGreaterThanOrEqual(
            6
          );

          expect(
            pack
              .categories
              .length
          ).toBeGreaterThanOrEqual(
            4
          );

          expect(
            pack
              .staffRoles
              .length
          ).toBeGreaterThanOrEqual(
            2
          );
        }
      }
    );

    it(
      "keeps all starter prices unset",
      () => {
        for (
          const pack of
          STARTER_PACK_MANIFESTS
        ) {
          for (
            const service of
            pack.services
          ) {
            expect(
              service.priceStatus
            ).toBe(
              "unset"
            );

            expect(
              service
            ).not.toHaveProperty(
              "price"
            );

            expect(
              service
            ).not.toHaveProperty(
              "suggestedPrice"
            );
          }
        }
      }
    );

    it(
      "returns compact summaries without exposing an apply operation",
      () => {
        const summaries =
          listStarterPackSummaries();

        expect(
          summaries
        ).toHaveLength(
          10
        );

        expect(
          summaries.find(
            (
              item
            ) =>
              item.id ===
              "laser-hair-removal"
          )
        ).toMatchObject({
          label:
            "Laser Hair Removal",
          version:
            1,
        });

        expect(
          Object.isFrozen(
            STARTER_PACK_REGISTRY
          )
        ).toBe(
          true
        );
      }
    );
  }
);
