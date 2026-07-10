import {
  describe,
  expect,
  it,
} from "vitest";

import {
  CURRENT_UI_LOCALES,
  LOCALE_REGISTRY,
} from "@/lib/i18n/locales";
import {
  translations,
} from "@/lib/translations";

const REQUIRED_UI_LOCALES = [
  "sr-Latn",
  "mk",
  "sq",
  "en",
] as const;

type TranslationRecord =
  Record<string, unknown>;

function isRecord(
  value: unknown
): value is TranslationRecord {
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
): Array<{
  path: string;
  value: TranslationRecord;
}> {
  if (!isRecord(value)) {
    return [];
  }

  const hasLocaleKey =
    REQUIRED_UI_LOCALES.some(
      (locale) =>
        Object.prototype
          .hasOwnProperty.call(
            value,
            locale
          )
    );

  if (hasLocaleKey) {
    return [
      {
        path,
        value,
      },
    ];
  }

  return Object.entries(value)
    .flatMap(
      ([key, child]) =>
        collectTranslationLeaves(
          child,
          `${path}.${key}`
        )
    );
}

describe(
  "UI translation readiness",
  () => {
    it(
      "marks the supported public UI locales as ready",
      () => {
        expect(
          CURRENT_UI_LOCALES
        ).toEqual([
          ...REQUIRED_UI_LOCALES,
        ]);

        for (
          const locale of
          REQUIRED_UI_LOCALES
        ) {
          expect(
            LOCALE_REGISTRY[
              locale
            ].uiTranslationReady
          ).toBe(true);
        }
      }
    );

    it(
      "provides every required locale for each global UI translation leaf",
      () => {
        const leaves =
          collectTranslationLeaves(
            translations
          );

        expect(
          leaves.length
        ).toBeGreaterThan(0);

        const missing =
          leaves.flatMap(
            ({
              path,
              value,
            }) =>
              REQUIRED_UI_LOCALES
                .filter(
                  (locale) =>
                    typeof value[
                      locale
                    ] !==
                    "string"
                )
                .map(
                  (locale) =>
                    `${path}.${locale}`
                )
          );

        expect(
          missing
        ).toEqual([]);
      }
    );
  }
);
