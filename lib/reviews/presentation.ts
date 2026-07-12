import type {
  Locale,
} from "@/lib/types";

const REVIEW_INTL_LOCALES:
  Record<string, string> = {
  "sr-Latn": "sr-Latn-RS",
  "sr-Cyrl": "sr-Cyrl-RS",
  sr: "sr-Latn-RS",
  mk: "mk-MK",
  hr: "hr-HR",
  sq: "sq-AL",
  en: "en-GB",
  de: "de-DE",
  fr: "fr-FR",
};

function resolveReviewIntlLocale(
  locale: Locale
): string {
  const exact =
    REVIEW_INTL_LOCALES[
      locale
    ];

  if (exact) {
    return exact;
  }

  const normalized =
    locale
      .trim()
      .toLowerCase();

  if (
    normalized.startsWith(
      "sr-cyrl"
    )
  ) {
    return "sr-Cyrl-RS";
  }

  if (
    normalized.startsWith(
      "sr"
    )
  ) {
    return "sr-Latn-RS";
  }

  const base =
    normalized.split(
      "-"
    )[0];

  return (
    REVIEW_INTL_LOCALES[
      base
    ] ??
    REVIEW_INTL_LOCALES.en
  );
}

export function clampReviewRating(
  rating: number | null
): number | null {
  if (
    rating === null ||
    !Number.isFinite(
      rating
    )
  ) {
    return null;
  }

  return Math.min(
    5,
    Math.max(
      0,
      rating
    )
  );
}

export function formatReviewRating(
  rating: number,
  locale: Locale
): string {
  const safeRating =
    clampReviewRating(
      rating
    ) ?? 0;

  return new Intl.NumberFormat(
    resolveReviewIntlLocale(
      locale
    ),
    {
      minimumFractionDigits:
        Number.isInteger(
          safeRating
        )
          ? 0
          : 1,
      maximumFractionDigits: 2,
    }
  ).format(
    safeRating
  );
}

export function formatReviewDate(
  value: string,
  locale: Locale
): string | null {
  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return new Intl.DateTimeFormat(
    resolveReviewIntlLocale(
      locale
    ),
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }
  ).format(
    date
  );
}

export function getReviewAuthorInitials(
  authorName: string
): string {
  const parts =
    authorName
      .trim()
      .split(
        /\s+/u
      )
      .filter(
        Boolean
      );

  if (
    parts.length === 0
  ) {
    return "?";
  }

  const first =
    parts[0]
      ?.charAt(0) ?? "";

  const last =
    parts.length > 1
      ? parts[
          parts.length - 1
        ]?.charAt(0) ?? ""
      : "";

  return (
    first +
    last
  )
    .toLocaleUpperCase()
    .slice(
      0,
      2
    );
}

export function interpolateReviewLabel(
  template: string,
  values:
    Readonly<
      Record<
        string,
        string | number
      >
    >
): string {
  return template.replace(
    /\{([a-zA-Z0-9_]+)\}/g,
    (
      match,
      key: string
    ) => {
      const value =
        values[key];

      return value ===
        undefined
        ? match
        : String(
            value
          );
    }
  );
}

export function isSafeReviewExternalUrl(
  value: string | null
): value is string {
  if (!value) {
    return false;
  }

  try {
    const url =
      new URL(
        value
      );

    return (
      url.protocol ===
      "https:"
    );
  } catch {
    return false;
  }
}
