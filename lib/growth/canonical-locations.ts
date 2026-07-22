import type {
  CanonicalLocationDefinition,
} from "./discovery-contract";
import {
  createNormalizedAliasSet,
  normalizeCanonicalLookupValue,
} from "./canonical-normalization";

export const CANONICAL_LOCATION_REGISTRY_VERSION =
  1 as const;

export const CANONICAL_LOCATIONS = [
  {
    key: "rs:svilajnac",
    countryCode: "RS",
    citySlug: "svilajnac",
    displayName: "Svilajnac",
    aliases: [
      "Svilajnac",
      "Свилајнац",
    ],
    active: true,
  },
] as const satisfies
  readonly CanonicalLocationDefinition[];

export type CanonicalLocationKey =
  (typeof CANONICAL_LOCATIONS)[number]["key"];

const LOCATIONS_BY_KEY =
  new Map(
    CANONICAL_LOCATIONS.map(
      (location) => [
        location.key,
        location,
      ]
    )
  );

const LOCATION_ALIAS_INDEX =
  new Map<string, CanonicalLocationKey>();

for (
  const location of
  CANONICAL_LOCATIONS
) {
  const aliases =
    createNormalizedAliasSet([
      location.key,
      location.citySlug,
      location.displayName,
      ...location.aliases,
    ]);

  for (
    const alias of
    aliases
  ) {
    const existing =
      LOCATION_ALIAS_INDEX.get(
        alias
      );

    if (
      existing &&
      existing !==
        location.key
    ) {
      throw new Error(
        `Duplicate canonical location alias: ${alias}`
      );
    }

    LOCATION_ALIAS_INDEX.set(
      alias,
      location.key
    );
  }
}

export function getCanonicalLocation(
  key: string
):
  | (typeof CANONICAL_LOCATIONS)[number]
  | null {
  return (
    LOCATIONS_BY_KEY.get(
      key as CanonicalLocationKey
    ) ?? null
  );
}

export function resolveCanonicalLocation(
  value: string
):
  | (typeof CANONICAL_LOCATIONS)[number]
  | null {
  const normalized =
    normalizeCanonicalLookupValue(
      value
    );

  if (!normalized) {
    return null;
  }

  const key =
    LOCATION_ALIAS_INDEX.get(
      normalized
    );

  return key
    ? getCanonicalLocation(
        key
      )
    : null;
}
