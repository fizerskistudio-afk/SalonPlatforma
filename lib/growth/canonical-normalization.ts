const SERBIAN_CYRILLIC_TO_LATIN:
  Readonly<Record<string, string>> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    ђ: "dj",
    е: "e",
    ж: "z",
    з: "z",
    и: "i",
    ј: "j",
    к: "k",
    л: "l",
    љ: "lj",
    м: "m",
    н: "n",
    њ: "nj",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    ћ: "c",
    у: "u",
    ф: "f",
    х: "h",
    ц: "c",
    ч: "c",
    џ: "dz",
    ш: "s",
  };

function transliterateSerbianCyrillic(
  value: string
): string {
  return Array.from(value)
    .map(
      (character) =>
        SERBIAN_CYRILLIC_TO_LATIN[
          character
        ] ?? character
    )
    .join("");
}

export function normalizeCanonicalLookupValue(
  value: string
): string {
  return transliterateSerbianCyrillic(
    value
      .trim()
      .toLowerCase()
      .replaceAll("đ", "dj")
  )
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .replace(
      /-{2,}/g,
      "-"
    );
}

export function createNormalizedAliasSet(
  values: readonly string[]
): ReadonlySet<string> {
  return new Set(
    values
      .map(
        normalizeCanonicalLookupValue
      )
      .filter(Boolean)
  );
}
