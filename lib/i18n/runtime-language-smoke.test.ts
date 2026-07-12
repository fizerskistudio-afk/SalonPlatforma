import {
  readFileSync,
} from "node:fs";
import {
  resolve,
} from "node:path";

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  CURRENT_UI_LOCALES,
  LOCALE_REGISTRY,
  UI_LOCALE_CODES,
} from "@/lib/i18n/locales";
import {
  getLanguageSwitcherState,
} from "@/lib/i18n/language-switcher";
import {
  t,
  translations,
} from "@/lib/translations";
import type {
  LocalizedText,
} from "@/lib/types";

import {
  barberLabels,
} from "@/components/templates/barber-heritage/barber-utils";
import {
  editorialLabels,
} from "@/components/templates/hair-editorial/editorial-utils";

type TranslationLeaf = {
  path: string;
  value: LocalizedText;
};

function isRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function collectTranslationLeaves(
  value: unknown,
  path = "translations"
): TranslationLeaf[] {
  if (!isRecord(value)) {
    return [];
  }

  if (
    UI_LOCALE_CODES.every(
      (locale) =>
        typeof value[
          locale
        ] ===
        "string"
    )
  ) {
    return [
      {
        path,
        value:
          value as LocalizedText,
      },
    ];
  }

  return Object.entries(value)
    .flatMap(
      ([
        key,
        child,
      ]) =>
        collectTranslationLeaves(
          child,
          `${path}.${key}`
        )
    );
}

function expectExactRuntimeResolution(
  name: string,
  labels:
    Record<
      string,
      LocalizedText
    >
) {
  for (
    const [
      key,
      value,
    ] of Object.entries(
      labels
    )
  ) {
    for (
      const locale of
      UI_LOCALE_CODES
    ) {
      expect(
        t(
          value,
          locale
        ),
        `${name}.${key}.${locale}`
      ).toBe(
        value[locale]
      );
    }
  }
}

const PUBLIC_TEMPLATE_SOURCE_PATHS = [
  "components/templates/hair-luxury/HairLuxuryDesktopTemplate.tsx",
  "components/templates/hair-luxury/HairLuxuryMobileTemplate.tsx",
  "components/templates/hair-editorial/HairEditorialDesktopTemplate.tsx",
  "components/templates/hair-editorial/HairEditorialMobileTemplate.tsx",
  "components/templates/barber-heritage/BarberHeritageDesktopTemplate.tsx",
  "components/templates/barber-heritage/BarberHeritageMobileTemplate.tsx",
  "components/templates/hair-editorial/editorial-utils.ts",
  "components/templates/barber-heritage/barber-utils.ts",
] as const;

describe(
  "seven-language runtime smoke",
  () => {
    it(
      "keeps one explicit ready UI locale contract",
      () => {
        expect(
          CURRENT_UI_LOCALES
        ).toEqual(
          UI_LOCALE_CODES
        );

        for (
          const locale of
          UI_LOCALE_CODES
        ) {
          expect(
            LOCALE_REGISTRY[
              locale
            ]
              .uiTranslationReady
          ).toBe(true);
        }
      }
    );

    it(
      "resolves every global translation leaf exactly in all seven locales",
      () => {
        const leaves =
          collectTranslationLeaves(
            translations
          );

        expect(
          leaves.length
        ).toBe(125);

        for (
          const leaf of
          leaves
        ) {
          for (
            const locale of
            UI_LOCALE_CODES
          ) {
            expect(
              t(
                leaf.value,
                locale
              ),
              `${leaf.path}.${locale}`
            ).toBe(
              leaf.value[
                locale
              ]
            );
          }
        }
      }
    );

    it(
      "resolves every booking and customer field exactly in all seven locales",
      () => {
        expectExactRuntimeResolution(
          "booking",
          translations.booking
        );
        expectExactRuntimeResolution(
          "customer",
          translations.customer
        );
      }
    );

    it(
      "resolves Editorial and Barber labels exactly in all seven locales",
      () => {
        expectExactRuntimeResolution(
          "editorial",
          editorialLabels
        );
        expectExactRuntimeResolution(
          "barber",
          barberLabels
        );
      }
    );

    it(
      "uses requested fallback, then Serbian, without exposing empty values",
      () => {
        const fallbackText:
          LocalizedText = {
          "sr-Latn":
            "Srpski",
          mk: "",
          sq: "",
          en: "English",
          de: "Deutsch",
        };

        expect(
          t(
            fallbackText,
            "fr",
            "de"
          )
        ).toBe(
          "Deutsch"
        );

        expect(
          t(
            fallbackText,
            "fr",
            "sq"
          )
        ).toBe(
          "Srpski"
        );
      }
    );

    it(
      "filters the switcher to UI-ready locales in stable order",
      () => {
        const state =
          getLanguageSwitcherState(
            [
              "de",
              "it",
              "sr-Latn",
              "fr",
              "en",
              "mk",
              "sq",
              "hr",
            ],
            "de"
          );

        expect(
          state
            .supportedLocales
        ).toEqual(
          UI_LOCALE_CODES
        );
        expect(
          state
            .selectedLocale
        ).toBe("de");
        expect(
          state
            .useCompactSelect
        ).toBe(true);
      }
    );

    it(
      "falls back to the first ready tenant locale when the current content locale has no ready UI",
      () => {
        const state =
          getLanguageSwitcherState(
            [
              "it",
              "fr",
              "en",
            ],
            "it"
          );

        expect(
          state
            .supportedLocales
        ).toEqual([
          "en",
          "fr",
        ]);
        expect(
          state
            .selectedLocale
        ).toBe("en");
        expect(
          state
            .useCompactSelect
        ).toBe(false);
      }
    );

    it(
      "keeps all public template sources on central t() and localized accessibility fallbacks",
      () => {
        for (
          const path of
          PUBLIC_TEMPLATE_SOURCE_PATHS
        ) {
          const source =
            readFileSync(
              resolve(
                process.cwd(),
                path
              ),
              "utf8"
            );

          expect(
            source,
            path
          ).not.toMatch(
            /export function translate/
          );
          expect(
            source,
            path
          ).not.toMatch(
            /\btranslate\(/
          );
          expect(
            source,
            path
          ).not.toContain(
            "${business.name} galerija"
          );
          expect(
            source,
            path
          ).not.toContain(
            "${business.name} logo"
          );
        }
      }
    );
  }
);
