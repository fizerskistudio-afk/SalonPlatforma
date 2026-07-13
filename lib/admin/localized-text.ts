import {
  LOCALE_CODES,
  LOCALE_REGISTRY,
  type LocaleCode,
} from "@/lib/i18n/locales";

export type AdminLocalizedTextValue =
  | Record<string, unknown>
  | null
  | undefined;

function asRecord(
  value: AdminLocalizedTextValue
): Record<string, unknown> | null {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  )
    ? value
    : null;
}

export function getAdminLocalizedValue(
  value: AdminLocalizedTextValue,
  locale: LocaleCode
): string {
  const record =
    asRecord(value);

  if (!record) {
    return "";
  }

  const translatedValue =
    record[locale];

  return typeof translatedValue ===
    "string"
    ? translatedValue.trim()
    : "";
}

export function orderAdminLocales(
  defaultLocale: LocaleCode,
  supportedLocales:
    readonly LocaleCode[]
): LocaleCode[] {
  const candidates = [
    defaultLocale,
    ...supportedLocales,
  ];

  return Array.from(
    new Set(
      candidates.filter(
        (locale) =>
          LOCALE_CODES.includes(
            locale
          )
      )
    )
  );
}

export function getAdminLocaleOptions(
  defaultLocale: LocaleCode,
  supportedLocales:
    readonly LocaleCode[]
) {
  return orderAdminLocales(
    defaultLocale,
    supportedLocales
  ).map(
    (locale) => ({
      key: locale,
      label:
        LOCALE_REGISTRY[locale]
          .adminName,
      shortName:
        LOCALE_REGISTRY[locale]
          .shortName,
      nativeName:
        LOCALE_REGISTRY[locale]
          .nativeName,
    })
  );
}

export function getAdminLocalizedText(
  value: AdminLocalizedTextValue,
  defaultLocale: LocaleCode,
  supportedLocales:
    readonly LocaleCode[],
  fallback = ""
): string {
  const record =
    asRecord(value);

  if (!record) {
    return fallback;
  }

  const preferredLocales = [
    ...orderAdminLocales(
      defaultLocale,
      supportedLocales
    ),
    ...LOCALE_CODES,
  ];

  for (
    const locale of
    new Set(preferredLocales)
  ) {
    const translatedValue =
      getAdminLocalizedValue(
        record,
        locale
      );

    if (translatedValue) {
      return translatedValue;
    }
  }

  for (
    const candidate of
    Object.values(record)
  ) {
    if (
      typeof candidate ===
        "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  return fallback;
}

export function getAdminLocalizedSearchValues(
  value: AdminLocalizedTextValue
): string[] {
  const record =
    asRecord(value);

  if (!record) {
    return [];
  }

  return Array.from(
    new Set(
      Object.values(record)
        .filter(
          (
            candidate
          ): candidate is string =>
            typeof candidate ===
              "string" &&
            candidate.trim()
              .length > 0
        )
        .map(
          (candidate) =>
            candidate.trim()
        )
    )
  );
}
