import {
  describe,
  expect,
  it,
} from "vitest";

import {
  UI_LOCALE_CODES,
} from "@/lib/i18n/locales";
import type {
  LocalizedText,
} from "@/lib/types";

import {
  barberLabels,
} from "./barber-heritage/barber-utils";
import {
  editorialLabels,
} from "./hair-editorial/editorial-utils";

type LabelSet =
  Record<
    string,
    LocalizedText
  >;

function expectCompleteLabelSet(
  name: string,
  labels: LabelSet,
  expectedCount: number
) {
  expect(
    Object.keys(labels),
    `${name} label count`
  ).toHaveLength(
    expectedCount
  );

  const missing =
    Object.entries(labels)
      .flatMap(
        ([
          key,
          value,
        ]) =>
          UI_LOCALE_CODES
            .filter(
              (locale) =>
                typeof value[
                  locale
                ] !==
                  "string" ||
                value[
                  locale
                ]?.trim()
                  .length ===
                  0
            )
            .map(
              (locale) =>
                `${name}.${key}.${locale}`
            )
      );

  expect(
    missing
  ).toEqual([]);
}

describe(
  "template UI translation readiness",
  () => {
    it(
      "covers all Editorial labels in every ready UI locale",
      () => {
        expectCompleteLabelSet(
          "editorial",
          editorialLabels,
          14
        );
      }
    );

    it(
      "covers all Barber labels in every ready UI locale",
      () => {
        expectCompleteLabelSet(
          "barber",
          barberLabels,
          26
        );
      }
    );
  }
);
