import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  LocalizedText,
  Service,
} from "@/lib/types";

import {
  editorialLabels,
  formatServicePrice,
  getLocationLine,
} from "./editorial-utils";

function localized({
  sr,
  en,
  de,
}: {
  sr: string;
  en: string;
  de: string;
}): LocalizedText {
  return {
    "sr-Latn":
      sr,
    en,
    de,
  } as LocalizedText;
}

function service(
  overrides:
    Partial<Service>
): Service {
  return {
    id:
      "service-1",
    categoryId:
      "category-1",
    slug:
      "editorial-service",
    name:
      localized({
        sr:
          "Editorial usluga",
        en:
          "Editorial service",
        de:
          "Editorial Service",
      }),
    description:
      null,
    durationMinutes:
      60,
    priceType:
      "fixed",
    priceFrom:
      2500,
    priceTo:
      undefined,
    currency:
      "RSD",
    sortOrder:
      1,
    isActive:
      true,
    ...overrides,
  } as Service;
}

describe(
  "hair editorial utilities",
  () => {
    it(
      "formats fixed, from and range pricing",
      () => {
        const fixed =
          formatServicePrice(
            service({
              priceType:
                "fixed",
              priceFrom:
                2500,
            }),
            "RSD",
            "sr-Latn"
          );

        const from =
          formatServicePrice(
            service({
              priceType:
                "from",
              priceFrom:
                3000,
            }),
            "RSD",
            "sr-Latn"
          );

        const range =
          formatServicePrice(
            service({
              priceType:
                "range",
              priceFrom:
                3000,
              priceTo:
                5000,
            }),
            "RSD",
            "sr-Latn"
          );

        expect(
          fixed
        ).toContain(
          "2.500"
        );

        expect(
          from
            .toLowerCase()
        ).toContain(
          "od"
        );

        expect(
          range
        ).toContain(
          "—"
        );
      }
    );

    it(
      "builds a clean location line",
      () => {
        expect(
          getLocationLine(
            localized({
              sr:
                "Kralja Petra 12",
              en:
                "12 Kralja Petra",
              de:
                "Kralja Petra 12",
            }),
            localized({
              sr:
                "Beograd",
              en:
                "Belgrade",
              de:
                "Belgrad",
            }),
            localized({
              sr:
                "Srbija",
              en:
                "Serbia",
              de:
                "Serbien",
            }),
            "sr-Latn"
          )
        ).toBe(
          "Kralja Petra 12, Beograd, Srbija"
        );
      }
    );

    it(
      "ships a localized empty-team message",
      () => {
        expect(
          editorialLabels
            .noTeam[
              "sr-Latn"
            ]
        ).toBeTruthy();

        expect(
          editorialLabels
            .noTeam
            .en
        ).toBeTruthy();

        expect(
          editorialLabels
            .noTeam
            .de
        ).toBeTruthy();
      }
    );
  }
);
